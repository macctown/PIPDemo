var mongoose = require('mongoose');

var connections_pool = {};

exports.getMongoDBConnection = function(dbName) {
    "use strict";
    if(connections_pool[dbName]){
        return connections_pool[dbName];
    }
    else{
        connections_pool[dbName] = mongoose.createConnection('mongodb://localhost:27017/' + dbName);
        return connections_pool[dbName];
    }
}