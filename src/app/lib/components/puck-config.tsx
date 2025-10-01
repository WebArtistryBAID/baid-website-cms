import type { Config } from '@measured/puck'
import TopTextConfig from '@/app/lib/components/TopText'
import HighlightsConfig from '@/app/lib/components/Highlights'

export const PUCK_CONFIG: Config = {
    components: {
        TopText: TopTextConfig,
        Highlights: HighlightsConfig
    }
}
