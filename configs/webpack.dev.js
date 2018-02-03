const settings = require('./project.js').dev;

const merge = require('webpack-merge');
const base = require('./webpack.base.js');

module.exports = merge(base, {
  devServer: {
    port: settings.port,
    host: settings.host,
    disableHostCheck: true,
    https: true,

    compress: true,

    noInfo: true,
  },
});
