declare type MsgType =
    | 'GetListFromExtension'
    | 'GetFillPasswordFromExtension'
    | 'ReturnListFromApp'
    | 'ReturnFillPasswordFromApp'
    | 'ReturnWorkListFromWeb'
    | 'ReturnPersonalListFromWeb'
    | 'DecryptFromExtension'
    | 'DecryptAndNotSendPasswordFromExtension'
    | 'ReturnUserProfileFromApp'
    | 'GetUserProfileFromExtension'
    | 'ReturnSavePasswordFromApp'
    | 'DecryptAndReturnPasswordFromExtension'
    | 'LoginFromExtension'
    | 'LogoutFromExtension'
    | 'LockFromExtension'
    | 'NotInstall'
    | 'GetActiveTabUrl'
    | 'ReturnActiveTabUrl'
    | 'CurrentCredential'
    | 'PasswordControlHidden'
    | 'PopSavePassword'
    | 'NotPasswordControl'
    | 'GetPasswordCheckingFromExtension'
    | 'ReturnPasswordCheckingFromExtension'
    | 'HavePasswordControl'
    | 'SavePasswordFromExtension'
    | 'ReturnSavePasswordFromExtension'
    | 'ReturnIconPositionFromExtension'
    | 'ReturnIconVisibleFromExtension'
    | 'DistributeConnectionPort'
    | 'DecryptTextFromExtension'
    | 'HearbeatFromContent'
    | 'RegisterTabFromContent'
    | 'CommonFromContent'
    | 'GetPasswordHistoryAll'
    | 'PostPasswordHistory'
    | 'DeletePasswordHistory'
    | 'DeletePasswordHistoryAll'
    | 'ExtensionHeartbeat'
    | 'CompanyDecryptFromExtension'
    | 'DecryptAndNotSendCompanyPasswordFromExtension'
    | 'SetCopiedTextFromExtension'

declare type CommonContentMsgType =
    | 'fillPage'
    | 'needPosition'
    | 'personalInfoIconCanShow'
    | 'personalInfoIconInit'
    | 'creditCardIconInit'
    | 'creditCardIconCanShow'
    | 'personalInfoIconPosition'
    | 'creditCardIconPosition'
    | 'appIconInit'
    | 'appIconCanShow'
    | 'appPosition'
    | 'generatorIconCanShow'
    | 'generatorPosition'
    | 'fillGeneratorPassword'
    | 'totpIconInit'
    | 'totpIconCanShow'
    | 'totpPosition'
type CredCheckStatus = 'new' | 'existed' | 'update'
declare type VaultItemStrType =
    | 'app'
    | 'note'
    | 'info'
    | 'credit'
    | 'generator'
    | 'totp'
    | 'metaMaskData'
    | 'metaMaskMnemonicPhrase'
    | 'cryptoAddress'

declare type AllTabType = VaultItemStrType | 'all' | 'cryptoWallet'

declare namespace Message {
    interface ContentMsg<T = any> {
        tabId: number
        type: CommonContentMsgType
        data?: T
    }
    interface Position {
        isTop: boolean
        top?: number
        left?: number
        right?: number
        bottom?: number
        href?: string
        name?: string
        width?: number
        height?: number
        tabId?: number
        type?: VaultItemStrType
    }
    interface Detail {
        account: string
        password: string
        uri: string
        alias: string
        domainId: number
        isCompany?: boolean
        imgUri?: string
    }
    interface PersonalEncryptDetail {
        domainId: number
        alias: string
        uri: string
        imgUri?: string
        content: string
    }
    interface Credential {
        username: string
        password: string
        tabId: number
        uri: string
    }
    interface CredentialSave extends Credential {
        id: number
        domainId: number
        description: string
    }
    interface CredentialStatus extends Credential {
        status: CredCheckStatus
        id: number
        alias: string
        domainId: number
        name?: string
        note?: string
    }
    interface CheckPasswordStatus {
        status: CredCheckStatus
        id: number
        domainId: number
        tabId: number
        alias: string
    }
    interface ExtensionsMessage<T = any> {
        type: MsgType
        message?: T
        errorId?: string
        name?: string
    }

    interface VaultItemLogin {
        clientMachineId: number
        loginPassword: string
        loginUri: string
        loginUser: string
        imgUri?: string
        oneTimePassword: string
        note: string
        content?: string
    }

    interface ItemDescrypt {
        text: string
        itemId: number
        domainId: number
    }

    interface VaultItem<T = any> {
        alias: string
        description: string
        detail: T
        domainId: number
        star: boolean
        id: number | string
        itemType: number
        key: string
        name: string
        type: number
        lastModified: string
    }
    interface Domain {
        company: string
        domainId: number
        domainName: string
        domainType: number
        isActive: boolean
        isAdmin: boolean
        isOwner: boolean
        logo: string
    }
    interface UserProfile {
        domains?: Domain[]
        email?: string
        id?: number
        timezone?: string
        userName?: string
        userType?: number
        isLocked?: boolean
    }

    interface SecureNoteDetail {
        title: string
        note: string
    }

    interface PersonalInfoDetail {
        title: string
        fullName: string
        email: string
        phone: string
        address1: string
        address2: string
        city: string
        province: string
        zipCode: string
        country: string
        note: string
    }

    interface CreditCardDetail {
        title: string
        holder: string
        number: string
        expiry: string
        cvv: string
        zipOrPostalCode: string
        pin: string
        note: string
    }

    interface MetaMaskRawDataDetail {
        title: string
        dataFile: string
        walletPassword: string
        note: string
    }

    interface MetaMaskMnemonicPhraseDetail {
        title: string
        mnemonicPhrase: string
        walletPassword: string
        defaultNetwork: number
        note: string
    }

    interface CryptoAddressDetail {
        title: string
        addresses: {
            address: string
            privateKey: string
            note: string
        }[]
    }

    interface DecryptItem {
        domainId: number
        text: string
    }

    interface EncryptDetail {
        content: string
    }

    interface EncryptCreditDetail extends EncryptDetail {
        cardType: string
    }

    interface EncryptLoginDetail extends EncryptDetail {
        loginUri: string
    }

    interface PasswordHistoryItem {
        id?: number
        password: string
        source: number
        description: string
        createTime?: string
    }
}
