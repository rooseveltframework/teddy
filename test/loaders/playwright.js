import { test, expect } from '@playwright/test'
import teddy from '../../teddy.js'
import makeModel from '../models/model.js'
import testConditions from '../testConditions.js'
import fs from 'fs'
import path from 'path'

// const { test, expect } = require('@playwright/test')
// const teddy = require('../../')
// const makeModel = require('../models/model')
// const testConditions = require('../testConditions')
// const fs = require('fs')
// const path = require('path')

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
        await page.setContent(t.test(teddy, t.template, model))
        expect(await page.innerHTML('body')).toMatch(t.expected)
      })
    }
  })
}
