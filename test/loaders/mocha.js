/* eslint-env mocha */

import assert from 'assert'
import makeModel from '../models/model.js'
import teddy from '../../teddy.js'
import testConditions from '../testConditions.js'
import { ignoreSpaces } from '../testUtils.js'

for (const tc of testConditions) {
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
      if (t.async) {
        it(t.message, async (done) => {
          assert.equal(ignoreSpaces(await t.test(teddy, t.template, model)), ignoreSpaces(t.expected))
          done()
        })
      } else {
        it(t.message, () => {
          if (typeof t.expected === 'string') {
            assert.equal(ignoreSpaces(t.test(teddy, t.template, model)), ignoreSpaces(t.expected))
          } else if (typeof t.expected === 'boolean') {
            assert.equal(t.test(teddy, t.template, model), t.expected)
          }
        })
      }
    }
  })
}
