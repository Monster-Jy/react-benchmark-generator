const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin'); // js压缩
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // css压缩
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css分离
const CompressionPlugin = require('compression-webpack-plugin'); // gzip压缩
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin') // webpack5 推荐使用css-minimizer-webpack-plugin
const { merge } = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const common = require('./webpack.common');
const {
  // PORT,
  // NAME_SPACE,
  // REMOTE_PUBLIC,
  resolveApp,
  addHtmlWebpackPlugin,
  addModuleFederationPlugin,
} = require('./utils');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
const getWebpackProdConfig = (options) => {
  const {
    port,
    namespace,
    remotePublic,
    remotes,
    cache,
    module,
    addWebpackPlugin,
    microFrontEndConfig,
    config: customConfig,
  } = options;

  let otherPlugins = [];
  if (addWebpackPlugin && typeof addWebpackPlugin === 'function') {
    otherPlugins = addWebpackPlugin('development') || [];
  }

  if (addWebpackPlugin && Array.isArray(addWebpackPlugin)) {
    otherPlugins = addWebpackPlugin;
  }

  let config = {
    mode: 'production',
    entry: './src/index',
    output: {
      path: __dirname + '/../build',
      // [contenthash:8] - 本应用打包输出文件级别的更新，导致输出文件名变化
      // publicPath: `/${NAME_SPACE}/`,
      filename: 'js/[name]-[contenthash:8].js',
      chunkFilename: 'js/[name].[contenthash:8].js',
      // 资源
      assetModuleFilename: 'assets/[name].[contenthash:8].[ext]',
      // 编译前清除目录
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            // 当解析antd.less，必须写成下面格式，否则会报Inline JavaScript is not enabled错误
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
      ],
      ...(module || {}),
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          // 多核处理能力，为true时值为 os.cpus().length - 1
          // 开启多进程并发运行
          parallel: true,
          extractComments: false,
        }),
        new CssMinimizerPlugin({
          parallel: true,
        }),
      ],
      runtimeChunk: { //
        name: 'runtime',
      },
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
    plugins: [
      ...otherPlugins,
      addHtmlWebpackPlugin({
        env: 'production',
        namespace,
        remotes,
        remotePublic,
        microFrontEndConfig,
      }),
      addModuleFederationPlugin({ env: 'production', namespace, remotes, remotePublic }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      }),
      new MiniCssExtractPlugin({
        filename: 'css/style.[contenthash:8].css',
      }),
      new CompressionPlugin(),
      new BundleAnalyzerPlugin(), // 打包分析
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
    ],
  };
  if (customConfig) {
    config = {
      ...config,
      ...customConfig,
    };
  }
  return merge(common, smp.wrap(config));
};

module.exports = getWebpackProdConfig;
