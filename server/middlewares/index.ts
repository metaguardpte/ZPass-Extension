import { Compiler } from 'webpack'
import { Express } from 'express'
import webpackMiddleware from './webpackMiddleware'
import extensionAutoReload from './extensionAutoReload'
import { EXTENSION_AUTO_RELOAD_PATH } from '../utils/constants'

export default function setupMiddlewares(
    devServer: Express,
    compiler: Compiler
): void {
    devServer.use(webpackMiddleware(compiler))
    devServer.use(EXTENSION_AUTO_RELOAD_PATH, extensionAutoReload(compiler))
}
