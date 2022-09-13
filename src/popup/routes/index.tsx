import { HashRouter } from 'react-router-dom'
import AuthRoute from './authRoute'

export default function routes() {
    return (
        <HashRouter>
            <AuthRoute></AuthRoute>
        </HashRouter>
    )
}
