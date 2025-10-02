import type { Metadata } from 'next'
import './globals.css'
import { ReactNode } from 'react'
import NextTopLoader from 'nextjs-toploader'
import { ThemeInit } from '../../.flowbite-react/init'

export const metadata: Metadata = {
    title: 'Beijing Academy',
    description: 'Beijing Academy International Division (BAID) is a CIS-member international high school program in Beijing offering AP and Cambridge curricula.'
}

export default async function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <head><ThemeInit/></head>
        <body className="antialiased">
        <NextTopLoader showSpinner={false}/>
        {children}
        <p aria-hidden className="fixed bottom-2 right-2 secondary text-xs"><a
            href="https://beian.miit.gov.cn">{process.env.BOTTOM_TEXT}</a></p>
        </body>
        </html>
    )
}
