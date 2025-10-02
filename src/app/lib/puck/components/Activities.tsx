import { EntityType, Image } from '@prisma/client'
import { HydratedContentEntity } from '@/app/lib/data-types'
import { ComponentConfig } from '@measured/puck'
import { getContentEntity, getPublishedContentEntities } from '@/app/studio/editor/entity-actions'
import { RESOLVED_CONTENT_ENTITY_TYPE } from '@/app/lib/puck/custom-fields'
import { getUploadServePath } from '@/app/studio/media/media-actions'

function ActivityTextBlock({ name, description, background, light }: {
    name: string,
    description: string,
    background: string,
    light: boolean
}) {
    return <section
        style={{
            background: background,
            color: light ? 'white' : 'black'
        }} className="w-full h-80 p-8" aria-labelledby="activity-heading" role="region">
        <h3 id="activity-heading" className="text-xl mb-3 font-bold">
            {name}
        </h3>
        <p className="no-size text-sm" tabIndex={0}>{description}</p>
    </section>
}

function ActivityBlock({ name, description, image, background, light, textAlign, uploadPrefix }: {
    name: string,
    description: string,
    image: Image | undefined,
    background: string,
    light: boolean,
    textAlign: 'left' | 'right',
    uploadPrefix: string | undefined
}) {
    return <section aria-label="`Activity: ${name}`" role="region">
        <div className="hidden sm:grid grid-cols-2">
            {textAlign === 'left' &&
                <ActivityTextBlock background={background} description={description} light={light} name={name}/>}
            <img alt={image?.altText} src={`${uploadPrefix}/${image?.sha1}.webp`}
                 className="w-full h-80 object-cover object-center"/>
            {textAlign === 'right' &&
                <ActivityTextBlock background={background} description={description} light={light} name={name}/>}
        </div>

        <div className="block sm:hidden">
            <img alt={image?.altText} src={`${uploadPrefix}/${image?.sha1}.webp`}
                 className="w-full h-48 object-cover object-center"/>
            <ActivityTextBlock background={background} description={description} light={light} name={name}/>
        </div>
    </section>
}

function Activities({ title, resolvedActivities, uploadPrefix }: {
    title: string | undefined,
    resolvedActivities: ({ activity: HydratedContentEntity } | undefined)[] | undefined,
    uploadPrefix: string | undefined
}) {
    const activities = resolvedActivities?.map(a => a?.activity).filter(a => a !== undefined) ?? [] as HydratedContentEntity[]
    return <section aria-labelledby="activities-heading" className="section container">
        <div className="flex justify-end">
            <h2 id="activities-heading" className="text-4xl font-bold mb-5">
                {title}
            </h2>
        </div>
        <div aria-label="Activities"
             className="sm:grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-xl rounded-3xl overflow-clip" role="list">
            {activities?.length > 0 && <ActivityBlock
                name={activities[0]!.titlePublishedZH ?? ''}
                description={activities[0]!.shortContentPublishedZH ?? ''}
                image={activities[0]!.coverImagePublished ?? undefined}
                background="var(--standard-blue)"
                light={true}
                textAlign="right"
                uploadPrefix={uploadPrefix}/>}
            {activities?.length > 1 && <ActivityBlock
                name={activities[1]!.titlePublishedZH ?? ''}
                description={activities[1]!.shortContentPublishedZH ?? ''}
                image={activities[1]!.coverImagePublished ?? undefined}
                background="var(--standard-red)"
                light={true}
                textAlign="right"
                uploadPrefix={uploadPrefix}/>}
            {activities?.length > 2 && <ActivityBlock
                name={activities[2]!.titlePublishedZH ?? ''}
                description={activities[2]!.shortContentPublishedZH ?? ''}
                image={activities[2]!.coverImagePublished ?? undefined}
                background="var(--standard-red)"
                light={true}
                textAlign="left"
                uploadPrefix={uploadPrefix}/>}
            {activities?.length > 3 && <ActivityBlock
                name={activities[3]!.titlePublishedZH ?? ''}
                description={activities[3]!.shortContentPublishedZH ?? ''}
                image={activities[3]!.coverImagePublished ?? undefined}
                background="#d3d3d3"
                light={false}
                textAlign="left"
                uploadPrefix={uploadPrefix}/>}
            {activities?.length > 4 && <ActivityBlock
                name={activities[4]!.titlePublishedZH ?? ''}
                description={activities[4]!.shortContentPublishedZH ?? ''}
                image={activities[4]!.coverImagePublished ?? undefined}
                background="var(--standard-blue)"
                light={true}
                textAlign="right"
                uploadPrefix={uploadPrefix}/>}
            {activities?.length > 5 && <ActivityBlock
                name={activities[5]!.titlePublishedZH ?? ''}
                description={activities[5]!.shortContentPublishedZH ?? ''}
                image={activities[5]!.coverImagePublished ?? undefined}
                background="var(--standard-red)"
                light={true}
                textAlign="right"
                uploadPrefix={uploadPrefix}/>}
        </div>
    </section>
}

const ActivitiesConfig: ComponentConfig = {
    label: '校园活动',
    fields: {
        title: {
            label: '标题',
            type: 'text',
            contentEditable: true
        },
        activities: {
            label: '活动',
            type: 'array',
            arrayFields: {
                activity: {
                    label: '活动',
                    type: 'external',
                    fetchList: async ({ query }) => {
                        if (!query) {
                            return (await getPublishedContentEntities(0, EntityType.activity)).items.map(project => ({
                                id: project.id,
                                title: project.titlePublishedZH ?? '(无标题)'
                            }))
                        }
                        return (await getPublishedContentEntities(0, EntityType.activity, query)).items.map(project => ({
                            id: project.id,
                            title: project.titlePublishedZH ?? '(无标题)'
                        }))
                    },
                    placeholder: '选择',
                    showSearch: true
                }
            },
            max: 6
        },
        resolvedActivities: {
            type: 'array',
            visible: false,
            arrayFields: {
                activity: RESOLVED_CONTENT_ENTITY_TYPE
            }
        },
        resolvedUploadPrefix: {
            type: 'text',
            visible: false
        }
    },
    defaultProps: {
        title: '校园活动'
    },
    resolveData: async ({ props }) => {
        return {
            props: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resolvedActivities: await Promise.all((props.activities ?? []).map(async (item: any) => {
                    if (!item?.activity?.id) return null
                    return {
                        activity: await getContentEntity(item.activity.id)
                    }
                })),
                resolvedUploadPrefix: await getUploadServePath()
            }
        }
    },
    render: ({ title, resolvedActivities, resolvedUploadPrefix }) =>
        <Activities title={title} resolvedActivities={resolvedActivities} uploadPrefix={resolvedUploadPrefix}/>
}

export default ActivitiesConfig
