/**
 * User: jgcolo
 * Date: 2/14/13
 * Time: 1:58 AM
 */
var io = require('socket.io').listen(3000);
var _ = require('underscore');

io.set('log level', 0);
var clientPlaylist = [];

io.on('connection', function (socket) {

    if (clientPlaylist.length != 0) {
        // Se le envia todos los playlist al cliente nuevo
        socket.emit('init', getInfoPlaylist(clientPlaylist));
    }

    // Evento utilizado por los clientes para compartir su playlist
    socket.on('sendPlaylist', function (val) {
        if (!val[0]) return;
        var data = val[0];

        var playlistUser = getPlaylist(data.gruyaName);
        if (playlistUser) {
            clientPlaylist[clientPlaylist.indexOf(playlistUser)] = data;
        }
        else {
            clientPlaylist.push(data);
        }

        // Notificamos a los clientes del nuevo playlist
        socket.broadcast.emit('updatePlaylist', getInfoPlaylist(clientPlaylist));
    });

    // Evento que envia la lista de canciones a un cliente
    socket.on('getPlaylist', function (playlistName) {
        socket.emit('resultPlaylist', getPlaylist(playlistName));
    });

    // Evento utilizado para notificar el cambio de nombre de los clientes
    socket.on('changeGruyaName', function (val) {
        var playlistUser = getPlaylist(val.oldName);
        if (playlistUser) {
            playlistUser.gruyaName = val.newName;

            // Notificamos a los clientes el cambio de nombre
            socket.broadcast.emit('newGruyaName', val);
        }
    });
});

/**
 * HELPER
 * -------------------------------------------------------------------------------------------------
 */
function getPlaylist(key) {
    var result = null;
    for (var i = 0; i < clientPlaylist.length; i++) {
        if (clientPlaylist[i].gruyaName === key) {
            result = clientPlaylist[i];
        }
    }
    return result;
}

function getInfoPlaylist(lplaylistInfo) {
    var result = [];
    for (var i = 0; i < lplaylistInfo.length; i++) {
        var info = { name:lplaylistInfo[i].gruyaName, countSongs:lplaylistInfo[i].songs.length };
        result.push(info);
    }
    return result;
}

