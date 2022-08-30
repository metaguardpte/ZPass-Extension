import { v4 } from 'uuid'

export interface IFailableResult {
    fail: boolean
    errorId?: string
}

export interface Result<T> extends IFailableResult {
    payload?: T
    // constructor (res: AxiosResponse<T>) {
    //     this.fail = res.status !== 200
    //     this.payload = res.data
    //     if (this.fail) {
    //         this.errorId = res.statusText
    //     }
    // }
}

const convertResult = async function <T>(res: Response) {
    let data: T | undefined
    if (res) {
        try {
            data = await res.json()
        } catch {}
    }
    const result: Result<T> = {
        fail: res.status !== 200,
        errorId: res.ok ? undefined : res.statusText,
        payload: data,
    }
    return result
}

function addRequestIdHeader(options?: { [k: string]: any }) {
    let { headers, ...otherOptions } = options ?? { headers: {} }
    headers = { ...headers, ...{ 'X-Request-ID': v4() } }
    return { ...otherOptions, headers }
}

function addContentTypeHeader(options?: { [k: string]: any }) {
    let { headers, ...otherOptions } = options ?? { headers: {} }
    headers = { ...headers, ...{ 'Content-Type': 'application/json' } }
    return { ...otherOptions, headers }
}

export const requester = {
    // get: async function <T> (path: string, params?: {}, options?: { [k: string]: any }) {
    //     const res = await axios.get<T>(path, {
    //         params: params,
    //         ...addRequestIdHeader(options)
    //     })
    //     return new Result<T>(res)
    // },

    post: async function <T>(
        path: string,
        payload?: any,
        options?: { [k: string]: any }
    ) {
        try {
            const content = JSON.stringify(payload)
            const res = await fetch(path, {
                method: 'POST',
                mode: 'cors',
                body: content,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': `${content.length}`,
                    Accept: '*/*',
                    Connection: 'keep-alive',
                },
            })
            // const res = await axios.post<T>(path, payload)
            return convertResult<T>(res)
        } catch (err) {
            const errRet: Result<T> = {
                errorId: '' + err,
                fail: true,
            }
            return errRet
        }
    },

    // put: async function <T> (path: string, payload: any, options?: { [k: string]: any }) {
    //     const res = await axios.put<T>(path, {
    //         data: payload,
    //         ...addContentTypeHeader(addRequestIdHeader(options))
    //     })
    //     return new Result<T>(res)
    // },

    // patch: async function <T> (path: string, payload: any, options?: { [k: string]: any }) {
    //     const res = await axios.patch<T>(path, {
    //         data: payload,
    //         ...addContentTypeHeader(addRequestIdHeader(options))
    //     })
    //     return new Result<T>(res)
    // },

    // delete: async function <T> (path: string, payload?: any, options?: { [k: string]: any }) {
    //     const res = await axios.delete<T>(path, {
    //         data: payload,
    //         ...addContentTypeHeader(addRequestIdHeader(options))
    //     })
    //     return new Result<T>(res)
    // }
}
