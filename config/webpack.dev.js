const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { merge } = require('webpack-merge');
const { resolveApp, addHtmlWebpackPlugin, addModuleFederationPlugin } = require('./utils');
const common = require('./webpack.common');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const getWebpackDevConfig = (options) => {
  const {
    port,
    namespace,
    remotePublic,
    remotes,
    cache,
    devServer,
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
    target: 'web',
    mode: 'development',
    entry: './src/index', // 入口文件
    // 开发工具，开启 source map，编译调试
    devtool: 'eval-cheap-module-source-map',
    cache: {
      type: 'filesystem', // 启用持久化缓存
      cacheDirectory: resolveApp('.cache'), // 缓存文件存放的位置
      name: 'development-cache',
      buildDependencies: {
        // 缓存失效的配置
        config: [__filename],
      },
      ...(cache || {}),
    },
    devServer: {
      host: 'localhost',
      port, // 启动的端口
      // publicPath: '/',
      open: true, // 自动打开页面
      hot: true, // 默认为true
      compress: true, // 是否开启代码压缩
      // watchContentBase: true,
      historyApiFallback: true,
      allowedHosts: 'all',
      // contentBase: path.join(__dirname, '../public'),
      static: {
        // 托管的静态资源文件, 可通过数组的方式托管多个静态资源文件
        directory: resolveApp('public'),
        // directory: path.join(__dirname, '../public'),
      },
      // watchOptions: {
      //   ignored: /node_modules/,
      // },
      client: {
        progress: true, // 在浏览器端打印编译进度
        overlay: {
          // 只显示错误信息
          errors: true,
          warnings: false,
        },
        logging: 'warn', // 控制台只显示warn以上信息
      },
      proxy: {
        
      },
      ...(devServer || {}),
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
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
    plugins: [
      new webpack.HotModuleReplacementPlugin(), // HRM: 模块热替换
      new ReactRefreshWebpackPlugin(), // React热更新
      new BundleAnalyzerPlugin(),
      ...otherPlugins,
      addHtmlWebpackPlugin({
        env: 'development',
        namespace,
        remotes,
        remotePublic,
        microFrontEndConfig,
      }),
      addModuleFederationPlugin({ env: 'development', namespace, remotes, remotePublic }),
    ],
    // optimization: {
    //   runtimeChunk: {
    //     name: 'runtime',
    //   },
    //   splitChunks: {
    //     chunks: 'all',
    //     minSize: 20000,
    //     minRemainingSize: 0,
    //     minChunks: 1,
    //     maxAsyncRequests: 30,
    //     maxInitialRequests: 30,
    //     enforceSizeThreshold: 50000,
    //     cacheGroups: {
    //       defaultVendors: {
    //         test: /[\\/]node_modules[\\/]/,
    //         priority: -10,
    //         reuseExistingChunk: true,
    //       },
    //       default: {
    //         minChunks: 2,
    //         priority: -20,
    //         reuseExistingChunk: true,
    //       },
    //     },
    //   },
    // },
  };
  if (customConfig) {
    config = {
      ...config,
      ...customConfig,
    };
  }
  return merge(common, config);
};

module.exports = getWebpackDevConfig;
