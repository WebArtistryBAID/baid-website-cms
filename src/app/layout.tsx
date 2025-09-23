import type { Metadata } from 'next'
import './globals.css'
import { ReactNode } from 'react'
import NextTopLoader from 'nextjs-toploader'
import { ThemeModeScript } from 'flowbite-react'

export const metadata: Metadata = {
    title: 'BAID CMS',
    description: 'The platform for BAID Website\'s approval process'
}

export default async function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <ThemeModeScript mode="auto"/>
        </head>
        <body className="antialiased">
        <NextTopLoader showSpinner={false} color="#ff6900"/>
        {children}
        <p aria-hidden className="fixed bottom-2 right-2 secondary text-xs"><a
            href="https://beian.miit.gov.cn">{process.env.BOTTOM_TEXT}</a></p>
        </body>
        </html>
    )
}
