import store from '../store'
import { IMessageHandler } from '@/utils/communication'
import { appRequester } from '@/services/api/appRequester'

const _default: IMessageHandler = {
    returnListFromApp: (
        msg: Message.ExtensionsMessage,
        sender: chrome.runtime.MessageSender
    ) => {
        store.vaultItems = msg.message as Message.VaultItem[]
        store.isStarted = true
    },
    returnSavePasswordFromApp: function (
        msg: Message.ExtensionsMessage,
        sender: chrome.runtime.MessageSender
    ): void {},
    returnUserProfileFromApp: function (
        msg: Message.ExtensionsMessage,
        sender: chrome.runtime.MessageSender
    ): void {
        const detail = msg.message as Message.UserProfile
        store.userProfile = detail
    },
    notInstall: function (
        msg: Message.ExtensionsMessage,
        sender: chrome.runtime.MessageSender
    ): void {
        store.isAppInstalled = !msg.message
    },
    popSavePassword: function (
        msg: Message.ExtensionsMessage,
        sender: chrome.runtime.MessageSender
    ): void {},
    returnFillPasswordFromApp: function (
        msg: Message.ExtensionsMessage,
        sender: chrome.runtime.MessageSender
    ): void {},
    CommonFromContent() {},
    fillPageFromExtension() {},
    distributeConnectionPort: function (
        msg: Message.ExtensionsMessage<any>,
        sender: chrome.runtime.MessageSender
    ): void {
        appRequester.port(msg.message)
    },
}

export default _default
