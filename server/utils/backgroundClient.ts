import { EXTENSION_AUTO_RELOAD_PATH, HOST, PORT } from './constants'
const source = new EventSource(
    `http://${HOST}:${PORT}${EXTENSION_AUTO_RELOAD_PATH}`
)

source.addEventListener(
    'open',
    () => {
        console.log('connected')
    },
    false
)

source.addEventListener(
    'message',
    (event) => {
        console.log('received a no event name message, data:')
        console.log(event.data)
    },
    false
)

source.addEventListener(
    'pause',
    () => {
        console.log(
            'received pause message from server, ready to close connection!'
        )
        source.close()
    },
    false
)

source.addEventListener(
    'compiled successfully',
    (event: EventSourceEvent) => {
        const shouldReload =
            JSON.parse(event.data).action ===
            'reload extension and refresh current page'

        if (shouldReload) {
            console.log('received the signal to reload chrome extension')
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    if (tab.id) {
                        let received = false
                        chrome.tabs.sendMessage(
                            tab.id,
                            {
                                from: 'background',
                                action: 'refresh current page',
                            },
                            () => {
                                if (!received) {
                                    received = true
                                    source.close()
                                    console.log('reload extension')
                                    chrome.runtime.reload()
                                }
                            }
                        )
                    }
                })
            })
        }
    },
    false
)

source.addEventListener(
    'error',
    (event: EventSourceEvent) => {
        if (event.target!.readyState === 0) {
            console.error('You need to open devServer first!')
        } else {
            console.error(event)
        }
    },
    false
)

export {}
