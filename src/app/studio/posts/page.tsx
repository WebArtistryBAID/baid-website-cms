import PostLibrary from '@/app/studio/posts/PostLibrary'
import { getPosts } from '@/app/studio/posts/post-actions'

export default async function PagePostLibrary() {
    return <div className="p-16">
        <h1 className="text-2xl mb-3">文章</h1>
        <PostLibrary init={await getPosts(0)}/>
    </div>
}
