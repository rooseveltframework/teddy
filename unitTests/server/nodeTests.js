/**
 * Node.js unit tests for Teddy Templating Engine - This simple sample app parses a set of sample templates to ensure that all the features of Teddy are working correctly. Use this app to unit test changes to the templating engine or tinker with it to learn how Teddy works in general.
 * @author Eric Newport (kethinov)
 * @license Creative Commons Attribution 3.0 Unported License http://creativecommons.org/licenses/by/3.0/deed.en_US
 */

/*! @source https://github.com/kethinov/teddy */
/*jshint camelcase: true, curly: true, eqeqeq: false, forin: false, strict: false, trailing: true, evil: true, devel: true, node: true */

console.log("\nRunning Teddy server-side tests");

var teddy = require('../../src/teddy'),
    renderedTemplate = '',
    model = {
      letters: ['a', 'b', 'c'],
      names: {jack: 'guy', jill: 'girl', hill: 'landscape'},
      objects: [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}],
      something: 'Some content',
      somethingElse: true,
      variableName: 'Hello world!',
      pageTitle: 'Teddy Templating Engine unit tests'
    },
    
    // unit tester function
    unitTest = function(testName, testFunc) {
      try {
        if (testFunc()) {
          console.log('PASS: '+testName);
        }
        else {
          console.log('FAIL: '+testName);
        }
      }
      catch (e) {
        console.log('FAIL: '+testName+' JS Error: '+e);
      }
    };

// @param verbosity
// Possible values: none, concise (default), verbose, DEBUG
teddy.setVerbosity('concise');

// @param templateRoot
// Where to scan for templates on the filesystem in node.js environment (default value: is "./")
// Do not use with Express; for Express use app.set('views', './path/to/files/') instead
teddy.setTemplateRoot('../testTemplates/');

renderedTemplate = teddy.render('test.html', model);

console.log("\nUnrendered compiled template:\n" + teddy.compiledTemplates['test.html']);
console.log("\nData model applied to it:");
console.log(model);
console.log("\nFully rendered resulting HTML:\n" + renderedTemplate);

// run unit tests on rendered output
console.log("\nTest case results:\n");

// test list
unitTest('<title> tag test', function() {
  return renderedTemplate.indexOf('<title>Teddy Templating Engine unit tests</title>') > -1 ? true : false;
});

unitTest('<style> tag test', function() {
  return renderedTemplate.indexOf('<style>body{font-family: monospace;}</style>') > -1 ? true : false;
});

unitTest('{variable} test', function() {
  return renderedTemplate.indexOf('<section class="variables"><h1>Simple variable</h1><p>Hello world!</p></section>') > -1 ? true : false;
});

unitTest('{! server-side comment !} test', function() {
  return (renderedTemplate.indexOf('{!') > -1 || renderedTemplate.indexOf('!}') > -1) ? false : true;
});

unitTest('<!-- HTML comment --> test', function() {
  return (renderedTemplate.indexOf('<!-- HTML comment; is sent to the client -->') > -1) ? true : false;
});

unitTest('<include> without arguments test', function() {
  return renderedTemplate.indexOf('<section class="includes"><h1>Includes</h1><section class="sampleIncludeWithoutArguments"><p>This is a sample included template without arguments.</p></section>') > -1 ? true : false;
});

unitTest('<include> with arguments test', function() {
  return renderedTemplate.indexOf('<section class="includes"><h1>Includes</h1><section class="sampleIncludeWithoutArguments"><p>This is a sample included template without arguments.</p></section><section class="sampleIncludeWithArguments"><p>This is a sample included template with arguments.</p><dl><dt>firstArgument:</dt><dd>Plain text argument</dd><dt>secondArgument:</dt><dd><span>Argument with HTML in it</span></dd></dl></section></section>') > -1 ? true : false;
});

unitTest('conditionals overall test', function() {
  return renderedTemplate.indexOf("<section class=\"flowcontrol\"><h1>Flow control</h1><p>The variable 'something' is present</p><p>The variable 'something' is not set to 'hello'</p><p>The variable 'something' is present</p><p>The variable 'something' is present</p><p>The variables 'something' and 'somethingElse' are both present</p></section>") > -1 ? true : false;
});

unitTest('loops overall test', function() {
  return renderedTemplate.indexOf("<section class=\"looping\"><h1>Looping</h1><dl><dt>JS model:</dt><dd>letters = ['a', 'b', 'c'];</dd><dt>HTML template:</dt><dd><p>a</p><p>b</p><p>c</p></dd></dl><dl><dt>JS model:</dt><dd>names = {jack: 'guy', jill: 'girl', hill: 'landscape'};</dd><dt>HTML template:</dt><dd><p>jack</p><p>guy</p><p>jill</p><p>girl</p><p>hill</p><p>landscape</p></dd></dl><dl><dt>JS model:</dt><dd>objects = [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}];</dd><dt>HTML template:</dt><dd><p>0</p><p>1</p><p>2</p><p>3</p><p>1</p><p>4</p><p>5</p><p>6</p><p>2</p><p>7</p><p>8</p><p>9</p></dd></dl><dl><dt>JS model:</dt><dd>objects = [{a:1, b:2, c:3}, {a:4, b:5, c:6}, {a:7, b:8, c:9}];</dd><dt>HTML template:</dt><dd><section class=\"sampleIncludeWithArguments\"><p>This is a sample included template with arguments.</p><dl><dt>firstArgument:</dt><dd>2</dd><dt>secondArgument:</dt><dd><span>3</span></dd></dl></section><p>item.a is 4</p><section class=\"sampleIncludeWithArguments\"><p>This is a sample included template with arguments.</p><dl><dt>firstArgument:</dt><dd>5</dd><dt>secondArgument:</dt><dd><span>6</span></dd></dl></section><section class=\"sampleIncludeWithArguments\"><p>This is a sample included template with arguments.</p><dl><dt>firstArgument:</dt><dd>8</dd><dt>secondArgument:</dt><dd><span>9</span></dd></dl></section></dd></dl></section>") > -1 ? true : false;
});

unitTest('packaged templates test', function() {
  if (teddy.packagedTemplates['inc/sampleIncludeWithArguments.html'] !== "teddy.compiledTemplates['inc/sampleIncludeWithArguments.html']='<section class=\\'sampleIncludeWithArguments\\'><p>This is a sample included template with arguments.</p><dl><dt>firstArgument:</dt><dd>{firstArgument}</dd><dt>secondArgument:</dt><dd>{secondArgument}</dd></dl></section>';" || teddy.packagedTemplates['inc/sampleIncludeWithoutArguments.html'] !== "teddy.compiledTemplates['inc/sampleIncludeWithoutArguments.html']='<section class=\\'sampleIncludeWithoutArguments\\'><p>This is a sample included template without arguments.</p></section>';") {
    return false;
  }
  try {
    eval(teddy.packagedTemplates['inc/sampleIncludeWithArguments.html']);
    eval(teddy.packagedTemplates['inc/sampleIncludeWithoutArguments.html']);
    return true;
  }
  catch (e) {
    console.log(e);
    return false;
  }
});