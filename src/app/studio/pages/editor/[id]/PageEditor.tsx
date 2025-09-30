'use client'

import { HydratedContentEntity } from '@/app/lib/data-types'
import { getContentEntity, updateContentEntity } from '@/app/studio/editor/entity-actions'
import { useSaveShortcut } from '@/app/lib/save/useSaveShortcuts'
import { useSavableEntity } from '@/app/lib/save/useSavableEntity'
import { useState } from 'react'
import { useEntityLock } from '@/app/lib/lock/useEntityLock'
import LockBrokenPrompt from '@/app/lib/lock/LockBrokenPrompt'
import { Puck } from '@measured/puck'
import { PUCK_CONFIG } from '@/app/lib/puck-config'
import { Button, HelperText, Label, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from 'flowbite-react'

export default function PageEditor({ init, userId, lockToken, uploadPrefix }: {
    init: HydratedContentEntity,
    userId: number,
    lockToken: string,
    uploadPrefix: string
}) {
    const [ showLockBroken, setShowLockBroken ] = useState(false)
    const [ showMetadata, setShowMetadata ] = useState(false)
    const [ inEnglish, setInEnglish ] = useState(false)

    // = Switch language
    function switchLanguage() {
        setInEnglish(!inEnglish)
    }

    // = Save
    const {
        draft,
        setDraft,
        hasChanges,
        loading,
        save
    } = useSavableEntity({
        initial: init,
        saveFn: async draft => await updateContentEntity({
            id: draft.id,
            titleDraftEN: draft.titleDraftEN,
            titleDraftZH: draft.titleDraftZH,
            slug: draft.slug,
            contentDraftEN: draft.contentDraftEN,
            contentDraftZH: draft.contentDraftZH,
            coverImageDraftId: null,
            createdAt: draft.createdAt
        }),
        refreshFn: async () => (await getContentEntity(init.id))!,
        compareKeys: [
            'titleDraftEN',
            'titleDraftZH',
            'slug',
            'contentDraftEN',
            'contentDraftZH',
            'createdAt'
        ]
    })
    useSaveShortcut(true, save)

    // = Locking
    useEntityLock({
        entityType: init.type,
        entityId: draft.id,
        userId,
        initialToken: lockToken,
        hasChanges,
        onLockLost: () => setShowLockBroken(true)
    })

    return <>
        <LockBrokenPrompt show={showLockBroken} returnUri="/studio/pages"/>

        <Modal show={showMetadata} size="md" popup onClose={() => setShowMetadata(false)}>
            <ModalHeader/>
            <ModalBody>
                <div className="space-y-6">
                    <h3 className="text-xl font-bold">页面信息</h3>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="title-zh">标题</Label>
                        </div>
                        <TextInput id="title-zh" value={`${draft.titleDraftZH} / ${draft.titleDraftEN}`} disabled/>
                        <HelperText>
                            请通过编辑器更改标题。
                        </HelperText>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="slug">链接位置</Label>
                        </div>
                        <TextInput id="slug" value={draft.slug} placeholder="better-me-better-world"
                                   onChange={e => setDraft({
                                       ...draft,
                                       slug: e.currentTarget.value
                                   })}/>
                    </div>
                    <div>
                        <Label>创建用户</Label>
                        <p className="text-xl">{draft.creator.name}</p>
                    </div>
                    <div>
                        <Label>创建时间</Label>
                        <p className="text-xl">{draft.createdAt.toLocaleString()}</p>
                    </div>
                    <div>
                        <Label>最新更改时间</Label>
                        <p className="text-xl">{draft.updatedAt.toLocaleString()}</p>
                    </div>

                    <p className="text-sm">关闭后，请务必保存。</p>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button pill color="blue" disabled={loading} onClick={() => setShowMetadata(false)}>确认</Button>
            </ModalFooter>
        </Modal>

        <Puck
            key={inEnglish ? 'en' : 'zh'} // Force re-render
            config={PUCK_CONFIG}
            data={JSON.parse(inEnglish ? draft.contentDraftEN : draft.contentDraftZH)} // Avoid empty string error
            onChange={data => {
                if (inEnglish) {
                    setDraft({
                        ...draft,
                        contentDraftEN: JSON.stringify(data),
                        titleDraftEN: data.root.props?.title ?? ''
                    })
                } else {
                    setDraft({
                        ...draft,
                        contentDraftZH: JSON.stringify(data),
                        titleDraftZH: data.root.props?.title ?? ''
                    })
                }
            }}
            overrides={{
                headerActions: () => <>
                    <Button pill color="alternative"
                            onClick={switchLanguage}>切换到{inEnglish ? '中文' : '英文'}</Button>
                    <Button pill color="alternative" onClick={() => setShowMetadata(true)}>页面信息</Button>
                    <Button pill color="alternative">审核与发布</Button>
                    <Button pill color="blue" disabled={!hasChanges || loading} onClick={save}>保存更改</Button>
                </>
            }}
        />
    </>
}
