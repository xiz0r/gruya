/**
 * User: jgcolo
 * Date: 3/5/13
 * Time: 3:33 AM
 */

$('.radio').find('i').on('click', function (e) {
    e.preventDefault();
    var vthis = $(this);
    var player = document.getElementById('jp_audio_0');

    // Validamos si hay otra radio sonando
    otherRadioIsPlaying(vthis, player);

    if (vthis.hasClass('icon-play')) {
        playRadio(vthis, player);
    } else {
        pauseRadio(vthis, player);
    }
});


var rContainer = $('.radioConainer');
rContainer.hover(function () {
        $(this).find('div').animate({
                height:'50px'
//                bottom:'50px'
            },
            function () {
                $(this).find('i').removeClass('ico-play-none');
            });
    },
    function () {
        $(this).find('div').animate({
                height:'0px'
//                bottom:'0px'
            },
            function () {
                $(this).find('i').addClass('ico-play-none');
            });
    });

/**
 * Funcion encargada de retornar la uri de la radio que se quiere escuchar
 * @param key identificador de la radio
 * @return {String} uri de la radio
 */
function getRadioUri(key) {
    var radioUri = '';
    switch (key) {
        case 'oceano':
            radioUri = "http://apolo:8000/Oceano.pls";
            break;
        case 'urbana':
            radioUri = "http://apolo:8000/Urbana.pls";
            break;
        case 'babel':
            radioUri = "http://apolo:8000/Babel.pls";
            break;
        case 'gruya':
            radioUri = "http://apolo:8000/gruyarandom.mp3";
            break;
        case 'radiocero':
            radioUri = "http://apolo:8000/RadioCero.pls";
            break;
        case 'elespectador':
            radioUri = "http://apolo:8000/ElEspectador.pls";
            break;
        case 'oldiesfm':
            radioUri = "http://apolo:8000/OldiesFM.pls";
            break;
        case 'radiodisney':
            radioUri = "http://apolo:8000/RadioDisney.pls";
            break;
    }
    return radioUri;
}

/**
 * Funcion que pausa el stream de la radio
 * @param vthis elemento i seleccionado
 * @param player tag audio html
 */
function pauseRadio(vthis, player) {
    player.pause();
    vthis.parent().parent().removeClass('playing-radio');
    vthis.addClass('icon-play');
    vthis.removeClass('icon-pause');
}

/**
 * Funcion que comienza la reproduccion del stream
 * @param vthis elemento i seleccionado
 * @param player tag audio html
 */
function playRadio(vthis, player) {
    $('#jquery_jplayer_1').jPlayer('clearMedia');
    myPlaylist.remove();

    player.src = getRadioUri(vthis.attr('id'));
    player.play();

    vthis.parent().parent().addClass('playing-radio');
    vthis.removeClass('icon-play');
    vthis.addClass('icon-pause');
}

function otherRadioIsPlaying(vthis, player) {
    var container = vthis.parent().parent().parent();
    if (container.find('.playing-radio').length > 0) {
        var i = container.find('.playing-radio').find('i');
        pauseRadio(i, player);
    }
}