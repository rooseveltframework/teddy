const playwright = require('@playwright/test')
const { test, expect } = playwright
const teddy = require('../../teddy.js').default
const makeModel = require('../models/model.js')
const testConditions = require('../tests.js')
const testUtils = require('../testUtils.js')
const { ignoreSpaces } = testUtils
const fs = require('fs')
const path = require('path')

teddy.setVerbosity(0)

// pre-register teddy templates
;(function registerTemplates (dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const fileStat = fs.statSync(filePath)

    if (fileStat.isDirectory()) {
      // run again until file is found
      registerTemplates(filePath)
    } else {
      const path = filePath.replace('test/templates/', '')

      // set teddy template with file contents
      const content = fs.readFileSync(filePath, 'utf-8')
      teddy.setTemplate(path, content)
    }
  }
})('test/templates')

let conditions = testConditions.filter(condition => (!condition?.skip || !condition.skip))

if (conditions.some(condition => condition.only)) {
  conditions = conditions.filter(condition => condition.only)
}

for (const tc of conditions) {
  test.describe(tc.describe, () => {
    let model

    test.beforeAll(() => {
      // this ensures that teddy is not using the fs module to retrieve templates
      teddy.setTemplateRoot('test/noTemplatesHere')
      model = makeModel()
    })

    for (const t of tc.tests) {
      if (t.skip) continue

      test(t.message, async ({ page }) => {
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
