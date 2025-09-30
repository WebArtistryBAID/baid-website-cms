import ContentEntityLibrary from '@/app/studio/editor/ContentEntityLibrary'
import { getContentEntities } from '@/app/studio/editor/entity-actions'
import { EntityType } from '@prisma/client'

export default async function PageClubsLibrary() {
    return <div className="p-16">
        <h1 className="text-2xl mb-3">社团</h1>
        <ContentEntityLibrary init={await getContentEntities(0, EntityType.club)} title="社团" type={EntityType.club}/>
    </div>
}
