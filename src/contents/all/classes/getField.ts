import element from '@/utils/element'
import common from '@/utils/communication'
import findText from '@/contents/all/utils/findText'
import fillField from '@/contents/all/utils/fillField'
import getTotpField from '@/contents/all/classes/getTotpField'

export type Fields = Map<string, Set<HTMLInputElement>>
export interface GetField {
    (tabId: number): FieldResult
}
export type FillData = { [k in string]: string } | string

export interface FieldResult {
    detectFieldsByInput: () => void
    addFieldByInput: (inputEl: HTMLInputElement) => void
    fillPage: (data: FillData, type: VaultItemStrType) => void
    position: () => void
}
type Keyword = {
    [k in string]: string[][]
}

type ChooseFields = { type: VaultItemStrType; inputEl: HTMLInputElement }[]
const cardKeyword: Keyword = {
    number: [['card', 'number']],
    holder: [['card', 'name']],
    cvv: [['cvv'], ['card', 'code'], ['cvc'], ['security', 'code']],
    expiry: [['expiry'], ['mm'], ['yy'], ['date']],
    firstName: [['first', 'name']],
    lastName: [['last', 'name']],
}

const personalInfoKeyword: Keyword = {
    fullName: [['full name'], ['your', 'name']],
    firstName: [['first', 'name']],
    lastName: [['last', 'name'], ['surname']],
    email: [['email'], ['e-mail']],
    phone: [['phone'], ['contact', 'number'], ['mobile', 'number']],
    address: [
        ['address'],
        ['apt'],
        ['unit'],
        ['floor'],
        ['suite'],
        ['building'],
    ],
    city: [['city']],
    province: [['state'], ['province']],
    zipCode: [['zip'], ['postal', 'code']],
    country: [['country'], ['region']],
    note: [['note']],
}

const ignoreTypes = [
    'checkbox',
    'submit',
    'button',
    'hidden',
    'file',
    'image',
    'radio',
    'color',
    'reset',
]
const ignoreFields = ['expiry']

const initMap = (keyword: Keyword) => {
    const map = new Map() as Fields
    for (const key of Object.keys(keyword)) {
        const set = new Set<HTMLInputElement>()
        map.set(key, set)
    }
    return map
}

const getField: GetField = (tabId) => {
    const totpField = getTotpField(tabId)
    const personalInfoMap = initMap(personalInfoKeyword)
    const creditCardInfoMap = initMap(cardKeyword)
    const chooseFields: ChooseFields = new Proxy([], {
        set(
            target: any[],
            p: string | symbol,
            value: ChooseFields[0] | number,
            receiver: any
        ): boolean {
            if (p === 'length') {
                if (value !== 0) {
                    return true
                } else {
                    return Reflect.set(target, p, value, receiver)
                }
            }
            const item = value as ChooseFields[0]
            const index = target.findIndex((data) => data.type === item.type)
            if (index > -1) {
                return Reflect.set(target, index, value)
            } else {
                return Reflect.set(target, p, value, receiver)
            }
        },
    })

    const addField = (
        value: string,
        inputEl: HTMLInputElement,
        keyword: Keyword,
        map: Fields,
        type: VaultItemStrType
    ) => {
        if (ignoreTypes.includes(inputEl.type)) return true
        const text = value?.trim()
        if (text && text.length < 50) {
            for (const [key, arr] of Object.entries(keyword)) {
                for (const wordArr of arr) {
                    let flag = 1
                    for (const value of wordArr) {
                        if (
                            text
                                .toLocaleLowerCase()
                                .indexOf(value.toLocaleLowerCase()) === -1
                        ) {
                            flag = 0
                        }
                    }
                    if (flag) {
                        const inputEls = map.get(key)!
                        if (!inputEls.has(inputEl)) {
                            inputEls.add(inputEl)
                            InputObserver(inputEl, inputEls, map, keyword, type)
                        }
                        return true
                    }
                }
            }
        }
        return false
    }

    const detectFields = () => {
        const inputEls = document.querySelectorAll('input')
        if (!inputEls.length) return
        for (const inputEl of inputEls) {
            totpField.addFieldByInput(inputEl)
            if (inputEl.placeholder) {
                const creditResult = addField(
                    inputEl.placeholder,
                    inputEl,
                    cardKeyword,
                    creditCardInfoMap,
                    'credit'
                )
                const infoResult = addField(
                    inputEl.placeholder,
                    inputEl,
                    personalInfoKeyword,
                    personalInfoMap,
                    'info'
                )
                if (creditResult || infoResult) {
                    continue
                }
            }
            if (inputEl.type) {
                const creditResult = addField(
                    inputEl.type,
                    inputEl,
                    cardKeyword,
                    creditCardInfoMap,
                    'credit'
                )
                const infoResult = addField(
                    inputEl.type,
                    inputEl,
                    personalInfoKeyword,
                    personalInfoMap,
                    'info'
                )
                if (creditResult || infoResult) {
                    continue
                }
            }
            const text = findText(inputEl)
            if (text) {
                const infoResult = addField(
                    text,
                    inputEl,
                    personalInfoKeyword,
                    personalInfoMap,
                    'info'
                )
                const creditResult = addField(
                    text,
                    inputEl,
                    cardKeyword,
                    creditCardInfoMap,
                    'credit'
                )
                if (!(infoResult || creditResult)) {
                    setTimeout(() => {
                        const text = findText(inputEl)
                        if (text) {
                            addField(
                                text,
                                inputEl,
                                personalInfoKeyword,
                                personalInfoMap,
                                'info'
                            )
                            addField(
                                text,
                                inputEl,
                                cardKeyword,
                                creditCardInfoMap,
                                'credit'
                            )
                        }
                    }, 1000)
                }
            }
        }
    }
    const chooseField = (
        map: Fields,
        keyword: Keyword,
        type: VaultItemStrType
    ) => {
        if (!map) return null
        if (type === 'info') {
            let sum = 0
            map.forEach((value, key) => {
                if (key === 'firstName') {
                    return
                }
                if (value.size) {
                    sum++
                }
            })
            if (sum < 2) {
                return null
            }
        }
        if (type === 'credit' && !map.get('number')!.size) {
            return null
        }
        for (const key of Object.keys(keyword)) {
            if (ignoreFields.includes(key)) return null
            if (map.get(key) && map.get(key)!.values().next().value) {
                return map.get(key)!.values().next().value
            }
        }
    }
    const listenElementHidden = (el: HTMLElement, type: VaultItemStrType) => {
        setTimeout(() => {
            if (element.isVisible(el)) {
                listenElementHidden(el, type)
            } else {
                const index = chooseFields.findIndex(
                    (item) => item.inputEl === el
                )
                if (index > -1) {
                    chooseFields.splice(index, 1)
                }
                common.setIconInit(false, tabId, type)
                common.setIconCanShow(true, tabId, type)
            }
        }, 500)
    }
    const createIcon = (
        map: Fields,
        keyword: Keyword,
        type: VaultItemStrType
    ) => {
        const el = chooseField(map, keyword, type)
        if (chooseFields.find((item) => item.inputEl === el)) return
        if (el && element.isVisible(el)) {
            positionIcon(type, el)
            if (type === 'info') {
                common.setIconInit(true, tabId, type)
            }

            if (type === 'credit') {
                common.setIconInit(true, tabId, type)
            }

            listenElementHidden(el, type)
            chooseFields.push({
                type,
                inputEl: el,
            })
        }
    }
    const positionIcon = (
        type: VaultItemStrType,
        iconControlField: HTMLInputElement
    ) => {
        if (!iconControlField) return
        const position = element.getIconPosition(iconControlField)
        common.setPosition(position, tabId, type)
    }

    const InputObserver = (
        inputEl: HTMLInputElement,
        inputEls: Set<HTMLInputElement>,
        map: Fields,
        keyword: Keyword,
        type: VaultItemStrType
    ) => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].intersectionRatio === 0) {
                if (inputEls.has(inputEl)) {
                    inputEls.delete(inputEl)
                }
            } else {
                inputEls.add(inputEl)
            }
            createIcon(map, keyword, type)
        })
        inputEl.addEventListener('keydown', () => {
            common.setIconCanShow(true, tabId, type)
        })
        observer.observe(inputEl)
    }
    const filterHiddenField = (map: Fields) => {
        if (!map) return
        map.forEach((inputEls, key) => {
            inputEls.forEach((inputEl) => {
                if (!element.isVisible(inputEl)) {
                    inputEls.delete(inputEl)
                }
            })
        })
    }
    const detectFieldsByInput = () => {
        detectFields()
        filterHiddenField(personalInfoMap)
        filterHiddenField(creditCardInfoMap)
        createIcon(personalInfoMap, personalInfoKeyword, 'info')
        createIcon(creditCardInfoMap, cardKeyword, 'credit')
    }

    const addFieldByInput = (inputEl: HTMLInputElement) => {
        totpField.addFieldByInput(inputEl)
        const addData = (value: string) => {
            if (
                addField(
                    value,
                    inputEl,
                    cardKeyword,
                    creditCardInfoMap,
                    'credit'
                )
            ) {
                filterHiddenField(creditCardInfoMap)
                createIcon(creditCardInfoMap, cardKeyword, 'credit')
                return true
            }
            if (
                addField(
                    value,
                    inputEl,
                    personalInfoKeyword,
                    personalInfoMap,
                    'info'
                )
            ) {
                filterHiddenField(personalInfoMap)
                createIcon(personalInfoMap, personalInfoKeyword, 'info')
                return true
            }
            return false
        }
        if (inputEl.placeholder && addData(inputEl.placeholder)) {
            return
        }
        if (inputEl.type && addData(inputEl.type)) {
            return
        }
        const text = findText(inputEl)
        if (text) {
            addData(text)
        }
    }

    const formatData = (fillData: FillData) => {
        if (typeof fillData === 'string') return
        const data: { [k in string]: string[] } = {}
        for (const key of Object.keys(fillData)) {
            if (key === 'address1') {
                if (!data.address) {
                    data.address = []
                }
                data.address[0] = fillData[key]
                continue
            }
            if (key === 'address2') {
                if (!data.address) {
                    data.address = []
                }
                data.address[1] = fillData[key]
                continue
            }
            if (!data[key]) {
                data[key] = []
            }
            data[key].push(fillData[key])
        }
        return data
    }
    const position = () => {
        totpField.positionIcon()
        chooseFields.forEach((item) => {
            positionIcon(item.type, item.inputEl)
        })
    }
    const fillPage = (fillData: FillData, type: VaultItemStrType) => {
        let map = personalInfoMap
        if (type === 'totp' && typeof fillData === 'string') {
            totpField.fillPage(fillData)
            return
        }
        if (type === 'credit' && typeof fillData === 'object') {
            map = creditCardInfoMap
            if (!map.get('holder')!.size) {
                if (fillData.holder) {
                    const data = fillData.holder.split(' ')
                    fillData.firstName = data[0]
                    fillData.lastName = data[1]
                }
            }
        }
        if (type === 'info' && typeof fillData === 'object') {
            if (!map.get('fullName')!.size) {
                const data = fillData.fullName.split(' ')
                fillData.firstName = data[0]
                fillData.lastName = data[1]
            }
        }
        if (!map) return
        const data = formatData(fillData)
        if (data) {
            for (const key of Object.keys(data)) {
                const inputEls = map.get(key)
                if (!inputEls || !inputEls.size) continue
                const inputElArr = Array.from(inputEls)
                for (let i = 0; i < inputElArr.length; i++) {
                    if (data[key][i]) {
                        fillField(inputElArr[i], data[key][i])
                    }
                }
            }
        }
    }
    return {
        detectFieldsByInput,
        addFieldByInput,
        position,
        fillPage,
    }
}

export default getField
