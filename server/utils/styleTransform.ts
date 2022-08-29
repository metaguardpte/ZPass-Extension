export default function (css: string) {
    // Insert the extension ID into CSS
    const modifidCss = css.replace(/__MSG_@@extension_id__/g, chrome.runtime.id)
    const style = document.createElement('style')
    style.innerHTML = modifidCss
    document.addEventListener('DOMContentLoaded', function () {
        document.head.appendChild(style)
    })
}
