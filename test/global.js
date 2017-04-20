var assert;

if (typeof process === 'object') {
  global.chai = require('chai');
  global.chaiString = require('chai-string');
  global.assert = chai.assert;
  global.makeModel = require('./models/model');
  global.teddy = require('../teddy');
  global.model;
}
else {
  assert = chai.assert;
}

before(function() {
  teddy.setTemplateRoot('test/templates');
  console.warn(teddy.compile('misc/templateToMinify.html', model));
  model = makeModel();
  if (typeof process === 'object') {
    chai.use(chaiString);
    if (process.env.NODE_ENV === 'test') {
      teddy.setVerbosity(0);
    }
    else if (process.env.NODE_ENV === 'cover') {
      teddy.setVerbosity(3);
    }
  }
});
