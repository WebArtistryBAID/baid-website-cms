'use server'

import { Post, PrismaClient, Role, User, UserAuditLogType } from '@prisma/client'
import {
    HYDRATED_POST_SELECT,
    HydratedPost,
    MINIMUM_ADMIN_APPROVALS,
    MINIMUM_EDITOR_APPROVALS,
    Paginated,
    SIMPLIFIED_POST_SELECT,
    SimplifiedPost
} from '@/app/lib/data-types'
import { requireUserWithRole } from '@/app/login/login-actions'
import fs from 'fs/promises'
import path from 'path'
import { spawn } from 'child_process'
import sharp from 'sharp'
import crypto from 'crypto'
import { AlignPostResponse, WeChatWorkerStatus } from '@/app/studio/posts/post-types'

const PAGE_SIZE = 24

const prisma = new PrismaClient()

export async function getPosts(page: number): Promise<Paginated<SimplifiedPost>> {
    const pages = Math.ceil(await prisma.post.count() / PAGE_SIZE)
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
        select: SIMPLIFIED_POST_SELECT
    })
    return {
        items: posts,
        page,
        pages
    }
}

export async function getPost(id: number): Promise<HydratedPost | null> {
    return prisma.post.findUnique({
        where: { id },
        select: HYDRATED_POST_SELECT
    })
}

export async function unpublishPost(id: number): Promise<void> {
    const user = await requireUserWithRole(Role.editor)
    const post = await prisma.post.findUnique({ where: { id } })
    if (post == null) {
        return
    }

    await prisma.post.update({
        where: { id },
        data: {
            contentPublishedEN: null,
            contentPublishedZH: null
        }
    })
    await prisma.userAuditLog.create({
        data: {
            type: UserAuditLogType.unpublishPost,
            userId: user.id,
            values: [ post.id.toString(), post.titleEN ]
        }
    })
}

// Align draft content with published content (in effect, publishing or overriding existing publish)
export async function alignPost(id: number): Promise<AlignPostResponse> {
    const user = await requireUserWithRole(Role.admin)
    const post = await prisma.post.findUnique({ where: { id } })
    if (post == null) {
        return AlignPostResponse.notFound
    }
    if (post.editorsApproved.length < MINIMUM_EDITOR_APPROVALS) {
        return AlignPostResponse.editorApprovalsNotEnough
    }
    if (post.adminsApproved.length < MINIMUM_ADMIN_APPROVALS) {
        return AlignPostResponse.adminApprovalsNotEnough
    }
    await prisma.post.update({
        where: { id },
        data: {
            contentPublishedEN: post.contentDraftEN,
            contentPublishedZH: post.contentDraftZH
        }
    })
    await prisma.userAuditLog.create({
        data: {
            type: UserAuditLogType.adminPublishPost,
            userId: user.id,
            values: [ post.id.toString(), post.titleEN ]
        }
    })
    return AlignPostResponse.success
}

export async function editorApprovePost(id: number): Promise<void> {
    const user = await requireUserWithRole(Role.editor)
    const post = await prisma.post.findUnique({ where: { id } })
    if (post == null) {
        return
    }
    if (!post.editorsApproved.includes(user.id)) {
        await prisma.post.update({
            where: { id },
            data: {
                editorsApproved: {
                    push: user.id
                }
            }
        })
        await prisma.userAuditLog.create({
            data: {
                type: UserAuditLogType.editorApprovePost,
                userId: user.id,
                values: [ post.id.toString(), post.titleEN ]
            }
        })
    }
}

export async function adminApprovePost(id: number): Promise<void> {
    const user = await requireUserWithRole(Role.admin)
    const post = await prisma.post.findUnique({ where: { id } })
    if (post == null) {
        return
    }
    if (!post.adminsApproved.includes(user.id)) {
        await prisma.post.update({
            where: { id },
            data: {
                adminsApproved: {
                    push: user.id
                }
            }
        })
        await prisma.userAuditLog.create({
            data: {
                type: UserAuditLogType.adminApprovePost,
                userId: user.id,
                values: [ post.id.toString(), post.titleEN ]
            }
        })
    }
}

export async function deletePost(id: number): Promise<void> {
    const user = await requireUserWithRole(Role.editor)
    const post = await prisma.post.delete({
        where: {
            id
        }
    })
    await prisma.userAuditLog.create({
        data: {
            type: UserAuditLogType.deletePost,
            userId: user.id,
            values: [ post.id.toString(), post.titleEN ]
        }
    })
}

// = LOCKING
// A post must be locked when it is being edited to prevent conflict.
// A lock is defined by its timestamp. Another user can choose to override the lock, which kicks out the previous editor
// Locks must be renewed every minute
export async function lockPost(id: number, currentLock: Date | null): Promise<Date | null> {
    // If currentLock === post.lockedAt, allow renewal; otherwise, only allow if isPostLocked() === false
    await requireUserWithRole(Role.writer)
    const post = await prisma.post.findUnique({ where: { id } })
    if (post == null) {
        return null
    }
    if (post.lockedAt != null) {
        if (currentLock == null) {
            return null
        }
        if (post.lockedAt.getTime() !== currentLock.getTime() && new Date().getTime() - post.lockedAt.getTime() <= 1.5 * 60 * 1000) {
            return null
        }
    }
    const newLock = new Date()
    await prisma.post.update({
        where: { id },
        data: {
            lockedAt: newLock
        }
    })
    return newLock
}

export async function overrideAndLockPost(id: number): Promise<Date | null> {
    await requireUserWithRole(Role.writer)
    const post = await prisma.post.findUnique({ where: { id } })
    if (post == null) {
        return null
    }
    const newLock = new Date()
    await prisma.post.update({
        where: { id },
        data: {
            lockedAt: newLock
        }
    })
    console.log('lock')
    return newLock
}

export async function unlockPost(id: number, lock: Date): Promise<void> {
    console.log('unlock')
    await requireUserWithRole(Role.writer)
    const post = await prisma.post.findUnique({ where: { id } })
    if (post == null) {
        return
    }
    if (post.lockedAt == null) {
        return
    }
    if (post.lockedAt.getTime() !== lock.getTime()) {
        return
    }
    await prisma.post.update({
        where: { id },
        data: {
            lockedAt: null
        }
    })
}

export async function isPostLocked(id: number): Promise<boolean> {
    await requireUserWithRole(Role.writer)
    const post = await prisma.post.findUnique({ where: { id } })
    if (post == null) {
        return false
    }
    if (post.lockedAt == null) {
        return false
    }
    return new Date().getTime() - post.lockedAt.getTime() <= 1.5 * 60 * 1000
}

// Check if the current content lock has been replaced by another user
export async function isLockAlive(id: number, lock: Date): Promise<boolean> {
    await requireUserWithRole(Role.writer)
    const post = await prisma.post.findUnique({ where: { id } })
    if (post == null) {
        return false
    }
    if (post.lockedAt == null) {
        return false
    }
    if (post.lockedAt.getTime() !== lock.getTime()) {
        return false
    }
    return new Date().getTime() - post.lockedAt.getTime() <= 1.5 * 60 * 1000
}

// = CREATING AND EDITING
export async function createPost(titleEN: string, titleZH: string): Promise<Post> {
    const user = await requireUserWithRole(Role.writer)
    const post = await prisma.post.create({
        data: {
            titleEN,
            titleZH,
            slug: titleEN.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            contentDraftEN: '',
            contentDraftZH: '',
            contentPublishedEN: null,
            contentPublishedZH: null,
            editorsApproved: [],
            adminsApproved: [],
            creatorId: user.id
        }
    })
    await prisma.userAuditLog.create({
        data: {
            type: UserAuditLogType.writerCreatePost,
            userId: user.id,
            values: [ post.id.toString(), titleEN ]
        }
    })
    return post
}

export async function updatePostMetadata(data: {
    id: number
    slug: string | undefined
    createdAt: Date | undefined
}): Promise<Post> {
    const user = await requireUserWithRole(Role.writer)
    const post = await prisma.post.update({
        where: { id: data.id },
        data: { slug: data.slug, createdAt: data.createdAt }
    })
    await prisma.userAuditLog.create({
        data: {
            type: UserAuditLogType.writerEditPost,
            userId: user.id,
            values: [ data.id.toString(), post.titleEN ]
        }
    })
    return post
}

export async function updatePostSubstantially(data: {
    id: number
    titleEN: string | undefined
    titleZH: string | undefined
    contentDraftEN: string | undefined
    contentDraftZH: string | undefined
    coverImageId: number | null | undefined
}): Promise<Post> {
    const user = await requireUserWithRole(Role.writer)
    const post = await prisma.post.update({
        where: { id: data.id },
        data: {
            titleEN: data.titleEN,
            titleZH: data.titleZH,
            contentDraftEN: data.contentDraftEN,
            contentDraftZH: data.contentDraftZH,
            coverImageId: data.coverImageId,
            editorsApproved: [],
            adminsApproved: []
        }
    })
    await prisma.userAuditLog.create({
        data: {
            type: UserAuditLogType.writerEditPost,
            userId: user.id,
            values: [ data.id.toString(), post.titleEN ]
        }
    })
    return post
}

// = WeChat crawling
let wechatWorkerRunning = WeChatWorkerStatus.idle

async function runCommand(
    command: string,
    args: string[],
    cwd?: string,
    envVars?: NodeJS.ProcessEnv
): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`+ Running command: ${command} ${args.join(' ')}`)
        const options = {
            cwd,
            stdio: 'inherit' as const,
            shell: true,
            env: { ...process.env, ...envVars }
        }
        const child = spawn(command, args, options)
        child.on('close', code => {
            if (code === 0) resolve()
            else reject(new Error(`+ ${command} exited with code ${code}`))
        })
    })
}

export async function checkWeChatWorkerStatus(): Promise<WeChatWorkerStatus> {
    await requireUserWithRole(Role.writer)
    return wechatWorkerRunning
}

// Crawl a WeChat article and create a post from it
export async function createPostFromWeChat(url: string, coverImageId: number | null): Promise<void> {
    if (wechatWorkerRunning !== WeChatWorkerStatus.idle) {
        return
    }
    const user = await requireUserWithRole(Role.writer)
    const post = await prisma.post.create({
        data: {
            titleEN: 'WeChat Article',
            titleZH: '微信文章',
            slug: 'temporary-slug',
            contentDraftEN: '',
            contentDraftZH: '',
            contentPublishedEN: null,
            contentPublishedZH: null,
            editorsApproved: [],
            adminsApproved: [],
            creatorId: user.id
        }
    })
    await prisma.userAuditLog.create({
        data: {
            type: UserAuditLogType.writerCreatePost,
            userId: user.id,
            values: [ post.id.toString(), 'WeChat Article' ]
        }
    })
    void workOnWeChat(url, coverImageId, user, post)
}

async function workOnWeChat(link: string, coverImageId: number | null, user: User, post: Post) {
    try {
        wechatWorkerRunning = WeChatWorkerStatus.download
        console.log(`+ Starting article download from ${link}.`)
        // STEP 0: Download the article
        await fs.mkdir(`/tmp/article-build-${post.id}`)
        await runCommand(path.join(process.env.HOME!, 'blobs', 'downloader'), [ link, `/tmp/article-build-${post.id}`, '--image=save' ], `/tmp/article-build-${post.id}`)

        // Move from /tmp/article-build-${build.id}/(...) to /tmp/article-build-${build.id}/article
        const files = await fs.readdir(`/tmp/article-build-${post.id}`)
        await fs.rename(path.join(`/tmp/article-build-${post.id}`, files[0]), path.join(`/tmp/article-build-${post.id}`, 'article'))


        console.log('+ Reading Markdown content.')
        // STEP 1: Read the Markdown content
        // Read the only Markdown file from /tmp/article-build-${build.id}/article.
        const articleFiles = await fs.readdir(`/tmp/article-build-${post.id}/article`)
        const markdownFile = articleFiles.find(f => f.endsWith('.md'))
        if (!markdownFile) {
            throw new Error(`No Markdown file found while processing article.`)
        }
        const markdownContent = await fs.readFile(path.join(`/tmp/article-build-${post.id}/article`, markdownFile), 'utf-8')

        wechatWorkerRunning = WeChatWorkerStatus.imageClassification
        console.log('+ Calling image classifiers.')
        // Remove decorative image files.
        const toRemove = []
        const toKeep = []
        for (const file of articleFiles.filter(f => f.endsWith('.jpeg') || f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'))) {
            const r = await fetch(`http://localhost:59192?image=/tmp/article-build-${post.id}/article/${file}`)
            if ((await r.text()) === 'decorative') {
                toRemove.push(file)
                await fs.rm(path.join(`/tmp/article-build-${post.id}/article`, file), { force: true })
            } else {
                toKeep.push(file)
            }
        }
        console.log('+ Removed decorative images: ' + toRemove.toString())

        // Call DeepSeek to process the article
        // STEP 2: Sanitize content
        wechatWorkerRunning = WeChatWorkerStatus.sanitization
        console.log('+ Calling DeepSeek to sanitize article content.')
        console.log('Sending prompt:\n' + SANITIZE_LITERAL.replace('{{PLACEHOLDER}}', post.id.toString()).replace('{{IMAGE_BLACKLIST}}', toRemove.toString())
            + markdownContent)
        const sanitizeResp = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'user',
                        content: SANITIZE_LITERAL.replace('{{PLACEHOLDER}}', post.id.toString()).replace('{{IMAGE_BLACKLIST}}', toRemove.toString())
                            + markdownContent
                    }
                ],
                stream: false
            })
        })
        console.log('+ DeepSeek responded with sanitized content.')
        const srj = await sanitizeResp.json()
        const srRawContent = srj.choices[0].message.content
        const srStrippedContent = srRawContent.replace(/^```json\s*/, '').replace(/```$/, '')
        const sr = JSON.parse(srStrippedContent)

        const titleChinese = sr.title
        const contentChinese = sr.content
        const date = sr.date

        // STEP 3: Translate content
        wechatWorkerRunning = WeChatWorkerStatus.translation
        console.log('+ Calling DeepSeek to translate article content.')
        console.log('Sending prompt:\n' + TRANSLATE_LITERAL + '#' + titleChinese + '\n\n' + contentChinese)
        const translateResp = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'user',
                        content: TRANSLATE_LITERAL + '#' + titleChinese + '\n\n' + contentChinese
                    }
                ],
                stream: false
            })
        })
        console.log('+ DeepSeek responded with translated content.')
        const trj = await translateResp.json()
        const trRawContent = trj.choices[0].message.content
        const trStrippedContent = trRawContent.replace(/^```json\s*/, '').replace(/```$/, '')
        const tr = JSON.parse(trStrippedContent)

        const title = tr.title
        const content = tr.content

        // STEP 4: Store images in media library
        wechatWorkerRunning = WeChatWorkerStatus.savingImages
        for (const file of toKeep) {
            const fileBuffer = await fs.readFile(path.join(`/tmp/article-build-${post.id}/article`, file))
            const webpBuffer = await sharp(fileBuffer).webp().toBuffer()
            const thumbnailBuffer = await sharp(fileBuffer).resize(300, 200, {
                fit: 'inside',
                withoutEnlargement: true
            }).webp().toBuffer()
            const hash = crypto.createHash('sha1').update(webpBuffer).digest('hex')
            await fs.writeFile(path.join(process.env.UPLOAD_PATH!, hash + '.webp'), webpBuffer)
            await fs.writeFile(path.join(process.env.UPLOAD_PATH!, hash + '_thump.webp'), thumbnailBuffer)

            const metadata = await sharp(webpBuffer).metadata()

            const img = await prisma.image.create({
                data: {
                    sha1: hash,
                    name: '微信导入',
                    altText: '由微信文章导入',
                    width: metadata.width ?? 0,
                    height: metadata.height ?? 0,
                    sizeKB: Math.ceil(webpBuffer.length / 1024),
                    uploaderId: user.id
                }
            })
            await prisma.userAuditLog.create({
                data: {
                    type: UserAuditLogType.uploadImage,
                    userId: user.id,
                    values: [ img.id.toString(), hash ]
                }
            })
        }

        // STEP 5: Create post for review
        // TODO Image format not decided - need to replace in content
        wechatWorkerRunning = WeChatWorkerStatus.creatingPost
        await prisma.post.update({
            where: {
                id: post.id
            },
            data: {
                titleEN: title,
                titleZH: titleChinese,
                slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                contentDraftEN: content,
                contentDraftZH: contentChinese,
                coverImageId,
                createdAt: new Date(date)
            }
        })
    } catch (e) {
        console.error(`+ Build failed with ${e}`)
    } finally {
        wechatWorkerRunning = WeChatWorkerStatus.idle
    }
}

const TRANSLATE_LITERAL = `
你将收到一篇**中文 Markdown** 校园新闻：第一行是原标题（已以 \`#\` 开头给出），其后是正文 Markdown。你的任务是**忠实、流畅地翻译为英文**，并以**JSON** 返回结构化结果。

## 翻译要求
- **英文为唯一语言**：输出中**不能出现任何中文**（含括号内注释、术语原文等）。  
- **标题与正文**：将给定的中文标题翻译为英文并放入 \`title\`；**不要**把主标题写入 \`content\`。  
- **Markdown 结构**：保留正文中的 Markdown 结构（段落、列表、加粗、斜体、引用、代码块、链接、图片等）。  
- **图片与特殊符号**：  
  - 不要修改或翻译图片的 Markdown 语法与链接（如 \`![]()\`）。  
  - 不要翻译出现的字面 \`\\n\`（表示换行的转义），保持其原样。  
- **文体与细节**：  
  - 符合**校园新闻报道**的常见英文体例，语法正确，大小写与标点规范。  
  - **专有名词与术语**：严格遵循下方“专有名词对照表”；若原文与对照表不同，以对照表为准。  
  - **中文人名**：采用汉语拼音，**姓在前、名在后**（如“张丹萌”→“Zhang Danmeng”），不使用音译英文名。  
  - 合理处理量词与日期表达，避免直译僵硬。

## 输出字段
- \`content\`：英文正文（不含主标题），保持 Markdown 结构与图片。  
- \`title\`：英文标题。    

## 输出格式（仅输出 JSON 对象；不要使用代码块围栏）
{
  "content": "...Markdown in English...",
  "title": "English Title"
}

## 重要禁止项
- 不要输出任何解释性文字、提示或多余字符。  
- 不要在 JSON 外再包裹 Markdown/代码围栏。  
- 不要混用中英文本；**只输出英文内容**（除非为图片链接、\`\\n\` 字面量等要求保留的非英文字符）。

专有名词:
北京中学 Beijing Academy
北京中学国际部 Beijing Academy International Division (尽量缩写为 BAID)
北中国籍: BAID
BA 大讲堂: BA Lectures
北中小讲师: BAID Speaker
世界大课堂: BA Global Classroom
阅历课程: Experiential Program
北京文化探究: Beijing Cultural Exploration
职业体验: Career Experiences
英才学者: Elite Scholar
世界因我更美好: Better Me, Better World
仁、智、勇、乐: Benevolence, Wisdom, Bravery, Happiness
和而不同 乐在其中: Embrace Harmony and Differences
学会学习 学会共处 学会创新 学会生活: To Learn, To Coooperate, To Innovate, To Live
京领: KingLead
京西学校: Western Academy of Beijing
社团: Student Club
选修课: Electives
年度人物: Person of the Year
月度人物: Person of the Month
校长特别奖: Principal's Special Award
学科周: Subject Week
国际风情周: International Theme Week
校友联络处: Alumni Association
中秋诗会: Zhongqiu Poem Festival
大地课程: Nature Exploration
语文 (指课程): Chinese Literature
通用技术 (指课程): General Technology
信息技术 (指课程): Information Technology
综合英语 (指课程): Integrated English
文学与写作 (指课程): Literature
整本书阅读 (指课程): Guided Reading
戏剧 (指课程): Drama
专题数学 (指课程): Selected Topics in Mathematics
高阶数学 (指课程): Multivariable Calculus
高阶经济 (指课程): Advanced Economics
高阶物理 (指课程): Advanced Physics
沟通技能 (指课程): Communication Skills
学术写作 (指课程): Academic Writing
跨文化交际 (指课程): Intercultural Communications
人文社科 (指课程): Social Studies Course Set (必须包含 Course Set)
EOT 经济竞赛 (指课程): Economics Olympiad Team
植物知道生命的答案 (指课程): Plants Know the Truth of Life
「丝绸之路」之跨学科探索 (指课程): Silk Road Exploration
近现代物理 (指课程): Modern Physics
版画 (指课程): Printmaking
升学指导: College Counseling
班会: Homeroom
戏剧节: Drama Festival
北中好声音: Sing! BA
北中杯: BA Cup
北中小舞台: BAID's Got Talent
露营: Camping
`

const SANITIZE_LITERAL = `
你将收到一段**中文 Markdown** 文本（由微信公众号内容转换而来）。请对其进行**清理与结构化输出**，并按以下要求返回**JSON**：

## 任务
1) **去除装饰性元素**：删除与正文无关的装饰文字、页眉/页脚、水印、作者名片、引导关注/点赞/转发等提示，删除文章主标题、公众号名称与日期等版头信息。  
2) **保留正文与图片**：正文中的图片属于内容的一部分，需要保留其 **Markdown 图片语法**。  
3) **规范化与排版**：在不改变原意的前提下，适度改善排版（如合理添加小标题、列表、加粗等），但**不要把文章主标题作为正文标题**加入到 content 中。

## 图片处理
- 删除所有 **SVG** 与 **GIF** 图片。
- 删除在占位符 {{IMAGE_BLACKLIST}} 中给出的图片文件（如果存在）。

## 提取字段
- **title**：从原文中提取的文章标题（不出现在 content 内）。
- **date**：从文本**开头部分**提取的日期，格式为 yyyy-MM-dd。
- **content**：清理与排版后的 Markdown 正文（不含主标题；保留合规图片的 Markdown 语法与其他结构）。

## 输出格式（必须是一个 JSON 对象）
{
  "content": "...Markdown...",
  "title": "文章标题",
  "date": "yyyy-MM-dd"
}
**仅输出 JSON，不要包含解释或多余文本。**
在处理前，先根据以上规则完成图片筛除与链接前缀替换，再进行字段提取与排版。
`
