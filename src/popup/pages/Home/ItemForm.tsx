import store from '@/popup/store'
import { useNavigate, useParams } from 'react-router-dom'
import { Space } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import LoginForm from './components/Forms/LoginForm'
import styles from './index.less'
import { useEffect, useState } from 'react'
import { VaultItemType } from '@/typings/enums'
import NoteForm from './components/Forms/NoteForm'
import CreditCardForm from './components/Forms/CreditCardForm'
import PersonalInfoForm from './components/Forms/PersonalInfoDetail'
import MetaMaskRawDataForm from './components/Forms/MetaMaskDataForm'
import MetaMaskMnemonicPhraseForm from './components/Forms/MetaMaskPhraseForm'
import CryptoAddressForm from './components/Forms/CryptoAddressForm'
import ScrollContainer from '@/popup/components/ScrollContainer'

const ItemForm = () => {
    const { id } = useParams()
    const naigate = useNavigate()
    const [vualtItem, setVualtItem] = useState<Message.VaultItem>()

    const onBack = () => {
        naigate(-1)
    }

    useEffect(() => {
        if (id) {
            const item = store.vaultItems.find(
                (v) => v.id.toString() === id.toString()
            )
            setVualtItem(item)
        }
    })

    const FormSwitcher = (props: { item?: Message.VaultItem }) => {
        if (
            props.item !== undefined &&
            props.item?.itemType === VaultItemType.App
        ) {
            return (
                <LoginForm
                    item={
                        props.item as Message.VaultItem<Message.VaultItemLogin>
                    }
                />
            )
        } else if (
            props.item !== undefined &&
            props.item?.itemType === VaultItemType.SecureNodes
        ) {
            return (
                <NoteForm
                    item={
                        props.item as Message.VaultItem<Message.EncryptDetail>
                    }
                />
            )
        } else if (
            props.item !== undefined &&
            props.item?.itemType === VaultItemType.CreditCard
        ) {
            return (
                <CreditCardForm
                    item={
                        props.item as Message.VaultItem<Message.EncryptCreditDetail>
                    }
                />
            )
        } else if (
            props.item !== undefined &&
            props.item?.itemType === VaultItemType.PersonalInfo
        ) {
            return (
                <PersonalInfoForm
                    item={
                        props.item as Message.VaultItem<Message.EncryptDetail>
                    }
                />
            )
        } else if (
            props.item !== undefined &&
            props.item?.itemType === VaultItemType.MetaMaskRawData
        ) {
            return (
                <MetaMaskRawDataForm
                    item={
                        props.item as Message.VaultItem<Message.MetaMaskRawDataDetail>
                    }
                />
            )
        } else if (
            props.item !== undefined &&
            props.item?.itemType === VaultItemType.MetaMaskMnemonicPhrase
        ) {
            return (
                <MetaMaskMnemonicPhraseForm
                    item={
                        props.item as Message.VaultItem<Message.EncryptDetail>
                    }
                />
            )
        } else if (
            props.item !== undefined &&
            props.item?.itemType === VaultItemType.CryptoAddress
        ) {
            return (
                <CryptoAddressForm
                    item={
                        props.item as Message.VaultItem<Message.EncryptDetail>
                    }
                />
            )
        }

        return <></>
    }

    const Header = () => {
        return (
            <div>
                <div style={{ height: 30, backgroundColor: '#4B5DFE' }}></div>
                <Space className={styles.hubDetailHeader}>
                    <div
                        className={styles.switchButton}
                        onClick={(e) => onBack()}
                    >
                        <LeftOutlined style={{ fontSize: 16 }} />
                    </div>
                </Space>
            </div>
        )
    }

    return (
        <div className={styles.hubHome}>
            <Header />
            <div style={{ height: 400 }}>
                <ScrollContainer>
                    <div style={{ padding: '0px 10px 10px 10px' }}>
                        <FormSwitcher item={vualtItem} />
                    </div>
                </ScrollContainer>
            </div>
        </div>
    )
}

export default ItemForm
