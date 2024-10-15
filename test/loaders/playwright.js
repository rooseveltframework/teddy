import { test, expect } from '@playwright/test'
import makeModel from '../models/model.js'
import testConditions from '../tests.js'
import { ignoreSpaces } from '../testUtils.js'
import { sanitizeTests, registerTemplates } from './loaderUtils.js'
import teddy from '../../teddy.js'

// TODO: refactor this loader to import teddy from within the page's DOM so we can import the version of teddy without cheerio

const conditions = sanitizeTests(testConditions)

for (const tc of conditions) {
  test.describe(tc.describe, () => {
    // let coverageObj
    let model

    test.beforeAll(() => {
      // this ensures that teddy is not using the fs module to retrieve templates
      teddy.setTemplateRoot('test/noTemplatesHere')
      registerTemplates(teddy, 'test/templates')
      model = makeModel()
    })

    for (const t of tc.tests) {
      test(t.message, async ({ page }) => {
        // callback function used on custom and asynchronous tests
        const cb = (result, expected = true) => {
          if (typeof expected === 'string') {
            expected = ignoreSpaces(expected)
          }
          expect(ignoreSpaces(result)).toBe(expected)
        }

        if (t.playwright) {
          const params = { teddy, model, template: t.template }
          await t.playwright(params, page, expect)
        } else if (t?.type === 'async') { // test asynchronous code
          if (!t.expected) {
            await t.test(teddy, t.template, model, cb)
          } else if (typeof t.expected === 'string') {
            const content = await t.test(teddy, t.template, model, cb)
            await page.setContent('<div id="content"></div>')
            await page.evaluate((html) => {
              document.getElementById('content').textContent = html
            }, content)
            expect(ignoreSpaces(await page.evaluate(() => document.getElementById('content').textContent))).toEqual(ignoreSpaces(t.expected))
          } else if (typeof t.expected === 'boolean') {
            expect(t.test(teddy, t.template, model, cb)).toBe(t.expected)
          }
        } else if (t?.type === 'custom') { // test code that is handled within that test (with use of a callback)
          t.test(teddy, t.template, model, cb)
        } else if (typeof t.expected === 'string') { // test code that needs to be appended to the playwright page
          const content = t.test(teddy, t.template, model)
          await page.setContent('<div id="content"></div>')
          await page.evaluate((html) => {
            document.getElementById('content').textContent = html
          }, content)
          expect(ignoreSpaces(await page.evaluate(() => document.getElementById('content').textContent))).toStrictEqual(ignoreSpaces(t.expected))
        } else if (typeof t.expected === 'boolean') { // test code that is resolved in the test without a callback
          expect(t.test(teddy, t.template, model)).toBe(t.expected)
        }
      })
    }
  })
}
