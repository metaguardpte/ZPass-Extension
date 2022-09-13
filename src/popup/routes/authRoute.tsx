import config, { RouteConfig, RouteObject } from './routes'
import { useRoutes } from 'react-router-dom'
import store from '@/popup/store'

interface GetRouteConfig {
    (config: RouteConfig[]): RouteObject[]
}

export default function AuthRoute() {
    const userRole = store.userRole
    const getRouteConfig: GetRouteConfig = (config) => {
        return config.map(({ roles, backuri, ...route }) => {
            if (roles) {
                return roles.some((role) => userRole === role)
                    ? route.children
                        ? { ...route, children: getRouteConfig(route.children) }
                        : route
                    : {}
            } else {
                return route.children
                    ? { ...route, children: getRouteConfig(route.children) }
                    : route
            }
        })
    }
    const routeconfig = getRouteConfig(config)

    return useRoutes(routeconfig)
}
