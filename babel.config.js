module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { esmodules: true } }]
  ],
  ignore: [
    './tmp',
    './node_modules',
    './babel.config.js',
    './config',
    './script',
    './db'
  ],
  minified: true,
  comments: false
}
