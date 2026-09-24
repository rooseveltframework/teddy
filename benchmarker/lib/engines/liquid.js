import { packageVersion } from '../version.js'
import { Liquid } from 'liquidjs'

export default {
  id: 'liquid',
  name: 'LiquidJS',
  url: 'https://liquidjs.com',
  ext: 'liquid',
  version: packageVersion('liquidjs'),
  precompiledNotes: 'walks a syntax tree rather than writing javascript, so there is nothing to precompile',
  browser: {
    bundle: 'liquidjs/dist/liquid.browser.min.js',
    factory: `(templates, scenario) => {
      const name = file => String(file).replace(/\\.liquid$/, '').replace(/^\\.\\//, '')
      const engine = new liquidjs.Liquid({
        // the smallest filesystem that satisfies liquid: it only ever asks about names this already has
        fs: {
          readFileSync: file => templates[name(file)],
          existsSync: file => templates[name(file)] !== undefined,
          resolve: (dir, file) => name(file),
          dirname: () => '',
          sep: '/',
          contains: () => true
        },
        extname: '.liquid'
      })
      const parsed = engine.parse(templates[scenario])
      return model => engine.renderSync(parsed, model)
    }`
  },
  // liquid does not escape by default, so the values that the other engines escape automatically carry an explicit `| escape` here, which is idiomatic liquid
  notes: 'output is unescaped by default; escaping is explicit',

  async load (scenario, ctx, options = {}) {
    const engine = new Liquid({ root: ctx.dir, extname: '.liquid', cache: !options.cold })
    const template = engine.parse(ctx.read(scenario), ctx.path(scenario))
    return data => engine.renderSync(template, data)
  }
}
