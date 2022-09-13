import utils from '@/utils/utils'

type PortEvent = (
    msg: Message.ExtensionsMessage,
    sender: chrome.runtime.MessageSender
) => void
type MsgCallback = (
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
) => void

export interface IMessageHandler {
    returnListFromApp: PortEvent
    returnSavePasswordFromApp: PortEvent
    returnUserProfileFromApp: PortEvent
    notInstall: PortEvent
    popSavePassword: PortEvent
    returnFillPasswordFromApp: PortEvent
    distributeConnectionPort: PortEvent
    fillPageFromExtension: PortEvent
    CommonFromContent: PortEvent
}

interface ICommunication {
    startUp: (handle: IMessageHandler, hearbeat: boolean) => void
    fillpassword: (detail: Message.PersonalEncryptDetail) => void
    fillCompanyPassword: (detail: Message.Detail) => void
    login: () => void
    notPasswordControl: (msg: any) => void
    getActiveTabUrl: () => Promise<any>
    havePasswordControl: (tabId: number) => void
    currentCredential: (cred: Message.Credential) => void
    passwordControlHidden: (tabId: number) => void
    fillPageByTabId: (data: Message.VaultItem, tabId: number) => void
    needPosition: (tabId: number) => void
    setPersonalInfoIconCanShow: (
        visible: boolean,
        tabId: number
    ) => Promise<any>
    setPersonalInfoIconInit: (init: boolean, tabId: number) => Promise<any>
    setCreditCardIconInit: (visible: boolean, tabId: number) => Promise<any>
    setCreditCardIconCanShow: (init: boolean, tabId: number) => Promise<any>
    setAppIconInit: (init: boolean, tabId: number) => Promise<any>
    setAppIconCanShow: (visible: boolean, tabId: number) => Promise<any>
    setIconCanShow: (
        visible: boolean,
        tabId: number,
        type: VaultItemStrType
    ) => Promise<any>
    setIconInit: (
        init: boolean,
        tabId: number,
        type: VaultItemStrType
    ) => Promise<any>
    setCreditCardPosition: (
        position: Message.Position,
        tabId: number
    ) => Promise<any>
    setPersonalInfoPosition: (
        position: Message.Position,
        tabId: number
    ) => Promise<any>
    setAppPosition: (position: Message.Position, tabId: number) => Promise<any>
    setPosition: (
        position: Message.Position,
        tabId: number,
        type: VaultItemStrType
    ) => Promise<any>
    setGeneratorPosition: (
        position: Message.Position,
        tabId: number
    ) => Promise<any>
    setGeneratorIconCanShow: (visible: boolean, tabId: number) => Promise<any>
    fillGeneratorPassword: (password: string, tabId: number) => Promise<any>
    setTotpIconCanShow: (visible: boolean, tabId: number) => Promise<any>
    setTotpIconInit: (visible: boolean, tabId: number) => Promise<any>
    setTotpPosition: (position: Message.Position, tabId: number) => Promise<any>
}

interface IPort {
    handler?: IMessageHandler
    heartbeatTimer: boolean
}

const portObj: IPort = {
    heartbeatTimer: false,
}

const postMessage = (msg: Message.ExtensionsMessage) => {
    chrome.runtime.sendMessage(msg, (res) => {
        if (chrome.runtime.lastError) {
            utils.log('send message error', chrome.runtime.lastError)
        }
        utils.log('response', res)
    })
}

const requester = <T = any>(msg: Message.ExtensionsMessage<T>) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(msg, (res) => {
            if (chrome.runtime.lastError) {
                utils.log('send message error', chrome.runtime.lastError)
                reject('send message error' + chrome.runtime.lastError)
            }
            resolve(res)
        })
    })
}

const contentRequester = (data: Message.ContentMsg) => {
    const msg: Message.ExtensionsMessage<Message.ContentMsg> = {
        type: 'CommonFromContent',
        message: data,
    }
    return requester(msg)
}
const onTimeReconnection = () => {
    if (!portObj.heartbeatTimer) {
        portObj.heartbeatTimer = true
        utils.log('start heartbeat')
        setInterval(() => {
            postMessage({ type: 'HearbeatFromContent' })
        }, 5 * 1000)
    }
}

const initPort = (callback: MsgCallback, hearbeat: boolean) => {
    chrome.runtime.onMessage.addListener(callback)
    postMessage({ type: 'RegisterTabFromContent' })
    // utils.log('is start heartbeat', hearbeat)
    if (hearbeat) {
        onTimeReconnection()
    }
}

const msgCallback: MsgCallback = (
    msg: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
) => {
    // utils.log('msgCallback', msg)
    if (sender.id !== chrome.runtime.id) {
        sendResponse()
        return
    }
    const data = msg as Message.ExtensionsMessage | undefined
    if (data !== undefined && portObj.handler !== undefined) {
        let fun = Object.values(portObj.handler).find(
            (f) =>
                typeof f === 'function' &&
                f.name.toUpperCase() === data.type.toUpperCase()
        )
        if (fun === undefined) {
            const funObj = portObj.handler as { [key: string]: any }
            const name = Reflect.ownKeys(
                Object.getPrototypeOf(portObj.handler)
            ).find((f) => {
                if (typeof f === 'string') {
                    sendResponse()
                    return (
                        f.toUpperCase() === data.type.toUpperCase() &&
                        typeof funObj[f] === 'function'
                    )
                }
                sendResponse()
                return false
            })
            if (name !== undefined && typeof name === 'string') {
                fun = (msg: any, sender: chrome.runtime.MessageSender) =>
                    funObj[name](msg, sender)
            }
        }
        if (fun) {
            fun(data, sender)
        }
    }
    sendResponse()
}

const _default: ICommunication = {
    startUp: (handler: IMessageHandler, hearbeat: boolean) => {
        portObj.handler = handler
        initPort(msgCallback, hearbeat)
    },
    needPosition(tabId) {
        return contentRequester({
            type: 'needPosition',
            tabId,
        })
    },
    setAppPosition(position, tabId) {
        return contentRequester({
            type: 'appPosition',
            tabId,
            data: position,
        })
    },

    setGeneratorPosition(position, tabId) {
        return contentRequester({
            type: 'generatorPosition',
            tabId,
            data: position,
        })
    },

    setGeneratorIconCanShow(visible, tabId) {
        return contentRequester({
            type: 'generatorIconCanShow',
            data: visible,
            tabId,
        })
    },

    fillGeneratorPassword(password, tabId) {
        return contentRequester({
            type: 'fillGeneratorPassword',
            data: password,
            tabId,
        })
    },

    fillpassword: (detail) => {
        const msg: Message.ExtensionsMessage = {
            type: 'DecryptFromExtension',
            message: detail,
        }
        postMessage(msg)
    },

    fillCompanyPassword: (detail) => {
        const msg: Message.ExtensionsMessage = {
            type: 'CompanyDecryptFromExtension',
            message: detail,
        }
        postMessage(msg)
    },
    fillPageByTabId: (data, tabId) => {
        return contentRequester({
            type: 'fillPage',
            tabId,
            data,
        })
    },
    login: () => {
        const msg: Message.ExtensionsMessage = {
            type: 'LoginFromExtension',
        }
        postMessage(msg)
    },
    notPasswordControl: (data: any) => {
        const msg: Message.ExtensionsMessage = {
            message: data,
            type: 'NotPasswordControl',
        }
        postMessage(msg)
    },
    getActiveTabUrl: () => {
        return requester({
            type: 'GetActiveTabUrl',
        })
    },
    havePasswordControl: (tabId: number) => {
        postMessage({
            type: 'HavePasswordControl',
            message: {
                tabId: tabId,
            },
        })
    },
    currentCredential: (cred: Message.Credential) => {
        const msg: Message.ExtensionsMessage<Message.Credential> = {
            type: 'CurrentCredential',
            message: cred,
        }
        postMessage(msg)
    },
    passwordControlHidden: (tabId: number) => {
        const msg: Message.ExtensionsMessage = {
            type: 'PasswordControlHidden',
            message: {
                tabId: tabId,
            },
        }
        postMessage(msg)
    },
    setIconCanShow(visible, tabId, type) {
        switch (type) {
            case 'info':
                return this.setPersonalInfoIconCanShow(visible, tabId)
            default:
                return this.setCreditCardIconCanShow(visible, tabId)
        }
    },
    setIconInit(init, tabId, type) {
        switch (type) {
            case 'info':
                return this.setPersonalInfoIconInit(init, tabId)
            default:
                return this.setCreditCardIconInit(init, tabId)
        }
    },
    setPosition(position, tabId, type) {
        switch (type) {
            case 'credit':
                return this.setCreditCardPosition(position, tabId)
            default:
                return this.setPersonalInfoPosition(position, tabId)
        }
    },
    setAppIconInit(init, tabId) {
        return contentRequester({
            type: 'appIconInit',
            data: init,
            tabId,
        })
    },
    setAppIconCanShow(visible, tabId) {
        return contentRequester({
            type: 'appIconCanShow',
            data: visible,
            tabId,
        })
    },
    setTotpIconCanShow(visible, tabId) {
        return contentRequester({
            type: 'totpIconCanShow',
            data: visible,
            tabId,
        })
    },
    setPersonalInfoIconCanShow(visible, tabId) {
        return contentRequester({
            type: 'personalInfoIconCanShow',
            data: visible,
            tabId,
        })
    },
    setPersonalInfoIconInit(init, tabId) {
        return contentRequester({
            type: 'personalInfoIconInit',
            data: init,
            tabId,
        })
    },
    setTotpIconInit(init, tabId) {
        return contentRequester({
            type: 'totpIconInit',
            data: init,
            tabId,
        })
    },
    setCreditCardIconInit(init, tabId) {
        return contentRequester({
            type: 'creditCardIconInit',
            data: init,
            tabId,
        })
    },
    setCreditCardIconCanShow(visible, tabId) {
        return contentRequester({
            type: 'creditCardIconCanShow',
            data: visible,
            tabId,
        })
    },
    setCreditCardPosition(position, tabId) {
        return contentRequester({
            type: 'creditCardIconPosition',
            data: position,
            tabId,
        })
    },
    setTotpPosition(postion, tabId) {
        return contentRequester({
            type: 'totpPosition',
            data: postion,
            tabId,
        })
    },
    setPersonalInfoPosition(position, tabId) {
        return contentRequester({
            type: 'personalInfoIconPosition',
            data: position,
            tabId,
        })
    },
}

export default _default
