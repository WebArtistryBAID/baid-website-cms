'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '@/app/[[...slug]]/useLanguage'
import SchoolLogo from '@/app/[[...slug]]/SchoolLogo'
import RouterLinks from '@/app/[[...slug]]/RouterLinks'
import GlobalFooter from '@/app/[[...slug]]/GlobalFooter'

const locales = {
    en: {
        a11y: 'Skip to Main Content'
    },
    zh: {
        a11y: '跳至主内容'
    }
}

export default function GlobalHeader({ pages, headerAnimate = false }: {
    pages: { id: number, titleEN: string, titleZH: string, slug: string }[],
    headerAnimate?: boolean
}) {
    const pathname = usePathname() || '/'
    const language = useLanguage()
    const router = useRouter()

    // ----- Scroll + visibility state -----
    const [ prevScrollY, setPrevScrollY ] = useState<number>(typeof window !== 'undefined' ? window.scrollY : 0)
    const [ scrollY, setScrollY ] = useState<number>(typeof window !== 'undefined' ? window.scrollY : 0)
    const [ headerVisible, setHeaderVisible ] = useState(true)

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY
            setScrollY(y)
            setHeaderVisible(y < prevScrollY)
            setPrevScrollY(y)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ prevScrollY ])

    // ----- Styling derived state -----
    const backgroundClass = useMemo(() => {
        if (headerAnimate) {
            return scrollY < (typeof window !== 'undefined' ? window.innerHeight : 0) ? 'bg-transparent' : 'bg-white'
        }
        return 'bg-white'
    }, [ headerAnimate, scrollY ])

    const isTransparent = useMemo(
        () => headerAnimate && scrollY < (typeof window !== 'undefined' ? window.innerHeight : 0),
        [ headerAnimate, scrollY ]
    )

    // ----- Mobile menu state / a11y -----
    const [ mobileOpen, setMobileOpen ] = useState(false)
    const closeButtonRef = useRef<HTMLButtonElement | null>(null)

    useEffect(() => {
        // lock body scroll when menu open
        if (mobileOpen) {
            const prev = document.body.style.overflow
            document.body.style.overflow = 'hidden'
            // focus close button after open
            requestAnimationFrame(() => closeButtonRef.current?.focus())
            return () => {
                document.body.style.overflow = prev
            }
        } else {
            document.body.style.overflow = ''
        }
    }, [ mobileOpen ])

    // Close on Escape
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && mobileOpen) setMobileOpen(false)
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [ mobileOpen ])

    // Close on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [ pathname ])

    return (
        <>
            {/* Skip link */}
            <a className="sr-only" href="#main-content">
                {locales[language].a11y}
            </a>

            <header
                role="banner"
                className={[
                    'fixed top-0 left-0 w-screen px-4 sm:px-8 gap-3 flex z-50 transform transition-all duration-300',
                    headerVisible ? 'translate-y-0' : '-translate-y-full',
                    backgroundClass
                ].join(' ')}>
                <div className="mr-auto py-4 transition-colors duration-300">
                    <SchoolLogo color={isTransparent ? 'white' : 'black'}/>
                </div>

                <nav
                    aria-label="Primary navigation"
                    className={[
                        'hidden lg:flex transition-colors duration-300',
                        isTransparent ? 'text-white' : 'text-black'
                    ].join(' ')}
                >
                    <RouterLinks pages={pages}/>
                    <div className="flex items-center justify-center text-lg ml-3">
                        <a className="bg-red-900 rounded-full p-2 text-white" href="https://link.beijing.academy"
                           target="_blank" rel="noreferrer">
                            LinkBAID
                        </a>
                    </div>
                </nav>

                {/* Right controls: hamburger + language */}
                <div className="h-18 w-24 flex items-center justify-center gap-2">
                    <button
                        className="lg:hidden transition-colors duration-100 opacity-50 hover:opacity-100 active:opacity-80 pt-1.5"
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                        aria-haspopup="true"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        onClick={() => setMobileOpen((o) => !o)}
                    >
                        <svg
                            stroke={isTransparent ? '#fff' : '#000'}
                            aria-hidden="true"
                            className="h-6 w-6 transition-colors duration-300"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4 6h16M4 12h16M4 18h16"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                            />
                        </svg>
                    </button>

                    <button
                        onClick={() => {
                            const newLang = language === 'zh' ? 'en' : 'zh'
                            document.cookie = `lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 30}`
                            const segments = pathname.split('/').splice(2)
                            router.push(`/${newLang}/${segments.join('/')}`)
                        }}
                        aria-label="Switch language"
                        className="decoration-none transition-colors duration-100 opacity-50 hover:opacity-100 active:opacity-80"
                        style={{ color: isTransparent ? 'white' as const : 'black' as const }}>
                        <svg className="w-6 h-10" height="32" viewBox="0 0 24 18" width="32"
                             aria-label="Switch Language">
                            <path
                                d="m12.87 15.07l-2.54-2.51l.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5l3.11 3.11l.76-2.04M18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12m-2.62 7l1.62-4.33L19.12 17h-3.24Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div
                        id="mobile-menu"
                        aria-label="Mobile menu"
                        aria-modal="true"
                        role="dialog"
                        className="fixed inset-0 bg-[var(--standard-red)] h-screen overflow-y-auto z-50"
                    >
                        <button
                            ref={closeButtonRef}
                            aria-label="Close menu"
                            className="lg:hidden transition-colors text-white duration-100 opacity-50 hover:opacity-100 active:opacity-80 absolute top-4 right-4"
                            onClick={() => setMobileOpen(false)}
                        >
                            <svg
                                aria-hidden="true"
                                height="24"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="24"
                            >
                                <line x1="18" x2="6" y1="6" y2="18"/>
                                <line x1="6" x2="18" y1="6" y2="18"/>
                            </svg>
                        </button>

                        <GlobalFooter pages={pages}/>
                    </div>
                )}
            </header>
        </>
    )
}
