import { createRequire } from 'module'
import { packageVersion } from '../version.js'

const require = createRequire(import.meta.url)
const _ = require('lodash')

export default {
  id: 'lodash',
  name: 'Lodash template',
  url: 'https://lodash.com/docs#template',
  ext: 'lodash',
  version: packageVersion('lodash'),
  browserPrecompiled: {
    // lodash templates reach for _.escape and the imports they were given, so the library still has to be there
    bundle: 'lodash/lodash.min.js',
    precompile (scenario, ctx) {
      const parts = Object.entries(ctx.readPartials()).map(([name, body]) => `${JSON.stringify(name)}: ${_.template(body).source}`)
      // a partial is another compiled function, and the page has to hand them to the main one the same way the runtime compiled version does
      return 'window.__lodashPartials = {\n' + parts.join(',\n') + '\n}\n' +
        'window.__lodash = ' + _.template(ctx.read(scenario), { imports: { partials: {} } }).source
    },
    factory: `(scenario) => {
      const partials = window.__lodashPartials
      // the runtime compiled version is handed its partials as imports, which lodash closes the compiled function over. the function's own source cannot carry that closure, so the partials reach it the other way lodash resolves a name: off the object being rendered
      return model => {
        if (model.partials !== partials) model.partials = partials
        return window.__lodash(model)
      }
    }`
  },
  browser: {
    bundle: 'lodash/lodash.min.js',
    factory: `(templates, scenario) => {
      const partials = {}
      for (const name in templates) if (name !== scenario) partials[name] = _.template(templates[name])
      return _.template(templates[scenario], { imports: { partials } })
    }`
  },
  // lodash templates have no include mechanism at all, so the partials are compiled separately and handed to the parent as functions through `imports`, which is the usual way an underscore/lodash codebase composes templates
  notes: 'no include mechanism; partials are passed in as compiled functions',

  async load (scenario, ctx, options = {}) {
    const partials = {}
    for (const [name, body] of Object.entries(ctx.readPartials())) {
      partials[name] = _.template(body)
    }
    return _.template(ctx.read(scenario), { imports: { partials } })
  }
}
