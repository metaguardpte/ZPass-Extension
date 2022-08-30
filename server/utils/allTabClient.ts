chrome.runtime.onMessage.addListener((request, _sender, sendResp) => {
    if (window.self !== window.top || !window) return
    const shouldRefresh =
        request.from === 'background' &&
        request.action === 'refresh current page'
    if (shouldRefresh) {
        sendResp({ from: 'content script', action: 'reload extension' })
        // waiting for extension reload
        setTimeout(() => window.location.reload(), 500)
    }
})

export {}
