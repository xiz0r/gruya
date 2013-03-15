/**
 * User: jgcolo
 * Date:
 * Time:
 */

module.exports = function(app) {

    app.get('/', function(req, res) {        
        //res.sendfile('./views/index.html'); //HTML
        res.render('index');
    }); 
};
