// runs the same scenarios in a real browser instead of in node
//
// an engine is only measured here if it ships a build a browser can load. each one says where that build is and how to turn a set of templates into a render function; the second part is written as source rather than as a function, because it has to be evaluated inside the page where the engine actually lives
//
// what this measures that the node run cannot: an engine in a browser has no filesystem, so every template has to be handed to it up front, and teddy in particular cannot build a function from a string under a content security policy and so walks its node tree instead of emitting javascript
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium, firefox, webkit } from 'playwright'
import engines from './engines/index.js'
import scenarios from './scenarios.js'
import { makeContext, engineHasScenario } from './context.js'
import { canonicalize, firstDifference } from './normalize.js'

const benchmarkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const browsers = { chromium, firefox, webkit }

// the templates an engine needs for one scenario: the page itself, and every partial in its directory, since a browser cannot go and read one later
function templatesFor (engine, scenario) {
  const ctx = makeContext(engine)
  const templates = { [scenario]: ctx.read(scenario) }
  for (const [name, source] of Object.entries(ctx.readPartials())) templates[name] = source
  return templates
}

// what an engine's runtime has to be for a page to load it: a path to a script it ships, or a function that builds one. an engine that publishes only es modules has no script to point at, so getting it into a page means bundling it, which is what an app using it would have to do too
async function addBundle (page, bundle) {
  if (typeof bundle === 'function') return page.addScriptTag({ content: await bundle() })
  const full = path.join(benchmarkRoot, 'node_modules', bundle)
  if (!fs.existsSync(full)) throw new Error(`cannot find ${bundle}`)
  return page.addScriptTag({ path: full })
}

// builds a render function inside the page and returns what it produces once, so that the output can be checked before anything is timed
async function prepare (page, engine, scenario) {
  await addBundle(page, engine.browser.bundle)
  return page.evaluate(({ factory, templates, scenario }) => {
    // eslint-disable-next-line no-eval
    window.__build = eval(factory)
    window.__templates = templates
    window.__scenario = scenario
    window.__render = window.__build(templates, scenario)
    return true
  }, { factory: engine.browser.factory, templates: templatesFor(engine, scenario), scenario })
}

// the same, for an engine handed its template already compiled to javascript
//
// the template is compiled here, in node, the way a build step would do it, and what comes out is put into the page as a script. that is the whole point of precompiling: the page runs javascript that was written for it ahead of time rather than building a function from a string of its own, which is what a strict content security policy forbids. an engine that can only compile at runtime has no entry for this mode
async function preparePrecompiled (page, engine, scenario) {
  const mode = engine.browserPrecompiled
  // some engines inline whatever runtime their compiled template needs into it, so there is no separate runtime for the page to load
  if (mode.bundle) await addBundle(page, mode.bundle)
  const compiled = await mode.precompile(scenario, makeContext(engine))
  await page.addScriptTag({ content: compiled })
  return page.evaluate(({ factory, scenario }) => {
    // eslint-disable-next-line no-eval
    window.__render = eval(factory)(scenario)
    return true
  }, { factory: mode.factory, scenario })
}

export async function runBrowser (options = {}) {
  const only = options.only
  const browserName = options.browser || 'chromium'
  const time = options.time ?? 1000
  const warmupTime = options.warmupTime ?? 300
  const model = options.model

  // three measurements, and only two things vary between them. 'cached' and 'cold' are the same distinction the node run makes: whether building the render function is inside what is timed. 'precompiled' is a cached run where the building happened in node, ahead of time, instead
  const mode = ['precompiled', 'cold'].includes(options.mode) ? options.mode : 'cached'
  const cold = mode === 'cold'
  const has = engine => mode === 'precompiled' ? engine.browserPrecompiled : engine.browser
  const why = engine => mode === 'precompiled'
    ? engine.precompiledNotes || 'not wired up for precompiling here yet'
    : engine.browserNotes || 'ships no build a browser can load'

  // an engine absent from a table is absent for one of two reasons, and they are not the same thing: it cannot run in a browser at all, or it can but not this way. an engine that compiles ahead of time has no cold number because there is nothing left to compile by the time the page has it
  const short = engine => engine.browserPrecompiled && !engine.browser ? 'compiles ahead of time' : 'cannot run client-side'

  const usable = engines.filter(engine => has(engine) && (!only?.engines || only.engines.includes(engine.id)))
  const skipped = engines.filter(engine => !has(engine)).map(engine => ({ engine: engine.id, why: why(engine), short: short(engine) }))

  // a browser pass used to say nothing at all from the moment it started until every measurement in it was done, which on a full run is minutes of a silent terminal directly after the node tables have finished printing. it reports itself the same way the node run does instead
  const wanted = scenarios.filter(scenario => !only?.scenarios || only.scenarios.includes(scenario.id))
  const total = wanted.reduce((sum, scenario) => sum + usable.filter(engine => engineHasScenario(engine, scenario.id)).length, 0)
  let done = 0
  let lastLine = 0
  const progress = engine => {
    const line = `  [${++done}/${total}] ${browserName} / ${mode} / ${engine}`
    if (process.stderr.isTTY) process.stderr.write('\r' + line.padEnd(lastLine) + '\r' + line)
    else process.stderr.write(line + '\n')
    lastLine = line.length
  }

  process.stderr.write(`  starting ${browserName} for the ${mode} pass\n`)
  const browser = await browsers[browserName].launch()
  const results = []
  const mismatches = []

  try {
    for (const scenario of scenarios) {
      if (only?.scenarios && !only.scenarios.includes(scenario.id)) continue
      let expected = null

      for (const engine of usable) {
        if (!engineHasScenario(engine, scenario.id)) continue
        progress(engine.id)

        const page = await browser.newPage()
        const errors = []
        page.on('pageerror', error => errors.push(error.message))

        try {
          await page.setContent('<!doctype html><html><body></body></html>')
          if (mode === 'precompiled') await preparePrecompiled(page, engine, scenario.id)
          else await prepare(page, engine, scenario.id)

          const measured = await page.evaluate(({ model, time, warmupTime, cold, coldReset }) => {
            // a cold render builds the function and renders once, together, the way the node run's cold mode does. anything the engine kept from the last time round is dropped first, or what is measured is a rebuild that quietly reused what it already had
            // eslint-disable-next-line no-eval
            const reset = coldReset ? eval('(' + coldReset + ')') : null
            const once = cold
              ? () => {
                  if (reset) reset()
                  return window.__build(window.__templates, window.__scenario)(model)
                }
              : () => window.__render(model)
            const output = once()
            // the same model is rendered many times over, so an engine that changed it or its own state would be measured doing something other than what it did the first time
            if (once() !== output) throw new Error('render is not repeatable')

            let stop = performance.now() + warmupTime
            while (performance.now() < stop) once()

            let runs = 0
            const started = performance.now()
            stop = started + time
            while (performance.now() < stop) { once(); runs++ }
            const elapsed = performance.now() - started

            return { output, mean: elapsed / runs, hz: (runs / elapsed) * 1000, runs }
          }, { model, time, warmupTime, cold, coldReset: engine.browser?.coldReset ?? null })

          if (errors.length) throw new Error(errors[0])

          const canonical = canonicalize(measured.output)
          if (engine.id === 'teddy') expected = canonical
          else if (expected !== null && canonical !== expected) {
            mismatches.push({ scenario: scenario.id, engine: engine.id, at: firstDifference(canonical, expected) })
            continue
          }

          results.push({
            engine: engine.id,
            scenario: scenario.id,
            browser: browserName,
            mean: measured.mean,
            hz: measured.hz,
            runs: measured.runs,
            bytes: measured.output.length
          })
        } catch (error) {
          mismatches.push({ scenario: scenario.id, engine: engine.id, error: error.message })
        } finally {
          await page.close()
        }
      }
    }
  } finally {
    if (process.stderr.isTTY) process.stderr.write('\r' + ' '.repeat(lastLine) + '\r')
    await browser.close()
  }

  return { browser: browserName, mode, results, mismatches, skipped }
}
