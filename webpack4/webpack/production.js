// external
const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// internal
const paths = require('./config/paths');
const env = require('./config/env');

// initialize
const postCSSLoaderOptions = {
  // 外部CSS読み込みに対応した設定
  ident: 'postcss',
  plugins: () => [
    require('postcss-flexbugs-fixes'),
    autoprefixer({
      browsers: ['> 1% in JP'],
      flexbox: 'no-2009',
      grid: true,
    }),
  ],
};

module.exports = {
  mode: 'production',
  // errorを許容しない。
  bail: true,
  devtool: false,
  entry: [
    '@babel/polyfill',
    'whatwg-fetch',
    // paths.overrideSemanticCss,
    paths.appIndexCss,
    paths.appIndexJs,
  ],
  output: {
    path: paths.appBuild,
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    publicPath: paths.servedPath,
    devtoolModuleFilenameTemplate: info => path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          ecma: 8,
          compress: {
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
          },
          mangle: {
            safari10: true,
          },
          output: {
            comments: false,
            // 絵文字はminifyしない。
            ascii_only: true,
          },
        },
        parallel: true,
        cache: true,
        sourceMap: false,
      }),
    ],
    // Automatically split vendor and commons
    splitChunks: {
      chunks: 'all',
    },
    // Keep the runtime chunk seperated to enable long term caching
    runtimeChunk: true,
  },
  resolve: {
    // Webpackがmoduleを探しに行く時のfallback処理
    modules: ['node_modules', paths.appNodeModules].concat(process.env.NODE_PATH.split(path.delimiter).filter(Boolean)),
    extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        oneOf: [
          {
            // fileを解決するためのloader
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          {
            // src以下を対象にしたbabel
            test: /\.(js|jsx|mjs)$/,
            type: 'javascript/auto',
            include: paths.srcPaths,
            exclude: [/[/\\\\]node_modules[/\\\\]/],
            use: [
              // compileのチューニングloader
              require.resolve('thread-loader'),
              {
                loader: require.resolve('babel-loader'),
                options: {
                  plugins: [
                    [
                      // https://github.com/FWeinb/babel-plugin-named-asset-import
                      require.resolve('babel-plugin-named-asset-import'),
                      {
                        loaderMap: {
                          svg: {
                            ReactComponent: 'svgr/webpack![path]',
                          },
                        },
                      },
                    ],
                  ],
                  compact: true,
                  highlightCode: true,
                },
              },
            ],
          },
          {
            // 外部jsファイルを対象にしたbabel
            test: /\.js$/,
            type: 'javascript/auto',
            use: [
              // compileのチューニングloader
              require.resolve('thread-loader'),
              {
                loader: require.resolve('babel-loader'),
                options: {
                  compact: true,
                  highlightCode: true,
                },
              },
            ],
          },
          {
            // CSS Modulesを除くloader preprocesses
            test: [/\.css$/, /\.scss$/],
            exclude: /\.module\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 3,
                },
              },
              {
                loader: require.resolve('resolve-url-loader'),
              },
              {
                loader: require.resolve('sass-loader'),
                options: {
                  sourceMap: true,
                  precision: 8,
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: postCSSLoaderOptions,
              },
            ],
          },
          {
            // CSS Modulesを対象にしたloader preprocesses
            test: /\.module\.css$/,
            use: [
              MiniCssExtractPlugin.loader,
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 2,
                },
              },
              {
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                  modules: true,
                  localIdentName: '[path]__[name]___[local]',
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: postCSSLoaderOptions,
              },
            ],
          },
          {
            // GraphQLを対象にしたloader preprocesses
            test: /\.(graphql)$/,
            loader: 'graphql-tag/loader',
          },
          {
            // HTMLを対象にしたloader preprocesses
            test: /\.html/,
            loader: require.resolve('html-loader'),
          },
          {
            // 何もマッチしなかったときのfallback loader preprocesses
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
          // ** STOP ** Are you adding a new loader?
          // Make sure to add the new loader(s) before the "file" loader.
        ],
      },
    ],
  },
  plugins: [
    // <script> injection
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    // 環境変数をHTML内で使えるようにする。(e.g.: %PUBLIC_URL%)
    // new InterpolateHtmlPlugin(env.raw),
    // 環境変数をjsで参照できるようにする。(e.g.: process.env.NODE_ENV)
    new webpack.DefinePlugin(env.stringified),
    // new ExtractTextPlugin({
    //   filename: cssFilename,
    //   allChunks: true,
    // }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].css',
      chunkFilename: 'static/css/[name].[id].css',
    }),
    // moment.jsはpreprocessesしない。
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  node: {
    // nodeのmodulesはbundleしない。
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
};
