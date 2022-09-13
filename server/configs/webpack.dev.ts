import { Configuration, HotModuleReplacementPlugin } from 'webpack'
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import common from './webpack.common'
import { merge } from 'webpack-merge'

const devConfig: Configuration = {
    mode: 'development',
    devtool: 'inline-cheap-module-source-map',
    plugins: [
        new HotModuleReplacementPlugin(),
        new ReactRefreshPlugin(),
        new ESLintPlugin({
            files: 'src/**/*',
            fix: true,
        }),
    ],
    stats: 'errors-only',
}

export default merge(common, devConfig)
