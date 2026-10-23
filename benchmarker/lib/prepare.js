// putting in place what a benchmark run needs before it starts: the suite's own dependencies, a browser for playwright, and a build of teddy that's up to date. run.js and compare.js both use these
//
// nothing here is a shell command. a shell command that works in bash does not work in cmd.exe, npm is npm.cmd on windows, and path separators differ, so every step is a spawnSync with a cwd and an argument array instead

import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

export const benchmarkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const repoRoot = path.resolve(benchmarkRoot, '..')

// npm is reached through the node already running this rather than by name, because `npm` on windows is npm.cmd, which spawn cannot find without a shell, and a shell brings quoting rules that differ per platform. npm_execpath is set for anything reached through an npm script, which is how this is meant to be run; the fallback is for running it directly
export function npm (args, cwd, stdio = 'inherit') {
  const execpath = process.env.npm_execpath
  if (execpath) return spawnSync(process.execPath, [execpath, ...args], { cwd, stdio })
  return spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, { cwd, stdio, shell: process.platform === 'win32' })
}

export function must (result, what) {
  if (result.error) {
    console.error(`\ncould not ${what}: ${result.error.message}\n`)
    process.exit(1)
  }
  if (result.status !== 0) {
    console.error(`\ncould not ${what}\n`)
    process.exit(result.status ?? 1)
  }
}

// npm writes node_modules/.package-lock.json as it installs, so one older than package-lock.json means the dependencies moved since the last install. that is the case a developer is least likely to notice on their own, and it is why this checks freshness rather than just presence
export function installSuiteDependencies () {
  const installed = path.join(benchmarkRoot, 'node_modules', '.package-lock.json')
  const needed = !fs.existsSync(installed) || fs.statSync(path.join(benchmarkRoot, 'package-lock.json')).mtimeMs > fs.statSync(installed).mtimeMs
  if (!needed) return
  console.log('\ninstalling the benchmark suite\'s dependencies\n')
  must(npm(['ci'], benchmarkRoot), 'install the benchmark suite\'s dependencies')
}

// downloading a browser is playwright's job and it is a no-op once one is there, so it is cheaper to always ask than to guess whether this machine already has it
export function installBrowsers (browsers) {
  if (!browsers.length) return
  console.log(`\nmaking sure playwright has ${browsers.join(' and ')}\n`)
  must(npm(['exec', '--', 'playwright', 'install', ...browsers], benchmarkRoot), 'install a browser for playwright')
}

// the files teddy's builds are made from: a build older than any of them was made from different code, and measuring it would measure that code instead
const SOURCES = ['teddy.js', 'compiler.js', 'codegen.js', 'codegenStub.js', 'cheerioPolyfill.js', 'precompiled.js', 'webpack.config.js', 'package.json']

// builds teddy in a checkout if its build is missing or older than its source, which is what happens after switching branches, stashing, or editing teddy: a run used to measure whatever was built last, silently
export function buildIfStale (root, label = 'teddy') {
  const built = path.join(root, 'dist', 'teddy.min.js')
  const builtAt = fs.existsSync(built) ? fs.statSync(built).mtimeMs : 0
  const newest = Math.max(...SOURCES.map(file => path.join(root, file)).filter(file => fs.existsSync(file)).map(file => fs.statSync(file).mtimeMs))
  if (builtAt > newest) return
  console.log(`\nbuilding ${label}, since its build is ${builtAt ? 'older than its source' : 'missing'}\n`)
  must(npm(['run', 'build'], root, ['ignore', 'ignore', 'inherit']), `build ${label}`)
}
