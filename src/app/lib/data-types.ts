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
    coverImageDraft: Image
    coverImageIdPublished: number | null
    coverImageIdDraft: number
}

export function isAligned(item: Alignable) {
    return (
        item.titlePublishedEN === item.titleDraftEN &&
        item.titlePublishedZH === item.titleDraftZH &&
        item.contentPublishedEN === item.contentDraftEN &&
        item.contentPublishedZH === item.contentDraftZH &&
        ((item.coverImagePublished === null && item.coverImageDraft === null) ||
            (item.coverImagePublished !== null &&
                item.coverImageDraft !== null &&
                item.coverImageIdPublished === item.coverImageIdDraft))
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
    titleEN: string
    titleZH: string
    slug: string
    coverImage: Image | null
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
    coverImagePublishedId: number
    coverImageDraft: Image | null
    coverImageDraftId: number
    creatorId: number
    creator: SimplifiedUser,
    createdAt: Date,
    updatedAt: Date
}

export const HYDRATED_POST_SELECT = {
    id: true,
    titlePublishedEN: true,
    titlePublishedZH: true
}
