import UserLibrary from '@/app/studio/users/UserLibrary'
import { getUsers } from '@/app/login/login-actions'

export default async function PageUserLibrary() {
    return <div className="p-16">
        <h1 className="text-2xl mb-3">用户管理</h1>
        <UserLibrary init={await getUsers(0)}/>
    </div>
}
