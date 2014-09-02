'use strict';
/*
 * chanarchive
 * https://github.com/j3lte/chanarchive
 *
 * Copyright (c) 2014 Jelte Lagendijk
 * Licensed under the MIT license.
 */

var fs = require('fs'),
    request = require('request'),
    optimist = require('optimist'),
    mkdirp = require('mkdirp'),
    lodash = require('lodash'),
    saveFolder = './chanarchive/',
    chan4RegExp = /^http:\/\/boards\.4chan\.org\/(\w)+\/thread\/(\d)+/,                 // 4chan
    chan420RegExp = /^http:\/\/boards\.420chan\.org\/(\w){1,}\/res\/(\d){1,}\.php.*/,   // 420chan
    argv, url, chanArchiver;

function ChanArchiver (type, url, originalFilenames) {

    var _this = this;

    _this.type = type;
    _this.originalFilenames = originalFilenames;
    _this.saveFolder = saveFolder + type + '/';
    _this.numFiles = 0;

    if (type === '4chan') {

        _this.baseUrl = 'http://a.4cdn.org/';
        _this.del = '/thread/';
        _this.picUrl = 'http://images.4chan.org/';

        _this.bodyHandler = _this.handleChan4Posts;

    } else if (type === '420chan') {

        _this.baseUrl = 'http://api.420chan.org/';
        _this.del = '/res/';
        _this.picUrl = 'http://boards.420chan.org/';

        _this.bodyHandler = _this.handleChan420Posts;

    }

    _this.board = url.split(/\/|\?|&|=|\./g)[5];
    _this.thread = url.split(/\/|\?|&|=|\./g)[7];

    _this.downloadBoard();
}

ChanArchiver.prototype.downloadBoard = function () {

    var _this = this,
        boardUrl = _this.baseUrl + _this.board + _this.del + _this.thread+'.json';

    request(boardUrl, function (error, response, body) {

        if (!error && response.statusCode === 200 && response.headers['content-type'] === 'application/json') {

            console.log("Downloaded: " + boardUrl + '\n');

            var storageFolder = _this.saveFolder + _this.board + '/' + _this.thread + '/';

            mkdirp(storageFolder, function(err) {

                if (err) {

                    console.error('Error creating folder! ' + err);

                } else {

                    console.log('Files saved in: ' + storageFolder + '\n');

                    var jsonBody = JSON.parse(body);

                    fs.writeFile(storageFolder + '!index.json',JSON.stringify(jsonBody, null, 4));

                    _this.bodyHandler(jsonBody);
                }
            });
        } else {
            console.log("Not found! Tried: " + boardUrl);
        }
    });

};

ChanArchiver.prototype.handleChan4Posts = function (body) {
    var _this = this;
    body.posts.forEach(
        function(post){
            if (post.filename) {
                _this.numFiles++;
                var filename = _this.originalFilenames ? post.filename + '_' + post.tim : post.tim,
                    orig = filename + post.ext,
                    ren = _this.picUrl + _this.board + '/src/' + post.tim + post.ext;

                _this.downloadPic(ren,orig);
            }
        }
    );
};

ChanArchiver.prototype.handleChan420Posts = function (body) {
    var _this = this;
    body.posts.forEach(
        function(post){
            if (post.filename) {
                _this.numFiles++;
                var orig = post.filename + post.ext,
                    ren = _this.picUrl + _this.board + '/src/' + post.filename + post.ext;

                _this.downloadPic(ren,orig);
            }
        }
    );
};

ChanArchiver.prototype.downloadPic = function (urlPic, orig) {

    var _this = this,
        localPath = _this.saveFolder + _this.board + '/' + _this.thread + '/' + orig;

    fs.exists(localPath, function (exists) {
        if (exists) {
            console.log('Already existing, skipping : ' + urlPic);
            _this.numFiles--;
        } else {
            var r = request(urlPic).pipe(fs.createWriteStream(localPath));
            r.on('close',function(){
                _this.numFiles--;
                console.log('Downloaded ' + urlPic + ' [ ' + _this.numFiles + ' remaining ]');
            });
            r.on('error',function(){
                _this.numFiles--;
                console.log('Error downloading ' + urlPic);
            });
        }
    });

};

process.on('SIGINT', function() {
    console.log('\nCTRL+C. Chan archiver exit.');
    return process.exit();
});

argv = optimist
    .usage([
            '',
            'Chan archiver',
            '',
            'Run in the directory where you want the archive to be downloaded.',
            '',
            'Usage: $0 [OPTIONS] <URL>',
            '',
            'Current supported urls are',
            '',
            '4CHAN   ::  http://boards.4chan.org/<BOARD>/thread/<THREAD>',
            '420CHAN :: http://boards.420chan.org/<BOARD>/res/<THREAD>.php'
        ].join('\n'))
    .boolean('o')
    .alias('o', 'original-filenames')
        .describe('o', 'write original filenames instead of the timestamp filenames')
    .alias('v', 'version')
    .describe('v', 'prints current version')
    .argv;

url = argv._[0];


if (argv.version) {
    console.error(require('../package').version);
    process.exit(0);
}

if (argv._.length !== 1 || url.indexOf('http://') !== 0) {
    console.log(optimist.help());
    process.exit();
}

if (chan4RegExp.test(url)) {
    chanArchiver = new ChanArchiver('4chan', url, argv.o);
} else if (chan420RegExp.test(url)) {
    chanArchiver = new ChanArchiver('420chan', url, argv.o);
} else {
    console.log(optimist.help());
    console.log('\n\nUnsupported url');
    process.exit();
}
