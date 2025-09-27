import { Gender, Image, Role, UserType } from '@prisma/client'

export interface SimplifiedUser {
    id: number
    name: string
    pinyin: string
    roles: Role[]
    type: UserType
    gender: Gender
    createdAt: Date
    updatedAt: Date
}

export const SIMPLIFIED_USER_SELECT = {
    id: true,
    name: true,
    pinyin: true,
    roles: true,
    type: true,
    gender: true,
    createdAt: true,
    updatedAt: true
}

export interface SimplifiedPost {
    id: number
    titleEN: string
    titleZH: string
    slug: string
    coverImage: Image | null
    editorsApproved: number[]
    adminsApproved: number[]
    creator: SimplifiedUser
    createdAt: Date
    updatedAt: Date
}

export const SIMPLIFIED_POST_SELECT = {
    id: true,
    titleEN: true,
    titleZH: true,
    slug: true,
    coverImage: true,
    editorsApproved: true,
    adminsApproved: true,
    creator: {
        select: SIMPLIFIED_USER_SELECT
    },
    createdAt: true,
    updatedAt: true
}
