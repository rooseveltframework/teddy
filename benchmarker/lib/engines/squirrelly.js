import { packageVersion } from '../version.js'
import * as Sqrl from 'squirrelly'

export default {
  id: 'squirrelly',
  name: 'Squirrelly',
  url: 'https://squirrelly.js.org',
  ext: 'sqrl',
  version: packageVersion('squirrelly'),
  browserPrecompiled: {
    // a compiled squirrelly template is handed the config it reads its helpers and filters off, so the library is still needed
    bundle: 'squirrelly/dist/browser/squirrelly.min.js',
    precompile (scenario, ctx) {
      const one = source => String(Sqrl.compile(source, Sqrl.defaultConfig))
      const partials = Object.entries(ctx.readPartials()).map(([name, body]) => `${JSON.stringify(name)}: ${one(body)}`)
      return 'window.__sqrl = {\n main: ' + one(ctx.read(scenario)) + ',\n partials: {\n' + partials.join(',\n') + '\n}\n}'
    },
    factory: `(scenario) => {
      for (const name in window.__sqrl.partials) Sqrl.templates.define(name, window.__sqrl.partials[name])
      return model => window.__sqrl.main(model, Sqrl.defaultConfig)
    }`
  },
  browser: {
    bundle: 'squirrelly/dist/browser/squirrelly.min.js',
    factory: `(templates, scenario) => {
      for (const name in templates) if (name !== scenario) Sqrl.templates.define(name, Sqrl.compile(templates[name], Sqrl.defaultConfig))
      const fn = Sqrl.compile(templates[scenario], Sqrl.defaultConfig)
      return model => fn(model, Sqrl.defaultConfig)
    }`
  },

  async load (scenario, ctx, options = {}) {
    // squirrelly resolves {{@include}} out of a global template store keyed by name
    for (const [name, body] of Object.entries(ctx.readPartials())) {
      Sqrl.templates.define(name, Sqrl.compile(body, Sqrl.defaultConfig))
    }
    const fn = Sqrl.compile(ctx.read(scenario), Sqrl.defaultConfig)
    return data => fn(data, Sqrl.defaultConfig)
  }
}
