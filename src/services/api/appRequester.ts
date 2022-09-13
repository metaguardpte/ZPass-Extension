import { requester, Result } from './requester'

let PORT: number = 56789
let REQ_URL: string = `http://localhost:${PORT}/plugin`

const convertResult = (res: Result<Message.ExtensionsMessage>) => {
    if (res.fail) {
        const err: Message.ExtensionsMessage = {
            type: 'GetActiveTabUrl',
            errorId: res.errorId,
        }
        return err
    }
    return res.payload!
}

export const getAllList = async () => {
    const ret = await appRequester.post({
        type: 'GetListFromExtension',
    })
    return ret
}

export const getUserProfile = async () => {
    const ret = await appRequester.post({
        type: 'GetUserProfileFromExtension',
    })
    return ret
}

export const checkPassword = async (cred: Message.Credential) => {
    const ret = await appRequester.post({
        type: 'GetPasswordCheckingFromExtension',
        message: cred,
    })
    return ret
}

export const savePassword = async (cred: Message.CredentialSave) => {
    const msg: Message.ExtensionsMessage = {
        message: cred,
        type: 'SavePasswordFromExtension',
    }
    await appRequester.post(msg)
}

export const getFillPassword = async (url: string) => {
    const pmsg: Message.ExtensionsMessage = {
        type: 'GetFillPasswordFromExtension',
        message: { uri: url },
    }
    const ret = await appRequester.post(pmsg)
    return ret
}

export const goFillPassword = async (detail: Message.PersonalEncryptDetail) => {
    const msg: Message.ExtensionsMessage = {
        type: 'DecryptAndNotSendPasswordFromExtension',
        message: detail,
    }
    const ret = await appRequester.post(msg)
    return ret
}

export const goFillCompanyPassword = async (detail: Message.Detail) => {
    const msg: Message.ExtensionsMessage = {
        type: 'DecryptAndNotSendCompanyPasswordFromExtension',
        message: detail,
    }
    const ret = await appRequester.post(msg)
    return ret
}
export const decryptPassword = async (detail: Message.Detail) => {
    const msg: Message.ExtensionsMessage = {
        type: 'DecryptFromExtension',
        message: detail,
    }
    const ret = await appRequester.post(msg)
    return ret
}

export const decryptText = async (domainId: number, text: string) => {
    const detail: Message.DecryptItem = {
        domainId: domainId,
        text: text,
    }
    const msg: Message.ExtensionsMessage = {
        type: 'DecryptTextFromExtension',
        message: detail,
    }
    return await appRequester.post(msg)
}

export const decryptString = async (domainId: number, text: string) => {
    const ret = await decryptText(domainId, text)
    if (
        (ret.errorId === '0' || ret.errorId === undefined) &&
        ret.message.text !== ''
    ) {
        return ret.message.text
    } else {
        return undefined
    }
}

export const decryptDetailContent = async <TReturn>(
    item: Message.VaultItem<Message.EncryptDetail>
) => {
    const ret = await decryptText(item.domainId, item.detail.content)
    if (
        (ret.errorId === '0' || ret.errorId === undefined) &&
        ret.message.text !== ''
    ) {
        const obj = JSON.parse(ret.message.text) as TReturn
        return obj
    } else {
        return undefined
    }
}

export const lock = async () => {
    const msg: Message.ExtensionsMessage = {
        type: 'LockFromExtension',
    }
    const ret = await appRequester.post(msg)
    return ret
}

export const logout = async () => {
    const msg: Message.ExtensionsMessage = {
        type: 'LogoutFromExtension',
    }
    const ret = await appRequester.post(msg)
    return ret
}

export const extensionHeartbeat = async () => {
    const msg: Message.ExtensionsMessage = {
        type: 'ExtensionHeartbeat',
    }
    appRequester.post(msg)
}

export const appRequester = {
    post: async function <T = any>(data: Message.ExtensionsMessage<T>) {
        const res = await requester.post<Message.ExtensionsMessage<T>>(
            REQ_URL,
            data
        )
        return convertResult(res)
    },
    port: function (port: number) {
        if (port) {
            PORT = port
            REQ_URL = `http://localhost:${PORT}/plugin`
        }
    },
}

export const getPasswordHistoryAll = async () => {
    const msg: Message.ExtensionsMessage = {
        type: 'GetPasswordHistoryAll',
    }
    const ret = await appRequester.post(msg)
    return ret
}

export const postPasswordHistory = async (
    password: string,
    source: number,
    description: string
) => {
    const msg: Message.ExtensionsMessage = {
        type: 'PostPasswordHistory',
        message: {
            password: password,
            source: source,
            description: description,
        },
    }
    const ret = await appRequester.post(msg)
    return ret
}

export const deletePasswordHistory = async (id: number) => {
    const msg: Message.ExtensionsMessage = {
        type: 'DeletePasswordHistory',
        message: { id: id },
    }
    const ret = await appRequester.post(msg)
    return ret
}

export const deletePasswordHistoryAll = async () => {
    const msg: Message.ExtensionsMessage = {
        type: 'DeletePasswordHistoryAll',
    }
    const ret = await appRequester.post(msg)
    return ret
}
