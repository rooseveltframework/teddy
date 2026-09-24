import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import esbuild from 'esbuild'
import { packageVersion } from '../version.js'

const require = createRequire(import.meta.url)

// marko compiles a template into a javascript module that imports marko's runtime, so putting one in a browser means bundling it. that bundle is the build step marko is designed around
//
// what it is bundled against matters: marko ships an html runtime and a dom one, and these scenarios render html and nothing else. compiling with output 'html' is what picks the html half, and bundling for a neutral platform is what keeps esbuild from resolving marko's exports map to the dom half on its own
const markoLoader = {
  name: 'marko',
  setup (build) {
    build.onLoad({ filter: /\.marko$/ }, args => {
      const { compileSync } = require('@marko/compiler')
      return {
        contents: compileSync(fs.readFileSync(args.path, 'utf8'), args.path, { output: 'html' }).code,
        loader: 'js',
        // a tag or an include inside the template resolves against the file it was written in
        resolveDir: path.dirname(args.path)
      }
    })
  }
}

// marko compiles a .marko file into a commonjs module, so it is loaded through a require hook rather than compiled from a string like the rest of the suite
let hookInstalled = false

export default {
  id: 'marko',
  name: 'Marko',
  url: 'https://markojs.com',
  ext: 'marko',
  version: packageVersion('marko'),
  browserNotes: 'ships no build that compiles a template in a browser: marko compiles ahead of time',
  browserPrecompiled: {
    // the bundle carries marko's html runtime with it, so the page needs nothing else
    bundle: null,
    async precompile (scenario, ctx) {
      const built = await esbuild.build({
        stdin: {
          contents: `import template from ${JSON.stringify(ctx.path(scenario))}\nwindow.__marko = template\n`,
          resolveDir: ctx.dir,
          loader: 'js'
        },
        bundle: true,
        write: false,
        format: 'iife',
        // neutral rather than browser, so that marko's own internals resolve to the html versions
        platform: 'neutral',
        mainFields: ['module', 'main'],
        conditions: [],
        // the same shape a build step would ship
        minify: true,
        plugins: [markoLoader]
      })
      return built.outputFiles[0].text
    },
    factory: '(scenario) => model => window.__marko.render(model).toString()'
  },
  // marko is a compiler with a build step: it turns a template into a javascript module ahead of time. the cached render numbers below are the compiled module running; the cold numbers include the full compile, which is much heavier than a parse
  notes: 'ahead-of-time compiler; a .marko file becomes a js module',

  async load (scenario, ctx, options = {}) {
    if (!hookInstalled) {
      // marko's own recommendation over the older marko/node-require hook
      require('@marko/compiler/register')
      hookInstalled = true
    }
    const file = ctx.path(scenario)
    // drop the compiled module so a cold load recompiles instead of replaying a cached one
    for (const key of Object.keys(require.cache)) {
      if (key.endsWith('.marko')) delete require.cache[key]
    }
    const loaded = require(file)
    const template = loaded.default || loaded
    return data => template.render(data).toString()
  }
}
