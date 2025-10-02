import { ComponentConfig } from '@measured/puck'
import { getPublishedProjectsByCategoriesForInit } from '@/app/studio/editor/entity-actions'
import { getUploadServePath } from '@/app/studio/media/media-actions'
import ProjectCategory from '@/app/lib/puck/components/ProjectCategory'
import { Paginated, SimplifiedContentEntity } from '@/app/lib/data-types'

const ProjectCategoryConfig: ComponentConfig = {
    label: '项目列表',
    fields: {
        resolvedProjectsInit: {
            type: 'array',
            visible: false,
            arrayFields: {}
        },
        resolvedUploadPrefix: {
            type: 'text',
            visible: false
        }
    },
    resolveData: async () => {
        return {
            props: {
                resolvedProjectsInit: await getPublishedProjectsByCategoriesForInit('zh'),
                resolvedUploadPrefix: await getUploadServePath()
            }
        }
    },
    render: ({ resolvedProjectsInit, resolvedUploadPrefix }) => {
        if (resolvedProjectsInit == null) {
            return <></>
        }
        return <>
            {resolvedProjectsInit.map((proj: { category: string, projects: Paginated<SimplifiedContentEntity> }) =>
                <ProjectCategory title={proj.category} init={proj.projects} key={proj.category}
                                 uploadPrefix={resolvedUploadPrefix}/>)}
        </>
    }
}

export default ProjectCategoryConfig
