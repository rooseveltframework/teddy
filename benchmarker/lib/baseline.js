import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { environment } from './report.js'

const benchmarkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const BASELINE = 'BASELINE.json'

// a baseline is only ever compared against a run of the same suite in the same place, so what it stores is the measurements themselves rather than a summary of them, and enough about where they were taken to refuse a comparison that would not mean anything
//
// it is not committed, and it is not portable. the same engines measured on the same machine under three node majors came out as much as 36% apart in the figure this comparison is built on, which is an order of magnitude more than a dependency bump usually moves anything. a baseline someone else took would report their machine as a regression
export function saveBaseline (file, { results, options, browserOutcomes, engines }) {
  const node = {}
  for (const row of results) {
    if (row.error) continue
    node[`${row.engine}/${row.scenario}/${row.mode}`] = { hz: row.hz, rme: row.rme, bytes: row.bytes }
  }

  const browser = {}
  for (const outcome of browserOutcomes ?? []) {
    for (const row of outcome.results ?? []) {
      if (row.error) continue
      browser[`${outcome.browser}/${outcome.mode}/${row.engine}/${row.scenario}`] = { hz: row.hz }
    }
  }

  const baseline = {
    generated: new Date().toISOString(),
    environment: environment(),
    // a measurement taken for a different length of time, or against a different sized model, is not the same measurement
    options: {
      time: options.time,
      warmupTime: options.warmupTime,
      iterations: options.iterations,
      isolate: options.isolate,
      modelOptions: options.modelOptions
    },
    engines: Object.fromEntries(engines.map(engine => [engine.id, engine.version])),
    node,
    browser
  }

  fs.writeFileSync(file, JSON.stringify(baseline, null, 2) + '\n')
  return baseline
}

export function loadBaseline (file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    return null
  }
}

export function baselinePath (option) {
  return path.resolve(benchmarkRoot, option ?? BASELINE)
}

// why this baseline cannot be compared against this run
//
// the environment has to match exactly rather than approximately: a node minor carries a v8 that can move a figure further than anything being looked for here, so there is no version of "close enough" worth the false alarm it would raise
export function mismatches (baseline, options) {
  const now = environment()
  const was = baseline.environment ?? {}
  const out = []
  if (was.node !== now.node) out.push(`node ${was.node} then, ${now.node} now`)
  if (was.v8 !== now.v8) out.push(`v8 ${was.v8} then, ${now.v8} now`)
  if (was.platform !== now.platform) out.push(`${was.platform} then, ${now.platform} now`)
  if (was.cpu !== now.cpu) out.push(`${was.cpu} then, ${now.cpu} now`)
  if (was.cores !== now.cores) out.push(`${was.cores} cores then, ${now.cores} now`)

  const opts = baseline.options ?? {}
  if (opts.time !== options.time) out.push(`${opts.time} ms per measurement then, ${options.time} ms now`)
  if (opts.isolate !== options.isolate) out.push(`process isolation was ${opts.isolate ? 'on' : 'off'} then, ${options.isolate ? 'on' : 'off'} now`)
  if (JSON.stringify(opts.modelOptions ?? {}) !== JSON.stringify(options.modelOptions ?? {})) out.push('the model was a different size')
  return out
}

// how far apart two runs are, expressed the way the report expresses everything else: as a ratio to teddy, geometric mean across the scenarios both runs measured
//
// the thresholds are not guesses. running this suite twice on one machine with nothing changed moves a single measurement by up to 17%, while moving this aggregate by under 2%, so the aggregate is where a real change of a few percent is visible and a single scenario is only worth mentioning when it moves a great deal. the per measurement error bars the suite prints are no help here at all: they describe one measurement's own spread, and understate what changes between runs by around eighty times
const AGGREGATE_THRESHOLD = 5
const SCENARIO_THRESHOLD = 25

function geometricMean (values) {
  return Math.exp(values.reduce((sum, value) => sum + Math.log(value), 0) / values.length)
}

function ratios (table, key) {
  const out = new Map()
  for (const [id, row] of Object.entries(table)) {
    const parts = id.split('/')
    const teddy = table[key(parts)]
    if (!teddy || !row.hz) continue
    out.set(id, row.hz / teddy.hz)
  }
  return out
}

function compareTables (was, now, key, label) {
  const wasRatios = ratios(was, key)
  const nowRatios = ratios(now, key)
  const byEngine = new Map()

  for (const [id, ratio] of nowRatios) {
    if (!wasRatios.has(id)) continue
    const parts = id.split('/')
    const engine = label === 'node' ? parts[0] : parts[2]
    const mode = label === 'node' ? parts[2] : `${parts[0]} ${parts[1]}`
    // the bucket carries what it was keyed on, so that a mode with a space in it, as every browser mode has, does not have to survive being split back apart
    const bucket = `${engine}/${mode}`
    if (!byEngine.has(bucket)) byEngine.set(bucket, { engine, mode, rows: [] })
    byEngine.get(bucket).rows.push({ scenario: parts[label === 'node' ? 1 : 3], change: ratio / wasRatios.get(id) })
  }

  const changed = []
  for (const { engine, mode, rows } of byEngine.values()) {
    if (engine === 'teddy') continue
    const aggregate = (geometricMean(rows.map(row => row.change)) - 1) * 100
    if (Math.abs(aggregate) < AGGREGATE_THRESHOLD) continue
    const scenarios = rows
      .map(row => ({ scenario: row.scenario, change: (row.change - 1) * 100 }))
      .filter(row => Math.abs(row.change) >= SCENARIO_THRESHOLD)
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    changed.push({ engine, mode, aggregate, scenarios, over: rows.length })
  }
  return changed.sort((a, b) => Math.abs(b.aggregate) - Math.abs(a.aggregate))
}

// whether the machine was busier during one run than the other
//
// a measurement's own error bar is no use for comparing two runs, but it is a good detector of this: with the machine to itself the suite reports around half a percent, and with every core busy it reports ten times that. the ratios a comparison is built on survive a busy machine better than the raw numbers do, since everything slows together, but not indefinitely
function medianRme (table) {
  const values = Object.values(table).map(row => row.rme).filter(rme => typeof rme === 'number').sort((a, b) => a - b)
  return values.length ? values[Math.floor(values.length / 2)] : null
}

// whether teddy itself moved, which changes every ratio at once and is the first thing to know when a lot of them moved together
function teddyDrift (was, now) {
  const changes = []
  for (const [id, row] of Object.entries(now)) {
    const parts = id.split('/')
    if (parts[0] !== 'teddy') continue
    const before = was[id]
    if (before && before.hz && row.hz) changes.push(row.hz / before.hz)
  }
  return changes.length ? (geometricMean(changes) - 1) * 100 : null
}

export function compare (baseline, { results, browserOutcomes, engines }) {
  const node = {}
  for (const row of results) {
    if (!row.error) node[`${row.engine}/${row.scenario}/${row.mode}`] = { hz: row.hz, rme: row.rme }
  }
  const browser = {}
  for (const outcome of browserOutcomes ?? []) {
    for (const row of outcome.results ?? []) {
      if (!row.error) browser[`${outcome.browser}/${outcome.mode}/${row.engine}/${row.scenario}`] = { hz: row.hz }
    }
  }

  const versions = []
  for (const engine of engines) {
    const before = baseline.engines?.[engine.id]
    if (before && before !== engine.version) versions.push({ engine: engine.id, before, now: engine.version })
  }

  return {
    generated: baseline.generated,
    teddy: teddyDrift(baseline.node ?? {}, node),
    node: compareTables(baseline.node ?? {}, node, parts => `teddy/${parts[1]}/${parts[2]}`, 'node'),
    browser: compareTables(baseline.browser ?? {}, browser, parts => `${parts[0]}/${parts[1]}/teddy/${parts[3]}`, 'browser'),
    versions,
    rme: { was: medianRme(baseline.node ?? {}), now: medianRme(node) },
    thresholds: { aggregate: AGGREGATE_THRESHOLD, scenario: SCENARIO_THRESHOLD }
  }
}
