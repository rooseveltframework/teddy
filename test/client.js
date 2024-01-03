// Initialization of assert and teddy templates for karma client tests

if (typeof process !== 'object') {
  var assert = chai.assert // eslint-disable-line
  var templates = window.__html__ // eslint-disable-line
  var i // eslint-disable-line

  teddy.setVerbosity(0) // eslint-disable-line

  for (i in templates) {
    teddy.setTemplate(i, templates[i]) // eslint-disable-line
  }
}
