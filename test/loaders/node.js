import { describe, it, before } from 'node:test'
import assert from 'node:assert'
import teddy from '../../teddy.js'
import { loadTests } from './loadTests.js'
import makeModel from '../model.js'
import testGroups from '../tests.js'

// these are collected before loadTests runs, because it filters the skipped tests out of the groups as it goes
const markedOnly = []
const markedSkip = []
for (const group of testGroups) {
  if (group.only) markedOnly.push(`group "${group.describe}"`)
  if (group.skip) markedSkip.push(`group "${group.describe}"`)
  for (const test of group.tests) {
    if (test.only) markedOnly.push(`"${test.message}"`)
    if (test.skip) markedSkip.push(`"${test.message}"`)
  }
}

const testsToRun = loadTests(testGroups)

// a test left marked `only` silently reduces the suite to that one test, so it must never reach a commit
// a `skip` is sometimes a deliberate marker for a known issue, so those are reported rather than failed, to keep them visible
describe('test suite integrity', () => {
  it('should not have any tests or groups left marked as only', () => {
    assert.deepStrictEqual(markedOnly, [], `marked only, so the rest of the suite would not have run: ${markedOnly.join(', ')}`)
  })

  it('should report anything being skipped', () => {
    if (markedSkip.length) console.log(`\n      ${markedSkip.length} test(s) are skipped, which is not a failure but is worth keeping visible:\n        ${markedSkip.join('\n        ')}\n`)
  })
})
for (const testGroup of testsToRun) {
  describe(testGroup.describe, () => {
    let model

    before(() => {
      teddy.setTemplateRoot('test/templates')
      model = makeModel()
      if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'cover') teddy.setVerbosity(0)
    })

    for (const test of testGroup.tests) {
      if (test.skip) continue
      if (test.runNode) test.run = test.runNode
      if (!test.run) continue
      else it(test.message, async () => await test.run(teddy, test.template, model, teddyAssert, test.expected))
    }
  })
}

function teddyAssert (result, expected = true) {
  result = ignoreSpaces(result)
  if (typeof expected === 'string') expected = ignoreSpaces(expected)
  if (Array.isArray(expected)) {
    let match = false
    for (let acceptable of expected) {
      acceptable = ignoreSpaces(acceptable)
      if (result === acceptable) match = true
    }
    assert.equal(match, true)
  } else assert.equal(result, expected)
}

function ignoreSpaces (str) {
  if (typeof str !== 'string') return str
  return str.replace(/\s/g, '')
}
