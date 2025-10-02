import { ReactNode } from 'react'
import { ComponentConfig } from '@measured/puck'
import { colorTypeField } from '@/app/lib/puck/custom-fields'

function Container({ ml, mr, mt, mb, pl, pr, pt, pb, contentWidth, backgroundColor, children }:
                   {
                       ml?: string,
                       mr?: string,
                       mt?: string,
                       mb?: string,
                       pl?: string,
                       pr?: string,
                       pt?: string,
                       pb?: string,
                       contentWidth?: boolean,
                       backgroundColor?: string,
                       children: ReactNode
                   }) {
    return <div className={contentWidth ? 'container' : ''}
                style={{
                    marginLeft: ml,
                    marginRight: mr,
                    marginTop: mt,
                    marginBottom: mb,
                    paddingLeft: pl,
                    paddingRight: pr,
                    paddingTop: pt,
                    paddingBottom: pb,
                    backgroundColor
                }}>
        {children}
    </div>
}

const ContainerConfig: ComponentConfig = {
    label: '容器',
    fields: {
        contentWidth: {
            label: '使用内容宽度',
            type: 'radio',
            options: [
                { label: '启用', value: true },
                { label: '关闭', value: false }
            ]
        },
        ml: {
            label: '左外边距',
            type: 'text'
        },
        mr: {
            label: '右外边距',
            type: 'text'
        },
        mt: {
            label: '上外边距',
            type: 'text'
        },
        mb: {
            label: '下外边距',
            type: 'text'
        },
        pl: {
            label: '左内边距',
            type: 'text'
        },
        pr: {
            label: '右内边距',
            type: 'text'
        },
        pt: {
            label: '上内边距',
            type: 'text'
        },
        pb: {
            label: '下内边距',
            type: 'text'
        },
        backgroundColor: colorTypeField('背景颜色'),
        children: {
            type: 'slot'
        }
    },
    defaultProps: {
        contentWidth: true
    },
    render: ({ ml, mr, mt, mb, pl, pr, pt, pb, contentWidth, backgroundColor, children: Children }) =>
        <Container ml={ml} mr={mr} mt={mt} mb={mb} pl={pl} pr={pr} pt={pt} pb={pb}
                   backgroundColor={backgroundColor} contentWidth={contentWidth}>
            <Children/>
        </Container>
}

export default ContainerConfig
