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
    mkdirp = require('mkdirp'),
    _ = require('lodash'),
    Emitter = require('events').EventEmitter,
    util = require('util'),
    saveFolder = '.';

module.exports = ChanArchiver;

function ChanArchiver (type, url) {

    if (!(this instanceof ChanArchiver)) {
        return new ChanArchiver(type, url);
    }
    Emitter.call(this);

    if (type === '4chan') {

        this.baseUrl = 'http://a.4cdn.org/';
        this.del = '/thread/';
        this.picUrl = 'http://images.4chan.org/';

        this.bodyHandler = this.handleChan4Posts;

    } else if (type === '420chan') {

        this.baseUrl = 'http://api.420chan.org/';
        this.del = '/res/';
        this.picUrl = 'http://boards.420chan.org/';

        this.bodyHandler = this.handleChan420Posts;

    } else {
        this.emit('error', new Error('Unknown board type'));
    }

    this.type = type;
    this._originalFilenames = false;
    this.saveFolder = saveFolder + '/' + type + '/';

    this.queue = [];
    this.fin = [];

    this.downloadTimeoutID = null;
    this.a = 0;
    this.abort = false;
    this._concurrentThreads = 1;
    this._watchTimeOut = null;

    this.board = url.split(/\/|\?|&|=|\./g)[5];
    this.thread = url.split(/\/|\?|&|=|\./g)[7];
}

util.inherits(ChanArchiver, Emitter);

ChanArchiver.prototype.useOriginalFileNames = function (original) {
    this._originalFilenames = original;
    return this;
};

ChanArchiver.prototype.setMaxThreads = function (concurrentDownloads) {
    this._concurrentThreads = concurrentDownloads;
    return this;
};

ChanArchiver.prototype.setWatch = function (timeout) {
    this._watchTimeOut = timeout || 10000;
    return this;
};

ChanArchiver.prototype.download = function () {
    var boardUrl = this.baseUrl + this.board + this.del + this.thread+'.json';
    this.downloadTimeoutID = 0;
    request(boardUrl, this.parsePage.bind(this));
    return this;
};

ChanArchiver.prototype.watchDownload = function () {
    if (this._watchTimeOut && !this.downloadTimeoutID) {
        this.downloadTimeoutID = setTimeout(this.download.bind(this), this._watchTimeOut);
    }
    return this;
};

ChanArchiver.prototype.parsePage = function (error, response, body) {
    var _this = this;
    if (!error && response.statusCode === 200 && response.headers['content-type'] === 'application/json') {
        var storageFolder = _this.saveFolder + _this.board + '/' + _this.thread + '/';
        mkdirp(storageFolder, function(err) {
            if (err) {
                this.emit('error', new Error('Error creating the folder'));
            } else {
                var jsonBody = JSON.parse(body);
                fs.writeFile(storageFolder + '!index.json',JSON.stringify(jsonBody, null, 4));
                _this.bodyHandler(jsonBody);
            }
        });
    } else {
        this.emit('error', new Error('Thread not found'));
    }
};

ChanArchiver.prototype.handleChan4Posts = function (body) {
    var _this = this;
    _.forEach(body.posts, function(post){
        if (post.filename) {
            var filename = _this._originalFilenames ? post.filename + '_' + post.tim : post.tim,
                orig = filename + post.ext,
                ren = _this.picUrl + _this.board + '/src/' + post.tim + post.ext;
            _this.addFile(ren,orig);
        }
    });
    _this.parsed();
};

ChanArchiver.prototype.handleChan420Posts = function (body) {
    var _this = this;
    _.forEach(body.posts, function(post){
        if (post.filename) {
            var orig = post.filename + post.ext,
                ren = _this.picUrl + _this.board + '/src/' + post.filename + post.ext;
            _this.addFile(ren,orig);
        }
    });
    _this.parsed();
};

ChanArchiver.prototype.parsed = function () {
    var _this = this;
    _this.emit('parse');
    if (_this.queue.length) {
        for (var t = 0; t < _this._concurrentThreads; t++) {
            _this.handleNext();
        }
    } else if (_this._watchTimeOut) {
        _this.watchDownload();
    } else {
        _this.emit('end');
    }
};

ChanArchiver.prototype.addFile = function (url, fileName) {
    var file = { url: url, fileName : fileName, size: 0, completed: 0, progress: 0};
    if (~this.fin.indexOf(file.url)) {
        return
    };
    this.queue.push(file);
};

ChanArchiver.prototype.handleNext = function () {
    var _this = this;

    if (_this.abort || !_this.queue.length) {
        return;
    }

    var handleFile = this.queue.shift(),
        dest = _this.saveFolder + _this.board + '/' + _this.thread + '/' + file.fileName;

    _this.a++;

    fs.exists(dest, save);

    function save(exists) {

        handleFile.existed = exists;
        if (exists) {
            return finish();
        }

        request(handleFile.url)
            .on('response', r)
            .on('data', d)
            .on('error', e)
            .pipe(fs.createWriteStream(dest))
            .on('error', e)
            .on('finish', f);

    }

    function r(res) {
        handleFile.size = parseInt(res.headers['content-length'], 10);
        _this.emit('file:start', handleFile);
    }

    function d(chunk) {
        handleFile.completed += chunk.length;
        if (handleFile.size) {
            handleFile.progress = handleFile.completed / handleFile.size;
        }
        _this.emit('file:chunk', handleFile, chunk);
        _this.emit('file:progress', handleFile);
    }

    function e(err) {
        _this.emit('file:error', err, handleFile);
        fs.unlink(dest, function () {});
        next();
    }

    function f() {
        _this.emit('file:end', handleFile);
        _this.fin.push(handleFile.url);
        next();
    }

    function next() {
        _this.a--;
        if (_this.queue.length) {
            _this.handleNext();
        } else if (!_this.a) {
            if (_this._watchTimeOut) {
                _this.watchDownload();
            } else {
                _this.emit('end');
            }
        }
    }
};

ChanArchiver.prototype.stop = function () {
    this.queue.length = 0;
    this.abort = true;
    this.watch(false);
    if (this.downloadTimeoutID) {
        clearTimeout(this.downloadTimeoutID);
        this.emit('end');
    }
};
