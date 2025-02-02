import { fileURLToPath } from 'url'
import path from 'path'
import TerserPlugin from 'terser-webpack-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [

  // #region server-side (cheerio-driven) versions of teddy

  // esm server-side (cheerio-driven)
  {
    name: 'main',
    entry: './teddy.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.mjs',
      library: {
        type: 'module'
      }
    },
    experiments: {
      outputModule: true
    },
    mode: 'development',
    devtool: 'source-map',
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
    resolve: {
      fallback: {
        fs: false,
        path: false
      }
    }
  },

  // commonjs server-side (cheerio-driven)
  {
    name: 'main',
    entry: './teddy.js',
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
    devtool: 'source-map',
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
    resolve: {
      fallback: {
        fs: false,
        path: false
      }
    }
  },

  // #endregion

  // #region client-side (not cheerio-driven) versions of teddy

  // esm client-side (not cheerio-driven)
  {
    name: 'main',
    entry: './teddy.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.client.mjs',
      library: {
        type: 'module'
      },
      globalObject: 'this',
      umdNamedDefine: true
    },
    experiments: {
      outputModule: true
    },
    mode: 'development',
    devtool: 'source-map',
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
    resolve: {
      fallback: {
        fs: false,
        path: false
      },
      alias: {
        'cheerio/slim': path.resolve(__dirname, 'cheerioPolyfill.js')
      }
    }
  },

  // commonjs client-side (not cheerio-driven)
  {
    name: 'main',
    entry: './teddy.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.client.cjs',
      library: {
        name: 'teddy',
        type: 'umd',
        export: 'default'
      },
      globalObject: 'this',
      umdNamedDefine: true
    },
    mode: 'development',
    devtool: 'source-map',
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
    resolve: {
      fallback: {
        fs: false,
        path: false
      },
      alias: {
        'cheerio/slim': path.resolve(__dirname, 'cheerioPolyfill.js')
      }
    }
  },

  // standalone (directly includable in a <script> tag) client-side (not cheerio-driven) minified
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
      globalObject: 'this',
      umdNamedDefine: true
    },
    mode: 'production',
    devtool: 'source-map',
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
    resolve: {
      fallback: {
        fs: false,
        path: false
      },
      alias: {
        'cheerio/slim': path.resolve(__dirname, 'cheerioPolyfill.js')
      }
    }
  },

  // #endregion

  // #region client-side (not cheerio-driven) minified versions of teddy

  // esm client-side (not cheerio-driven) minified
  {
    name: 'main',
    entry: './teddy.js',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'teddy.min.mjs',
      library: {
        type: 'module'
      }
    },
    experiments: {
      outputModule: true
    },
    mode: 'production',
    devtool: 'source-map',
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
    resolve: {
      fallback: {
        fs: false,
        path: false
      },
      alias: {
        'cheerio/slim': path.resolve(__dirname, 'cheerioPolyfill.js')
      }
    }
  },

  // standalone (directly includable in a <script> tag) client-side (not cheerio-driven) minified
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
      globalObject: 'this',
      umdNamedDefine: true
    },
    mode: 'production',
    devtool: 'source-map',
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
    resolve: {
      fallback: {
        fs: false,
        path: false
      },
      alias: {
        'cheerio/slim': path.resolve(__dirname, 'cheerioPolyfill.js')
      }
    }
  }

  // #endregion
]
