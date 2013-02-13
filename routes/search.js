/**
 * User: jgcolo
 * Date:
 * Time:
 */

module.exports = function(app) {
    //gruya search
    app.get('/search/:name', function(req, res) {

        var maxResult = 500;
        var listResultJson = [];
        var nameSearch = req.params.name.toLowerCase();

        console.log("------------------------------------");
        console.log("Query: " + nameSearch);
        console.log("------------------------------------");

        app.search.query(nameSearch).end(function(err, ids){
            ids.forEach(function(id){
                if(maxResult > listResultJson.length) {
                    var song = app.listSongs[id].substring(0, app.listSongs[id].length);
                    listResultJson.push({ "uri": song });
                }
            });

            console.log("Resultados encontrados: " + listResultJson.length);
            res.json(listResultJson);
        });
    });
};
