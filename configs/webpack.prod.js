const VERSION = require('../package.json').version.toString();

const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./webpack.base.js');

const OfflinePlugin = require('offline-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(base, {
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new UglifyJsPlugin({
      sourceMap: true,

      cache: true,
      parallel: true,

      uglifyOptions: {
        ecma: 8,
        ie8: true,
        safari10: true,

        toplevel: true,
        compress: {
          warnings: false,

          dead_code: true,
          pure_funcs: [
            'console.log',
            'console.group',
            'console.groupCollapsed',
            'console.groupEnd',
          ],
        },
        mangle: {
          keep_fnames: false,
          reserved: ['exports', 'require'],
        },
        output: {
          comments: false,
        },
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
