'use client'

import {
    Button,
    Timeline,
    TimelineBody,
    TimelineContent,
    TimelineItem,
    TimelinePoint,
    TimelineTitle
} from 'flowbite-react'
import { HiPencil } from 'react-icons/hi2'
import If from '@/app/lib/If'
import { EntityType, Role, User } from '@prisma/client'
import { addApproval, ApprovalThresholds, getApprovalNames, getThresholds } from '@/app/lib/approval/approval-actions'
import { HiCloudUpload } from 'react-icons/hi'
import { useEffect, useState } from 'react'
import { getMyUser } from '@/app/login/login-actions'
import { useRouter } from 'next/navigation'
import { Alignable, isAligned } from '@/app/lib/data-types'

export default function ApprovalProcess({ entityType, entityId, entity, doAlign }: {
    entityType: EntityType,
    entityId: number,
    entity: Alignable,
    doAlign: () => Promise<void>
}) {
    const [ user, setUser ] = useState<User | null>(null)
    const [ loading, setLoading ] = useState(false)
    const [ approvalsThreshold, setApprovalsThreshold ] = useState<ApprovalThresholds>({ admin: 1, editor: 1 })
    const [ approvalsNames, setApprovalNames ] = useState<Record<Role, string[]>>({ admin: [], editor: [], writer: [] })
    const [ publishConfirm, setPublishConfirm ] = useState(false)
    const [ approvalConfirm, setApprovalConfirm ] = useState(false)
    const [ approvalConfirm2, setApprovalConfirm2 ] = useState(false)

    const router = useRouter()

    useEffect(() => {
        (async () => {
            setUser((await getMyUser())!)
            setApprovalsThreshold(await getThresholds(entityType))
            setApprovalNames(await getApprovalNames(entityType, entityId))
        })()
    }, [ entityId, entityType ])

    async function refresh() {
        setApprovalsThreshold(await getThresholds(entityType))
        setApprovalNames(await getApprovalNames(entityType, entityId))
    }

    return <div className="p-8">
        <h2 className="text-2xl font-bold mb-5">审核与发布流程</h2>
        <Timeline>
            <TimelineItem>
                <TimelinePoint icon={HiPencil}/>
                <TimelineContent>
                    <TimelineTitle>撰稿</TimelineTitle>
                    <TimelineBody>
                        由撰稿员完成内容编写。
                    </TimelineBody>
                </TimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelinePoint icon={HiPencil}/>
                <TimelineContent>
                    <TimelineTitle>编辑员审核</TimelineTitle>
                    <TimelineBody>
                        <p>由 {approvalsThreshold?.editor} 名编辑员审核。</p>
                        <If condition={approvalsNames.editor.length < 1}>
                            <p className="text-blue-500">暂无编辑员批准，还需要 {approvalsThreshold.editor} 人。</p>
                        </If>
                        <If condition={approvalsNames.editor.length > 0 && approvalsNames.editor.length < (approvalsThreshold?.editor ?? 1)}>
                            <p className="text-blue-500">已经由 {approvalsNames.editor.join('、')} 批准，
                                还需要 {(approvalsThreshold?.editor ?? 1) - approvalsNames.editor.length} 人。</p>
                        </If>
                        <If condition={approvalsNames.editor.length >= (approvalsThreshold?.editor ?? 1)}>
                            <p className="text-green-400">已经由 {approvalsNames.editor.join('、')} 批准，本步骤已完成。</p>
                        </If>
                    </TimelineBody>
                    <If condition={user?.roles?.includes(Role.editor) && !approvalsNames.editor.includes(user?.name)}>
                        <Button disabled={loading} pill color="blue" onClick={async () => {
                            if (!approvalConfirm) {
                                setApprovalConfirm(true)
                                return
                            }
                            setLoading(true)
                            await addApproval({
                                entityType,
                                entityId,
                                role: Role.editor
                            })
                            setLoading(false)
                            setApprovalConfirm(false)
                            await refresh()
                            router.refresh()
                        }}>{approvalConfirm ? '确认批准?' : '批准'}</Button>
                    </If>
                </TimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelinePoint icon={HiPencil}/>
                <TimelineContent>
                    <TimelineTitle>管理员审核</TimelineTitle>
                    <TimelineBody>
                        <p>由 {approvalsThreshold?.admin} 名管理员审核。</p>
                        <If condition={approvalsNames.admin.length < 1}>
                            <p className="text-blue-500">暂无管理员批准，还需要 {approvalsThreshold.admin} 人。</p>
                        </If>
                        <If condition={approvalsNames.admin.length > 0 && approvalsNames.admin.length < (approvalsThreshold?.admin ?? 1)}>
                            <p className="text-blue-500">已经由 {approvalsNames.admin.join('、')} 批准，
                                还需要 {(approvalsThreshold?.admin ?? 1) - approvalsNames.editor.length} 人。</p>
                        </If>
                        <If condition={approvalsNames.admin.length >= (approvalsThreshold?.admin ?? 1)}>
                            <p className="text-green-400">已经由 {approvalsNames.admin.join('、')} 批准，本步骤已完成。</p>
                        </If>
                    </TimelineBody>
                    <If condition={user?.roles?.includes(Role.admin) && !approvalsNames.admin.includes(user?.name)}>
                        <Button disabled={loading} pill color="blue" onClick={async () => {
                            if (!approvalConfirm2) {
                                setApprovalConfirm2(true)
                                return
                            }
                            setLoading(true)
                            await addApproval({
                                entityType,
                                entityId,
                                role: Role.admin
                            })
                            setLoading(false)
                            setApprovalConfirm2(false)
                            await refresh()
                            router.refresh()
                        }}>{approvalConfirm2 ? '确认批准?' : '批准'}</Button>
                    </If>
                </TimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelinePoint icon={HiCloudUpload}/>
                <TimelineContent>
                    <TimelineTitle>发布</TimelineTitle>
                    <TimelineBody>
                        <If condition={approvalsNames.editor.length < (approvalsThreshold?.editor ?? 1) || approvalsNames.admin.length < (approvalsThreshold?.admin ?? 1)}>
                            <p>完成前序步骤后即可发布。</p>
                        </If>
                        <If condition={approvalsNames.editor.length >= (approvalsThreshold?.editor ?? 1) && approvalsNames.admin.length >= (approvalsThreshold?.admin ?? 1) &&
                            !isAligned(entity)}>
                            <p>内容已审核完成，可以发表。</p>
                            <Button disabled={loading} pill color="blue" onClick={async () => {
                                if (!publishConfirm) {
                                    setPublishConfirm(true)
                                    return
                                }
                                setLoading(true)
                                await doAlign()
                                setLoading(false)
                                await refresh()
                                router.refresh()
                            }}>{publishConfirm ? '确认发布?' : '发布'}</Button>
                        </If>
                        <If condition={isAligned(entity)}>
                            <p>内容已成功发布!</p>
                        </If>
                    </TimelineBody>
                </TimelineContent>
            </TimelineItem>
        </Timeline>
    </div>
}
