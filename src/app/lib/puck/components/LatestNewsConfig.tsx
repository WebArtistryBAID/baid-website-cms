import { RESOLVED_CONTENT_ENTITY_TYPE } from '@/app/lib/puck/custom-fields'
import { ComponentConfig } from '@measured/puck'
import { getPublishedContentEntities } from '@/app/studio/editor/entity-actions'
import { EntityType } from '@prisma/client'
import { getUploadServePath } from '@/app/studio/media/media-actions'
import LatestNews from '@/app/lib/puck/components/LatestNews'

const LatestNewsConfig: ComponentConfig = {
    label: '最新文章',
    fields: {
        title: {
            label: '标题',
            type: 'text'
        },
        otherNewsText: {
            label: '其他文章头文字',
            type: 'text'
        },
        readMoreText: {
            label: '查看更多文字',
            type: 'text'
        },
        resolvedPosts: {
            type: 'array',
            arrayFields: RESOLVED_CONTENT_ENTITY_TYPE.objectFields,
            visible: false
        },
        uploadPrefix: {
            type: 'text',
            visible: false
        }
    },
    defaultProps: {
        title: 'BAID Stories',
        otherNewsText: '其他新闻',
        readMoreText: '了解更多'
    },
    resolveData: async ({ props }) => {
        const posts = await getPublishedContentEntities(0, EntityType.post)
        return {
            props: {
                ...props,
                uploadPrefix: await getUploadServePath(),
                resolvedPosts: posts.pages > 0 ? posts.items : []
            }
        }
    },
    render: ({ title, otherNewsText, readMoreText, resolvedPosts, uploadPrefix }) => <LatestNews
        title={title}
        otherNewsText={otherNewsText}
        readMoreText={readMoreText}
        resolvedPosts={resolvedPosts}
        uploadPrefix={uploadPrefix}
    />
}

export default LatestNewsConfig
