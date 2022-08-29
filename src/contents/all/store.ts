import { makeAutoObservable } from 'mobx'
import React from 'react'

export class Store {
    credential: Message.CredentialStatus | null = null
    controlIconStyle: React.HTMLAttributes<HTMLDivElement>['style'] = {
        position: 'fixed',
        zIndex: 2147483647,
        visibility: 'hidden',
    }

    cardIconStyle: React.HTMLAttributes<HTMLDivElement>['style'] = {
        position: 'fixed',
        zIndex: 2147483647,
        visibility: 'hidden',
    }

    personalInfoIconStyle: React.HTMLAttributes<HTMLDivElement>['style'] = {
        position: 'fixed',
        zIndex: 2147483647,
        visibility: 'hidden',
    }

    generatorIconStyle: React.HTMLAttributes<HTMLDivElement>['style'] = {
        position: 'fixed',
        zIndex: 2147483647,
        visibility: 'hidden',
    }

    totpIconStyle: React.HTMLAttributes<HTMLDivElement>['style'] = {
        position: 'fixed',
        zIndex: 2147483647,
        visibility: 'hidden',
    }

    appList: Message.VaultItem<Message.VaultItemLogin>[] = []
    creditCardList: Message.VaultItem<Message.CreditCardDetail>[] = []
    personalInfoList: Message.VaultItem<Message.PersonalInfoDetail>[] = []
    toTpList: Message.VaultItem<Message.VaultItemLogin>[] = []
    tabId: number = -1
    private hasPersonalField = false
    private hasCreditCardField = false
    private appIconCanShow = true
    private creditIconCanShow = true
    private personalIconCanShow = true
    private generatorIconCanShow = false
    private totpIconCanShow = true
    private personalIconInit = false
    private creditIconInit = false
    private appIconInit = false
    private totpIconInit = false
    private userprofile: Message.UserProfile

    setAppList(value: Store['appList']) {
        this.appList = value
        this.showAppIcon.call(this)
    }

    setPersonalIconInit(value: boolean) {
        this.personalIconInit = value
        if (this.personalIconInit) {
            this.hasPersonalField = true
            this.hiddenAppIcon.call(this)
        }
        this.showPersonalInfoIcon.call(this)
    }

    setAppIconInit(value: boolean) {
        this.appIconInit = value
        this.showAppIcon.call(this)
    }

    setTotpIconInit(value: boolean) {
        this.totpIconInit = value
        this.showTotpIcon.call(this)
    }

    setCreditIconInit(value: boolean) {
        this.creditIconInit = value
        if (this.creditIconInit) {
            this.hasCreditCardField = true
            this.hiddenAppIcon.call(this)
        }
        this.showCreditCardIcon.call(this)
    }

    showPersonalInfoIcon() {
        this.setPersonalInfoIconVisibility(
            !!(
                this.personalIconInit &&
                this.personalIconCanShow &&
                this.personalInfoList.length
            )
        )
    }

    showAppIcon() {
        this.setAppIconVisibility(
            !!(
                this.appIconInit &&
                this.appIconCanShow &&
                this.appList.length &&
                !this.hasPersonalField &&
                !this.hasCreditCardField
            )
        )
    }

    showTotpIcon() {
        this.setTotpIconVisibility(
            !!(
                this.totpIconInit &&
                this.totpIconCanShow &&
                this.toTpList.length
            )
        )
    }

    showCreditCardIcon() {
        this.setCreditCardIconVisibility(
            !!(
                this.creditIconInit &&
                this.creditIconCanShow &&
                this.creditCardList.length
            )
        )
    }

    showGeneratorIcon() {
        this.setGeneratorIconVisibility(!!this.generatorIconCanShow)
    }

    hiddenCreditCardIcon() {
        this.setCreditCardIconVisibility(false)
    }

    hiddenPersonalInfoIcon() {
        this.setPersonalInfoIconVisibility(false)
    }

    hiddenAppIcon() {
        this.setAppIconVisibility(false)
    }

    hiddenGeneratorIcon() {
        this.setGeneratorIconVisibility(false)
    }

    setTabId(value: number) {
        this.tabId = value
    }

    setCreditCardList(value: Store['creditCardList']) {
        this.creditCardList = value
        this.showCreditCardIcon.call(this)
    }

    setTotpList(value: Store['toTpList']) {
        this.toTpList = value
        this.showTotpIcon.call(this)
    }

    setPersonalInfoList(value: Store['personalInfoList']) {
        this.personalInfoList = value
        this.showPersonalInfoIcon.call(this)
    }

    setAppIconCanShow(value: boolean) {
        this.appIconCanShow = value
        this.showAppIcon.call(this)
    }

    setCreditIconCanShow(value: boolean) {
        this.creditIconCanShow = value
        this.showCreditCardIcon.call(this)
    }

    setPersonalIconCanShow(value: boolean) {
        this.personalIconCanShow = value
        this.showPersonalInfoIcon.call(this)
    }

    setGeneratorIconCanShow(value: boolean) {
        this.generatorIconCanShow = value
        this.setGeneratorIconVisibility(this.generatorIconCanShow)
    }

    setTotpIconCanShow(value: boolean) {
        this.totpIconCanShow = value
        this.showTotpIcon.call(this)
    }

    setCredential(value: Store['credential']) {
        this.credential = value
    }

    removeIcon() {
        this.controlIconStyle!.visibility = 'hidden'
    }

    removeCardIcon() {
        this.cardIconStyle!.visibility = 'hidden'
    }

    removePersonalInfoIcon() {
        this.personalInfoIconStyle!.visibility = 'hidden'
    }

    removGeneratorIcon() {
        this.generatorIconStyle!.visibility = 'hidden'
    }

    removeCredential() {
        this.credential = null
    }

    removeTotpIcon() {
        this.setTotpIconVisibility.call(this, false)
    }

    setPersonalInfoIconVisibility(value: boolean) {
        this.personalInfoIconStyle!.visibility = value ? 'visible' : 'hidden'
    }

    setAppIconVisibility(value: boolean) {
        this.controlIconStyle!.visibility = value ? 'visible' : 'hidden'
    }

    setTotpIconVisibility(value: boolean) {
        this.totpIconStyle!.visibility = value ? 'visible' : 'hidden'
    }

    setCreditCardIconVisibility(value: boolean) {
        this.cardIconStyle!.visibility = value ? 'visible' : 'hidden'
    }

    setGeneratorIconVisibility(value: boolean) {
        this.generatorIconStyle!.visibility = value ? 'visible' : 'hidden'
    }

    changeIconPosition(
        top: string,
        left: string | undefined,
        right: string | undefined
    ) {
        this.controlIconStyle!.top = top
        this.controlIconStyle!.left = left
        this.controlIconStyle!.right = right
    }

    changeCardIconPosition(
        top: string,
        left: string | undefined,
        right: string | undefined
    ) {
        this.cardIconStyle!.top = top
        this.cardIconStyle!.left = left
        this.cardIconStyle!.right = right
    }

    changePersonalInfoIconPosition(
        top: string,
        left: string | undefined,
        right: string | undefined
    ) {
        this.personalInfoIconStyle!.top = top
        this.personalInfoIconStyle!.left = left
        this.personalInfoIconStyle!.right = right
    }

    changeGeneratorIconPosition(
        top: string,
        left: string | undefined,
        right: string | undefined
    ) {
        this.generatorIconStyle!.top = top
        this.generatorIconStyle!.left = left
        this.generatorIconStyle!.right = right
    }

    changeTotpIconPosition(
        top: string,
        left: string | undefined,
        right: string | undefined
    ) {
        this.totpIconStyle!.top = top
        this.totpIconStyle!.left = left
        this.totpIconStyle!.right = right
    }

    setUserprofile(userprofile: Message.UserProfile) {
        this.userprofile = userprofile
    }

    getUserprofile() {
        return this.userprofile
    }

    constructor() {
        makeAutoObservable(this)
    }
}
export default new Store()
