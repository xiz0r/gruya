module.exports = function(app) {
    //gruya search
    app.get('/search/:name', function(req, res) {

        var maxResult = 400;
        var listResultJson = new Array();
        var nameSearch = req.params.name.toLowerCase();

        console.log("------------------------------------");
        console.log("Busqueda por: " + nameSearch);
        console.log("------------------------------------");

        console.log("app listsong:" + app.listSongs.length);

        for(var i in app.listSongs) {
            //Si no esta definida no hacemos naranja...
            if(app.listSongs[i]) {
                var search = app.listSongs[i].toLowerCase();

                //Buscamos la cadena contra el nombre del archivo
                if(search.match(nameSearch)) {
                    var jsonItem = { "uri": app.listSongs[i] };

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
