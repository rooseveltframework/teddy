/* eslint-env mocha */

import assert from 'assert'
import makeModel from '../models/model.js'
import teddy from '../../teddy.js'
import testConditions from '../testConditions.js'
import { cleanString } from '../testUtils.js'

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
      it(t.message, () => {
        assert.equal(t.test(teddy, cleanString(t.test(teddy, t.template, model)), model), cleanString(t.expected))
      })
    }
  })
}
