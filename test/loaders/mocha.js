/* eslint-env mocha */

const chai = require('chai')
const assert = chai.assert
const chaiString = require('chai-string')
const makeModel = require('../models/model')
const teddy = require('../../')
const testConditions = require('../testConditions')

chai.use(chaiString)

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
        assert.equalIgnoreSpaces(t.test(teddy, t.template, model), t.expected)
      })
    }
  })
}
