var MongoClient = require('mongodb').MongoClient,
    dbConnection = 'mongodb://127.0.0.1:27017/cccPlanDb',
    fs = require('fs'),
    _ = require('lodash'),
    csv = require('csv'),
    dbin = require('../data/dbinput.js');

var folder = './manualIn';
var files = fs.readdirSync(folder);

var format = [
    'term',
    'status',
    'name',
    'location',
    'meetings',
    'teacher',
    'capacity',
    'credits',
];


files.forEach(function (fn) {
    fs.readFile(folder + '\\' + fn, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        var item = {},
            items = [],
            count = 0;

        csv.parse(data, function (err, data) {
            data.forEach(function (row) {
                item = {};
                item.college = 'CABRILLO';
                item.term = row[0];
                item.status = row[1];
                item.name = row[2];
                item.id = ((item.name.match(/[A-Z]+-[0-9A-Z]+/) || [])[0] || '').replace('-', ' ');
                item.sid = (item.name.match(/[0-9]{5}/) || [])[0];
                item.name = item.name.split(/\)\s*/)[1];
                console.log(item.name, item.id, item.sid);
                item.location = row[3];
                item.meetings = row[4];
                item.teacher = row[5];
                item.capacity = row[6];
                item.credits = row[7];
                //console.log(item);
                items.push(_.clone(item));
            });
            dbin.storeClass(items);
        });
    });
});