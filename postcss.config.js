const postcssNormalize = require('postcss-normalize');

module.exports = {
  plugins: [
    [
      "postcss-preset-env",
      {
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 3,
        browsers: ["last 1 version", "> 1%", "IE 11"]
      }
    ],
    postcssNormalize(),
    // require('autoprefixer')({
    //   overrideBrowserslist: ['last 2 version', '>1%', 'ios 7'],
    // }),
    require('cssnano')({
      preset: 'default',
    }),
  ],
}