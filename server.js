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
    , readdirp = require('readdirp')
    , entity = require('./lib/entity')
    , id3 = require('id3')
    , fs = require('fs');

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

    //app.use(express.logger());
    app.use(express.compress());

    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser());
    //app.use(express.cookieSession());
    //app.use(express.session({ secret: 'gruyasec' }));
    app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(connect.static(__dirname + '/public'));
    app.use(connect.static(nconf.get('MP3_PATH'))); //Ruta de archivos mp3
    app.use(app.router);
    app.set('view options', { layout: false});
    //app.use(require('stylus').middleware(__dirname + '/public'));
});

/**
 * GLOAD - Lectura de metadata
 * -------------------------------------------------------------------------------------------------
 **/
//var gload = require('./lib/gload')(app, nconf.get('CHUNK'));

/**
 * READ SONGS
 * -------------------------------------------------------------------------------------------------
 **/
var event = new e();
event.on('LoadSongs', function () {
    console.log("Iniciando lectura de archivos...");
    app.listSongs = [];

    readdirp({ root: nconf.get('MP3_PATH'), fileFilter: '*.mp3' })
        .on('data',function (entry) {

            var song = new entity.Song(entry.fullPath);
            app.listSongs.push(song);

        }).on("end", function () {
            process.nextTick(loadMetadata);
        });

    function loadMetadata() {
        console.log("Lectura de archivos finalizada. Archivos cargados: " + app.listSongs.length);
        console.log("Iniciando lectura de metadata...");

        app.listSongs.forEach(function(item, i){
            item.id = i;
            readAndParse(item);
        });
    }

    function readAndParse(song) {
        if (!song) return;

            var buffer = fs.readFileSync(song.url,{autoClose: true});
            var info = new id3(buffer);
            info.parse();

            song.title = info.get('title');
            song.artist = info.get('artist');
            song.album = info.get('album');
            song.gender = info.get('genre');
            song.track = info.get('track');

            index(song);

        if(app.listSongs.length - 1 === song.id){
            console.log("Lectura de metadata terminada.");
        }
    }

    function index(song) {
        if (song.album)
            app.searchAlbum.index(song.album, song.id);
        if (song.artist)
            app.searchArtist.index(song.artist, song.id);
        if (song.title)
            app.searchSong.index(song.title, song.id);
    }
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
