import { acquireLock } from '@/app/lib/lock/lock-actions'
import { EntityType } from '@prisma/client'
import LockOverridePrompt from '@/app/lib/lock/LockOverridePrompt'
import { ReactNode } from 'react'

export async function tryAcquireLock({ entityType, entityId, userId, currentToken, returnUri }: {
    entityType: EntityType,
    entityId: number,
    userId: number,
    currentToken: string | undefined,
    returnUri: string
}): Promise<ReactNode | string> {
    const thisToken = await acquireLock({
        entityType,
        entityId,
        userId,
        currentToken
    })
    if (thisToken == null) {
        return <LockOverridePrompt entityType={entityType} entityId={entityId} userId={userId}
                                   returnUri={returnUri}/>
    }
    return thisToken.token
}
