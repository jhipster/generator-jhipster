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
            loader: 'awesome-typescript-loader',
        }],
        rules: [
            {
                test: /\.ts$/,
                exclude: [/\.(spec|e2e)\.ts$/],
                loaders: [
                    //'awesome-typescript-loader',
                    //'angular2-template-loader',
                    '@angular',
                    'rxjs',
                    '@ng-bootstrap',
                    'angular-ui-router',
                    'ui-router-ng2',
                    'ui-router-ng1-to-ng2',
                    'ui-router-visualizer',
                    'jquery',
                    'ng2-webstorage',
                    'ng2-translate'
                ]
            }
        ]
    }
 };
