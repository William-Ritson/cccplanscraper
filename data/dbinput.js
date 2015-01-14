var MongoClient = require('mongodb').MongoClient,
    dbConnection = 'mongodb://127.0.0.1:27017/cccPlanDb';

module.exports.store = function (item, collectionName) {
    MongoClient.connect(dbConnection, function (err, db) {
        if (err) {
            throw err;
        }

        var collection = db.collection(collectionName);

        collection.insert(item, function (errr, docs) {
            if (err) {
                throw err;
            }
            console.log('inserted item', item, 'into', collectionName);
            db.close();
        });

    });
};

module.exports.storeClass = function (items) {
    var item = items.pop();
    if (!item) {
        return;
    }
    console.log('store class', item.id);
    MongoClient.connect(dbConnection, function (err, db) {
        if (err) {
            console.error(err);
        }

        var collection = db.collection('courses'),
            session = {};

        session.location = item.location;
        session.meetings = item.meetings;
        session.teacher = item.teacher;
        session.capacity = item.capacity;
        session.sessionNumber = item.sid;


        collection.find({
            id: item.id
        }).toArray(function (err, data) {
            if (err) {
                console.error(err);
            }
            console.log(item.id, data.length);
            if (data.length > 0) {
                collection.update({
                    id: item.id
                }, {
                    $push: {
                        sessions: session
                    }
                }, function (err, data) {
                    if (err) {
                        console.error('update', err);
                    }
                    db.close();
                    module.exports.storeClass(items);
                });
            } else {
                collection.insert({
                    id: item.id,
                    college: item.college,
                    credits: item.credits,
                    name: item.name,
                    term: item.term,
                    sessions: [session]
                }, function (err, data) {
                    if (err) {
                        console.error('write', err);
                    }
                    db.close();
                    module.exports.storeClass(items);
                });
            }
        });
    });
};

module.exports.storeAgreement = function (agreement) {
    MongoClient.connect(dbConnection, function (err, db) {
        if (err) {
            throw err;
        }

        var collection = db.collection('agreements');

        collection.insert(agreement, function (err, docs) {
            if (err) {
                throw err;
            }
            console.log('inserted agreement');
            db.close();
        });

    });
};