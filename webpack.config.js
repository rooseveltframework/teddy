const path = require('path')

module.exports = {
  name: 'main',
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'teddy.js',
    library: 'teddy',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  externals: {
    fs: 'commonjs fs',
    path: 'commonjs path'
  },
  mode: 'development',
  node: {
    __dirname: false
  }
}
