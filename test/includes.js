/* eslint-env mocha */

if (typeof process === 'object') {
  var chai = require('chai')
  var assert = chai.assert
  var chaiString = require('chai-string')
  var makeModel = require('./models/model')
  var teddy = require('../teddy')
  var model

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

  it('should <include> a template but not parse any teddy features (includes/includeNoParsingFeature.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeNoParsingFeature.html', model), '{!should evaluate <if emptyArray> as false!}<if emptyArray><p>The variable \'emptyArray\' is considered truthy</p></if><else><p>The variable \'emptyArray\' is considered falsey</p></else>')
    done()
  })

  it('should <include> a template but not parse any teddy features (includes/includeNoTeddyFeature.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeNoTeddyFeature.html', model), '{!should remove {! server side comments !}!}<p>test {! this should be removed !} test</p>')
    done()
  })

  it('should <include> a template as an argument but not parse any teddy features (includes/includeNoTeddyFeatureAsArgument.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeNoTeddyFeatureAsArgument.html', model), '{!should remove {! server side comments !}!}<p>test {! this should be removed !} test</p>')
    done()
  })

  it('should <include> a template as an argument but not parse any teddy features (includes/includeNoParsingFeatureAsArgument.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeNoParsingFeatureAsArgument.html', model), '{!should remove {! server side comments !}!}<p>test {! this should be removed !} test</p>')
    done()
  })

  it('should <include> all templates and only parse those without the noteddy tag (includes/includeMultipleTemplatesWithNoParseTag.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeMultipleTemplatesWithNoParseTag.html', model), '{!should remove {! server side comments !}!}<p>test {! this should be removed !} test</p> <p>test test</p> {!should remove {! server side comments !}!}<p>test {! this should be removed !} test</p>')
    done()
  })

  it('should <include> all templates and only parse those without the noparse tag (includes/includeMultipleTemplatesWithNoTeddyTag.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeMultipleTemplatesWithNoTeddyTag.html', model), '{!should remove {! server side comments !}!}<p>test {! this should be removed !} test</p> <p>test test</p> {!should remove {! server side comments !}!}<p>test {! this should be removed !} test</p>')
    done()
  })

  it('should <include> a template whose name is populated by a {variable} (includes/dynamicInclude.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/dynamicInclude.html', model), '<p>Some content</p>')
    done()
  })

  it('should <include> a template with arguments (includes/includeWithArguments.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeWithArguments.html', model), '<p>override</p>')
    done()
  })

  it('should <include> a template with a nested include (includes/nestedInclude.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/nestedInclude.html', model), '<p><p>Some content</p></p>')
    done()
  })

  it('should <include> a template with a nested include passing a text argument (includes/nestedIncludeWithArg.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/nestedIncludeWithArg.html', model), '<p><p>nested</p></p>')
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

  it('should evaluate if statement within style element as an argument (includes/conditionArgInStyle.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/conditionArgInStyle.html', model), '<style>p { height: 20px; }</style>')
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

  it('should <include> a template and escape regex pattern in argument (includes/includeEscapeRegex.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/includeEscapeRegex.html', model), '<input type=\'text\' name=\'date\' placeholder=\'DD/MM/YYYY\' id=\'date\' pattern=\'^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$\'>')
    done()
  })

  it('should ignore includes with invalid markup (includes/invalidIncludeMarkup.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/invalidIncludeMarkup.html', model), '<div></div>')
    done()
  })

  it('should escape from infinite loop of includes via setMaxPasses (includes/includeInfiniteLoop.html)', function (done) {
    teddy.setMaxPasses(100)
    assert.strictEqual(teddy.render('includes/includeInfiniteLoop.html', model), 'Render aborted due to max number of passes (100) exceeded; there is a possible infinite loop in your template logic.')
    done()
  })

  it('should evaluate a nested reverse quotes oneliner with an arg passed to it (includes/nestedOneliner.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('includes/nestedOneliner', model), '<p class="Some content">One line if.</p>')
    done()
  })
})
