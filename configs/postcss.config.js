const pixrem = require('pixrem');
const calc = require('postcss-calc');
const flexbugs = require('postcss-flexbugs-fixes');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    pixrem(),
    calc({ precision: 3 }),
    flexbugs(),
    autoprefixer(),
  ],
};
