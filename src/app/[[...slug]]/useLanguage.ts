'use client'

import { usePathname } from 'next/navigation'

export function useLanguage(): 'en' | 'zh' {
    const pathname = usePathname()
    if (!pathname) return 'en'

    const firstPart = pathname.split('/')[1]
    if (firstPart === 'zh') return 'zh'
    return 'en'
}
