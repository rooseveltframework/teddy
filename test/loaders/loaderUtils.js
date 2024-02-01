const path = require('path')
const fs = require('fs')

function sanitizeTests (conditions) {
  // search condition tests for only's
  if (conditions.some(condition => condition.tests.some(test => test?.only))) {
    conditions = conditions.filter(condition => condition.tests.some(test => test.only))
  }

  // check for condition skip
  if (conditions.some(condition => condition.skip)) {
    conditions = conditions.filter(condition => !condition.skip)
  }

  // check for condition only
  if (conditions.some(condition => condition.only)) {
    conditions = conditions.filter(condition => condition.only)
  }

  // check condition tests
  for (const condition of conditions) {
    // check for test skip
    if (condition.tests.some(test => test.skip)) {
      condition.tests = condition.tests.filter(test => !test.skip)
    }

    // check for test only
    if (condition.tests.some(test => test.only)) {
      condition.tests = condition.tests.filter(test => test.only)
    }
  }

  return conditions
}

// pre-register teddy templates
function registerTemplates (teddy, dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const fileStat = fs.statSync(filePath)

    if (fileStat.isDirectory()) {
      // run again until file is found
      registerTemplates(teddy, filePath)
    } else {
      // remove unneeded path and filetype
      const path = filePath.replace('test/templates/', '').replace('.html', '')

      // set teddy template with file contents
      const content = fs.readFileSync(filePath, 'utf-8')
      teddy.setTemplate(path, content.replace(/\n/g, ''))
    }
  }
}

module.exports = {
  sanitizeTests,
  registerTemplates
}
