import $ from 'jquery-slim'
import FieldSet from './FieldSet'
import GeneratorFieldSet from './PasswordGenerator/GeneratorFieldSet'
import { ISettings, defaultSettings } from '@/Settings'
import utils from '@/utils/utils'
import { isUndefined } from 'lodash'
import comm, { IMessageHandler } from '@/utils/communication'
import ReactRender from '@/contents/all/pages'
import lazyStyles from '@/less/pop.lazy.less'
import store from '@/contents/all/store'
import { VaultItemType } from '@/typings/enums'
import {
    appRequester,
    getFillPassword,
    decryptDetailContent,
    decryptString,
} from '@/services/api/appRequester'
import getField, { FieldResult } from '@/contents/all/classes/getField'
import element from '@/utils/element'

function positionIcon(position: Message.Position, minRightWidht = 400) {
    let top = position.top
    let left = position.left
    let right = position.right

    if (!position.isTop) {
        const getDomRect = (
            href: string,
            name: string
        ): DOMRect | undefined => {
            for (const el of document.getElementsByTagName('iframe')) {
                if ((href && el.src === href) || (name && el.name === name)) {
                    return el.getBoundingClientRect()
                }
            }
        }
        const domRect = getDomRect(position.href!, position.name!)
        if (domRect) {
            top = domRect.top + position?.top!
            left = domRect.left + position?.left!
            right = domRect.right + position?.right!
        }
    }
    const iconWidth = 30
    if (
        top !== undefined &&
        left !== undefined &&
        right !== undefined &&
        position.width &&
        position.left !== undefined
    ) {
        const realTop = `${top - iconWidth / 2}px`
        const bodyWidth = document.body.scrollWidth
        let realLeft, realRight
        if (bodyWidth - left > minRightWidht) {
            realLeft = `${left + position.width - iconWidth / 2}px`
            realRight = undefined
        } else {
            realLeft = undefined
            realRight = `${bodyWidth - left - position.width - iconWidth / 2}px`
        }
        return {
            realTop,
            realLeft,
            realRight,
        }
    }
    return null
}
export default class PageControl implements IMessageHandler {
    private _installedEscapeHandler = false
    private _fieldSets = new Map<HTMLElement, FieldSet | GeneratorFieldSet>()
    private _settings: ISettings = defaultSettings
    /** The dropdown that allows the user to choose credentials  */
    public currentUrl: string
    public tabId: number
    private allCredentials: Message.VaultItem<Message.VaultItemLogin>[] = []
    private userProfile: Message.UserProfile
    public _filledCredential: Message.Detail
    public isOwner = false
    private fieldControl: FieldResult
    private timer: NodeJS.Timer | null = null

    constructor() {
        if (window.top === window.self) {
            window.addEventListener('DOMContentLoaded', () => {
                const popPage = document.createElement('div')
                const shadowDom = popPage.attachShadow({ mode: 'closed' })
                lazyStyles.use({ target: shadowDom })
                const link = document.createElement('link')
                link.setAttribute('rel', 'stylesheet')
                link.setAttribute('href', chrome.runtime.getURL('css/antd.css'))
                shadowDom.appendChild(link)
                const reactDom = document.createElement('div')
                ReactRender(reactDom)
                shadowDom.appendChild(reactDom)
                document.body.appendChild(popPage)
            })
            utils.log('is top window', window.top === window.self)
            window.addEventListener(
                'resize',
                this.sendResizeFromContent.bind(this)
            )
            window.addEventListener(
                'scroll',
                this.sendResizeFromContent.bind(this)
            )
        }
        comm.startUp(this, window.top === window.self)
        window.addEventListener('load', () => {
            if (this.fieldControl) {
                this.fieldControl.detectFieldsByInput()
            }
        })
        chrome.storage.sync.get(defaultSettings, (items) => {
            this._settings = items as ISettings
        })

        setInterval(() => {
            for (const [controlField, fieldSet] of this._fieldSets) {
                const { visibility } = getComputedStyle(controlField)
                if (visibility === 'visible') {
                    setTimeout(() => fieldSet.controlFieldIcon?.create(), 100) // 解决outlock登陆页图标无法显示
                }
            }
        }, 300)
    }

    private sendResizeFromContent() {
        store.hiddenCreditCardIcon()
        store.hiddenPersonalInfoIcon()
        store.hiddenAppIcon()
        store.hiddenGeneratorIcon()
        store.removeTotpIcon()
        if (this.timer) {
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
            this.timer = null
            comm.needPosition(this.tabId)
        }, 300)
    }

    position() {
        if (this.fieldControl) {
            this.fieldControl.position()
        }
        if (this._fieldSets) {
            this._fieldSets.forEach((fieldSet) => {
                fieldSet.controlFieldIcon?.reposition()
            })
        }
    }

    distributeConnectionPort(
        msg: Message.ExtensionsMessage<any>,
        sender: chrome.runtime.MessageSender
    ) {
        appRequester.port(msg.message)
    }

    returnListFromApp(
        msg: Message.ExtensionsMessage<any>,
        sender: chrome.runtime.MessageSender
    ) {
        if (window.top !== window.self) return
        const temp = (msg.message as Message.VaultItem[]) || []
        this.allCredentials = temp.filter(
            (i) => i.itemType === VaultItemType.App
        )
        const creditCardList = temp.filter(
            (i) => i.itemType === VaultItemType.CreditCard
        )
        const personalInfoList = temp.filter(
            (i) => i.itemType === VaultItemType.PersonalInfo
        )
        store.setCreditCardList(creditCardList)
        store.setPersonalInfoList(personalInfoList)
        this.refreshCredentials()
    }

    returnSavePasswordFromApp(
        msg: Message.ExtensionsMessage<any>,
        sender: chrome.runtime.MessageSender
    ) {}

    CommonFromContent(msg: Message.ExtensionsMessage<Message.ContentMsg>) {
        switch (msg.message?.type) {
            case 'creditCardIconPosition':
                this.creditCardIconPosition(msg.message?.data)
                break
            case 'personalInfoIconPosition':
                this.personalIconPosition(msg.message?.data)
                break
            case 'totpPosition':
                this.totpIconPosition(msg.message?.data)
                break
            case 'appPosition':
                this.appIconPosition(msg.message?.data)
                break
            case 'appIconCanShow':
                store.setAppIconCanShow(msg.message?.data)
                break
            case 'personalInfoIconCanShow':
                store.setPersonalIconCanShow(msg.message?.data)
                break
            case 'creditCardIconCanShow':
                store.setCreditIconCanShow(msg.message?.data)
                break
            case 'totpIconCanShow':
                store.setTotpIconCanShow(msg.message?.data)
                break
            case 'appIconInit':
                store.setAppIconInit(msg.message?.data)
                break
            case 'creditCardIconInit':
                store.setCreditIconInit(msg.message?.data)
                break
            case 'personalInfoIconInit':
                store.setPersonalIconInit(msg.message?.data)
                break
            case 'totpIconInit':
                store.setTotpIconInit(msg.message?.data)
                break
            case 'needPosition':
                this.position()
                break
            case 'fillPage':
                this.fillPageFromExtension(msg)
                break
            case 'generatorIconCanShow':
                store.setGeneratorIconCanShow(msg.message.data)
                break
            case 'generatorPosition':
                this.generatorPosition(msg.message.data)
                break
            case 'fillGeneratorPassword':
                this._fillGeneratorPassword(msg.message.data)
                break
        }
    }

    async fillPageFromExtension(msg: Message.ExtensionsMessage<any>) {
        if (this.fieldControl) {
            const data = msg.message.data as Message.VaultItem
            if (data?.itemType === VaultItemType.CreditCard) {
                const decryptData =
                    await decryptDetailContent<Message.CreditCardDetail>(data)
                if (decryptData) {
                    this.fieldControl.fillPage(decryptData as any, 'credit')
                }
            }
            if (data?.itemType === VaultItemType.PersonalInfo) {
                const decryptData =
                    await decryptDetailContent<Message.PersonalInfoDetail>(data)
                if (decryptData) {
                    this.fieldControl.fillPage(decryptData as any, 'info')
                }
            }
            if (
                data.itemType === VaultItemType.App &&
                data.detail.oneTimePassword
            ) {
                this.fieldControl.fillPage(data.detail.oneTimePassword, 'totp')
            }
        }
    }

    returnUserProfileFromApp(
        msg: Message.ExtensionsMessage<any>,
        sender: chrome.runtime.MessageSender
    ) {
        this.userProfile = msg.message
        store.setUserprofile(msg.message)
        if (Object.keys(msg.message!).length === 0) {
            store.setAppList([])
        }
    }

    notInstall(
        msg: Message.ExtensionsMessage<any>,
        sender: chrome.runtime.MessageSender
    ) {}

    setActiveTabUrl(msg: Message.ExtensionsMessage<any>) {
        const data = msg as Message.ExtensionsMessage<
            Message.VaultItem<Message.VaultItemLogin>[] & {
                uri: string
                tabId: number
            }
        >
        this.currentUrl = data.message?.uri!
        this.tabId = data.message?.tabId!
        store.setTabId(this.tabId)
        this.fieldControl = getField(this.tabId)
        comm.notPasswordControl({ tabId: this.tabId })
        this.refreshCredentials()
    }

    popSavePassword(
        msg: Message.ExtensionsMessage<any>,
        sender: chrome.runtime.MessageSender
    ) {
        if (window.top === window.self) {
            store.setCredential(msg.message)
        }
    }

    returnFillPasswordFromApp(
        msg: Message.ExtensionsMessage<any>,
        sender: chrome.runtime.MessageSender
    ) {
        if (document.hidden) return
        if (
            msg.errorId === '0' &&
            utils.match(msg.message.uri, this.currentUrl)
        ) {
            const { account, password } = msg.message
            this._filledCredential = msg.message
            this._autoFillFields(account, password)
        }
    }

    async refreshCredentials() {
        const credentials = this.allCredentials.filter((item) => {
            const loginUri = item.detail.loginUri
            return (
                utils.match(this.currentUrl, loginUri) &&
                !(item.detail.clientMachineId > 0)
            )
        })
        const totpList = credentials.map(async (i) => {
            if (!i.detail.oneTimePassword) return Promise.resolve(i)
            const decryptData = await decryptString(
                i.domainId,
                i.detail.oneTimePassword
            )
            const detail = {
                ...i.detail,
                oneTimePassword: decryptData,
            }
            return {
                ...i,
                detail,
            }
        })
        let decryptTotpList = await Promise.all(totpList)
        decryptTotpList = decryptTotpList.filter(
            (item) => item.detail.oneTimePassword
        )
        store.setTotpList(decryptTotpList)
        store.setAppList(credentials)
    }

    private personalIconPosition(position: Message.Position) {
        const positionData = positionIcon(position)
        if (!positionData) return
        const { realTop, realLeft, realRight } = positionData
        store.changePersonalInfoIconPosition(realTop, realLeft, realRight)
        store.showPersonalInfoIcon()
    }

    private creditCardIconPosition(position: Message.Position) {
        const positionData = positionIcon(position)
        if (!positionData) return
        const { realTop, realLeft, realRight } = positionData
        store.changeCardIconPosition(realTop, realLeft, realRight)
        store.showCreditCardIcon()
    }

    private appIconPosition(position: Message.Position) {
        const positionData = positionIcon(position)
        if (!positionData) return
        const { realTop, realLeft, realRight } = positionData
        store.changeIconPosition(realTop, realLeft, realRight)
        store.showAppIcon()
    }

    private totpIconPosition(position: Message.Position) {
        const positionData = positionIcon(position)
        if (!positionData) return
        const { realTop, realLeft, realRight } = positionData
        store.changeTotpIconPosition(realTop, realLeft, realRight)
        store.showTotpIcon()
    }

    private generatorPosition(position: Message.Position) {
        const positionData = positionIcon(position, 600)
        if (!positionData) return
        const { realTop, realLeft, realRight } = positionData
        store.changeGeneratorIconPosition(realTop, realLeft, realRight)
        store.showGeneratorIcon()
    }

    // vault_uuid and item_uuid exist in url?
    public async findCredentialById() {
        if (this.currentUrl) {
            if (document.hidden) return
            const msg = await getFillPassword(this.currentUrl)
            if (
                msg.errorId === '0' &&
                msg.message !== undefined &&
                utils.match(msg.message.uri, this.currentUrl)
            ) {
                msg.message = {
                    ...msg.message,
                    isCompany: utils.isCompany(
                        msg.message.domainId,
                        this.userProfile
                    ),
                }
                const { account, password } = msg.message
                this._filledCredential = msg.message
                this._autoFillFields(account, password)
            }
        }
    }

    private _autoFillFields(username: string, password: string) {
        if (isUndefined(username) && isUndefined(password)) return
        for (const [controlField, fieldSet] of this._fieldSets) {
            const { visibility } = getComputedStyle(controlField)
            if (element.isVisible(controlField) || visibility) {
                if (fieldSet.usernameField) {
                    fieldSet.usernameField.val(username)
                    fieldSet.usernameField[0].dispatchEvent(
                        new Event('input', { bubbles: true })
                    )
                    fieldSet.usernameField[0].dispatchEvent(
                        new Event('change', { bubbles: true })
                    )
                }
                if (fieldSet.passwordField) {
                    fieldSet.passwordField.val(password)
                    fieldSet.passwordField[0].dispatchEvent(
                        new Event('input', { bubbles: true })
                    )
                    fieldSet.passwordField[0].dispatchEvent(
                        new Event('change', { bubbles: true })
                    )
                }
            }
        }
    }

    private _fillGeneratorPassword(password: string) {
        if (isUndefined(password)) return
        for (const [controlField, fieldSet] of this._fieldSets) {
            const { visibility } = getComputedStyle(controlField)
            if (visibility !== 'hidden') {
                if (fieldSet.confirmField) {
                    fieldSet.confirmField.val(password)
                    fieldSet.confirmField[0].dispatchEvent(
                        new Event('input', { bubbles: true })
                    )
                    fieldSet.confirmField[0].dispatchEvent(
                        new Event('change', { bubbles: true })
                    )
                }
                if (fieldSet.passwordField) {
                    fieldSet.passwordField.val(password)
                    fieldSet.passwordField[0].dispatchEvent(
                        new Event('input', { bubbles: true })
                    )
                    fieldSet.passwordField[0].dispatchEvent(
                        new Event('change', { bubbles: true })
                    )
                }
            }
        }
    }

    /** Try to detect credentials fields  */
    public detectFields() {
        if (this.fieldControl) {
            this.fieldControl.detectFieldsByInput()
        }
        const passwordFields: JQuery = $('input[type="password"]')
        if (passwordFields.length) {
            // Found some password fields?
            passwordFields.each((passwordIndex, passwordField) => {
                // Loop through password fields
                this.createFieldSet(passwordField as HTMLInputElement)
            })
            this._attachEscapeEvent()
        }
    }

    /**
     * Try to detect new credentials fields
     * @param passwordFields A list of changed or added password fields.
     */
    public detectNewFields(passwordFields: NodeListOf<Element>) {
        for (const passwordField of passwordFields) {
            if (passwordField instanceof HTMLInputElement)
                this.createFieldSet(passwordField)
        }

        this._attachEscapeEvent()
    }

    public addFieldByInput(inputEl: HTMLInputElement) {
        if (this.fieldControl) {
            this.fieldControl.addFieldByInput(inputEl)
        }
    }

    /**
     * Create a fieldset for the `passwordField`. This method will also look for an username field
     * @param passwordField The password field we're going to use
     */
    public createFieldSet(passwordField: HTMLInputElement) {
        let prevField: JQuery<HTMLInputElement> | undefined
        let prevVisibleField: JQuery<HTMLInputElement> | undefined
        const $passwordField = $(passwordField)
        const inputs: JQuery<HTMLInputElement>[] = []
        $('input').each((_, input) => {
            // Loop through input fields to find the field before our password field
            const $input = $(input as HTMLInputElement)
            const inputType = $input.attr('type') || 'text' // Get input type, if none default to "text"
            if (inputType === 'password' && $input.is(':visible')) {
                inputs.push($input)
            }
        })
        let newPasswordField
        let confirmPasswordField
        if (inputs.length === 1) {
            const placeholder = inputs[0][0].placeholder
                .trim()
                .toLocaleLowerCase()
                .replace(/(\s)|(&nbsp;)*/g, '')
            if (placeholder) {
                const keywords = [
                    'createpassword',
                    'createapassword',
                    'addpassword',
                    'addapassword',
                    '设置密码',
                    '设置登录密码',
                    '创建密码',
                    '添加密码',
                ]
                for (const k of keywords) {
                    if (placeholder.toLocaleLowerCase().indexOf(k) > -1) {
                        newPasswordField = inputs[0]
                        break
                    }
                }
            } else {
                const childText: string[] = []
                let rootNode
                if (inputs[0].parents('form').length > 0) {
                    rootNode = inputs[0].parents('form').eq(0)
                } else {
                    rootNode = inputs[0].parent().parent().parent()
                }
                this._getLastChildText(rootNode, childText)
                let isCN = false
                let keywords = [
                    'createpassword',
                    'createapassword',
                    'addpassword',
                    'addapassword',
                ]
                for (const t of childText) {
                    if (t.indexOf('密码') > -1) {
                        isCN = true
                        keywords = [
                            '设置密码',
                            '设置登录密码',
                            '创建密码',
                            '添加密码',
                        ]
                        break
                    }
                }

                if (isCN) {
                    for (const t of childText) {
                        for (const k of keywords) {
                            if (t.indexOf(k) > -1) {
                                newPasswordField = inputs[0]
                                break
                            }
                        }
                    }
                    if (!newPasswordField) {
                        if (isCN) {
                            for (const t of childText) {
                                if (
                                    t.indexOf('包含') > -1 &&
                                    t.indexOf('个字符') > -1
                                ) {
                                    newPasswordField = inputs[0]
                                    break
                                }
                            }
                        }
                    }
                } else {
                    for (const t of childText) {
                        for (const k of keywords) {
                            if (t.toLocaleLowerCase().indexOf(k) > -1) {
                                newPasswordField = inputs[0]
                                break
                            }
                        }
                    }
                    if (!newPasswordField) {
                        for (const t of childText) {
                            if (
                                t.toLocaleLowerCase().indexOf('atleast') > -1 &&
                                (t.toLocaleLowerCase().indexOf('characters') >
                                    -1 ||
                                    t.toLocaleLowerCase().indexOf('letter') >
                                        -1)
                            ) {
                                newPasswordField = inputs[0]
                                break
                            }
                        }
                    }
                }
            }
        } else if (inputs.length === 2) {
            const keywords = [
                'old password',
                'current password',
                '旧密码',
                '当前密码',
            ]
            const labelText = inputs[0]
                .parent()
                .parent()
                .find('label')
                .text()
                .trim()
                .toLocaleLowerCase()
            const placeholder = inputs[0][0].placeholder.toLocaleLowerCase()
            if (
                keywords.some((item) => {
                    return (
                        placeholder.indexOf(item) > -1 ||
                        labelText.indexOf(item) > -1
                    )
                })
            ) {
                newPasswordField = inputs[1]
            } else {
                newPasswordField = inputs[0]
                confirmPasswordField = inputs[1]
            }
        } else if (inputs.length === 3) {
            newPasswordField = inputs[1]
            confirmPasswordField = inputs[2]
        } else if (inputs.length > 3) {
            newPasswordField = inputs[inputs.length - 2]
            confirmPasswordField = inputs[inputs.length - 1]
        }
        if (newPasswordField) {
            this._fieldSets.set(
                newPasswordField[0],
                new GeneratorFieldSet(
                    this,
                    newPasswordField,
                    confirmPasswordField
                )
            )
        } else {
            $('input').each((_, input) => {
                // Loop through input fields to find the field before our password field
                const $input = $(input as HTMLInputElement)
                const inputType = $input.attr('type') || 'text' // Get input type, if none default to "text"
                if (
                    inputType === 'text' ||
                    inputType === 'email' ||
                    inputType === 'tel'
                ) {
                    // We didn't reach our password field?
                    prevField = $input // Is this a possible username field?
                    if ($input.is(':visible')) {
                        prevVisibleField = $input
                    }
                } else if (
                    inputType === 'password' &&
                    $input.is($(passwordField))
                ) {
                    // Found our password field?
                    const controlField = prevVisibleField || prevField
                    /* if (!controlField && $input.is(':visible')) {
                        // We didn't find the username field. Check if password field is actually visible
                        controlField = $passwordField
                    } */ // Else we didn't find a visible username of password field
                    if (controlField) {
                        if (this._fieldSets.has(controlField[0])) {
                            const fieldSet = this._fieldSets.get(
                                controlField[0]
                            )
                            if (
                                fieldSet &&
                                fieldSet.passwordField.is(':visible')
                            ) {
                                return false
                            }
                        }
                        // Only create a FieldSet once for every field
                        comm.havePasswordControl(this.tabId)
                        this._fieldSets.set(
                            controlField[0],
                            new FieldSet(this, $passwordField, controlField)
                        )
                    }
                    return false // Break the each() loop
                }
            })
        }
    }

    private _getLastChildText(el: JQuery<HTMLElement>, children: string[]) {
        if (!el) return
        let text = el.text().trim()
        if (text) {
            text = text.replace(/(\s)|(&nbsp;)*/g, '')
            if (!children.includes(text)) {
                children.push(text)
            }
        }
        const len = el.children().length
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                this._getLastChildText(el.children().eq(i), children)
            }
        }
    }

    private _attachEscapeEvent() {
        if (
            this._installedEscapeHandler ||
            !this._fieldSets ||
            this._fieldSets.size === 0
        ) {
            return // We're not going to listen to key presses if we don't need them
        }
        this._installedEscapeHandler = true
    }

    get settings(): ISettings {
        return this._settings
    }
}
