import { packageVersion } from '../version.js'
import doT from 'dot'

export default {
  id: 'dot',
  name: 'doT',
  url: 'https://olado.github.io/doT',
  ext: 'dot',
  version: packageVersion('dot'),
  browserPrecompiled: {
    // what doT writes closes over nothing, so the page needs no runtime at all
    bundle: null,
    precompile (scenario, ctx) {
      const defs = ctx.readPartials()
      const compiled = doT.template(ctx.read(scenario), Object.assign({}, doT.templateSettings, { strip: false }), defs)
      return 'window.__dot = ' + compiled.toString()
    },
    factory: '(scenario) => model => window.__dot(model)'
  },
  browser: {
    bundle: 'dot/doT.min.js',
    factory: `(templates, scenario) => {
      const defs = {}
      for (const name in templates) if (name !== scenario) defs[name] = templates[name]
      return doT.template(templates[scenario], Object.assign({}, doT.templateSettings, { strip: false }), defs)
    }`
  },
  // doT has no partial mechanism at render time: a {{#def.name}} reference is pasted in while the template is compiled, so a doT partial costs nothing once compiled
  notes: 'partials are compile-time definitions, inlined before the render function exists',

  async load (scenario, ctx, options = {}) {
    const defs = {}
    for (const [name, body] of Object.entries(ctx.readPartials())) defs[name] = body
    return doT.template(ctx.read(scenario), { ...doT.templateSettings, strip: false }, defs)
  }
}
