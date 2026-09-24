import { Bench } from 'tinybench'
import { makeContext } from './context.js'

// one measurement is one (engine, scenario, mode) triple
//
// there are two modes because engines pay for their work at different times. most of them compile a template into a javascript function once and then replay it; teddy parses the markup on every render. reporting only one number would flatter whichever engine the choice happened to suit:
//
//   cached  the render function is built once, and only the render is timed. this is what a warm production process does on every request
//   cold    building the render function and rendering once are timed together, with the engine's own compile cache switched off. this is what the first request after a deploy costs, and what a template edit costs in development
export async function measure ({ engine, scenario, mode, model, time, warmupTime, iterations }) {
  const ctx = makeContext(engine)
  const cold = mode === 'cold'

  // one render outside the measurement, to catch an error before the bench starts and to record how much markup this engine produces. it renders twice from the same model, because a benchmark loop calls the render function thousands of times against one object: an engine that mutated its input or its own state would be measured doing something other than what it did the first time, and that has to fail loudly
  const probe = await engine.load(scenario, ctx, { cold: false })
  const output = await probe(model)
  const second = await probe(model)
  if (second !== output) {
    throw new Error('render is not repeatable: rendering the same model twice produced different markup')
  }

  const bench = new Bench({
    name: `${engine.id}/${scenario}/${mode}`,
    time,
    warmupTime,
    iterations,
    throws: true
  })

  if (cold) {
    bench.add(engine.id, async () => {
      const render = await engine.load(scenario, ctx, { cold: true })
      return render(model)
    })
  } else {
    const render = await engine.load(scenario, ctx, { cold: false })
    bench.add(engine.id, () => render(model))
  }

  await bench.run()

  const task = bench.tasks[0]
  if (task.result.error) throw task.result.error
  const { latency, throughput } = task.result
  return {
    engine: engine.id,
    scenario,
    mode,
    hz: throughput.mean,
    mean: latency.mean,
    min: latency.min,
    p99: latency.p99,
    rme: latency.rme,
    samples: latency.samplesCount,
    bytes: output.length
  }
}
