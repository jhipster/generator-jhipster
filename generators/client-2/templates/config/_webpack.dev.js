const commonConfig = require('./webpack.common.js');
const webpackMerge = require('webpack-merge');
const ENV = 'dev';

module.exports = webpackMerge(commonConfig({env: ENV}), {
    module: {
        rules: [{
            test: /\.ts$/,
            loaders: [
                'tslint'
            ],
            exclude: ['node_modules/generator-jhipster']
        }]
    }
});
