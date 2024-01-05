import path from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// const path = require('path')
// const TerserPlugin = require('terser-webpack-plugin')

export default [
  {
    name: 'main',
    entry: './teddy.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.js',
      library: 'teddy',
      libraryTarget: 'umd',
      libraryExport: 'default',
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
      library: 'teddy',
      libraryTarget: 'umd',
      libraryExport: 'default',
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
