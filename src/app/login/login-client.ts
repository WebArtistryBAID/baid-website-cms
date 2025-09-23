import { Gender, User, UserType } from '@prisma/client'
import { useCookies } from 'react-cookie'
import { decodeJwt } from 'jose'

export function useCachedUser(): User | null {
    // The API checks for valid JWT tokens, so we can safely use the token information for frontend
    const [ cookies ] = useCookies()
    if (!cookies.access_token) {
        return null
    }
    const data = decodeJwt(cookies.access_token)
    return {
        id: data.id as number,
        name: data.name as string,
        phone: data.phone as string,
        pinyin: data.pinyin as string,
        permissions: data.permissions as string[],
        type: data.userType as UserType,
        gender: data.gender as Gender,
        blocked: data.blocked as boolean,
        balance: data.balance as string,
        points: data.points as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        inboxNotifications: [],
        smsNotifications: []
    }
}
