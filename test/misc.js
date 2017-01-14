var chai = require('chai'),
    assert = chai.assert,
    model = require('./models/model')(),
    teddy = require('../teddy'),
    i,
    templateList,
    template,
    request,
    sameOriginPolicy,
    oldIE,
    isNode = ((typeof module).toLowerCase() !== 'undefined' && module.exports) ? true : false;

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

chai.use(require('chai-string'));

if (!sameOriginPolicy && !oldIE) {

  console.log('Model used:');
  console.log(model);

  require('./looping');

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
