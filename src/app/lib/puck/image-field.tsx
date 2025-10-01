import MediaPickerPuck from '@/app/lib/puck/MediaPickerPuck'
import { Field } from '@measured/puck'

export const RESOLVED_IMAGE_TYPE: Field = {
    type: 'object',
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

export function imageTypeField(label: string | undefined = undefined): Field {
    return {
        type: 'custom',
        label,
        render: ({ name, onChange, value }) =>
            <MediaPickerPuck name={label ?? name} onChange={onChange} value={value}/>
    }
}
