import { packageVersion } from '../version.js'
import dust from 'dustjs-linkedin'

export default {
  id: 'dust',
  name: 'Dust.js',
  url: 'https://www.dustjs.com',
  ext: 'dust',
  version: packageVersion('dustjs-linkedin'),
  browserPrecompiled: {
    // the core build is the runtime without the compiler in it
    bundle: 'dustjs-linkedin/dist/dust-core.min.js',
    precompile (scenario, ctx) {
      // what dust.compile writes registers the template on the dust object when it runs, so loading it as a script is all the page has to do
      let js = ''
      for (const [name, body] of Object.entries(ctx.readPartials())) js += dust.compile(body, name) + '\n'
      return js + dust.compile(ctx.read(scenario), scenario) + '\n'
    },
    factory: `(scenario) => {
      dust.config.whitespace = true
      dust.config.cache = true
      return model => {
        let out
        let called = false
        dust.render(scenario, model, (err, result) => {
          if (err) throw err
          called = true
          out = result
        })
        if (!called) throw new Error('dust did not call back before returning, so this render cannot be timed synchronously')
        return out
      }
    }`
  },
  browser: {
    // the full build carries the compiler, so a browser can compile the sources it is handed
    bundle: 'dustjs-linkedin/dist/dust-full.min.js',
    factory: `(templates, scenario) => {
      dust.config.whitespace = true
      dust.config.cache = true
      dust.cache = {}
      for (const name in templates) dust.loadSource(dust.compile(templates[name], name))
      return model => {
        let out
        let called = false
        dust.render(scenario, model, (err, result) => {
          if (err) throw err
          called = true
          out = result
        })
        // dust hands its markup to a callback, and calls it before returning as long as nothing in the template resolves asynchronously. these scenarios hold nothing that does, so the markup is there to return; saying so is what keeps a render that did defer from being timed as though it had finished
        if (!called) throw new Error('dust did not call back before returning, so this render cannot be timed synchronously')
        return out
      }
    }`
  },
  // dust hands its markup to a callback rather than returning it. it calls that callback before returning for anything already in memory, which is everything here, so a render is measured for what it renders rather than for a promise wrapped around it
  notes: 'renders through a callback, called before it returns',

  async load (scenario, ctx, options = {}) {
    dust.config.whitespace = true
    dust.config.cache = true
    // a load must not inherit templates a previous load compiled
    dust.cache = {}
    const name = 'bench/' + scenario
    dust.loadSource(dust.compile(ctx.read(scenario), name))
    for (const [partial, body] of Object.entries(ctx.readPartials())) {
      dust.loadSource(dust.compile(body, partial))
    }
    return data => {
      let out
      let called = false
      dust.render(name, data, (err, result) => {
        if (err) throw err
        called = true
        out = result
      })
      if (!called) throw new Error('dust did not call back before returning, so this render cannot be timed synchronously')
      return out
    }
  }
}
