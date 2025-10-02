import { ContentEntity, EntityType, Gender, Image, Role, UserType } from '@prisma/client'

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

export function isAligned(item: ContentEntity) {
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

export interface SimplifiedContentEntity {
    id: number
    type: EntityType
    titlePublishedEN: string | null
    titlePublishedZH: string | null
    titleDraftEN: string
    titleDraftZH: string
    slug: string
    category: string
    coverImagePublished: Image | null
    coverImageDraft: Image | null
    creator: SimplifiedUser
    createdAt: Date
    updatedAt: Date
}

export const SIMPLIFIED_CONTENT_ENTITY_SELECT = {
    id: true,
    type: true,
    titlePublishedEN: true,
    titlePublishedZH: true,
    titleDraftEN: true,
    titleDraftZH: true,
    slug: true,
    category: true,
    coverImagePublished: true,
    coverImageDraft: true,
    creator: {
        select: SIMPLIFIED_USER_SELECT
    },
    createdAt: true,
    updatedAt: true
}

export interface HydratedContentEntity {
    id: number
    type: EntityType
    titlePublishedEN: string | null
    titlePublishedZH: string | null
    titleDraftEN: string
    titleDraftZH: string
    slug: string
    category: string
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

export const HYDRATED_CONTENT_ENTITY_SELECT = {
    id: true,
    type: true,
    titlePublishedEN: true,
    titlePublishedZH: true,
    titleDraftEN: true,
    titleDraftZH: true,
    slug: true,
    category: true,
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
