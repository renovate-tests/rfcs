// external
const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
  mode: 'development',
  devtool: 'cheap-source-map',
  entry: [
    '@babel/polyfill',
    'whatwg-fetch',
    'react-hot-loader/patch',
    require.resolve('react-dev-utils/webpackHotDevClient'),
    paths.overrideSemanticCss,
    paths.appIndexCss,
    paths.appIndexJs,
  ],
  devServer: {
    stats: 'errors-only',
    // Enable gzip compression of generated files.
    compress: true,
    // Silence WebpackDevServer's own logs since they're generally not useful.
    // It will still show compile warnings and errors with this setting.
    clientLogLevel: 'none',
    // By default WebpackDevServer serves physical files from current directory
    // in addition to all the virtual build products that it serves from memory.
    // This is confusing because those files won’t automatically be available in
    // production build folder unless we copy them. However, copying the whole
    // project directory is dangerous because we may expose sensitive files.
    // Instead, we establish a convention that only files in `public` directory
    // get served. Our build script will copy `public` into the `build` folder.
    // In `index.html`, you can get URL of `public` folder with %PUBLIC_URL%:
    // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
    // In JavaScript code, you can access it with `process.env.PUBLIC_URL`.
    // Note that we only recommend to use `public` folder as an escape hatch
    // for files like `favicon.ico`, `manifest.json`, and libraries that are
    // for some reason broken when imported through Webpack. If you just want to
    // use an image, put it in `src` and `import` it from JavaScript instead.
    contentBase: paths.appPublic,
    // By default files from `contentBase` will not trigger a page reload.
    // But react-hot-loader
    watchContentBase: true,
    // Enable hot reloading server. It will provide /sockjs-node/ endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the Webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: '/',
    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.plugin` calls above.
    quiet: false,
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebookincubator/create-react-app/issues/293
    // src/node_modules is not ignored to support absolute imports
    // https://github.com/facebookincubator/create-react-app/issues/1065
    watchOptions: {
      ignored: ignoredFiles(paths.appSrc),
    },
    // Enable HTTPS if the HTTPS environment variable is set to 'true'
    https: protocol === 'https',
    host: host,
    overlay: false,
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebookincubator/create-react-app/issues/387.
      disableDotRule: true,
    },
  },
  output: {
    pathinfo: true,
    filename: 'static/js/bundle.js',
    chunkFilename: 'static/js/[name].chunk.js',
    publicPath: '/',
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  optimization: {
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
        // ECMAScripts標準ではない機能をOFF
        parser: {requireEnsure: false},
      },
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
                  cacheDirectory: true,
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
                  compact: false,
                  cacheDirectory: true,
                  highlightCode: true,
                },
              },
            ],
          },
          {
            // CSS Modulesを除くloader preprocesses
            test: /\.css$/,
            exclude: /\.module\.css$/,
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
          {
            // CSS Modulesを対象にしたloader preprocesses
            test: /\.module\.css$/,
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
    }),
    // 環境変数をHTML内で使えるようにする。(e.g.: %PUBLIC_URL%)
    new InterpolateHtmlPlugin(env.raw),
    // Add module names to factory functions so they appear in browser profiler.
    new webpack.NamedModulesPlugin(),
    // 環境変数をjsで参照できるようにする。(e.g.: process.env.NODE_ENV)
    new webpack.DefinePlugin(env.stringified),
    // CSSのHMR有効化。
    new webpack.HotModuleReplacementPlugin(),
    // bundle時に大文字小文字を区別する。
    new CaseSensitivePathsPlugin(),
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
  performance: {
    // bundleの最適化警告をOFFにする。
    hints: false,
  },
};
