#!/usr/bin/env node
// what `npm run benchmark` in the repo root reaches: it puts whatever the suite needs in place and then hands its arguments to index.js, so that running the benchmarks is one command rather than a list of preconditions to satisfy first
//
// the steps themselves are in lib/prepare.js, which compare.js uses too

import path from 'path'
import { spawnSync } from 'child_process'
import { benchmarkRoot, repoRoot, installSuiteDependencies, installBrowsers, buildIfStale } from './lib/prepare.js'

const args = process.argv.slice(2)

// which browsers a run is going to want, so that playwright can be asked for those and no others
//
// both passes run unless they are turned off, matching index.js, because the complete report is what a run with nothing asked for produces
function browsersWanted () {
  let browser = 'chromium'
  let precompiled = 'chromium'
  for (const arg of args) {
    const [flag, value] = arg.startsWith('--') ? arg.slice(2).split('=') : []
    if (flag === 'browser') browser = value || 'chromium'
    if (flag === 'precompiled') precompiled = value || 'chromium'
    if (flag === 'no-browser') browser = null
    if (flag === 'no-precompiled') precompiled = null
  }
  return [...new Set([browser, precompiled].filter(Boolean))]
}

installSuiteDependencies()

// the node run loads teddy's build too, not its source, so a build older than the source is rebuilt whether or not a browser is wanted
buildIfStale(repoRoot)
installBrowsers(browsersWanted())

const run = spawnSync(process.execPath, [path.join(benchmarkRoot, 'index.js'), ...args], { cwd: benchmarkRoot, stdio: 'inherit' })
if (run.error) {
  console.error(`\ncould not run the benchmarks: ${run.error.message}\n`)
  process.exit(1)
}
process.exit(run.status ?? 1)
