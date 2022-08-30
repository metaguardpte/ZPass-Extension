import { VaultItemType } from '@/typings/enums'
import moment from 'moment'
import store from '@/popup/store'
import { HOTP, TOTP, URI } from 'otpauth'
import IconMap from '@/popup/pages/Home/components/IconMap'

const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss'

interface Utils {
    normalizeUrl: (url: string) => string
    getUrlOrigin: (url: string) => string
    getUrlHost: (url: string) => string
    match: (uri1: string, uri2: string) => boolean
    getIconUrl: (
        item: Message.VaultItem,
        type?: 'list' | 'detail'
    ) => string | React.ReactNode
    getItemTitle: (
        item: Message.VaultItem
    ) => Promise<[string, string, boolean]>
    useLocalTime: (datetime: string) => string
    copyText: (text: string) => void
    log: (message?: any, ...params: any[]) => void
    getRawNumber: (number?: string) => string
    isCompany: (domainId: number, userProfile: Message.UserProfile) => boolean
    createTOTP: (secret: any) => HOTP | TOTP | null
    getImgUriByType: (cardType: string | undefined) => string | null
}
const removeBlank = (secret: any) => {
    return secret.replace(/\s/g, '')
}
const _default: Utils = {
    normalizeUrl: function (url: string) {
        if (!/https?:\/\//.test(url)) {
            return 'https://' + url
        }
        return url
    },
    getImgUriByType(cardType: string | undefined) {
        const supportTypes = [
            'american-express',
            'unionpay',
            'visa',
            'diners-club',
            'discover',
            'jcb',
            'maestro',
            'mastercard',
        ]
        if (!cardType || !supportTypes.find((type) => type === cardType)) {
            return null
        }
        return `/images/icons/credit-card-${cardType}.png`
    },
    getUrlOrigin: function (url: string): string {
        let result: string = ''
        try {
            result = new URL(this.normalizeUrl(url)).origin
        } catch (error) {}
        return result
    },
    getUrlHost: function (url: string): string {
        let result: string = ''
        try {
            result = new URL(this.normalizeUrl(url)).host
        } catch (error) {}
        return result
    },
    match(uri1: string, uri2: string) {
        let host1 = this.getUrlHost(uri1)
        let host2 = this.getUrlHost(uri2)
        host2 = host2.replace(/\.[A-Za-z]+$/, '')
        host1 = host1.replace(/\.[A-Za-z]+$/, '')
        return host1.toLocaleLowerCase() === host2.toLocaleLowerCase()
    },
    getIconUrl: function (item: Message.VaultItem, type) {
        let size = 30
        if (type === 'list') {
            size = 20
        }
        let src: string | React.ReactNode = IconMap(item.itemType, size)
        switch (item.itemType) {
            case VaultItemType.App:
                {
                    const detail = item.detail as Message.VaultItemLogin
                    const origin = this.getUrlOrigin(detail.loginUri)
                    src = `${origin}/favicon.ico`
                }
                break
            case VaultItemType.CreditCard:
                if (item.detail.cardType) {
                    const address = this.getImgUriByType(item.detail.cardType)
                    if (address) {
                        src = chrome.runtime.getURL(address)
                    }
                }
                break
            default:
                break
        }
        return src
    },
    getItemTitle: async function (
        item: Message.VaultItem
    ): Promise<[string, string, boolean]> {
        let title = item.alias ?? item.description
        let subTitle = ''
        let needTranslate = false
        switch (item.itemType) {
            case VaultItemType.App:
                title = item.alias ?? item.description
                subTitle = 'Login'
                break
            case VaultItemType.SecureNodes:
                title = item.name
                subTitle = 'Secure Note'
                break
            case VaultItemType.MetaMaskRawData:
                title = item.name
                subTitle = 'vault.cryptoWallet.rawData'
                needTranslate = true
                break
            case VaultItemType.MetaMaskMnemonicPhrase:
                title = item.name
                subTitle = 'vault.cryptoWallet.mnemonicPhrase'
                needTranslate = true
                break
            default:
                title = item.name
                subTitle = item.description
                break
        }
        return [title, subTitle, needTranslate]
    },
    copyText: function (text: string): void {
        if (document.hasFocus()) {
            navigator.clipboard.writeText(text)
        }
    },
    log: function (message?: any, ...optionalParams: any[]): void {
        // console.log(message, ...optionalParams)
    },
    getRawNumber: function (number?: string): string {
        if (number === undefined) return ''
        return number.replaceAll(' ', '')
    },
    useLocalTime: function (datetime: string) {
        return `${moment
            .utc(datetime)
            .utcOffset(store.userProfile.timezone!)
            .format(dateTimeFormat)} (GMT${store.userProfile.timezone!})`
    },
    isCompany(domainId, userProfile) {
        const domain = userProfile.domains?.find(
            (item) => item.domainType === 1
        )!
        return domain.domainId !== domainId
    },

    createTOTP(secret: any) {
        let totp: TOTP | HOTP
        try {
            if (secret.startsWith('otpauth')) {
                totp = URI.parse(secret)
            } else {
                totp = new TOTP({ secret: removeBlank(secret) })
            }
            return totp
        } catch {
            return null
        }
    },
}

export default _default
