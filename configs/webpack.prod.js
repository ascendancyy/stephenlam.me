/* eslint-disable object-curly-newline */

const project = require('./project.js'),
      settings = project.prod;

const webpack = require('webpack'),
      HTMLWebpackPlugin = require('html-webpack-plugin');

const base = {
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
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
        removeComments: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        sortAttributes: true,
        sortClassName: true
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      sourceMap: true,

      compress: {
        warnings: true,
        dead_code: true // eslint-disable-line camelcase
      },
      mangle: {
        keep_fnames: false, // eslint-disable-line camelcase
        except: ['exports', 'require']
      }
    })
  ]
};

module.exports = base;
