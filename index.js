import teddy from './teddy.js'
import makeModel from './test/models/model.js'

const model = makeModel()

teddy.setTemplateRoot('test/templates')
teddy.setVerbosity(3)
teddy.setMaxPasses(100)

try {
  teddy.render('includes/includeInfiniteLoop.html', model)
  console.log(teddy.render('includes/includeInfiniteLoop.html', model))
} catch (error) {
  console.error(error)
}
