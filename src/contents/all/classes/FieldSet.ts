import styles from '@/less/content.less'
import comm from '@/utils/communication'
import PageControl from './PageControl'
import ControlFieldIcon from './ControlFieldIcon'

/**
 * Class for handling a set (username+password) fields
 */
export default class FieldSet {
    /** The selected credential.  */
    private _selectedCredential?: Message.Detail
    /** Holds the old value for the username field, so we only react when the value changes */
    private _oldUsernameValue: string
    /** Did the click start on the KeePass icon?  */
    private _iconOwnsClick: boolean
    /** Variable holding all icon styles (to easily remove all the styles at once) */
    private static allIconStyles = `${styles.green} ${styles.orange} ${styles.red}`
    /**
     * This is the field where gonna use ZPass's controls.
     * Might me undefined, if neither the username nor the password field is visible.
     */
    public _controlField?: JQuery
    /**
     * Used to remember the original title attribute from the username field
     * (because it changes when the cursor hovers the ZPass icon)
     */
    /** A list of listener functions that are attached to the control field. So we can detach and re-attach them */
    private readonly _LISTENER_FUNCTIONS: Record<
        keyof JQuery.TypeToTriggeredEventMap<
            HTMLElement,
            undefined,
            FieldSet,
            HTMLElement
        >,
        JQuery.TypeEventHandler<any, any, any, any, any>
    > = {}

    private _controlFieldIcon?: ControlFieldIcon

    /**
     * Append ZPass to the fields
     * @param _pageControl A pointer back to the PageControl class
     * @param passwordField Pointer to the password field
     * @param usernameField Pointer to the username field
     */
    constructor(
        private _pageControl: PageControl,
        public readonly passwordField: JQuery<HTMLInputElement>,
        public readonly usernameField?: JQuery<HTMLInputElement>,
        public readonly confirmField?: JQuery<HTMLInputElement>
    ) {
        document.addEventListener(
            'click',
            (e) => {
                if (this.usernameField && this.passwordField) {
                    let username = this.usernameField[0].value
                    let password = this.passwordField[0].value
                    if (
                        (this._pageControl._filledCredential &&
                            this._pageControl._filledCredential.isCompany) ||
                        this._pageControl.isOwner
                    ) {
                        username = ''
                        password = ''
                    }
                    const message: Message.Credential = {
                        username,
                        password,
                        tabId: this._pageControl.tabId,
                        uri: this._pageControl.currentUrl,
                    }
                    comm.currentCredential(message)
                }
            },
            true
        )
        if (this.usernameField) {
            this.usernameField[0].addEventListener('keydown', () => {
                this._controlFieldIcon?.setIconCanShow(true)
            })
        }
        if (this.passwordField) {
            this.passwordField[0].addEventListener('keydown', () => {
                this._controlFieldIcon?.setIconCanShow(true)
            })
        }
        this._controlFieldIcon = new ControlFieldIcon(this._pageControl, this)

        const iobserver = new IntersectionObserver(
            (_entries, _observer) => {
                if (_entries[0].intersectionRatio === 0) {
                    if (this.controlFieldIcon) {
                        this.controlFieldIcon.remove()
                    }
                    comm.passwordControlHidden(this._pageControl.tabId)
                    this._controlFieldIcon?.remove()
                }
                this._chooseControlField()
            },
            { root: document.documentElement }
        )

        if (this.usernameField) {
            iobserver.observe(this.usernameField.get(0)!)
        }
        iobserver.observe(this.passwordField.get(0)!)
        this._chooseControlField()

        const mobserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.removedNodes) {
                    if (node instanceof HTMLInputElement) {
                        setTimeout(() => {
                            this._removeOneIcon(node)
                        }, 100)
                    } else if (node instanceof HTMLElement) {
                        const inputFields = node.querySelectorAll('input')
                        if (inputFields.length) {
                            setTimeout(
                                () => this._removeIcons(inputFields),
                                100
                            )
                        }
                    }
                }
            }
        })

        // Start observing
        mobserver.observe(document.body, {
            childList: true,
            subtree: true,
        })

        const observer = new MutationObserver((mutations) => {
            this._controlFieldIcon?.reposition()
        })

        // Start observing
        const controlField = usernameField
            ? usernameField.get(0)
            : passwordField.get(0)
        observer.observe(controlField!, {
            attributes: true,
        })

        // Do we already have credentials?
    }

    private _removeIcons(inputFields: NodeListOf<Element>) {
        for (const inputField of inputFields) {
            this._removeOneIcon(inputField)
        }
    }

    private _removeOneIcon(inputField: Element) {
        if (
            inputField instanceof HTMLElement &&
            this._controlFieldIcon &&
            this._controlField?.get(0) === inputField
        ) {
            this._controlFieldIcon.remove()
        }
    }

    /** This method is called by the PageControl class when it receives credentials */
    /**
     * Select the specified credential.
     * @param credential The credential to select.
     */
    public selectCredential(credential?: Message.Detail) {
        this._selectedCredential = credential
    }

    /**
     * @return The field that has the ZPass icon and should display the dropdown.
     */
    public get controlField(): JQuery | undefined {
        return this._controlField
    }

    /** Enter the selected credentials into the fields  */
    public enterSelection() {
        if (!this._selectedCredential) {
            return // We don't want to do this if we have no selection or the dropdown isn't open
        }
        if (this.controlFieldIcon) {
            this.controlFieldIcon.remove()
        }
        comm.fillpassword(this._selectedCredential)
        this._selectedCredential = undefined
    }

    /**
     * Choose a control field from the username and password field.
     */
    private _chooseControlField() {
        if (this.usernameField?.is(':visible')) {
            this._setControlField(this.usernameField)
        } else if (this.passwordField.is(':visible')) {
            this._setControlField(this.passwordField)
        } else {
            this._setControlField() // We don't have a control field right now
        }
    }

    /**
     * Update the current control field.
     * @param newControlField The new control field.
     */
    private _setControlField(newControlField?: JQuery) {
        if (newControlField === this._controlField) {
            // The controlField didn't change?
            return
        }

        // If we already have a controlField, detach listeners and remove the dropdown
        if (this._controlField) {
            return
        }

        // Setup the controlField
        this._controlField = newControlField
        if (this._controlField) {
            // Disable Autofill on controlField. See https://stackoverflow.com/questions/15738259/disabling-chrome-autofill
            // Attach listeners
            for (const callbackName in this._LISTENER_FUNCTIONS) {
                // noinspection JSUnfilteredForInLoop
                this._controlField.on(
                    callbackName,
                    this._LISTENER_FUNCTIONS[callbackName]
                )
            }
            // Should we show the icon in the username field?
            if (this._pageControl.settings.showUsernameIcon) {
                setTimeout(async () => {
                    this._controlFieldIcon?.create()
                    await this._pageControl.findCredentialById()
                }, 500)
            }
        }
    }

    get controlFieldIcon() {
        return this._controlFieldIcon
    }
}
