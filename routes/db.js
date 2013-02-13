/**
 * User: jgcolo
 * Date: 11/01/13
 * Time: 02:28 PM
 */
var contextDb = function() {

    var mongoose = require('mongoose');
    mongoose.connect('localhost', 'musicDataDb');

    this.db = this.mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));

    // Schema song
    var Song = new mongoose.Schema({
          artist          : { type: String, required: true }
        , name            : { type: String, required: true }
        , path            : { type: String, required: true }
        , album           : { type: String }
        , hit             : { type: Number }
        , downloads       : [user]
        , tags            : [tag]
    });

    // Song db model
    this.songModel = mongoose.model('Song', Song);
};


