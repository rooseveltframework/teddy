
if (typeof process !== 'object') {
  var assert = chai.assert
  var templates = window.__html__
  var i

  teddy.setVerbosity(0)

  for (i in templates) {
    teddy.setTemplate(i, templates[i])
  }
}
