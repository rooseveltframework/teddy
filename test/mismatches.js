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

  it('should skip evaluation of <if> </ if> (mismatchedTags/if.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('mismatchedTags/if.html', model), '<div></div>');
    done();
  });

  it('should skip evaluation of <else> </ else> (mismatchedTags/else.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('mismatchedTags/else.html', model), '<div></div>');
    done();
  });

  it('should skip evaluation of <elseif> </ elseif> (mismatchedTags/elseif.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('mismatchedTags/elseif.html', model), '<div></div>');
    done();
  });

  it('should skip evaluation of <unless> </ unless> (mismatchedTags/unless.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('mismatchedTags/unless.html', model), '<div></div>');
    done();
  });

  it('should skip evaluation of <elseunless> </ elseunless> (mismatchedTags/elseunless.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('mismatchedTags/elseunless.html', model), '<div></div>');
    done();
  });

  it('should skip evaluation of <loop> </ loop> (mismatchedTags/loop.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('mismatchedTags/loop.html', model), '<div></div>');
    done();
  });

  it('should skip evaluation of <include> </ include> (mismatchedTags/include.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('mismatchedTags/include.html', model), '<div></div>');
    done();
  });

  it('should skip evaluation of <arg> </ arg> (mismatchedTags/arg.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('mismatchedTags/arg.html', model), '<div></div>');
    done();
  });
});
