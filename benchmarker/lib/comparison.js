// what compare.js reports: how fast teddy rendered each scenario at one version and at another, and whether the difference is bigger than the runs disagree with themselves
//
// each side is run several times, and each figure is the median of its runs. the noise is how far apart one side's runs came out, as a share of their median, taking whichever side was noisier: two runs of the same code on the same machine differ, by a couple of percent for a steady measurement and by twenty or more for a jumpy one, so a difference smaller than that says nothing about the code. neither does one under 3%, however steady the runs. the measurement's own error bar is no use for this: it describes one run's spread, and understates how far apart separate runs land many times over

const median = values => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}
const geometricMean = values => Math.exp(values.reduce((sum, value) => sum + Math.log(value), 0) / values.length)
const spread = values => values.length > 1 ? (Math.max(...values) - Math.min(...values)) / median(values) : null

// the rows to report, from the baseline files each run wrote: { pass, scenario, before, after, change, noise, verdict }, change and noise as percentages
export function analyze (baseRuns, headRuns) {
  const measurements = new Map() // pass/scenario => { pass, scenario, before: [], after: [] }
  const collect = (runs, side) => {
    for (const run of runs) {
      for (const [key, row] of Object.entries(run.node ?? {})) {
        const [engine, scenario, mode] = key.split('/')
        if (engine === 'teddy' && row.hz) add(`node ${mode}`, scenario, side, row.hz)
      }
      for (const [key, row] of Object.entries(run.browser ?? {})) {
        const [browser, mode, engine, scenario] = key.split('/')
        if (engine === 'teddy' && row.hz) add(`${browser} ${mode}`, scenario, side, row.hz)
      }
    }
  }
  const add = (pass, scenario, side, hz) => {
    const key = `${pass}/${scenario}`
    if (!measurements.has(key)) measurements.set(key, { pass, scenario, before: [], after: [] })
    measurements.get(key)[side].push(hz)
  }
  collect(baseRuns, 'before')
  collect(headRuns, 'after')

  const rows = []
  for (const { pass, scenario, before, after } of measurements.values()) {
    if (!before.length || !after.length) continue
    const was = median(before)
    const now = median(after)
    const noises = [spread(before), spread(after)].filter(noise => noise !== null)
    const noise = noises.length ? Math.max(...noises) * 100 : null
    const change = (now / was - 1) * 100
    rows.push({ pass, scenario, before: was, after: now, change, noise, verdict: verdict(change, noise) })
  }

  // a pass as a whole: the geometric mean of its scenarios' changes, which treats a scenario that renders a thousand times a second the same as one that renders a million
  //
  // its noise is worked out the same way as a scenario's, from how far apart the runs landed, but for the runs as a whole: each run is scored across every scenario at once, and the scores' spread is the noise. one scenario's jitter in one run mostly cancels out against the others', so a pass as a whole is much steadier than any scenario in it, and a change too small to see in one scenario can be clear across all of them
  const passes = []
  for (const pass of [...new Set(rows.map(row => row.pass))].sort(passOrder)) {
    const group = rows.filter(row => row.pass === pass).sort((a, b) => a.scenario.localeCompare(b.scenario))
    const change = (geometricMean(group.map(row => row.after / row.before)) - 1) * 100
    const noises = ['before', 'after'].map(side => spread(runScores(group.map(row => measurements.get(`${pass}/${row.scenario}`)[side])))).filter(noise => noise !== null)
    const noise = noises.length ? Math.max(...noises) * 100 : null
    passes.push({ pass, rows: group, change, noise, verdict: verdict(change, noise) })
  }
  return passes
}

// each run's score across a pass's scenarios: how fast it was in each, relative to that scenario's median, combined by geometric mean. a run that was a few percent fast everywhere scores a few percent over one
function runScores (scenarioRuns) {
  const runs = Math.min(...scenarioRuns.map(values => values.length))
  const scores = []
  for (let run = 0; run < runs; run++) scores.push(geometricMean(scenarioRuns.map(values => values[run] / median(values))))
  return scores
}

// a change this small isn't worth calling one, however steady the runs were
const SMALLEST_CHANGE = 3

function verdict (change, noise) {
  if (noise === null) return 'one run, so no noise estimate'
  if (Math.abs(change) <= Math.max(noise, SMALLEST_CHANGE)) return 'no clear change'
  return change > 0 ? 'faster' : 'slower'
}

// node first, then each browser's passes in the order they mean the most: cached, the usual case, then cold, then precompiled
const PASS_ORDER = ['cached', 'cold', 'precompiled']
function passOrder (a, b) {
  const [whereA, modeA] = a.split(' ')
  const [whereB, modeB] = b.split(' ')
  if (whereA !== whereB) return whereA === 'node' ? -1 : whereB === 'node' ? 1 : whereA.localeCompare(whereB)
  return PASS_ORDER.indexOf(modeA) - PASS_ORDER.indexOf(modeB)
}

const PASS_NAMES = {
  cached: 'rendering a template already compiled',
  cold: 'compiling and rendering a template each time',
  precompiled: 'rendering a template precompiled in node'
}
export const passTitle = pass => {
  const [where, mode] = pass.split(' ')
  return `${where === 'node' ? 'Node' : where[0].toUpperCase() + where.slice(1)}, ${mode}: ${PASS_NAMES[mode] ?? mode}`
}

// how much faster or slower, in words: a change of more than half again as fast reads best as a multiple, and anything smaller as a percentage
function amount (change) {
  if (change >= 50) return `about ${(1 + change / 100).toFixed(1)}× as fast`
  if (change <= -34) return `about ${(1 / (1 + change / 100)).toFixed(1)}× as slow`
  return `about ${Math.round(Math.abs(change))}% ${change > 0 ? 'faster' : 'slower'}`
}

const SUMMARY_SUBJECTS = {
  cached: 'Rendering a compiled template',
  cold: 'Compiling and rendering a template',
  precompiled: 'Rendering a precompiled template'
}

// the comparison in a sentence per pass, for a changelog: what changed overall, and the scenario that changed the most, as long as both are bigger than the noise. a pass whose change is within the noise is said to have no clear change, since that's all that can be said for it
export function summary (passes) {
  return passes.map(({ pass, rows, change, verdict }) => {
    const [where, mode] = pass.split(' ')
    const subject = `${SUMMARY_SUBJECTS[mode] ?? mode} in ${where === 'node' ? 'Node' : where[0].toUpperCase() + where.slice(1)}`
    const clear = rows.filter(row => row.verdict === 'faster' || row.verdict === 'slower')
    const furthest = clear.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0]
    if (verdict === 'faster' || verdict === 'slower') {
      const most = furthest && Math.sign(furthest.change) === Math.sign(change) && Math.abs(furthest.change) > Math.abs(change) + 5 ? `, and up to ${amount(furthest.change).replace('about ', '')} (${furthest.scenario})` : ''
      return `${subject}: ${amount(change)} overall${most}`
    }
    if (furthest) return `${subject}: no clear change overall, though ${furthest.scenario} is ${amount(furthest.change)}`
    return `${subject}: no clear change`
  })
}

const number = value => Math.round(value).toLocaleString('en-US')
const percent = value => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
const noiseText = noise => noise === null ? '—' : `±${noise.toFixed(1)}%`
const mark = verdict => verdict === 'faster' ? '▲ faster' : verdict === 'slower' ? '▼ slower' : verdict

// for the terminal: one table per pass, figures in renders per second
export function consoleReport (passes, { base, head, runs }) {
  const lines = []
  lines.push('')
  lines.push(`teddy at ${head} compared to ${base}`)
  lines.push('')
  lines.push('in short')
  for (const sentence of summary(passes)) lines.push(`  ${sentence}`)
  lines.push('')
  lines.push(`the detail: renders per second, the median of ${runs} run${runs === 1 ? '' : 's'} each, higher is faster`)
  const widths = [14, 14, 14, 9, 9]
  const row = cells => cells.map((cell, i) => i === 0 ? String(cell).padEnd(widths[i]) : String(cell).padStart(widths[i])).join('  ')
  for (const { pass, rows, change, noise, verdict } of passes) {
    lines.push('')
    lines.push(passTitle(pass))
    lines.push('  ' + row(['scenario', base.slice(0, 14), head.slice(0, 14), 'change', 'noise']) + '  verdict')
    for (const r of rows) lines.push('  ' + row([r.scenario, number(r.before), number(r.after), percent(r.change), noiseText(r.noise)]) + '  ' + mark(r.verdict))
    lines.push('  ' + row(['overall', '', '', percent(change), noiseText(noise)]) + '  ' + mark(verdict))
  }
  lines.push('')
  lines.push('a change is only called faster or slower when it is bigger than the noise: how far apart the runs of the same code landed')
  lines.push('')
  return lines.join('\n')
}

// for COMPARISON.md: the same tables, with what was compared and where
export function markdownReport (passes, { base, head, runs, environment, generated }) {
  const lines = []
  lines.push(`# teddy at ${head} compared to ${base}`)
  lines.push('')
  lines.push(`Renders per second, the median of ${runs} run${runs === 1 ? '' : 's'} of each, taken in turn. Higher is faster.`)
  lines.push('')
  lines.push('A change is only called faster or slower when it\'s bigger than the noise: how far apart the runs of the same code landed, on this machine, this time. The overall figure for each pass is the geometric mean of its scenarios\' changes.')
  lines.push('')
  lines.push(`Measured ${generated} on ${environment}.`)
  lines.push('')
  lines.push('## In short')
  lines.push('')
  for (const sentence of summary(passes)) lines.push(`- ${sentence}.`)
  for (const { pass, rows, change, noise, verdict } of passes) {
    lines.push('')
    lines.push(`## ${passTitle(pass)}`)
    lines.push('')
    lines.push(`| Scenario | ${base} | ${head} | Change | Noise | Verdict |`)
    lines.push('| --- | ---: | ---: | ---: | ---: | --- |')
    for (const r of rows) lines.push(`| ${r.scenario} | ${number(r.before)} | ${number(r.after)} | ${percent(r.change)} | ${noiseText(r.noise)} | ${mark(r.verdict)} |`)
    lines.push(`| **Overall** | | | **${percent(change)}** | ${noiseText(noise)} | **${mark(verdict)}** |`)
  }
  lines.push('')
  return lines.join('\n')
}
