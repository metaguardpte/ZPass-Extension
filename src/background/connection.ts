type EventSourceEvent = Event & {
    data?: any
    target: Record<string, any> | null
}

type OnOpenType = () => void
type OnMessageType = (data: any) => void
type OnPauseType = () => void
type OnErrorType = (event: EventSourceEvent) => void

interface IBackgroundConnection {
    startUp: (port: number) => void
    onOpen: OnOpenType
    onMessage: OnMessageType
    onPause: OnPauseType
    onError: OnErrorType
    isConnected: boolean
    port: number
}

class BackgroundConnection implements IBackgroundConnection {
    private source?: EventSource
    private _onOpen: OnOpenType
    private _onMessage: OnMessageType
    private _onPause: OnPauseType
    private _onError: OnErrorType
    private _port: number

    public startUp(port: number): void {
        if (this.source !== undefined) {
            this.source.close()
            this.source = undefined
        }
        this.source = new EventSource(`http://localhost:${port}/events`)
        this._port = port

        const self = this
        this.source.addEventListener('open', () => {
            if (self.onOpen !== undefined) {
                self.onOpen()
            }
        })
        this.source.addEventListener('message', (event) => {
            if (self.onMessage !== undefined) {
                self.onMessage(event.data)
            }
        })
        this.source.addEventListener('pause', () => {
            if (self.onPause !== undefined) {
                self.onPause()
            }
            this.source?.close()
            this.source = undefined
        })
        this.source.addEventListener('error', (event: EventSourceEvent) => {
            this.source = undefined
            if (self.onError !== undefined) {
                self.onError(event)
            }
        })
    }

    get isConnected() {
        return this.source?.readyState === EventSource.OPEN
    }

    get isConnecting() {
        return this.source?.readyState === EventSource.CONNECTING
    }

    get port() {
        return this._port
    }

    get onOpen() {
        return this._onOpen
    }

    set onOpen(cb: OnOpenType) {
        this._onOpen = cb
    }

    get onMessage() {
        return this._onMessage
    }

    set onMessage(v: OnMessageType) {
        this._onMessage = v
    }

    get onPause() {
        return this._onPause
    }

    set onPause(v: OnPauseType) {
        this._onPause = v
    }

    get onError() {
        return this._onError
    }

    set onError(v: OnErrorType) {
        this._onError = v
    }
}

export default new BackgroundConnection()
