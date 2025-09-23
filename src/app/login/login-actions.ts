'use server'

import { PrismaClient, User, UserAuditLogType } from '@prisma/client'
import { me } from '@/app/login/login'
import { decodeJwt } from 'jose'
import Paginated from '@/app/lib/Paginated'

const prisma = new PrismaClient()

export async function getLoginTarget(redirect: string): Promise<string> {
    // We are really abusing state here... But it works.
    return `${process.env.ONELOGIN_HOST}/oauth2/authorize?client_id=${process.env.ONELOGIN_CLIENT_ID}&redirect_uri=${process.env.HOST}/login/authorize&scope=basic+phone+sms&response_type=code&state=${redirect}`
}

export async function requireUser(): Promise<User> {
    const user = await getMyUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user
}

export async function requireUserPermission(permission: string): Promise<User> {
    const user = await requireUser()
    if (!user.permissions.includes(permission)) {
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
    await requireUserPermission('admin.manage')
    return prisma.user.findUnique({
        where: { id }
    })
}

export async function toggleUserPermission(id: number, permission: string): Promise<void> {
    const me = await requireUserPermission('admin.manage')
    const user = await prisma.user.findUnique({
        where: { id }
    })
    if (!user) {
        return
    }
    if (user.permissions.includes(permission)) {
        await prisma.user.update({
            where: { id },
            data: {
                permissions: {
                    set: user.permissions.filter(p => p !== permission)
                }
            }
        })
        await prisma.userAuditLog.create({
            data: {
                type: UserAuditLogType.permissionsUpdated,
                user: {
                    connect: {
                        id: me.id
                    }
                },
                values: [ user.id.toString(), `-${permission}` ]
            }
        })
    } else {
        await prisma.user.update({
            where: { id },
            data: {
                permissions: {
                    set: [ ...user.permissions, permission ]
                }
            }
        })
        await prisma.userAuditLog.create({
            data: {
                type: UserAuditLogType.permissionsUpdated,
                user: {
                    connect: {
                        id: me.id
                    }
                },
                values: [ user.id.toString(), `+${permission}` ]
            }
        })
    }
}

export async function getUsers(page: number, keyword: string): Promise<Paginated<User>> {
    await requireUserPermission('admin.manage')
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

export async function getAccessToken(): Promise<string | null> {
    const user = await prisma.user.findUnique({
        where: {
            id: await me() ?? -1
        },
        include: {
            oaTokens: true
        }
    })
    if (!user) {
        return null
    }
    const access = user.oaTokens!.accessToken
    const refresh = user.oaTokens!.refreshToken
    // Check if token has expired, if so refresh
    const decoded = decodeJwt(access)
    if (decoded.exp! * 1000 < Date.now()) {
        const response = await fetch(`${process.env.ONELOGIN_HOST}/oauth2/token`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.ONELOGIN_CLIENT_ID}:${process.env.ONELOGIN_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refresh
            }).toString()
        })
        const json = await response.json()
        if ('error' in json) {
            return null
        }
        await prisma.oATokens.update({
            where: {
                userId: user.id
            },
            data: {
                accessToken: json['access_token'],
                refreshToken: json['refresh_token']
            }
        })
        return json['access_token']
    }
    return access
}
