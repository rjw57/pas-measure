var path = require('path');
var webpack = require('webpack');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var isProduction = false;

var plugins = [
  new ExtractTextPlugin('[name].css'),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'openlayers', filename: 'ol.js',
  }),
  new webpack.optimize.DedupePlugin(),
  new HtmlWebpackPlugin({
    title: 'PAS Image Measurement',
  }),
];

if(isProduction) {
  plugins = plugins.concat([
    new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }),
    new webpack.optimize.UglifyJsPlugin({
      exclude: /ol\.js$/,
      compress: { unused: true, dead_code: true, warnings: false },
    }),
  ]);
}

// We split openlayers into its own chunk because ol.js is distributed as a
// minified Javascript source which tends to cause problems with UglifyJS, etc,
// etc.

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: {
    app: './entry.jsx',
    openlayers: ['openlayers'],
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    noParse: [ /openlayers[\\\/].*[\\\/]ol.js/ ],
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: { presets: ['react', 'es2015'], },
      },
      {test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      // For Bootstrap
      {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'},
    ]
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },
  devtool: 'source-map',
  plugins: plugins,
}
