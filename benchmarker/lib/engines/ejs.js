import { packageVersion } from '../version.js'
import ejs from 'ejs'

export default {
  id: 'ejs',
  name: 'EJS',
  url: 'https://ejs.co',
  ext: 'ejs',
  version: packageVersion('ejs'),
  // ejs's `client` option no longer writes a function a page can run on its own: what it hands back closes over ejs's own internals rather than carrying them, and the browser support ejs documents is loading ejs itself and compiling in the page, which is the route below
  precompiledNotes: 'compiles for a client, but not into a function that stands on its own without ejs around it',
  browser: {
    bundle: 'ejs/ejs.min.js',
    // the includes are compiled once and kept against the names the includer gives them
    coldReset: '() => ejs.cache.reset()',
    factory: `(templates, scenario) => {
      // ejs asks an includer to turn a name into source, which is how it reaches a partial without a filesystem. the name it hands back matters: ejs keeps a compiled include against it, and without one it compiles the partial again on every render, which would be timing a compile
      const includer = original => {
        const key = original.replace(/^\\.\\//, '').replace(/\\.ejs$/, '')
        return { filename: key, template: templates[key] }
      }
      const fn = ejs.compile(templates[scenario], { includer, cache: true })
      return model => fn(model)
    }`
  },

  async load (scenario, ctx, options = {}) {
    // `cache` plus a filename lets ejs memoize the partials it pulls in through include(), which is what an ejs app running under express gets in production
    return ejs.compile(ctx.read(scenario), {
      filename: ctx.path(scenario),
      root: ctx.dir,
      cache: !options.cold,
      rmWhitespace: false
    })
  }
}
