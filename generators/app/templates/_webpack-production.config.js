var webpack = require('webpack');
var path = require('path');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var dest = path.resolve(__dirname, 'src/main/webapp/content/js');

var config = {
  entry: [path.join(__dirname, '/src/main/webapp/app/app.jsx')],
  resolve: {
    //When require, do not have to add these extensions to file's name
    extensions: ["", ".js", ".jsx"]
  },
  //Render source-map file for final build
  devtool: 'source-map',
  //output config
  output: {
    path: dest,    //Path of output file
    filename: 'app.js'  //Name of output file
  },
  plugins: [
    //Minify the bundle
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        //supresses warnings, usually from module minification
        warnings: false
      }
    }),
    //Allows error warnings but does not stop compiling. Will remove when eslint is added
    new webpack.NoErrorsPlugin()
  ],
  module: {
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'eslint-loader',
        include: [path.resolve(__dirname, "src/main/webapp/app")],
        exclude: [nodeModulesPath]
      }
    ],
    loaders: [
      {
        test: /\.(js|jsx)$/, //All .js and .jsx files
        loaders: ['babel'], //react-hot is like browser sync and babel loads jsx and es6-7
        exclude: [nodeModulesPath]
      }
    ]
  },
  //Eslint config
  eslint: {
    configFile: '.eslintrc' //Rules for eslint
  }
};

module.exports = config;
