var currentSearch = "";
var myPlaylist;
var uriApolo = window.location.protocol + "//" + window.location.host;

$(document).ready(function() {

    myPlaylist = new jPlayerPlaylist({
        jPlayer: "#jquery_jplayer_1",
        cssSelectorAncestor: "#jp_container_1"
    }, [],
   {
    playlistOptions:
    {
        autoPlay: true,
        enableRemoveControls: true
    },
    swfPath: "assets/js/jPlayer",
    supplied: "mp3"
});

    /*******************************************************************
     * Extendemos el objeto jPlayerPlaylist para manejar nosotros el next y el previous
     */
    jPlayerPlaylist.prototype.next = function() {
        var status = $(this.cssSelector.jPlayer).data("jPlayer").status;
        var index = (this.current + 1 < this.playlist.length) ? this.current + 1 : 0;

        var UpdateActivedInPlaylist = this.current + 1 < this.playlist.length;

        if(this.loop) {
            // See if we need to shuffle before looping to start, and only shuffle if more than 1 item.
            if(index === 0 && this.shuffled && this.options.playlistOptions.shuffleOnLoop && this.playlist.length > 1) {
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
            if(index > 0) {
                this.play(index);
                status.paused = false;
                //if(status.paused){
                //    this.pause();
                //}
            }
        }

        if(UpdateActivedInPlaylist)
            UpdateActiveItem(index + 2);
        else
            UpdateActiveItem(-1);
    };

    jPlayerPlaylist.prototype.previous = function() {
        var status = $(this.cssSelector.jPlayer).data("jPlayer").status;
        var index = (this.current - 1 >= 0) ? this.current - 1 : this.playlist.length - 1;

        var UpdateActivedInPlaylist = this.current - 1 >= 0;

        if(this.loop && this.options.playlistOptions.loopOnPrevious || index < this.playlist.length - 1) {
            this.play(index);
           // if(status.paused){
           //     this.pause();
           // }
        }

        if(UpdateActivedInPlaylist)
            UpdateActiveItem(index + 2);
        else
            UpdateActiveItem(-1);
    };
    /*******************************************************************
     */

$(".collapse").collapse(); //bootstrap NO ME ACUERDO PARA QUE ERA ESTO... :)

//Cambiamos el foco de los botones en la barra de navegacion
$("#menuBar").find("li").click(function() {
    if($(this).attr("id") != "liSearch") {
        $("#menuBar").find(".active").removeClass("active");
        $(this).addClass("active");
    }
});

//Agregar tema al playlist
$("#lista").on('click', "#btnAddPlaylist", function(e) {
    e.preventDefault();
    //Obtenemos la uri para el audio selecionado
    var uriSelectedSong = $(this).closest('tr').find('td:last').html();
    //Quitamos el punto basura que le deje al playlist
    uriSelectedSong = uriSelectedSong.substring(1, uriSelectedSong.length);

    //Obtenemos el nombre del tema
    var song = uriSelectedSong.split("/");
    var nameSong = song[song.length - 1];

    //var uri = "http://localhost:81" + uriSelectedSong;
    var uri = uriApolo + uriSelectedSong;
    var li = "<li class='jp-playlist-current' id=" + uri + "><a href='javascript:;' class='close jp-playlist-item-remove'>x</a><a id='playListItem' href=" + uri + " class='jp-playlist-item' tabindex='1'>" + nameSong + "</a></li>";
    $(li).insertAfter("#ulPlayList li:last");

    //Agregamos la cancion al playlist
    myPlaylist.add({
        title: uri,
        artist: "",
        mp3: uri
    });

    //Si sos el primer item del playlist arranca a sonar amista!
    if(myPlaylist.playlist.length == 1){
        myPlaylist.play(0);
        $("#ulPlayList").find("li").addClass("active");
        ShowTitle(uri);
    }

    //Habilitamos los acciones sobre el playlist
    $("#btnClearPlaylist").on("click", function(e){

        //Limpiamos playlist
        var countItems = $("#ulPlayList").find("li").size();
        $("#ulPlayList").find("li").slice(2, countItems).remove();
        myPlaylist.remove();
    });

    $("#btnSavePlaylist").on("click", function(e){
        $('#msjModal').modal('show');
    });
});

// Click en un item del playlist
$("#ulPlayList").on('click', "#playListItem", function(e) {
    e.preventDefault();

    var li = $("#ulPlayList").find("li");
    //removemos el active de los li
    li.removeClass("active");

    //Selecionamos el item que se hizo click
    $(this).parent().addClass("active");

    //Obtenemos el uri de la cancion
    var uri = $(this).attr("href");

    //Obtenemos el index de la cancion seleccionada
    var index = li.index( $(this).parent() ) - 2;

    //Ahora si, Dale gass!!
    myPlaylist.play(index);

    ShowTitle(uri);
});

//Remove item playlist
$("#ulPlayList").on('click', 'a.jp-playlist-item-remove', function(e){
    e.preventDefault();

    var index = $("#ulPlayList").find("li").index( $(this).parent() ) - 2;

    // Al playlist magico de jplayer no le esta funcionando el myPlayList.remove(index) anda a saber porq...
    // creo que no le copa, pero si se le hace clic al playlist que el autogenera (este no se esta mostrando) si borra
    // la cancion del playlist, entonces vamos a hacerle creer que se le hizo clic a la X de su playlist... :)
    $("#jp_container_1").find(".jp-playlist").find("li:eq(" + index + ")").find("a:first").trigger("click"); //comiste jplayer...

    //Quitamos el item de la lista (li)
    $(this).parent().remove();
});

function UpdateActiveItem(index){

    if(index == -1) {
        return;
    }

    //Obtenemos la lista de items de nuestro playlist
    var li = $("#ulPlayList").find("li");
    //Removemos el active de los li
    li.removeClass("active");
    //Activamos el item que esta sonando now!
    var uri = $("#ulPlayList").find("li:eq("+ index +")").addClass("active").attr("id");

    //Mejor ni preguntar porq si le das next o previus deja el titulo display:none
    ShowTitle(uri); //TODO ahora que sobreescribimos el next y el previous se podria hacer ahi esta chanchada...
}

function ShowTitle(uri){
    // Mostramos el nombre de la cancion con un poco de color !!
    var nameSplit = uri.split("/");
    var name = nameSplit[nameSplit.length - 1];
    var playerName = $("#playerName");

    playerName.text(name);
    $(".jp-title").show();
    playerName.fadeOut("slow", function() {
        playerName.fadeIn("slow");
    });
}

/**************************************************************************
* Search
 **************************************************************************/
$('#txtSearch').bind('keypress', function(e) {
    if(e.keyCode == 13) {
        Search();
    }
});
    $("#icoSearch").click(function() {
        Search();
    });

function Search() {
    var textSearch = $("#txtSearch").val(); //Texto a buscar

    if (textSearch == currentSearch || textSearch == "") {
        return;
    }

    // jQuery AJAX
    $.getJSON("/search/" + textSearch, function (data) {

        //limpiamos la tabla
        $("#lista").find("tr:gt(0)").remove();

        $.each(data, function (key, value) {
            var uri = data[key].uri.split("/");

            //Obtenemos el nombre del archivo y el album
            var nameSong = uri[uri.length - 1];
            var artist = uri[uri.length - 2];

            //Generamos la propia row!
            var row = "<tr><td><a id='btnAddPlaylist' class='addPlay' rel='tooltip' title='Agregar canción al Playlist' href='#'><i class='icon-plus'></i></a></td><td>"
                + nameSong + "</td><td>" + artist + "</td><td style='Display:none'>" + data[key].uri + "</td></tr>";

            $(row).insertAfter("#lista tr:last");
        });
    });

    //Habilitamos el tooltip
    $(document).on('mouseenter', 'a[rel=tooltip]', function () {
        $(this).tooltip('show');
    });
    }
});

function ClouseModalWindows(){
    $('#msjModal').modal('hide')
}