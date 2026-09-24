import os from 'os'
import engines from './engines/index.js'
import scenarios from './scenarios.js'

const engineById = new Map(engines.map(engine => [engine.id, engine]))

// what a browser table shows in place of a measurement for an engine it has no number for
const CANNOT_RUN = 'cannot run client-side'
const BLANK = '—'
const scenarioById = new Map(scenarios.map(scenario => [scenario.id, scenario]))

const modeLabels = {
  cached: 'cached (render only, template already compiled)',
  cold: 'cold (compile and render together, engine cache off)'
}

function formatHz (hz) {
  if (hz >= 1000) return Math.round(hz).toLocaleString('en-US')
  if (hz >= 100) return hz.toFixed(0)
  if (hz >= 10) return hz.toFixed(1)
  return hz.toFixed(2)
}

function formatMs (ms) {
  if (ms >= 100) return ms.toFixed(0)
  if (ms >= 1) return ms.toFixed(2)
  if (ms >= 0.01) return ms.toFixed(3)
  return ms.toExponential(1)
}

// how many times faster than teddy, or how many times slower, said in whichever direction reads naturally
function formatRelative (hz, teddyHz) {
  if (!teddyHz || !hz) return '—'
  const ratio = hz / teddyHz
  if (Math.abs(ratio - 1) < 0.005) return 'same'
  return ratio >= 1 ? ratio.toFixed(2) + '× faster' : (1 / ratio).toFixed(2) + '× slower'
}

function pad (value, width, align = 'left') {
  const text = String(value)
  if (text.length >= width) return text
  return align === 'right' ? text.padStart(width) : text.padEnd(width)
}

function rowsFor (results, scenario, mode) {
  return results
    .filter(result => result.scenario === scenario && result.mode === mode)
    .sort((a, b) => {
      if (a.error && b.error) return a.engine.localeCompare(b.engine)
      if (a.error) return 1
      if (b.error) return -1
      return b.hz - a.hz
    })
}

// the ratio to teddy varies a lot by scenario, so the overall figure is a geometric mean of the per scenario ratios: an arithmetic mean of ratios would let the one scenario with the widest spread decide the answer
function summarize (results, mode) {
  const byEngine = new Map()
  const teddyByScenario = new Map()
  for (const result of results) {
    if (result.mode !== mode || result.error) continue
    if (result.engine === 'teddy') teddyByScenario.set(result.scenario, result.hz)
  }
  for (const result of results) {
    if (result.mode !== mode || result.error) continue
    const teddyHz = teddyByScenario.get(result.scenario)
    if (!teddyHz) continue
    if (!byEngine.has(result.engine)) byEngine.set(result.engine, [])
    byEngine.get(result.engine).push(result.hz / teddyHz)
  }
  return [...byEngine.entries()]
    .map(([engine, ratios]) => ({
      engine,
      scenarios: ratios.length,
      ratio: Math.exp(ratios.reduce((sum, ratio) => sum + Math.log(ratio), 0) / ratios.length)
    }))
    .sort((a, b) => b.ratio - a.ratio)
}

export function environment () {
  const cpus = os.cpus()
  return {
    node: process.version,
    v8: process.versions.v8,
    platform: `${os.type()} ${os.release()} ${process.arch}`,
    cpu: cpus[0]?.model?.trim() ?? 'unknown',
    cores: cpus.length,
    memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB'
  }
}

export function printConsoleReport (results, options) {
  const env = environment()
  const columns = [
    { key: 'engine', label: 'engine', width: 17 },
    { key: 'version', label: 'version', width: 10 },
    { key: 'hz', label: 'renders/sec', width: 12, align: 'right' },
    { key: 'mean', label: 'mean ms', width: 9, align: 'right' },
    { key: 'rme', label: '± %', width: 6, align: 'right' },
    { key: 'relative', label: 'vs teddy', width: 13 },
    { key: 'bytes', label: 'output', width: 9, align: 'right' }
  ]

  console.log()
  console.log('templating engine benchmarks')
  console.log(`  node ${env.node} (v8 ${env.v8}) on ${env.platform}`)
  console.log(`  ${env.cpu}, ${env.cores} cores, ${env.memory}`)
  console.log(`  ${options.time} ms per measurement, ${options.isolate ? 'one child process per measurement' : 'all measurements in this process'}`)

  for (const mode of options.modes) {
    console.log()
    console.log('=== ' + modeLabels[mode] + ' ===')
    for (const scenario of scenarios) {
      const rows = rowsFor(results, scenario.id, mode)
      if (!rows.length) continue
      const teddy = rows.find(row => row.engine === 'teddy' && !row.error)

      console.log()
      console.log(`${scenario.label}: ${scenario.description}`)
      console.log('  ' + columns.map(c => pad(c.label, c.width, c.align)).join(' '))
      console.log('  ' + columns.map(c => '-'.repeat(c.width)).join(' '))
      for (const row of rows) {
        const engine = engineById.get(row.engine)
        const cells = row.error
          ? [engine?.name ?? row.engine, engine?.version ?? '', 'failed', '', '', row.error.slice(0, 13), '']
          : [
              engine?.name ?? row.engine,
              engine?.version ?? '',
              formatHz(row.hz),
              formatMs(row.mean),
              row.rme.toFixed(1),
              formatRelative(row.hz, teddy?.hz),
              row.bytes.toLocaleString('en-US')
            ]
        console.log('  ' + columns.map((c, i) => pad(cells[i], c.width, c.align)).join(' '))
      }
    }
  }

  // as wide as the names it has to hold rather than a guess: "PHP (node-php-runner)" is wider than this was fixed at, and shifted every column on its own row
  const summaryWidth = Math.max(17, ...results.map(row => (engineById.get(row.engine)?.name ?? row.engine).length))

  for (const mode of options.modes) {
    const summary = summarize(results, mode)
    if (summary.length < 2) continue
    console.log()
    console.log(`=== ${mode}: across every scenario measured (geometric mean) ===`)
    console.log()
    console.log('  ' + pad('engine', summaryWidth) + ' ' + pad('scenarios', 10, 'right') + ' vs teddy')
    console.log('  ' + '-'.repeat(summaryWidth) + ' ' + '-'.repeat(10) + ' ' + '-'.repeat(13))
    for (const row of summary) {
      const engine = engineById.get(row.engine)
      console.log('  ' + pad(engine?.name ?? row.engine, summaryWidth) + ' ' + pad(row.scenarios, 10, 'right') + ' ' + formatRelative(row.ratio, 1))
    }
  }

  const notes = engines.filter(engine => engine.notes && results.some(r => r.engine === engine.id))
  if (notes.length) {
    console.log()
    console.log('notes')
    for (const engine of notes) console.log(`  ${engine.name}: ${engine.notes}`)
  }
  console.log()
}

// what changed since a baseline, printed and not written: BENCHMARKS.md is a report of one run, and a comparison with a run that only happened on one person's machine does not belong in it
export function printComparison (comparison, engineName = id => engineById.get(id)?.name ?? id) {
  const { node, browser, versions, teddy, rme, thresholds } = comparison
  const moved = [...node, ...browser]

  console.log(`=== compared with the baseline taken ${comparison.generated} ===`)
  console.log()

  // a run taken while the machine was doing something else is not one to draw a conclusion from, and the error bars say so even though they are no use for the comparison itself
  if (rme?.was !== null && rme?.now !== null && rme.now > 2 && rme.now > rme.was * 2) {
    console.log(`  this run's measurements are spread ${(rme.now / rme.was).toFixed(0)} times wider than the baseline's, at ${rme.now.toFixed(1)}% against ${rme.was.toFixed(1)}%, which is what a machine doing something else at the same time looks like`)
    console.log('  the ratios below hold up better than raw timings do, but take anything close to the threshold with that in mind')
    console.log()
  }

  if (teddy !== null && Math.abs(teddy) >= thresholds.aggregate) {
    console.log(`  teddy itself renders ${teddy > 0 ? 'faster' : 'slower'} than it did by ${Math.abs(teddy).toFixed(1)}%, which moves every ratio below at once`)
    console.log()
  }

  if (!moved.length) {
    console.log(`  nothing moved by more than ${thresholds.aggregate}% against teddy`)
    console.log()
  } else {
    const width = Math.max(10, ...moved.map(row => engineName(row.engine).length))
    console.log('  ' + pad('engine', width) + ' ' + pad('measurement', 18) + ' ' + pad('vs teddy', 10) + ' ' + pad('over', 11) + ' version')
    console.log('  ' + '-'.repeat(width) + ' ' + '-'.repeat(18) + ' ' + '-'.repeat(10) + ' ' + '-'.repeat(11) + ' ' + '-'.repeat(24))
    for (const row of moved) {
      const version = versions.find(entry => entry.engine === row.engine)
      const note = version ? `${version.before} -> ${version.now}` : 'unchanged'
      const change = `${row.aggregate > 0 ? '+' : ''}${row.aggregate.toFixed(1)}%`
      console.log('  ' + pad(engineName(row.engine), width) + ' ' + pad(row.mode, 18) + ' ' + pad(change, 10) + ' ' + pad(`${row.over} scenario${row.over === 1 ? '' : 's'}`, 11) + ' ' + note)
      for (const scenario of row.scenarios) {
        console.log('  ' + ' '.repeat(width) + `   ${scenario.scenario}: ${scenario.change > 0 ? '+' : ''}${scenario.change.toFixed(0)}%`)
      }
    }
    console.log()
    console.log(`  a move of less than ${thresholds.aggregate}% is not reported, and neither is one scenario of an engine unless it moved by ${thresholds.scenario}%: running this suite twice unchanged moves a single measurement by up to 17%`)
    console.log()
    const unexplained = moved.filter(row => !versions.some(entry => entry.engine === row.engine))
    if (unexplained.length) {
      console.log(`  nothing explains ${[...new Set(unexplained.map(row => engineName(row.engine)))].join(', ')}: ${unexplained.length === 1 ? 'that engine is' : 'those engines are'} the same version as in the baseline`)
      console.log()
    }
  }
}

export function markdownReport (results, options, browserOutcomes = []) {
  const env = environment()
  const lines = []
  lines.push('# Templating engine benchmarks')
  lines.push('')
  lines.push('These benchmarks were ran on the following hardware:')
  lines.push('')
  lines.push('| | |')
  lines.push('| --- | --- |')
  lines.push(`| Node | ${env.node} (V8 ${env.v8}) |`)
  lines.push(`| Platform | ${env.platform} |`)
  lines.push(`| CPU | ${env.cpu}, ${env.cores} cores |`)
  lines.push(`| Memory | ${env.memory} |`)
  lines.push(`| Time per measurement | ${options.time} ms |`)
  lines.push(`| Process isolation | ${options.isolate ? 'one child process per measurement' : 'off'} |`)
  lines.push('')

  // every overall table together at the top, so the document opens with the answer and the per scenario detail is there for anyone who wants to know how it was arrived at
  const overallLines = []
  for (const mode of options.modes) {
    const summary = summarize(results, mode)
    if (summary.length < 2) continue
    overallLines.push(`### In Node, ${mode}`)
    overallLines.push('')
    overallLines.push('Geometric mean of the per scenario ratios to Teddy.')
    overallLines.push('')
    overallLines.push('| Engine | Scenarios | vs Teddy |')
    overallLines.push('| --- | --: | --- |')
    for (const row of summary) {
      const engine = engineById.get(row.engine)
      overallLines.push(`| ${engine?.name ?? row.engine} | ${row.scenarios} | ${formatRelative(row.ratio, 1)} |`)
    }
    overallLines.push('')
  }

  const browserSectionList = []
  const mergedCached = mergeCached(browserOutcomes || [])
  if (mergedCached && mergedCached.results.length) browserSectionList.push(browserSections(mergedCached))
  const coldBrowser = (browserOutcomes || []).find(outcome => outcome.mode === 'cold')
  if (coldBrowser && coldBrowser.results.length) browserSectionList.push(browserSections(coldBrowser))
  for (const section of browserSectionList) overallLines.push(...section.summary)

  if (overallLines.length) {
    lines.push('## Overall')
    lines.push('')
    lines.push(...overallLines)
  }

  for (const mode of options.modes) {
    lines.push('## ' + modeLabels[mode])
    lines.push('')
    for (const scenario of scenarios) {
      const rows = rowsFor(results, scenario.id, mode)
      if (!rows.length) continue
      const teddy = rows.find(row => row.engine === 'teddy' && !row.error)
      lines.push(`### ${scenario.label}`)
      lines.push('')
      lines.push(scenario.description + '. Measures ' + scenario.measures + '.')
      lines.push('')
      lines.push('| Engine | Version | Renders/sec | Mean ms | ± % | vs Teddy | Output bytes |')
      lines.push('| --- | --- | --: | --: | --: | --- | --: |')
      for (const row of rows) {
        const engine = engineById.get(row.engine)
        if (row.error) {
          lines.push(`| ${engine?.name ?? row.engine} | ${engine?.version ?? ''} | failed | | | ${row.error} | |`)
          continue
        }
        lines.push([
          '',
          engine?.name ?? row.engine,
          engine?.version ?? '',
          formatHz(row.hz),
          formatMs(row.mean),
          row.rme.toFixed(1),
          formatRelative(row.hz, teddy?.hz),
          row.bytes.toLocaleString('en-US'),
          ''
        ].join(' | ').trim())
      }
      lines.push('')
    }
  }

  for (const section of browserSectionList) lines.push(...section.detail)

  const notes = engines.filter(engine => engine.notes && results.some(r => r.engine === engine.id))
  if (notes.length) {
    lines.push('## Notes on individual engines')
    lines.push('')
    for (const engine of notes) lines.push(`- **${engine.name}**: ${engine.notes}`)
    lines.push('')
  }

  return lines.join('\n')
}

// what the ratios in a browser table are against. where teddy appears twice, the emitted one is the reference: it is what teddy does when an app has a build step, and it is the like for like against every other engine in the table, all of which are also running a compiled function
function browserReference (rows, scenario) {
  const matches = scenario === undefined ? rows : rows.filter(row => row.scenario === scenario)
  return matches.find(row => row.engine === 'teddy:precompiled') ?? matches.find(row => row.engine === 'teddy')
}

// the two cached browser runs are one measurement, not two: neither times compiling, so an engine that turns its template into a function once lands in the same place in both. they are merged into one table, and each row says where its render function came from
//
// teddy is the one engine that appears twice, because for it the answer changes the number: its browser build cannot write javascript at runtime, so compiled in the page means walking a node tree. both are supported ways to run it, so both are shown
function mergeCached (outcomes) {
  const inPage = outcomes.find(outcome => outcome.mode === 'cached')
  const ahead = outcomes.find(outcome => outcome.mode === 'precompiled')
  if (!inPage && !ahead) return null
  if (!ahead) return { ...inPage, results: inPage.results.map(row => ({ ...row, via: 'in page' })) }
  if (!inPage) return { ...ahead, results: ahead.results.map(row => ({ ...row, via: 'ahead of time' })) }

  const results = inPage.results.map(row => (
    row.engine === 'teddy'
      ? { ...row, label: 'Teddy (tree walk)', via: 'in page' }
      : { ...row, via: 'in page' }
  ))
  for (const row of ahead.results) {
    if (row.engine === 'teddy') {
      results.push({ ...row, engine: 'teddy:precompiled', label: 'Teddy (emitted js)', via: 'ahead of time' })
    } else if (!inPage.results.some(seen => seen.engine === row.engine && seen.scenario === row.scenario)) {
      // an engine with no way to compile in a browser at all is only reachable this way
      results.push({ ...row, via: 'ahead of time' })
    }
  }

  // an engine is only missing from the merged table if neither route was open to it: being able to compile in a page is enough, and so is being able to be compiled ahead of time
  const aheadSkipped = new Map(ahead.skipped.map(entry => [entry.engine, entry]))
  const skipped = inPage.skipped
    .filter(entry => aheadSkipped.has(entry.engine))
    // the reason a precompiled run gives is the more specific one for an engine that is absent from both
    .map(entry => aheadSkipped.get(entry.engine) ?? entry)

  return { browser: inPage.browser, mode: 'cached', results, mismatches: [...inPage.mismatches, ...ahead.mismatches], skipped }
}

// the browser run as markdown, kept in its own section because it is not the same measurement as the node one: a different set of engines can run, and every template is handed over up front
function browserSections (outcome) {
  const { results, mismatches, skipped, browser, mode } = outcome
  const scenarioIds = [...new Set(results.map(result => result.scenario))]
  const byId = new Map(results.map(row => [row.engine, row.label]))
  const name = id => byId.get(id) ?? engineById.get(id)?.name ?? id
  const lines = []
  const cold = mode === 'cold'
  const absent = CANNOT_RUN
  const shows = results.some(row => row.via)
  lines.push(cold ? `## In a browser, cold (${browser})` : `## In a browser, cached (${browser})`)
  lines.push('')
  if (cold) {
    lines.push("The same scenarios in a browser, timing the compile and one render together, with whatever the engine kept from last time dropped first. This is the browser's answer to the cold mode above: what the first render of a template costs. Only engines that can compile in a browser at all appear, which is what leaves Pug and Marko out of it.")
  } else {
    lines.push('The same scenarios rendered inside a real browser rather than in Node, timing rendering only. A browser has no filesystem, so every template and partial is handed to the engine up front.')
    lines.push('')
    lines.push('**Teddy is listed twice, and it is the only engine here that is.** Every other engine in this table renders one way: it turns a template into a JavaScript function and calls it. Teddy can do that, and it can also render by walking the node tree its compiler built, without writing any JavaScript at all. Those are two different renderers, not two ways of arriving at the same one, which is why the route changes the number for Teddy and for nobody else. Both rows are real ways to run it, and which one an app gets depends on whether it has a build step:')
    lines.push('')
    lines.push('- **Teddy (emitted js)** is the emitted JavaScript, written out by `teddy.precompile()` in Node and loaded as a script. Faster, and it needs a build step and a known set of templates.')
    lines.push('- **Teddy (tree walk)** is what a page gets with no build step at all: drop in the browser build and render. It is also the only thing that can render a template that does not exist until runtime, which is what a live editor or a template fetched from a server needs.')
    lines.push('')
    lines.push('Ratios are against **Teddy (emitted js)**, since that is the like for like against the other engines here, all of which are running a compiled function too.')
  }
  lines.push('')

  for (const scenario of scenarioIds) {
    const rows = results.filter(result => result.scenario === scenario).sort((a, b) => b.hz - a.hz)
    const reference = browserReference(rows)
    const meta = scenarioById.get(scenario)
    lines.push(`### ${meta ? meta.label : scenario}`)
    lines.push('')
    if (meta) {
      lines.push(`${meta.description}. Measures ${meta.measures}.`)
      lines.push('')
    }
    lines.push(shows ? '| Engine | Compiled | Renders/sec | Mean ms | vs Teddy | Output bytes |' : '| Engine | Renders/sec | Mean ms | vs Teddy | Output bytes |')
    lines.push(shows ? '| --- | --- | --: | --: | --- | --: |' : '| --- | --: | --: | --- | --: |')
    for (const row of rows) {
      const via = shows ? ` ${row.via ?? ''} |` : ''
      lines.push(`| ${name(row.engine)} |${via} ${formatHz(row.hz)} | ${formatMs(row.mean)} | ${formatRelative(row.hz, reference?.hz)} | ${row.bytes.toLocaleString('en-US')} |`)
    }
    // an engine a browser cannot run is still listed, so that the table says what it does not hold rather than leaving it to be noticed. why each one cannot is under the tables
    for (const entry of skipped) {
      lines.push(shows ? `| ${name(entry.engine)} | ${BLANK} | ${BLANK} | ${BLANK} | ${entry.short ?? absent} | ${BLANK} |` : `| ${name(entry.engine)} | ${BLANK} | ${BLANK} | ${entry.short ?? absent} | ${BLANK} |`)
    }
    lines.push('')
  }

  const geometric = values => Math.exp(values.reduce((total, value) => total + Math.log(value), 0) / values.length)
  const overall = [...new Set(results.map(result => result.engine))].map(id => {
    const ratios = scenarioIds.map(scenario => {
      const mine = results.find(r => r.engine === id && r.scenario === scenario)
      const reference = browserReference(results, scenario)
      return mine && reference ? reference.mean / mine.mean : null
    }).filter(ratio => ratio !== null)
    return { id, ratio: geometric(ratios), scenarios: ratios.length }
  }).sort((a, b) => b.ratio - a.ratio)

  // the overall table is kept apart from the rest so it can be gathered with the others at the top
  const summary = []
  summary.push(cold ? '### In a browser, cold' : '### In a browser, cached')
  summary.push('')
  if (shows && !cold) {
    // where teddy has two rows, the caption has to say which one the ratios are against, and why there are two
    summary.push(`Ratios to **Teddy (emitted js)**. Teddy is listed twice because it is the only engine here that renders two different ways: from emitted JavaScript, or by walking a node tree with no build step. [The detail below](#in-a-browser-cached-${browser}) says more about both.`)
  } else summary.push('Geometric mean of the per scenario ratios to Teddy.')
  summary.push('')
  summary.push('| Engine | Scenarios | vs Teddy |')
  summary.push('| --- | --: | --- |')
  for (const entry of overall) summary.push(`| ${name(entry.id)} | ${entry.scenarios} | ${formatRelative(entry.ratio, 1)} |`)
  for (const entry of skipped) summary.push(`| ${name(entry.engine)} | 0 | ${entry.short ?? absent} |`)
  summary.push('')

  if (mismatches.length) {
    lines.push('Not measured in the browser:')
    lines.push('')
    for (const problem of mismatches) lines.push(`- **${name(problem.engine)}** / ${problem.scenario}: ${problem.error || 'output did not match Teddy'}`)
    lines.push('')
  }

  if (skipped.length) {
    lines.push('Engines with nothing a browser can run:')
    lines.push('')
    for (const entry of skipped) lines.push(`- **${name(entry.engine)}**: ${entry.why}`)
    lines.push('')
  }

  return { browser, summary, detail: lines }
}

export function jsonReport (results, options, verification, browserOutcomes = []) {
  return {
    browser: browserOutcomes,
    generated: new Date().toISOString(),
    environment: environment(),
    options: {
      time: options.time,
      warmupTime: options.warmupTime,
      modes: options.modes,
      isolate: options.isolate,
      modelOptions: options.modelOptions
    },
    engines: engines
      .filter(engine => results.some(result => result.engine === engine.id))
      .map(({ id, name, version, url, ext, notes }) => ({ id, name, version, url, ext, notes })),
    scenarios: scenarios
      .filter(scenario => results.some(result => result.scenario === scenario.id))
      .map(({ id, label, description, measures }) => ({ id, label, description, measures })),
    verification,
    results
  }
}

export { scenarioById, engineById }

// what a browser run produced
//
// reported on its own rather than beside the node numbers: a different set of engines can run here, and every template has to be handed over up front, so the two are not the same measurement
export function printBrowserReports (outcomes) {
  const merged = mergeCached(outcomes)
  if (merged) printBrowserReport(merged)
  const cold = outcomes.find(outcome => outcome.mode === 'cold')
  if (cold) printBrowserReport(cold)
}

function printBrowserReport (outcome) {
  const { results, mismatches, skipped, browser } = outcome
  const scenarioIds = [...new Set(results.map(result => result.scenario))]
  // a row may carry its own label, because one engine can appear twice
  const byId = new Map(results.map(row => [row.engine, row.label]))
  const name = id => byId.get(id) ?? engineById.get(id)?.name ?? id
  const shows = results.some(row => row.via)
  const viaWidth = shows ? 16 : 0

  // the engine column is only as wide as the names it has to hold: fixing it at a guess left the widest of them pushing every column on its own row out of line
  const absent = CANNOT_RUN
  const shown = [...results.map(result => name(result.engine)), ...skipped.map(entry => name(entry.engine))]
  const engineWidth = Math.max(18, ...shown.map(label => label.length + 1))

  console.log(outcome.mode === 'cold' ? `\nmeasured in ${browser}, timing the compile and one render together\n` : `\nmeasured in ${browser}, timing rendering only\n`)

  for (const scenario of scenarioIds) {
    const rows = results.filter(result => result.scenario === scenario).sort((a, b) => b.hz - a.hz)
    const teddy = browserReference(rows)
    const meta = scenarioById.get(scenario)
    console.log(`${meta ? meta.label : scenario}${meta ? ': ' + meta.description : ''}`)
    console.log('  ' + pad('engine', engineWidth) + (shows ? pad('compiled', viaWidth) : '') + pad('renders/sec', 14, 'right') + pad('mean ms', 10, 'right') + '  ' + pad('vs teddy', 24) + pad('output', 8, 'right'))
    console.log('  ' + '-'.repeat(engineWidth - 1) + ' ' + (shows ? '-'.repeat(viaWidth - 1) + ' ' : '') + '-'.repeat(13) + ' ' + '-'.repeat(9) + '  ' + '-'.repeat(23) + ' ' + '-'.repeat(7))
    for (const row of rows) {
      console.log('  ' + pad(name(row.engine), engineWidth) + (shows ? pad(row.via ?? '', viaWidth) : '') + pad(formatHz(row.hz), 14, 'right') + pad(formatMs(row.mean), 10, 'right') + '  ' + pad(formatRelative(row.hz, teddy?.hz), 24) + pad(row.bytes.toLocaleString('en-US'), 8, 'right'))
    }
    // an engine a browser cannot run is still listed, so that the table says what it does not hold rather than leaving it to be noticed. why each one cannot is under the tables
    for (const entry of skipped) {
      console.log('  ' + pad(name(entry.engine), engineWidth) + (shows ? pad(BLANK, viaWidth) : '') + pad(BLANK, 14, 'right') + pad(BLANK, 10, 'right') + '  ' + pad(entry.short ?? absent, 24) + pad(BLANK, 8, 'right'))
    }
    console.log()
  }

  const geometric = values => Math.exp(values.reduce((total, value) => total + Math.log(value), 0) / values.length)
  const overall = [...new Set(results.map(result => result.engine))].map(id => {
    const ratios = scenarioIds.map(scenario => {
      const mine = results.find(r => r.engine === id && r.scenario === scenario)
      const reference = browserReference(results, scenario)
      return mine && reference ? reference.mean / mine.mean : null
    }).filter(ratio => ratio !== null)
    return { id, ratio: geometric(ratios), scenarios: ratios.length }
  }).sort((a, b) => b.ratio - a.ratio)

  console.log(`=== ${browser}, ${outcome.mode === 'cold' ? 'cold' : 'cached'}: across every scenario measured (geometric mean) ===\n`)
  console.log('  ' + pad('engine', engineWidth) + pad('scenarios', 11, 'right') + ' vs teddy')
  console.log('  ' + '-'.repeat(engineWidth - 1) + ' ' + '-'.repeat(10) + ' ' + '-'.repeat(23))
  for (const entry of overall) {
    console.log('  ' + pad(name(entry.id), engineWidth) + pad(entry.scenarios, 11, 'right') + ' ' + formatRelative(entry.ratio, 1))
  }
  for (const entry of skipped) {
    console.log('  ' + pad(name(entry.engine), engineWidth) + pad(0, 11, 'right') + ' ' + (entry.short ?? absent))
  }

  if (mismatches.length) {
    console.log('\nnot measured')
    for (const problem of mismatches) console.log(`  ${problem.scenario} / ${name(problem.engine)}: ${problem.error || 'output did not match teddy'}`)
  }

  if (skipped.length) {
    console.log('\nengines with nothing a browser can run')
    for (const entry of skipped) console.log(`  ${name(entry.engine)}: ${entry.why}`)
  }
  console.log()
}
