import comm from '@/utils/communication'
import handler from './communication'
import store from './store'
import { localStore } from './storage'
import i18n from '@/i18n'
import { useNavigate, useOutlet } from 'react-router-dom'
import { useEffect } from 'react'
import type { Store } from '@/popup/store'
import { observer } from 'mobx-react-lite'

comm.startUp(handler, true)

const App = () => {
    const AppContent = observer(({ _store }: { _store: Store }) => {
        const Children = () => useOutlet()
        const naigate = useNavigate()
        useEffect(() => {
            if (localStore.language !== '') {
                i18n.changeLanguage(localStore.language)
            } else if (navigator.language === 'zh-CN') {
                i18n.changeLanguage('zh')
            }
        }, [])
        useEffect(() => {
            if (!_store.isAppInstalled) {
                naigate('/download', { replace: false })
            } else if (!_store.isLogin) {
                naigate('/login', { replace: false })
            } else if (_store.isLock) {
                naigate('/lock', { replace: false })
            } else {
                naigate('/home/home', { replace: false })
            }
        }, [_store.isLogin, _store.isAppInstalled, _store.isLock])

        return (
            <div style={{ width: '400px' }}>
                <Children />
            </div>
        )
    })

    return <AppContent _store={store} />
}

export default App
