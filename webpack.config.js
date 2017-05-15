const webpack = require('webpack')
const path = require('path')
const fs = require('fs')

const xml2js = require('xml2js')

const DEVELOPMENT = process.env.NODE_ENV === 'development'
const PRODUCTION = process.env.NODE_ENV === 'production'

const project = require('./project.js')
const VERSION = require('./package.json').version.toString()

const settings = DEVELOPMENT
  ? project.dev
  : project.prod

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const ExtractText = new ExtractTextPlugin({
  filename: settings.cssFilename,
  allChunks: true,
  disable: DEVELOPMENT
})

const cssLoader = [
  {
    loader: 'css-loader',
    options: {
      sourceMap: true,
      importLoaders: 1
    }
  },
  'postcss-loader?config=./postcss.config.js'
]
const scssLoader = cssLoader.concat([{
  loader: 'sass-loader',
  options: {
    includePaths: [require('bourbon').includePaths],
    sourceMap: true,
    indentedSyntax: false,
    outputStyle: settings.scssOutputStyle
  }
}])

let plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      VERSION: JSON.stringify(VERSION)
    }
  }),
  new CopyWebpackPlugin([
    {
      from: path.resolve(__dirname, './src/favicons/'),
      transform: function (content, contentPath) {
        if (contentPath.indexOf('manifest.json') !== -1) {
          const manifest = JSON.parse(content.toString())
          for (const icon of manifest.icons) {
            icon.src = project.publicPath + icon.src + VERSION
          }
          return new Buffer.from(JSON.stringify(manifest))
        } else if (contentPath.indexOf('browserconfig.xml') !== -1) {
          let xml
          xml2js.parseString(content.toString(), { explicitArray: false }, function (err, result) {
            const config70 = result.browserconfig.msapplication.tile.square70x70logo.$
            config70.src = project.publicPath + config70.src + VERSION

            const config150 = result.browserconfig.msapplication.tile.square150x150logo.$
            config150.src = project.publicPath + config150.src + VERSION

            const builder = new xml2js.Builder()
            xml = new Buffer.from(builder.buildObject(result))
          })
          return xml
        } else {
          return content
        }
      }
    }
  ], {
    copyUnmodified: true
  }),
  ExtractText
]

if (DEVELOPMENT) {
  plugins = plugins.concat([
    new HTMLWebpackPlugin({
      filename: 'index.html',
      template: './src/index.ejs',
      title: project.title,
      description: project.description,
      chunksSortMode: 'dependency',
      inject: true,
      minify: false
    })
  ])
} else {
  plugins = plugins.concat([
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
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
        sortAttributes: true,
        sortClassName: true
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      sourceMap: true,

      compress: {
        warnings: true,
        dead_code: true
      },
      mangle: {
          keep_fnames: false,
          except: ['exports', 'require']
      }
    })
  ])
}

module.exports = {
  devtool: project.devtool,
  entry: {
    main: './src/js/main.js'
  },
  output: {
    filename: settings.outputFilename,
    chunkFilename: settings.chunkOutputFilename,
    path: path.join(__dirname, './dist'),
    publicPath: project.publicPath
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      scss: path.resolve(__dirname, './src/scss')
    },
    extensions: ['*', '.js']
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractText.extract({
          use: scssLoader,
          fallback: 'style-loader'
        })
      },
      {
        test: /\.css$/,
        use: ExtractText.extract({
          use: cssLoader,
          fallback: 'style-loader'
        })
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]?[hash]'
            }
          }
        ]
      }
    ]
  },
  plugins: plugins,
  devServer: {
    https: true,
    port: settings.port,
    host: settings.host,
    disableHostCheck: true,

    compress: true,

    noInfo: true,
    quiet: true
  }
}
