var chai = require('chai'),
    assert = chai.assert,
    model = require('./models/model')(),
    teddy = require('../teddy'),
    start, end, time;

start = new Date().getTime();
//debugger;
    console.log(teddy.render('test/templates/looping/largeDataSet.html', model));

    end = new Date().getTime();
    time = end - start;
