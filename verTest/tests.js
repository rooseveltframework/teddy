var assert = require('assert')
var makeModel = require('./modelTest')
var myRender = require('../lib/render')
var model


describe('Conditionals', function () {
  before(function () {
    model = makeModel()
  })

  describe('<if> tests', function() {
    it('should evaluate <if something> as true (conditionals/if.html)', function (done) {
      assert.strictEqual(myRender('html/if', model).trim(), '<p>The variable \'something\' is present</p>')
      done()
    })
    it('should evaluate 1000 nested <if something> as true (conditionals/ifif.html)', function (done) {
      assert.strictEqual(myRender('html/ifif', model).trim(), '<p>The variable \'something\' is present</p>')
      done()
    })
    it('should evaluate <if nothing> as false (conditionals/else.html)', function (done) {
      assert.strictEqual(myRender('html/else.html', model).trim(), '<p>The variable \'something\' is not present</p>')
      done()
    })
    it('should evaluate <elseif somethingElse> as true (conditionals/ifElseIf.html)', function (done) {
      assert.strictEqual(myRender('html/ifElseIf.html', model).trim(), '<p>The variable \'somethingElse\' is present</p>')
      done()
    })
  })
  describe('<unless> tests', function() {
    it('should evaluate <unless doesntexist> as true (conditionals/unless.html)', function (done) {
      assert.strictEqual(myRender('html/unless', model).trim(), '<p>The variable \'doesntexist\' is not present</p>')
      done()
    })
    it('should evaluate 1000 nested <unless doesntexist> as true (conditionals/unlessunless.html)', function (done) {
      assert.strictEqual(myRender('html/unlessunless', model).trim(), '<p>The variable \'doesntexist\' is not present</p>')
      done()
    })
    it('should evaluate <unless something> as false (conditionals/unlesselse.html)', function (done) {
      assert.strictEqual(myRender('html/unlesselse', model).trim(), '<p>The variable \'something\' is present</p>')
      done()
    })
    it('should evaluate <elseunless doesntexist> as true (conditionals/unlessElseUnless.html)', function (done) {
      assert.strictEqual(myRender('html/unlesselseunless', model).trim(), '<p>The variable \'doesntexist\' is not present</p>')
      done()
    })
  })
  describe('<loop> tests', function() {
    it('should loop through an array correctly <loop through="letters" val="letter">', function (done) {
      assert.strictEqual(myRender('html/loopVal', model).trim(), '<p>a</p><p>b</p><p>c</p>')      
      done()
    })
    it('should loop through an object correctly <loop through="names" key="name" val="description">', function (done) {
      assert.strictEqual(myRender('html/loopKeyVal', model).trim(), '<p>jack</p><p>guy</p><p>jill</p><p>girl</p><p>hill</p><p>landscape</p>')      
      done()
    })
    it('should loop through {objects} correctly (looping/loopArrayOfObjects.html)', function (done) {
      assert.strictEqual(myRender('html/loopArrayOfObjects.html', model).trim(), '<p>0</p><p>1</p><p>2</p><p>3</p><p>1</p><p>4</p><p>5</p><p>6</p><p>2</p><p>7</p><p>8</p><p>9</p>')
      done()
    })
    it('should loop through a {nested.object} correctly (looping/nestedObjectLoop.html)', function (done) {
      assert.strictEqual(myRender('html/nestedObjectLoop.html', model).trim(), '<p>a: 4</p><p>b: 5</p><p>c: 6</p>')
      done()
    })
    it('should parse nested loops correctly (looping/nestedLoops.html)', function (done) {
      assert.strictEqual(myRender('html/nestedLoops.html', model).trim(), '<p>1</p><ul><li>0: one</li><li>1: two</li><li>2: three</li></ul><p>2</p><ul><li>0: four</li><li>1: five</li><li>2: six</li></ul><p>3</p><ul><li>0: seven</li><li>1: eight</li><li>2: nine</li></ul>')
      done()
    })
    it('should ignore loops with missing attributes (looping/loopInvalidAttributes.html)', function (done) {
      assert.strictEqual(myRender('html/loopInvalidAttributes.html', model).trim(), '<div></div>')
      done()
    })
    it('should loop through a nested arrays correctly (looping/nestedArrays.html)', function (done) {
      assert.strictEqual(myRender('html/nestedArrays.html', model).trim(), '<p>one</p><p>two</p><p>three</p><p>four</p><p>five</p><p>six</p><p>seven</p><p>eight</p><p>nine</p>')
      done()
    })
    it('should ignore loop with invalid through attribute (looping/undefinedObjectLoop.html)', function (done) {
      assert.strictEqual(myRender('html/undefinedObjectLoop.html', model).trim(), '<div></div>')
      done()
    })
    it('should ignore loop with no contents (looping/emptyMarkupLoop.html)', function (done) {
      assert.strictEqual(myRender('html/emptyMarkupLoop.html', model).trim(), '<div></div>')
      done()
    })
    it('should loop without nested markup (looping/noMarkupLoop.html)', function (done) {
      assert.strictEqual(myRender('html/noMarkupLoop.html', model).trim(), '<div>abc</div>')
      done()
    })
  
    it('should loop through {letters} correctly with numeric val (looping/numericalVal.html)', function (done) {
      assert.strictEqual(myRender('html/numericalVal.html', model).trim(), '<p>a</p><p>b</p><p>c</p>')
      done()
    })
  
    it('should loop through {letters} correctly with camelCase val (looping/camelCaseLoopVal.html)', function (done) {
      assert.strictEqual(myRender('html/camelCaseLoopVal.html', model).trim(), '<p>a</p><p>b</p><p>c</p>')
      done()
    })
    it('should ignore undefined members of objects and arrays (looping/loopUndefinedMember.html)', function (done) {
      assert.strictEqual(myRender('html/loopUndefinedMember.html', model).trim(), '<p>a</p><p>{letter}</p><p>c</p><p>{item.a}</p><p>{item.b}</p><p>{item.c}</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p>')
      done()
    })
    it('should loop through an array of 5000 elements in < 1000ms (looping/largeDataSet.html)', function (done) {
      var start, end, time
      start = new Date().getTime()
  
      myRender('html/largeDataSet.html', model)
  
      end = new Date().getTime()
      time = end - start
  
      assert.strictEqual(time < 1000, true)
      done()
    })
  })
  describe.skip('<include> tests', function() {
    it('should <include> a template (includes/include.html)', function (done) {
      assert.strictEqual(myRender('html/include.html', model).trim(), '<p>Some content</p>')
      done()
    })
    it('should escape the contents of a script when included in a template (includes/inlineScriptTag.html)', function (done) {
      assert.strictEqual(myRender('html/inlineScriptTag.html', model).trim(), '<p>Hello!</p><script>console.log(\'Hello world\'); for (var i = 0; i < 2; i++) { console.log(\'Test\') } </script>')
      done()
    })
  })
}) 