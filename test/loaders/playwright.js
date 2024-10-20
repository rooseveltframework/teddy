import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { test as playwrightTest } from '@playwright/test'
import { loadTests } from './loadTests.js'
import makeModel from '../model.js'
import testGroups from '../tests.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const testsToRun = loadTests(testGroups)

// pre-register teddy templates
function registerTemplates (dir) {
  const templates = []

  function readDir (directory) {
    const files = fs.readdirSync(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const fileStat = fs.statSync(filePath)

      if (fileStat.isDirectory()) {
        readDir(filePath)
      } else if (filePath.includes('.html')) {
        const relativePath = path.relative(dir, filePath).replace(/\\/g, '/')
        const content = fs.readFileSync(filePath, 'utf-8').replace(/\n/g, '')
        templates.push({
          path: relativePath,
          content
        })
      }
    }
  }

  readDir(dir)
  return templates
}
const templates = registerTemplates('test/templates')

function runPlaywrightAgainstTeddyBundle (teddyPath) {
  playwrightTest.describe('Test that client-side bundles load', () => {
    const teddyNonMinified = path.resolve(__dirname, '../../dist/teddy.js')
    const teddyMinified = path.resolve(__dirname, '../../dist/teddy.min.js')

    playwrightTest(`Load ${teddyNonMinified}`, async ({ page }) => {
      // to debug, uncomment this:
      // page.on('console', (msg) => console.log(msg))
      // for deeper debugging: export DEBUG=pw:browser

      await page.addScriptTag({ path: teddyNonMinified }) // add teddy script tag to the browser page
      await page.evaluate(async () => {
        if (!window?.teddy?.setTemplateRoot) throw new Error(`Assertion failed: expected ${teddyNonMinified} to load`)
      })
    })
    playwrightTest(`Load ${teddyMinified}`, async ({ page }) => {
      // to debug, uncomment this:
      // page.on('console', (msg) => console.log(msg))
      // for deeper debugging: export DEBUG=pw:browser

      await page.addScriptTag({ path: teddyMinified }) // add teddy script tag to the browser page
      await page.evaluate(async () => {
        if (!window?.teddy?.setTemplateRoot) throw new Error(`Assertion failed: expected ${teddyMinified} to load`)
      })
    })
  })

  // run the main test suite
  const fileName = teddyPath.split('/').pop()
  for (const testGroup of testsToRun) {
    playwrightTest.describe(`${testGroup.describe} (dist/${fileName})`, () => {
      for (const test of testGroup.tests) {
        if (test.skip) continue
        if (test.runPlaywright) test.run = test.runPlaywright
        if (!test.run) continue
        else {
          playwrightTest(`${test.message} (dist/${fileName})`, async ({ page }) => {
            // to debug, uncomment this:
            // page.on('console', (msg) => console.log(msg))
            // for deeper debugging: export DEBUG=pw:browser

            const model = makeModel()

            // set an initial DOM
            await page.setContent(`<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width,initial-scale=1">
                <meta name="format-detection" content="telephone=no">
                <title>Teddy Playwright Tests</title>
              </head>
              <body>
              </body>
            </html>`)
            await page.addScriptTag({ path: test.bundle || teddyPath }) // add teddy script tag to the browser page
            test.run = test.run?.toString() || '' // can't pass functions to page.evaluate, so we need to stringify the test.run function

            await page.evaluate(async (params) => {
              const { test, templates, model } = params

              // load templates into browser context
              for (const template of templates) window.teddy.setTemplate(template.path, template.content)
              window.teddy.setTemplateRoot('test/templates')

              // fix the Set test by remaking the Set
              model.set = new Set(['a', 'b', 'c'])

              // convert test.run method back from string to an actual excutable function
              test.run = eval(test.run) // eslint-disable-line
              await test.run(window.teddy, test.template, model, teddyAssert, test.expected)

              function teddyAssert (result, expected = true) {
                result = ignoreSpaces(result)
                if (typeof expected === 'string') expected = ignoreSpaces(expected)
                if (Array.isArray(expected)) {
                  let match = false
                  for (let acceptable of expected) {
                    acceptable = ignoreSpaces(acceptable)
                    if (result === acceptable) match = true
                  }
                  if (!match) throw new Error(`Assertion failed: expected ${expected}, got ${ignoreSpaces(result)}`)
                } else if (result !== expected) {
                  throw new Error(`Assertion failed: expected ${expected}, got ${ignoreSpaces(result)}`)
                }
              }

              function ignoreSpaces (str) {
                if (typeof str !== 'string') return str
                return str.replace(/\s/g, '')
              }
            }, { test, templates, model })
          })
        }
      }
    })
  }
}

runPlaywrightAgainstTeddyBundle(path.resolve(__dirname, '../../dist/teddy.js'))
// runPlaywrightAgainstTeddyBundle(path.resolve(__dirname, '../../dist/teddy.min.js')) // uncomment to run the test suite against the minified bundle too
