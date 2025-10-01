import { getUser } from '@/app/login/login-actions'
import UserContent from '@/app/studio/users/[id]/UserContent'
import { redirect } from 'next/navigation'

export default async function StudioUserContent({ params }: {
    params: Promise<{ id: string }>
}) {
    const user = await getUser(parseInt((await params).id))
    if (user == null) {
        redirect('/studio/users')
    }
    return <UserContent user={user}/>
}
