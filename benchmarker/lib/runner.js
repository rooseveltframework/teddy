import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import engines from './engines/index.js'
import scenarios from './scenarios.js'
import makeModel from '../fixtures/data.js'
import { measure } from './measure.js'

const benchmarkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entry = path.join(benchmarkRoot, 'index.js')

// engines sharing one process share a heap, a jit, and a garbage collector, and the order they run in changes their numbers. by default each measurement is taken in a fresh child process so that nothing an earlier engine did can follow a later one; --no-isolate runs everything in this process instead, which is much faster and fine for a quick look but not for a number worth publishing
export async function run (options) {
  const selectedEngines = engines.filter(engine => !options.engines || options.engines.includes(engine.id))
  const selectedScenarios = scenarios.filter(scenario => !options.scenarios || options.scenarios.includes(scenario.id))
  const results = []
  const total = selectedEngines.length * selectedScenarios.length * options.modes.length
  let done = 0

  for (const scenario of selectedScenarios) {
    for (const mode of options.modes) {
      for (const engine of selectedEngines) {
        done++
        options.onProgress?.({ done, total, engine: engine.id, scenario: scenario.id, mode })
        try {
          const result = options.isolate
            ? await measureInChild({ engine: engine.id, scenario: scenario.id, mode, options })
            : await measure({
              engine,
              scenario: scenario.id,
              mode,
              model: makeModel(options.modelOptions),
              time: options.time,
              warmupTime: options.warmupTime,
              iterations: options.iterations
            })
          results.push(result)
        } catch (err) {
          results.push({
            engine: engine.id,
            scenario: scenario.id,
            mode,
            error: err.message.split('\n')[0]
          })
        }
      }
    }
  }

  return results
}

// the child prints one line of json on stdout; anything else it writes is treated as diagnostics and surfaced only if the measurement failed
function measureInChild ({ engine, scenario, mode, options }) {
  const payload = JSON.stringify({
    engine,
    scenario,
    mode,
    time: options.time,
    warmupTime: options.warmupTime,
    iterations: options.iterations,
    modelOptions: options.modelOptions
  })

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [...options.nodeArgs, entry, '--measure', payload], {
      cwd: benchmarkRoot,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe']
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', reject)
    child.on('close', code => {
      const line = stdout.trim().split('\n').filter(Boolean).pop()
      if (code !== 0 || !line) {
        return reject(new Error(stderr.trim().split('\n').filter(Boolean).pop() || `child exited with code ${code}`))
      }
      try {
        resolve(JSON.parse(line))
      } catch (err) {
        reject(new Error('could not read the child process result: ' + line.slice(0, 200)))
      }
    })
  })
}
