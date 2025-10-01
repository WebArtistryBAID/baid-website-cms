import type { Config } from '@measured/puck'
import TopTextConfig from '@/app/lib/puck/components/TopText'
import HighlightsConfig from '@/app/lib/puck/components/Highlights'
import ContainerConfig from '@/app/lib/puck/components/Container'
import LatestNewsConfig from '@/app/lib/puck/components/LatestNews'
import BentoBoxConfig from '@/app/lib/puck/components/BentoBox'
import QuoteConfig from '@/app/lib/puck/components/Quote'

export const PUCK_CONFIG: Config = {
    components: {
        Container: ContainerConfig,
        TopText: TopTextConfig,
        Highlights: HighlightsConfig,
        LatestNews: LatestNewsConfig,
        BentoBox: BentoBoxConfig,
        Quote: QuoteConfig
    },
    categories: {
        layout: {
            title: '布局',
            components: [ 'Container' ]
        },
        sections: {
            title: '内容区块',
            components: [ 'TopText', 'Highlights', 'LatestNews', 'BentoBox', 'Quote' ]
        }
    }
}
