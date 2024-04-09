import { fileURLToPath } from 'url'
import path from 'path'
import TerserPlugin from 'terser-webpack-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [
  // import
  {
    name: 'main',
    entry: './teddy.js',
    resolve: {
      fallback: {
        fs: false,
        path: false
      }
    },
    devtool: 'source-map',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.js',
      library: {
        type: 'module'
      }
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
    },
    experiments: {
      outputModule: true
    }
  },
  // require
  {
    name: 'main',
    entry: './teddy.js',
    devtool: 'source-map',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.cjs',
      library: {
        name: 'teddy',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this',
      umdNamedDefine: true
    },
    target: 'node',
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
  // import -- production
  {
    name: 'main',
    entry: './teddy.js',
    resolve: {
      fallback: {
        fs: false,
        path: false
      }
    },
    devtool: false,
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.min.js',
      library: {
        type: 'module'
      }
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
    },
    experiments: {
      outputModule: true
    }
  },
  // require -- production
  {
    name: 'main',
    entry: './teddy.js',
    resolve: {
      fallback: {
        fs: false
      }
    },
    devtool: false,
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.min.cjs',
      library: {
        name: 'teddy',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this',
      umdNamedDefine: true
    },
    target: 'node',
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
