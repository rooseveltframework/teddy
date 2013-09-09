/**
 * Sample Express app using Teddy
 * @author Eric Newport (kethinov)
 * @license Creative Commons Attribution 3.0 Unported License http://creativecommons.org/licenses/by/3.0/deed.en_US
 */

/*! @source https://github.com/kethinov/teddy */
/*jshint camelcase: true, curly: true, eqeqeq: false, forin: false, strict: false, trailing: true, evil: true, devel: true, node: true */

// include dependencies
var http = require('http'),             // node's http server
    express = require('express'),       // express http server
    teddy = require('../../teddy'),     // teddy (remove the '../../' if acquired from npm)
    app = express();                    // initialize express

// configure express
app.configure(function() {

  // set templating engine
  app.engine('html', teddy.__express);

  // set templates directory
  app.set('views', './');
});

// define controller method for index page
app.get('/', function(req, res) {

  // define a sample model to be passed to index.html
  var model = {
    title: 'Teddy Templating Engine sample app',
    hello: 'Hello World!'
  };

  // express will now use teddy to parse index.html using the supplied model
  res.render('index.html', model);
});

// start server
http.createServer(app).listen(43743, function() {
  console.log('Express server listening on port 43743 (' + app.get('env') + ' mode)');
});