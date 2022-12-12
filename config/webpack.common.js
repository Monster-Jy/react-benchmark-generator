const chalk = require('chalk');
const CopyPlugin = require('copy-webpack-plugin'); // 复制文件
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const { resolveApp } = require('./utils');


const common = {
  resolve: {
    alias: {
      '@': resolveApp('./src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    mainFiles: ['index.js', 'index.jsx', 'index.ts', 'index.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        include: resolveApp('./src'),
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|tsx)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: [/\.bmp$/, /\.svg$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 大于10kb将会启用file-loader将文件单独导出
          },
        },
        generator: {
          filename: 'images/[name][ext]',
        },
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]',
        },
      },
    ],
  },
  plugins: [
    new ProgressBarPlugin({
      // 进度条
      format: `  :msg [:bar] ${chalk.green.bold(':percent')} (:elapsed s)`,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: './public',
          to: '',
          globOptions: {
            ignore: ['**/index.html', '**/.DS_Store'],
          },
        },
      ],
    }),
  ],
};

module.exports = common;
