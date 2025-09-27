import PostEditor from '@/app/studio/posts/[id]/PostEditor'
import { getPost, isPostLocked, lockPost } from '@/app/studio/posts/post-actions'
import { redirect } from 'next/navigation'
import { SimplifiedUser } from '@/app/lib/data-types'
import { getSimplifiedUser } from '@/app/login/login-actions'
import PostLockInfo from '@/app/studio/posts/[id]/PostLockInfo'

export default async function StudioPostPage({ params, searchParams }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ lock: string | null }>
}) {
    const post = await getPost(parseInt((await params).id))
    if (post == null) {
        redirect('/studio/posts')
    }
    let lock = (await searchParams).lock == null ? null : new Date(parseInt((await searchParams).lock!))
    if (lock == null) {
        if (await isPostLocked(post.id)) {
            return <PostLockInfo post={post}/>
        }
        lock = (await lockPost(post.id, null))!
    }

    const map = new Map<number, SimplifiedUser>()
    for (const user of post.editorsApproved) {
        const u = await getSimplifiedUser(user)
        if (u != null) {
            map.set(user, u)
        }
    }
    for (const user of post.adminsApproved) {
        const u = await getSimplifiedUser(user)
        if (u != null) {
            map.set(user, u)
        }
    }

    return <div className="p-16">
        <PostEditor initPost={post} userMap={map} lock={lock} uploadPrefix={process.env.UPLOAD_SERVE_PATH!}/>
    </div>
}
