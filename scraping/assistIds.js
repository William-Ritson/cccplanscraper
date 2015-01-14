var http = require('http'),
    request = require('request'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    dbin = require('../data/dbinput.js'),
    url = 'http://web1.assist.org/web-assist/articulationAgreement.do?inst1=none&inst2=none&ia=ARC&ay=14-15&oia=CSUC&dir=1',
    cacheDir = './cache/assist/',
    fn = cacheDir + 'assist-index.html';

var identifyType = function (title) {
    if (title.match(/University of California/i)) {
        return 'UC';
    } else if (title.match(/State University/i)) {
        return 'CSU';
    } else if (title.match(/Polytechnic/i)) {
        return 'Polytechnic';
    } else if (title.match(/college/i)) {
        return 'CCC';
    } else {
        return 'Other';
    }
};


var getSelect = function ($, identifier, typeMatcher) {
    var select = $('#' + identifier + ' option'),
        results = [];

    select.each(function (index) {
        var item = $(this),
            title = item.text().replace('\n', ' ').trim(),
            idRaw = item.val().match(new RegExp('&' + identifier + '=([A-Z]+)')),
            type = typeMatcher(title),
            id;

        if (idRaw !== null) {
            id = idRaw[1];
            results.push({
                title: title,
                id: id,
                type: type
            });
            console.log('index:', index, "id:", id, "title:", title);
        }
    });

    return results;
};

var identifyMajor = function (title) {
    return 'BA';
};

var getMajors = function ($) {

};

var getFrom = function ($) {
    var fromSelect = $('#ia option'),
        results = [];

    fromSelect.each(function (index) {
        var item = $(this),
            title = item.text().replace('\n', ' ').trim(),
            idRaw = item.val().match(/&ia=([A-Z]+)/),
            type = identifyType(title),
            id;

        if (idRaw !== null) {
            id = idRaw[1];
            results.push({
                title: title,
                id: id,
                type: type
            });
            //console.log('index:', index, "id:", id, "title:", title);
        }
    });

    return results;
};

var getFrom = function ($) {
    return getSelect($, 'ia', identifyType);
};

var makeTo = function ($) {
    var toSelect = $('#oia option'),
        results = [];

    toSelect.each(function (index) {
        var item = $(this),
            title = item.text().replace(/to:/i, '').replace('\n', ' ').trim(),
            idRaw = item.val().match(/&oia=([A-Z]+)/),
            type = identifyType(title),
            id;

        if (idRaw !== null) {
            id = idRaw[1];
            results.push({
                title: title,
                id: id,
                type: type
            });
            console.log('index:', index, "id:", id, "title:", title);
        }
    });

    return results;
};

var processData = function (error, body) {
    if (error) {
        console.error(error);
    } else {
        var result = {
                to: [],
                from: []
            },
            $ = cheerio.load(body);

        result.from = getFrom($);
        result.to = makeTo($);

        fs.writeFileSync(fn, body);
        fs.writeFileSync(cacheDir + 'assist-index.json', JSON.stringify(result));
        return result;
    }
};

var makeRequest = function (useCache) {
    if (useCache && fs.existsSync(fn)) {
        console.log('Index cache found. Loading.');
        fs.readFile(fn, processData);
    } else {
        console.log('No making http request.');
        request(url, function (error, response, body) {
            console.log(processData(error, body));
        });
    }
};

makeRequest(true);