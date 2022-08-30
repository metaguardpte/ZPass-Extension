import { VaultItemType } from '@/typings/enums'
import utils from '@/utils/utils'
import connection from './connection'
import { checkPassword, appRequester } from '@/services/api/appRequester'

type UserProfile = Message.ExtensionsMessage<Partial<Message.UserProfile>>
const userProfile: UserProfile = {
    type: 'ReturnUserProfileFromApp',
    message: {},
}
const allAppListMessage: Message.ExtensionsMessage = {
    type: 'ReturnListFromApp',
}
const notInstallMessage: Message.ExtensionsMessage = {
    type: 'NotInstall',
}
const credentials = new Map<number, Message.Credential>()
const times = new Map<number, NodeJS.Timeout>()
const validTabs = new Map<number, any>()
interface exeParams {
    action: 'get-wss'
    openApp?: boolean
    waitApp?: boolean
    timestamp?: number
    hash?: string
}
interface exeRes {
    err_code: number
    ws_port: number
    err_msg: string
}

const proxyhandler = {
    set(obj: any, prop: string, newval: any, receiver: any) {
        obj[prop] = newval
        sendToAllTabs(obj)
        return Reflect.set(obj, prop, newval, receiver)
    },
}

const userProfileProxy = new Proxy(userProfile, proxyhandler)
const allAppListMessageProxy = new Proxy(allAppListMessage, proxyhandler)
const notInstallMessageProxy = new Proxy(notInstallMessage, proxyhandler)

const popSavePasswordPage = async (tabId: number) => {
    const credential = credentials.get(tabId)
    if (credential?.password.length && credential.username.length) {
        const result = await checkPassword(credential)
        if (result.errorId !== '0' && result.errorId !== undefined) {
            return
        }
        const status = result.message as Message.CredentialStatus
        if (status.status === 'new' || status.status === 'update') {
            const credStatus: Message.CredentialStatus = {
                ...credential,
                id: status?.id ?? 0,
                domainId: status?.domainId ?? 0,
                alias: status.alias,
                status: status?.status ?? 'existed',
                name: status.name,
                note: status.note,
            }
            const msg: Message.ExtensionsMessage<Message.CredentialStatus> = {
                type: 'PopSavePassword',
                message: credStatus,
            }
            credentials.delete(tabId)
            sendByTabId(tabId, msg) // detect origin?
        }
    }
}

const sendToAllTabs = (obj: any) => {
    utils.log('sendToAllTabs', obj)
    // chrome.tabs.query({}, (tabs) => {
    //     tabs.forEach(tab => {
    //         if (tab.id) {
    //             chrome.tabs.sendMessage(tab.id, obj, (res) => {
    //                 if (chrome.runtime.lastError) {
    //                     console.log('send message error', chrome.runtime.lastError)
    //                 }
    //                 console.log('response', res)
    //             })
    //         }
    //     })
    // })
    validTabs.forEach((v, k) => {
        chrome.tabs.sendMessage(k, obj, (res) => {
            if (chrome.runtime.lastError) {
                utils.log('send message error', chrome.runtime.lastError)
            }
            utils.log('response', res)
        })
    })
    sendToPopup(obj)
}

const sendByTabId = (tabId: number, obj: any) => {
    utils.log('sendByTabId', tabId, obj)
    if (tabId !== undefined) {
        chrome.tabs.sendMessage(tabId, obj, (res) => {
            if (chrome.runtime.lastError) {
                utils.log('send message error', chrome.runtime.lastError)
            }
            utils.log('response', res)
        })
    }
}

const sendToPopup = (obj: any) => {
    chrome.runtime.sendMessage(obj, (res) => {
        if (chrome.runtime.lastError) {
            utils.log('send message error', chrome.runtime.lastError)
        }
        utils.log('response', obj)
    })
}

const backFillPassword = async (msg: Message.ExtensionsMessage) => {
    const ret = await appRequester.post(msg)
    if (userProfile.message && ret.message.domainId) {
        ret.message = {
            ...ret.message,
            isCompany: utils.isCompany(
                ret.message.domainId,
                userProfile.message
            ),
        }
    }
    if (ret.errorId === undefined || ret.errorId === '0') {
        await sendToAllTabs(ret)
    }
}

chrome.tabs.onRemoved.addListener((tabId, info) => {
    utils.log('tab remove', tabId, info)
    if (validTabs.has(tabId)) {
        validTabs.delete(tabId)
    }
})

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    utils.log('tab update', tabId, info, tab)
    if (
        tab.url &&
        !tab.url.startsWith('http://') &&
        !tab.url.startsWith('https://')
    ) {
        if (validTabs.has(tabId)) {
            validTabs.delete(tabId)
        }
    }
})

chrome.runtime.onMessage.addListener(
    (
        data: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ) => {
        utils.log('on message', data, sender)
        if (sender.id !== chrome.runtime.id) {
            sendResponse()
            return
        }
        if (!connection.isConnected && !connection.isConnecting) {
            connectHubExe({ action: 'get-wss', waitApp: true })
        }

        const msg = data as Message.ExtensionsMessage
        if (!msg) {
            const err: Message.ExtensionsMessage = {
                type: 'GetActiveTabUrl',
                errorId: 'wrong data format',
            }
            sendResponse(err)
            return
        }

        if (msg.type === 'HearbeatFromContent') {
            if (sender.tab && sender.tab.id) {
                validTabs.set(sender.tab.id, {})
            }
        } else if (msg.type === 'RegisterTabFromContent') {
            const msg: Message.ExtensionsMessage<number> = {
                type: 'DistributeConnectionPort',
                message: connection.port,
            }
            if (sender.tab && sender.tab.id) {
                validTabs.set(sender.tab.id, {})
                utils.log('register', userProfileProxy, allAppListMessageProxy)
                sendByTabId(sender.tab.id, msg)
                sendByTabId(sender.tab.id, userProfileProxy)
                sendByTabId(sender.tab.id, allAppListMessageProxy)
                sendByTabId(sender.tab.id, notInstallMessageProxy)
            } else {
                sendToPopup(userProfileProxy)
                sendToPopup(allAppListMessageProxy)
                sendToPopup(msg)
                sendToPopup(notInstallMessageProxy)
            }
        } else if (msg.type === 'CurrentCredential') {
            addCredential(msg.message!)
        } else if (msg.type === 'CommonFromContent') {
            sendByTabId(msg.message.tabId, msg)
        } else if (
            msg.type === 'PasswordControlHidden' ||
            msg.type === 'NotPasswordControl'
        ) {
            let timeId = times.get(msg.message?.tabId!)
            if (timeId) {
                clearTimeout(timeId)
            }
            timeId = setTimeout(() => {
                popSavePasswordPage(msg.message?.tabId!)
            }, 1000)
            times.set(msg.message?.tabId!, timeId)
        } else if (msg.type === 'HavePasswordControl') {
            const timeId = times.get(msg.message?.tabId!)
            if (timeId) {
                clearTimeout(timeId)
            }
        } else if (
            msg.type === 'DecryptFromExtension' ||
            msg.type === 'CompanyDecryptFromExtension'
        ) {
            backFillPassword(msg)
        } else if (msg.type === 'GetActiveTabUrl') {
            const msg: Message.ExtensionsMessage = {
                type: 'ReturnActiveTabUrl',
                message: {
                    uri: sender.tab?.url,
                    tabId: sender.tab?.id,
                },
            }
            sendResponse(msg)
        } else if (msg.type === 'LoginFromExtension') {
            if (!connection.isConnected && !connection.isConnecting) {
                connectHubExe({ action: 'get-wss', openApp: true })
                const id = setInterval(() => {
                    if (connection.isConnected) {
                        appRequester.post(msg)
                        clearInterval(id)
                    }
                }, 500)
            } else {
                appRequester.post(msg)
            }
        }
        sendResponse()
    }
)

const connectHubExe = (config: exeParams) => {
    const NativeName = 'chromium.extension.zpass'
    chrome.runtime.sendNativeMessage(NativeName, config, (response: exeRes) => {
        if (
            chrome.runtime.lastError?.message &&
            chrome.runtime.lastError?.message ===
                'Specified native messaging host not found.'
        ) {
            utils.log(
                'connectHubExe not install error: ',
                chrome.runtime.lastError,
                notInstallMessageProxy
            )
            if (notInstallMessageProxy.message !== true) {
                utils.log('set not installed')
                notInstallMessageProxy.message = true
            }

            return
        } else if (chrome.runtime.lastError) {
            utils.log('connectHubExe error: ', chrome.runtime.lastError)
        }
        if (
            notInstallMessageProxy.message === undefined ||
            notInstallMessageProxy.message === true
        ) {
            notInstallMessageProxy.message = false
        }
        if (response === undefined) {
            utils.log('connectHubExe response is null')
            return
        }
        if (response.err_code === 0 && !connection.isConnected) {
            initWs(response.ws_port)
        }
    })
}
connectHubExe({ action: 'get-wss', waitApp: true })
const fillUriHeader = (data: Message.VaultItem[]) => {
    return data.map((item) => {
        if (item.itemType === undefined) {
            item.itemType = item.type
        }
        if (item.itemType === VaultItemType.App) {
            const imgUri = utils.getIconUrl(item)
            const detail = {
                ...item.detail,
                imgUri,
            }
            return {
                ...item,
                detail,
            }
        } else {
            return item
        }
    })
}
const addCredential = (credential: Message.Credential) => {
    credentials.set(credential.tabId, credential)
}

const eventHandler = (data: any) => {
    utils.log('eventHandle', data)
    if (typeof data !== 'string') {
        return
    }
    const msg = JSON.parse(data) as Message.ExtensionsMessage | undefined
    switch (msg?.type) {
        case 'ReturnListFromApp':
            allAppListMessageProxy.message = fillUriHeader(msg.message)
            break
        case 'ReturnFillPasswordFromApp': {
            if (userProfile.message && msg.message.domainId) {
                msg.message = {
                    ...msg.message,
                    isCompany: utils.isCompany(
                        msg.message.domainId,
                        userProfile.message
                    ),
                }
            }
            sendToAllTabs(msg)
            break
        }
        case 'ReturnUserProfileFromApp':
            userProfileProxy.message = msg.message
            break
    }
}

const openHandler = async () => {
    const msg: Message.ExtensionsMessage<number> = {
        type: 'DistributeConnectionPort',
        message: connection.port,
    }
    sendToAllTabs(msg)
    sendToAllTabs(allAppListMessage)
    sendToAllTabs(userProfileProxy)
}

const delaySetLogout = () => {
    if (!connection.isConnected) {
        userProfileProxy.message = {}
    }
}

const initWs = (wsport: number) => {
    utils.log('initWs', wsport)
    connection.startUp(wsport)
    connection.onOpen = () => {
        appRequester.port(wsport)
        openHandler()
    }

    connection.onMessage = eventHandler
    connection.onPause = () => {
        delaySetLogout()
    }
    connection.onError = (e) => {
        delaySetLogout()
    }
}
chrome.privacy.services.autofillCreditCardEnabled.set({
    value: false,
})
chrome.privacy.services.passwordSavingEnabled.set({
    value: false,
})
chrome.privacy.services.autofillAddressEnabled.set({
    value: false,
})
