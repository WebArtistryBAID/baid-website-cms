import ContentEntityLibrary from '@/app/studio/editor/ContentEntityLibrary'
import { getContentEntities } from '@/app/studio/editor/entity-actions'
import { EntityType } from '@prisma/client'

export default async function PageProjectsLibrary() {
    return <div className="p-16">
        <h1 className="text-2xl mb-3">教职工介绍</h1>
        <ContentEntityLibrary init={await getContentEntities(0, EntityType.faculty)} title="教职工"
                              type={EntityType.faculty}/>
    </div>
}
