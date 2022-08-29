const id = '#theme'
const darkId = '#dark-theme'
const theme = 'dark'
const themes: { [k in string]: HTMLElement | null } = {}
themes[theme] = document.querySelector('#dark-theme')
async function modifyTheme(value: 'dark' | 'light') {
    const htmlElement = document.documentElement
    htmlElement.setAttribute('theme', value)
    const lightTheme = document.querySelector(id)
    const darkTheme = document.querySelector(darkId)
    if (value === 'light') {
        if (!lightTheme) {
            const newTheme = themes[value]
            if (newTheme) {
                document.head.appendChild(newTheme)
            } else {
                // @ts-ignore
                await import('antd/dist/antd.min.css')
                themes[value] = document.querySelector(id)
            }
        }
        if (darkTheme) {
            setTimeout(() => {
                darkTheme.remove()
            }, 100)
        }
        return
    }
    const newTheme = themes[theme]!
    if (!darkTheme) {
        document.head.appendChild(newTheme)
    }
    if (lightTheme) {
        setTimeout(() => {
            lightTheme.remove()
        }, 100)
    }
}

export default modifyTheme
