import MediaPickerPuck from '@/app/lib/components/MediaPickerPuck'
import { Field } from '@measured/puck'

export default function imageTypeField(label: string | undefined = undefined): Field {
    return {
        type: 'custom',
        label,
        render: ({ name, onChange, value }) =>
            <MediaPickerPuck name={label ?? name} onChange={onChange} value={value}/>
    }
}
