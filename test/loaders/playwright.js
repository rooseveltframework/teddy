const { test, expect } = require('@playwright/test')
const teddy = require('../../')
const makeModel = require('../models/model')
const testConditions = require('../testConditions')

teddy.setVerbosity(0)

for (const testCategory of testConditions) {
  test.describe(testCategory.describe, () => {
    let model

    test.beforeAll(() => {
      teddy.setTemplateRoot('test/templates')
      model = makeModel()
    })

    for (const t of testCategory.tests) {
      test(t.message, async ({ page }) => {
        await page.setContent(teddy.render(t.template, model))
        const html = await page.innerHTML('body')
        expect(html).toMatch(t.expected)
      })
    }
  })
}
