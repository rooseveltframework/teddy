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

describe('Conditionals', function () {
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

  it('should evaluate <if something> as true (conditionals/if.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/if.html', model), '<p>The variable \'something\' is present</p>')
    done()
  })

  it('should evaluate <if doesntexist> as false and trigger <else> condition (conditionals/ifElse.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifElse.html', model), '<p>The variable \'doesntexist\' is not present</p>')
    done()
  })

  it('should evaluate <if something=\'Some content\'> as true (conditionals/ifValue.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifValue.html', model), '<p>The variable \'something\' is set to \'Some content\'</p>')
    done()
  })

  // #44
  it('should evaluate <if emptyArray> as false (conditionals/ifEmptyArray.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifEmptyArray.html', model), '<p>The variable \'emptyArray\' is considered falsey</p>')
    done()
  })

  it('should evaluate <if something=\'no\'> as false and trigger <else> condition (conditionals/ifElseValue.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifElseValue.html', model), '<p>The variable \'something\' is not set to \'no\'</p>')
    done()
  })

  it('should evaluate <unless doesntexist> as true (conditionals/unless.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unless.html', model), '<p>The variable \'doesntexist\' is not present</p>')
    done()
  })

  it('should evaluate <unless something> as false and trigger <else> condition (conditionals/unlessElse.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessElse.html', model), '<p>The variable \'something\' is present</p>')
    done()
  })

  it('should evaluate nested <unless> tag in the if (conditionals/unlessNestedIf.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessNestedIf.html', model), '<p>The variable \'doesntexist\' is not present</p> <p>The variable \'anotherdoesntexist\' is not present</p>')
    done()
  })

  it('should evaluate nested <unless> tag in the else (conditionals/unlessNestedElse.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessNestedElse.html', model), '<p>The variable \'doesntexist\' is present</p> <p>The variable \'anotherdoesntexist\' is not present</p>')
    done()
  })

  it('should evaluate <unless something> as false and trigger <else> condition with comment in between (conditionals/unlessWithComment.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessWithComment.html', model), '<p>The variable \'something\' is present</p>')
    done()
  })

  it('should evaluate nested <unless> tag in the if with a comment in between (conditionals/unlessNestedIfWithComment.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessNestedIfWithComment.html', model), '<p>The variable \'doesntexist\' is not present</p> <p>The variable \'something\' is present</p>')
    done()
  })

  // #51
  it('should evaluate <unless nullVar> as true (conditionals/unlessNull.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessNull.html', model), '<p>The variable \'nullVar\' is falsey</p>')
    done()
  })

  it('should evaluate <unless something=\'Some content\'> as true (conditionals/unlessValue.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessValue.html', model), '<p>The variable \'something\' is set to \'Some content\'</p>')
    done()
  })

  it('should evaluate <unless something=\'no\'> as false and trigger <else> condition (conditionals/unlessElseValue.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessElseValue.html', model), '<p>The variable \'something\' is not set to \'no\'</p>')
    done()
  })

  it('should evaluate <if something=\'no\'> as false and <elseif somethingElse> as true (conditionals/ifElseIf.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifElseIf.html', model), '<p>The variable \'somethingElse\' is present</p>')
    done()
  })

  it('should evaluate <unless something> as false and <elseunless doesntexist> as true (conditionals/unlessElseUnless.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessElseUnless.html', model), '<p>The variable \'doesntexist\' is not present</p>')
    done()
  })

  it('should evaluate <if something and notDefined> as false (conditionals/and.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/and.html', model), ' <p>and: false</p>')
    done()
  })

  it('should evaluate `and` truth table as <p>and: true</p> (conditionals/andTruthTable.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/andTruthTable.html', model), ' <p>and: true true</p>')
    done()
  })

  it('should evaluate `or` truth table as <p>or: true true</p> <p>or: true false</p> <p>or: false true</p> (conditionals/orTruthTable.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/orTruthTable.html', model), ' <p>or: true true</p> <p>or: true false</p> <p>or: false true</p>')
    done()
  })

  // #24
  it('should evaluate <if something=\'Some content\' or something=\'Nope\'> as true (conditionals/orSameVar.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/orSameVar.html', model), ' <p>or: true</p>')
    done()
  })

  it('should evaluate <if something xor somethingElse> as false (conditionals/xor.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/xor.html', model), ' <p>xor: false</p>')
    done()
  })

  it('should evaluate <if something and notDefined or somethingElse> as true (conditionals/andOr.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/andOr.html', model), ' <p>and + or: true</p>')
    done()
  })

  it('should evaluate <if not:something> as false and <if not:noExist> as true (conditionals/not.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/not.html', model), ' <p>not: false</p><p>not: true</p>')
    done()
  })

  it('should evaluate one line if "if-something" as true (conditionals/oneLine.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLine.html', model), '<p class=\'something-is-present\'>One line if.</p>')
    done()
  })

  it('should evaluate one line if "if-something" as true when attributes are split across multiple lines (conditionals/oneLineNewLine.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineNewLine.html', model), '<p class=\'something-is-present\'>One line if.</p>')
    done()
  })

  it('should evaluate one line if "if-something" as true in self-closing element (conditionals/oneLineSelfClosing.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineSelfClosing.html', model), '<input class=\'something-is-present\'/>')
    done()
  })

  it('should evaluate one line if "if-something" as true when result includes slash (/) characters (conditionals/oneLineWithSlash.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineWithSlash.html', model), '<a href=\'/something\'>One line if.</a>')
    done()
  })

  // #36
  it('should evaluate one line if "if-something" as true with no false condition supplied (conditionals/oneLineTrueOnly.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineTrueOnly.html', model), '<p class=\'something-is-present\'>One line if.</p>')
    done()
  })

  it('should evaluate one line if "if-something=\'Some content\'" as true (conditionals/oneLineValue.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineValue.html', model), '<p class=\'something-is-value\'>One line if.</p>')
    done()
  })

  it('should evaluate one line if "if-something.something={something}" as false and remove attributes (conditionals/oneLineValueVars.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineValueVars.html', model), '<option value=\'Some content\'>Some content</option>')
    done()
  })

  it('should evaluate one line if "if-something=\'Some content\'" as true and still add the id attribute regardless of the if statement outcome (conditionals/oneLineValueWithAdditionalAttributesNotImpactedByIf.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineValueWithAdditionalAttributesNotImpactedByIf.html', model), '<p class=\'something-is-present\' id=\'someId\'>One line if.</p><p id=\'someId\'>One line if.</p><p disabled id=\'someId\'>One line if.</p><option selected value=\'3\'>One line if.</option><option value=\'3\' selected>One line if.</option>')
    done()
  })

  // #46
  it('should evaluate one line if "if-something=\'\'" as false (conditionals/oneLineEmpty.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineEmpty.html', model), '<p class=\'something-is-not-empty\'>One line if.</p>')
    done()
  })

  // #48
  it('should evaluate both one line ifs "if-something" as true twice and apply two classes (conditionals/oneLineMulti.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineMulti.html', model), '<p class=\'something-is-present\' data-only-renders-when-something-is-not-empty data-should-render>One line if.</p>')
    done()
  })

  it('should parse nested conditionals correctly (conditionals/nestedConditional.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/nestedConditional.html', model), '<p>The variable \'something\' and \'somethingElse\' are both present</p>')
    done()
  })

  it('should render nothing if condition isn\'t met (conditionals/ifNotPresent.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifNotPresent.html', model), '<div></div>')
    done()
  })

  it('should resolve conditional as true if object is defined. (conditionals/ifObjectExistsConditional.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifObjectExistsConditional.html', model), '<p>This paragraph should be present</p>')
  })

  it('should evaluate one line if as false and apply no class (conditionals/oneLineFalse.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineFalse.html', model), '<p></p>')
    done()
  })

  it('should evaluate if statement that contains an element with a regex pattern (conditionals/ifEscapeRegex.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifEscapeRegex.html', model), '<input type=\'text\' name=\'date\' placeholder=\'DD/MM/YYYY\' id=\'date\' pattern=\'^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$\'>')
    done()
  })

  it('should evaluate if statement that queries the same variable more than once (conditionals/duplicateVarInline.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/duplicateVarInline.html', model), '<p>True</p>')
    done()
  })

  it('should evaluate if statement with multiple instances of the same operators inline (conditionals/duplicateOperatorInline.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/duplicateOperatorInline.html', model), '<p>True</p>')
    done()
  })

  it('should evaluate <if noExist> containing regex pattern as false and trigger <else> condition (conditionals/ifElseRegex.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifElseRegex.html', model), '<p>False</p>')
    done()
  })

  it('should evaluate if statement where elseif condition is a three character named object (conditionals/ifNestedProperties.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifNestedProperties.html', model), '<p>Should render</p>')
    done()
  })

  it('should evaluate one line if "if-something" as true with quote types reversed (conditionals/oneLineReverseQuotes.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineReverseQuotes.html', model), '<p class="something-true">One line if.</p>')
    done()
  })

  it('should evaluate one line if "if-something" as true with quote types reversed and a variable result (conditionals/oneLineReverseQuotesVar.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineReverseQuotesVar.html', model), '<p class="Some content">One line if.</p>')
    done()
  })

  it('should ignore \'if-\' when not part of an if statement. (conditionals/ifOutsideIf.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifOutsideIf.html', model), '<p> gif-something-jpg-png </p>')
    done()
  })

  it('should ignore \'if-\' when not part of an if statement with a varibale. (conditionals/variableIfOutsideIf.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/varIfOutsideIf.html', model), '<p> gif-Some content-jpg-png </p>')
    done()
  })

  it('should ignore \'if-\' when not part of an if statement when combined with a normal if statement. (conditionals/nestedIfOutsideIf.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/nestedIfOutsideIf.html', model), '<p> gif-jpg-png If that should not be parsed, How art thou? </p>')
    done()
  })

  it('should ignore \'if-\' when not part of an if statement when combined with a one line if statement. (conditionals/oneLineIfOutsideIf.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineIfOutsideIf.html', model), '<p> gif-jpg-png <p class=\'something-is-present\'> hello </p> </p>')
    done()
  })

  it('should ignore \'if-\' when not part of an if statement when \'if-\' is part of an attribute\'s value', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineIfInsideAttribute.html', model), '<p id=\'gif-jpg-png\'>hello</p> <p class=\'gif-jpg-png\'>hello</p><p filter=\'gif-jpg-png\'>hello</p>')
    done()
  })

  it('should ignore \'if-\' when not part of an if statement when combined with a one line if statement, reversed. (conditionals/oneLineIfOutsideIfReverse.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineIfOutsideIfReverse.html', model), '<p class=\'something-is-present\'>  gif-jpg-png </p>')
    done()
  })

  it('should evaluate 5000 one line ifs in under 5000ms (conditionals/oneLinePerformance.html)', function (done) {
    var start, end, time
    start = new Date().getTime()

    teddy.render('conditionals/oneLinePerformance.html', model)

    end = new Date().getTime()
    time = end - start

    assert.isAtMost(time, 5000)

    done()
  })

  it('should evaluate <if doesntexist> as false and trigger <else> condition containing very few characters (conditionals/ifElseLowChars.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifElseLowChars.html', model), '<p>B</p>')
    done()
  })

  it('should evaluate <if doesntexist> as false and trigger <else> condition with preceding HTML comment (conditionals/ifCommentElse.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifCommentElse.html', model), '<!-- HTML comment --><p>The variable \'doesntexist\' is not present</p>')
    done()
  })

  it('should evaluate <if doesntexist> as false and trigger <else> condition with multiple preceding HTML comments (conditionals/ifMultipleCommentsElse.html)', function (done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifMultipleCommentsElse.html', model), '<!-- HTML comment --><!-- MOAR HTML comments --><p>The variable \'doesntexist\' is not present</p>')
    done()
  })
})
