import element from '@/utils/element'
import fillField from '@/contents/all/utils/fillField'
import common from '@/utils/communication'
import utils from '@/utils/utils'
import findText from '@/contents/all/utils/findText'

export interface TotpField {
    fillPage: (data: string) => void
    addFieldByInput: (inputEl: HTMLInputElement) => void
    positionIcon: () => void
}
export interface GetTotpField {
    (tabId: number): TotpField
}

const keywords = ['otp', 'auth']
const texts = ['enter code']
type GetKeys<T> = (keyof T)[]
const attrs: GetKeys<HTMLInputElement> = ['name', 'id', 'ariaLabel']

const getTotpField: GetTotpField = (tabId) => {
    const totpFieldSet = new Set<HTMLInputElement>()
    let controlField: HTMLInputElement | null = null
    const listenControlHidden = (inputEl: HTMLInputElement) => {
        setTimeout(() => {
            if (element.isVisible(inputEl)) {
                listenControlHidden(inputEl)
            } else {
                common.setTotpIconInit(false, tabId)
                common.setTotpIconCanShow(true, tabId)
            }
        }, 500)
    }
    const InputObserver = (inputEl: HTMLInputElement) => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].intersectionRatio !== 0) {
                controlField = inputEl
                common.setTotpIconInit(true, tabId)
                positionIcon()
                listenControlHidden(inputEl)
                // observer.disconnect()
            }
        })
        inputEl.addEventListener('keydown', () => {
            common.setTotpIconCanShow(true, tabId)
        })
        observer.observe(inputEl)
    }
    const ListenInputLocation = (inputEl: HTMLInputElement) => {
        const observer = new MutationObserver(() => {
            positionIcon()
        })
        observer.observe(inputEl, {
            attributes: true,
        })
    }
    const positionIcon = () => {
        setTimeout(() => {
            if (!controlField) return
            const position = element.getIconPosition(controlField)
            common.setTotpPosition(position, tabId)
        }, 300)
    }
    const addFieldByInput = (inputEl: HTMLInputElement) => {
        const controlInput = (inputEl: HTMLInputElement) => {
            totpFieldSet.add(inputEl)
            if (element.isVisible(inputEl)) {
                controlField = inputEl
                common.setTotpIconInit(true, tabId)
                positionIcon()
                listenControlHidden(controlField)
            }
            InputObserver(inputEl)
            ListenInputLocation(inputEl)
        }
        if (
            inputEl.type === 'text' ||
            inputEl.type === 'password' ||
            inputEl.type === 'tel'
        ) {
            if (totpFieldSet.has(inputEl)) return
            for (const attr of attrs) {
                const value = inputEl[attr]
                if (
                    typeof value === 'string' &&
                    keywords.find(
                        (item) => value.toLocaleLowerCase().indexOf(item) > -1
                    )
                ) {
                    controlInput(inputEl)
                    return
                }
            }
            const elText = findText(inputEl)
            for (const text of texts) {
                if (elText && elText.toLocaleLowerCase().indexOf(text) > -1) {
                    controlInput(inputEl)
                    break
                }
            }
        }
    }
    const fillPage = (data: string) => {
        if (!controlField) return
        const totp = utils.createTOTP(data)
        if (totp) {
            fillField(controlField, totp.generate())
        }
    }
    return {
        addFieldByInput,
        fillPage,
        positionIcon,
    }
}

export default getTotpField
