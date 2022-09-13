import App from '../App'
import Login from '../pages/Login'
import type { RouteObject } from 'react-router-dom'
import HomeBase from '../pages/Home'
import Home from '../pages/Home/home'
import Download from '../pages/Download'
import ItemForm from '../pages/Home/ItemForm'
import PasswordGenerator from '../pages/PasswordGenerator'
import Lock from '../pages/Lock'

interface RouteConfig extends RouteObject {
    roles?: string[]
    backuri?: string
    children?: RouteConfig[]
}

const config: RouteConfig[] = [
    {
        path: '/',
        element: <App />,
        caseSensitive: false,
        children: [
            {
                path: '/login',
                element: <Login />,
                caseSensitive: false,
            },
            {
                path: '/home',
                element: <HomeBase />,
                caseSensitive: false,

                children: [
                    {
                        path: '/home/home',
                        element: <Home />,
                        caseSensitive: false,
                        index: true,
                    },
                    {
                        path: '/home/passwordGenerator',
                        element: <PasswordGenerator />,
                        caseSensitive: false,
                    },
                ],
            },
            {
                path: '/download',
                element: <Download />,
                caseSensitive: false,
            },
            {
                path: '/form/:id',
                element: <ItemForm />,
                caseSensitive: false,
            },
            {
                path: '/lock',
                element: <Lock />,
                caseSensitive: false,
            },
        ],
    },
]

export { RouteConfig, RouteObject }
export default config
