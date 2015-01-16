var http = require('http'),
    request = require('request'),
    fs = require('fs'),
    cli = require('cli'),
    dbin = require('../data/dbinput.js');

var resumeFN = 'cache/assist/resume.json';

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

var ids = JSON.parse(fs.readFileSync('./cache/assist/assist-index.json'));
console.log('ids', 'to:', ids.to.length, 'from: ', ids.from.length);

var incrementQuery = function (query, first) {
    var limits = [
        ['from', ids.from.length],
        ['major', ids.to[query.count.to].major.length],
        ['to', ids.to.length],
        ['end', 1]
    ];
    if (first !== true) {
        query.count.from += 1;
    }
    query.done += 1;

    limits.forEach(function (limit, index) {
        if (query.count[limit[0]] >= limit[1]) {
            query.count[limit[0]] = 0;
            query.count[limits[index + 1][0]]++;
        }
    });

    if (query.count.end > 0) {
        return false;
    }
    return true;
};

/// Make it so it only stores one query at a time
var buildQuery = function (query) {
    query.next = {
        to: ids.to[query.count.to],
        from: ids.from[query.count.from],
        major: ids.to[query.count.to].major[query.count.major],
        end: 0
    };
    return query;
};



var runQuery = function (query) {
    var nextQ = query.next,
        major = nextQ.major.id,
        toSchool = nextQ.to.id,
        fromSchool = nextQ.from.id;

    // clear the console
    process.stdout.write('\033c');


    cli.progress(query.done / query.total);

    console.log('Query', fromSchool, 'to', toSchool, 'major', major);
    console.log('Done:', '(', query.done, '/', query.total, ')',
        'Suceeded:', '(', query.successes, '/', query.total, ')',
        'Errors:', '(', query.errors, '/', query.total, ')',
        'Empty:', '(', query.empty, '/', query.total, ')');

    var options = [
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
        url = 'http://web1.assist.org/cgi-bin/REPORT_2/Rep2.pl' + queryString(options);


    request(url, function (error, response, body) {
        if (!error) {
            var fn = 'cache/assist/agreements/' + fromSchool + 'to' + toSchool + 'in' + major + '.html';

            var data = {
                from: nextQ.from,
                to: nextQ.to,
                major: nextQ.major,
                source: body,
                srcUrl: url,
                scrapedDate: new Date()
            };

            if (body.indexOf('ASSIST was not able to process your request') === -1) {
                fs.writeFileSync('cache/assist/agreements/' + fromSchool + 'to' + toSchool + 'in' + major + '.json',
                    JSON.stringify(data));
                query.successes++;
            } else {
                query.empty += 1;
            }
            //         dbin.storeAgreement();

        } else {
            query.errors++;
        }

        var next = incrementQuery(query, false);
        fs.writeFileSync('cache/assist/resume.json', JSON.stringify(query));

        if (next) {
            runQuery(buildQuery(query));
        }
    });
};

var limit = 4;
var startNext = function (query) {
    if (query.running.length < limit) {
        var next = incrementQuery(query, false);

        query.running.push(next);
        query.last = next;

        fs.writeFileSync('cache/assist/resume.json', JSON.stringify(query));

        if (next) {
            runQuery(buildQuery(next));
        }
    }
};


var getTotal = function () {
    var count = 0;
    ids.to.forEach(function (to) {
        console.log(count, to.major.length);
        count += to.major.length;
    });
    count *= ids.from.length;
    return count;
};

module.exports.run = function () {
    var query;
    if (fs.existsSync(resumeFN)) {
        query = JSON.parse(fs.readFileSync(resumeFN));
        incrementQuery(query, true);
    } else {
        query = {
            count: {
                to: 0,
                from: 0,
                major: 0
            },
            done: 0,
            successes: 0,
            errors: 0,
            total: getTotal(),
            next: {}
        };
        incrementQuery(query, true);
    }
    runQuery(buildQuery(query));
};
module.exports.run();