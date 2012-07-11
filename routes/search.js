module.exports = function(app) {

    var fs = require('fs');
    var listSongs = new Array();
    var read_stream = fs.createReadStream('./playlist.m3u', { encoding: 'ascii' });
    read_stream.on("data", function(data) {

        listSongs = listSongs.concat(data.split("\n"));
    });

    read_stream.on("error", function(err) {
        console.error("An error occurred: %s", err)
    });


    //gruya search
    app.get('/search/:name', function(req, res) {

        var maxResult = 400;
        var listResultJson = new Array();
        var resultJson = new String();
        var nameSearch = req.params.name;

        console.log("------------------------------------");
        console.log("Busqueda por: " + nameSearch);
        console.log("Cantidad de temas: " + listSongs.length);
        console.log("------------------------------------");

        for(var i in listSongs) {

            var songArray = listSongs[i].split("/");

            var song = songArray[songArray.length - 1];
            var artist = songArray[songArray.length - 2];

            //Si no esta definida alguna de las variables no hacemos naranja...
            if(song && artist && nameSearch) {

                song = song.toLowerCase();
                artist = artist.toLowerCase();
                nameSearch = nameSearch.toLowerCase();

                //Buscamos la cadena contra el nombre del archivo
                if(song.match(nameSearch) || artist.match(nameSearch)) {

                    var nameSong = songArray[songArray.length - 1];
                    var artisOrAlbum = songArray[songArray.length - 2];
                    var songUri = listSongs[i];

                    var jsonItem = { "uri": songUri };

                    //console.log({"uri":songUri});
                    if(maxResult > listResultJson.length) {
                        listResultJson.push(jsonItem);
                    }
                    else {
                        break;
                    }
                }
            }
        }
        console.log("Resultados encontrados: " + listResultJson.length);
        res.json(listResultJson);
    });
}
