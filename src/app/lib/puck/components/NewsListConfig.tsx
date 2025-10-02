import { ComponentConfig } from '@measured/puck'
import { getPublishedContentEntities } from '@/app/studio/editor/entity-actions'
import { getUploadServePath } from '@/app/studio/media/media-actions'
import { EntityType } from '@prisma/client'
import NewsList from '@/app/lib/puck/components/NewsList'

const NewsListConfig: ComponentConfig = {
    label: '新闻列表',
    fields: {
        resolvedEntitiesInit: {
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
                resolvedEntitiesInit: await getPublishedContentEntities(0, EntityType.post),
                resolvedUploadPrefix: await getUploadServePath()
            }
        }
    },
    render: ({ resolvedEntitiesInit, resolvedUploadPrefix }) => {
        if (resolvedEntitiesInit == null) {
            return <></>
        }
        return <NewsList init={resolvedEntitiesInit} uploadPrefix={resolvedUploadPrefix}/>
    }
}

export default NewsListConfig
