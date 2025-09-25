import type { Config } from 'tailwindcss'

export default {
    darkMode: 'media',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}'
    ],
    theme: {
        extend: {
            fontFamily: {
                display: [ 'system-ui', 'sans-serif' ],
                body: [ 'system-ui', 'sans-serif' ]
            }
        }
    }
} satisfies Config
