// renders every fixture in test/templates with two builds of teddy and compares the bytes
//
// the test suite asserts 219 expectations. this asserts that nothing anywhere changed, including in the fixtures no test looks at closely, which is what a refactor of the parser needs before it can be believed. any difference it reports is either a bug or a deliberate change that should be written down in CHANGELOG.md.
//
// both builds have to sit inside the repo so that they can resolve cheerio, and the paths are read relative to wherever the command was run:
//
//   git show HEAD:teddy.js > before.js
//   node test/compareBuilds.js before.js teddy.js
//   rm before.js
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import makeModel from './model.js'

const [aPath, bPath] = process.argv.slice(2)
if (!aPath || !bPath) {
  console.error('usage: node test/compareBuilds.js <before.js> <after.js>')
  process.exit(1)
}

// resolved against where the command was run rather than against this file, which is what anyone typing two paths on the command line expects
const load = async file => (await import(pathToFileURL(path.resolve(file)).href)).default
const a = await load(aPath)
const b = await load(bPath)

const root = 'test/templates'

function templates (dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) templates(full, found)
    else if (entry.name.endsWith('.html')) found.push(path.relative('test/templates', full).replace(/\.html$/, ''))
  }
  return found
}

// test/model.js generates random strings, so the model is built once and cloned per render; otherwise the fixtures that print it differ for reasons that are not the change
const sharedModel = makeModel()
const freshModel = () => structuredClone(sharedModel)

const names = templates(root).sort()
let same = 0
const differences = []
const errors = []

for (const name of names) {
  for (const engine of [a, b]) {
    engine.setVerbosity(0)
    engine.setTemplateRoot(root)
    engine.clearTemplates()
    engine.setCacheTemplates(false)
  }
  let outA, outB
  try { outA = a.render(name, freshModel()) } catch (e) { outA = 'THREW: ' + e.message }
  try { outB = b.render(name, freshModel()) } catch (e) { outB = 'THREW: ' + e.message }
  if (outA === outB) { same++; continue }
  if (String(outA).startsWith('THREW') !== String(outB).startsWith('THREW')) errors.push(name)
  let i = 0
  while (i < Math.min(outA.length, outB.length) && outA[i] === outB[i]) i++
  differences.push({ name, index: i, a: outA.slice(Math.max(0, i - 40), i + 80), b: outB.slice(Math.max(0, i - 40), i + 80) })
}

console.log(`${same}/${names.length} fixtures byte identical`)
if (differences.length) {
  console.log(`\n${differences.length} differ:`)
  for (const d of differences.slice(0, 12)) {
    console.log(`\n  ${d.name}  (first difference at ${d.index})`)
    console.log(`    a: ${JSON.stringify(d.a)}`)
    console.log(`    b: ${JSON.stringify(d.b)}`)
  }
  if (differences.length > 12) console.log(`\n  ...and ${differences.length - 12} more`)
}
process.exit(differences.length ? 1 : 0)
