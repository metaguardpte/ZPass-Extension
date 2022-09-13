import type { Store } from '@/contents/all/store'
import { observer } from 'mobx-react-lite'
import SavePasswordTip from '../SavePasswordTip'
import ControlIcon from '../ControlIcon'
import { toJS } from 'mobx'

const Home = observer(({ store }: { store: Store }) => {
    const handleRemoveCredential = () => {
        store.removeCredential()
    }
    return (
        <>
            <ControlIcon style={toJS(store.controlIconStyle)} type="app" />
            <ControlIcon style={toJS(store.cardIconStyle)} type="credit" />
            <ControlIcon
                style={toJS(store.personalInfoIconStyle)}
                type="info"
            />
            <ControlIcon
                style={toJS(store.generatorIconStyle)}
                type="generator"
            />
            <ControlIcon style={toJS(store.totpIconStyle)} type="totp" />
            <SavePasswordTip
                credential={store.credential}
                removeCredential={handleRemoveCredential}
            />
        </>
    )
})

export default Home
