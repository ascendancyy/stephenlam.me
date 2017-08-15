/* eslint-disable object-curly-newline */

const project = require('./project.js'),
      settings = project.prod,
      VERSION = require('../package.json').version.toString();

const webpack = require('webpack'),
      HTMLWebpackPlugin = require('html-webpack-plugin'),
      OfflinePlugin = require('offline-plugin');

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
    }),
    new OfflinePlugin({
      version: VERSION,
      autoUpdate: 86400000,

      AppCache: false,
      ServiceWorker: {
        output: 'jet-alone.js',
        events: true
      },
      caches: {
        main: ['index.html', 'main.*.js', 'manifest.*.js', 'main.*.css'],
        additional: [':rest:', 'ga.*.js'],
        optional: [':externals:', 'background.svg?*']
      },
      excludes: ['**/.*', '**/*.map', 'internal.css', 'devdeps.*.js'],
      safeToUseOptionalCaches: true
    })
  ]
};

module.exports = base;
