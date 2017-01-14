var chai = require('chai'),
    assert = chai.assert,
    model = require('./models/model')(),
    teddy = require('../teddy');

chai.use(require('chai-string'));

describe('Includes', function() {
  it('should <include> a template (includes/include.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/include.html', model), '<p>Some content</p>');
    done();
  });

  it('should <include> a template whose name is populated by a {variable} (includes/dynamicInclude.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/dynamicInclude.html', model), '<p>Some content</p>');
    done();
  });

  it('should <include> a template with arguments (includes/includeWithArguments.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeWithArguments.html', model), '<p>override</p>');
    done();
  });

  it('should <include> a template with a nested include (includes/nestedInclude.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/nestedInclude.html', model), '<p><p>Some content</p></p>');
    model.escapeTest = '<span>raw html</span>'; // undo changes to global model that this test makes before calling done
    done();
  });
});
