/**
 * User: jgcolo, arturo
 * Date:
 * Time:
 */

var express = require('express')
    , less = require('less')
    , connect = require('connect')
    , e = require('events').EventEmitter
    , reds = require('reds')
    , nconf = require('nconf')
    , readdirp = require('readdirp');


/**
 * CONFIGURATION
 * -------------------------------------------------------------------------------------------------
 * load configuration settings from ENV, then settings.json.
 **/
nconf.env().file({file: './settings.json'});

var app = module.exports = express.createServer();

/**
 * REDS
 * -------------------------------------------------------------------------------------------------
 **/
//var search = app.search = reds.createSearch('music');
app.searchAlbum = reds.createSearch('albums');
app.searchArtist = reds.createSearch('artists');
app.searchSong = reds.createSearch('songs');

/**
 * CONFIGURATION
 * -------------------------------------------------------------------------------------------------
 * set up view engine (jade), css preprocessor (less), and any custom middleware (errorHandler)
 **/
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    //app.use(require('./middleware/locals'));
    //app.use(express.cookieParser());
    //app.use(express.session({ secret: 'azure zomg' }));
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(connect.static(__dirname + '/public'));
    app.use(connect.static(nconf.get('MP3_PATH'))); //Ruta de archivos mp3
    app.use(app.router);
    app.set('view options', { layout: false});
    app.use(require('stylus').middleware(__dirname + '/public'));
});

/**
 * GLOAD
 * -------------------------------------------------------------------------------------------------
 **/
var gload = require('./lib/gload')(app, nconf.get('CHUNK'));

/**
 * READ SONGS
 * -------------------------------------------------------------------------------------------------
 **/
var event = new e();
event.on('LoadSongs', function () {
    console.log("Iniciando lectura de archivos...");
    module.exports.listSongs = [];

    readdirp({ root: nconf.get('MP3_PATH'), fileFilter: '*.mp3' })
        .on('data',function (entry) {

            module.exports.listSongs.push(entry.fullPath);

        }).on("end", function () {

            console.log("Lectura de archivos finalizada. Archivos cargados: " + module.exports.listSongs.length);
            for (var i = 0; i < module.exports.listSongs.length; i++) {
                var str = module.exports.listSongs[i];
                if (str) {
                    gload.add(i, str);
                }
            }
        });
});

//Hacemos la primera carga de musica
event.emit('LoadSongs');

//Lanzamos la carga de musica cada 15min
//setInterval(function(){
//	event.emit('LoadSongs');
//},900000);

/**
 * ROUTING
 * -------------------------------------------------------------------------------------------------
 **/
require('./routes/home')(app);
require('./routes/search')(app);
/**
 * DISTRIBUTION PLAYLIST
 * -------------------------------------------------------------------------------------------------
 */
require('./server.io');
/**
 * INIT SERVER
 * -------------------------------------------------------------------------------------------------
 **/
app.listen(nconf.get('LISTEN_PORT'));
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
