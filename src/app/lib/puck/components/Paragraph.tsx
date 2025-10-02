import { ComponentConfig } from '@measured/puck'
import { colorTypeField } from '@/app/lib/puck/custom-fields'
import { Property } from 'csstype'
import TextAlign = Property.TextAlign

function Paragraph({ text, size, color, align }: { text: string, size: string, color: string, align: string }) {
    return <p className={`text-${size}`} style={{ color, textAlign: align as (TextAlign | undefined) }}>{text}</p>
}

const ParagraphConfig: ComponentConfig = {
    label: '段落',
    fields: {
        text: {
            label: '文字',
            type: 'text',
            contentEditable: true
        },
        size: {
            label: '大小',
            type: 'select',
            options: [
                { label: '小', value: 'sm' },
                { label: '中', value: 'base' },
                { label: '大', value: 'lg' },
                { label: '2x 大', value: 'xl' },
                { label: '3x 大', value: '2xl' },
                { label: '4x 大', value: '3xl' },
                { label: '5x 大', value: '4xl' },
                { label: '6x 大', value: '5xl' },
                { label: '7x 大', value: '6xl' },
                { label: '8x 大', value: '7xl' }
            ]
        },
        align: {
            label: '对齐',
            type: 'select',
            options: [
                { label: '左对齐', value: 'left' },
                { label: '居中', value: 'center' },
                { label: '右对齐', value: 'right' },
                { label: '两端对齐', value: 'justify' }
            ]
        },
        color: colorTypeField('颜色')
    },
    defaultProps: {
        size: 'base',
        align: 'left',
        color: '#000000'
    },
    render: ({ text, size, align, color }) => <Paragraph text={text} size={size} align={align} color={color}/>
}

export default ParagraphConfig
