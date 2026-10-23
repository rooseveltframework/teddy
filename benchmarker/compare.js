#!/usr/bin/env node
// what `npm run benchmark:compare` reaches: measures how fast teddy is at two versions, and says which scenarios got faster or slower, by how much, and whether that's more than the measurements disagree with themselves
//
// the version to compare against is checked out into a temporary git worktree, so the checkout being worked in is never touched: nothing is stashed, switched or rebuilt in place. both versions are measured by this checkout's benchmarker, so everything about the two runs is the same but teddy. their runs are taken in turn, one of each and then the other way round, so that the machine warming up or getting busier part way through slows both alike rather than one of them
//
// it measures teddy alone, which is all a comparison of two versions of teddy needs, and writes nothing a full run writes: BENCHMARKS.md and BASELINE.json are left alone. what it found goes to the terminal and to COMPARISON.md

import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import { benchmarkRoot, repoRoot, installSuiteDependencies, installBrowsers, buildIfStale } from './lib/prepare.js'
import { analyze, consoleReport, markdownReport } from './lib/comparison.js'
import { environment } from './lib/report.js'

const usage = `
compares teddy's speed at two versions

  npm run benchmark:compare                     this checkout as it is, uncommitted changes and all, against main
  npm run benchmark:compare -- 2.1.0            this checkout against a branch, tag or commit
  npm run benchmark:compare -- 2.1.0 main       one branch, tag or commit against another
  npm run benchmark:compare -- main main        a version against itself, which shows how much the numbers move by themselves

options
  --runs=3                    how many times to measure each version (default: 3). more runs take longer and give a steadier answer
  --scenarios=table,page      only these scenarios
  --modes=cached,cold         what to measure (default: both)
  --browser=chromium          which browser to measure in (chromium, firefox, webkit)
  --no-browser                skip the browser passes
  --precompiled=chromium      which browser to measure precompiled templates in
  --no-precompiled            skip the precompiled browser pass
  --time=1000                 milliseconds per measurement
  --no-write                  print the comparison without writing COMPARISON.md
  --help                      this message

the version compared against is built with this checkout's dependencies, in a temporary worktree that's removed afterwards
`

// the options the suite itself takes, which are handed on to it as they are
const PASSED_ON = ['scenarios', 'modes', 'browser', 'no-browser', 'precompiled', 'no-precompiled', 'time', 'warmup', 'iterations', 'table-rows', 'products']

function parseArgs (argv) {
  const options = { refs: [], runs: 3, write: true, passedOn: [], browsers: { browser: 'chromium', precompiled: 'chromium' } }
  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      options.refs.push(arg)
      continue
    }
    const [flag, value] = arg.slice(2).split('=')
    if (flag === 'help') {
      console.log(usage)
      process.exit(0)
    } else if (flag === 'runs') {
      options.runs = Number(value)
      if (!Number.isInteger(options.runs) || options.runs < 1) fail('--runs has to be a whole number, 1 or more')
    } else if (flag === 'no-write') options.write = false
    else if (PASSED_ON.includes(flag)) {
      options.passedOn.push(arg)
      if (flag === 'browser' || flag === 'precompiled') options.browsers[flag] = value || 'chromium'
      if (flag === 'no-browser') options.browsers.browser = null
      if (flag === 'no-precompiled') options.browsers.precompiled = null
    } else fail(`unknown option: ${arg}`)
  }
  if (options.refs.length > 2) fail('compare at most two versions: what to compare against, and optionally what to compare')
  return options
}

function fail (message) {
  console.error(`\n${message}\nrun with --help for how to use this\n`)
  process.exit(1)
}

function git (args, cwd = repoRoot) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  if (result.error) fail(`could not run git: ${result.error.message}`)
  return result
}

// a branch, tag or commit as a commit, or a clear complaint if there's no such thing
function resolve (ref) {
  const result = git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`])
  if (result.status !== 0) fail(`there's no branch, tag or commit called ${ref} here`)
  return result.stdout.trim()
}

// checks a version out into a temporary worktree and builds it there, with this checkout's dependencies linked in rather than installed again
const worktrees = []
function checkOut (ref) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teddy-benchmark-'))
  const result = git(['worktree', 'add', '--detach', dir, resolve(ref)])
  if (result.status !== 0) fail(`could not check out ${ref}: ${result.stderr.trim()}`)
  worktrees.push(dir)
  fs.symlinkSync(path.join(repoRoot, 'node_modules'), path.join(dir, 'node_modules'), 'junction')
  buildIfStale(dir, ref)
  return dir
}

// takes away the temporary worktrees, which happens however the comparison ends, including being stopped part way through
function cleanUp () {
  for (const dir of worktrees.splice(0)) {
    git(['worktree', 'remove', '--force', dir])
    fs.rmSync(dir, { recursive: true, force: true })
  }
}
process.on('SIGINT', () => {
  cleanUp()
  process.exit(130)
})

// one measurement of one version, by this checkout's benchmarker pointed at that version's build. the suite writes what it measured as a baseline file, which is the one place it keeps every figure, and its own output goes to a log beside it, which is only shown if it fails
function measure (side, file, passedOn) {
  const log = file.replace(/\.json$/, '.log')
  const out = fs.openSync(log, 'w')
  const result = spawnSync(process.execPath, [path.join(benchmarkRoot, 'index.js'), '--engines=teddy', '--no-write', '--save-baseline', `--baseline=${file}`, ...passedOn], {
    cwd: benchmarkRoot,
    env: { ...process.env, TEDDY_BENCHMARK_ROOT: side.root },
    stdio: ['ignore', out, out]
  })
  fs.closeSync(out)
  if (result.status !== 0 || !fs.existsSync(file)) {
    console.error(`\nmeasuring ${side.label} failed. what the benchmarker said:\n`)
    console.error(fs.readFileSync(log, 'utf8').split('\n').slice(-30).join('\n'))
    cleanUp()
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function main () {
  const options = parseArgs(process.argv.slice(2))
  const [baseRef = 'main', headRef = null] = options.refs

  installSuiteDependencies()
  installBrowsers([...new Set(Object.values(options.browsers).filter(Boolean))])
  git(['worktree', 'prune']) // (whatever a comparison stopped outright left behind)

  const base = { label: baseRef, root: checkOut(baseRef) }
  const head = headRef === null ? { label: 'this checkout', root: repoRoot } : { label: headRef, root: checkOut(headRef) }
  if (headRef === null) buildIfStale(repoRoot, 'this checkout')

  const results = fs.mkdtempSync(path.join(os.tmpdir(), 'teddy-benchmark-results-'))
  const runs = { base: [], head: [] }
  const total = options.runs * 2
  let done = 0
  const started = Date.now()
  console.log(`\nmeasuring ${base.label} and ${head.label}, ${options.runs} time${options.runs === 1 ? '' : 's'} each, taking turns\n`)
  for (let run = 0; run < options.runs; run++) {
    // one of each, and then the other way round, so that neither version always goes first
    const order = run % 2 ? [['head', head], ['base', base]] : [['base', base], ['head', head]]
    for (const [which, side] of order) {
      done++
      const elapsed = (Date.now() - started) / 1000
      const left = done > 1 ? `, about ${Math.ceil(elapsed / (done - 1) * (total - done + 1) / 60)} min left` : ''
      console.log(`  [${done}/${total}] ${side.label}, run ${run + 1}${left}`)
      runs[which].push(measure(side, path.join(results, `${which}-${run + 1}.json`), options.passedOn))
    }
  }
  cleanUp()
  fs.rmSync(results, { recursive: true, force: true })

  const passes = analyze(runs.base, runs.head)
  const labels = { base: base.label, head: head.label, runs: options.runs }
  console.log(consoleReport(passes, labels))
  if (options.write) {
    const env = environment()
    const file = path.join(benchmarkRoot, 'COMPARISON.md')
    fs.writeFileSync(file, markdownReport(passes, { ...labels, generated: new Date().toISOString().slice(0, 16).replace('T', ' '), environment: `${env.cpu} (${env.cores} cores), ${env.platform}, node ${env.node}` }))
    console.log(`wrote ${path.relative(process.cwd(), file)}\n`)
  }
}

try {
  main()
} catch (error) {
  cleanUp()
  throw error
}
