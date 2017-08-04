module.exports = {
  plugins: [
    require('pixrem')(),
    require('postcss-calc')({
      precision: 3
    }),
    require('postcss-flexbugs-fixes')(),
    require('autoprefixer')()
  ]
}
