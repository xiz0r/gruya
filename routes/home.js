module.exports = function(app) {

    // home page
    app.get('/', function(req, res) {        
        //res.render('index'); JADE
        res.sendfile('./views/index.html'); //HTML
    }); 

    app.get('/test', function(req, res) {  
        //res.render('index');      
        res.sendfile('./views/index.html');
    }); 
}
