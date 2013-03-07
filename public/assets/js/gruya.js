/**
 * User: jgcolo
 * Date:
 * Time:
 */

var currentSearch = "";
var myPlaylist;
var uriApolo = window.location.protocol + "//" + window.location.host;
var isMyPlaylist = true;

// Instanciamos el localstorage
var lsGruya = new GruyaStorage();

$(document).ready(function () {

    myPlaylist = new jPlayerPlaylist({
            jPlayer: "#jquery_jplayer_1",
            cssSelectorAncestor: "#jp_container_1"
        }, [],
        {
            playlistOptions: {
                autoPlay: true,
                enableRemoveControls: true
            },
            swfPath: "assets/js/jPlayer",
            supplied: "mp3, wma"
        });

    /**
     * Extendemos el objeto jPlayerPlaylist para manejar nosotros el next y el previous
     */
    jPlayerPlaylist.prototype.next = function () {
        var status = $(this.cssSelector.jPlayer).data("jPlayer").status;
        var index = (this.current + 1 < this.playlist.length) ? this.current + 1 : 0;

        var updateActivedInPlaylist = this.current + 1 < this.playlist.length;

        if (this.loop) {
            // See if we need to shuffle before looping to start, and only shuffle if more than 1 item.
            if (index === 0 && this.shuffled && this.options.playlistOptions.shuffleOnLoop && this.playlist.length > 1) {
                this.shuffle(true, true); // playNow
            } else {
                this.play(index);
                status.paused = false;
                //if(status.paused){
                //    this.pause();
                //}
            }
        } else {
            // The index will be zero if it just looped round
            if (index > 0) {
                this.play(index);
                status.paused = false;
                //if(status.paused){
                //    this.pause();
                //}
            }
        }

        if (updateActivedInPlaylist)
            updateActiveItem(index + 2);
        else
            updateActiveItem(-1);
    };

    jPlayerPlaylist.prototype.previous = function () {
        //var status = $(this.cssSelector.jPlayer).data("jPlayer").status;
        var index = (this.current - 1 >= 0) ? this.current - 1 : this.playlist.length - 1;

        var updateActivedInPlaylist = this.current - 1 >= 0;

        if (this.loop && this.options.playlistOptions.loopOnPrevious || index < this.playlist.length - 1) {
            this.play(index);
            // if(status.paused){
            //     this.pause();
            // }
        }

        if (updateActivedInPlaylist)
            updateActiveItem(index + 2);
        else
            updateActiveItem(-1);
    };

    /**
     * Bootstrap
     */
    $('.dropdown-toggle').dropdown();

    // Mostramos el gruyaName en el navBar
    $('#lblUserName').find('a').text(localStorage.gruyaName);

    // Cambiamos el foco de los botones en la barra de navegacion
    $("#menuBar").find("li").click(function () {
        if ($(this).attr("id") !== "liSearch" &&
            $(this).attr("id") !== "lblUserName" &&
            $(this).attr("id") !== "drpOptions") {
            $("#menuBar").find(".active").removeClass("active");
            $(this).addClass("active");

            var ini = $('.container-fluid');
            var player = $('#repo');
            var radio = $('.radio');

            if ($(this).text() === "Radio") {
                ini.fadeOut('fast', function () {
                    radio.fadeIn('slow');
                });
                player.fadeOut();

            } else {
                radio.fadeOut('fast', function () {
                    ini.fadeIn();
                });
                player.fadeIn();
            }
        }
    });

    // Selector del playlist
    var ulPlaylsit = $("#ulPlayList");

    // Carga inicial del playlist
    loadPlaylistFromLocalStorage();

    /**
     *  Agregar tema al playlist
     */
    $("#lista").on('click', "#btnAddPlaylist", function (e) {
        e.preventDefault();

        //Obtenemos la uri para el audio selecionado
        var uriSelectedSong = $(this).closest('tr').find('td:last').html();
        //Quitamos el punto basura que le deje al playlist
        uriSelectedSong = uriSelectedSong.substring(1, uriSelectedSong.length).trim();

        //Obtenemos el nombre del tema
        var song = uriSelectedSong.split("/");
        var nameSong = song[song.length - 1];

        var encodeUriSelectedSong = encodeURI(uriSelectedSong).replace("&", "%26");

        var uri = uriApolo + encodeUriSelectedSong;
        var li = "<li class='jp-playlist-current' id=" + uri + "><a href='javascript:;' class='close jp-playlist-item-remove'>x</a><a id='playListItem' href=" + uri + " class='jp-playlist-item' tabindex='1'>" + stringRemoveExtension(nameSong) + "</a></li>";
        $(li).insertAfter("#ulPlayList li:last");


        //Agregamos el tema al playlist en el localstorage
        if (isMyPlaylist && lsGruya) {
            lsGruya.add("default", uri); //Por ahora solo se guardan temas en el playlist por defecto
            lsGruya.save();

            // Notificamos el cambio en el playlist a los demas clientes
            notifyChangeLocalPlaylist();
        }

        // Agregamos la cancion al playlist
        myPlaylist.add({title: uri, artist: "", mp3: uri});

        // Si sos el primer item del playlist arranca a sonar amista!
        if (myPlaylist.playlist.length == 1) {
            myPlaylist.play(0);
            ulPlaylsit.find("li").addClass("active");
            showTitle(uri);
        }
    });

    /**
     * Habilitamos los acciones sobre el playlist
     */
    $("#btnClearPlaylist").on("click", function (e) {
        e.preventDefault();

        //Limpiamos playlist
        var countItems = ulPlaylsit.find("li").size();
        ulPlaylsit.find("li").slice(2, countItems).remove();

        // Borramos el playlist de jplayer
        myPlaylist.remove();

        if (isMyPlaylist) {
            // Borramos el localStorage
            lsGruya.removeAll();

            // Notificamos el cambio en el playlist a los demas clientes
            notifyChangeLocalPlaylist(true);
        }
    });

    $("#btnLoadMyPlaylist").on("click", function () {
        isMyPlaylist = true;
        loadPlaylistFromLocalStorage();
    });

    /**
     * Click en un item del playlist
     */
    ulPlaylsit.on('click', "#playListItem", function (e) {
        e.preventDefault();

        var li = ulPlaylsit.find("li");
        //removemos el active de los li
        li.removeClass("active");

        //Selecionamos el item que se hizo click
        $(this).parent().addClass("active");

        //Obtenemos el uri de la cancion
        var uri = $(this).attr("href");

        //Obtenemos el index de la cancion seleccionada
        var index = li.index($(this).parent()) - 2;

        //Ahora si, Dale gass!!
        myPlaylist.play(index);

        showTitle(uri);
    });

    /**
     * Remove item playlist
     */
    ulPlaylsit.on('click', 'a.jp-playlist-item-remove', function (e) {
        e.preventDefault();

        var index = ulPlaylsit.find("li").index($(this).parent()) - 2;

        // Al playlist magico de jplayer no le esta funcionando el myPlayList.remove(index) anda a saber porq...
        // creo que no le copa, pero si se le hace clic al playlist que el autogenera (este no se esta mostrando) si borra
        // la cancion del playlist, entonces vamos a hacerle creer que se le hizo clic a la X de su playlist... :)
        $("#jp_container_1").find(".jp-playlist").find("li:eq(" + index + ")").find("a:first").trigger("click"); //comiste jplayer...

        //Quitamos el item de la lista (li)
        $(this).parent().remove();

        if (isMyPlaylist) {
            // Quitamos el item del localstorage
            lsGruya.remove("default", index);
            lsGruya.save();

            // Notificamos el cambio en el playlist a los demas clientes
            notifyChangeLocalPlaylist();
        }
    });

    function updateActiveItem(index) {

        if (index !== -1) {
            //Obtenemos la lista de items de nuestro playlist
            var li = ulPlaylsit.find("li");
            //Removemos el active de los li
            li.removeClass("active");
            //Activamos el item que esta sonando now!
            var uri = ulPlaylsit.find("li:eq(" + index + ")").addClass("active").attr("id");

            //Mejor ni preguntar porq si le das next o previus deja el titulo display:none
            showTitle(uri); //TODO ahora que sobreescribimos el next y el previous se podria hacer ahi esta chanchada...
        }
    }

    function showTitle(uri) {
        // Mostramos el nombre de la cancion con un poco de color !!
        var nameSplit = decodeURI(uri).split("/");
        var name = stringRemoveExtension(nameSplit[nameSplit.length - 1]);
        var playerName = $("#playerName");

        playerName.text(name);
        $(".jp-title").show();
        playerName.fadeOut("slow", function () {
            playerName.fadeIn("slow");
        });
    }

    /**
     * SEARCH
     * -------------------------------------------------------------------------------------------------
     */

     /**
     * Busco álbum de manera horrible. Ya se va a arreglar. No me juzguen.
     */
    $("#lista").on('click', "#lnkAlbum", function (e) {
        e.preventDefault();
        var album = this.innerText;
        $("#txtSearch").val(album);
        search();
    });

    $('#txtSearch').bind('keypress', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            search();
        }
    });

    $("#icoSearch").click(function (e) {
        e.preventDefault();
        search();
    });

    function search() {
        var textSearch = $("#txtSearch").val(); //Texto a buscar
        if (textSearch === currentSearch || textSearch == "") {
            return;
        }
        currentSearch = textSearch;

        // jQuery AJAX
        $.getJSON("/search/" + textSearch, function (data) {
            // Loading
            var node = document.getElementById("loading").appendChild(s.canvas);
            s.play();

            // Limpiamos la tabla
            $("#lista").find("tr:gt(0)").remove();

            $.each(data, function (key, value) {
                var uri = data[key].uri.split("/");

                // btenemos el nombre del archivo y el album
                var nameSong = stringRemoveExtension(uri[uri.length - 1]);
                var artist = uri[uri.length - 2];

                // Generamos la propia row!
                // var row = "<tr><td><a id='btnAddPlaylist' class='addPlay' rel='tooltip' title='Agregar canción al Playlist' href='#'><i class='icon-music'></i></a></td>" +
                //     "<td>" + nameSong + "<p class='artist-song'>" + artist + "</p></td><td style='Display:none'>" + data[key].uri + "</td></tr>";

                var row = "<tr><td><a id='btnAddPlaylist' class='addPlay' rel='tooltip' title='Agregar canción al Playlist' href='#'><i class='icon-music'></i></a></td>" +
                    "<td>" + nameSong + "<p class='artist-song'><a id='lnkAlbum'>" + artist + "</a></p></td><td style='Display:none'>" + data[key].uri + "</td></tr>";


                $(row).insertAfter("#lista tr:last");
            });
            s.stop();
            document.getElementById("loading").removeChild(node);
        });

        //Habilitamos el tooltip
        $(document).on('mouseenter', 'a[rel=tooltip]', function () {
            $(this).tooltip('show');
        });
    }

    /**
     * OPTIONS
     * -------------------------------------------------------------------------------------------------
     **/
    $('#btnShare').on('click', function () {
        if (localStorage.gruyaName) {
            $('#lblGruyaName').text(localStorage.gruyaName);
            $('#msjModal').modal('show');
        } else {
            $('#msjModalInit').modal('show');
        }
    });
});

function clouseModalWindows() {

    var txtGruyaName = $('#txtGruyaName');
    var txtChangeGruyaName = $('#txtChangeGruyaName');
    var msjModalInit = $('#msjModalInit');
    var msjModal = $('#msjModal');
    var gruyaName = localStorage.gruyaName;
    var lblUserName = $('#lblUserName');

    var newName = txtGruyaName.val() !== ""
        ? txtGruyaName.val()
        : txtChangeGruyaName.val();

    if (msjModalInit.css('display') === "none") {
        msjModal.modal('hide');

        if (newName !== "") {
            socket.emit('changeGruyaName', {newName: newName, oldName: gruyaName});
            localStorage.gruyaName = newName;
            lblUserName.find('a').text(newName);
        }

    } else {
        msjModalInit.modal('hide');

        if (newName !== "") {
            localStorage.gruyaName = newName;
            lblUserName.find('a').text(newName);
            notifyChangeLocalPlaylist();
        }
    }

    txtChangeGruyaName.val("");
    txtGruyaName.val("");
}

function stringRemoveExtension(item) {
    var extSplit = item.split('.');
    var ext = extSplit[extSplit.length - 1];
    return item.replace('.' + ext, '');
}

function notifyChangeLocalPlaylist(isEmptyPlaylist) {
    if (!localStorage.gruyaName)
        return;

    if (!isEmptyPlaylist) {
        var newPlaylist = lsGruya.getAllPlayList();
        newPlaylist[0].gruyaName = localStorage.gruyaName;
        socket.emit('sendPlaylist', newPlaylist);
    } else {
        socket.emit('sendPlaylist', [
            {gruyaName: localStorage.gruyaName, songs: [] }
        ]);
    }
}

function loadPlaylistFromLocalStorage() {

    //Limpiamos playlist
    var ulPlaylsit = $("#ulPlayList");
    var countItems = ulPlaylsit.find("li").size();
    ulPlaylsit.find("li").slice(2, countItems).remove();
    myPlaylist.remove();

    // Si existe el playlist default lo cargamos
    var defaultPlayList = lsGruya.getAllPlayList();

    if (defaultPlayList.length != 0) {
        var elem = defaultPlayList[0].songs;
        _.each(elem, function (val) {

            //Obtenemos el nombre del tema
            var song = decodeURI(val).split("/");
            var nameSong = song[song.length - 1];

            //Agregamos los li
            var li = "<li class='jp-playlist-current' id=" + val + "><a href='javascript:;' class='close jp-playlist-item-remove'>x</a><a id='playListItem' href=" + val + " class='jp-playlist-item' tabindex='1'>" + stringRemoveExtension(nameSong) + "</a></li>";
            $(li).insertAfter("#ulPlayList li:last");

            //Agregamos los temas al playlist!
            myPlaylist.add({ title: val, artist: "", mp3: val });
        });
    }
}