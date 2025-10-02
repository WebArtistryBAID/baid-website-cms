'use client'

import Link from 'next/link'
import { useLanguage } from '@/app/[[...slug]]/useLanguage'

const locales = {
    en: {
        wechat: '(add on WeChat)',
        copyright: '© 2025 Beijing Academy International Division. All rights reserved.',
        chn: 'Tap here to learn more about Beijing Academy\'s Chinese education offerings.'
    },
    zh: {
        wechat: '(在微信上添加)',
        copyright: '© 2025 北京中学国际部 / 保留所有权利',
        chn: '点击这里了解北京中学的中国教育项目。'
    }
}

export default function GlobalFooter({ pages }: {
    pages: { id: number, titleEN: string, titleZH: string, slug: string }[]
}) {
    const language = useLanguage()

    return <footer aria-labelledby="footer-heading" className="w-full !font-sans py-16 px-5 !text-white bg-red-900">
        <h2 id="footer-heading" className="sr-only">
            Footer
        </h2>
        <div className="container mb-5">
            <p className="uppercase tracking-[0.3em] !mb-5 font-sans text-lg">
                Beijing Academy
            </p>

            <nav aria-label="Footer navigation" role="navigation" className="space-y-3 mb-5">
                {pages.map((page, index) =>
                    <Link href={`/${page.slug}`} className="fancy-link link-white" key={index}>
                        <h3 className="text-lg font-bold mb-2">
                            {language === 'zh' ? page.titleZH : page.titleEN}
                        </h3>
                    </Link>
                )}
            </nav>

            <address className="mb-5">
                <p>+86 159 1052 4064 {locales[language].wechat}</p>
                <p>baid<span className="at"/>bjacademy.com.cn</p>
            </address>

            <p>{locales[language].copyright}</p>
            <p><a href="https://www.beijingacademy.com.cn">{locales[language].chn}</a></p>
            <p><a href="https://beian.miit.gov.cn">京ICP备13051651号-1</a></p>
        </div>
    </footer>
}
