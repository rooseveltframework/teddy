import { test, expect } from '@playwright/test'
import makeModel from '../models/model.js'
import testConditions from '../tests.js'
import { ignoreSpaces } from '../testUtils.js'
import { sanitizeTests, registerTemplates } from './loaderUtils.js'
import teddy from '../../teddy.js'

const conditions = sanitizeTests(testConditions)

for (const tc of conditions) {
  test.describe(tc.describe, () => {
    let model

    test.beforeAll(() => {
      // this ensures that teddy is not using the fs module to retrieve templates
      teddy.setTemplateRoot('test/noTemplatesHere')
      registerTemplates(teddy, 'test/templates')
      model = makeModel()
    })

    for (const t of tc.tests) {
      test(t.message, async ({ page }) => {
        if (t.playwright) {
          const params = { teddy, model, template: t.template }
          await t.playwright(params, page, expect)
          return
        }

        // callback function used on custom and asynchronous tests
        const cb = (result, expected = true) => {
          if (typeof expected === 'string') {
            expected = ignoreSpaces(expected)
          }
          expect(ignoreSpaces(result)).toBe(expected)
        }

        // test asynchronous code
        if (t?.type === 'async') {
          if (!t.expected) {
            await t.test(teddy, t.template, model, cb)
            return
          }

          if (typeof t.expected === 'string') {
            // must wrap in body tags due to peculiarities in how document.write() works: https://github.com/microsoft/playwright/issues/24503
            await page.setContent('<body>' + await t.test(teddy, t.template, model, cb) + '</body>')
            expect(ignoreSpaces(await page.innerHTML('body'))).toEqual(ignoreSpaces(t.expected))
            return
          }

          if (typeof t.expected === 'boolean') {
            expect(t.test(teddy, t.template, model, cb)).toBe(t.expected)
          }
        }

        // test code that is handled within that test (with use of a callback)
        if (t?.type === 'custom') {
          t.test(teddy, t.template, model, cb)
          return
        }

        // test code that needs to be appended to the playwright page
        if (typeof t.expected === 'string') {
          // must wrap in body tags due to peculiarities in how document.write() works: https://github.com/microsoft/playwright/issues/24503
          await page.setContent('<body>' + t.test(teddy, t.template, model) + '</body>')
          expect(ignoreSpaces(await page.innerHTML('body'))).toStrictEqual(ignoreSpaces(t.expected))
        }

        // test code that is resolved in the test without a callback
        if (typeof t.expected === 'boolean') {
          expect(t.test(teddy, t.template, model)).toBe(t.expected)
        }
      })
    }
  })
}
