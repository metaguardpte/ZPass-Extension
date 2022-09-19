import { useState, useEffect } from 'react'
import {
    Menu,
    Dropdown,
    Space,
    Typography,
    message,
    Spin,
    Empty,
    Modal,
    Row,
    Col,
    Tooltip,
} from 'antd'
import {
    EyeOutlined,
    EyeInvisibleOutlined,
    DeleteOutlined,
    MoreOutlined,
    LeftOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons'
import styles from './index.less'
import { useTranslation } from 'react-i18next'
import {
    getPasswordHistoryAll,
    deletePasswordHistory,
    deletePasswordHistoryAll,
    decryptText,
    setCopiedText,
} from '@/services/api/appRequester'
import store from '@/popup/store'
import HubButton from '@/popup/components/HubButton'
import Utils from '@/utils/utils'
import ScrollContainer from '@/popup/components/ScrollContainer'

type PropsType = {
    id: number
    password: string
    type: string
    createTime: string
    visible?: boolean
    delete: (id: number) => void
}

const { Text } = Typography

const ListItem = (props: PropsType) => {
    const [visible, setVisible] = useState(false)
    const [truePassword, setTruePassword] = useState('')
    const { t } = useTranslation()
    const [mouseUp, setMouseUp] = useState<boolean>(false)

    useEffect(() => {
        if (props.visible) {
            ;(async function () {
                await decryptPassword()
                setVisible(true)
            })()
        } else {
            setVisible(false)
        }
    }, [props.visible])

    const copyPassword = async () => {
        if (!truePassword) {
            await decryptPassword()
        }
        navigator.clipboard.writeText(truePassword)
        setCopiedText(truePassword)
    }

    const visibleSwitch = async () => {
        if (!visible) {
            await decryptPassword()
        }
        setVisible(!visible)
    }

    const decryptPassword = async () => {
        if (!truePassword) {
            const res = await decryptText(store.personalId, props.password)
            if (res.errorId === '0') {
                setTruePassword(res.message.text)
            }
        }
    }

    return (
        <div className={styles.item}>
            <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>
                    {visible ? (
                        <div style={{ height: 28, lineHeight: '28px' }}>
                            <Text
                                style={{ width: 280 }}
                                ellipsis={{ tooltip: truePassword }}
                            >
                                {truePassword}
                            </Text>
                        </div>
                    ) : (
                        <>
                            <MoreOutlined
                                style={{ fontSize: 25, lineHeight: '25px' }}
                                rotate={90}
                            />
                            <MoreOutlined
                                style={{
                                    fontSize: 25,
                                    lineHeight: '25px',
                                    marginLeft: -2,
                                }}
                                rotate={90}
                            />
                        </>
                    )}
                </div>
                <Space style={{ width: 65 }} className={styles.action}>
                    <div>
                        {visible ? (
                            <Tooltip title={t('hide')}>
                                <EyeOutlined
                                    className={styles.icon}
                                    onClick={visibleSwitch}
                                />
                            </Tooltip>
                        ) : (
                            <Tooltip title={t('show')}>
                                <EyeInvisibleOutlined
                                    className={styles.icon}
                                    onClick={visibleSwitch}
                                />
                            </Tooltip>
                        )}
                    </div>
                    <div>
                        <Tooltip title={t('copy')} visible={mouseUp}>
                            <img
                                onClick={copyPassword}
                                onMouseEnter={() => setMouseUp(true)}
                                onMouseLeave={() => setMouseUp(false)}
                                style={{ marginTop: -4, cursor: 'pointer' }}
                                src={
                                    mouseUp
                                        ? chrome.runtime.getURL(
                                              'images/icons/copy-blue.svg'
                                          )
                                        : chrome.runtime.getURL(
                                              'images/icons/copy.svg'
                                          )
                                }
                            ></img>
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip title={t('delete')}>
                            <DeleteOutlined
                                className={styles.deleteIcon}
                                onClick={() => props.delete(props.id)}
                            />
                        </Tooltip>
                    </div>
                </Space>
            </div>
            <div>{props.type}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
                {Utils.useLocalTime(props.createTime)}
            </div>
        </div>
    )
}

type HistoryProps = {
    onSwitch: () => void
}

const History = (props: HistoryProps) => {
    const [data, setData] = useState<Message.PasswordHistoryItem[]>([])
    const [showAll, setShowAll] = useState(false)
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        getData()
    }, [])

    const sortItems = (items: Message.PasswordHistoryItem[]) => {
        return items.sort((a, b) => {
            if (a.createTime! > b.createTime!) return -1
            if (a.createTime! < b.createTime!) return 1
            return 0
        })
    }

    const getData = async () => {
        setLoading(true)
        const res = await getPasswordHistoryAll()
        if (res.errorId === '0') {
            const d = sortItems(res.message!)
            setData(d)
        }
        setLoading(false)
    }

    const clear = async () => {
        setLoading(true)
        setShowConfirm(false)
        const res = await deletePasswordHistoryAll()
        if (res.errorId === '0') {
            setData([])
            message.success(t('password.delete.success'))
        } else {
            message.error(res.errorId)
        }

        setLoading(false)
    }

    const deleteOne = async (id: number) => {
        setLoading(true)
        const res = await deletePasswordHistory(id)
        if (res.errorId === '0') {
            const tmp: Message.PasswordHistoryItem[] = []
            data.forEach((item, i) => {
                if (item.id !== id) tmp.push(item)
            })
            setData(tmp)
            message.success(t('password.delete.success'))
        } else {
            message.error(res.errorId)
        }
        setLoading(false)
    }

    const menu = (
        <Menu>
            <Menu.Item key="show">
                <div onClick={() => setShowAll(!showAll)}>
                    {showAll ? t('password.hide.all') : t('password.show.all')}
                </div>
            </Menu.Item>
            <Menu.Item key="clear">
                <div onClick={() => setShowConfirm(true)}>
                    {t('password.clear.history')}
                </div>
            </Menu.Item>
        </Menu>
    )

    const SourceMap = {
        1: t('DeskTop App'),
        2: t('Plugin'),
    }

    const getList = () => {
        const items: JSX.Element[] = []
        data.forEach((item, i) => {
            let type
            if (item.description) {
                type = item.description
            } else {
                type = t('password.desktop.app')
            }
            items.push(
                <ListItem
                    id={item.id!}
                    visible={showAll}
                    type={type}
                    createTime={item.createTime!}
                    password={item.password}
                    delete={deleteOne}
                    key={item.id}
                />
            )
            if (i < data.length - 1) {
                items.push(
                    <div
                        style={{
                            height: 1,
                            margin: '4px 0',
                            backgroundColor: 'rgba(168, 168,168,0.4)',
                        }}
                        key={`div-${i}`}
                    ></div>
                )
            }
        })
        return items
    }

    const closeConfirm = () => {
        setShowConfirm(false)
    }

    return (
        <div className={styles.history}>
            <div style={{ display: 'flex', padding: '0px 0 6px 0' }}>
                <div style={{ width: 30, marginLeft: -10 }}>
                    <div
                        className={styles.switchButton}
                        onClick={props.onSwitch}
                    >
                        <LeftOutlined style={{ fontSize: 16 }} />
                    </div>
                </div>
                <div
                    style={{ flex: 1, textAlign: 'center', lineHeight: '30px' }}
                >
                    {t('password.history')}
                </div>
                <div style={{ width: 30, marginRight: -10 }}>
                    <Dropdown overlay={menu} trigger={['click']}>
                        <div className={styles.switchButton}>
                            <Tooltip title={t('more')}>
                                <MoreOutlined style={{ fontSize: 16 }} />
                            </Tooltip>
                        </div>
                    </Dropdown>
                </div>
            </div>
            <Spin spinning={loading} style={{ height: '100%' }}>
                <div className={styles.list}>
                    <ScrollContainer>
                        <div style={{ paddingRight: 10 }}>
                            {data.length > 0 ? (
                                getList()
                            ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </div>
                    </ScrollContainer>
                </div>
            </Spin>
            <Modal
                visible={showConfirm}
                footer={null}
                onCancel={closeConfirm}
                mask={false}
            >
                <Row>
                    <Col span={4}>
                        <ExclamationCircleOutlined
                            style={{ fontSize: '44px', color: '#009AFF' }}
                        />
                    </Col>
                    <Col span={20}>
                        <div style={{ fontSize: 16 }}>
                            {t('password.clear.title')}
                        </div>
                        <div style={{ opacity: 0.7 }}>
                            {t('password.clear.content')}
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Space style={{ margin: '15px auto 0 auto' }}>
                        <HubButton
                            width={72}
                            size="small"
                            type="default"
                            onClick={closeConfirm}
                        >
                            {t('cancel')}
                        </HubButton>
                        <HubButton width={72} size="small" onClick={clear}>
                            {t('clear')}
                        </HubButton>
                    </Space>
                </Row>
            </Modal>
        </div>
    )
}

export default History
