var http = require('http'),
    request = require('request'),
    fs = require('fs'),
    dbin = require('../data/dbinput.js'),
    cheerio = require('cheerio');

request.post({
    url: 'http://www.deanza.edu/schedule/opcourselist.html',
    form: {
        course: 'ACCT'
    }
}, function (error, response, body) {
    var $ = cheerio.load(body);
    var table = $('table');
    console.log(table);
});