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
      if (t.skip) continue

      if (t?.type === 'async') {
        it(t.message, async (done) => {
          const cb = (result, expected = true) => {
            if (typeof expected === 'string') {
              expected = ignoreSpaces(expected)
            }
            assert.equal(ignoreSpaces(result), expected)
          }

          // execute the test code only
          if (!t.expected) {
            await t.test(teddy, t.template, model, cb)
            done()
          }

          // assert result of test code
          if (typeof t.expected === 'string') {
            assert.equal(ignoreSpaces(await t.test(teddy, t.template, model, cb)), ignoreSpaces(t.expected))
            done()
          }

          if (typeof t.expected === 'boolean') {
            assert.equal(await t.test(teddy, t.template, model, cb), t.expected)
            done()
          }
        })

        continue
      }

      if (t?.type === 'custom') {
        const cb = (result, expected = true) => {
          if (typeof expected === 'string') {
            expected = ignoreSpaces(expected)
          }
          assert.equal(ignoreSpaces(result), expected)
        }

        // only execute the test code
        it(t.message, () => t.test(teddy, t.template, model, cb))

        continue
      }

      // assert result of the test code
      it(t.message, () => {
        if (typeof t.expected === 'string') {
          assert.equal(ignoreSpaces(t.test(teddy, t.template, model)), ignoreSpaces(t.expected))
        } else if (typeof t.expected === 'boolean') {
          assert.equal(t.test(teddy, t.template, model), t.expected)
        }
      })
    }
  })
}
