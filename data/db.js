var MongoClient = require('mongodb').MongoClient,
    dbname = 'cccPlanDb',
    dburl = '127.0.0.1',
    dbport = 27017,
    dbFullUri = 'mongodb://' + dburl + ':' + dbport + '/' + dbname;

var connection;

module.exports.getConnection = function (callback) {
    if (connection) {
        callback(null, connection);
    } else {
        MongoClient.connect(dbFullUri, function (err, db) {
            if (!err) {
                connection = db;
            }
            callback(err, db);
        });
    }
};

module.exports.close = function () {
    if (connection) {
        connection.close();
        connection = null;
    }
};