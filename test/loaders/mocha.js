/* eslint-env mocha */

import assert from 'assert'
import makeModel from '../models/model.js'
import teddy from '../../teddy.js'
import testConditions from '../testConditions.js'

// const assert = require('assert')
// const makeModel = require('../models/model')
// const teddy = require('../../')
// const testConditions = require('../testConditions')

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
        assert.equal(t.test(teddy, t.template, model).trim(), t.expected)
      })
    }
  })
}
