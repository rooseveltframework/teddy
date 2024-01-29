const path = require('path')
const fs = require('fs')
const teddy = require('../../teddy.js').default

function checkForSkipAndOnly (array) {
  // check for skip
  if (array.some(item => item.skip)) {
    array = array.filter(item => !item.skip)
  }

  // check for only
  if (array.some(item => item.only)) {
    array = array.filter(item => item.only)
  }

  return array
}

// pre-register teddy templates
async function registerTemplates (dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const fileStat = fs.statSync(filePath)

    if (fileStat.isDirectory()) {
      // run again until file is found
      registerTemplates(filePath)
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
  checkForSkipAndOnly,
  registerTemplates
}
