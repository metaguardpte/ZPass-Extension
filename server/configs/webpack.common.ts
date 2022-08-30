import { resolve } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import WebpackBar from 'webpackbar'
import { Configuration } from 'webpack'
import entry from '../utils/entry'
import { __DEV__ } from '../utils/constants'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
// @ts-ignore
import { HtmlWebpackSkipAssetsPlugin } from 'html-webpack-skip-assets-plugin'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'

const PROJECT_ROOT = resolve(__dirname, '../../')
const config: Configuration = {
    cache: {
        type: 'filesystem',
    },
    entry,
    output: {
        publicPath: '/',
        filename: 'js/[name].js',
        path: resolve(PROJECT_ROOT, 'dist'),
        hotUpdateChunkFilename: 'hot/[id].[fullhash].hot-update.js',
        hotUpdateMainFilename: 'hot/[runtime].[fullhash].hot-update.json',
        clean: !__DEV__,
    },
    resolve: {
        extensions: ['.js', '.css', '.ts', '.tsx'],
        alias: {
            '@': resolve(PROJECT_ROOT, 'src'),
        },
    },
    performance: {
        hints: false,
    },
    plugins: [
        new WebpackBar(),
        new HtmlWebpackPlugin({
            filename: 'popup.html',
            template: 'public/popup.html',
            chunks: ['popup'],
        }),
        new HtmlWebpackSkipAssetsPlugin({
            skipAssets: [/antd[\w\W]+css$/],
        }),
        new NodePolyfillPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: __DEV__
                        ? 'src/manifest.dev.json'
                        : 'src/manifest.prod.json',
                    to: 'manifest.json',
                },
                { from: 'public/images/', to: 'images/' },
            ],
        }),
        new MiniCssExtractPlugin({
            filename: `css/[name].css`,
            ignoreOrder: false,
            attributes: {
                id: 'theme',
            },
        }),
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                lightTheme: {
                    name: 'antd',
                    test: /antd\.min\.css/,
                    type: 'css/mini-extract',
                    chunks: 'all',
                    enforce: true,
                },
                darkTheme: {
                    name: 'antd.dark',
                    test: /antd\.dark\.min\.css/,
                    type: 'css/mini-extract',
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024,
                    },
                },
                generator: {
                    filename: 'images/[hash][ext][query]',
                },
            },
            {
                test: /\.(ttf|woff|woff2|eot|otf)$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024,
                    },
                },
                generator: {
                    filename: 'fonts/[hash][ext][query]',
                },
            },
            {
                test: /\.less$/,
                exclude: [/node_modules/, /\.lazy\.less$/, /global\.less/],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'less-loader',
                    },
                ],
            },
            {
                test: /global\.less$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'less-loader',
                    },
                ],
            },
            {
                test: /\.lazy\.less$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            injectType: 'lazyStyleTag',
                            insert: (
                                element: HTMLElement,
                                options: { target: HTMLElement }
                            ) => {
                                const parent = options.target || document.head
                                parent.appendChild(element)
                            },
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: false,
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'less-loader',
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: false,
                        },
                    },
                ],
            },
        ],
    },
}
export default config
