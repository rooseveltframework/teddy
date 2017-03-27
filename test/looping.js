if (typeof module !== 'undefined') {
  var chai = require('chai'),
      chaiString = require('chai-string'),
      assert = chai.assert,
      model,
      makeModel = require('./models/model'),
      teddy = require('../teddy');
  chai.use(chaiString);
}

describe('Looping', function() {
  before(function() {
    teddy.setTemplateRoot('test/templates');
    model = makeModel();
  });

  it('should loop through {letters} correctly (looping/loopVal.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/loopVal.html', model), '<p>a</p><p>b</p><p>c</p>');
    done();
  });

  it('should loop through {names} correctly (looping/loopKeyVal.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/loopKeyVal.html', model), '<p>jack</p> <p>guy</p><p>jill</p> <p>girl</p><p>hill</p> <p>landscape</p>');
    done();
  });

  it('should loop through {objects} correctly (looping/loopArrayOfObjects.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/loopArrayOfObjects.html', model), '<p>0</p> <p>1</p> <p>2</p> <p>3</p><p>1</p> <p>4</p> <p>5</p> <p>6</p><p>2</p> <p>7</p> <p>8</p> <p>9</p>');
    done();
  });

  it('should loop through a {nested.object} correctly (looping/nestedObjectLoop.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedObjectLoop.html', model), '<p>a: 4</p><p>b: 5</p><p>c: 6</p>');
    done();
  });

  it('should parse nested loops correctly (looping/nestedLoops.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedLoops.html', model), '<p>1</p> <ul> <li>0: one</li><li>1: two</li><li>2: three</li> </ul><p>2</p> <ul> <li>0: four</li><li>1: five</li><li>2: six</li> </ul><p>3</p> <ul> <li>0: seven</li><li>1: eight</li><li>2: nine</li> </ul>');
    done();
  });

  // #47 and #39
  it('should loop through a nested arrays correctly (looping/nestedArrays.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedArrays.html', model), '<p>one</p><p>two</p><p>three</p><p>four</p><p>five</p><p>six</p><p>seven</p><p>eight</p><p>nine</p>');
    done();
  });

  it('should loop through an array of 5000 elements in < 5000ms (looping/largeDataSet.html)', function(done) {
    teddy.cacheRenders(true);
    var start, end, time;
    start = new Date().getTime();

    teddy.render('looping/largeDataSet.html', model);

    end = new Date().getTime();
    time = end - start;

    assert.isAtMost(time, 5000);
    done();
  });

  it('should loop through same array of 5000 elements in < 50ms during second attempt due to caching (looping/largeDataSet.html)', function(done) {
    var start, end, time;
    start = new Date().getTime();

    teddy.render('looping/largeDataSet.html', model);

    end = new Date().getTime();
    time = end - start;

    assert.isAtMost(time, 50);
    done();
  });

  it('should loop through an array of 5000 elements in < 5000ms doing a fresh render via partial cache invalidation (looping/largeDataSet.html)', function(done) {
    var start, end, time;
    start = new Date().getTime();

    teddy.flushCache('looping/largeDataSet.html', model);
    teddy.render('looping/largeDataSet.html', model);

    end = new Date().getTime();
    time = end - start;

    assert.isAtMost(time, 5000);
    done();
  });

  it('should loop through same array of 5000 elements in < 50ms during second attempt due to caching (looping/largeDataSet.html)', function(done) {
    var start, end, time;
    start = new Date().getTime();

    teddy.render('looping/largeDataSet.html', model);

    end = new Date().getTime();
    time = end - start;

    assert.isAtMost(time, 50);
    done();
  });

  it('should loop through an array of 5000 elements in < 5000ms doing a fresh render via full cache invalidation (looping/largeDataSet.html)', function(done) {
    var start, end, time;
    start = new Date().getTime();

    teddy.flushCache('looping/largeDataSet.html');
    teddy.render('looping/largeDataSet.html', model);

    end = new Date().getTime();
    time = end - start;

    assert.isAtMost(time, 5000);
    done();
  });

  it('should loop through same array of 5000 elements in < 50ms during second attempt due to caching (looping/largeDataSet.html)', function(done) {
    var start, end, time;
    start = new Date().getTime();

    teddy.render('looping/largeDataSet.html', model);

    end = new Date().getTime();
    time = end - start;

    teddy.cacheRenders(false);
    assert.isAtMost(time, 50);
    done();
  });

  it('should ignore loop with invalid through attribute (looping/undefinedObjectLoop.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/undefinedObjectLoop.html', model), '<div></div>');
    done();
  });

  it('should ignore loop with no contents (looping/emptyMarkupLoop.html)', function(done) {
    teddy.setVerbosity(0);
    assert.equalIgnoreSpaces(teddy.render('looping/emptyMarkupLoop.html', model), '<div></div>');
    teddy.setVerbosity(1);
    done();
  });

  it('should loop without nested markup (looping/noMarkupLoop.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/noMarkupLoop.html', model), '<div>abc</div>');
    done();
  });

  it('should loop through {letters} correctly with numeric val (looping/numericalVal.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/numericalVal.html', model), '<p>a</p><p>b</p><p>c</p>');
    done();
  });

  it('should loop through {letters} correctly with camelCase val (looping/camelCaseLoopVal.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/camelCaseLoopVal.html', model), '<p>a</p><p>b</p><p>c</p>');
    done();
  });

  it('should loop through {letters} correctly with camelCase val (looping/camelCaseLoopVal.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/camelCaseLoopVal.html', model), '<p>a</p><p>b</p><p>c</p>');
    done();
  });

  it('should ignore loops with missing attribites and print warnings in the console (looping/loopInvalidAttributes.html)', function(done) {
    assert.equalIgnoreSpaces(teddy.render('looping/loopInvalidAttributes.html', model), '<div></div>');
    done();
  });
});
