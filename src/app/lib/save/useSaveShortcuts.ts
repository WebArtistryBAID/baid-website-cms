'use client'

import { useEffect, useRef } from 'react'

export function useSaveShortcut(enabled: boolean, onSave: () => void) {
    const onSaveRef = useRef(onSave)
    useEffect(() => {
        onSaveRef.current = onSave
    }, [ onSave ])

    useEffect(() => {
        if (!enabled) return
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault()
                onSaveRef.current?.()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [ enabled ])
}
