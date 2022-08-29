import { makeAutoObservable } from 'mobx'
import { VaultItemType } from '@/typings/enums'

interface IStoreData {
    vaultItems: Message.VaultItem[]
    validVaultItems: Message.VaultItem[]
    userProfile: Message.UserProfile
    isStarted: boolean
    isAppInstalled: boolean
    personalId: number
    listTab?: string
    allTabType?: AllTabType
}

const isLoginNeedEnv = (item: Message.VaultItem) => {
    if (item.itemType !== VaultItemType.App) {
        return false
    }
    const detail = item.detail as Message.VaultItemLogin
    return detail.clientMachineId > 0
}

const sortItems = (items: Message.VaultItem[]) => {
    return items.sort((a, b) => {
        if (a.lastModified > b.lastModified) return -1
        if (a.lastModified < b.lastModified) return 1
        return a.name.localeCompare(b.name)
    })
}
export class Store {
    obj: IStoreData = {
        vaultItems: [],
        validVaultItems: [],
        userProfile: {},
        isStarted: false,
        isAppInstalled: true,
        personalId: -1,
    }

    userRole = 'owner'
    constructor() {
        makeAutoObservable(this)
    }

    get validVaultItems() {
        return this.obj.validVaultItems ?? []
    }

    get vaultItems() {
        return this.obj.vaultItems || []
    }

    get personalId() {
        return this.obj.personalId
    }

    set vaultItems(value: Message.VaultItem[]) {
        this.obj.vaultItems = sortItems(value || [])
        this.obj.validVaultItems = this.obj.vaultItems.filter(
            (v) => !isLoginNeedEnv(v)
        )
    }

    get userProfile() {
        return this.obj.userProfile
    }

    set userProfile(value: Message.UserProfile) {
        this.obj.userProfile = value
        let tempId = -1
        const domain = value.domains?.find((item) => item.domainType === 1)
        if (domain) {
            tempId = domain.domainId
        }
        this.obj.personalId = tempId
    }

    get isStarted() {
        return this.obj.isStarted
    }

    set isStarted(value: boolean) {
        this.obj.isStarted = value
    }

    get isLogin() {
        const ret = !(
            this.obj.userProfile.userName === undefined ||
            this.obj.userProfile.userName === ''
        )
        return ret
    }

    get isLock() {
        return this.obj.userProfile.isLocked
    }

    get isAppInstalled() {
        return this.obj.isAppInstalled
    }

    set isAppInstalled(value: boolean) {
        this.obj.isAppInstalled = value
    }

    get listTab() {
        return this.obj.listTab
    }

    set listTab(tab: string | undefined) {
        this.obj.listTab = tab
    }

    get allTabType() {
        return this.obj.allTabType
    }

    set allTabType(type: AllTabType | undefined) {
        this.obj.allTabType = type
    }
}
export default new Store()
