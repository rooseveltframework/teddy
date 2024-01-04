const { test, expect } = require('@playwright/test')
const teddy = require('../')
const makeModel = require('./models/model')
const testConditions = require('./testConditions')

test.describe('Conditionals', () => {
  let model

  test.beforeAll(() => {
    teddy.setTemplateRoot('test/templates')
    model = makeModel()
  })

  for (const condition of testConditions) {
    test(condition.test, () => {
      expect(teddy.render(condition.template, model)).toEqual(expect.stringContaining(condition.match))
    })
  }
})
