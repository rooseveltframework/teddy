#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import engines from './lib/engines/index.js'
import scenarios from './lib/scenarios.js'
import makeModel from './fixtures/data.js'
import { measure } from './lib/measure.js'
import { run } from './lib/runner.js'
import { verify } from './lib/verify.js'
import { printConsoleReport, printBrowserReports, printComparison, markdownReport, jsonReport } from './lib/report.js'
import { saveBaseline, loadBaseline, baselinePath, mismatches, compare } from './lib/baseline.js'
import { runBrowser } from './lib/browser.js'

const benchmarkRoot = path.dirname(fileURLToPath(import.meta.url))

const usage = `
teddy templating engine benchmarks

  npm run bench                      measure everything, in node and in a browser, and write BENCHMARKS.md and BENCHMARKS.json
  npm run verify                     check that every engine renders matching markup, then stop

options
  --engines=teddy,ejs,pug            only these engines (default: all ${engines.length})
  --scenarios=table,page             only these scenarios (default: all ${scenarios.length})
  --modes=cached,cold                what to measure (default: both)
  --time=1000                        milliseconds to spend on each measurement
  --warmup=250                       milliseconds of warmup before each measurement
  --iterations=16                    minimum samples per measurement
  --table-rows=1000                  rows in the large table scenario
  --products=24                      products in the loop, partial, and page scenarios
  --no-isolate                       run every measurement in this process instead of a child
  --no-verify                        skip the output equivalence check (not recommended)
  --verify-only                      run the equivalence check and stop
  --browser=chromium                 which browser to measure in (chromium, firefox, webkit)
  --no-browser                       skip the browser passes
  --precompiled=chromium             which browser to measure precompiled templates in
  --no-precompiled                   skip the precompiled browser pass
  --no-save-baseline                 leave the existing baseline in place rather than replacing it with this run
  --save-baseline                    record a narrower run as the baseline, which it otherwise will not do
  --baseline=BASELINE.json           compare against a baseline kept somewhere other than the default
  --out=.                            directory for BENCHMARKS.json and BENCHMARKS.md
  --no-write                         print the report but do not write any files
  --write                            write BENCHMARKS.md even though this run is a partial one
  --list                             list the engines and scenarios and stop
  --help                             this message

engines are only benchmarked if their output matches teddy's, character for character
after whitespace and entity spelling are normalized. an engine whose output differs is
reported and left out of the timings.
`

function parseArgs (argv) {
  const options = {
    engines: null,
    scenarios: null,
    modes: ['cached', 'cold'],
    time: 1000,
    warmupTime: 250,
    iterations: 16,
    isolate: true,
    verify: true,
    verifyOnly: false,
    browser: 'chromium',
    precompiled: 'chromium',
    write: null,
    out: '.',
    nodeArgs: [],
    modelOptions: {},
    list: false,
    help: false,
    baseline: null,
    saveBaseline: null
  }

  for (const arg of argv) {
    const [flag, value] = arg.startsWith('--') ? arg.slice(2).split('=') : [arg, undefined]
    switch (flag) {
      case 'help': options.help = true; break
      case 'list': options.list = true; break
      case 'engines': options.engines = value.split(','); break
      case 'scenarios': options.scenarios = value.split(','); break
      case 'modes': options.modes = value.split(','); break
      case 'time': options.time = Number(value); break
      case 'warmup': options.warmupTime = Number(value); break
      case 'iterations': options.iterations = Number(value); break
      case 'table-rows': options.modelOptions.tableRows = Number(value); break
      case 'products': options.modelOptions.products = Number(value); break
      case 'isolate': options.isolate = value !== 'false'; break
      case 'no-isolate': options.isolate = false; break
      case 'verify': options.verify = value !== 'false'; break
      case 'no-verify': options.verify = false; break
      case 'verify-only': options.verifyOnly = true; break
      case 'browser': options.browser = value || 'chromium'; break
      case 'no-browser': options.browser = null; break
      case 'precompiled': options.precompiled = value || 'chromium'; break
      case 'no-precompiled': options.precompiled = null; break
      case 'no-write': options.write = false; break
      case 'write': options.write = true; break
      case 'out': options.out = value; break
      case 'baseline': options.baseline = value; break
      case 'save-baseline': options.saveBaseline = true; break
      case 'no-save-baseline': options.saveBaseline = false; break
      default:
        console.error(`unknown option: ${arg}`)
        process.exit(1)
    }
  }

  const unknownEngines = options.engines?.filter(id => !engines.some(engine => engine.id === id)) ?? []
  const unknownScenarios = options.scenarios?.filter(id => !scenarios.some(scenario => scenario.id === id)) ?? []
  const unknownModes = options.modes.filter(mode => mode !== 'cached' && mode !== 'cold')
  if (unknownEngines.length) fail(`unknown engine(s): ${unknownEngines.join(', ')}`)
  if (unknownScenarios.length) fail(`unknown scenario(s): ${unknownScenarios.join(', ')}`)
  if (unknownModes.length) fail(`unknown mode(s): ${unknownModes.join(', ')}; use cached and/or cold`)

  return options
}

function fail (message) {
  console.error('\n' + message + '\nrun with --list to see what is available\n')
  process.exit(1)
}

// a child process spawned by the runner: take one measurement, print it as json, exit
async function runAsChild (payload) {
  const request = JSON.parse(payload)
  const engine = engines.find(candidate => candidate.id === request.engine)
  const result = await measure({
    engine,
    scenario: request.scenario,
    mode: request.mode,
    model: makeModel(request.modelOptions),
    time: request.time,
    warmupTime: request.warmupTime,
    iterations: request.iterations
  })
  process.stdout.write(JSON.stringify(result) + '\n')
}

function reportVerification (results) {
  const problems = results.filter(result => result.status !== 'match' && result.status !== 'reference')
  const matched = results.filter(result => result.status === 'match').length

  console.log(`\noutput equivalence: ${matched} of ${results.length - results.filter(r => r.status === 'reference').length} engine/scenario pairs match teddy's markup`)
  for (const problem of problems) {
    console.log(`\n  ${problem.engine} / ${problem.scenario}: ${problem.status}`)
    if (problem.error) console.log(`    ${problem.error}`)
    if (problem.difference) {
      console.log(`    first difference at character ${problem.difference.index}`)
      console.log(`    teddy: ${JSON.stringify(problem.difference.expected)}`)
      console.log(`    this : ${JSON.stringify(problem.difference.actual)}`)
    }
  }
  return problems
}

async function main () {
  const argv = process.argv.slice(2)
  const measureIndex = argv.indexOf('--measure')
  if (measureIndex !== -1) return runAsChild(argv[measureIndex + 1])

  const options = parseArgs(argv)

  if (options.help) {
    console.log(usage)
    return
  }

  if (options.list) {
    console.log('\nengines')
    for (const engine of engines) console.log(`  ${engine.id.padEnd(13)} ${engine.name.padEnd(18)} ${engine.version.padEnd(10)} ${engine.url}`)
    console.log('\nscenarios')
    for (const scenario of scenarios) console.log(`  ${scenario.id.padEnd(13)} ${scenario.description}`)
    console.log()
    return
  }

  // what the caller asked for, kept aside because the node verification narrows options.engines when an engine's node output disagrees. the browser run has its own set of engines and its own equivalence check, so it should not inherit that
  const requestedEngines = options.engines

  let verification = null
  let excluded = []
  if (options.verify || options.verifyOnly) {
    verification = await verify({ only: { engines: options.engines, scenarios: options.scenarios } })
    const problems = reportVerification(verification)
    excluded = [...new Set(problems.map(problem => problem.engine))].filter(id => id !== 'teddy')
    if (problems.some(problem => problem.engine === 'teddy')) {
      console.error('\nteddy itself could not render a scenario, so there is nothing to compare against\n')
      process.exit(1)
    }
    if (options.verifyOnly) {
      console.log(problems.length ? '' : '\nall engines agree\n')
      process.exit(problems.length ? 1 : 0)
    }
    if (excluded.length) {
      console.log(`\nleaving out of the timings: ${excluded.join(', ')}\n`)
      const keep = (options.engines ?? engines.map(engine => engine.id)).filter(id => !excluded.includes(id))
      options.engines = keep
    }
  }

  let lastLine = 0
  const results = await run({
    ...options,
    onProgress ({ done, total, engine, scenario, mode }) {
      const line = `  [${done}/${total}] ${scenario} / ${mode} / ${engine}`
      if (process.stderr.isTTY) process.stderr.write('\r' + line.padEnd(lastLine) + '\r' + line)
      else process.stderr.write(line + '\n')
      lastLine = line.length
    }
  })
  if (process.stderr.isTTY) process.stderr.write('\r' + ' '.repeat(lastLine) + '\r')

  printConsoleReport(results, options)

  // the browser runs come after the node one so that a single report carries all of them. each is its own measurement: which engines can take part differs, and so does what they are being asked to do, so they are reported side by side rather than merged
  //
  // the browser runs honor --modes the same way the node run does, because cached and cold mean the same thing in a browser: whether building the render function is inside what is timed. a precompiled run is cached by definition, since the building happened in node before any of this
  const browserOutcomes = []
  const browserPasses = []
  if (options.browser) for (const mode of options.modes) browserPasses.push([mode, options.browser])
  if (options.precompiled) browserPasses.push(['precompiled', options.precompiled])
  for (const [mode, browserName] of browserPasses) {
    if (!browserName) continue
    const outcome = await runBrowser({
      mode,
      browser: browserName,
      time: options.time,
      warmupTime: options.warmupTime,
      model: makeModel(options.modelOptions),
      only: { engines: requestedEngines, scenarios: options.scenarios }
    })
    browserOutcomes.push(outcome)
  }
  // printed after every pass has run, because the cached table is built from more than one of them
  if (browserOutcomes.length) printBrowserReports(browserOutcomes)

  // what a complete run measures. BENCHMARKS.md and the baseline are both records of one, so a narrower run leaves both alone rather than replacing them with less than they say
  const missing = []
  if (options.engines) missing.push('every engine')
  if (options.scenarios) missing.push('every scenario')
  if (!options.modes.includes('cached') || !options.modes.includes('cold')) missing.push('both modes')
  if (!options.browser) missing.push('the browser passes')
  if (!options.precompiled) missing.push('the precompiled pass')

  // a baseline is compared against before this run can overwrite it, and only when it was taken here: a run somewhere else is not a comparison, it is two different machines
  const measured = engines.filter(engine => results.some(result => result.engine === engine.id && !result.error))
  const file = baselinePath(options.baseline)
  const baseline = loadBaseline(file)
  if (baseline) {
    const wrong = mismatches(baseline, options)
    if (wrong.length) {
      console.log(`=== the baseline in ${path.relative(process.cwd(), file)} was not taken under these conditions, so it is not compared against ===`)
      console.log()
      for (const reason of wrong) console.log(`  ${reason}`)
      console.log()
      console.log('  what an engine costs relative to teddy moves by tens of percent between node versions and between machines, which would swamp anything a dependency bump did. take a fresh baseline with --save-baseline')
      console.log()
    } else {
      printComparison(compare(baseline, { results, browserOutcomes, engines: measured }))
    }
  }

  const saving = options.saveBaseline ?? !missing.length
  if (!baseline && !saving) {
    console.log('no baseline to compare against, and this run is too narrow to become one. `npm run benchmark` on its own records one, and the run after it says what moved\n')
  }

  if (saving) {
    saveBaseline(file, { results, options, browserOutcomes, engines: measured })
    console.log(`wrote ${path.relative(process.cwd(), file)}, which the next run on this machine will be compared against\n`)
  }

  const failures = results.filter(result => result.error)
  if (failures.length) {
    console.log('measurements that failed')
    for (const failure of failures) console.log(`  ${failure.scenario} / ${failure.mode} / ${failure.engine}: ${failure.error}`)
    console.log()
  }

  if (options.write === false || (options.write === null && missing.length)) {
    if (options.write === null) {
      console.log(`not written: BENCHMARKS.md is the report of a complete run, and this one left out ${missing.join(', ')}`)
      console.log('`npm run benchmark` on its own measures everything and rewrites it; --write overwrites it from this narrower run instead\n')
    }
  } else {
    const outDir = path.resolve(benchmarkRoot, options.out)
    fs.mkdirSync(outDir, { recursive: true })
    const json = path.join(outDir, 'BENCHMARKS.json')
    const markdown = path.join(outDir, 'BENCHMARKS.md')
    fs.writeFileSync(json, JSON.stringify(jsonReport(results, options, verification, browserOutcomes), null, 2) + '\n')
    fs.writeFileSync(markdown, markdownReport(results, options, browserOutcomes) + '\n')
    console.log(`wrote ${path.relative(process.cwd(), json)} and ${path.relative(process.cwd(), markdown)}\n`)
  }
}

// the work is finished once the report is written, so nothing should keep this running past that. engines and browsers are other people's code, though, and any of them can leave a socket or a process behind that node will wait on forever
//
// the timer is unref'd, so a run with nothing left to do still exits the moment it is done and this never fires. when it does fire, something is holding the loop open, and it says what before leaving rather than hanging with no explanation
function leaveEvenIfSomethingIsStillOpen () {
  const bail = setTimeout(() => {
    const open = (process._getActiveHandles() || []).filter(handle => !handle.hasRef || handle.hasRef())
    if (open.length) {
      const describe = handle => (handle.constructor?.name ?? typeof handle) + (handle.pid ? ` (pid ${handle.pid})` : '')
      console.error(`finished, but ${open.map(describe).join(', ')} still had this process open. leaving anyway; please report it\n`)
    }
    process.exit(process.exitCode ?? 0)
  }, 5000)
  bail.unref()
}

main().then(leaveEvenIfSomethingIsStillOpen).catch(err => {
  console.error(err)
  process.exit(1)
})
