/**
 * User: jgcolo
 * Date: 2/14/13
 * Time: 1:31 AM
 */
var socket = io.connect('http://localhost:3000');

// Instanciamos el localstorage
var lsGruya = new GruyaStorage();
var gruyaName = localStorage.gruyaName;
var currentPlaylist = lsGruya.getAllPlayList();

if (gruyaName && currentPlaylist.length != 0) {
    currentPlaylist[0].gruyaName = gruyaName;
    socket.emit('sendPlaylist', currentPlaylist);
}

/**
 * Evento que obtiene los nombre de los playlist compartidos
 */
socket.on('updatePlaylist', function (data) {
    loadRemotePlaylist(data);
});

/**
 * Evento emitido por el servidor al conectarse un cliente
 */
socket.on('init', function (data) {
    loadRemotePlaylist(data);
});

/**
 * Evento que carga la lista de canciones de un playlist seleccionado
 */
socket.on('resultPlaylist', function (data) {
    loadRemotePlaylistToLocal(data);
});

/**
 * Evento utilizado para notificar el cambio de nombre de un cliente
 */
socket.on('newGruyaName', function (data) {
    $('#listaRemoteSongs').find("li:contains(" + data.oldName + ")").fadeOut(function () {
        var li = $(this);
        $(li.find('span')[0]).text(data.newName);
        li.fadeIn();
    });
});

function loadRemotePlaylist(data) {
    // Limpiamos la lista de playlist
    $("#listaRemoteSongs").find("li:gt(0)").remove();

    // Iteracion mas rapida...
    for (var item = data[0], len = data.length; len; item = data[--len]) {
        if (item.name === localStorage.gruyaName)
            continue;

        var li = "<li><a id='btnGetRemotePlaylist' href='#'><span>" + item.name + "</span><div class='rfloat'><span class='uiSideNavCount'>" + item.countSongs + "</span></div>  </a></li><li class='divider'></li>";
        $(li).insertAfter("#listaRemoteSongs li:last");
    }
}

/**
 * Get remote playlist
 */
$("#listaRemoteSongs").on("click", "#btnGetRemotePlaylist", function () {
    var selectedRemotePlaylist = $(this).find('span:first').text();
    socket.emit("getPlaylist", selectedRemotePlaylist);
});

/**
 * Add remote playlist to local playlist
 */
function loadRemotePlaylistToLocal(data) {
    var ulPlaylsit = $("#ulPlayList");

    //Limpiamos playlist
    var countItems = ulPlaylsit.find("li").size();
    ulPlaylsit.find("li").slice(2, countItems).remove();
    myPlaylist.remove();
    lsGruya.removeAll(); //Borramos el localStorage

    for (var i = 0; i < data.songs.length; i++) {

        var uri = data.songs[i];
        var splitUri = data.songs[i].split("/");
        //Obtenemos el nombre del archivo y el album
        var nameSong = stringRemoveExtension(splitUri[splitUri.length - 1]);

        var li = "<li class='jp-playlist-current' id=" + uri + "><a href='javascript:;' class='close jp-playlist-item-remove'>x</a><a id='playListItem' href=" + uri + " class='jp-playlist-item' tabindex='1'>" + decodeURI(nameSong) + "</a></li>";
        $(li).insertAfter("#ulPlayList li:last");

        //Agregamos el tema al playlist en el localstorage
        if (lsGruya) {
            lsGruya.add("default", uri); //Por ahora solo se guardan temas en el playlist por defecto
            lsGruya.save();
        }

        //Agregamos la cancion al playlist
        myPlaylist.add({
            title:uri, artist:"", mp3:uri
        });
    }

    //Si sos el primer item del playlist arranca a sonar amista!
    if (myPlaylist.playlist.length == 1) {
        myPlaylist.play(0);
        ulPlaylsit.find("li").addClass("active");
        //ShowTitle(uri);
    }
}



