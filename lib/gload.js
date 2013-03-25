/**
 * User: jgcolo
 * Date: 3/15/13
 * Time: 12:35 AM
 */

/**
 * Module dependencies.
 */

var mm = require('musicmetadata')
    , fs = require('fs')
    , _ = require('underscore')
    , id3 = require('id3');

/**
 *
 * @constructor
 */

var Gload = module.exports = function (app, chunk) {

    //Self-Invoking Constructor
    if (!(this instanceof Gload)) {
        return new Gload(app, chunk);
    }

    this.app = app;
    this.chunk = chunk;
    this.queue = [];
    this.inProcess = 0;
};

/**
 *
 * @param song
 */

Gload.prototype.add = function (song) {
    if (song) {
        this.process(song);
    }
};

/**
 *
 * Procesa los archivos con musicmetadata para obtener la metadata id3
 * Si el limite maximo de archivos en proceso fue alcanzado se encola para ser procesado mas tarde.
 *
 * @param song
 */

Gload.prototype.process = function (song) {

    if (this.inProcess < this.chunk) {
        this.exeMusicMetadata(song);
    } else {
        this.queue.push(song);
    }
};

/**
 *
 */

Gload.prototype.processQueue = function () {
    while (this.queue.length > 0 && this.inProcess < this.chunk) {

        this.exeMusicMetadata(this.queue[0]);
        this.queue.splice(0, 1);
    }
};

/**
 *
 * @param song
 */

Gload.prototype.exeMusicMetadata = function (song) {

    var self = this;
    var currentSong = song;
   // var readStream = fs.createReadStream(currentSong.url,{autoClose: true});
    //var parser = new mm(readStream);
    //parser.setMaxListeners(0);

    this.inProcess++;
    console.log(this.inProcess);

    var mp3 = fs.readFileSync(currentSong.url);
    var result = new id3(mp3);
    result.parse();
    var a =  result.get('title');
    console.log(a);


//
//    parser.on('artist', function (result) {
//        self.app.searchArtist.index(result, currentSong.id);
//        self.app.listSongs[currentSong.id].artist = result;
//    });
//
    //parser.on('title', function (result) {
        //self.app.searchSong.index(result, currentSong.id);


//        console.log(readStream.path);
//        var item = _.where(self.app.listSongs, {url : readStream.path});
//        if(item)
//            self.app.listSongs[item[0].id].title = result;
//        console.log(self.app.listSongs[item[0].id]);
//        console.log('-----ini');
//        console.log('parser: title, result: ' + result + 'current.id:' + currentSong.id);
//        console.log('-----fin');
    //});
//
//    parser.on('album', function (result) {
//        self.app.searchAlbum.index(result, currentSong.id);
//        self.app.listSongs[currentSong.id].album = result;
//    });

//    parser.on('metadata', function(result){
//        console.log('metadata result:' + result + 'id context: ' + currentSong.id);
//        self.app.listSongs[currentSong.id].title = result.title;
//        self.app.listSongs[currentSong.id].artist = result.artist[0];
//        self.app.listSongs[currentSong.id].album = result.album;
//        self.app.listSongs[currentSong.id].year = result.year;
//        self.app.listSongs[currentSong.id].gender = result.genre[0];
//
//        self.app.searchArtist.index(result.artist, currentSong.id);
//        //self.app.searchSong.index(result.title, currentSong.id);
//        self.app.searchAlbum.index(result.album, currentSong.id);
//    });

//    parser.on('done', function (err) {
//        if (err) console.error(err);
//
////        console.log('---------------ini-------------------');
////        console.log('fin: ' + currentSong)
////        console.log(self.app.listSongs);
////        console.log('------------------fin----------------');
//
//        //readStream.destroy();
//        self.inProcess--;
//
//        //Process queue
//        self.processQueue();
//    });
};


