const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new InjectManifest({
      swSrc: path.resolve(__dirname, 'src/sw.js'),
      swDest: 'sw.bundle.js',
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    open: true,
    port: 8080,
    client: {
      overlay: true,
    },
    hot: true,
  },
});