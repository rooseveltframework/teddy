#!/usr/bin/env node
// what `npm run benchmark` in the repo root reaches: it puts whatever the suite needs in place and then hands its arguments to index.js, so that running the benchmarks is one command rather than a list of preconditions to satisfy first
//
// nothing here is a shell command. a shell command that works in bash does not work in cmd.exe, npm is npm.cmd on windows, and path separators differ, so every step is a spawnSync with a cwd and an argument array instead

import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const benchmarkRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(benchmarkRoot, '..')
const args = process.argv.slice(2)

// npm writes node_modules/.package-lock.json as it installs, so one older than package-lock.json means the dependencies moved since the last install. that is the case a developer is least likely to notice on their own, and it is why this checks freshness rather than just presence
function installNeeded () {
  const installed = path.join(benchmarkRoot, 'node_modules', '.package-lock.json')
  if (!fs.existsSync(installed)) return true
  return fs.statSync(path.join(benchmarkRoot, 'package-lock.json')).mtimeMs > fs.statSync(installed).mtimeMs
}

// npm is reached through the node already running this rather than by name, because `npm` on windows is npm.cmd, which spawn cannot find without a shell, and a shell brings quoting rules that differ per platform. npm_execpath is set for anything reached through an npm script, which is how this is meant to be run; the fallback is for running it directly
function npm (args, cwd) {
  const execpath = process.env.npm_execpath
  if (execpath) return spawnSync(process.execPath, [execpath, ...args], { cwd, stdio: 'inherit' })
  return spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })
}

function must (result, what) {
  if (result.error) {
    console.error(`\ncould not ${what}: ${result.error.message}\n`)
    process.exit(1)
  }
  if (result.status !== 0) process.exit(result.status ?? 1)
}

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

if (installNeeded()) {
  console.log('\ninstalling the benchmark suite\'s dependencies\n')
  must(npm(['ci'], benchmarkRoot), 'install the benchmark suite\'s dependencies')
}

const browsers = browsersWanted()
if (browsers.length) {
  // a browser run loads teddy's webpack bundle out of dist/, which a fresh checkout has not built yet
  if (!fs.existsSync(path.join(repoRoot, 'dist', 'teddy.min.js'))) {
    console.log('\nbuilding teddy for the browser run\n')
    must(npm(['run', 'build'], repoRoot), 'build teddy')
  }

  // downloading a browser is playwright's job and it is a no-op once one is there, so it is cheaper to always ask than to guess whether this machine already has it
  console.log(`\nmaking sure playwright has ${browsers.join(' and ')}\n`)
  must(npm(['exec', '--', 'playwright', 'install', ...browsers], benchmarkRoot), 'install a browser for playwright')
}

const run = spawnSync(process.execPath, [path.join(benchmarkRoot, 'index.js'), ...args], { cwd: benchmarkRoot, stdio: 'inherit' })
if (run.error) {
  console.error(`\ncould not run the benchmarks: ${run.error.message}\n`)
  process.exit(1)
}
process.exit(run.status ?? 1)
