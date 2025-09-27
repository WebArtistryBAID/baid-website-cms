import { NextRequest, NextResponse } from 'next/server'
import { unlockPost } from '@/app/studio/posts/post-actions'

export async function POST(req: NextRequest): Promise<NextResponse> {
    const data = await req.json()
    try {
        await unlockPost(data.id, new Date(data.lock))
    } finally {
    }
    return new NextResponse(null, { status: 204 })
}
