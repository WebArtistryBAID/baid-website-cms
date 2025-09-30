import type { Config } from '@measured/puck'

export const PUCK_CONFIG: Config = {
    components: {
        HeadingBlock: {
            fields: {
                children: {
                    type: 'text'
                }
            },
            render: ({ children }) => {
                return <h1>{children}</h1>
            }
        }
    }
}
