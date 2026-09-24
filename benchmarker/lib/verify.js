import engines from './engines/index.js'
import scenarios from './scenarios.js'
import makeModel from '../fixtures/data.js'
import { makeContext, engineHasScenario } from './context.js'
import { canonicalize, firstDifference } from './normalize.js'

// no timing number means anything until the engines are known to be doing the same work, so the suite renders every engine once and compares the result against teddy's output before it benchmarks anything. an engine whose output does not match is reported and dropped from the run rather than quietly benchmarked on a smaller page
export async function verify (options = {}) {
  const only = options.only
  const model = makeModel()
  const reference = engines.find(engine => engine.id === 'teddy')
  const results = []

  for (const scenario of scenarios) {
    if (only?.scenarios && !only.scenarios.includes(scenario.id)) continue

    let expected = null
    let expectedRaw = null
    for (const engine of engines) {
      if (only?.engines && !only.engines.includes(engine.id) && engine !== reference) continue
      if (!engineHasScenario(engine, scenario.id)) {
        results.push({ scenario: scenario.id, engine: engine.id, status: 'missing' })
        continue
      }

      let output
      try {
        const render = await engine.load(scenario.id, makeContext(engine))
        output = await render(model)
      } catch (err) {
        results.push({ scenario: scenario.id, engine: engine.id, status: 'error', error: err.message })
        continue
      }

      const canonical = canonicalize(output)
      if (engine === reference) {
        expected = canonical
        expectedRaw = output
        results.push({ scenario: scenario.id, engine: engine.id, status: 'reference', bytes: output.length })
        continue
      }

      if (expected === null) {
        results.push({ scenario: scenario.id, engine: engine.id, status: 'unchecked', bytes: output.length })
      } else if (canonical === expected) {
        results.push({ scenario: scenario.id, engine: engine.id, status: 'match', bytes: output.length })
      } else {
        results.push({
          scenario: scenario.id,
          engine: engine.id,
          status: 'mismatch',
          bytes: output.length,
          referenceBytes: expectedRaw.length,
          difference: firstDifference(expected, canonical)
        })
      }
    }
  }

  return results
}
