const isVisible = (el: HTMLElement) => {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
}

const getIconPosition = (el: HTMLElement) => {
    const targetBounding = el.getBoundingClientRect()
    const position: Message.Position = {
        isTop: window.self === window.top,
        left: targetBounding.left,
        right: targetBounding.right,
        top: targetBounding.top,
        href: window.location.href,
        name: window.name,
        bottom: targetBounding.bottom,
        width: targetBounding.width,
        height: targetBounding.height,
    }
    return position
}

export default { isVisible, getIconPosition }
