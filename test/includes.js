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

  it('should <include> a template that contains loops and variables with an argument (includes/includeLoopsAndVars.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeLoopsAndVars.html', model), '<p>a</p><p>b</p><p>c</p><p>world</p><p>guy</p>');
    done();
  });

  it('should prevent recursion abuse (includes/argVariableWithinArg.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/argVariableWithinArg.html', model), 'Render aborted due to max number of passes (' + teddy.params.maxPasses + ') exceeded; there is a possible infinite loop in your template logic.');
    done();
  });

  it('should <include> a template that contains numerical {variables} (includes/numericVarInArg.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/numericVarInArg.html', model), '<p>STRING!</p>');
    done();
  });

  it('should evaluate if statement within style element as an argument (includes/conditionArgInStyle.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/conditionArgInStyle.html', model), '<style>#p { height: 20px; }</style>');
    done();
  });

  it('should <include> a template with numeric arguments (includes/numericArgument.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/numericArgument.html', model), '<p>Hello!</p>');
    done();
  });
});
