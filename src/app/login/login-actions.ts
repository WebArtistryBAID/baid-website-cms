'use server'

import { PrismaClient, Role, User } from '@prisma/client'
import { me } from '@/app/login/login'
import Paginated from '@/app/lib/Paginated'

const prisma = new PrismaClient()

export async function getLoginTarget(redirect: string): Promise<string> {
    // We are really abusing state here... But it works.
    return `${process.env.ONELOGIN_HOST}/oauth2/authorize?client_id=${process.env.ONELOGIN_CLIENT_ID}&redirect_uri=${process.env.HOST}/login/authorize&scope=basic+phone&response_type=code&state=${redirect}`
}

export async function requireUser(): Promise<User> {
    const user = await getMyUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}

export async function requireUserWithRole(role: Role): Promise<User> {
    const user = await requireUser()
    if (!user.roles.includes(role)) {
        throw new Error('Unauthorized')
    }
    return user
}

export async function getMyUser(): Promise<User | null> {
    return prisma.user.findUnique({
        where: { id: await me() ?? -1 }
    })
}

export async function getUser(id: number): Promise<User | null> {
    await requireUserWithRole(Role.admin)
    return prisma.user.findUnique({
        where: { id }
    })
}

export async function getUsers(page: number, keyword: string): Promise<Paginated<User>> {
    await requireUserWithRole(Role.admin)
    const pages = Math.ceil(await prisma.user.count({
        where: {
            OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { pinyin: { contains: keyword, mode: 'insensitive' } }
            ]
        }
    }) / 10)
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { pinyin: { contains: keyword, mode: 'insensitive' } }
            ]
        },
        orderBy: {
            pinyin: 'asc'
        },
        skip: page * 10,
        take: 10
    })
    return {
        items: users,
        page,
        pages
    }
}
