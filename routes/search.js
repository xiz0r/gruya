/**
 * User: jgcolo, nstummo
 */

module.exports = function (app) {
    //gruya search
    app.get('/search/:filter/:query', function (req, res) {

        var maxResult = 500;
        var listResultJson = [];
        var filter = req.params.filter.toLowerCase();
        var nameSearch = req.params.query.toLowerCase();
        var response = res;

        console.log("------------------------------------");
        console.log("Query: " + nameSearch);
        console.log("------------------------------------");

        try {
            switch (filter) {
                case 'artist':
                    findArtis(nameSearch);
                    break;
                case 'album':
                    findAlbum(nameSearch);
                    break;
                case 'all':
                    findAll(nameSearch);
                    break;
            }
        } catch (error) {
            console.error(error);
        }


        /**
         * Busqueda por artista
         *
         * @param query {String}
         */
        function findArtis(query) {
            app.searchArtist.query(query).end(function (err, ids) {
                if (err) throw err;

                ids.forEach(function (id) {
                    if (maxResult > listResultJson.length) {
                        var song = app.listSongs[id];
                        listResultJson.push(song);
                    }
                });
                console.log("Artistas: " + listResultJson.length);
                response.json(listResultJson);
            });
        };

        /**
         * Busqueda por album
         *
         * @param query {String}
         */
        function findAlbum(query) {
            app.searchAlbum.query(query).end(function (err, ids) {
                if (err) throw err;

                ids.forEach(function (id) {
                    if (maxResult > listResultJson.length) {
                        var song = app.listSongs[id];
                        if (!~listResultJson.indexOf(song)) {
                            listResultJson.push(song);
                        }
                    }
                });

                console.log("Discos: " + listResultJson.length);
                response.json(listResultJson);
            });
        };

        /**
         * Busqueda sin filtro, Artista, Nombre tema, Album
         *
         * @param query {String}
         */
        function findAll(query) {
            app.searchArtist.query(query).end(function (err, ids) {
                if (err) throw err;

                ids.forEach(function (id) {
                    if (maxResult > listResultJson.length) {
                        var song = app.listSongs[id];
                        listResultJson.push(song);
                    }
                });

                app.searchSong.query(query).end(function (err, ids) {
                    if (err) throw err;

                    ids.forEach(function (id) {
                        if (maxResult > listResultJson.length) {
                            var song = app.listSongs[id];
                            if (!~listResultJson.indexOf(song)) {
                                listResultJson.push(song);
                            }
                        }
                    });

                    app.searchAlbum.query(nameSearch).end(function (err, ids) {
                        if (err) throw err;

                        ids.forEach(function (id) {
                            if (maxResult > listResultJson.length) {
                                var song = app.listSongs[id];
                                if (!~listResultJson.indexOf(song)) {
                                    listResultJson.push(song);
                                }
                            }
                        });

                        console.log("Resultados encontrados: " + listResultJson.length);
                        response.json(listResultJson);
                    });
                });
            });
        };
    });
};


