'use client'

import { Paginated, SimplifiedPost } from '@/app/lib/data-types'
import { useEffect, useState } from 'react'
import { getUploadServePath } from '@/app/studio/media/media-actions'
import { createPost, getPosts } from '@/app/studio/posts/post-actions'
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader, Pagination, TextInput } from 'flowbite-react'
import If from '@/app/lib/If'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PostLibrary({ init }: { init: Paginated<SimplifiedPost> }) {
    const [ page, setPage ] = useState<Paginated<SimplifiedPost>>(init)
    const [ currentPage, setCurrentPage ] = useState(0)
    const [ showCreate, setShowCreate ] = useState(false)
    const [ postTitleEN, setPostTitleEN ] = useState('')
    const [ postTitleZH, setPostTitleZH ] = useState('')
    const [ loading, setLoading ] = useState(false)
    const [ uploadServePath, setUploadServePath ] = useState<string>('')

    const router = useRouter()

    useEffect(() => {
        (async () => {
            setUploadServePath(await getUploadServePath())

            if (page.page !== currentPage) {
                setPage(await getPosts(currentPage))
            }
        })()
    }, [ currentPage, page.page ])

    return <>
        <Modal show={showCreate} size="md" popup onClose={() => setShowCreate(false)}>
            <ModalHeader/>
            <ModalBody>
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">创建文章</h3>
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
                    const post = await createPost(postTitleEN, postTitleZH)
                    setLoading(false)
                    setShowCreate(false)
                    router.push(`/studio/posts/${post.id}`)
                }}>创建</Button>
                <Button disabled={loading} pill color="alternative" onClick={() => setShowCreate(false)}>
                    取消
                </Button>
            </ModalFooter>
        </Modal>

        <div className="p-8">
            <If condition={page.pages < 1}>
                <div className="flex flex-col justify-center items-center">
                    <img src="/assets/reading-light.png" alt="" className="h-48 mb-3"/>
                    <p className="mb-3">暂时没有文章。</p>
                    <Button pill color="blue" onClick={() => setShowCreate(true)}>创建</Button>
                </div>
            </If>
            <If condition={page.pages > 0}>
                <div className="grid grid-cols-4 gap-4 mb-3">
                    {page.items.map(post => <Link href={`/studio/posts/${post.id}`}
                                                  className="block rounded-3xl bg-gray-50 hover:bg-gray-100 hover:shadow-lg transition-all duration-100"
                                                  key={post.id}>
                        <If condition={post.coverImage != null}>
                            <img src={`${uploadServePath}/${post.coverImage?.sha1}_thumb.webp`}
                                 alt={post.coverImage?.altText} className="object-cover w-full rounded-3xl h-48"/>
                        </If>
                        <If condition={post.coverImage == null}>
                            <div className="w-full h-32 rounded-3xl from-blue-300 to-blue-500 bg-gradient-to-tr"/>
                        </If>

                        <div className="p-8">
                            <p className="text-xl font-bold mb-1">{post.titleZH}</p>
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
