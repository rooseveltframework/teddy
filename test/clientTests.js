import { execSync } from 'child_process'
import fs from 'fs'

module.exports = [
  {
    describe: 'Client tests',
    tests: [
      {
        message: 'should be able to be required',
        playwright: async (params, page, expect) => {
          const fileContents = `
const teddy = require('../../dist/teddy.js')
module.exports = { teddy }`

          fs.writeFileSync('test/app/client.js', fileContents)
          const requiredTeddy = require('./app/client.js')
          expect(requiredTeddy)
          fs.unlinkSync('test/app/client.js')
        }
      },
      {
        message: 'should be able to be imported',
        playwright: async (_params, _page, expect) => {
          fs.writeFileSync('test/app/client.mjs', 'import teddy from "../../dist/teddy.js"\nconsole.log(teddy)')
          const output = execSync('node ./test/app/client.mjs').toString()
          expect(output).toContain("params: { verbosity: 1, templateRoot: './', maxPasses: 1000 }")
          fs.unlinkSync('test/app/client.mjs')
        }
      }
    ]
  }
]
