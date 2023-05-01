/* eslint-env mocha */

if (typeof process === 'object') {
  const chai = require('chai')
  var assert = chai.assert // eslint-disable-line
  const chaiString = require('chai-string')
  var makeModel = require('./models/model') // eslint-disable-line
  var teddy = require('../') // eslint-disable-line
  var model // eslint-disable-line

  chai.use(chaiString)
}

describe('Includes', function () {
  before(function () {
    teddy.setTemplateRoot('test/templates')
    model = makeModel()
    if (typeof process === 'object') {
      if (process.env.NODE_ENV === 'test') {
        teddy.setVerbosity(0)
      } else if (process.env.NODE_ENV === 'cover') {
        teddy.setVerbosity(3)
      }
    }
  })

  it('should <include> a template (includes/include.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/include.html', model), '<p>Some content</p>')
    done()
  })

  it('should <include> all templates (includes/includeMultipleTemplates.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeMultipleTemplates.html', model), '<p>test test</p> <p>test test</p> <p>test test</p>')
    done()
  })

  it('should <include> a template whose name is populated by a {variable} (includes/dynamicInclude.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/dynamicInclude.html', model), '<p>Some content</p>')
    done()
  })

  it('should populate <include> <arg> in the child template; the class should render (includes/includeArgCheckedByOneLineIfWrapper.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeArgCheckedByOneLineIfWrapper.html', model), '<p class="populated">Is it populated? populated</p>')
    done()
  })

  it('should <include> a template with arguments (includes/includeWithArguments.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeWithArguments.html', model), '<p>override</p>')
    done()
  })

  it('should <include> a template with a nested include (includes/nestedInclude.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/nestedInclude.html', model), '<div><p>Some content</p></div>')
    done()
  })

  it('should <include> a template with a nested include passing a text argument (includes/nestedIncludeWithArg.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/nestedIncludeWithArg.html', model), '<div><p>nested</p></div>')
    done()
  })

  it('should <include> a template with loop arguments (includes/nestedLoop.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/nestedLoop.html', model), '<p>a</p><p>b</p><p>c</p>')
    done()
  })

  it('should ignore and skip rendering orphaned argument (includes/orphanedArgument.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/orphanedArgument.html', model), '<div></div>')
    done()
  })

  it('should <include> a template that contains loops and variables with an argument (includes/includeLoopsAndVars.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeLoopsAndVars.html', model), '<p>a</p><p>b</p><p>c</p><p>world</p><p>guy</p>')
    done()
  })

  it('should <include> a template that contains numerical {variables} (includes/numericVarInArg.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/numericVarInArg.html', model), '<p>STRING!</p>')
    done()
  })

  it('should <include> a template with numeric arguments (includes/numericArgument.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/numericArgument.html', model), '<p>Hello!</p>')
    done()
  })

  it('should escape the contents of a script when included in a template (includes/inlineScriptTag.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/inlineScriptTag.html', model), '<p>Hello!</p><script>console.log(\'Hello world\'); for (var i = 0; i < 2; i++) { console.log(\'Test\') } </script>')
    done()
  })

  it('should evaluate {variable} outside of include as original model value (includes/argRedefineModelVar.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/argRedefineModelVar.html', model), '<style>p { height: 10px; }</style> <p>Some content</p>')
    done()
  })

  it('should prevent recursion abuse (includes/argVariableWithinArg.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/argVariableWithinArg.html', model), '<p>Some content</p>')
    done()
  })

  it('should <include> a template and render pageContent inside of <if> (includes/includeIfContent.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeIfContent.html', model), '<p>hello</p>')
    done()
  })

  it('should <include> a template and render pageContent <arg> contents and correctly parse <if>, <loop>, and <if> tags (includes/includeComplexContent.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeComplexContent.html', model), '<section class="content"><article class="thing"><section class="blah">other_prop_one</section></article><article class="thing"><section class="blah">other_prop_two</section></article></section>')
    done()
  })

  it('should <include> a template and escape regex pattern in argument (includes/includeEscapeRegex.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeEscapeRegex.html', model), '<input type="text" name="date" placeholder="DD/MM/YYYY" id="date" pattern="^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$">')
    done()
  })

  it('should ignore includes with invalid markup (includes/invalidIncludeMarkup.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/invalidIncludeMarkup.html', model), '<div><p>Some content</p></div>')
    done()
  })

  it('should escape from infinite loop of includes via setMaxPasses (includes/includeInfiniteLoop.html)', function (done) {
    teddy.setVerbosity(3)
    teddy.setMaxPasses(100)
    try {
      teddy.render('includes/includeInfiniteLoop.html', model)
    } catch (e) {
      assert.strictEqual(e.message, 'teddy could not finish rendering the template because the max number of passes over the template (100) was exceeded; there may be an infinite loop in your template logic')
    }
    done()
  })

  it('should evaluate a nested reverse quotes oneliner with an arg passed to it (includes/nestedOneliner.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/nestedOneliner', model), '<p class="Some content">One line if.</p>')
    done()
  })

  it('should populate <include> <arg> in the child template (includes/includeArgCheckedByOneLineIfWrapper.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeArgCheckedByOneLineIfWrapper', model), '<p class="populated">Is it populated? populated</p>')
    done()
  })
})
