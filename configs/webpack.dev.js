/* eslint-disable object-curly-newline */

const project = require('./project.js'),
      settings = project.dev;

const webpack = require('webpack'),
      HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devServer: {
    port: settings.port,
    host: settings.host,
    disableHostCheck: true,
    https: true,

    compress: true,

    noInfo: true
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: settings.outputFilename
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
    new HTMLWebpackPlugin({
      filename: 'index.html',
      template: './src/index.ejs',
      title: project.title,
      description: project.description,
      chunksSortMode: 'dependency',
      inject: true,
      minify: {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true
      }
    })
  ]
};
