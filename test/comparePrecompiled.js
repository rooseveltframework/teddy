// renders every fixture in test/templates twice and compares the bytes: once the ordinary way, and
// once from what teddy.precompile wrote for it
//
// this is the gate a change to the emitter or to the precompiled format has to pass. compareBuilds
// asks whether two builds of teddy agree; this asks whether a template compiled ahead of time
// renders what the same template compiled at runtime renders, which is the whole promise of it
//
//   node test/comparePrecompiled.js
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import teddy from '../teddy.js'
import makeModel from './model.js'

const root = 'test/templates'
const scratch = path.join('test', '.precompiled')

function templates (dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) templates(full, found)
    else if (entry.name.endsWith('.html')) found.push(path.relative(root, full).replace(/\.html$/, ''))
  }
  return found
}

// test/model.js generates random strings, so the model is built once and cloned per render
const sharedModel = makeModel()
const freshModel = () => structuredClone(sharedModel)

const names = templates(root).sort()
fs.rmSync(scratch, { recursive: true, force: true })
fs.mkdirSync(scratch, { recursive: true })

let same = 0
const skipped = []
const refused = []
const differences = []
const errors = []

for (const name of names) {
  teddy.setVerbosity(0)
  teddy.setTemplateRoot(root)
  teddy.clearTemplates()
  teddy.setCacheTemplates(false)

  // a fixture that does not render the ordinary way has nothing to be compared against: one of them
  // asks teddy to refuse a template that includes itself, and refusing is the right answer
  let expected
  try {
    expected = teddy.render(name, freshModel())
  } catch (e) {
    skipped.push(`${name}: does not render the ordinary way either (${e.message.replace('teddy: ', '').slice(0, 60)}...)`)
    continue
  }

  let artifact
  try {
    artifact = teddy.precompile(name)
  } catch (e) {
    // a template the emitter does not cover is reported rather than counted against the format
    refused.push(`${name}: ${e.message.replace('teddy: ', '')}`)
    continue
  }

  const file = path.join(scratch, name.replace(/[/\\]/g, '__') + '.mjs')
  fs.writeFileSync(file, artifact)

  let actual
  try {
    teddy.clearTemplates()
    const loaded = (await import(pathToFileURL(path.resolve(file)).href)).default
    teddy.registerPrecompiled(loaded)
    actual = teddy.render(name, freshModel())
  } catch (e) {
    errors.push(`${name}: rendering it from its precompiled form threw: ${e.message}`)
    continue
  }

  if (actual === expected) same++
  else differences.push({ name, expected, actual })
}

fs.rmSync(scratch, { recursive: true, force: true })

for (const problem of skipped) console.log(`SKIPPED  ${problem}`)
for (const problem of errors) console.log(`THREW  ${problem}`)
for (const problem of refused) console.log(`REFUSED  ${problem}`)
for (const difference of differences) {
  console.log(`\nDIFFERENT  ${difference.name}`)
  console.log(`  the ordinary render: ${JSON.stringify(difference.expected.slice(0, 200))}`)
  console.log(`  from precompiled:    ${JSON.stringify(difference.actual.slice(0, 200))}`)
}

console.log(`\n${same}/${names.length - skipped.length} comparable fixtures byte identical, ${refused.length} refused, ${differences.length} different, ${errors.length} threw, ${skipped.length} skipped`)
process.exit(differences.length || errors.length ? 1 : 0)
