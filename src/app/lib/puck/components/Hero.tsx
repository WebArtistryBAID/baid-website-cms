import { Image } from '@prisma/client'
import { motion } from 'motion/react'
import { ComponentConfig } from '@measured/puck'
import { colorTypeField, imageTypeField, RESOLVED_IMAGE_TYPE } from '@/app/lib/puck/custom-fields'
import { getImage, getUploadServePath } from '@/app/studio/media/media-actions'

function Hero({ title, lightText, image, backgroundColor, uploadPrefix }: {
    title: string | undefined,
    lightText: boolean | undefined,
    image: Image | undefined,
    backgroundColor: string | undefined,
    uploadPrefix: string | undefined
}) {
    lightText = lightText ?? false
    return <>
        <section aria-labelledby="hero-heading" className="px-6 sm:px-10 md:px-16 lg:px-24"
                 style={{ backgroundColor }}>
            <motion.h1
                id="hero-heading"
                initial={{ opacity: 0, transform: 'translateY(16px)' }}
                animate={{ opacity: 1, transform: 'translateY(0)' }}
                transition={{ duration: 0.5 }}
                className="text-[3rem] md:text-[4rem] lg:text-[6rem] font-bold !font-sans text-center"
                style={{ color: lightText ? 'white' : 'black' }}>
                {title}
            </motion.h1>
        </section>

        <img src={`${uploadPrefix}/${image?.sha1}.webp`} alt={image?.altText} aria-hidden className="w-full"/>
    </>
}

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
