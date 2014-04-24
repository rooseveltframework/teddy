// include dependencies
var http = require('http'),             // node's http server
    express = require('express'),       // express http server
    teddy = require('../../teddy'),     // teddy (remove the '../../' if acquired from npm)
    app = express();                    // initialize express

// set templating engine
app.engine('html', teddy.__express);

// set templates directory
app.set('views', 'client/');

// map statics
app.use('/lib', express.static('../../'));
app.use('/statics', express.static('client/'));

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

// define controller method for precompiled templates
app.get('/precompiled', function(req, res) {

  // precompile the precompiled templates
  teddy.compile('one.html');
  teddy.compile('two.html');
  teddy.compile('three.html');

  // package precompiled templates up for delivery over the wire
  var data = teddy.packagedTemplates['one.html'] + teddy.packagedTemplates['two.html'] + teddy.packagedTemplates['three.html'];

  // deliver them over the wire as pure JS
  res.set('Content-Type', 'text/javascript');
  res.send(data);
});

// start server
http.createServer(app).listen(43711, function() {
  console.log('Express server listening on port 43711 (' + app.get('env') + ' mode)');
});