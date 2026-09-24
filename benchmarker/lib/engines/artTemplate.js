import { createRequire } from 'module'
import { packageVersion } from '../version.js'

const require = createRequire(import.meta.url)
const art = require('art-template')

export default {
  id: 'artTemplate',
  name: 'art-template',
  url: 'https://aui.github.io/art-template',
  ext: 'art',
  version: packageVersion('art-template'),
  browserPrecompiled: {
    // the compiled function reads its escape helper off $imports, which the library carries
    bundle: 'art-template/lib/template-web.js',
    precompile (scenario, ctx) {
      const name = file => String(file).replace(/^\.\//, '').replace(/\.art$/, '')
      art.defaults.resolveFilename = file => name(file)
      art.defaults.loader = file => ctx.read(name(file))
      art.defaults.escape = true
      art.defaults.minimize = false
      const one = (source, file) => art.compile(source, { filename: file }).toString()
      const partials = Object.entries(ctx.readPartials()).map(([n, body]) => `${JSON.stringify(n)}: ${one(body, n)}`)
      return 'window.__art = {\n main: ' + one(ctx.read(scenario), scenario) + ',\n partials: {\n' + partials.join(',\n') + '\n}\n}'
    },
    factory: `(scenario) => {
      const name = file => String(file).replace(/^\\.\\//, '').replace(/\\.art$/, '')
      // the compiled function was written expecting these two names to be in scope: they were the parameters of the wrapper art-template built it inside, which its source cannot carry
      window.$imports = template.defaults.imports
      window.$$options = {
        include: (file, data, blocks) => window.__art.partials[name(file)](data, blocks)
      }
      return model => window.__art.main(model)
    }`
  },
  browser: {
    bundle: 'art-template/lib/template-web.js',
    // art-template keeps a compiled template against its filename, so a cold render has to drop it or it would be timed reusing what it compiled last time
    coldReset: '() => template.defaults.caches.reset()',
    factory: `(templates, scenario) => {
      // art-template resolves an include through a filename, so both halves of that are answered here
      const name = file => String(file).replace(/^\\.\\//, '').replace(/\\.art$/, '')
      template.defaults.resolveFilename = file => name(file)
      template.defaults.loader = file => templates[name(file)]
      template.defaults.escape = true
      template.defaults.minimize = false
      const fn = template.compile(templates[scenario], { filename: scenario })
      return model => fn(model)
    }`
  },

  async load (scenario, ctx, options = {}) {
    // art-template keys its compile cache off the filename, so a load has to clear that cache itself or a cold measurement would replay a template compiled earlier
    art.defaults.caches.reset()
    return art.compile(ctx.read(scenario), {
      filename: ctx.path(scenario),
      root: ctx.dir,
      cache: !options.cold,
      escape: true,
      // this suite compares rendered markup, so the html minifier is left off: it would make art-template the only engine doing an extra pass over its own output
      minimize: false,
      debug: false,
      compileDebug: false
    })
  }
}
