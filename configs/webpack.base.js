const DEVELOPMENT = process.env.NODE_ENV === 'development';
const VERSION = require('../package.json').version.toString();

const webpack = require('webpack');
const path = require('path');
const xml2js = require('xml2js');
const bourbon = require('bourbon');

const project = require('./project.js');

const settings = DEVELOPMENT ?
  project.dev :
  project.prod;

const StyleExtPlugin = require('style-ext-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const InternalCSS = new ExtractTextPlugin({
  filename: 'internal.css',
  allChunks: true,
  disable: DEVELOPMENT,
});

const ExternalCSS = new ExtractTextPlugin({
  filename: settings.cssFilename,
  allChunks: true,
  disable: DEVELOPMENT,
});

const cssLoader = [
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
const scssLoader = cssLoader.concat([{
  loader: 'sass-loader',
  options: {
    includePaths: [bourbon.includePaths],
    sourceMap: true,
    indentedSyntax: false,
    outputStyle: settings.scssOutputStyle,
  },
}]);

const base = {
  devtool: project.devtool,
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
    publicPath: project.publicPath,
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, '../src'),

      scss: path.resolve(__dirname, '../src/scss'),
      critical: path.resolve(__dirname, '../src/scss/critical'),
      waves: path.resolve(__dirname, '../src/scss/waves'),
      variables: path.resolve(__dirname, '../src/scss/variables'),
    },
    extensions: ['*', '.js'],
  },
  module: {
    rules: [
      {
        test: /normalize\.css$/,
        use: InternalCSS.extract({
          use: cssLoader,
          fallback: 'style-loader',
        }),
      }, {
        test: /critical\/[\w.-]+\.scss$/,
        use: InternalCSS.extract({
          use: scssLoader,
          fallback: 'style-loader',
        }),
      }, {
        test: /\.scss$/,
        use: ExternalCSS.extract({
          use: scssLoader,
          fallback: 'style-loader',
        }),
        exclude: path.resolve(__dirname, '../src/scss/critical'),
      }, {
        test: /\.css$/,
        use: ExternalCSS.extract({
          use: cssLoader,
          fallback: 'style-loader',
        }),
        exclude: /normalize/,
      }, {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      }, {
        test: /\.(png|jpg|gif|svg)$/,
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
    new webpack.NamedModulesPlugin(),
    new webpack.NamedChunksPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        VERSION: JSON.stringify(VERSION),
      },
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../src/favicons/'),
        to: `[name].[ext]?v=${VERSION}`,
        transform(content, contentPath) {
          if (contentPath.indexOf('manifest.json') !== -1) {
            const manifest = JSON.parse(content.toString());
            manifest.icons.forEach((icon) => {
              // eslint-disable-next-line no-param-reassign
              icon.src = project.publicPath + icon.src + VERSION;
            });

            // eslint-disable-next-line new-cap
            return new Buffer.from(JSON.stringify(manifest));
          } else if (contentPath.indexOf('browserconfig.xml') !== -1) {
            let xml;
            const options = { explicitArray: false };
            xml2js.parseString(content.toString(), options, (err, result) => {
              const config70 = result.browserconfig.msapplication.tile
                .square70x70logo.$;
              config70.src = project.publicPath + config70.src + VERSION;

              const config150 = result.browserconfig.msapplication.tile
                .square150x150logo.$;
              config150.src = project.publicPath + config150.src + VERSION;

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

    InternalCSS,
    ExternalCSS,
    new StyleExtPlugin({
      enabled: !DEVELOPMENT,
      filename: 'internal.css',
      minify: true,
    }),
  ],
};

module.exports = base;
