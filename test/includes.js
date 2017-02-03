if (typeof module !== 'undefined') {
  var chai = require('chai'),
      chaiString = require('chai-string'),
      assert = chai.assert,
      model,
      makeModel = require('./models/model'),
      teddy = require('../teddy');
  chai.use(chaiString);
}

describe('Includes', function() {
  this.timeout(5000);
  beforeEach(function() {
    model = makeModel();
  });

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

/*
no longer needed?
  it('should prevent recursion abuse (includes/argVariableWithinArg.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/argVariableWithinArg.html', model), 'Render aborted due to max number of passes (' + teddy.params.maxPasses + ') exceeded; there is a possible infinite loop in your template logic.');
    done();
  });
  */

  it('should <include> a template that contains numerical {variables} (includes/numericVarInArg.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/numericVarInArg.html', model), '<p>STRING!</p>');
    done();
  });

  it('should evaluate if statement within style element as an argument (includes/conditionArgInStyle.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/conditionArgInStyle.html', model), '<style>p { height: 20px; }</style>');
    done();
  });

  it('should <include> a template with numeric arguments (includes/numericArgument.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/numericArgument.html', model), '<p>Hello!</p>');
    done();
  });

  it('should escape the contents of a script when included in a template (includes/inlineScriptTag.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/inlineScriptTag.html', model), '<p>Hello!</p><script>console.log(\'Hello world\'); for (var i = 0; i < 2; i++) { console.log(\'Test\') } </script>');
    done();
  });

  it('should evaluate {variable} outside of include as original model value (includes/argRedefineModelVar.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('includes/argRedefineModelVar.html', model), '<style>p { height: 10px; }</style> <p>Some content</p>');
    done();
  });
});
