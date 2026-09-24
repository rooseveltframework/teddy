import { packageVersion } from '../version.js'
import nunjucks from 'nunjucks'

export default {
  id: 'nunjucks',
  name: 'Nunjucks',
  url: 'https://mozilla.github.io/nunjucks',
  ext: 'njk',
  version: packageVersion('nunjucks'),
  browserPrecompiled: {
    // the slim build is the runtime without the compiler in it, which is what precompiling is for
    bundle: 'nunjucks/browser/nunjucks-slim.min.js',
    precompile (scenario, ctx) {
      // what precompileString writes registers the template on window.nunjucksPrecompiled when it runs
      let js = nunjucks.precompileString(ctx.read(scenario), { name: scenario })
      for (const [name, body] of Object.entries(ctx.readPartials())) js += nunjucks.precompileString(body, { name: name + '.njk' })
      return js
    },
    factory: `(scenario) => {
      // the slim runtime looks a name up in what the precompiled scripts registered, and the templates refer to a partial by its name with the extension, so both spellings are answered
      const registered = window.nunjucksPrecompiled
      for (const key in registered) registered[key.replace(/\\.njk$/, '')] = registered[key]
      const env = new nunjucks.Environment(null, { autoescape: true })
      return model => env.render(scenario, model)
    }`
  },
  browser: {
    bundle: 'nunjucks/browser/nunjucks.min.js',
    factory: `(templates, scenario) => {
      // a loader is all nunjucks wants: it asks for a name and this hands back the source
      function Loader () {}
      Loader.prototype.getSource = function (name) {
        const key = name.replace(/\\.njk$/, '')
        return { src: templates[key] ?? templates[name], path: name, noCache: false }
      }
      const env = new nunjucks.Environment(new Loader(), { autoescape: true })
      return model => env.render(scenario, model)
    }`
  },

  async load (scenario, ctx, options = {}) {
    const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(ctx.dir, { noCache: !!options.cold }), {
      autoescape: true,
      trimBlocks: false
    })
    const template = env.getTemplate(scenario + '.njk', true)
    return data => template.render(data)
  }
}
