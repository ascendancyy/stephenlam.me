const VERSION = require('../package.json').version.toString();

const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./webpack.base.js');

const OfflinePlugin = require('offline-plugin');

module.exports = merge(base, {
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      sourceMap: true,

      compress: {
        warnings: true,
        dead_code: true,
      },
      mangle: {
        keep_fnames: false,
        except: ['exports', 'require'],
      },
    }),
    new OfflinePlugin({
      version: VERSION,
      autoUpdate: 86400000,

      AppCache: false,
      ServiceWorker: {
        output: 'jet-alone.js',
        events: true,
      },
      caches: {
        main: ['index.html', 'main.*.js', 'manifest.*.js', 'main.*.css'],
        additional: [':rest:', 'ga.*.js'],
        optional: [':externals:', 'background.svg?*'],
      },
      excludes: ['**/.*', '**/*.map', 'internal.css', 'devdeps.*.js'],
      safeToUseOptionalCaches: true,
    }),
  ],
});
