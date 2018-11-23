'use strict';
const path = require('path');
const vueLoaderConfig = require('./loader.conf');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function resolve(dir) {
    return path.join(__dirname, '..', dir);
}

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, '../'),
    entry: {
        app: './src/main/webapp/app/main.ts'
    },
    resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
            '@': resolve('src/main/webapp/app')
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: vueLoaderConfig
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    resolve('src'),
                    resolve('test'),
                    resolve('node_modules/webpack-dev-server/client'),
                    resolve('bootstrap-vue')
                ]
            },
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'babel-loader'
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            appendTsSuffixTo: ['\\.vue$'],
                            happyPackMode: false
                        }
                    }
                ],
                include: [resolve('src'), resolve('test')]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'content/[hash].[ext]'
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'content/[hash].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'content/[hash].[ext]'
                }
            }
        ]
    },
    node: {
        // prevent webpack from injecting useless setImmediate polyfill because Vue
        // source contains it (although only uses it if it's native).
        setImmediate: false,
        // prevent webpack from injecting mocks to Node native modules
        // that does not make sense for the client
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyWebpackPlugin([
            // { from: './node_modules/swagger-ui/dist/css', to: 'swagger-ui/dist/css' },
            // { from: './node_modules/swagger-ui/dist/lib', to: 'swagger-ui/dist/lib' },
            // { from: './node_modules/swagger-ui/dist/swagger-ui.min.js', to: 'swagger-ui/dist/swagger-ui.min.js' },
            // { from: './src/main/webapp/swagger-ui/', to: 'swagger-ui' },
            // { from: './src/main/webapp/content/', to: 'content' },
            // { from: './src/main/webapp/favicon.ico', to: 'favicon.ico' },
            // {
            //     from: './src/main/webapp/manifest.webapp',
            //     to: 'manifest.webapp'
            // },
            // jhipster-needle-add-assets-to-webpack - JHipster will add/remove third-party resources in this array
            // { from: './src/main/webapp/robots.txt', to: 'robots.txt' }
        ])
    ]
};
