const path = require('path')

module.exports = [
  {
    name: 'node',
    entry: './index.js',
    target: 'node',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.js',
      libraryTarget: 'commonjs2'
    },
    node: {
      __dirname: false
    }
  },
  {
    name: 'web',
    entry: './index.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'web.js',
      library: 'teddy',
      libraryTarget: 'window'
    },
    node: {
      fs: 'empty'
    }
  }
]
