module.exports = {
  title: 'Stephen Lam',
  description: 'The portfolio of Stephen Lam - designer/programmer from Palmdale, California.',

  publicPath: '/',

  prod: {
    devtool: '#source-map',

    outputFilename: '[name].[chunkhash:14].js',
    chunkOutputFilename: '[id].[name].[chunkhash:14].js',

    cssFilename: '[name].[contenthash:14].css',
    scssOutputStyle: 'compressed',

    ga: 'UA-88937605-1'
  },
  dev: {
    devtool: '#eval-source-map',

    outputFilename: '[name].js',
    chunkOutputFilename: '[id].[name].js',

    cssFilename: '[name].css',
    scssOutputStyle: 'expanded',

    port: 8080,
    host: '0.0.0.0'
  }
}
