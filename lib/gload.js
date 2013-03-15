/**
 * User: jgcolo
 * Date: 3/15/13
 * Time: 12:35 AM
 */

/**
 * Module dependencies.
 */

var mm = require('musicmetadata')
    , fs = require('fs');

module.exports = function(app, chunk){
    return new Gload(app, chunk);
}

/**
 *
 * @constructor
 */

var Gload = function (app, chunk) {

    this.app = app;
    this.chunk = chunk;
    this.queue = [];
    this.inProcess = 0;
};

Gload.prototype.add = function (id, filePath) {
    if (filePath) {
        var file = {id: id, path: filePath};
        this.process(file);
    }
};


/**
 *
 * Funcion encargada de procesar los archivos con musicmetadata para obtener la metadata id3
 * Si el limite maximo de archivos en proceso fue alcanzado se encola para ser procesado mas tarde.
 *
 * @param file
 */

Gload.prototype.process = function (file) {

    if (this.inProcess < this.chunk) {
        this.exeMusicMetadata(file);
    } else {
        this.queue.push(file);
        console.log('-----');
        console.log('se encola file');
        console.log(this.queue.length);
        console.log('-----');
    }
};

Gload.prototype.processQueue = function () {
    while (this.queue.length > 0 && this.inProcess < this.chunk) {

        console.log('cola actual: ' + this.queue.length)
        console.log('Procesando cola archivo:');
        console.log(this.queue[0]);

        this.exeMusicMetadata(this.queue[0]);
        this.queue.splice(0, 1);
        console.log('se elimino de la cola------');
        console.log('tamano cola actual:' + this.queue.length)
    }
};

Gload.prototype.exeMusicMetadata = function (file) {

    var self = this;
    var id = file.id;
    var readStream = fs.createReadStream(file.path);
    var parser = new mm(readStream);

    this.inProcess++;

    console.log(file);
    console.log('inprocess: ' + this.inProcess);

    parser.on('artist', function (result) {
        self.app.searchArtist.index(result, id);
    });

    parser.on('title', function (result) {
       self.app.searchSong.index(result, id);
    });

    parser.on('album', function (result) {
        self.app.searchAlbum.index(result, id);
    });

    parser.on('done', function (err) {
        if (err) throw err;

        readStream.destroy();
        self.inProcess--;

        console.log('fin--------')
        console.log(file);
        console.log('inprocess: ' + self.inProcess);
        console.log('fin--------')
        //Process queue
        self.processQueue();
    });
};


