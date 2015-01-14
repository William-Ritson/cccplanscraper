var http = require('http'),
    request = require('request'),
    fs = require('fs'),
    dbin = require('../data/dbinput.js');

var queryString = function (query) {
    var res = '?',
        first = true;
    query.forEach(function (item) {
        if (!first) {
            first = false;
        } else {
            res += '&';
        }
        res += item[0] + '=' + item[1];
    });
    return res;
};

var respCount = 0;
var runQuery = function (queries) {
    var nextQ = queries.pop(),
        major = nextQ.major,
        toSchool = nextQ.to,
        fromSchool = nextQ.from;
    console.log('Query from', fromSchool, 'to', toSchool, 'in', major);

    var query = [
        ['aay', '13-14'],
        ['dora', major],
        ['oia', toSchool],
        ['ay', '14-15'],
        ['event', 19],
        ['ria', toSchool],
        ['agreement', 'aa'],
        ['sia', fromSchool],
        ['ia', fromSchool],
        ['dir', '1&'],
        ['sidebar', false],
        ['rinst', 'left'],
        ['mver', 2],
        ['kind', 5],
        ['dt', 2]
    ],
        url = 'http://web1.assist.org/cgi-bin/REPORT_2/Rep2.pl' + queryString(query);


    request(url, function (error, response, body) {
        if (!error) {
            respCount++;
            var fn = 'scraped/' + fromSchool + 'to' + toSchool + 'in' + major + '.html';
            console.log('ok', fromSchool, 'to', toSchool, 'major', major, 'STATUS: ' + response.statusCode);

            fs.writeFileSync(fn, body);
            dbin.storeAgreement({
                from: fromSchool,
                to: toSchool,
                major: major,
                source: body,
                srcUrl: url,
                scrapedDate: new Date()
            });

        } else {
            console.log('error', fromSchool, 'to', toSchool, 'major', major, 'STATUS: ' + error);
        }
        console.log('starting next query remainig', queries.length);
        if (queries.length > 0) {
            runQuery(queries);
        }
    });
};

var fromSchools = [
        'WVC', // West Valley College
        'HARTNELL',
        'DAC', //De Anza
        'MONTEREY',
        'CABRILLO'
    ],
    toSchools = [
        {
            id: 'UCD',
            title: 'University of California Davis',
            majors: ['MATH.B.S', 'BIOLSCI.B.S.', 'HIST.A.B.', 'ENGLISH.A.B.', 'CHEM.B.S.', 'PHYSICS.B.S.', 'COMP.SCI.B.S.', 'ENG.CIV.B.S.', 'GEOLOGY.B.S', 'ECON.A.B.', 'POL.SCI.A.B.', 'PHILOS.A.B.', 'SOCIOL.A.B.', 'PSYCH.A.B.', 'INTREL']
        },
        {
            id: 'UCSC',
            title: 'University of California Santa Cruz',
            majors: ['MATH', 'BIOL', 'HIS', 'CHEM', 'PHYS', 'CMPSBS', 'EE', 'ECON', 'POLI', 'PHIL', 'SOCY', 'PSYC', 'BME']
        },
        {
            id: 'UCB',
            title: 'University of Califronia Berkly',
            majors: ['MATH', 'CHEMBIO', 'HISTORY', 'ENGLISH', 'CHEM.AB.BS ', 'PHYSICS', 'CS-AB', 'EECS', 'ECON', 'POL-SCI', 'PHILOS', 'SOCIOL', 'PSYCH', 'BUS ADM']
        },
        {
            id: 'UCSD',
            title: 'University of California San Diego',
            majors: ['MATHEMATICS', 'GENERAL BIOLOGY', 'HISTORY', 'CHEMISTRY', 'PHYSICS B.S.', 'COMP SCI', 'ELEC ENGR', 'ECONOMICS', 'POLITICAL SCIENCE', 'PHILOSOPHY', 'SOCIOLOGY', 'PSYCHOLOGY']
        }
    ];

var buildQuires = function () {
    var queries = [];
    toSchools.forEach(function (toSchool) {
        toSchool.majors.forEach(function (major) {
            fromSchools.forEach(function (fromSchool) {
                queries.push({
                    to: toSchool.id,
                    from: fromSchool,
                    major: major
                });

            });
        });
    });
    return queries;
};

module.exports.run = function () {
    runQuery(buildQuires());
};