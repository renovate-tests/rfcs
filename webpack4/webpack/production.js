// external
const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

// internal
const paths = require('./config/paths');
const env = require('./config/env');

// initialize
const cssFilename = 'static/css/[name].[contenthash:8].css';
const shouldUseRelativeAssetPaths = paths.servedPath === './';

const extractTextPluginOptions =
  // CSSのディレクトリ構造を維持するための設定
  shouldUseRelativeAssetPaths
    ? {publicPath: Array(cssFilename.split('/').length).join('../')}
    : {};

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
    paths.overrideSemanticCss,
    paths.appIndexCss,
    paths.appIndexJs,
  ],
  output: {
    pathinfo: true,
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    publicPath: paths.servedPath,
    devtoolModuleFilenameTemplate: info =>
      path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, '/'),
  },
  optimization: {
    minimizer: [
      new webpack.optimize.UglifyJsPlugin({
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
    modules: ['node_modules', paths.appNodeModules].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
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
            test: /\.css$/,
            exclude: /\.module\.css$/,
            loader: ExtractTextPlugin.extract({
              ...{
                fallback: {
                  loader: require.resolve('style-loader'),
                  options: {
                    hmr: false,
                  },
                  use: [
                    require.resolve('style-loader'),
                    {
                      loader: require.resolve('css-loader'),
                      options: {
                        importLoaders: 4,
                      },
                    },
                    require.resolve('raw-loader'),
                    require.resolve('resolve-url-loader'),
                    {
                      loader: require.resolve('sass-loader'),
                      options: {
                        sourceMap: true,
                      },
                    },
                    {
                      loader: require.resolve('postcss-loader'),
                      options: postCSSLoaderOptions,
                    },
                  ],
                },
              },
              ...extractTextPluginOptions,
            }),
          },
          {
            // CSS Modulesを対象にしたloader preprocesses
            test: /\.module\.css$/,
            loader: ExtractTextPlugin.extract({
              ...{
                fallback: {
                  loader: require.resolve('style-loader'),
                  options: {
                    hmr: false,
                  },
                },
                use: [
                  require.resolve('style-loader'),
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
              extractTextPluginOptions,
            }),
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
    new InterpolateHtmlPlugin(env.raw),
    // 環境変数をjsで参照できるようにする。(e.g.: process.env.NODE_ENV)
    new webpack.DefinePlugin(env.stringified),
    new ExtractTextPlugin({
      filename: cssFilename,
      allChunks: true,
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
