var chai = require('chai'),
    assert = chai.assert,
    model = require('./models/model')(),
    teddy = require('../teddy');

chai.use(require('chai-string'));

describe('Misc', function() {
  it('should render {variables} (misc/variable.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('misc/variable.html', model), '<p>Some content</p>');
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
});
