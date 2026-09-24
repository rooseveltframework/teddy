import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const benchmarkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// some packages do not list ./package.json in their exports map, so the version is read off disk rather than imported
export function packageVersion (name) {
  const candidates = [
    path.join(benchmarkRoot, 'node_modules', name, 'package.json'),
    path.join(benchmarkRoot, '..', 'node_modules', name, 'package.json'),
    path.join(benchmarkRoot, '..', 'package.json')
  ]
  for (const candidate of candidates) {
    try {
      return JSON.parse(fs.readFileSync(candidate, 'utf8')).version
    } catch (e) {
      continue
    }
  }
  return 'unknown'
}
