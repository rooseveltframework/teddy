if (typeof module !== 'undefined') {
  var chai = require('chai'),
      chaiString = require('chai-string'),
      assert = chai.assert,
      model,
      makeModel = require('./models/model'),
      teddy = require('../teddy');
  chai.use(chaiString);
}

describe('Misc', function() {
  before(function() {
    model = makeModel();
  });

  it('should render {variables} (misc/variable.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/variable.html', model), '<p>Some content</p>');
    done();
  });

  it('should render multiple {variables} (misc/multipleVariables.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/multipleVariables.html', model), '<p>Some content</p> <h5>More content</h5>');
    done();
  });

  it('should render nested {variables} (misc/nestedVars.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/nestedVars.html', model), '<p>Variable with a variable inside: And another: Some content</p>');
    done();
  });

  it('should properly escape HTML entities present in {variables} (misc/varEscaping.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/varEscaping.html', model), '<p>&lt;span&gt;raw html&lt;/span&gt;</p>');
    done();
  });

  it('should not escape HTML entities present in {variables} which are properly {flagged|s} (misc/varNoEscaping.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/varNoEscaping.html', model), '<p><span>raw html</span></p>');
    done();
  });

  it('should remove {! server side comments !} (misc/serverSideComments.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/serverSideComments.html', model), '<p>test test</p>');
    done();
  });

  // #27 and #43
  it('should remove {! {! nested !} server side comments !} (misc/serverSideCommentsNested.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/serverSideCommentsNested.html', model), '<p>Any comments? </p>');
    done();
  });

  it('should not break when referencing objects that don\'t exist (misc/objectDoesNotExist.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/objectDoesNotExist.html', model), ' <p>{doesntExist.someKey}</p> <p class=\'false\'></p>');
    done();
  });

  it('should render plain HTML with no teddy tags with no changes (misc/plainHTML.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/plainHTML.html', model), '<!DOCTYPE html><html lang=\'en\'><head><meta charset=\'utf-8\'><meta name=\'viewport\' content=\'width=device-width,initial-scale=1\'><meta name=\'format-detection\' content=\'telephone=no\'><title>Plain HTML</title><link rel=\'stylesheet\' href=\'/css/styles.css\'></head><body><main><p>This template contains no teddy tags. Just HTML.</p></main><script type=\'text/javascript\' src=\'/js/main.js\'></script></body></html>');
    done();
  });

  it('should render {variables} within style element (misc/styleVariables.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/styleVariables.html', model), '<style>p{height:10px;}</style>');
    done();
  });

  it('should access property of {variable} object with {variable} (misc/variableObjectProperty.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/variableObjectProperty.html', model), '<p>guy</p>');
    done();
  });

  it('should escape curly braces from regex pattern (misc/regexEscaping.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/regexEscaping.html', model), '<input type=\'text\' name=\'date\' placeholder=\'DD/MM/YYYY\' id=\'date\' pattern=\'^(3[0-1]|[1-2]\\d|[1-9]|0\\d)\\/(1[0-2]|[1-9]|0\\d)\\/[1-2]\\d{3}$\'>');
    done();
  });
});
