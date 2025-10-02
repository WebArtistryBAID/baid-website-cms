import { ComponentConfig } from '@measured/puck'
import { imageTypeField, RESOLVED_CONTENT_ENTITY_TYPE, RESOLVED_IMAGE_TYPE } from '@/app/lib/puck/custom-fields'
import { getImage, getUploadServePath } from '@/app/studio/media/media-actions'
import InFocusProjects from '@/app/lib/puck/components/InFocusProjects'
import { SimplifiedContentEntity } from '@/app/lib/data-types'
import { getContentEntity, getPublishedContentEntities } from '@/app/studio/editor/entity-actions'
import { EntityType } from '@prisma/client'

// Because InFocusProjects is a client component, we must separate its configuration
export interface InFocusProject {
    project: SimplifiedContentEntity | undefined
    discipline: string | undefined
    description: string | undefined // Contains <1></1> for highlight span
    linkText: string | undefined
}

export const InFocusProjectsConfig: ComponentConfig = {
    label: '自主项目',
    fields: {
        heroBg: imageTypeField('背景图片'),
        inFocusTitle: {
            label: '焦点标题',
            type: 'text',
            contentEditable: true
        },
        title: {
            label: '标题',
            type: 'text',
            contentEditable: true
        },
        description: {
            label: '描述',
            type: 'textarea',
            contentEditable: true
        },
        link: {
            label: '链接',
            type: 'text'
        },
        linkText: {
            label: '链接文字',
            type: 'text',
            contentEditable: true
        },
        projects: {
            label: '项目',
            type: 'array',
            arrayFields: {
                project: {
                    label: '项目',
                    type: 'external',
                    fetchList: async ({ query }) => {
                        if (!query) {
                            return (await getPublishedContentEntities(0, EntityType.project)).items.map(project => ({
                                id: project.id,
                                title: project.titlePublishedZH ?? '(无标题)'
                            }))
                        }
                        return (await getPublishedContentEntities(0, EntityType.project, query)).items.map(project => ({
                            id: project.id,
                            title: project.titlePublishedZH ?? '(无标题)'
                        }))
                    },
                    placeholder: '选择',
                    showSearch: true
                },
                discipline: {
                    label: '学科',
                    type: 'text',
                    contentEditable: true
                },
                description: {
                    label: '介绍',
                    type: 'textarea',
                    contentEditable: true
                },
                linkText: {
                    label: '链接文字',
                    type: 'text',
                    contentEditable: true
                }
            },
            max: 6
        },
        startTopText: {
            label: '收尾标题',
            type: 'text',
            contentEditable: true
        },
        startMainText: {
            label: '收尾文字',
            type: 'textarea',
            contentEditable: true
        },
        resolvedHeroBg: RESOLVED_IMAGE_TYPE,
        resolvedProjects: {
            type: 'array',
            visible: false,
            arrayFields: {
                project: RESOLVED_CONTENT_ENTITY_TYPE,
                discipline: { type: 'text' },
                description: { type: 'text' },
                linkText: { type: 'text' }
            }
        },
        resolvedUploadPrefix: {
            type: 'text',
            visible: false
        }
    },
    defaultProps: {
        inFocusTitle: 'In Focus',
        title: '世界因我更美好',
        description: '在北京中学，我们优秀的学生和敬业的教师踏上发现、探索和成长的旅程，在每一步中改变世界，让世界因我们而更加美好。',
        link: '/projects',
        linkText: '了解我们的学生如何改变世界',
        startTopText: '每一个脚步都算数',
        startMainText: '我们正让世界因我们而更美好。'
    },
    resolveData: async ({ props }) => {
        return {
            props: {
                resolvedHeroBg: props.heroBg == null ? null : await getImage(parseInt(props.heroBg)),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resolvedProjects: await Promise.all((props.projects ?? []).map(async (item: any) => {
                    if (!item?.project?.id) return null
                    return {
                        project: await getContentEntity(item.project.id),
                        discipline: item.discipline,
                        description: item.description,
                        linkText: item.linkText
                    }
                })),
                resolvedUploadPrefix: await getUploadServePath()
            }
        }
    },
    render: ({
                 resolvedHeroBg,
                 inFocusTitle,
                 title,
                 description,
                 link,
                 linkText,
                 startTopText,
                 startMainText,
                 resolvedProjects,
                 resolvedUploadPrefix
             }) =>
        <InFocusProjects heroBg={resolvedHeroBg} inFocusTitle={inFocusTitle} title={title} description={description}
                         link={link} linkText={linkText} startTopText={startTopText} startMainText={startMainText}
                         resolvedProjects={resolvedProjects} uploadPrefix={resolvedUploadPrefix}/>
}
