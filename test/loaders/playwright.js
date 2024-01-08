import { test, expect } from '@playwright/test'
import teddy from '../../teddy.js'
import makeModel from '../models/model.js'
import testConditions from '../testConditions.js'
import { ignoreSpaces } from '../testUtils.js'
import fs from 'fs'
import path from 'path'

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

for (const tc of testConditions) {
  // run the tests
  test.describe(tc.describe, () => {
    let model

    test.beforeAll(() => {
      // this ensures that teddy is not using the fs module to retrieve templates
      teddy.setTemplateRoot('test/noTemplatesHere')
      model = makeModel()
    })

    for (const t of tc.tests) {
      test(t.message, async ({ page }) => {
        if (typeof t.expected === 'string') {
          // must wrap in body tags due to peculiarities in how document.write() works: https://github.com/microsoft/playwright/issues/24503
          await page.setContent('<body>' + t.test(teddy, t.template, model) + '</body>')
          expect(ignoreSpaces(await page.innerHTML('body'))).toStrictEqual(ignoreSpaces(t.expected))
        } else if (typeof t.expected === 'boolean') {
          expect(t.test(teddy, t.template, model)).toBe(t.expected)
        }
      })
    }
  })
}
