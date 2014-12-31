// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var database = require('./scraper-database.js');
var cache = require('./cache.js');
var htmlCreater = require('./html-creater.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.configure(function () {
    app.use(
        "/", //the URL throught which you want to access to you static content
        express.static(__dirname+"/client") //where your static content is located in your filesystem
    );
});

app.set('view engine', 'jade');

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
app.get('/', function(req, res) {
    //res.json(cache.jsonResult);
    res.send(cache.html);
    
    /*
    Das Laden soll immer nur EINMAL zu beginn geschehen,
    danach wird immer das gecachte Objekt zurückgegeben
    => Speedup von 10!
    */
    
    // database.load('spiegel', function(error, result) {
    //     if (error) {
    //         res.json(error);
    //     }

    //     res.json(result);
    // });
});

var createHTML = function() {
    
    cache.html = htmlCreater.create(); 
};
createHTML();

app.listen(process.env.PORT, process.env.IP);
console.log('Magic happens on port ' + process.env.PORT);