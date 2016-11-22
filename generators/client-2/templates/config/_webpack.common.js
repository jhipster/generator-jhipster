const webpack = require('webpack');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const METADATA = {
    title: 'Angular2 Webpack Starter by @gdi2290 from @AngularClass',
    //baseUrl: '/',
    //isDevServer: helpers.isWebpackDevServer()
    isDev: true
};
module.exports = function (options) {
    return {
    entry: {
        'polyfills': './src/main/webapp/app/polyfills',
        'vendor': './src/main/webapp/app/vendor',
        'main': './src/main/webapp/app/app.main'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: ['node_modules']
    },
    output: {
        path: './target/www',
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js'
    },
    module: {
        rules: [{
            test: /[\/]angular\.js$/,
            loader: "exports?angular"
        },
            { test: /bootstrap\/dist\/js\/umd\//, loader: 'imports?jQuery=jquery' },
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
            loader: 'raw',
            exclude: ['./src/main/webapp/index.html']
        },
        { test: /\.scss$/, loaders: ['style', 'css', 'postcss', 'sass'] },
        { test: /\.css$/, loader: "style-loader!css-loader" },
        { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff" },
        { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/font-woff2" },
        { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/octet-stream" },
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=image/svg+xml" }]
    },
    plugins: [
        new CommonsChunkPlugin({
            name: ['polyfills', 'vendor'].reverse()
        }),
        new CopyWebpackPlugin([
            { from: './src/main/webapp/content', to: 'content'},
            { from: './src/main/webapp/i18n', to: 'i18n'}
        ]),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new HtmlWebpackPlugin({
            template: './src/main/webapp/index.html',
//            title: METADATA.title,
            chunksSortMode: 'dependency',
            metadata: METADATA,
            inject: 'body'
        })
    ]};
};
