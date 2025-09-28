'use client'

import If from '@/app/lib/If'
import {
    Button, Datepicker,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    TabItem,
    Tabs,
    TextInput,
    Timeline,
    TimelineBody,
    TimelineContent,
    TimelineItem,
    TimelinePoint,
    TimelineTitle
} from 'flowbite-react'
import { HiNewspaper, HiPencil } from 'react-icons/hi2'
import { HiCloudUpload, HiSearch } from 'react-icons/hi'
import {
    HydratedPost,
    MINIMUM_ADMIN_APPROVALS,
    MINIMUM_EDITOR_APPROVALS,
    Paginated,
    SimplifiedUser
} from '@/app/lib/data-types'
import { useEffect, useRef, useState } from 'react'
import { Image, Role, User } from '@prisma/client'
import { getMyUser } from '@/app/login/login-actions'
import { useRouter } from 'next/navigation'
import {
    adminApprovePost,
    alignPost,
    deletePost,
    editorApprovePost, getPost,
    isLockAlive,
    lockPost,
    unlockPost,
    unpublishPost,
    updatePost
} from '@/app/studio/posts/post-actions'
import MediaLibrary from '@/app/studio/media/MediaLibrary'
import { getImage, getImages } from '@/app/studio/media/media-actions'
import SimpleMarkdownEditor from '@/app/studio/posts/SimpleMarkdownEditor'
import Markdown from 'react-markdown'

export default function PostEditor({ initPost, userMap, lock, uploadPrefix }: {
    initPost: HydratedPost,
    userMap: Map<number, SimplifiedUser>,
    lock: Date,
    uploadPrefix: string
}) {
    const [ user, setUser ] = useState<User | null>(null)
    const [ loading, setLoading ] = useState(false)
    const [ currentLock, setCurrentLock ] = useState(lock)
    const [ previousPost, setPreviousPost ] = useState(initPost)
    const [ post, setPost ] = useState(initPost)
    const [ showLockBroken, setShowLockBroken ] = useState(false)
    const [ showMediaLibrary, setShowMediaLibrary ] = useState(false)
    const [ showTitleForm, setShowTitleForm ] = useState(false)
    const [ showSlugForm, setShowSlugForm ] = useState(false)
    const [ showDateForm, setShowDateForm ] = useState(false)
    const [ mediaLibraryContent, setMediaLibraryContent ] = useState<Paginated<Image>>({ items: [], page: 0, pages: 0 })
    const [ cachedImages, setCachedImages ] = useState<Map<number, Image>>(new Map())
    const [ publishConfirm, setPublishConfirm ] = useState(false)
    const [ approvalConfirm, setApprovalConfirm ] = useState(false)
    const [ approvalConfirm2, setApprovalConfirm2 ] = useState(false)
    const [ deleteConfirm, setDeleteConfirm ] = useState(false)
    const [ unpublishConfirm, setUnpublishConfirm ] = useState(false)
    const [ markdownContent, setMarkdownContent ] = useState(post.contentDraftZH)
    const [ previewContent, setPreviewContent ] = useState('')
    const [ hasChanges, setHasChanges ] = useState(false)
    const [ inEnglish, setInEnglish ] = useState(false)
    const router = useRouter()

    useEffect(() => {
        (async () => {
            setUser((await getMyUser())!)
        })()
    }, [])

    // = MEDIA LIBRARY PARSING
    // Parse [IMAGE: ID] placeholders, fetch/cached images, and update preview
    const extractImageIds = (md: string): number[] => {
        const ids = new Set<number>()
        const re = /\[IMAGE:\s*(\d+)\s*\]/g
        let match: RegExpExecArray | null
        while ((match = re.exec(md)) !== null) {
            ids.add(Number(match[1]))
        }
        return Array.from(ids)
    }
    // Helper to escape ] in alt text for markdown image syntax
    const escapeAlt = (s: string) => (s ?? '').replace(/]/g, '\\]')

    useEffect(() => {
        (async () => {
            const md = markdownContent ?? ''
            const ids = extractImageIds(md)

            // Start from current cache
            const working = new Map(cachedImages)

            // Fetch any images not yet cached
            const missing = ids.filter(id => !working.has(id))
            if (missing.length > 0) {
                const fetched = await Promise.all(missing.map(id => getImage(id)))
                fetched.forEach(img => {
                    if (img) {
                        working.set(img.id, img)
                    }
                })
                // Only update state if we actually added something new
                if (missing.length > 0) {
                    setCachedImages(working)
                }
            }

            // Replace placeholders with rendered image markdown for preview
            // NOTE: Using standard Markdown image syntax ![alt](url) so it renders in preview.
            const replaced = md.replace(/\[IMAGE:\s*(\d+)\s*\]/g, (_m, idStr: string) => {
                const id = Number(idStr)
                const image = working.get(id)
                if (!image) return _m // leave placeholder if not yet loaded
                const alt = escapeAlt(image.altText ?? '')
                return `![${alt}](${uploadPrefix}/${image.sha1}.webp)`
            })
            setPreviewContent(replaced)
        })()
    }, [ markdownContent ])


    // = LOCKING
    const lockRef = useRef<Date>(currentLock)
    useEffect(() => {
        lockRef.current = currentLock
    }, [ currentLock ])

    useEffect(() => {
        const interval = setInterval(async () => {
            const alive = await isLockAlive(post.id, lockRef.current)
            if (!alive) {
                setShowLockBroken(true)
                clearInterval(interval)
            }
        }, 10000)
        return () => clearInterval(interval)
    }, [ post.id ])

    useEffect(() => {
        const interval = setInterval(async () => {
            const newLock = await lockPost(post.id, lockRef.current)
            if (newLock == null) {
                setShowLockBroken(true)
                clearInterval(interval)
                return
            }
            setCurrentLock(newLock)
        }, 55000)
        return () => clearInterval(interval)
    }, [ post.id ])

    // Unlock before leaving
    useEffect(() => {
        // Only attach unload handlers in production to avoid StrictMode double-invocation noise during development
        if (process.env.NODE_ENV !== 'production') return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleBeforeUnload = (e: any) => {
            navigator.sendBeacon(`/studio/posts/${post.id}/unlock`, JSON.stringify({
                id: post.id,
                lock: currentLock.getTime()
            }))
            if (hasChanges && e instanceof BeforeUnloadEvent) {
                e.preventDefault()
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('pagehide', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('pagehide', handleBeforeUnload)
        }
    }, [ currentLock, post.id ])

    // Unlock before component unmount
    useEffect(() => {
        return () => {
            if (process.env.NODE_ENV === 'production') {
                void unlockPost(post.id, lockRef.current)
            }
        }
    }, []) // THIS is not supposed to contain anything


    // = Get media library data
    useEffect(() => {
        (async () => {
            setMediaLibraryContent(await getImages(0))
        })()
    }, [])


    // = Switch language
    function switchLanguage() {
        if (inEnglish) {
            setMarkdownContent(post.contentDraftZH)
            setInEnglish(false)
        } else {
            setMarkdownContent(post.contentDraftEN)
            setInEnglish(true)
        }
    }

    // = Save
    useEffect(() => {
        setHasChanges(post.titleEN !== previousPost.titleEN || post.titleZH !== previousPost.titleZH ||
            post.slug !== previousPost.slug ||
            post.coverImage?.id !== previousPost.coverImage?.id ||
            post.contentDraftEN !== previousPost.contentDraftEN ||
            post.contentDraftZH !== previousPost.contentDraftZH ||
            post.createdAt !== previousPost.createdAt)
    }, [ post, previousPost ])

    useEffect(() => {
        setPost(prev => {
            if (inEnglish) {
                if (prev.contentDraftEN === markdownContent) return prev
                return { ...prev, contentDraftEN: markdownContent }
            } else {
                if (prev.contentDraftZH === markdownContent) return prev
                return { ...prev, contentDraftZH: markdownContent }
            }
        })
    }, [ markdownContent, inEnglish ])

    async function saveChanges() {
        setLoading(true)
        const newPost = await updatePost({
            id: post.id,
            titleEN: post.titleEN,
            titleZH: post.titleZH,
            slug: post.slug,
            contentDraftEN: post.contentDraftEN,
            contentDraftZH: post.contentDraftZH,
            coverImageId: post.coverImage?.id,
            createdAt: post.createdAt
        })
        setPost(newPost)
        setPreviousPost(newPost)
        setLoading(false)
    }

    async function refreshPost() {
        setLoading(true)
        const newPost = await getPost(post.id)
        setPost(newPost!)
        setPreviousPost(newPost!)
        setLoading(false)
    }

    // = Mod + S to save
    const loadingRef = useRef(loading)
    const hasChangesRef = useRef(hasChanges)
    const saveRef = useRef(saveChanges)
    useEffect(() => {
        loadingRef.current = loading
    }, [ loading ])
    useEffect(() => {
        hasChangesRef.current = hasChanges
    }, [ hasChanges ])
    useEffect(() => {
        saveRef.current = saveChanges
    }, [ saveChanges ])

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault()
                // Only save when not loading and there are changes
                if (!loadingRef.current && hasChangesRef.current) {
                    void saveRef.current()
                }
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])

    return <>
        <Modal show={showTitleForm} size="md" popup onClose={() => setShowTitleForm(false)}>
            <ModalHeader/>
            <ModalBody>
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">更改标题</h3>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="title-zh">标题 (中文)</Label>
                        </div>
                        <TextInput id="title-zh" value={post.titleZH} placeholder="世界因我更美好"
                                   onChange={e => setPost({
                                       ...post,
                                       titleZH: e.currentTarget.value
                                   })}
                                   required/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="title-en">标题 (英文)</Label>
                        </div>
                        <TextInput id="title-en" value={post.titleEN} placeholder="Better Me, Better World"
                                   onChange={e => setPost({
                                       ...post,
                                       titleEN: e.currentTarget.value
                                   })}
                                   required/>
                    </div>
                    <p className="text-sm">英文标题请使用正确大小写，如 Old Meets New: BAID Beijing Cultural
                        Exploration</p>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button pill color="blue" disabled={loading} onClick={() => setShowTitleForm(false)}>确认</Button>
            </ModalFooter>
        </Modal>

        <Modal show={showSlugForm} size="md" popup onClose={() => setShowSlugForm(false)}>
            <ModalHeader/>
            <ModalBody>
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">更改链接位置</h3>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="slug">链接位置</Label>
                        </div>
                        <TextInput id="slug" value={post.slug} placeholder="better-me-better-world"
                                   onChange={e => setPost({
                                       ...post,
                                       slug: e.currentTarget.value
                                   })}
                                   required/>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button pill color="blue" disabled={loading} onClick={() => setShowSlugForm(false)}>确认</Button>
            </ModalFooter>
        </Modal>

        <Modal show={showDateForm} size="md" popup onClose={() => setShowDateForm(false)}>
            <ModalHeader/>
            <ModalBody>
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">更改显示日期</h3>
                    <div>
                        <Datepicker inline weekStart={1} value={post.createdAt} lang="zh-CN" onChange={d => setPost({
                            ...post,
                            createdAt: d ?? new Date()
                        })}/>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button pill color="blue" disabled={loading} onClick={() => setShowDateForm(false)}>确认</Button>
            </ModalFooter>
        </Modal>

        <Modal show={showMediaLibrary} size="5xl" onClose={() => setShowMediaLibrary(false)} className="relative">
            <ModalHeader className="border-none absolute z-50 right-0"/>
            <MediaLibrary init={mediaLibraryContent} pickMode={true} onPick={image => {
                setShowMediaLibrary(false)
                setPost({
                    ...post,
                    coverImage: image
                });
                (async () => {
                    setMediaLibraryContent(await getImages(0))
                })()
            }}/>
        </Modal>

        <Modal show={showLockBroken} size="md" popup onClose={() => router.push('/studio/posts')}>
            <ModalHeader/>
            <ModalBody>
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">其他用户正在编辑文章</h3>
                    <p className="text-sm">另一名用户中断了您的编辑。您的编辑未保存。</p>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button pill color="blue" onClick={() => {
                    router.push('/studio/posts')
                }}>退出</Button>
            </ModalFooter>
        </Modal>

        <Tabs aria-label="文章编辑器选项卡" variant="default">
            <TabItem active title="内容" icon={HiNewspaper}>
                <div className="w-full flex gap-8">
                    <div className="w-2/3">
                        <SimpleMarkdownEditor value={markdownContent} onChange={setMarkdownContent}/>
                    </div>
                    <div className="w-1/3">
                        <div className="flex mb-3 gap-3">
                            <Button pill color="blue" disabled={!hasChanges || loading}
                                    onClick={saveChanges}>保存更改</Button>
                            <Button pill color="alternative" disabled={hasChanges} onClick={switchLanguage}>
                                <If condition={inEnglish}>
                                    切换到中文
                                </If>
                                <If condition={!inEnglish}>
                                    切换到英文
                                </If>
                            </Button>
                        </div>

                        <p className="font-bold text-xl flex items-center gap-3">
                            {post.titleZH}
                            <button className="p-2 !h-8 !w-8 bg-blue-500 hover:bg-blue-600 transition-colors
                             duration-100 rounded-full flex justify-center items-center" aria-label="编辑标题"
                                    onClick={() => setShowTitleForm(true)}>
                                <HiPencil className="text-white text-xs"/>
                            </button>
                        </p>
                        <p className="text-sm secondary mb-3">{post.titleEN}</p>

                        <p className="font-bold secondary text-sm">链接位置</p>
                        <p className="mb-3 flex items-center gap-3">
                            {post.slug}
                            <button className="p-1 !h-6 !w-6 bg-blue-500 hover:bg-blue-600 transition-colors
                             duration-100 rounded-full flex justify-center items-center" aria-label="编辑链接位置"
                                    onClick={() => setShowSlugForm(true)}>
                                <HiPencil className="text-white text-xs"/>
                            </button>
                        </p>

                        <p className="font-bold secondary text-sm">状态</p>
                        <p className="mb-3">
                            <If condition={post.contentPublishedEN === post.contentDraftEN && post.contentPublishedZH === post.contentDraftZH}>
                                已发布
                            </If>

                            <If condition={post.contentPublishedEN == null && post.contentPublishedZH == null}>
                                草稿
                            </If>

                            <If condition={(post.contentPublishedEN !== post.contentDraftEN || post.contentPublishedZH !== post.contentDraftZH) &&
                                post.contentPublishedEN != null && post.contentPublishedZH != null}>
                                有更新未发布
                            </If>
                        </p>

                        <p className="font-bold secondary text-sm">显示日期</p>
                        <p className="mb-3 flex items-center gap-3">
                            {post.createdAt.toDateString()}
                            <button className="p-1 !h-6 !w-6 bg-blue-500 hover:bg-blue-600 transition-colors
                             duration-100 rounded-full flex justify-center items-center" aria-label="编辑显示日期"
                                    onClick={() => setShowDateForm(true)}>
                                <HiPencil className="text-white text-xs"/>
                            </button>
                        </p>

                        <p className="font-bold secondary text-sm">更新时间</p>
                        <p className="mb-3">{post.updatedAt.toLocaleString()}</p>

                        <p className="font-bold secondary text-sm">封面</p>
                        <If condition={post.coverImage != null}>
                            <button onClick={() => setShowMediaLibrary(true)} className="cursor-pointer">
                                <img className="mt-1 mb-3 h-24" alt={post.coverImage?.altText}
                                     src={`${uploadPrefix}/${post.coverImage?.sha1}_thumb.webp`}/>
                            </button>
                        </If>
                        <If condition={post.coverImage == null}>
                            <Button pill color="blue" className="mt-1 mb-3"
                                    onClick={() => setShowMediaLibrary(true)}>设置封面</Button>
                        </If>

                        <p className="font-bold secondary text-sm">创建用户</p>
                        <p className="mb-3">{post.creator.name}</p>

                        <div className="flex gap-3">
                            <If condition={post.contentPublishedEN != null || post.contentPublishedZH != null}>
                                <Button disabled={loading} pill color="red" onClick={async () => {
                                    if (!unpublishConfirm) {
                                        setUnpublishConfirm(true)
                                        return
                                    }
                                    setLoading(true)
                                    await unpublishPost(post.id)
                                    setLoading(false)
                                    await refreshPost()
                                    router.refresh()
                                }}>
                                    {unpublishConfirm ? '确认撤回?' : '撤回发布'}
                                </Button>
                            </If>
                            <Button disabled={loading} pill color="red" onClick={async () => {
                                if (!deleteConfirm) {
                                    setDeleteConfirm(true)
                                    return
                                }
                                setLoading(true)
                                await deletePost(post.id)
                                setLoading(false)
                                router.push('/studio/posts')
                            }}>{deleteConfirm ? '确认删除?' : '删除'}</Button>
                        </div>
                    </div>
                </div>
            </TabItem>
            <TabItem title="预览" icon={HiSearch}>
                <Button pill color="alternative" className="mb-5" disabled={hasChanges} onClick={switchLanguage}>
                    <If condition={inEnglish}>
                        切换到中文
                    </If>
                    <If condition={!inEnglish}>
                        切换到英文
                    </If>
                </Button>
                <If condition={post.coverImage != null}>
                    <img className="mb-5 w-full h-64 object-cover" alt={post.coverImage?.altText}
                         src={`${uploadPrefix}/${post.coverImage?.sha1}.webp`}/>
                </If>
                <article>
                    <h1>{inEnglish ? post.titleEN : post.titleZH}</h1>
                    <Markdown>{previewContent}</Markdown>
                </article>
            </TabItem>
            <TabItem title="审核与发布" icon={HiCloudUpload}>
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-5">审核与发布流程</h2>
                    <Timeline>
                        <TimelineItem>
                            <TimelinePoint icon={HiPencil}/>
                            <TimelineContent>
                                <TimelineTitle>撰稿</TimelineTitle>
                                <TimelineBody>
                                    由撰稿员完成内容编写。
                                </TimelineBody>
                            </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                            <TimelinePoint icon={HiPencil}/>
                            <TimelineContent>
                                <TimelineTitle>编辑员审核</TimelineTitle>
                                <TimelineBody>
                                    <p>由 {MINIMUM_EDITOR_APPROVALS} 名编辑员审核。</p>
                                    <If condition={post.editorsApproved.length < 1}>
                                        <p className="text-blue-500">暂无编辑员批准，还需要 {MINIMUM_EDITOR_APPROVALS} 人。</p>
                                    </If>
                                    <If condition={post.editorsApproved.length > 0 && post.editorsApproved.length < MINIMUM_EDITOR_APPROVALS}>
                                        <p className="text-blue-500">已经由 {post.editorsApproved.map(u => userMap.get(u)?.name).join('、')} 批准，还需要 {MINIMUM_EDITOR_APPROVALS - post.editorsApproved.length} 人。</p>
                                    </If>
                                    <If condition={post.editorsApproved.length >= MINIMUM_EDITOR_APPROVALS}>
                                        <p className="text-green-400">已经由 {post.editorsApproved.map(u => userMap.get(u)?.name).join('、')} 批准，本步骤已完成。</p>
                                    </If>
                                </TimelineBody>
                                <If condition={user?.roles?.includes(Role.editor) && !post.editorsApproved.includes(user?.id)}>
                                    <Button disabled={loading} pill color="blue" onClick={async () => {
                                        if (!approvalConfirm) {
                                            setApprovalConfirm(true)
                                            return
                                        }
                                        setLoading(true)
                                        await editorApprovePost(post.id)
                                        setLoading(false)
                                        await refreshPost()
                                        router.refresh()
                                    }}>{approvalConfirm ? '确认批准?' : '批准'}</Button>
                                </If>
                            </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                            <TimelinePoint icon={HiPencil}/>
                            <TimelineContent>
                                <TimelineTitle>管理员审核</TimelineTitle>
                                <TimelineBody>
                                    <p>由 {MINIMUM_ADMIN_APPROVALS} 名管理员审核。</p>
                                    <If condition={post.adminsApproved.length < 1}>
                                        <p className="text-blue-500">暂无管理员批准，还需要 {MINIMUM_ADMIN_APPROVALS} 人。</p>
                                    </If>
                                    <If condition={post.adminsApproved.length > 0 && post.adminsApproved.length < MINIMUM_ADMIN_APPROVALS}>
                                        <p className="text-blue-500">已经由 {post.adminsApproved.map(u => userMap.get(u)?.name).join('、')} 批准，还需要 {MINIMUM_ADMIN_APPROVALS - post.adminsApproved.length} 人。</p>
                                    </If>
                                    <If condition={post.adminsApproved.length >= MINIMUM_ADMIN_APPROVALS}>
                                        <p className="text-green-400">已经由 {post.adminsApproved.map(u => userMap.get(u)?.name).join('、')} 批准，本步骤已完成。</p>
                                    </If>
                                </TimelineBody>
                                <If condition={user?.roles?.includes(Role.admin) && !post.adminsApproved.includes(user?.id)}>
                                    <Button disabled={loading} pill color="blue" onClick={async () => {
                                        if (!approvalConfirm2) {
                                            setApprovalConfirm2(true)
                                            return
                                        }
                                        setLoading(true)
                                        await adminApprovePost(post.id)
                                        setLoading(false)
                                        await refreshPost()
                                        router.refresh()
                                    }}>{approvalConfirm2 ? '确认批准?' : '批准'}</Button>
                                </If>
                            </TimelineContent>
                        </TimelineItem>
                        <TimelineItem>
                            <TimelinePoint icon={HiCloudUpload}/>
                            <TimelineContent>
                                <TimelineTitle>发布</TimelineTitle>
                                <TimelineBody>
                                    <If condition={post.adminsApproved.length < MINIMUM_ADMIN_APPROVALS || post.editorsApproved.length < MINIMUM_EDITOR_APPROVALS}>
                                        <p>完成前序步骤后即可发布。</p>
                                    </If>
                                    <If condition={post.adminsApproved.length >= MINIMUM_ADMIN_APPROVALS && post.editorsApproved.length >= MINIMUM_EDITOR_APPROVALS &&
                                        (post.contentPublishedEN !== post.contentDraftEN || post.contentPublishedZH !== post.contentDraftZH)}>
                                        <p>内容已审核完成，可以发表。</p>
                                        <Button disabled={loading} pill color="blue" onClick={async () => {
                                            if (!publishConfirm) {
                                                setPublishConfirm(true)
                                                return
                                            }
                                            setLoading(true)
                                            await alignPost(post.id)
                                            setLoading(false)
                                            await refreshPost()
                                            router.refresh()
                                        }}>{publishConfirm ? '确认发布?' : '发布'}</Button>
                                    </If>
                                    <If condition={post.contentPublishedEN === post.contentDraftEN && post.contentPublishedZH === post.contentDraftZH}>
                                        <p>内容已成功发布!</p>
                                    </If>
                                </TimelineBody>
                            </TimelineContent>
                        </TimelineItem>
                    </Timeline>
                </div>
            </TabItem>
        </Tabs>
    </>
}
