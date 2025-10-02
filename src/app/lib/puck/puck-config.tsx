import type { Config } from '@measured/puck'
import TopTextConfig from '@/app/lib/puck/components/TopText'
import HighlightsConfig from '@/app/lib/puck/components/Highlights'
import ContainerConfig from '@/app/lib/puck/components/Container'
import LatestNewsConfig from '@/app/lib/puck/components/LatestNews'
import BentoBoxConfig from '@/app/lib/puck/components/BentoBox'
import QuoteConfig from '@/app/lib/puck/components/Quote'
import { InFocusProjectsConfig } from '@/app/lib/puck/components/InFocusConfigs'
import StatisticsConfig from '@/app/lib/puck/components/Statistics'
import HorizontalTopTextConfig from '@/app/lib/puck/components/HorizontalTopText'
import HeroConfig from '@/app/lib/puck/components/HeroConfig'

export const PUCK_CONFIG: Config = {
    components: {
        ContainerConfig,
        TopTextConfig,
        HighlightsConfig,
        LatestNewsConfig,
        BentoBoxConfig,
        QuoteConfig,
        InFocusProjectsConfig,
        StatisticsConfig,
        HorizontalTopTextConfig,
        HeroConfig
    },
    categories: {
        layout: {
            title: '布局',
            components: [ 'ContainerConfig' ]
        },
        sections: {
            title: '内容区块',
            components: [ 'TopTextConfig', 'HighlightsConfig', 'LatestNewsConfig', 'BentoBoxConfig', 'QuoteConfig', 'StatisticsConfig', 'HorizontalTopTextConfig' ]
        },
        heroes: {
            title: '首屏',
            components: [ 'HeroConfig', 'InFocusProjectsConfig' ]
        }
    }
}
