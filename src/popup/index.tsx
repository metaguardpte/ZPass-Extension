import React from 'react'
import { render } from 'react-dom'
import Routes from './routes'
import 'antd/dist/antd.min.css'
import '../i18n'
import '../global.less'
import '@icon-park/react/styles/index.css'

render(
    <React.StrictMode>
        <Routes />
    </React.StrictMode>,
    document.getElementById('root')
)
