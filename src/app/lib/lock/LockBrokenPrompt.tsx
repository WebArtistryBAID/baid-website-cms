'use client'

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'flowbite-react'
import { useRouter } from 'next/navigation'

export default function LockBrokenPrompt({ show, returnUri }: { show: boolean, returnUri: string }) {
    const router = useRouter()

    return <Modal show={show} size="md" popup onClose={() => router.push(returnUri)}>
        <ModalHeader/>
        <ModalBody>
            <div className="space-y-6">
                <h3 className="text-xl font-bold">其他用户正在编辑</h3>
                <p className="text-sm">另一名用户中断了您的编辑。您的编辑未保存。</p>
            </div>
        </ModalBody>
        <ModalFooter>
            <Button pill color="blue" onClick={() => {
                router.push(returnUri)
            }}>退出</Button>
        </ModalFooter>
    </Modal>
}
