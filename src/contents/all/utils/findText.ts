const ignoreEls = ['form', 'body']

const findText = (el: HTMLElement): string | null => {
    const previousSibling = el.previousSibling
    if (previousSibling && previousSibling instanceof HTMLElement) {
        if (previousSibling.innerText && previousSibling.innerText.trim()) {
            return ignoreEls.includes(
                previousSibling.tagName.toLocaleLowerCase()
            )
                ? null
                : previousSibling.innerText
        }
        return findText(previousSibling)
    }
    const parentEl = el.parentElement
    if (!parentEl) return null
    if (parentEl.innerText && parentEl.innerText.trim()) {
        return ignoreEls.includes(parentEl.tagName.toLocaleLowerCase())
            ? null
            : parentEl.innerText
    }
    return findText(parentEl)
}

export default findText
