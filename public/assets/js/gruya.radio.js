/**
 * User: jgcolo
 * Date: 3/5/13
 * Time: 3:33 AM
 */

$('.radio').find('a').on('click', function (e) {
    e.preventDefault();
    var uri = $(this).attr('href');
//    myPlaylist = new jPlayerPlaylist({
//            jPlayer:"#jquery_jplayer_1",
//            cssSelectorAncestor:"#jp_container_1"
//        }, [{mp3:'http://apolo:8000/oceano.pls'}],
//        {
//            playlistOptions:{
//                autoPlay:true,
//                enableRemoveControls:true
//            },
//            swfPath:"assets/js/jPlayer",
//            supplied:"mp3, wma"
//        });


//    myPlaylist.add({title:'radio', artist:"", mp3:uri});
////    myPlaylist.add({title:'radio', artist:"", });
//    myPlaylist.play(0);

    var stream = {
            title: "ABC Jazz",
            mp3: "http://apolo:8000/gruyarandom.mp3"
        };

    $("#jquery_jplayer_1").jPlayer('clearMedia');
    $("#jquery_jplayer_1").jPlayer('setMedia', stream);

//    $("#jquery_jplayer_1").jPlayer({
//        ready: function (event) {
//            ready = true;
////            $(this).jPlayer("setMedia", {mp3:"http://apolo:8000/gruyarandom.mp3"});
//            $(this).jPlayer("setMedia", "http://apolo:8000/gruyarandom.mp3");
//        },
//        pause: function() {
//            $(this).jPlayer("clearMedia");
//        },
//        error: function(event) {
//            alert(event);
//            if(ready && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
//                // Setup the media stream again and play it.
//                $(this).jPlayer("setMedia", "http://apolo:8000/gruyarandom.mp3").jPlayer("play");
//            }
//        },
//        swfPath: "js",
//        supplied: "mp3, ogg",
//        preload: "none",
//        wmode: "window"
//    });



//    $("#jquery_jplayer_1").jPlayer({
//        errorAlerts: true,
//        ready: function ()
//        {
//            $(this).jPlayer.setMedia(stream);
//        },
//        error: function (event) {
//            console.log(event.jPlayer.error);
//            console.log(event.jPlayer.error.type);
//        },
//        swfPath: "js",
//        solution: "html,flash",
//        supplied: "mp3"
//    });



});
