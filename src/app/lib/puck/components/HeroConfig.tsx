import { ComponentConfig } from '@measured/puck'
import { colorTypeField, imageTypeField, RESOLVED_IMAGE_TYPE } from '@/app/lib/puck/custom-fields'
import { getImage, getUploadServePath } from '@/app/studio/media/media-actions'
import Hero from '@/app/lib/puck/components/Hero'

const HeroConfig: ComponentConfig = {
    label: '基础首屏',
    fields: {
        title: {
            label: '标题',
            type: 'text',
            contentEditable: true
        },
        image: imageTypeField('图片'),
        backgroundColor: colorTypeField('背景颜色'),
        lightText: {
            label: '浅色文字',
            type: 'radio',
            options: [
                { label: '启用', value: true },
                { label: '关闭', value: false }
            ]
        },
        resolvedImage: RESOLVED_IMAGE_TYPE,
        resolvedUploadPrefix: {
            type: 'text',
            visible: false
        }
    },
    resolveData: async ({ props }) => {
        return {
            props: {
                ...props,
                resolvedImage: props.image != null ? await getImage(parseInt(props.image)) : null,
                resolvedUploadPrefix: await getUploadServePath()
            }
        }
    },
    defaultProps: {
        title: 'About Us',
        backgroundColor: '#ffffff',
        lightText: false
    },
    render: ({ title, lightText, resolvedImage, backgroundColor, resolvedUploadPrefix }) =>
        <Hero title={title} lightText={lightText} image={resolvedImage} backgroundColor={backgroundColor}
              uploadPrefix={resolvedUploadPrefix}/>
}

export default HeroConfig
