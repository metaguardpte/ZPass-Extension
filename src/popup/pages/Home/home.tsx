import type { Store } from '@/popup/store'
import VaultList from './components/VaultList'
import { observer } from 'mobx-react-lite'
import { Tabs, Button, Dropdown, Menu } from 'antd'
import { useState, useEffect, useRef, memo } from 'react'
import HubHeader from './components/Header'
import styles from './index.less'
import { useTranslation } from 'react-i18next'
import store from '@/popup/store'
import utils from '@/utils/utils'
import { DownOutlined } from '@ant-design/icons'
import { vaultItemTypeMap } from '@/typings/enums'
import { useOutlet } from 'react-router-dom'

const { TabPane } = Tabs

const currentTabUrl = async () => {
    const queryOptions = { active: true, currentWindow: true }
    const [tab] = await chrome.tabs.query(queryOptions)
    return tab.url ?? ''
}

interface TabTitleTextProps {
    type: AllTabType
}

interface HomeContentProps {
    isStarted: boolean
    personalId: number
    vaultItems: Message.VaultItem[]
}

const HomeContent = (props: HomeContentProps) => {
    const { t } = useTranslation()
    const [suggestions, setSuggestions] = useState<Message.VaultItem[]>([])
    const [star, setStar] = useState<Message.VaultItem[]>([])
    const [searchData, setSearchData] = useState<Message.VaultItem[]>([])
    const [allList, setAllList] = useState<Message.VaultItem[]>([])
    const [searching, setSearching] = useState<boolean>(false)
    const [selectedTab, setSelectedTab] = useState<string>(store.listTab ?? '1')
    const [allTabSelection, setAllTabSelection] = useState<AllTabType>(
        store.allTabType ?? 'all'
    )
    const dataSetRef = useRef(true)
    const [isStarted, setIsStarted] = useState<boolean>(props.isStarted)
    const [personalId, setPersonalId] = useState<number>(props.personalId)
    const [loading, setLoading] = useState<boolean>(true)
    const Children = () => useOutlet()

    const loadData = async () => {
        setLoading(true)
        const sta = props.vaultItems.filter((v) => v.star) ?? []
        setStar(sta)
        onTypeChanged(store.allTabType ?? 'all')
        const currentUrl = await currentTabUrl()
        if (dataSetRef.current === true) {
            const sugg =
                props.vaultItems.filter((v) => {
                    const url =
                        (v.detail as Message.VaultItemLogin)?.loginUri ?? ''
                    return utils.match(currentUrl, url)
                }) ?? []
            setSuggestions(sugg)

            if (!store.listTab) {
                if (sugg.length === 0) {
                    setSelectedTab('2')
                }
                if (sta.length === 0) {
                    setSelectedTab('3')
                }
            }
            setLoading(false)
        }
    }

    const onTabChanged = (key: string, e: any) => {
        setSelectedTab(key)
        store.listTab = key
    }

    const onSearch = (text: string) => {
        if (text.length > 0) {
            if (!searching) setSearching(true)
            const data =
                props.vaultItems.filter(
                    (v) =>
                        (v.alias && v.alias.includes(text)) ||
                        (v.description && v.description.includes(text))
                ) ?? []
            setSearchData(data)
        } else {
            if (searching) {
                setSearchData([])
                setSearching(false)
            }
        }
    }

    const onTypeChanged = (type: AllTabType) => {
        let ret: Message.VaultItem[]
        if (type !== 'all') {
            const itemType = vaultItemTypeMap[type]
            const itemTypeArry = Array.isArray(itemType) ? itemType : [itemType]
            ret =
                props.vaultItems.filter((v) =>
                    itemTypeArry.includes(v.itemType)
                ) ?? []
        } else {
            ret = props.vaultItems
        }
        store.allTabType = type
        setAllTabSelection(type)
        setAllList(ret)
    }

    const TabTitleText = ({ type }: TabTitleTextProps) => {
        let ret = <span>{t('home.tab.title.all')}</span>
        switch (type) {
            case 'app':
                ret = <span>{t('home.tab.title.logins')}</span>
                break
            case 'note':
                ret = <span>{t('home.tab.title.notes')}</span>
                break
            case 'info':
                ret = <span>{t('home.tab.title.infos')}</span>
                break
            case 'credit':
                ret = <span>{t('home.tab.title.credits')}</span>
                break
            default:
                break
        }

        return ret
    }

    const AllTabTitle = (props: { curTab: string }) => {
        const allMenu = (
            <Menu>
                <Menu.Item
                    key="allMenu-0"
                    onClick={(e) => onTypeChanged('all')}
                >
                    {t('home.tab.title.all')}
                </Menu.Item>
                <Menu.Item
                    key="allMenu-1"
                    onClick={(e) => onTypeChanged('app')}
                >
                    {t('home.tab.title.logins')}
                </Menu.Item>
                <Menu.Item
                    key="allMenu-2"
                    onClick={(e) => onTypeChanged('note')}
                >
                    {t('home.tab.title.notes')}
                </Menu.Item>
                <Menu.Item
                    key="allMenu-3"
                    onClick={(e) => onTypeChanged('info')}
                >
                    {t('home.tab.title.infos')}
                </Menu.Item>
                <Menu.Item
                    key="allMenu-4"
                    onClick={(e) => onTypeChanged('credit')}
                >
                    {t('home.tab.title.credits')}
                </Menu.Item>
            </Menu>
        )

        return props.curTab === '3' ? (
            <span className={styles.allTabTitle}>
                <Dropdown overlay={allMenu}>
                    <a>
                        <DownOutlined />
                    </a>
                </Dropdown>
                <TabTitleText type={allTabSelection} />
            </span>
        ) : (
            <TabTitleText type={allTabSelection} />
        )
    }

    useEffect(() => {
        dataSetRef.current = true
        loadData()
        return () => {
            dataSetRef.current = false
        }
    }, [props.vaultItems])

    useEffect(() => {
        if (personalId !== props.personalId) {
            setPersonalId(props.personalId)
        }
    }, [props.personalId])

    useEffect(() => {
        if (isStarted !== props.isStarted) {
            setIsStarted(props.isStarted)
        }
    }, [props.isStarted])

    return (
        <div className={styles.hubHome}>
            <HubHeader onSearch={onSearch}></HubHeader>
            <Tabs
                defaultActiveKey="1"
                type="card"
                size="small"
                style={{ display: searching ? 'none' : '' }}
                activeKey={selectedTab}
                onTabClick={onTabChanged}
            >
                <TabPane tab={t('Suggestion')} key="1">
                    <VaultList
                        personalId={personalId}
                        items={suggestions}
                        loading={!isStarted && loading}
                        style={defaultListStyle}
                    />
                </TabPane>
                <TabPane tab={t('Star')} key="2">
                    <VaultList
                        personalId={personalId}
                        items={star}
                        loading={!isStarted && loading}
                        style={defaultListStyle}
                    />
                </TabPane>
                <TabPane tab={<AllTabTitle curTab={selectedTab} />} key="3">
                    <VaultList
                        personalId={personalId}
                        items={allList}
                        loading={!isStarted && loading}
                        style={defaultListStyle}
                    />
                </TabPane>
            </Tabs>
            <Tabs
                defaultActiveKey="1"
                type="card"
                size="small"
                style={{ display: searching ? '' : 'none' }}
            >
                <TabPane tab={t('home.tab.title.searchResult')} key="1">
                    <VaultList
                        personalId={personalId}
                        items={searchData}
                        loading={!isStarted && loading}
                        style={defaultListStyle}
                    />
                </TabPane>
            </Tabs>
        </div>
    )
}

const defaultListStyle = { overflow: 'hidden' }
const searchListStyle = { height: '412px', overflow: 'auto' }

const MemoHomeContent = memo(HomeContent)

const Home = () => {
    const HomeStore = observer(({ _store }: { _store: Store }) => {
        return (
            <MemoHomeContent
                vaultItems={_store.validVaultItems}
                isStarted={_store.isStarted}
                personalId={_store.personalId}
            />
        )
    })

    return <HomeStore _store={store} />
}

export default Home
