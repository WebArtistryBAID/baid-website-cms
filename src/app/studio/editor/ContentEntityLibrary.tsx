'use client'

import { Paginated, SimplifiedContentEntity } from '@/app/lib/data-types'
import { useEffect, useState } from 'react'
import { getUploadServePath } from '@/app/studio/media/media-actions'
import {
    checkWeChatWorkerStatus,
    createContentEntity,
    createPostFromWeChat,
    getContentEntities
} from '@/app/studio/editor/entity-actions'
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, TextInput } from 'flowbite-react'
import If from '@/app/lib/If'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WeChatWorkerStatus } from '@/app/studio/editor/entity-types'
import { EntityType } from '@prisma/client'

export default function ContentEntityLibrary({ init, title, type }: {
    init: Paginated<SimplifiedContentEntity>,
    title: string,
    type: EntityType
}) {
    const [ page, setPage ] = useState<Paginated<SimplifiedContentEntity>>(init)
    const [ currentPage, setCurrentPage ] = useState(0)
    const [ showCreate, setShowCreate ] = useState(false)
    const [ postTitleEN, setPostTitleEN ] = useState('')
    const [ postTitleZH, setPostTitleZH ] = useState('')
    const [ showWeChatLink, setShowWeChatLink ] = useState(false)
    const [ wechatLink, setWeChatLink ] = useState('')
    const [ wechatStatus, setWeChatStatus ] = useState<WeChatWorkerStatus>(WeChatWorkerStatus.idle)
    const [ loading, setLoading ] = useState(false)
    const [ uploadServePath, setUploadServePath ] = useState<string>('')

    const router = useRouter()

    useEffect(() => {
        (async () => {
            setUploadServePath(await getUploadServePath())
            setWeChatStatus(await checkWeChatWorkerStatus())

            if (page.page !== currentPage) {
                setPage(await getContentEntities(currentPage, type))
            }
        })()
    }, [ currentPage, page.page ])

    return <>
        <Modal show={showCreate} size="md" popup onClose={() => setShowCreate(false)}>
            <ModalHeader/>
            <ModalBody>
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">创建{title}</h3>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="title-zh">标题 (中文)</Label>
                        </div>
                        <TextInput id="title-zh" value={postTitleZH} placeholder="世界因我更美好"
                                   onChange={e => setPostTitleZH(e.currentTarget.value)}
                                   required/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="title-en">标题 (英文)</Label>
                        </div>
                        <TextInput id="title-en" value={postTitleEN} placeholder="Better Me, Better World"
                                   onChange={e => setPostTitleEN(e.currentTarget.value)}
                                   required/>
                    </div>
                    <p className="text-sm">英文标题请使用正确大小写，如 Old Meets New: BAID Beijing Cultural
                        Exploration</p>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button disabled={loading} pill color="blue" onClick={async () => {
                    if (!postTitleEN || !postTitleZH) return
                    setLoading(true)
                    const post = await createContentEntity(type, postTitleEN, postTitleZH)
                    setLoading(false)
                    setShowCreate(false)
                    router.push(type === EntityType.page ? `/studio/pages/${post.id}/editor` : `/studio/editor/${post.id}`)
                }}>创建</Button>
                <Button disabled={loading} pill color="alternative" onClick={() => setShowCreate(false)}>
                    取消
                </Button>
            </ModalFooter>
        </Modal>

        <Modal show={showWeChatLink} size="md" popup onClose={() => setShowWeChatLink(false)}>
            <ModalHeader/>
            <ModalBody>
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">同步微信公众号文章</h3>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="wechat-link">链接</Label>
                        </div>
                        <TextInput id="wechat-link" value={wechatLink} placeholder="https://mp.weixin.qq.com/..."
                                   onChange={e => setWeChatLink(e.currentTarget.value)}
                                   required/>
                    </div>
                    <p className="text-sm">同步需要 5 到 10
                        分钟。同步完成后，请检查排版、中文内容及自动翻译。图片会自动放入媒体库。</p>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button disabled={loading} pill color="blue" onClick={async () => {
                    if (!wechatLink) return
                    try {
                        const url = new URL(wechatLink)
                        if (url.hostname !== 'mp.weixin.qq.com') {
                            return
                        }
                    } catch {
                        return
                    }
                    await createPostFromWeChat(wechatLink, null)
                    setWeChatStatus(WeChatWorkerStatus.download)
                    setShowWeChatLink(false)
                }}>开始同步任务</Button>
                <Button disabled={loading} pill color="alternative" onClick={() => setShowWeChatLink(false)}>
                    取消
                </Button>
            </ModalFooter>
        </Modal>

        <div className="p-8">
            <If condition={page.pages < 1}>
                <div className="flex flex-col justify-center items-center">
                    <img src="/assets/reading-light.png" alt="" className="h-48 mb-3"/>
                    <p className="mb-3">暂时没有{title}</p>
                    <Button pill color="blue" className="mb-3" onClick={() => setShowCreate(true)}>
                        <If condition={type === EntityType.post}>手动</If>创建
                    </Button>
                    <If condition={type === EntityType.post}>
                        <Button pill disabled={wechatStatus !== WeChatWorkerStatus.idle} color="blue"
                                onClick={() => setShowWeChatLink(true)}>
                            {{
                                idle: '同步微信公众号文章',
                                download: '正在下载文章...',
                                imageClassification: '正在分类图片...',
                                sanitization: '正在清理内容...',
                                translation: '正在翻译内容...',
                                savingImages: '正在保存图片...',
                                creatingPost: '正在创建文章...'
                            }[wechatStatus]}
                        </Button>
                    </If>
                </div>
            </If>
            <If condition={page.pages > 0}>
                <div className="flex gap-3 mb-5">
                    <If condition={type === EntityType.post}>
                        <Button pill disabled={wechatStatus !== WeChatWorkerStatus.idle} color="blue"
                                onClick={() => setShowWeChatLink(true)}>
                            {{
                                idle: '同步微信公众号文章',
                                download: '正在下载文章...',
                                imageClassification: '正在分类图片...',
                                sanitization: '正在清理内容...',
                                translation: '正在翻译内容...',
                                savingImages: '正在保存图片...',
                                creatingPost: '正在创建文章...'
                            }[wechatStatus]}
                        </Button>
                    </If>
                    <Button pill color="blue" className="mb-3" onClick={() => setShowCreate(true)}>
                        <If condition={type === EntityType.post}>手动</If>创建
                    </Button>
                </div>
                <div className="grid grid-cols-3 2xl:grid-cols-4 gap-4 mb-3">
                    {page.items.filter(post => post.slug !== 'temporary-slug').map(post => <Link
                        href={post.type === EntityType.page ? `/studio/pages/${post.id}/editor` : `/studio/editor/${post.id}`}
                        className="block rounded-3xl bg-gray-50 hover:bg-gray-100 hover:shadow-lg transition-all duration-100"
                        key={post.id}>
                        <If condition={post.coverImageDraft != null}>
                            <img src={`${uploadServePath}/${post.coverImageDraft?.sha1}_thumb.webp`}
                                 alt={post.coverImageDraft?.altText} className="object-cover w-full rounded-3xl h-48"/>
                        </If>
                        <If condition={post.coverImageDraft == null}>
                            <div className="w-full h-32 rounded-3xl from-blue-300 to-blue-500 bg-gradient-to-tr"/>
                        </If>

                        <div className="p-8">
                            <p className="text-xl font-bold mb-1">{post.titleDraftZH}</p>
                            <p className="text-sm secondary">更新于 {post.updatedAt.toLocaleString()}</p>
                        </div>
                    </Link>)}
                </div>
                <Pagination currentPage={currentPage + 1} onPageChange={p => setCurrentPage(p - 1)}
                            totalPages={page.pages}/>
            </If>
        </div>
    </>
}
