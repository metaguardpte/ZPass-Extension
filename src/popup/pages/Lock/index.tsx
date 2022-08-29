import { Modal, Typography } from 'antd'
import comm from '@/utils/communication'
import { useTranslation } from 'react-i18next'
import HubButton from '@/popup/components/HubButton'

const { Text } = Typography

const Lock = () => {
    const { t } = useTranslation()

    return (
        <div style={{ padding: '30px 50px' }}>
            <img
                style={{ width: '100%', height: '44', padding: '0 40px' }}
                src={chrome.runtime.getURL('./images/logo-blue.svg')}
            />
            <div style={{ margin: '50px 0' }}>
                <Text>{t('unlock.message')}</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
                <HubButton
                    width={100}
                    height={30}
                    onClick={(e) => comm.login()}
                >
                    {t('unlock')}
                </HubButton>
            </div>
        </div>
    )
}

export default Lock
