import { List, Button, Skeleton, Typography, Tooltip } from 'antd'
import { CSSProperties, useState, useEffect, useCallback, memo } from 'react'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import VaultMoreButton, { fillPassword } from '../VaultMoreButton'
import styles from './index.less'
import utils from '@/utils/utils'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { VaultItemType } from '@/typings/enums'
import {
    goFillCompanyPassword,
    goFillPassword,
} from '@/services/api/appRequester'
import LazyImage from '@/popup/components/LazyImage'
import ScrollContainer from '@/popup/components/ScrollContainer'
import store, { Store } from '@/popup/store'

const { Text } = Typography

interface VaultListProps {
    items: Message.VaultItem[]
    loading: boolean
    hide?: boolean
    style?: CSSProperties
    personalId: number
}

const VaultList = function (props: VaultListProps) {
    const BaseList = ({ _store }: { _store: Store }) => {
        const userprofile = _store.userProfile
        const [style, setStyle] = useState<CSSProperties | undefined>()
        const { t } = useTranslation()
        const navigate = useNavigate()

        const onRun = async (item: Message.VaultItem) => {
            fillPassword(
                item,
                goFillPassword,
                goFillCompanyPassword,
                userprofile
            )
            chrome.tabs.create({
                url: utils.normalizeUrl(item.detail.loginUri),
            })
        }

        useEffect(() => {
            const s = {
                ...props.style,
                display: props.hide ? 'none' : '',
            }
            setStyle(s)
        }, [props.style, props.hide])

        const OpenButton = useCallback(
            (props: { vaultItem: Message.VaultItem; key: string }) => {
                const [mouseUp, setMouseUp] = useState<boolean>(false)

                return (
                    <Button
                        onMouseEnter={() => setMouseUp(true)}
                        onMouseLeave={() => setMouseUp(false)}
                        style={{ border: 'none' }}
                        onClick={(e) => {
                            e.stopPropagation()
                            onRun(props.vaultItem)
                        }}
                        key={props.key}
                        icon={
                            <Tooltip title={t('open')}>
                                <img
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        opacity: 0.85,
                                        marginBottom: '4px',
                                    }}
                                    src={
                                        mouseUp
                                            ? chrome.runtime.getURL(
                                                  './images/icons/share-blue.svg'
                                              )
                                            : chrome.runtime.getURL(
                                                  './images/icons/share-dark.svg'
                                              )
                                    }
                                />
                            </Tooltip>
                        }
                    />
                )
            },
            []
        )

        const getRowButtons = (item: Message.VaultItem, needEnv: boolean) => {
            let buttons = [
                <VaultMoreButton
                    key={item.key}
                    vaultItem={item}
                    personalId={props.personalId}
                />,
            ]
            if (item.itemType === VaultItemType.App) {
                if (needEnv) {
                    buttons = [
                        <Tooltip
                            title={t('vualt.norun.message')}
                            key={item.key}
                        >
                            <Button
                                style={{
                                    border: 'none',
                                    color: '#ff4d4f',
                                    marginRight: '6px',
                                }}
                                key={item.key}
                                icon={
                                    <ExclamationCircleOutlined
                                        style={{ fontSize: '18px' }}
                                    />
                                }
                            />
                        </Tooltip>,
                    ]
                } else {
                    buttons.splice(
                        0,
                        0,
                        <OpenButton vaultItem={item} key={item.key} />
                    )
                }
            }
            return buttons
        }

        const ListRow = (props: {
            item: Message.VaultItem
            loading: boolean
        }) => {
            const { item } = props
            const [data, setData] = useState<{
                title: string
                subTitle: string
                needTranslate: boolean
            }>()
            const [needEnv, setNeedEnv] = useState<boolean>(false)
            const { t } = useTranslation()

            useEffect(() => {
                if (item.itemType === VaultItemType.App) {
                    const detail = item.detail as Message.VaultItemLogin
                    setNeedEnv(detail.clientMachineId > 0)
                }
                getTitle()
            }, [props.item])

            const getTitle = async () => {
                const [title, subTitle, needTranslate] =
                    await utils.getItemTitle(item)
                setData({ title, subTitle, needTranslate })
            }

            return (
                <List.Item
                    actions={getRowButtons(item, needEnv)}
                    onClick={(e) => navigate(`/form/${item.id}`)}
                >
                    <Skeleton
                        avatar
                        title={false}
                        loading={props.loading}
                        active
                    >
                        <List.Item.Meta
                            avatar={
                                <LazyImage
                                    src={utils.getIconUrl(item, 'list')}
                                    lazy={item.itemType === VaultItemType.App}
                                />
                            }
                            title={
                                <Text ellipsis={{ tooltip: true }}>
                                    {data?.title}
                                </Text>
                            }
                            description={
                                <Text ellipsis={{ tooltip: true }}>
                                    {data?.needTranslate
                                        ? t(data?.subTitle)
                                        : data?.subTitle}
                                </Text>
                            }
                        />
                    </Skeleton>
                </List.Item>
            )
        }

        return (
            <div style={{ height: 350 }}>
                <ScrollContainer>
                    <List
                        itemLayout="horizontal"
                        dataSource={props.items}
                        loading={props.loading}
                        className={styles.hubVaultList}
                        style={style}
                        renderItem={(item) => (
                            <ListRow item={item} loading={props.loading} />
                        )}
                    />
                </ScrollContainer>
            </div>
        )
    }
    return <BaseList _store={store} />
}

export default memo(VaultList)
