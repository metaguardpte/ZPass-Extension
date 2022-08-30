import HubButton from '@/popup/components/HubButton'
import { Button, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

const Download = () => {
    const { t } = useTranslation()

    return (
        <div style={{ padding: '30px 50px' }}>
            <img
                style={{ width: '100%', height: '44', padding: '0 40px' }}
                src={chrome.runtime.getURL('./images/logo-blue.svg')}
            />
            <div style={{ margin: '50px 0' }}>
                <Text>{t('download.message')}</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
                <HubButton
                    width={120}
                    height={30}
                    onClick={(e) => {
                        window.open('https://www.zpassapp.com/download/')
                    }}
                >
                    {t('Download')}
                </HubButton>
            </div>
        </div>
    )
}

export default Download
