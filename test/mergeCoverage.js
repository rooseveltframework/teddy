// reports which lines of Teddy neither half of the test suite executes
//
// neither half can reach all of Teddy on its own: the server run executes teddy.js directly and never enters anything guarded by the browser check, the client run executes the bundle in a browser and never reaches the filesystem paths, and only the client run touches cheerioPolyfill.js at all
//
// the two runs cannot be merged by a coverage reporter: c8 derives its statement, branch and function ids from V8's execution ranges while istanbul derives its own from the syntax tree, so for the very same source file the two describe different things by different ids. handing both to a reporter does not add them up; it keeps one set of ids and quietly drops the counters belonging to the other, which reads as a much better number than either half earned
//
// line numbers are the one thing the two formats agree on, so that is what is combined here: a line counts as covered when either half executed it, and the lines left over are the ones nothing exercises at all
import fs from 'fs'
import path from 'path'

const halves = [
  { label: 'server', file: path.join('coverage', 'raw', 'server', 'coverage-final.json') },
  { label: 'client', file: path.join('coverage', 'raw', 'client', 'coverage-final.json') }
]

// the lines a coverage report says are executable, and which of them ran
function linesFrom (fileCoverage) {
  const executable = new Set()
  const covered = new Set()
  for (const [id, location] of Object.entries(fileCoverage.statementMap)) {
    for (let line = location.start.line; line <= location.end.line; line++) executable.add(line)
    if (fileCoverage.s[id]) for (let line = location.start.line; line <= location.end.line; line++) covered.add(line)
  }
  return { executable, covered }
}

const files = {} // keyed by source path, holding the line sets each half contributed
let missing = 0

for (const half of halves) {
  if (!fs.existsSync(half.file)) {
    console.warn(`no ${half.label} coverage at ${half.file}; run npm run coverage-${half.label} first`)
    missing++
    continue
  }
  const report = JSON.parse(fs.readFileSync(half.file, 'utf8'))
  for (const [sourcePath, fileCoverage] of Object.entries(report)) {
    files[sourcePath] = files[sourcePath] || { executable: new Set(), byHalf: {}, executableByHalf: {} }
    const { executable, covered } = linesFrom(fileCoverage)
    for (const line of executable) files[sourcePath].executable.add(line)
    files[sourcePath].byHalf[half.label] = covered
    files[sourcePath].executableByHalf[half.label] = executable
  }
}

if (missing === halves.length) {
  console.error('neither half of the coverage is present, so there is nothing to report')
  process.exit(1)
}

const rows = []
const gaps = []
for (const [sourcePath, data] of Object.entries(files).sort()) {
  const name = path.relative(process.cwd(), sourcePath)
  const server = data.byHalf.server || new Set()
  const client = data.byHalf.client || new Set()
  const uncovered = [...data.executable].filter(line => !server.has(line) && !client.has(line)).sort((a, b) => a - b)
  const total = data.executable.size
  rows.push({
    name,
    total,
    server: server.size,
    client: client.size,
    either: total - uncovered.length,
    percent: total ? ((total - uncovered.length) / total * 100) : 100
  })
  // consecutive lines are reported as one range rather than one by one: a gap is nearly always a
  // whole function nothing calls, and naming every line of it buried that under a wall of numbers
  //
  // which halves consider a line executable is carried along, because a line only one of them counts
  // is usually a function's declaration or its closing brace, which the two instrumenters disagree
  // about. saying so stops that reading as a real gap
  if (uncovered.length) {
    const claimedBy = line => halves.map(h => h.label).filter(label => data.executableByHalf[label]?.has(line)).join('+')
    const runs = []
    for (const line of uncovered) {
      const claim = claimedBy(line)
      const last = runs[runs.length - 1]
      if (last && line === last.to + 1) {
        last.to = line
        if (!last.claims.includes(claim)) last.claims.push(claim)
      } else runs.push({ from: line, to: line, claims: [claim] })
    }
    gaps.push({ name, runs, count: uncovered.length })
  }
}

const width = Math.max(...rows.map(r => r.name.length), 4)
console.log('\nlines executed by either half of the test suite:\n')
console.log(`  ${'file'.padEnd(width)}  ${'lines'.padStart(6)}  ${'server'.padStart(7)}  ${'client'.padStart(7)}  ${'either'.padStart(7)}  ${'%'.padStart(7)}`)
for (const r of rows) {
  console.log(`  ${r.name.padEnd(width)}  ${String(r.total).padStart(6)}  ${String(r.server).padStart(7)}  ${String(r.client).padStart(7)}  ${String(r.either).padStart(7)}  ${r.percent.toFixed(2).padStart(7)}`)
}

const overallTotal = rows.reduce((sum, r) => sum + r.total, 0)
const overallEither = rows.reduce((sum, r) => sum + r.either, 0)
console.log(`\n  ${'all files'.padEnd(width)}  ${String(overallTotal).padStart(6)}  ${''.padStart(7)}  ${''.padStart(7)}  ${String(overallEither).padStart(7)}  ${(overallEither / overallTotal * 100).toFixed(2).padStart(7)}`)

if (gaps.length) {
  const everyHalf = halves.map(h => h.label).join('+')
  // one row per run of lines, so a gap reads as the thing it is rather than as a list of numbers
  const gapRows = gaps.flatMap(gap => gap.runs.map(run => ({
    name: gap.name,
    lines: run.from === run.to ? String(run.from) : `${run.from}-${run.to}`,
    count: run.to - run.from + 1,
    countedBy: run.claims.length > 1 ? 'mixed' : run.claims[0] === everyHalf ? 'both' : run.claims[0] || 'neither'
  })))

  const nameWidth = Math.max(...gapRows.map(r => r.name.length), 4)
  const lineWidth = Math.max(...gapRows.map(r => r.lines.length), 5)
  console.log('\nlines nothing executes:\n')
  console.log(`  ${'file'.padEnd(nameWidth)}  ${'lines'.padEnd(lineWidth)}  ${'count'.padStart(5)}  counted by`)
  console.log(`  ${'-'.repeat(nameWidth)}  ${'-'.repeat(lineWidth)}  ${'-'.repeat(5)}  ${'-'.repeat(10)}`)
  for (const r of gapRows) {
    console.log(`  ${r.name.padEnd(nameWidth)}  ${r.lines.padEnd(lineWidth)}  ${String(r.count).padStart(5)}  ${r.countedBy}`)
  }

  const totals = gaps.map(gap => `${gap.name} ${gap.count}`).join(', ')
  console.log(`\n  ${gaps.reduce((sum, gap) => sum + gap.count, 0)} lines in ${gapRows.length} runs: ${totals}`)
  console.log('\n  counted by says which halves\' instrumenter treated the line as executable at all.')
  console.log('  a run counted by one half, or mixed, is usually a declaration or a closing brace the')
  console.log('  two disagree about rather than logic nothing reaches.')
} else {
  console.log('\nevery executable line is executed by one half or the other')
}
console.log()
