import * as fs from 'fs/promises'
import path from 'node:path'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import crypto from 'crypto'
import { requireUser } from '@/app/login/login-actions'

function getPath(relative: string): string {
    return path.join(process.env.UPLOAD_PATH!, relative)
}

export async function POST(req: NextRequest): Promise<Response> {
    try {
        await fs.access(process.env.UPLOAD_PATH!)
    } catch {
        await fs.mkdir(process.env.UPLOAD_PATH!, { recursive: true })
    }
    await requireUser()
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (file == null) {
        return NextResponse.error()
    }
    if (!file.type.includes('image/')) {
        return NextResponse.error()
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const webpBuffer = await sharp(fileBuffer).webp().toBuffer()
    const hash = crypto.createHash('sha1').update(webpBuffer).digest('hex')
    const outputPath = getPath(hash + '.webp')

    await fs.writeFile(outputPath, webpBuffer)

    return NextResponse.json({ hash })
}
