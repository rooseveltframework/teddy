if (typeof process === 'object') {
  global.chai = require('chai');
  global.chaiString = require('chai-string');
  global.assert = chai.assert;
  global.makeModel = require('./models/model');
  global.teddy = require('../teddy');
  global.model = makeModel();
}
else {
  var assert = chai.assert, // eslint-disable-line no-unused-vars
      templates = window.__html__,
      i;

  teddy.setVerbosity(0);

  for (i in templates) {
    teddy.templates[i] = teddy.compile(templates[i]);
  }
}

before(function() {
  teddy.setTemplateRoot('test/templates');
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
