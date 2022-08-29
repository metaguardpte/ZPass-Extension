import { VaultItemType } from '@/typings/enums'
import { Key, FolderOpen, BankCard, IdCardH, Brain } from '@icon-park/react'
import CryptoAddress from './CryptoAddress'

export type SvgProps = {
    size?: number
    fill?: string
    hover?: string
}

const IconMap = (type: VaultItemType, size: number) => {
    switch (type) {
        case VaultItemType.App: {
            const Icon = Key
            return <Icon fill="#be94f0" size={size} />
        }
        case VaultItemType.SecureNodes: {
            const Icon = FolderOpen
            return <Icon fill="#efb271" size={size} />
        }
        case VaultItemType.CreditCard: {
            const Icon = BankCard
            return <Icon fill="#b4d988" size={size} />
        }
        case VaultItemType.PersonalInfo: {
            const Icon = IdCardH
            return <Icon fill="#f77878" size={size} />
        }
        case VaultItemType.MetaMaskMnemonicPhrase: {
            const Icon = Brain
            return <Icon fill="#80b4f0" size={size} />
        }
        case VaultItemType.CryptoAddress: {
            const Icon = CryptoAddress
            return <Icon fill="#59d7c5" size={size} />
        }
        case VaultItemType.MetaMaskRawData: {
            const foxImg = (
                <img
                    style={{ width: size, height: size }}
                    src="/images/icons/foxwallet.svg"
                />
            )
            return foxImg
        }
        default:
            return <></>
    }
}

export default IconMap
