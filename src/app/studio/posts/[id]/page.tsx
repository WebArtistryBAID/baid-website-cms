import PostEditor from '@/app/studio/posts/[id]/PostEditor'
import { getPost } from '@/app/studio/posts/post-actions'
import { redirect } from 'next/navigation'
import { SimplifiedUser } from '@/app/lib/data-types'
import { getSimplifiedUser, requireUser } from '@/app/login/login-actions'
import { EntityType } from '@prisma/client'
import { tryAcquireLock } from '@/app/lib/lock/lock-typicals'

export default async function StudioPostPage({ params, searchParams }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ token?: string | null }>
}) {
    const user = await requireUser()

    const post = await getPost(parseInt((await params).id))
    if (post == null) {
        redirect('/studio/posts')
    }

    const token = await tryAcquireLock({
        entityType: EntityType.post,
        entityId: post.id,
        userId: user.id,
        currentToken: (await searchParams).token ?? undefined,
        returnUri: `/studio/posts`
    })
    if (typeof token !== 'string') {
        return token
    }

    return <div className="p-16">
        <PostEditor initPost={post}
                    lockToken={token} uploadPrefix={process.env.UPLOAD_SERVE_PATH!}/>
    </div>
}
