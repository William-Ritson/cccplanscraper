var http = require('http'),
    request = require('request'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    dbin = require('../data/dbinput.js'),
    url = 'http://web1.assist.org/web-assist/articulationAgreement.do?inst1=none&inst2=none&ia=ARC&ay=14-15&oia=CSUC&dir=1',
    urlTemplate = 'http://web1.assist.org/web-assist/articulationAgreement.do?inst1=none&inst2=none&ia=ARC&ay=14-15&oia=%&dir=1',
    cacheDir = './cache/assist/',
    fn = cacheDir + 'assist-index.html';

var identifyMajor = function (title) {
    if (title.match(/B\.?\s*A/i)) {
        return 'Bachelor of Arts';
    } else if (title.match(/B\.?\s*S/i)) {
        return 'Bachelor of Sciences';
    } else {
        return 'Other';
    }
};

var getMajors = function ($) {
    var select = $('.major option'),
        results = [];

    select.each(function (index) {
        var item = $(this),
            title = item.text().replace(/to:/i, '').replace('\n', ' ').trim(),
            idRaw = item.val(),
            type = identifyMajor(title),
            id;

        if (idRaw.length > 0 && idRaw !== '-1') {
            id = idRaw.trim();
            results.push({
                title: title,
                id: id,
                type: type
            });
            console.log('index:', index, 'id:', id, 'title:', title, 'type:', type);
        }
    });

    return results;
};


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
            title = item.text().replace(/to:/i, '').replace('\n', ' ').trim(),
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

var getFrom = function ($) {
    return getSelect($, 'ia', identifyType);
};

var getTo = function ($) {
    return getSelect($, 'oia', identifyType);
};



var makeMajors = function (to, callback) {
    var count = 0;
    to.forEach(function (school) {
        request(urlTemplate.replace('%', school.id), function (error, response, body) {
            var $ = cheerio.load(body);
            school.major = getMajors($);
            count++;

            console.log('Got majors for', school.id, '(', count, '/', to.length, ')');
            if (count === to.length) {
                callback(to);
            }
        });
    });
};

var processData = function (error, body) {
    if (error) {
        console.error(error);
    } else {
        fs.writeFileSync(fn, body);
        var result = {
                to: [],
                from: []
            },
            $ = cheerio.load(body);

        result.from = getFrom($);
        result.to = getTo($);

        makeMajors(result.to, function () {
            fs.writeFileSync(cacheDir + 'assist-index.json', JSON.stringify(result));
        });
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