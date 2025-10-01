import MediaPickerPuck from '@/app/lib/puck/MediaPickerPuck'
import { Field, ObjectField } from '@measured/puck'

export const RESOLVED_IMAGE_TYPE: ObjectField = {
    type: 'object',
    visible: false,
    objectFields: {
        id: {
            type: 'number'
        },
        sha1: {
            type: 'text'
        },
        name: {
            type: 'text'
        },
        altText: {
            type: 'text'
        }
    }
}

export const RESOLVED_USER_TYPE: ObjectField = {
    type: 'object',
    visible: false,
    objectFields: {
        id: {
            type: 'number'
        },
        name: {
            type: 'text'
        },
        pinyin: {
            type: 'text'
        }
    }
}

export const RESOLVED_CONTENT_ENTITY_TYPE: ObjectField = {
    type: 'object',
    visible: false,
    objectFields: {
        id: {
            type: 'number'
        },
        type: {
            type: 'text'
        },
        titlePublishedEN: {
            type: 'text'
        },
        titlePublishedZH: {
            type: 'text'
        },
        titleDraftEN: {
            type: 'text'
        },
        titleDraftZH: {
            type: 'text'
        },
        slug: {
            type: 'text'
        },
        coverImagePublished: RESOLVED_IMAGE_TYPE,
        coverImageDraft: RESOLVED_IMAGE_TYPE
    }
}

export function imageTypeField(label: string | undefined = undefined): Field {
    return {
        type: 'custom',
        label,
        render: ({ name, onChange, value }) =>
            <MediaPickerPuck name={label ?? name} onChange={onChange} value={value}/>
    }
}
