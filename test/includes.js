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

  it('should <include> a template with loop arguments (includes/nestedLoop.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/nestedLoop.html', model), '<p>a</p><p>b</p><p>c</p>');
    done();
  });

  it('should ignore and skip rendering orphaned argument (includes/orphanedArgument.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/orphanedArgument.html', model), '<div></div>');
    done();
  });

  it('should print {variable} of included argument (infinite loop bug) (includes/argVariableWithinArg.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/argVariableWithinArg.html', model), '<p>Some content</p>');
    done();
  });
});
