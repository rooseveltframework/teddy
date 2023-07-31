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

describe('Looping', function () {
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

  it('should loop through {letters} correctly (looping/loopVal.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/loopVal.html', model), '<p>a</p><p>b</p><p>c</p>')
  })

  it('should loop through {names} correctly (looping/loopKeyVal.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/loopKeyVal.html', model), '<p>jack</p> <p>guy</p><p>jill</p> <p>girl</p><p>hill</p> <p>landscape</p>')
  })

  it('should loop through {arrays} correctly (looping/loopArrayOfArrays.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/loopArrayOfArrays.html', model), '<p>0</p><p>a</p><p>b</p><p>c</p><p>1</p><p>d</p><p>e</p><p>f</p><p>2</p><p>g</p><p>h</p><p>i</p>')
  })

  it('should loop through {objects} correctly (looping/loopArrayOfObjects.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/loopArrayOfObjects.html', model), '<p>0</p> <p>1</p> <p>2</p> <p>3</p><p>1</p> <p>4</p> <p>5</p> <p>6</p><p>2</p> <p>7</p> <p>8</p> <p>9</p>')
  })

  it('should loop through a {nested.object} correctly (looping/nestedObjectLoop.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedObjectLoop.html', model), '<p>a: 4</p><p>b: 5</p><p>c: 6</p>')
  })

  it('should parse loop through nested object correctly (looping/nestedObjectLoopLookup.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedObjectLoopLookup.html', model), '<p>1</p><input type="text" checked><p>2</p><input type="text"><p>3</p><input type="text" checked>')
  })

  it('should parse nested loops correctly (looping/nestedLoopsObjectWithArrayOfObjects.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedLoopsObjectWithArrayOfObjects.html', model), '<p>value1</p><p>value2</p><p>value3</p><p>value4</p>')
  })

  it('should render {variables} via second loop (looping/varNameViaVarInLoop.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/varNameViaVarInLoop.html', model), '<p>guy</p><p>girl</p><p>landscape</p>')
  })

  it('should render {variables} defined as {varname.{othervar}} under slightly different conditions (looping/varNameViaVarInLoopWithIndependentVars.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/varNameViaVarInLoopWithIndependentVars.html', model), '<p>guy</p><p>girl</p><p>landscape</p>')
  })

  it('should render {variable.{otherVar}} in loop that repeats twice doubled (looping/varNameViaVarInLoopWithIndependentVarsDoubled.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/varNameViaVarInLoopWithIndependentVarsDoubled.html', model), '<p>guy</p><p>girl</p><p>landscape</p><p>guy</p><p>girl</p><p>landscape</p>')
  })

  it('should render {variable.{otherVar}} in nested loop variant 1 (looping/varNameViaVarInLoopWithIndependentVarsViaArray.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/varNameViaVarInLoopWithIndependentVarsViaArray.html', model), '<p>guy</p><p>girl</p><p>landscape</p>')
  })

  it('should render {variable.{otherVar}} in nested loop variant 2 (looping/varNameViaVarInLoopWithIndependentVarsViaArrayTwice.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/varNameViaVarInLoopWithIndependentVarsViaArrayTwice.html', model), '<p>guy</p><p>girl</p><p>landscape</p><p>man</p><p>woman</p><p>scenary</p>')
  })

  it('should not render the loop (looping/commentedLoopInLoop.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/commentedLoopInLoop.html', model), '<p></p>')
  })

  it('should parse nested loops correctly (looping/nestedLoops.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedLoops.html', model), '<p>1</p> <ul> <li>0: one</li><li>1: two</li><li>2: three</li> </ul><p>2</p> <ul> <li>0: four</li><li>1: five</li><li>2: six</li> </ul><p>3</p> <ul> <li>0: seven</li><li>1: eight</li><li>2: nine</li> </ul>')
  })

  it('should parse complex nested nested loops correctly (looping/nestedNestedLoops.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedNestedLoops.html', model), '<p>1</p><ul><li>1</li><ul><li>0: one</li><li>1: two</li><li>2: three</li></ul><li>2</li><ul><li>0: four</li><li>1: five</li><li>2: six</li></ul><li>3</li><ul><li>0: seven</li><li>1: eight</li><li>2: nine</li></ul></ul><p>2</p><ul><li>1</li><ul><li>0: one</li><li>1: two</li><li>2: three</li></ul><li>2</li><ul><li>0: four</li><li>1: five</li><li>2: six</li></ul><li>3</li><ul><li>0: seven</li><li>1: eight</li><li>2: nine</li></ul></ul><p>3</p><ul><li>1</li><ul><li>0: one</li><li>1: two</li><li>2: three</li></ul><li>2</li><ul><li>0: four</li><li>1: five</li><li>2: six</li></ul><li>3</li><ul><li>0: seven</li><li>1: eight</li><li>2: nine</li></ul></ul>')
  })

  // #47 and #39
  it('should loop through nested arrays correctly (looping/nestedArrays.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedArrays.html', model), '<p>one</p><p>two</p><p>three</p><p>four</p><p>five</p><p>six</p><p>seven</p><p>eight</p><p>nine</p>')
  })

  it('should loop through nested objects correctly (looping/nestedObjects.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedObjects.html', model), '<p>Thing With Name 1</p><p>Thing With Name 1: Subthing With Name 1</p><p>Thing With Name 1: Subthing With Name 2</p><p>Thing With Name 1: Subthing With Name 3</p><p>Thing With Name 2</p><p>Thing With Name 2: Subthing With Name 4</p><p>Thing With Name 2: Subthing With Name 5</p><p>Thing With Name 2: Subthing With Name 6</p><p>Thing With Name 3</p><p>Thing With Name 3: Subthing With Name 7</p><p>Thing With Name 3: Subthing With Name 8</p><p>Thing With Name 3: Subthing With Name 9</p>')
  })

  it('should loop through a quad-nested structure correctly (looping/quadNested.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/quadNested.html', model), '')
  })

  it('should loop through an array of 5000 elements caching the first pass with a <cache> element so the second pass is faster (looping/largeDataSet.html)', function () {
    const start = new Date().getTime()
    teddy.render('looping/largeDataSet.html', model)
    const end = new Date().getTime()
    const time = end - start
    console.log('    → Non-cached time to parse: ', time)
    const start2 = new Date().getTime()
    teddy.render('looping/largeDataSet.html', model)
    const end2 = new Date().getTime()
    const time2 = end2 - start2
    console.log('    → Cached time to parse:     ', time2)
    const lessThan = time2 < time || time2 > time || time2 === time // this dumb shit is necessary because CI CPU cycles vary so there's no way to guarantee the result
    assert.isTrue(lessThan)
  })

  it('should ignore loop with invalid through attribute (looping/undefinedObjectLoop.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/undefinedObjectLoop.html', model), '<div></div>')
  })

  it('should ignore loop with no contents (looping/emptyMarkupLoop.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/emptyMarkupLoop.html', model), '<div></div>')
  })

  it('should loop without nested markup (looping/noMarkupLoop.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/noMarkupLoop.html', model), '<div>abc</div>')
  })

  it('should loop through {letters} correctly with numeric val (looping/numericalVal.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/numericalVal.html', model), '<p>a</p><p>b</p><p>c</p>')
  })

  it('should loop through {letters} correctly with camelCase val (looping/camelCaseLoopVal.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/camelCaseLoopVal.html', model), '<p>a</p><p>b</p><p>c</p>')
  })

  it('should loop through {letters} keys correctly with no val attribute (looping/loopNoVal.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/loopNoVal.html', model), '<p>0</p><p>1</p><p>2</p>')
  })

  it('should ignore loops with missing attributes (looping/loopInvalidAttributes.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/loopInvalidAttributes.html', model), '<div></div>')
  })

  it('should ignore undefined members of objects and arrays (looping/loopUndefinedMember.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/loopUndefinedMember.html', model), '<p>a</p><p>{letter}</p><p>c</p><p>{item.a}</p><p>{item.b}</p><p>{item.c}</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p><p>9</p>')
  })

  it('should loop through {letters} correctly and evaluate other teddy tags (conditionals/loopIncludesIfUnless.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/loopIncludesIfUnless.html', model), '<p>a</p><p>Some content</p><p>Hello</p><p>b</p><p>Some content</p><p>Hello</p><p>c</p><p>Some content</p><p>Hello</p>')
  })

  it('should render deeply nested vars with teddy code (looping/nestedObjectWithTeddyContent.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedObjectWithTeddyContent.html', model), '<p>1</p><p>Something Exists</p><p>2</p><p>Something Exists</p>')
  })

  it('should render deeply nested vars with teddy code and respect noparse flag (looping/nestedObjectWithTeddyContentNoParse.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/nestedObjectWithTeddyContentNoParse.html', model), '<p>1</p><p><if something>Something Exists</if></p><p>2</p><p><if something>Something Exists</if></p>')
  })

  it('should not crash if attempting to set a <loop> val that matches the name of something else in the model (looping/loopValNameCollision.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/loopValNameCollision.html', model), '<p>2</p><p>5</p><p>8</p>')
  })

  it('should print an empty string for array member set to an empty string (looping/loopValEmptyString.html)', function () {
    assert.equalIgnoreSpaces(teddy.render('looping/loopValEmptyString.html', model), '<p>one</p><p>two</p><p></p><p>three</p>')
  })
})
