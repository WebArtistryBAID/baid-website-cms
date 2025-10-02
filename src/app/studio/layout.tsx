'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Role, User } from '@prisma/client'
import { getMyUser } from '@/app/login/login-actions'
import {
    Badge,
    Sidebar,
    SidebarCollapse,
    SidebarItem,
    SidebarItemGroup,
    SidebarItems,
    SidebarLogo
} from 'flowbite-react'
import Link from 'next/link'
import { HiUser } from 'react-icons/hi'
import { ROLES_TRANSLATIONS } from '@/app/lib/common-translations'
import {
    HiBookmarkSquare,
    HiChartPie,
    HiNewspaper,
    HiPencil,
    HiPhoto,
    HiPresentationChartBar,
    HiPuzzlePiece,
    HiShare,
    HiStar,
    HiUsers
} from 'react-icons/hi2'
import If from '@/app/lib/If'
import { usePathname } from 'next/navigation'

export default function StudioLayout({ children }: { children: ReactNode }) {
    const pathName = usePathname()
    const [ myUser, setMyUser ] = useState<User>()
    useEffect(() => {
        (async () => {
            setMyUser((await getMyUser())!)
        })()
    }, [])

    return <>
        <div
            className="sm:hidden absolute w-screen h-screen z-50 top-0 left-0 bg-white dark:bg-gray-700 p-5 flex justify-center items-center flex-col">
            <p className="text-center">请在大屏幕设备上使用 Helium Studio。</p>
        </div>

        <div className="h-screen flex">
            <If condition={!pathName.includes('preview') && !(pathName.includes('pages') && pathName.includes('editor'))}>
                <div className="h-screen">
                    <Sidebar className="h-full relative">
                        <SidebarLogo href="/" img="/assets/icon.png"><span
                            className="font-display">Helium</span></SidebarLogo>
                        <SidebarItems>
                            <SidebarItemGroup>
                                <SidebarItem as={Link} href="/studio" icon={HiChartPie}>
                                    主页
                                </SidebarItem>
                                <SidebarItem as={Link} href="/studio/pages" icon={HiBookmarkSquare}>
                                    页面
                                </SidebarItem>
                                <SidebarItem as={Link} href="/studio/media" icon={HiPhoto}>
                                    媒体库
                                </SidebarItem>
                                <SidebarCollapse label="内容" icon={HiShare}>
                                    <SidebarItem as={Link} href="/studio/posts" icon={HiNewspaper}>
                                        文章
                                    </SidebarItem>

                                    <SidebarItem as={Link} href="/studio/clubs" icon={HiPuzzlePiece}>
                                        社团
                                    </SidebarItem>

                                    <SidebarItem as={Link} href="/studio/activities" icon={HiStar}>
                                        校园活动
                                    </SidebarItem>

                                    <SidebarItem as={Link} href="/studio/projects" icon={HiPresentationChartBar}>
                                        自主项目
                                    </SidebarItem>

                                    <SidebarItem as={Link} href="/studio/courses" icon={HiPencil}>
                                        课程介绍
                                    </SidebarItem>

                                    <SidebarItem as={Link} href="/studio/faculties" icon={HiUser}>
                                        教职工介绍
                                    </SidebarItem>
                                </SidebarCollapse>
                                <If condition={myUser?.roles.includes(Role.admin)}>
                                    <SidebarItem as={Link} href="/studio/users" icon={HiUsers}>
                                        用户管理
                                    </SidebarItem>
                                </If>
                            </SidebarItemGroup>
                        </SidebarItems>
                        <div className="mr-3 mb-3 absolute bottom-0">
                            <Link href="/studio/"
                                  className="flex items-center gap-3 rounded-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-100">
                                <Badge icon={HiUser}/>
                                <div>
                                    <p className="font-bold font-display text-sm">{myUser?.name ?? '...'}</p>
                                    <p className="secondary text-xs">{myUser?.roles.map(s => ROLES_TRANSLATIONS[s]).join(' / ')}</p>
                                </div>
                            </Link>
                        </div>
                    </Sidebar>
                </div>
            </If>
            <div className="flex-grow h-screen max-h-screen overflow-y-auto" style={{ overflowY: 'auto' }}>
                {children}
            </div>
        </div>
    </>
}
