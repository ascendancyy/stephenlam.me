const project = require('./project.js');

const settings = project.dev;

const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./webpack.base.js');

const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(base, {
  devServer: {
    port: settings.port,
    host: settings.host,
    disableHostCheck: true,
    https: true,

    compress: true,

    noInfo: true,
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: settings.outputFilename,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
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
        collapseInlineTagWhitespace: true,
      },
    }),
  ],
});
