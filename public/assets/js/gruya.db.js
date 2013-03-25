/**
 * User: jgcolo
 * Date:
 * Time:
 */

// un remove de verdad...
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

/**
 * Entity playlist
 *
 */

var playlist = (function () {

    // Constructor
    return function (playListKey, song) {
        this.gruyaName = "";
        this.name = playListKey;
        this.songs = [];
        this.songs.push(song);
    };
})();

var GruyaStorage = (function () {

    /**
     * constructor
     */
    var storage = function () {
        this.storagePlaylist = [];

        // Si existe el storage gruya dale q es tarde!
        if (localStorage.gruya) {
            this.storagePlaylist = parseLocalStorage(localStorage.gruya);
        }
    };

    /**
     *   Retorna todos los playlist
     */
    storage.prototype.getAllPlayList = function () {
        return this.storagePlaylist;
    };

    storage.prototype.getPlayList = function (key) {

        return getPlayList(key, this.storagePlaylist);
    };

    /**
     *   Almacena los playlist en el localStorage
     */
    storage.prototype.save = function () {
        localStorage.gruya = serializeLocalStorage(this.storagePlaylist);
    };

    /**
     *   Agrega un tema al playlist pasado como parametro
     */
    storage.prototype.add = function (playListKey, song) {
        //song = song.trim();
        if (song) {
            var pList = getPlayList(playListKey, this.storagePlaylist);

            if (pList) {
                pList.songs.push(JSON.stringify(song));
            }
            else {
                var newPlayList = new playlist(playListKey, JSON.stringify(song));
                this.storagePlaylist.push(newPlayList);
            }
        }
    };

    /**
     *   Borra un tema del playlist
     */
    storage.prototype.remove = function (playListKey, index) {
        if (typeof index === "number") {
            var pList = getPlayList(playListKey, this.storagePlaylist);
            if (pList) {
                pList.songs.remove(index);
            }
        }
    };

    storage.prototype.removeAll = function () {
        localStorage.gruya = "";
    };

    /**
     *   Busca un playlist por su key
     */
    function getPlayList(name, playlist) {
        return _.findWhere(playlist, {name:name});
    }

    /**
     *   Funcion que parsea el JSON del localStorage
     */
    function parseLocalStorage(lstorage) {
        var plist = JSON.parse(lstorage);
        _.each(plist, function (val) {
            val.songs = JSON.parse(val.songs);

            val.songs.forEach(function(song, i){
                val.songs[i] = JSON.parse(song);
            });
        });
        return plist;
    }

    /**
     *   Funcion que serealiza a JSON los playlist
     */
    function serializeLocalStorage(pList) {
        var cp = [];

        // Serealizamos las lista de canciones
        _.each(pList, function (val) {
            var serialPlaylist = new playlist(val.name);
            serialPlaylist.songs = JSON.stringify(val.songs);
            cp.push(serialPlaylist);
        });

        // Serealizamos la lista de playlist
        return JSON.stringify(cp);
    }

    return storage;
})();


