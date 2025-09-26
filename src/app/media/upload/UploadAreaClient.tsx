'use client'

import { HiUpload } from 'react-icons/hi'
import { useRef, useState } from 'react'
import If from '@/app/lib/If'

export default function UploadAreaClient({ uploadPrefix, onDone }: {
    uploadPrefix: string,
    onDone: (hash: string) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [ loading, setLoading ] = useState(false)
    const [ progress, setProgress ] = useState(0)
    const [ error, setError ] = useState(false)
    const [ done, setDone ] = useState(false)
    const [ path, setPath ] = useState('')

    async function upload(file: File) {
        setLoading(true)
        setDone(false)
        setError(false)
        setProgress(0)
        const formData = new FormData()
        formData.append('file', file)

        const xhr = new XMLHttpRequest() // Using this makes me feel ancient
        xhr.open('POST', '/media/upload', true)
        xhr.upload.onprogress = (e: ProgressEvent) => {
            if (e.lengthComputable) {
                setProgress(Math.round((e.loaded / e.total) * 100))
            }
        }
        xhr.onload = () => {
            setLoading(false)
            setProgress(0)
            if (xhr.status === 200) {
                setDone(true)
                setPath(JSON.parse(xhr.responseText).hash + '.webp')
                onDone(JSON.parse(xhr.responseText).hash)
            } else {
                setError(true)
            }
        }
        xhr.onerror = () => {
            setError(true)
        }
        xhr.send(formData)
    }

    return <div aria-label="上传块"
                onClick={() => inputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                    e.preventDefault()
                    if (e.dataTransfer.files.length > 0) {
                        void upload(e.dataTransfer.files[0])
                    }
                }}
                className="bg-blue-50 hover:bg-blue-100
        rounded-3xl flex flex-col justify-center items-center text-center p-5
        transition-colors duration-100">
        <input type="file" disabled={loading} className="hidden" ref={inputRef} onChange={e => {
            if (e.currentTarget.files != null && e.currentTarget.files.length > 0) {
                void upload(e.currentTarget.files[0])
            }
        }}/>
        <HiUpload className="text-blue-400 dark:text-blue-300 text-4xl mb-3"/>
        <p className="text-xl font-bold" aria-hidden>上传</p>
        <button aria-live="polite" disabled={loading} className="text-sm" onClick={() => inputRef.current?.click()}>
            <If condition={loading}>
                <span className="sr-only">上传进度</span>
                {progress}%
            </If>
            <If condition={!loading}>
                <If condition={error}>
                    上传错误
                </If>
                <If condition={done}>
                    上传完毕
                </If>
                <If condition={!error && !done}>
                    拖拽文件或点击此处上传
                </If>
            </If>
        </button>
        <If condition={done}>
            <img width={500} height={200} src={uploadPrefix + path} alt="已上传文件"
                 className="mt-3 rounded-xl w-full lg:max-w-sm object-cover"/>
        </If>
    </div>
}
