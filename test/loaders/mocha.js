/* eslint-env mocha */
import assert from 'assert'
import teddy from '../../teddy.js'
import { loadTests } from './loadTests.js'
import makeModel from '../model.js'
import testGroups from '../tests.js'

const testsToRun = loadTests(testGroups)
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
      if (test.runMocha) test.run = test.runMocha
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
