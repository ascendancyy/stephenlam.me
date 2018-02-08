const webpack = require('webpack');
const path = require('path');
const xml2js = require('xml2js');
const bourbon = require('bourbon');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const SpritePlugin = require('svg-sprite-loader/plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const PRODUCTION = process.env.NODE_ENV === 'production';
const VERSION = require('../package.json').version.toString();

const projectConfig = require('./project.js');

const settings = PRODUCTION ?
  projectConfig.prod :
  projectConfig.dev;

const ExternalCSS = new ExtractTextPlugin({
  filename: settings.cssFilename,
  allChunks: true,
  disable: !PRODUCTION,
});

const CSSLoader = [
  {
    loader: 'css-loader',
    options: {
      sourceMap: true,
      importLoaders: 1,
    },
  }, {
    loader: 'postcss-loader',
    options: {
      sourceMap: true,
      config: {
        path: './postcss.config.js',
      },
    },
  },
];

const SCSSLoader = [
  ...CSSLoader,
  {
    loader: 'sass-loader',
    options: {
      includePaths: [bourbon.includePaths],
      sourceMap: true,
      indentedSyntax: false,
      outputStyle: settings.scssOutputStyle,
    },
  },
];

const base = {
  devtool: settings.devtool,
  entry: {
    main: [
      './src/js/promise.js',
      './src/js/main.js',
    ],
  },
  output: {
    filename: settings.outputFilename,
    chunkFilename: settings.chunkOutputFilename,
    path: path.join(__dirname, '../dist'),
    publicPath: projectConfig.publicPath,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, '../src'),
      public: path.resolve(__dirname, '../public'),

      scss: path.resolve(__dirname, '../src/scss'),
      waves: path.resolve(__dirname, '../src/scss/waves'),
    },
    extensions: ['*', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExternalCSS.extract({
          use: SCSSLoader,
          fallback: 'style-loader',
        }),
      }, {
        test: /\.css$/,
        use: ExternalCSS.extract({
          use: CSSLoader,
          fallback: 'style-loader',
        }),
      }, {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      }, {
        test: /\.svg$/,
        use: [{
          loader: 'svg-sprite-loader',
          options: {
            extract: true,
            spriteFilename: 'icons.svg?[hash:8]',
          },
        }, {
          loader: 'svgo-loader',
          options: {
            plugins: [
              { removeTitle: true },
              { convertPathData: true },
              { convertTransform: true },
              { removeUselessStrokeAndFill: true },
            ],
          },
        }],
      }, {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: '[name].[ext]?[hash]' },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        VERSION: JSON.stringify(VERSION),
      },
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: settings.outputFilename,
      minChunks(module) {
        // This prevents stylesheet resources with the .css or .scss extension
        // from being moved from their original chunk to the vendor chunk
        if (module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
          return false;
        }
        return /node_modules/.test(module.context);
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({ name: 'manifest' }),

    new webpack.NamedModulesPlugin(),
    new webpack.NamedChunksPlugin(),

    new HTMLWebpackPlugin({
      filename: 'index.html',
      template: './src/index.ejs',
      title: projectConfig.title,
      description: projectConfig.description,
      chunksSortMode: 'dependency',
      inject: true,
      minify: PRODUCTION ? {
        removeComments: true,
        collapseWhitespace: true,
        sortAttributes: true,
        sortClassName: true,
      } : false,
    }),

    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../public/favicons/'),
        to: `[name].[ext]?v=${VERSION}`,
        transform(content, contentPath) {
          if (contentPath.indexOf('manifest.json') !== -1) {
            const manifest = JSON.parse(content.toString());
            manifest.icons.forEach((icon) => {
              // eslint-disable-next-line no-param-reassign
              icon.src = projectConfig.publicPath + icon.src + VERSION;
            });

            // eslint-disable-next-line new-cap
            return new Buffer.from(JSON.stringify(manifest));
          } else if (contentPath.indexOf('browserconfig.xml') !== -1) {
            let xml;
            const options = { explicitArray: false };
            xml2js.parseString(content.toString(), options, (err, result) => {
              const config70 = result.browserconfig.msapplication.tile
                .square70x70logo.$;
              config70.src = projectConfig.publicPath + config70.src + VERSION;

              const config150 = result.browserconfig.msapplication.tile
                .square150x150logo.$;
              config150.src = projectConfig.publicPath + config150.src + VERSION;

              const builder = new xml2js.Builder();
              // eslint-disable-next-line new-cap
              xml = new Buffer.from(builder.buildObject(result));
            });

            return xml;
          }

          return content;
        },
      },
    ]),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../public/check.js'),
        to: 'check.js',
      }, {
        from: path.resolve(__dirname, '../public/fonts.js'),
        to: 'fonts.js',
      }, {
        from: path.resolve(__dirname, '../public/fonts.css'),
        to: 'fonts.css',
      }, {
        from: path.resolve(__dirname, '../public/webfonts'),
        to: '[name].[ext]',
      },
    ]),

    ExternalCSS,

    new SpritePlugin({ plainSprite: true }),

    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};

module.exports = base;
