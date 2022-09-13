import PageControl from '../PageControl'
import GeneratorFieldSet from './GeneratorFieldSet'
import comm from '@/utils/communication'
import element from '@/utils/element'

// Create icon for control field
export default class ControlFieldIcon {
    // icon on the right
    private inited = false
    constructor(
        private _pageControl: PageControl,
        private _fieldSet: GeneratorFieldSet
    ) {}

    public create() {
        // when click icon or out of dropdown, hide dropdown
        if (!this.inited) {
            this.setIconCanShow(true)
            this.reposition()
        }
        this.inited = true
        //
    }

    public remove() {
        this.setVisibility(false)
    }

    private setVisibility(visible: boolean) {
        if (this._pageControl.tabId) {
            comm.setGeneratorIconCanShow(visible, this._pageControl.tabId)
        }
    }

    public setIconCanShow(value: boolean) {
        if (this._pageControl.tabId) {
            comm.setGeneratorIconCanShow(value, this._pageControl.tabId)
        }
    }

    // window resize, recalculate the location of the icon
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
                comm.setGeneratorPosition(position, this._pageControl.tabId)
            }
        }
    }
}
