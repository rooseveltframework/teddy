/* eslint-env mocha */
const assert = require('assert')
const makeModel = require('../models/model.js')
const teddy = require('../../dist/teddy.js')
const testConditions = require('../tests.js')
const testUtils = require('../testUtils.js')
const { sanitizeTests } = require('./loaderUtils.js')
const { ignoreSpaces } = testUtils

const conditions = sanitizeTests(testConditions)

for (const tc of conditions) {
  describe(tc.describe, () => {
    let model

    before(() => {
      teddy.setTemplateRoot('test/templates')
      model = makeModel()
      if (process.env.NODE_ENV === 'test') {
        teddy.setVerbosity(0)
      }
    })

    for (const t of tc.tests) {
      if (t.skip) continue

      // callback function used on custom and asynchronous tests
      const cb = (result, expected = true) => {
        if (typeof expected === 'string') {
          expected = ignoreSpaces(expected)
        }
        assert.equal(ignoreSpaces(result), expected)
      }

      // test asynchronous code
      if (t?.type === 'async') {
        it(t.message, async () => await t.test(teddy, t.template, model, cb))
        continue
      }

      // test code that is handled within that test (with use of a callback)
      if (t?.type === 'custom') {
        it(t.message, () => t.test(teddy, t.template, model, cb))
        continue
      }

      // assert result of the test code
      it(t.message, () => {
        if (typeof t.expected === 'string') {
          t.expected = ignoreSpaces(t.expected)
        }
        const result = ignoreSpaces(t.test(teddy, t.template, model))
        assert.equal(result, t.expected)
      })
    }
  })
}
