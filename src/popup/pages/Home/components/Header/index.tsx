import { Input, Typography, Space, Avatar, Tooltip } from 'antd'
import styles from '../../index.less'
import { useTranslation } from 'react-i18next'
import SettingMenu from '../SettingMenu'
import { useNavigate } from 'react-router-dom'
import PasswordGenerator from '../IconMap/PasswordGenerator'

const { Text } = Typography
const { Search } = Input

interface HubHeaderProps {
    onSearch: (text: string) => void
}

const HubHeader = (props: HubHeaderProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    return (
        <div className={styles.headerBase}>
            <Space className={styles.hubHeader}>
                <Space style={{ fontSize: '16px' }}>
                    <Avatar
                        className={styles.headerImg}
                        icon={
                            <img
                                src={chrome.runtime.getURL(
                                    './images/logoTop.png'
                                )}
                            />
                        }
                        size={24}
                    />
                    <Text strong={true}>ZPass</Text>
                </Space>

                <Space style={{ fontSize: '18px' }}>
                    <div style={{ marginTop: 5 }}>
                        <Tooltip
                            title={t('password.generator')}
                            placement="bottomRight"
                            zIndex={888}
                        >
                            <span
                                onClick={() => {
                                    navigate('/home/passwordGenerator', {
                                        replace: false,
                                    })
                                }}
                            >
                                <PasswordGenerator
                                    fill="#dddddd"
                                    hover="#ffffff"
                                    size={18}
                                />
                            </span>
                        </Tooltip>
                    </div>
                    <SettingMenu />
                </Space>
            </Space>
            <div className={styles.hubSearch}>
                <Search
                    placeholder={t('input search text')}
                    allowClear
                    size="small"
                    enterButton={false}
                    prefix={
                        <img
                            src={chrome.runtime.getURL(
                                '/images/icons/search.svg'
                            )}
                            height={20}
                        />
                    }
                    className={styles.hubSearchInput}
                    onChange={(e) => props.onSearch(e.target.value)}
                />
            </div>
        </div>
    )
}

export default HubHeader
