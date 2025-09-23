'use client'

import { useTranslationClient } from '@/app/i18n/client'
import { getLoginTarget } from '@/app/login/login-actions'

export default function PageLoginOnboarding() {
    const { t } = useTranslationClient('login')

    return <div className="messagebox-container">
        <div className="messagebox">
            <h1 className="mb-1">{t('error')}</h1>
            <p className="text-sm mb-5">
                {t('details')}
            </p>
            <button onClick={async () => {
                location.href = await getLoginTarget('/core')
            }} className="btn">{t('tryAgain')}</button>
        </div>
    </div>
}
