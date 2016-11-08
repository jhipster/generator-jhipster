module.exports = {
    entry: './src/main/webapp/app/app.main',
    resolve: {
        extensions: ['', '.ts', '.js', '.json'],
        modules: ['./', 'node_modules']
    },
    output: {
        path: './src/main/webapp/bin',
        filename: 'app.bundle.js'
    },
    module: {
        loaders: [{
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
            exlude: ['./src/main/webapp/index.html']
        }]
    }
 };
