import webpack from 'webpack'
import prodConfig from '../configs/webpack.prod'

const compiler = webpack(prodConfig)
compiler.run((err, stats) => {
    if (err) {
        console.error(err)
        return
    }

    const info = stats?.toJson()

    if (stats?.hasErrors()) {
        console.error(info?.errors)
    }

    if (stats?.hasWarnings()) {
        console.warn(info?.warnings)
    }
})
