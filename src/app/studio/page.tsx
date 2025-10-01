import StudioHome from '@/app/studio/StudioHome'
import { getRecentEntities } from '@/app/studio/editor/entity-actions'
import { EntityType } from '@prisma/client'

export default async function PageStudio() {
    return <div className="p-16">
        <StudioHome pages={await getRecentEntities(EntityType.page)} posts={await getRecentEntities(EntityType.post)}
                    uploadServePath={process.env.UPLOAD_SERVE_PATH!}/>
    </div>
}
