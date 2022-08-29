import chalk from 'chalk'
import express from 'express'
import webpack from 'webpack'
import devConfig from '../configs/webpack.dev'
import setupMiddlewares from '../middlewares'
import { HOST, PORT } from '../utils/constants'

async function start() {
    const compiler = webpack(devConfig)
    const devServer = express()
    setupMiddlewares(devServer, compiler)
    const httpServer = devServer.listen(PORT, HOST, () => {
        const coloredAddress = chalk.magenta.underline(`http://${HOST}:${PORT}`)
        console.log(
            `${chalk.bgYellow.black(
                ' INFO '
            )} DevServer is running at ${coloredAddress} ✔`
        )
    })

    ;['SIGINT', 'SIGTERM'].forEach((signal: any) => {
        process.on(signal, () => {
            httpServer.close()
            console.log(chalk.greenBright.bold('Exit'))
            process.exit()
        })
    })
}
start()
