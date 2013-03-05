/**
 * User: jgcolo, arturo
 * Date:
 * Time:
 */

var express = require('express')
    , less = require('less')
    , connect = require('connect')
    , fs = require('fs')
    , e = require('events').EventEmitter
    , reds = require('reds')
    , nconf = require('nconf')
    , mm = require('musicmetadata');

/**
 * CONFIGURATION
 * -------------------------------------------------------------------------------------------------
 * load configuration settings from ENV, then settings.json.
 **/
nconf.env().file({file:'./settings.json'});

var app = module.exports = express.createServer();

/**
 * REDS
 * -------------------------------------------------------------------------------------------------
 **/
var search = app.search = reds.createSearch('music');
var searchAlbum = app.searchAlbum = reds.createSearch('albums');
var searchArtist = app.searchArtist = reds.createSearch('artists');
var searchSong = app.searchSong = reds.createSearch('songs');

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
    app.use(express.compiler({ src:__dirname + '/public', enable:['less'] }));
    app.use(connect.static(__dirname + '/public'));
    app.use(connect.static(nconf.get('MP3_PATH'))); //Ruta de archivos mp3
    app.use(app.router);
    app.set('view options', { layout:false});
    app.use(require('stylus').middleware(__dirname + '/public'));
});

/**
 * READ SONGS
 * -------------------------------------------------------------------------------------------------
 **/
var event = new e();
event.on('LoadSongs', function () {
    console.log("Actualizando musica...");
    module.exports.listSongs = [];
    module.exports.listSongsString = "";
    var readStream = fs.createReadStream(nconf.get('PLAYLIST_PATH'), { encoding:'ascii' });

    readStream.on("data", function (data) {
        /* 
         * El tamaño del buffer de lectura es de 64kb.
         * Hacemos un concat por si el archivo tiene mas de 64kb.
         **/
        module.exports.listSongsString = module.exports.listSongsString.concat(data);
    });

    readStream.on("error", function (err) {
        console.error("Se rompio... :: %s", err)
    });

    readStream.on("close", function () {
        module.exports.listSongs = module.exports.listSongsString.split("\n");

        // Borramos el list de string temporal
        module.exports.listSongsString = "";

        // Evento que indexa el array
        event.emit('IndexSongs');
    });
});

event.on('IndexSongs', function () {

    console.log('Indexando musica...');
    // Indexamos la musica para hacer busquedas con reds

    for (var i = 0; i < module.exports.listSongs; i++) {
        var str = module.exports.listSongs[i];
        if (str != '') {
            var readStream = fs.createReadStream("/storage/Musica" + str.replace('\r', '').substring(1, str.length - 1));
            search.index(str.replace('\r', ''), i);
            var parser = new mm(readStream);
            parser.on('artist', function (result) {
                searchArtist.index(result, i);
            });
            parser.on('title', function (result) {
                searchSong.index(result, i);
            });
            parser.on('album', function (result) {
                searchAlbum.index(result, i);
            });
        }
    }

//    module.exports.listSongs.forEach(function (str, i) {
//        if (str != '') {
//            var readStream = fs.createReadStream("/storage/Musica" +  str.replace('\r', '').substring(1,str.length - 1));
//            search.index(str.replace('\r', ''), i);
//            var parser = new mm(readStream);
//            parser.on('artist', function (result) {
//                searchArtist.index(result, i);
//            });
//            parser.on('title', function (result) {
//                searchSong.index(result, i);
//            });
//            parser.on('album', function (result) {
//                searchAlbum.index(result, i);
//            });
//        }
//    });

    console.log("Carga de musica finalizada. Ficheros cargados: " + module.exports.listSongs.length);
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
