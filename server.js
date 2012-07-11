var express = require('express'),
    less = require('less'),
    connect = require('connect');

/**
* CONFIGURATION
* -------------------------------------------------------------------------------------------------
* load configuration settings from ENV, then settings.json.  Contains keys for OAuth logins. See 
* settings.example.json.  
**/
/*nconf.env().file({file: 'settings.json'});*/

var app = module.exports = express.createServer();


/**
* CONFIGURATION
* -------------------------------------------------------------------------------------------------
* set up view engine (jade), css preprocessor (less), and any custom middleware (errorHandler)
**/

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    //app.use(require('./middleware/locals'));
    //app.use(express.cookieParser());
    //app.use(express.session({ secret: 'azure zomg' }));
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(connect.static(__dirname + '/public'));
    app.use(app.router);
    app.set('view options', { layout: false});
});

/**
* ROUTING
* -------------------------------------------------------------------------------------------------
**/
require('./routes/home')(app);
require('./routes/search')(app);


/**
* LIST SONGS FROM FILE
* -------------------------------------------------------------------------------------------------
**/
/*var fs = require('fs');

var read_stream = fs.createReadStream('README.md', {encoding: 'ascii'});
read_stream.on("data", function(data){
  process.stdout.write(data);
});

read_stream.on("error", function(err){
  console.error("An error occurred: %s", err)
});*/

/**
* INIT SERVER
* -------------------------------------------------------------------------------------------------
**/
app.listen(8082);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

