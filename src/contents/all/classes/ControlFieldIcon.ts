import PageControl from './PageControl'
import FieldSet from './FieldSet'
import comm from '@/utils/communication'
import element from '@/utils/element'

export default class ControlFieldIcon {
    private inited = false
    constructor(
        private _pageControl: PageControl,
        private _fieldSet: FieldSet
    ) {}

    public create() {
        if (!this.inited) {
            this.show()
            this.reposition()
        }
        this.inited = true
    }

    public remove() {
        this.setVisibility(false)
    }

    private setVisibility(visible: boolean) {
        if (this._pageControl.tabId) {
            comm.setAppIconInit(visible, this._pageControl.tabId)
        }
    }

    public setIconCanShow(value: boolean) {
        if (this._pageControl.tabId) {
            comm.setAppIconCanShow(value, this._pageControl.tabId)
        }
    }

    public show() {
        this.setVisibility(true)
    }

    public reposition() {
        if (!this._pageControl || !this._fieldSet) {
            return
        }
        const target = this._fieldSet.controlField
        if (target === undefined) {
            return
        }
        const el = target.get(0)
        if (el) {
            const position = element.getIconPosition(el)
            if (this._pageControl.tabId) {
                comm.setAppPosition(position, this._pageControl.tabId)
            }
        }
    }
}
