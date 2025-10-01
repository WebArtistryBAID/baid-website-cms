'use client'

import { Paginated } from '@/app/lib/data-types'
import { useEffect, useState } from 'react'
import { Pagination } from 'flowbite-react'
import Link from 'next/link'
import { User } from '@prisma/client'
import { getUsers } from '@/app/login/login-actions'
import { ROLES_TRANSLATIONS } from '@/app/lib/common-translations'

export default function UserLibrary({ init }: { init: Paginated<User> }) {
    const [ page, setPage ] = useState<Paginated<User>>(init)
    const [ currentPage, setCurrentPage ] = useState(0)

    useEffect(() => {
        (async () => {
            if (page.page !== currentPage) {
                setPage(await getUsers(currentPage))
            }
        })()
    }, [ currentPage, page.page ])

    return <div className="p-8">
        <div className="grid grid-cols-3 2xl:grid-cols-4 gap-4 mb-3">
            {page.items.map(user => <Link href={`/studio/users/${user.id}`}
                                          className="block rounded-3xl bg-gray-50 hover:bg-gray-100 hover:shadow-lg transition-all duration-100 p-8"
                                          key={user.id}>
                <p className="text-xl font-bold mb-1">{user.name}</p>
                <p className="text-sm secondary">{user.pinyin} · {user.roles.map(r => ROLES_TRANSLATIONS[r]).join(' / ')}</p>
            </Link>)}
        </div>
        <Pagination currentPage={currentPage + 1} onPageChange={p => setCurrentPage(p - 1)}
                    totalPages={page.pages}/>
    </div>
}
