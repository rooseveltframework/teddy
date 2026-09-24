import path from 'path'
import { fileURLToPath } from 'url'
import esbuild from 'esbuild'
import { Eta } from 'eta'
import { packageVersion } from '../version.js'

const benchmarkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

// eta publishes es modules and no script a page can load, so its runtime is bundled here the way an app using it would have to bundle it. 'eta/core' is the half of eta that has no filesystem in it, which is the half a browser can run at all
let bundled = null
async function browserBundle () {
  if (!bundled) {
    const built = await esbuild.build({
      stdin: { contents: "export { Eta } from 'eta/core'", resolveDir: benchmarkRoot, loader: 'js' },
      bundle: true,
      write: false,
      format: 'iife',
      globalName: 'eta',
      platform: 'browser',
      minify: true
    })
    bundled = built.outputFiles[0].text
  }
  return bundled
}

export default {
  id: 'eta',
  name: 'Eta',
  url: 'https://eta.js.org',
  ext: 'eta',
  version: packageVersion('eta'),
  browserPrecompiled: {
    // eta's compiled function calls back into an eta instance for its includes and its config, so the library is still needed
    bundle: browserBundle,
    precompile (scenario, ctx) {
      const engine = new Eta({ autoEscape: true })
      // a partial has to be in the store before the template that includes it is compiled
      for (const [name, body] of Object.entries(ctx.readPartials())) engine.loadTemplate('@' + name, body)
      const partials = Object.entries(ctx.readPartials()).map(([name, body]) => `${JSON.stringify(name)}: ${engine.compile(body).toString()}`)
      return 'window.__eta = {\n main: ' + engine.compile(ctx.read(scenario)).toString() + ',\n partials: {\n' + partials.join(',\n') + '\n}\n}'
    },
    factory: `(scenario) => {
      const engine = new eta.Eta({ autoEscape: true })
      // the store holds functions rather than sources here, so an include reaches a precompiled partial instead of compiling one
      for (const name in window.__eta.partials) engine.templatesSync.define('@' + name, window.__eta.partials[name])
      return model => window.__eta.main.call(engine, model)
    }`
  },
  browser: {
    bundle: browserBundle,
    factory: `(templates, scenario) => {
      const engine = new eta.Eta({ autoEscape: true })
      for (const name in templates) if (name !== scenario) engine.loadTemplate('@' + name, templates[name])
      const fn = engine.compile(templates[scenario])
      return model => fn.call(engine, model)
    }`
  },

  async load (scenario, ctx, options = {}) {
    const eta = new Eta({ views: ctx.dir, cache: !options.cold, autoEscape: true })
    // eta resolves include() against its own template store, so the partials have to be loaded into that store rather than handed over as strings
    for (const [name, body] of Object.entries(ctx.readPartials())) {
      eta.loadTemplate('@' + name, body)
    }
    const fn = eta.compile(ctx.read(scenario))
    return data => fn.call(eta, data)
  }
}
