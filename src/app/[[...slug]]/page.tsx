import { cookies, headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { Render } from '@measured/puck'
import { PUCK_CONFIG } from '@/app/lib/puck/puck-config'
import { getContentEntityBySlug } from '@/app/studio/editor/entity-actions'

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

    // TODO Custom handling for content entity pages
    const entity = await getContentEntityBySlug(newRoute.length === 0 ? 'home' : newRoute.join('/'))
    if (entity == null) {
        notFound()
    }

    // TODO header, footer
    return <>
        <Render config={PUCK_CONFIG}
                data={finalLocale === 'en'
                    ? JSON.parse(entity.contentPublishedEN!)
                    : JSON.parse(entity.contentPublishedZH!)}/>
    </>
}
