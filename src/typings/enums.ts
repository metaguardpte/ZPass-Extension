export enum VaultItemType {
    App = 0,
    SecureNodes = 1,
    CreditCard = 2,
    PersonalInfo = 3,
    MetaMaskRawData = 4,
    MetaMaskMnemonicPhrase = 5,
    CryptoAddress = 6,
}

export const vaultItemTypeMap: {
    [key: string]: VaultItemType | VaultItemType[]
} = {
    app: VaultItemType.App,
    note: VaultItemType.SecureNodes,
    credit: VaultItemType.CreditCard,
    info: VaultItemType.PersonalInfo,
    cryptoWallet: [
        VaultItemType.MetaMaskRawData,
        VaultItemType.MetaMaskMnemonicPhrase,
    ],
    cryptoAddress: VaultItemType.CryptoAddress,
}
