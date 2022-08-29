import { Store } from '@/contents/all/store'
import Image from '@/contents/all/components/Image'
import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import comm from '@/utils/communication'
import utils from '@/utils/utils'
import PasswordGenerator from '@/contents/all/pages/PasswordGenerator'

export type DataType = VaultItemStrType
type Props = {
    store: Store
    type: DataType
}
export type Item = {
    alias: string
    imgUri: string
} & any

const List = observer(({ store, type }: Props) => {
    let removeIcon: Store['removeIcon']
    let dataList: Message.VaultItem[]
    switch (type) {
        case 'app':
            dataList = store.appList
            removeIcon = store.removeIcon.bind(store)
            break
        case 'credit':
            dataList = store.creditCardList
            removeIcon = store.removeCardIcon.bind(store)
            break
        case 'info':
            dataList = store.personalInfoList
            removeIcon = store.removePersonalInfoIcon.bind(store)
            break
        case 'generator':
            dataList = []
            removeIcon = store.removGeneratorIcon.bind(store)
            break
        case 'totp':
            dataList = store.toTpList
            removeIcon = store.removeTotpIcon.bind(store)
            break
    }

    const handleClick = (data: Item) => {
        removeIcon()
        switch (type) {
            case 'app': {
                const isCompany = utils.isCompany(
                    data.domainId,
                    store.getUserprofile()
                )
                const baseItem = {
                    alias: data.alias,
                    imgUri: data.detail.imgUri,
                    uri: data.detail.loginUri,
                    domainId: data.domainId,
                }
                store.setAppIconCanShow(false)
                if (isCompany) {
                    const item = {
                        ...baseItem,
                        password: data.detail.loginPassword,
                        account: data.detail.loginUser,
                    }
                    comm.fillCompanyPassword(item)
                } else {
                    const item = {
                        ...baseItem,
                        content: data.detail.content,
                    }
                    comm.fillpassword(item)
                }
                break
            }
            case 'info':
                store.setPersonalIconCanShow(false)
                comm.fillPageByTabId(data, store.tabId)
                break
            case 'credit':
                store.setCreditIconCanShow(false)
                comm.fillPageByTabId(data, store.tabId)
                break
            case 'totp':
                store.setTotpIconCanShow(false)
                comm.fillPageByTabId(data, store.tabId)
                break
            default:
                comm.fillPageByTabId(data, store.tabId)
        }
    }
    const Item = useCallback(({ item }: { item: Item }) => {
        return (
            <li
                className="list-item"
                onClick={(e) => {
                    e.stopPropagation()
                    handleClick(item)
                }}
            >
                <div className="item-containter">
                    <div className="list-item-icon-wrapper">
                        <Image src={utils.getIconUrl(item)} />
                    </div>
                    <div className="list-item-content">
                        <span>{item.alias}</span>
                    </div>
                </div>
            </li>
        )
    }, [])

    return (
        <div>
            {type === 'generator' ? (
                <div>
                    <PasswordGenerator store={store} />
                </div>
            ) : (
                <div style={{ width: 150 }}>
                    {dataList!.map((item, index) => (
                        <Item item={item} key={index} />
                    ))}
                </div>
            )}
        </div>
    )
})

export default List
