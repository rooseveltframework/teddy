import { packageVersion } from '../version.js'
import pug from 'pug'

export default {
  id: 'pug',
  name: 'Pug',
  url: 'https://pugjs.org',
  ext: 'pug',
  version: packageVersion('pug'),
  browserNotes: 'ships no build that compiles a template in a browser: pug compiles ahead of time, so it is measured that way',
  browserPrecompiled: {
    // with the runtime inlined there is nothing else for the page to load
    bundle: null,
    precompile (scenario, ctx) {
      return pug.compileFileClient(ctx.path(scenario), {
        name: 'pugTemplate',
        basedir: ctx.dir,
        inlineRuntimeFunctions: true
      }) + '\nwindow.__pug = pugTemplate'
    },
    factory: '(scenario) => model => window.__pug(model)'
  },
  // pug's `include` is resolved at compile time, so a partial costs nothing at render time; the repeated-component scenarios use mixins instead, which is what a pug codebase actually reaches for and is the closest thing pug has to a partial call
  notes: 'partials are mixins; pug include is inlined at compile time',

  async load (scenario, ctx, options = {}) {
    return pug.compile(ctx.read(scenario), {
      filename: ctx.path(scenario),
      basedir: ctx.dir,
      cache: !options.cold
    })
  }
}
