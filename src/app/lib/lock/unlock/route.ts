import { NextRequest, NextResponse } from 'next/server'
import { releaseLock } from '@/app/lib/lock/lock-actions'

export async function POST(req: NextRequest): Promise<NextResponse> {
    const data = await req.json()
    try {
        await releaseLock({
            entityType: data.entityType,
            entityId: data.entityId,
            userId: data.userId,
            token: data.token
        })
    } finally {
    }
    return new NextResponse(null, { status: 204 })
}
