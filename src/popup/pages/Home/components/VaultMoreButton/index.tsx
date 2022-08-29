import { Button, Dropdown, Menu, Space, Typography, Tooltip } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import comm from '@/utils/communication'
import { useTranslation } from 'react-i18next'
import { VaultItemType } from '@/typings/enums'
import {
    goFillPassword,
    decryptPassword,
    decryptString,
    decryptDetailContent,
    goFillCompanyPassword,
} from '@/services/api/appRequester'
import utils from '@/utils/utils'
import { useEffect, useRef, useState } from 'react'
import styles from '../../index.less'
import store, { Store } from '@/popup/store'

const { Text } = Typography

interface VaultMoreButtonProps {
    vaultItem: Message.VaultItem
    key: string
    personalId: number
}
export const fillPassword = (
    vaultItem: Message.VaultItem,
    personalCallback: (item: Message.PersonalEncryptDetail) => void,
    companyCallback: (item: Message.Detail) => void,
    userprofile: Message.UserProfile
) => {
    const isCompany = utils.isCompany(vaultItem.domainId, userprofile)
    const baseItem = {
        uri: vaultItem.detail.loginUri,
        domainId: vaultItem.domainId,
        alias: vaultItem.alias,
    }
    if (isCompany) {
        const item = {
            ...baseItem,
            account: vaultItem.detail.loginUser,
            password: vaultItem.detail.loginPassword,
        }
        companyCallback(item)
    } else {
        const item = {
            ...baseItem,
            content: vaultItem.detail.content,
        }
        personalCallback(item)
    }
}
const VaultMoreButton = (props: VaultMoreButtonProps) => {
    const MoreButton = ({ _store }: { _store: Store }) => {
        const userprofile = _store.userProfile
        const { t, i18n } = useTranslation()
        const datasetRef = useRef<boolean>(true)
        const [itemDetail, setItemDetail] = useState<any | undefined>(undefined)
        const [isDecrypted, setIsDecrypted] = useState<boolean>(false)

        const decryptData = async (item: Message.VaultItem) => {
            let newDetail: any | undefined
            if (item.itemType === VaultItemType.App) {
                if (
                    Object.prototype.hasOwnProperty.call(item.detail, 'content')
                ) {
                    const detail =
                        await decryptDetailContent<Message.VaultItemLogin>(item)
                    newDetail = { ...detail, loginUri: item.detail.loginUri }
                } else {
                    const detail = item.detail as Message.VaultItemLogin
                    if (detail) {
                        const data: Message.Detail = {
                            account: detail.loginUser,
                            password: detail.loginPassword,
                            uri: detail.loginUri,
                            domainId: item.domainId,
                            alias: item.alias,
                        }
                        const ret = await decryptPassword(data)
                        if (ret.errorId === '0' || !ret.errorId) {
                            newDetail = JSON.parse(JSON.stringify(detail))
                            newDetail.loginPassword = ret.message.password
                        }
                    }
                }
            } else if (item.itemType === VaultItemType.CreditCard) {
                newDetail = await decryptDetailContent(item)
            } else if (item.itemType === VaultItemType.SecureNodes) {
                newDetail = await decryptDetailContent(item)
            } else if (item.itemType === VaultItemType.PersonalInfo) {
                newDetail = await decryptDetailContent(item)
            } else if (item.itemType === VaultItemType.MetaMaskRawData) {
                const detail = item.detail as Message.MetaMaskRawDataDetail
                const pwd = await decryptString(
                    item.domainId,
                    detail.walletPassword
                )
                newDetail = { ...detail, walletPassword: pwd }
            } else if (item.itemType === VaultItemType.MetaMaskMnemonicPhrase) {
                newDetail = await decryptDetailContent(item)
            } else if (item.itemType === VaultItemType.CryptoAddress) {
                newDetail = await decryptDetailContent(item)
            }
            if (datasetRef.current === true) {
                setIsDecrypted(true)
                setItemDetail(newDetail)
            }
        }

        const onClick = (e: any) => {
            e.stopPropagation()
            if (datasetRef.current === true && isDecrypted === false) {
                decryptData(props.vaultItem)
            }
        }

        useEffect(() => {
            datasetRef.current = true
            return () => {
                datasetRef.current = false
            }
        }, [props.vaultItem])

        const onGoFill = async (vaultItem: Message.VaultItem) => {
            fillPassword(
                vaultItem,
                goFillPassword,
                goFillCompanyPassword,
                userprofile
            )
            chrome.tabs.create({
                url: utils.normalizeUrl(vaultItem.detail.loginUri),
            })
        }

        const onFill = (vaultItem: Message.VaultItem) => {
            fillPassword(
                vaultItem,
                comm.fillpassword,
                comm.fillCompanyPassword,
                userprofile
            )
        }

        const copyDetailField = (field: string) => {
            if (itemDetail) utils.copyText(itemDetail[field])
        }

        const onCopyPassword = async () => {
            const detail = itemDetail as Message.VaultItemLogin
            utils.copyText(detail?.loginPassword ?? '')
        }

        const onCopyUserName = () => {
            const detail = itemDetail as Message.VaultItemLogin
            if (detail) {
                utils.copyText(detail.loginUser ?? '')
            }
        }

        const onCreditCopyName = async () => {
            const detail = itemDetail as Message.CreditCardDetail
            utils.copyText(detail?.holder ?? '')
        }

        const onCreditCopyNumber = async () => {
            const detail = itemDetail as Message.CreditCardDetail
            utils.copyText(utils.getRawNumber(detail?.number))
        }

        const onCreditCopyCvv = async () => {
            const detail = itemDetail as Message.CreditCardDetail
            utils.copyText(detail?.cvv ?? '')
        }

        const onCreditCopyZip = async () => {
            const detail = itemDetail as Message.CreditCardDetail
            utils.copyText(detail?.zipOrPostalCode ?? '')
        }

        const onCopySecureNote = async () => {
            const detail = itemDetail as Message.SecureNoteDetail
            utils.copyText(detail?.note ?? '')
        }

        const onInfoCopyFullName = async () => {
            const detail = itemDetail as Message.PersonalInfoDetail
            utils.copyText(detail?.fullName ?? '')
        }

        const onInfoCopyEmail = async () => {
            const detail = itemDetail as Message.PersonalInfoDetail
            utils.copyText(detail?.email ?? '')
        }

        const onInfoCopyPhone = async () => {
            const detail = itemDetail as Message.PersonalInfoDetail
            utils.copyText(detail?.phone ?? '')
        }

        const onInfoCopyAddress = async () => {
            const detail = itemDetail as Message.PersonalInfoDetail
            const addrs: string[] = []
            if (detail?.address1) addrs.push(detail.address1)
            if (detail?.address2) addrs.push(detail.address2)
            if (detail?.city) addrs.push(detail.city)
            if (detail?.province) addrs.push(detail.province)
            if (detail?.country) addrs.push(t(`country.${detail.country}`))
            const address = addrs.join(' ')
            utils.copyText(address ?? '')
        }

        const getMenuListByType = (type: VaultItemType) => {
            let menu
            switch (type) {
                case VaultItemType.App:
                    menu = loginMenu
                    break
                case VaultItemType.SecureNodes:
                    menu = noteMenu
                    break
                case VaultItemType.PersonalInfo:
                    menu = infoMenu
                    break
                case VaultItemType.CreditCard:
                    menu = creditMenu
                    break
                case VaultItemType.MetaMaskRawData:
                    menu = metaMaskRawDataMenu
                    break
                case VaultItemType.MetaMaskMnemonicPhrase:
                    menu = metaMaskMnemonicPhraseMenu
                    break
                default:
                    menu = nothingMenu
                    break
            }
            return menu
        }

        const nothingMenu = <Menu></Menu>

        const infoMenu = (
            <Menu>
                <Menu.Item
                    key="dropdown-note-more-copy-name"
                    onClick={(e) => onInfoCopyFullName()}
                >
                    <Text>{t('vault.more.btn.copyFullName')}</Text>
                </Menu.Item>
                <Menu.Item
                    key="dropdown-note-more-copy-email"
                    onClick={(e) => onInfoCopyEmail()}
                >
                    <Text>{t('vault.more.btn.copyEmail')}</Text>
                </Menu.Item>
                <Menu.Item
                    key="dropdown-note-more-copy-phone"
                    onClick={(e) => onInfoCopyPhone()}
                >
                    <Text>{t('vault.more.btn.copyPhone')}</Text>
                </Menu.Item>
                <Menu.Item
                    key="dropdown-note-more-copy-address"
                    onClick={(e) => onInfoCopyAddress()}
                >
                    <Text>{t('vault.more.btn.copyAddress')}</Text>
                </Menu.Item>
            </Menu>
        )

        const creditMenu = (
            <Menu>
                <Menu.Item
                    key="dropdown-note-more-copy-holder"
                    onClick={(e) => onCreditCopyName()}
                >
                    <Text>{t('vault.more.btn.copyCardName')}</Text>
                </Menu.Item>
                <Menu.Item
                    key="dropdown-note-more-copy-cardNumber"
                    onClick={(e) => onCreditCopyNumber()}
                >
                    <Text>{t('vault.more.btn.copyCardNumber')}</Text>
                </Menu.Item>
                <Menu.Item
                    key="dropdown-note-more-copy-cvv"
                    onClick={(e) => onCreditCopyCvv()}
                >
                    <Text>{t('vault.more.btn.copyCvv')}</Text>
                </Menu.Item>
                <Menu.Item
                    key="dropdown-note-more-copy-zip"
                    onClick={(e) => onCreditCopyZip()}
                >
                    <Text>{t('vault.more.btn.copyZip')}</Text>
                </Menu.Item>
            </Menu>
        )

        const noteMenu = (
            <Menu>
                <Menu.Item
                    key="dropdown-note-more-copy"
                    onClick={(e) => onCopySecureNote()}
                >
                    <Text>{t('vault.more.btn.copy')}</Text>
                </Menu.Item>
            </Menu>
        )

        const loginMenu = (
            <Menu>
                <Menu.Item
                    key="dropdown-vault-more-go-fill"
                    onClick={(e) => onGoFill(props.vaultItem)}
                >
                    <Text>{t('Go Fill')}</Text>
                </Menu.Item>
                <Menu.Item
                    key="dropdown-vault-more-fill1"
                    onClick={(e) => onFill(props.vaultItem)}
                >
                    <Text>{t('Fill')}</Text>
                </Menu.Item>
                <Menu.Item
                    key="dropdown-vault-more-fill2"
                    hidden={props.personalId !== props.vaultItem.domainId}
                    onClick={(e) => onCopyPassword()}
                >
                    <Text>{t('Copy Password')}</Text>
                </Menu.Item>
                <Menu.Item
                    key="dropdown-vault-more-fill3"
                    onClick={(e) => onCopyUserName()}
                >
                    <Text>{t('Copy Login Name')}</Text>
                </Menu.Item>
            </Menu>
        )

        const metaMaskRawDataMenu = (
            <Menu>
                <Menu.Item
                    key="dropdown-raw-data-walletPassword"
                    onClick={() => copyDetailField('walletPassword')}
                >
                    <Text>{t('vault.more.btn.copyWalletPassword')}</Text>
                </Menu.Item>
            </Menu>
        )

        const metaMaskMnemonicPhraseMenu = (
            <Menu>
                <Menu.Item
                    key="dropdown-mnemonic-phrase-phrase"
                    onClick={() => copyDetailField('mnemonicPhrase')}
                >
                    <Text>{t('vault.more.btn.copyMnemonicPhrase')}</Text>
                </Menu.Item>
                {itemDetail && itemDetail.walletPassword ? (
                    <Menu.Item
                        key="dropdown-mnemonic-phrase-walletPassword"
                        onClick={() => copyDetailField('walletPassword')}
                    >
                        <Text>{t('vault.more.btn.copyWalletPassword')}</Text>
                    </Menu.Item>
                ) : (
                    <></>
                )}
            </Menu>
        )
        return props.vaultItem.itemType === VaultItemType.CryptoAddress ||
            (props.vaultItem.itemType === VaultItemType.MetaMaskRawData &&
                !props.vaultItem.detail.walletPassword) ? (
            <></>
        ) : (
            <Space onClick={(e) => onClick(e)}>
                <Dropdown
                    overlay={getMenuListByType(props.vaultItem.itemType)}
                    placement="bottomLeft"
                    trigger={['click']}
                >
                    <Button key={props.key}>
                        <Tooltip title={t('more') + '...'}>
                            <MoreOutlined className={styles.actionIcon} />
                        </Tooltip>
                    </Button>
                </Dropdown>
            </Space>
        )
    }
    return <MoreButton _store={store}></MoreButton>
}

export default VaultMoreButton
