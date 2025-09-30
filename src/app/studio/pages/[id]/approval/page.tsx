import { requireUser } from '@/app/login/login-actions'
import { getContentEntity } from '@/app/studio/editor/entity-actions'
import { redirect } from 'next/navigation'
import PageApprovalWrapper from '@/app/studio/pages/[id]/approval/PageApprovalWrapper'

export default async function StudioPageApproval({ params }: {
    params: Promise<{ id: string }>,
}) {
    await requireUser()

    const entity = await getContentEntity(parseInt((await params).id))
    if (entity == null) {
        redirect('/studio')
    }

    return <PageApprovalWrapper page={entity}/>
}
