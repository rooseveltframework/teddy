// TODO: Make client side tests work

var teddy = require('../teddy'),
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
