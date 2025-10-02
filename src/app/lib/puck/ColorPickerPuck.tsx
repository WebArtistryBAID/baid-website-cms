'use client'

import { useRef, useState } from 'react'
import { HiColorSwatch } from 'react-icons/hi'

export default function ColorPickerPuck({ name, onChange, value }:
                                        {
                                            name: string,
                                            onChange: (value: string | null) => void,
                                            value: string | null
                                        }) {
    const [ currentColor, setCurrentColor ] = useState(value ?? '#00000')
    const inputRef = useRef<HTMLInputElement>(null)

    return <div>
        <div className="flex items-center mb-3 gap-1 pl-1">
            <HiColorSwatch className="h-4 text-gray-400"/>
            <label className="text-sm text-gray-700">{name}</label>
        </div>

        <div className="flex gap-3">
            <button className={`h-8 w-8 rounded-full ${value === '#9f0612' ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: '#9f0612' }}
                    onClick={() => onChange('#9f0612')}>
                <span className="sr-only">北中红</span>
            </button>

            <button className={`h-8 w-8 rounded-full ${value === '#103c74' ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: '#103c74' }}
                    onClick={() => onChange('#103c74')}>
                <span className="sr-only">国际蓝</span>
            </button>

            <button
                className={`h-8 w-8 border border-black rounded-full ${(value !== '#103c74' && value !== '#9f0612') ? 'ring-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: currentColor }}
                onClick={() => inputRef.current?.showPicker()}>
                <input type="color" ref={inputRef} value={currentColor} className="w-1 h-1"
                       onChange={e => {
                           setCurrentColor(e.currentTarget.value.toLowerCase())
                           onChange(e.currentTarget.value.toLowerCase())
                       }}/>
                <span className="sr-only">自选颜色</span>
            </button>
        </div>
    </div>
}
