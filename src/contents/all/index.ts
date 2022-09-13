import PageControl from '@/contents/all/classes/PageControl'
import comm from '@/utils/communication'
const pageControl = new PageControl()

window.addEventListener('DOMContentLoaded', async () => {
    const data = await comm.getActiveTabUrl()
    pageControl.setActiveTabUrl(data)
    pageControl.detectFields()
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLElement) {
                    if (node instanceof HTMLInputElement) {
                        setTimeout(() => pageControl.createFieldSet(node), 100)
                        setTimeout(() => {
                            pageControl.addFieldByInput(node)
                        }, 500)
                    } else {
                        const passwordFields = node.querySelectorAll(
                            'input[type="password"]'
                        )
                        if (passwordFields.length) {
                            setTimeout(
                                () =>
                                    pageControl.detectNewFields(passwordFields),
                                300
                            )
                        }
                        const inputEls = node.querySelectorAll('input')
                        for (const inputEl of inputEls) {
                            setTimeout(() => {
                                pageControl.addFieldByInput(inputEl)
                            }, 50)
                            setTimeout(() => {
                                pageControl.addFieldByInput(inputEl)
                            }, 3000)
                            setTimeout(() => {
                                pageControl.addFieldByInput(inputEl)
                            }, 10000)
                        }
                    }
                }
            }
        }
    })
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    })
})
