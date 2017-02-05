if (typeof module !== 'undefined') {
  var chai = require('chai'),
      chaiString = require('chai-string'),
      assert = chai.assert,
      model,
      makeModel = require('./models/model'),
      teddy = require('../teddy');
  chai.use(chaiString);
}

describe('Conditionals', function() {
  before(function() {
    teddy.setTemplateRoot('test/templates');
    model = makeModel();
  });

  it('should evaluate <if something> as true (conditionals/if.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/if.html', model), '<p>The variable \'something\' is present</p>');
    done();
  });

  it('should evaluate <if doesntexist> as false and trigger <else> condition (conditionals/ifElse.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifElse.html', model), '<p>The variable \'doesntexist\' is not present</p>');
    done();
  });

  it('should evaluate <if something=\'Some content\'> as true (conditionals/ifValue.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifValue.html', model), '<p>The variable \'something\' is set to \'Some content\'</p>');
    done();
  });

  // #44
  it('should evaluate <if emptyArray> as false (conditionals/ifEmptyArray.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifEmptyArray.html', model), '<p>The variable \'emptyArray\' is considered falsey</p>');
    done();
  });

  it('should evaluate <if something=\'no\'> as false and trigger <else> condition (conditionals/ifElseValue.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifElseValue.html', model), '<p>The variable \'something\' is not set to \'no\'</p>');
    done();
  });

  it('should evaluate <unless doesntexist> as true (conditionals/unless.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unless.html', model), '<p>The variable \'doesntexist\' is not present</p>');
    done();
  });

  it('should evaluate <unless doesntexist> as true (conditionals/unless.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unless.html', model), '<p>The variable \'doesntexist\' is not present</p>');
    done();
  });

  // #51
  it('should evaluate <unless nullVar> as true (conditionals/unlessNull.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessNull.html', model), '<p>The variable \'nullVar\' is falsey</p>');
    done();
  });

  it('should evaluate <unless something=\'Some content\'> as true (conditionals/unlessValue.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessValue.html', model), '<p>The variable \'something\' is set to \'Some content\'</p>');
    done();
  });

  it('should evaluate <unless something=\'no\'> as false and trigger <else> condition (conditionals/unlessElseValue.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessElseValue.html', model), '<p>The variable \'something\' is not set to \'no\'</p>');
    done();
  });

  it('should evaluate <if something=\'no\'> as false and <elseif somethingElse> as true (conditionals/ifElseIf.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifElseIf.html', model), '<p>The variable \'somethingElse\' is present</p>');
    done();
  });

  it('should evaluate <unless something> as false and <elseunless doesntexist> as true (conditionals/unlessElseUnless.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/unlessElseUnless.html', model), '<p>The variable \'doesntexist\' is not present</p>');
    done();
  });

  it('should evaluate <if something and notDefined> as false (conditionals/and.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/and.html', model), ' <p>and: false</p>');
    done();
  });

  it('should evaluate `and` truth table as <p>and: true</p> (conditionals/andTruthTable.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/andTruthTable.html', model), ' <p>and: true true</p>');
    done();
  });

  it('should evaluate `or` truth table as <p>or: true true</p> <p>or: true false</p> <p>or: false true</p> (conditionals/orTruthTable.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/orTruthTable.html', model), ' <p>or: true true</p> <p>or: true false</p> <p>or: false true</p>');
    done();
  });

  // #24
  it('should evaluate <if something=\'Some content\' or something=\'Nope\'> as true (conditionals/orSameVar.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/orSameVar.html', model), ' <p>or: true</p>');
    done();
  });

  it('should evaluate <if something=\'Some content\' or somethingMore=\'Nope\'> as true (conditionals/orDifferentVarLeftSide.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/orDifferenrVarLeftSide.html', model), ' <p>or: true</p>');
    done();
  });

  it('should evaluate <if somethingMore=\'Nope\' or something=\'Some content\' > as true (conditionals/orDifferentVarRightSide.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/orDifferenrVarRightSide.html', model), ' <p>or: true</p>');
    done();
  });

  it('should evaluate <if something xor somethingElse> as false (conditionals/xor.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/xor.html', model), ' <p>xor: false</p>');
    done();
  });

  it('should evaluate <if something and notDefined or somethingElse> as true (conditionals/andOr.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/andOr.html', model), ' <p>and + or: true</p>');
    done();
  });

  it('should evaluate <if not:something> as false (conditionals/not.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/not.html', model), ' <p>not: false</p>');
    done();
  });

  it('should evaluate one line if "if-something" as true (conditionals/oneLine.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLine.html', model), '<p class=\'something-is-present\'>One line if.</p>');
    done();
  });

  // #36
  it('should evaluate one line if "if-something" as true with no false condition supplied (conditionals/oneLineTrueOnly.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineTrueOnly.html', model), '<p class=\'something-is-present\'>One line if.</p>');
    done();
  });

  it('should evaluate one line if "if-something=\'Some content\'" as true (conditionals/oneLineValue.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineValue.html', model), '<p class=\'something-is-value\'>One line if.</p>');
    done();
  });

  // #46
  it('should evaluate one line if "if-something=\'\'" as false (conditionals/oneLineEmpty.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineEmpty.html', model), '<p class=\'something-is-not-empty\'>One line if.</p>');
    done();
  });

  // #48
  it('should evaluate both one line ifs "if-something" as true twice and apply two classes (conditionals/oneLineMulti.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineMulti.html', model), '<p class=\'something-is-present\' data-only-renders-when-something-is-not-empty data-should-render>One line if.</p>');
    done();
  });

  it('should parse nested conditionals correctly (conditionals/nestedConditional.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/nestedConditional.html', model), '<p>The variable \'something\' and \'somethingElse\' are both present</p>');
    done();
  });

  it('should render nothing if condition isn\'t met (conditionals/ifNotPresent.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifNotPresent.html', model), '<div></div>');
    done();
  });

  it('should evaluate one line if as false and apply no class (conditionals/oneLineFalse.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/oneLineFalse.html', model), '<p></p>');
    done();
  });

  it('should evaluate if statement that contains an element with a regex pattern (conditionals/ifEscapeRegex.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/ifEscapeRegex.html', model), '<input type=\'text\' name=\'date\' placeholder=\'DD/MM/YYYY\' id=\'date\' pattern=\'^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$\'>');
    done();
  });

  it('should evaluate if statement that queries the same variable more than once (conditionals/duplicateVarInline.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/duplicateVarInline.html', model), '<p>True</p>');
    done();
  });

  it('should evaluate if statement with multiple instances of the same operators inline (conditionals/duplicateOperatorInline.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('conditionals/duplicateOperatorInline.html', model), '<p>True</p>');
    done();
  });
});
