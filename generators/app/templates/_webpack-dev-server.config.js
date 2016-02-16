var webpack = require('webpack');
var path = require('path');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var dest = path.resolve(__dirname, 'src/main/webapp/content/js');

var config = {
  //Entry points to the project
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    path.join(__dirname, '/src/main/webapp/app/app.jsx')
  ],
  //Config options on how to interpret requires imports
  resolve: {
    extensions: ["", ".js", ".jsx"]
    //node_modules: ["web_modules", "node_modules"]  (Default Settings)
  },
  //Server Configuration options
  devServer:{
    contentBase: '.src/main/webapp/app/app',  //Relative directory for base of server
    devtool: 'eval',
    hot: true,        //Live-reload
    inline: true
  },
  devtool: 'eval',
  output: {
    path: dest,    //Path of output file
    filename: 'app.js',
    publicPath: '/content/js'
  },
  plugins: [
    //Enables Hot Modules Replacement
    new webpack.HotModuleReplacementPlugin(),
    //Allows error warnings but does not stop compiling. Will remove when eslint is added
    new webpack.NoErrorsPlugin()
  ],
  module: {
    //Loaders to interpret non-vanilla javascript code as well as most other extensions including images and text.
    preLoaders: [
      {
        //Eslint loader
        test: /\.(js|jsx)$/,
        loader: 'eslint-loader',
        include: [path.resolve(__dirname, "src/main/webapp/app")],
        exclude: [nodeModulesPath]
      }
    ],
    loaders: [
      {
        //React-hot loader and
        test: /\.(js|jsx)$/,  //All .js and .jsx files
        loaders: ['react-hot', 'babel'], //react-hot is like browser sync and babel loads jsx and es6-7
        exclude: [nodeModulesPath]
      }
    ]
  },
  //eslint config options. Part of the eslint-loader package
  eslint: {
    configFile: '.eslintrc'
  }
};

module.exports = config;
