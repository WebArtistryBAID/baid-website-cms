'use client'

import { useRouter } from 'next/navigation'
import { Button } from 'flowbite-react'
import If from '@/app/lib/If'

export default function PreviewToolbar({ pageId, currentLang, isAdmin }: {
    pageId: number,
    currentLang: 'zh' | 'en',
    isAdmin: boolean
}) {
    const router = useRouter()

    return <div className="w-full bg-gray-50 flex items-center gap-3 px-4 py-2">
        <p className="mr-auto">您正在查看页面预览。</p>
        <Button color="alternative" pill onClick={() => {
            router.push(`/studio/pages/${pageId}/preview?lang=${currentLang === 'zh' ? 'en' : 'zh'}`)
        }}>
            <If condition={currentLang === 'zh'}>切换至英文</If>
            <If condition={currentLang === 'en'}>切换至中文</If>
        </Button>
        <If condition={isAdmin}>
            <Button color="blue" pill onClick={() => router.push(`/studio/pages/${pageId}/approval`)}>继续审核</Button>
        </If>
        <If condition={!isAdmin}>
            <Button color="blue" pill onClick={() => router.push(`/studio/pages/${pageId}/editor`)}>返回编辑器</Button>
        </If>
    </div>
}
