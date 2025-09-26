import { ReactNode } from 'react'

export default function If({ condition, children }: { condition: boolean | null | undefined, children: ReactNode }) {
    return condition === true ? <>{children}</> : null
}
