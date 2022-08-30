export interface ITheme {
    /** Show a footer in the credential dropdown list? */
    enableDropdownFooter: boolean
    /** The start of the background color gradient of the selected item in the credential dropdown list */
    dropdownSelectedItemColorStart: string
    /** The end of the background color gradient of the selected item in the credential dropdown list */
    dropdownSelectedItemColorEnd: string
    /** The width of the border of the credential dropdown list dropdown */
    dropdownBorderWidth: number
    /** The width of the shadow of the credential dropdown list dropdown */
    dropdownShadowWidth: number
    /** The padding of an item in the credential dropdown list dropdown */
    dropdownItemPadding: number
    /** The color of the scrollbar in the credential dropdown list dropdown */
    dropdownScrollbarColor: string
}

export interface ISettings {
    /** Show the ZPass icon in the username field? */
    showUsernameIcon: boolean
    /** Show the dropdown when username field gets focus */
    showDropdownOnFocus: boolean
    /** Automatically fill credential field when there is only one credential found */
    autoFillSingleCredential: boolean
    /** Show suggestions while typing in the username field */
    autoComplete: boolean
    /** Listen for changes in the html document and search for new input fields */
    searchForInputsOnUpdate: boolean
}

export const defaultSettings: ISettings = {
    showUsernameIcon: true,
    showDropdownOnFocus: true,
    autoFillSingleCredential: true,
    autoComplete: true,
    searchForInputsOnUpdate: true,
}

/** Async method for loading settings */
export function loadSettings(): Promise<ISettings> {
    return new Promise<ISettings>((resolve, reject) => {
        chrome.storage.sync.get(defaultSettings, (items) => {
            if (chrome.runtime.lastError !== undefined) {
                reject()
            } else {
                resolve(items as ISettings)
            }
        })
    })
}

/** Async method for saving settings */
export function saveSettings(settings: Partial<ISettings>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        chrome.storage.sync.set(settings, () => {
            if (chrome.runtime.lastError !== undefined) {
                reject()
            } else {
                resolve()
            }
        })
    })
}
