import { packageVersion } from '../version.js'
import Handlebars from 'handlebars'

export default {
  id: 'handlebars',
  name: 'Handlebars',
  url: 'https://handlebarsjs.com',
  ext: 'hbs',
  version: packageVersion('handlebars'),
  browserPrecompiled: {
    // the runtime build has no compiler in it, which is the point: the page never compiles anything
    bundle: 'handlebars/dist/handlebars.runtime.min.js',
    precompile (scenario, ctx) {
      const specs = { [scenario]: Handlebars.precompile(ctx.read(scenario)) }
      for (const [name, body] of Object.entries(ctx.readPartials())) specs[name] = Handlebars.precompile(body)
      return 'window.__hbs = {\n' + Object.entries(specs).map(([name, spec]) => `${JSON.stringify(name)}: ${spec}`).join(',\n') + '\n}'
    },
    factory: `(scenario) => {
      const templates = {}
      for (const name in window.__hbs) templates[name] = Handlebars.template(window.__hbs[name])
      for (const name in templates) if (name !== scenario) Handlebars.registerPartial(name, templates[name])
      return model => templates[scenario](model)
    }`
  },
  browser: {
    bundle: 'handlebars/dist/handlebars.min.js',
    factory: `(templates, scenario) => {
      const hbs = Handlebars.create()
      for (const name in templates) if (name !== scenario) hbs.registerPartial(name, templates[name])
      return hbs.compile(templates[scenario])
    }`
  },

  async load (scenario, ctx, options = {}) {
    // a fresh environment per load, so registering partials cannot leak between scenarios and a cold measurement does not reuse a warm partial registry
    const hbs = Handlebars.create()
    for (const [name, body] of Object.entries(ctx.readPartials())) {
      hbs.registerPartial(name, body)
    }
    return hbs.compile(ctx.read(scenario))
  }
}
