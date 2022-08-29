import React from 'react'
import { render } from 'react-dom'
import App from './App'
import '@/i18n'

export default (el: HTMLElement) => {
    render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        el
    )
}
