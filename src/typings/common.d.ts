export interface TResponse {
    code: number
    message: string
    data: any
}

export interface TCreateItem {
    title: string
    info: string
    details: TItem
}

export interface TItem {
    title?: string
    username: string
    password: string
    url: string
}

export interface TWindowTopInfo {
    vault_uuid: string
    item_uuid: string
    window_top_title: string
    window_top_url: string
}
