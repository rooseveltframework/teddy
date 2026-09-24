import { packageVersion } from '../version.js'
import teddy from 'teddy'

export default {
  id: 'teddy',
  name: 'Teddy',
  url: 'https://rooseveltframework.org/docs/teddy',
  ext: 'html',
  version: packageVersion('teddy'),
  browser: {
    bundle: 'teddy/dist/teddy.min.js',
    factory: `(templates, scenario) => {
      teddy.setVerbosity(0)
      teddy.clearTemplates()
      // without this a template registered by name is prepared again on every render, which is the same thing the node side switches on, and leaving it off would measure compiling rather than rendering
      teddy.setCacheTemplates(true)
      // a browser has no filesystem, so every template is registered up front rather than read on demand
      for (const name in templates) teddy.setTemplate(name, templates[name])
      return model => teddy.render(scenario, model)
    }`
  },
  browserPrecompiled: {
    // the standalone build, which carries the helpers the precompiled code calls into
    bundle: 'teddy/dist/teddy.min.js',
    precompile (scenario, ctx) {
      teddy.setVerbosity(0)
      teddy.setTemplateRoot(ctx.dir)
      teddy.clearTemplates()
      // the page loads this as a plain script, which is what teddy's global format is for: the templates collect on one global, keyed by the name they were compiled under
      return teddy.precompile(scenario, { format: 'global' })
    },
    factory: `(scenario) => {
      teddy.setVerbosity(0)
      teddy.clearTemplates()
      teddy.registerPrecompiled(window.teddyPrecompiled[scenario])
      return model => teddy.render(scenario, model)
    }`
  },
  // teddy compiles a template into a tree of nodes once and renders by walking that tree, which is what the other engines here do with a function they build once. template caching is switched on so that the filesystem is not part of the measurement, matching the other engines being handed their source as a string
  //
  // before 2.0 teddy had no compile step at all: every render reparsed the markup, so its cold and cached numbers were nearly the same and the cached one was a genuine reparse

  async load (scenario, ctx, options = {}) {
    teddy.setVerbosity(0)
    teddy.setTemplateRoot(ctx.dir)
    // drop anything a previous load put in the cache, so a cold measurement is cold
    teddy.clearTemplates()
    teddy.setCacheTemplates(true)
    return data => teddy.render(scenario, data)
  }
}
