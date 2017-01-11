// TODO: test client side tests

var chai = require('chai'),
    assert = chai.assert,
    teddy = require('../../teddy'),
    model = {
      letters: ['a', 'b', 'c'],
      names: {jack: 'guy', jill: 'girl', hill: 'landscape'},
      objects: [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}],
      objectOfObjects: {one: {a:1, b:2, c:3}, two:{a:4, b:5, c:6}, three:{a:7, b:8, c:9}},
      nestedObjects: [
        {
          num: 1,
          children: [
            'one',
            'two',
            'three'
          ]
        },
        {
          num: 2,
          children: [
            'four',
            'five',
            'six'
          ]
        },
        {
          num: 3,
          children: [
            'seven',
            'eight',
            'nine'
          ]
        },
      ],
      something: 'Some content',
      somethingElse: true,
      varWithVarInside: 'Variable with a variable inside: {subVar}',
      subVar: 'And another: {something}',
      dynamicInclude: 'misc/variable',
      escapeTest: '<span>raw html</span>',
      nullVar: null,
      emptyArray: [],
      largeDataSet: []
    },
    i,
    templateList,
    template,
    request,
    sameOriginPolicy,
    oldIE,
    i,
    charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    cl = charList.length,
    isNode = ((typeof module).toLowerCase() !== 'undefined' && module.exports) ? true : false;

chai.use(require('chai-string'));

function randChars(n) {
  var i, s = '';
  for (i = 0; i < n; i++) {
    s += charList.charAt(Math.floor(Math.random() * cl));
  }
  return s;
}

for (i = 0; i < 5000; i++) {
  model.largeDataSet.push({
    one: randChars(64),
    two: randChars(64),
    three: randChars(64)
  });
}

if (!isNode) {
  templateList = [
    'conditionals/and.html',
    'conditionals/andOr.html',
    'conditionals/if.html',
    'conditionals/ifElse.html',
    'conditionals/ifElseIf.html',
    'conditionals/ifElseValue.html',
    'conditionals/ifValue.html',
    'conditionals/not.html',
    'conditionals/oneLine.html',
    'conditionals/oneLineValue.html',
    'conditionals/or.html',
    'conditionals/unless.html',
    'conditionals/unlessElse.html',
    'conditionals/unlessElseUnless.html',
    'conditionals/unlessElseValue.html',
    'conditionals/unlessValue.html',
    'conditionals/xor.html',
    'includes/dynamicInclude.html',
    'includes/include.html',
    'includes/includeWithArguments.html',
    'looping/loopArrayOfObjects.html',
    'looping/loopKeyVal.html',
    'looping/loopVal.html',
    'looping/nestedLoops.html',
    'looping/nestedObjectLoop.html',
    'misc/nestedVars.html',
    'misc/serverSideComments.html',
    'misc/varEscaping.html',
    'misc/variable.html',
    'misc/varNoEscaping.html',
  ];
  request = new XMLHttpRequest();

  // fetch and compile the templates
  for (i in templateList) {
    template = templateList[i];
    try {
      request.open('GET', 'templates/' + template, false);
      request.send(); // because of 'false' above, the send method will block until the request is finished
      teddy.compile(request.response, template);
    }
    catch (e) {
      document.body.insertAdjacentHTML('beforeend', '<h2>Warning: these tests can only be run from a web server.</h2><p>Due to the <a href=\'http://en.wikipedia.org/wiki/Same_origin_policy\'>same origin policy</a> applying to files loaded directly from the local filesystem, these unit tests can only be executed from a real HTTP server.</p><p>To start a simple web server to run these tests with, open your terminal and run this command from the \"teddy\" directory:</p><pre>python -m SimpleHTTPServer</pre><p>Then simply visit <a href=\'http://localhost:8000/test/client.html\'>http://localhost:8000/test/client.html</a></p><p>If you can\'t run the command, then you\'ll need to <a href=\'http://www.python.org/\'>install Python</a> or use some other web server.</p>');
      sameOriginPolicy = true;
      break;
    }
  }

  // test for old IE
  oldIE = document.createElement('p');
  oldIE.innerHTML = '<!--[if lte IE 9]><i></i><![endif]-->';
  oldIE = oldIE.getElementsByTagName('i').length === 1 ? true : false;
}

teddy.setTemplateRoot('test/templates');

if (!sameOriginPolicy && !oldIE) {

  console.log('Model used:');
  console.log(model);

  describe('Includes', function() {
    it('should <include> a template (includes/include.html)', function(done) {
      assert.equalIgnoreSpaces(teddy.render('includes/include.html', model), '<p>Some content</p>');
      done();
    });

    it('should <include> a template whose name is populated by a {variable} (includes/dynamicInclude.html)', function(done) {
      assert.equalIgnoreSpaces(teddy.render('includes/dynamicInclude.html', model), '<p>Some content</p>');
      done();
    });

    it('should <include> a template with arguments (includes/includeWithArguments.html)', function(done) {
      assert.equalIgnoreSpaces(teddy.render('includes/includeWithArguments.html', model), '<p>override</p>');
      done();
    });

    it('should <include> a template with a nested include (includes/nestedInclude.html)', function(done) {
      assert.equalIgnoreSpaces(teddy.render('includes/nestedInclude.html', model), '<p><p>Some content</p></p>');
      model.escapeTest = '<span>raw html</span>'; // undo changes to global model that this test makes before calling done
      done();
    });
  });


  describe('Conditionals', function() {
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

    it('should evaluate <if something or notDefined> as true (conditionals/or.html)', function(done) {
      assert.equalIgnoreSpaces(teddy.render('conditionals/or.html', model), ' <p>or: true</p>');
      done();
    });

    // #24
    it('should evaluate <if something=\'Some content\' or something=\'Nope\'> as true (conditionals/orSameVar.html)', function(done) {
      assert.equalIgnoreSpaces(teddy.render('conditionals/orSameVar.html', model), ' <p>or: true</p>');
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
  });


  describe('Looping', function() {
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

    it('should loop through an array of 1000 elements in < 1000ms (looping/largeDataSet.html)', function(done) {
      var start, end, time;
      start = new Date().getTime();

      teddy.render('looping/largeDataSet.html', model);

      end = new Date().getTime();
      time = end - start;

      assert.isAtMost(time, 1000);
      done();
    });
  });


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
}
