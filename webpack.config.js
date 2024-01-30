const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = [
  {
    name: 'main',
    entry: './teddy.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.js',
      library: {
        name: 'teddy',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this'
    },
    externals: {
      fs: 'fs',
      path: 'path'
    },
    mode: 'development',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              defaults: false,
              unused: true
            },
            mangle: false,
            format: {
              comments: 'all'
            }
          }
        })
      ]
    }
  },
  {
    name: 'main',
    entry: './teddy.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.min.js',
      library: {
        name: 'teddy',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this'
    },
    externals: {
      fs: 'fs',
      path: 'path'
    },
    mode: 'production',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            compress: {
              defaults: true,
              unused: true
            },
            mangle: true,
            format: {
              comments: false
            }
          }
        })
      ]
    }
  }
]
