var path = require('path');

module.exports = {
  context: path.join(__dirname, 'app'),
  entry: './entry.jsx',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },
  externals: {
    'jquery': 'jQuery',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: { presets: ['react', 'es2015'], },
      },
    ]
  },
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },
  devtool: 'source-map',
}
