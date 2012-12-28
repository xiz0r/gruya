var gruyaDb  = (function(){

    gruyaDb.prototype.Init = function() {

        // API standar, firefox y chrome
        var indexDB = window.indexDB || window.mozIndexDB || window.webkitIndexDB;

        var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
        var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;


    };

    gruyaDb.prototype.logError= function(e){
        console.log("IndexDB error " + e.code + ": " + e.message);
    };

})();