import common from './webpack.common'
import { merge } from 'webpack-merge'
import TerserPlugin from 'terser-webpack-plugin'
import { Configuration } from 'webpack'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'

const prodConfig: Configuration = {
    mode: 'production',
    plugins: [new CssMinimizerPlugin()],
    optimization: {
        /* splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[/\\]node_modules[/\\](react|react-dom)[/\\]/,
                    name: 'vendor',
                    chunks: 'all',
                },
            },
        }, */
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
}

export default merge(common, prodConfig)
