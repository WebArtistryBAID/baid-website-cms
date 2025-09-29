import { Gender, Image, Role, UserType } from '@prisma/client'

export interface Paginated<T> {
    items: T[]
    page: number
    pages: number
}

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

export interface Alignable {
    titlePublishedEN: string | null
    titlePublishedZH: string | null
    titleDraftEN: string
    titleDraftZH: string
    contentPublishedEN: string | null
    contentPublishedZH: string | null
    contentDraftEN: string
    contentDraftZH: string
    coverImagePublished: Image | null
    coverImageDraft: Image | null
    coverImagePublishedId: number | null
    coverImageDraftId: number | null
}

export function isAligned(item: Alignable) {
    return (
        item.titlePublishedEN === item.titleDraftEN &&
        item.titlePublishedZH === item.titleDraftZH &&
        item.contentPublishedEN === item.contentDraftEN &&
        item.contentPublishedZH === item.contentDraftZH &&
        item.coverImagePublishedId === item.coverImageDraftId
    )
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
    titlePublishedEN: string | null
    titlePublishedZH: string | null
    titleDraftEN: string
    titleDraftZH: string
    slug: string
    coverImagePublished: Image | null
    coverImageDraft: Image | null
    creator: SimplifiedUser
    createdAt: Date
    updatedAt: Date
}

export const SIMPLIFIED_POST_SELECT = {
    id: true,
    titlePublishedEN: true,
    titlePublishedZH: true,
    titleDraftEN: true,
    titleDraftZH: true,
    slug: true,
    coverImagePublished: true,
    coverImageDraft: true,
    creator: {
        select: SIMPLIFIED_USER_SELECT
    },
    createdAt: true,
    updatedAt: true
}

export interface HydratedPost {
    id: number
    titlePublishedEN: string | null
    titlePublishedZH: string | null
    titleDraftEN: string
    titleDraftZH: string
    slug: string
    contentPublishedEN: string | null
    contentPublishedZH: string | null
    contentDraftEN: string
    contentDraftZH: string
    coverImagePublished: Image | null
    coverImagePublishedId: number | null
    coverImageDraft: Image | null
    coverImageDraftId: number | null
    creatorId: number
    creator: SimplifiedUser,
    createdAt: Date,
    updatedAt: Date
}

export const HYDRATED_POST_SELECT = {
    id: true,
    titlePublishedEN: true,
    titlePublishedZH: true,
    titleDraftEN: true,
    titleDraftZH: true,
    slug: true,
    contentPublishedEN: true,
    contentPublishedZH: true,
    contentDraftEN: true,
    contentDraftZH: true,
    coverImagePublished: true,
    coverImagePublishedId: true,
    coverImageDraft: true,
    coverImageDraftId: true,
    creatorId: true,
    creator: {
        select: SIMPLIFIED_USER_SELECT
    },
    createdAt: true,
    updatedAt: true
}
