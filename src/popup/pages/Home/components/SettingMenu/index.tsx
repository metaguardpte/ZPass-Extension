import { Input, Dropdown, Menu, Typography, Tooltip } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'
import { localStore } from '@/popup/storage'
import { logout, lock } from '@/services/api/appRequester'

const { Text } = Typography
const { Search } = Input

const SettingMenu = () => {
    const { t } = useTranslation()

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
        localStore.language = lng
    }

    const onOpenHelp = () => {
        chrome.tabs.create({ url: 'https://www.zpassapp.com/help/' })
    }

    const langMenu = (
        <Menu>
            <Menu.Item key="dropdown-language-us-en">
                <a onClick={(e) => changeLanguage('en')}>English</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-de-de">
                <a onClick={(e) => changeLanguage('de')}>Deutsch</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-fr-fr">
                <a onClick={(e) => changeLanguage('fr')}>Français</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-it-it">
                <a onClick={(e) => changeLanguage('it')}>Italiano</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-es-es">
                <a onClick={(e) => changeLanguage('es')}>Español</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-pt-pt">
                <a onClick={(e) => changeLanguage('pt')}>Português</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-ja-jp">
                <a onClick={(e) => changeLanguage('ja')}>日本語</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-ko-kr">
                <a onClick={(e) => changeLanguage('ko')}>한국인</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-th-th">
                <a onClick={(e) => changeLanguage('th')}>ไทย</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-ms-my">
                <a onClick={(e) => changeLanguage('ms')}>Melayu</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-vi-vn">
                <a onClick={(e) => changeLanguage('vi')}>Tiếng Việt</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-zh-cn">
                <a onClick={(e) => changeLanguage('zh')}>中文（简体）</a>
            </Menu.Item>
            <Menu.Item key="dropdown-language-zh-tw">
                <a onClick={(e) => changeLanguage('tw')}>中文（繁體）</a>
            </Menu.Item>
        </Menu>
    )

    const menu = (
        <Menu>
            <Menu.Item key="dropdown-header-languages">
                <Dropdown
                    overlay={langMenu}
                    placement="bottomLeft"
                    trigger={['click']}
                >
                    <a onClick={(e) => e.preventDefault()}>{t('Languages')}</a>
                </Dropdown>
            </Menu.Item>
            <Menu.Item key="dropdown-header-help">
                <a onClick={(e) => onOpenHelp()}>{t('Help')}</a>
            </Menu.Item>
            <Menu.Item key="dropdown-header-lock">
                <a
                    onClick={(e) => {
                        e.preventDefault()
                        lock()
                    }}
                >
                    {t('lock')}
                </a>
            </Menu.Item>
            <Menu.Item key="dropdown-header-logoff">
                <a onClick={(e) => logout()}>{t('Logoff')}</a>
            </Menu.Item>
        </Menu>
    )

    return (
        <Dropdown overlay={menu} placement="bottomLeft" trigger={['click']}>
            <a onClick={(e) => e.preventDefault()}>
                <Tooltip
                    title={t('setting')}
                    placement="bottomRight"
                    zIndex={888}
                >
                    <SettingOutlined
                        className="action-icon"
                        style={{ marginLeft: '5px' }}
                    />
                </Tooltip>
            </a>
        </Dropdown>
    )
}

export default SettingMenu
