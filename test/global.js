if (typeof process === 'object') {
  global.chai = require('chai');
  global.chaiString = require('chai-string');
  global.assert = chai.assert;
  global.makeModel = require('./models/model');
  global.teddy = require('../teddy');
  global.model = makeModel();
  global.getTemplate = getTemplate;
}

function getTemplate(template) {
  if (typeof process === 'object') {
    return template;
  }
  else {
    return window.__html__[template];
  }
};

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
  else {
    teddy.setVerbosity(0);
  }
});
