var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack-dev-server.config');

// load webpack-dev-server configuration
new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    // proxy requests to backend directly
    proxy: {
        "*": "http://localhost:8080"
    }
}).listen(3000, 'localhost', function (err, result) {
    if (err) {
        console.log(err);
    }

    console.log('Listening at localhost:3000');
});
