import { cookies, headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { Render } from '@measured/puck'
import { PUCK_CONFIG } from '@/app/lib/puck/puck-config'
import { getContentEntityBySlug } from '@/app/studio/editor/entity-actions'
import GlobalFooter from '@/app/[[...slug]]/GlobalFooter'
import GlobalHeader from '@/app/[[...slug]]/GlobalHeader'

const PAGES = [
    { id: 1, titleEN: 'About Us', titleZH: '关于', slug: 'about' },
    { id: 2, titleEN: 'Academics', titleZH: '学术', slug: 'academics' },
    { id: 3, titleEN: 'Life', titleZH: '学生生活', slug: 'life' },
    { id: 4, titleEN: 'Projects', titleZH: '自主项目', slug: 'projects' },
    { id: 5, titleEN: 'Admissions', titleZH: '招生', slug: 'admissions' },
    { id: 6, titleEN: 'News', titleZH: '新闻', slug: 'news' }
]

export default async function RouteHandler({ params }: { params: Promise<{ slug: string[] | undefined }> }) {
    const route = (await params).slug ?? []

    // Determine locale
    let finalLocale: string

    if (route.length > 0 && (route[0] === 'en' || route[0] === 'zh')) {
        finalLocale = route[0]
    } else {
        const langCookie = (await cookies()).get('lang')?.value
        if (langCookie === 'en' || langCookie === 'zh') {
            finalLocale = langCookie
        } else {
            const rawLocale = ((await headers()).get('Accept-Language') ?? 'en').split(';')
            finalLocale = rawLocale[0].includes('zh') ? 'zh' : 'en'
        }
    }

    if (route.length < 1 || (route[0] !== 'en' && route[0] !== 'zh')) {
        // Redirect to the correct locale
        redirect(`/${finalLocale}/${route.join('/')}`)
    }

    const newRoute = route.slice(1)
    const slug = newRoute.length === 0 ? '/' : newRoute.join('/')

    // TODO Custom handling for content entity pages
    const entity = await getContentEntityBySlug(slug)
    if (entity == null) {
        notFound()
    }

    return <>
        <GlobalHeader pages={PAGES} headerAnimate={[ '/', 'projects', 'life' ].includes(slug)}/>
        <Render config={PUCK_CONFIG}
                data={finalLocale === 'en'
                    ? JSON.parse(entity.contentPublishedEN!)
                    : JSON.parse(entity.contentPublishedZH!)}/>
        <GlobalFooter pages={PAGES}/>
    </>
}
