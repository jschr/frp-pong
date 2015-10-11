var path = require('path');
var webpack = require('webpack');

var loaders = ['babel'];

var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
];

if (process.env.NODE_ENV === 'development') {
  plugins = plugins.concat([
    new webpack.HotModuleReplacementPlugin()
  ]);
} else {
  plugins = plugins.concat([
    new webpack.optimize.OccurenceOrderPlugin()
  ]);
}

module.exports = {
  devtool: 'source-map',
  entry: {
    app: './src/main.js',
  },
  output: {
    filename: './dist/app.js',
    publicPath: '/',
    path: __dirname
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /build|lib|node_modules/,
      loaders: loaders
    }],
    preLoaders: [
      {test: /\.js$/, loader: 'eslint', exclude: /build|lib|node_modules/},
    ],
  },
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react')
    }
  },
  plugins: plugins,
  eslint: {configFile: '.eslintrc'},
};
