'use client'

import { SimplifiedContentEntity } from '@/app/lib/data-types'
import Link from 'next/link'
import { EntityType } from '@prisma/client'
import If from '@/app/lib/If'

export default function StudioHome({ pages, posts, uploadServePath }: {
    pages: SimplifiedContentEntity[],
    posts: SimplifiedContentEntity[],
    uploadServePath: string
}) {
    return <>
        <h1 className="text-3xl mb-5">欢迎</h1>

        <h2 className="text-2xl mb-3">近期页面</h2>
        <div className="grid grid-cols-4 mb-5">
            {pages.filter(post => post.slug !== 'temporary-slug').map(post => <Link
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

        <h2 className="text-2xl mb-3">近期文章</h2>
        <div className="grid grid-cols-4">
            {posts.filter(post => post.slug !== 'temporary-slug').map(post => <Link
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
    </>
}
