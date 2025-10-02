'use client'

import { getContentEntityURI, SimplifiedContentEntity } from '@/app/lib/data-types'
import Link from 'next/link'
import { useLanguage } from '@/app/[[...slug]]/useLanguage'

export default function LatestNews({ title, otherNewsText, readMoreText, resolvedPosts, uploadPrefix }: {
    title: string | null,
    otherNewsText: string | null,
    readMoreText: string | null,
    resolvedPosts: SimplifiedContentEntity[] | null,
    uploadPrefix: string | null
}) {
    resolvedPosts = resolvedPosts ?? []
    const language = useLanguage()

    return <>
        <section aria-labelledby="news-heading" className="mt-24 border-black">
            <div className="container mb-8 flex items-center px-5 md:px-0">
                <h2 id="news-heading"
                    className="text-4xl lg:text-5xl xl:text-6xl font-bold mr-auto xl:-mb-2">
                    {title}
                </h2>

                <Link href="/news"
                      className="flex items-center gap-1 text-black decoration-none opacity-80 hover:opacity-100 transition">
                    <span className="!font-sans">{readMoreText}</span>
                    <svg
                        height="25"
                        viewBox="0 0 16 16"
                        width="25"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M2 8a.75.75 0 0 1 .75-.75h8.787L8.25 4.309a.75.75 0 0 1 1-1.118L14 7.441a.75.75 0 0 1 0 1.118l-4.75 4.25a.75.75 0 1 1-1-1.118l3.287-2.941H2.75A.75.75 0 0 1 2 8Z"
                            fill="currentColor"
                        />
                    </svg>
                </Link>
            </div>
        </section>

        <section aria-labelledby="news-heading" className="section !mb-24 container">
            <div className="w-full flex flex-col md:flex-row gap-8">
                {resolvedPosts.length > 0 ?
                    <Link href={getContentEntityURI(resolvedPosts[0].createdAt, resolvedPosts[0].slug)}
                          className="w-full md:w-2/3 group block">
                    <div className="w-full h-64 md:h-96 overflow-hidden rounded-3xl mb-3">
                        <img alt={resolvedPosts[0].coverImagePublished?.altText}
                             src={`${uploadPrefix}/${resolvedPosts[0].coverImagePublished?.sha1}.webp`}
                             className="object-cover w-full h-full rounded-t-3xl transform transition-transform duration-300 ease-in-out group-hover:scale-105"/>
                    </div>
                    <p className="text-3xl font-serif fancy-link">
                        {language === 'en' ? resolvedPosts[0].titlePublishedEN : resolvedPosts[0].titlePublishedZH}
                    </p>
                </Link> : null}
                <div className="w-full md:w-1/3">
                    {resolvedPosts.length > 1 ? resolvedPosts.slice(1, 4).map(news => <div
                        className="pb-3 border-b border-black mb-5"
                        key={news.id}>
                        <p
                            aria-hidden="true"
                            className="uppercase text-gray-400 !mb-2 text-sm"
                        >
                            {otherNewsText}
                        </p>
                        <Link href={getContentEntityURI(news.createdAt, news.slug)} className="block group">
                            <p className="text-xl font-bold fancy-link">
                                {language === 'en' ? news.titlePublishedEN : news.titlePublishedZH}
                            </p>
                        </Link>
                    </div>) : null}
                </div>
            </div>
        </section>
    </>
}
