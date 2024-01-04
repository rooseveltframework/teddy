/* eslint-env mocha */

const chai = require('chai')
const assert = chai.assert
const chaiString = require('chai-string')
const makeModel = require('../models/model')
const teddy = require('../../')
const testConditions = require('../testConditions')

chai.use(chaiString)

for (const testCategory of testConditions) {
  describe(testCategory.describe, () => {
    let model

    before(() => {
      teddy.setTemplateRoot('test/templates')
      model = makeModel()
      if (process.env.NODE_ENV === 'test') {
        teddy.setVerbosity(0)
      }
    })

    for (const test of testCategory.tests) {
      it(test.message, () => {
        assert.equalIgnoreSpaces(teddy.render(test.template, model), test.expected)
      })
    }
  })
}
