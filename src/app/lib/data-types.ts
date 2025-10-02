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
        item.shortContentPublishedEN === item.shortContentDraftEN &&
        item.shortContentPublishedZH === item.shortContentDraftZH &&
        item.coverImagePublishedId === item.coverImageDraftId
    )
}

export function getURI(createdAt: Date, slug: string): string {
    const year = createdAt.getFullYear()
    const month = (createdAt.getMonth() + 1).toString().padStart(2, '0')
    const day = createdAt.getDate().toString().padStart(2, '0')
    return `/content/${year}/${month}/${day}/${slug}`
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
    shortContentPublishedEN: string | null
    shortContentPublishedZH: string | null
    shortContentDraftEN: string | null
    shortContentDraftZH: string | null
    categoryEN: string | null
    categoryZH: string | null
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
    shortContentPublishedEN: true,
    shortContentPublishedZH: true,
    shortContentDraftEN: true,
    shortContentDraftZH: true,
    slug: true,
    categoryEN: true,
    categoryZH: true,
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
    categoryEN: string | null
    categoryZH: string | null
    shortContentPublishedEN: string | null
    shortContentPublishedZH: string | null
    shortContentDraftEN: string | null
    shortContentDraftZH: string | null
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
    shortContentPublishedEN: true,
    shortContentPublishedZH: true,
    shortContentDraftEN: true,
    shortContentDraftZH: true,
    slug: true,
    categoryEN: true,
    categoryZH: true,
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
