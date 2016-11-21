var CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    entry: {
        'polyfills': './src/main/webapp/app/polyfills',
        'vendor': './src/main/webapp/app/vendor',
        'main': './src/main/webapp/app/app.main'
    },
    resolve: {
        extensions: ['.ts', '.js', '.css', '.scss'],
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
            loader: 'raw-loader',
            exclude: ['./src/main/webapp/index.html']
        },
            { test: /\.scss$/, loaders: ['style', 'css', 'postcss', 'sass'] },
            { test: /\.css$/, loader: 'raw-loader' }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: './src/main/webapp/index.html'},
            { from: './src/main/webapp/content', to:'content'},
            { from: './src/main/webapp/i18n', to:'i18n'}
        ])
    ]
 };
