import { packageVersion } from '../version.js'
import mustache from 'mustache'

export default {
  id: 'mustache',
  name: 'Mustache',
  url: 'https://github.com/janl/mustache.js',
  ext: 'mustache',
  version: packageVersion('mustache'),
  precompiledNotes: 'parses a template into tokens and walks them: there is no javascript for it to write out',
  browser: {
    bundle: 'mustache/mustache.min.js',
    // mustache keeps a parsed template against its source, so a cold render has to drop it or it would be timed reusing what it parsed last time
    coldReset: '() => Mustache.clearCache()',
    factory: `(templates, scenario) => {
      const partials = {}
      for (const name in templates) if (name !== scenario) partials[name] = templates[name]
      Mustache.parse(templates[scenario])
      for (const name in partials) Mustache.parse(partials[name])
      return model => Mustache.render(templates[scenario], model, partials)
    }`
  },
  // mustache is logic-less by design: no else, no boolean operators, no comparisons. every branch in the shared scenarios is therefore written as a section plus its inverted twin, which is the only way mustache can express it
  notes: 'logic-less: else branches are written as inverted sections',

  async load (scenario, ctx, options = {}) {
    // mustache keeps parsed templates in a module level cache keyed by source, which a cold measurement has to empty or it would be timing a cache hit
    if (options.cold) mustache.clearCache()
    const source = ctx.read(scenario)
    const partials = ctx.readPartials()
    // parse once up front so the render loop is not re-parsing on every call
    mustache.parse(source)
    for (const body of Object.values(partials)) mustache.parse(body)
    return data => mustache.render(source, data, partials)
  }
}
