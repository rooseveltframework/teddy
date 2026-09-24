import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const benchmarkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const templateRoot = path.join(benchmarkRoot, 'fixtures', 'templates')

// what an engine adapter is handed: where its templates live, and the two or three ways engines want to receive them (as a string, as a path, or as a named set of partials)
export function makeContext (engine) {
  const dir = path.join(templateRoot, engine.id)
  const suffix = '.' + engine.ext

  // the cold measurement calls read() on every iteration, and none of these engines is being asked how fast its filesystem is, so a source file is read once and kept
  const sources = new Map()
  function read (name) {
    let source = sources.get(name)
    if (source === undefined) {
      source = fs.readFileSync(path.join(dir, name + suffix), 'utf8')
      sources.set(name, source)
    }
    return source
  }

  return {
    dir,
    ext: engine.ext,
    path: name => path.join(dir, name + suffix),
    read,
    exists: name => fs.existsSync(path.join(dir, name + suffix)),

    // every file in the engine's directory whose name starts with an underscore, keyed by name without the extension; engines that spell their partials differently, or do not need all of them, simply ship a different set of files
    readPartials () {
      const partials = {}
      for (const file of fs.readdirSync(dir)) {
        if (!file.startsWith('_') || !file.endsWith(suffix)) continue
        partials[file.slice(0, -suffix.length)] = fs.readFileSync(path.join(dir, file), 'utf8')
      }
      return partials
    }
  }
}

export function engineHasScenario (engine, scenario) {
  return fs.existsSync(path.join(templateRoot, engine.id, scenario + '.' + engine.ext))
}
