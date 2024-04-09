import { test, expect } from '@playwright/test'
import makeModel from '../models/model.js'
import testConditions from '../tests.js'
import { ignoreSpaces } from '../testUtils.js'
import { sanitizeTests, registerTemplates } from './loaderUtils.js'
import teddy from '../../teddy.js'
import fs from 'fs'

const conditions = sanitizeTests(testConditions)

for (const tc of conditions) {
  test.describe(tc.describe, () => {
    let coverageObj
    let model

    test.beforeAll(() => {
      coverageObj = { result: [] }

      // this ensures that teddy is not using the fs module to retrieve templates
      teddy.setTemplateRoot('test/noTemplatesHere')
      registerTemplates(teddy, 'test/templates')
      model = makeModel()
    })

    test.afterAll(() => {
      console.log('🚀 fires', coverageObj)
      // write the coverage
      fs.mkdirSync('coverage/tmp', { recursive: true })
      fs.writeFileSync('coverage/tmp/coverage-playwright.json', JSON.stringify(coverageObj))
    })

    for (const t of tc.tests) {
      test(t.message, async ({ page, browserName }) => {
        if (browserName === 'chromium') {
          await page.coverage.startJSCoverage({
            reportAnonymousScripts: true
          })
        }

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
            // must wrap in body tags due to peculiarities in how document.write() works: https://github.com/microsoft/playwright/issues/24503
            await page.setContent('<body>' + await t.test(teddy, t.template, model, cb) + '</body>')
            expect(ignoreSpaces(await page.innerHTML('body'))).toEqual(ignoreSpaces(t.expected))
          } else if (typeof t.expected === 'boolean') {
            expect(t.test(teddy, t.template, model, cb)).toBe(t.expected)
          }
        } else if (t?.type === 'custom') { // test code that is handled within that test (with use of a callback)
          t.test(teddy, t.template, model, cb)
        } else if (typeof t.expected === 'string') { // test code that needs to be appended to the playwright page
          // must wrap in body tags due to peculiarities in how document.write() works: https://github.com/microsoft/playwright/issues/24503
          await page.setContent('<body>' + t.test(teddy, t.template, model) + '</body>')
          expect(ignoreSpaces(await page.innerHTML('body'))).toStrictEqual(ignoreSpaces(t.expected))
        } else if (typeof t.expected === 'boolean') { // test code that is resolved in the test without a callback
          expect(t.test(teddy, t.template, model)).toBe(t.expected)
        }

        if (browserName === 'chromium') {
          const coverage = await page.coverage.stopJSCoverage()
          coverage.forEach(item => {
            delete item.source
            // item.url = process.cwd()
          })
          console.log(coverage)
          coverageObj.result.push(...coverage)
        }

        await page.close()
      })
    }
  })
}
