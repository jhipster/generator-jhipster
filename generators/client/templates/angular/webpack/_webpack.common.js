const webpack = require('webpack');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StringReplacePlugin = require('string-replace-webpack-plugin');

module.exports = function (options) {
    const DATAS = {
        VERSION: JSON.stringify(require("../package.json").version),
        DEBUG_INFO_ENABLED: options.env === 'dev'
    };
    return {
        entry: {
            'polyfills': './src/main/webapp/app/polyfills',
            <%_ if (useSass) { _%>
            'global': './src/main/webapp/content/scss/global.scss',
            <%_ } else { _%>
            'global': './src/main/webapp/content/css/global.css',
            <%_ } _%>
            'vendor': [
                './src/main/webapp/app/vendor',
                '@angular/common',
                '@angular/compiler',
                '@angular/core',
                '@angular/forms',
                '@angular/http',
                '@angular/platform-browser',
                '@angular/platform-browser-dynamic',
                '@angular/upgrade',
                '@ng-bootstrap/ng-bootstrap',
                'angular2-cookie',
                'angular2-infinite-scroll',
                'jquery',
                'ng-jhipster',
                'ng2-webstorage',
                'rxjs',
                <%_ if (websocket == 'spring-websocket') { _%>
                'sockjs-client',
                'webstomp-client',
                <%_ } _%>
                'ui-router-ng2'
            ],
            'main': './src/main/webapp/app/app.main'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: ['node_modules']
        },
        module: {
            exprContextCritical: false,
            rules: [
                { test: /bootstrap\/dist\/js\/umd\//, loader: 'imports-loader?jQuery=jquery' },
                {
                    test: /\.ts$/,
                    loaders: [
                        'angular2-template-loader',
                        'awesome-typescript-loader'
                    ],
                    exclude: ['node_modules/generator-jhipster']
                },
                {
                    test: /\.html$/,
                    loader: 'raw-loader',
                    exclude: ['./src/main/webapp/index.html']
                },
                <%_ if (useSass) { _%>
                {
                    test: /\.scss$/,
                    loaders: ['to-string-loader', 'css-loader', 'sass-loader'],
                    exclude: /(vendor\.scss|global\.scss)/
                },
                {
                    test: /(vendor\.scss|global\.scss)/,
                    loaders: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
                },
                <%_ } else { _%>
                {
                    test: /\.css$/,
                    loaders: ['to-string-loader', 'css-loader'],
                    exclude: /(vendor\.css|global\.css)/
                },
                {
                    test: /(vendor\.css|global\.css)/,
                    loaders: ['style-loader', 'css-loader']
                },
                <%_ } _%>
                {
                    test: /\.(jpe?g|png|gif|svg|woff|woff2|ttf|eot)$/i,
                    loaders: [
                        'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
                        'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
                    ]
                },
                {
                    test: /app.constants.ts$/,
                    loader: StringReplacePlugin.replace({
                        replacements: [{
                            pattern: /\/\* @toreplace (\w*?) \*\//ig,
                            replacement: function (match, p1, offset, string) {
                                return `_${p1} = ${DATAS[p1]};`;
                            }
                        }
                    ]})
                }
            ]
        },
        plugins: [
            new CommonsChunkPlugin({
                names: ['manifest', 'polyfills', 'vendor'].reverse()
            }),
            new CopyWebpackPlugin([
                { from: './node_modules/swagger-ui/dist', to: 'swagger-ui/dist' },
                { from: './src/main/webapp/swagger-ui/', to: 'swagger-ui' },
                { from: './src/main/webapp/favicon.ico', to: 'favicon.ico' },
                { from: './src/main/webapp/robots.txt', to: 'robots.txt' }<% if (enableTranslation) { %>,
                { from: './src/main/webapp/i18n', to: 'i18n' }<% } %>
            ]),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"
            }),
            new HtmlWebpackPlugin({
                template: './src/main/webapp/index.ejs',
                chunksSortMode: 'dependency',
                inject: 'body',
                data: DATAS
            }),
            new StringReplacePlugin()
        ]
    };
};
