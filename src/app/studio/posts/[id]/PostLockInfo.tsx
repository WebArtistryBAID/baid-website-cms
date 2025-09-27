'use client'

import { HydratedPost } from '@/app/lib/data-types'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { overrideAndLockPost } from '@/app/studio/posts/post-actions'

export default function PostLockInfo({ post }: { post: HydratedPost }) {
    const [ loading, setLoading ] = useState(false)
    const router = useRouter()

    return <Modal show={true} size="md" popup onClose={() => router.push('/studio/posts')}>
        <ModalHeader/>
        <ModalBody>
            <div className="space-y-6">
                <h3 className="text-xl font-bold">其他用户正在编辑文章</h3>
                <p className="text-sm">如果您希望开始编辑，<span className="font-bold">其他用户会丢失未保存的更改。</span>
                </p>
            </div>
        </ModalBody>
        <ModalFooter>
            <Button disabled={loading} pill color="blue" onClick={async () => {
                setLoading(true)
                const lock = await overrideAndLockPost(post.id)
                setLoading(false)
                router.push(`/studio/posts/${post.id}?lock=${lock?.getTime()}`)
            }}>覆盖并继续</Button>
            <Button disabled={loading} pill color="alternative" onClick={() => router.push('/studio/posts')}>
                取消
            </Button>
        </ModalFooter>
    </Modal>
}
