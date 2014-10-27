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
    version = require('../package').version,
    headers = {
        'User-Agent':'Chanarchive/' + version
    },
    _ = require('lodash'),
    Emitter = require('events').EventEmitter,
    util = require('util');

function ChanArchiver (chan, url) {

    if (!(this instanceof ChanArchiver)) {
        return new ChanArchiver(chan, url);
    }
    Emitter.call(this);

    _.extend(this, chan);

    if (!chan.alias) {
        this.emit('error', new Error('Unknown board type'));
    }

    if (chan.useProxy) {
        var proxyPort = chan.proxyPort || 8088;
        this.proxyUrl = 'http://localhost:' + proxyPort + '/?url=' + url;
    }

    this.type = chan.alias;
    this._originalFilenames = false;
    this.saveFolder = './' + chan.alias + '/';

    this._extensions = null;

    this.queue = [];
    this.fin = [];

    this.downloadTimeoutID = null;
    this.a = 0;
    this.abort = false;
    this._concurrentThreads = 1;
    this._watchTimeOut = null;

    this.board = url.split(/\/|\?|&|=|\./g)[chan.b];
    this.thread = url.split(/\/|\?|&|=|\./g)[chan.t];
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

ChanArchiver.prototype.setExtensions = function (extensions) {
    var ext = _.map(extensions.split('/'), function (extension) {
        if (extension) {
            extension = extension.indexOf('.') !== 0 ? '.' + extension : extension;
            return extension;
        }
    });

    this._extensions = ext;
}

ChanArchiver.prototype.download = function () {
    var boardUrl = this.proxyUrl || this.baseUrl + this.board + this.del + this.thread+'.json',
        options = {
            url: boardUrl,
            method: 'GET',
            headers: headers
        };
    this.downloadTimeoutID = 0;
    request(options, this.parsePage.bind(this));
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
    if (!error && response.statusCode === 200 && response.headers['content-type'].indexOf('application/json') === 0) {
        var storageFolder = _this.saveFolder + _this.board + '/' + _this.thread + '/';
        mkdirp(storageFolder, function(err) {
            if (err) {
                this.emit('error', new Error('Error creating the folder'));
            } else {
                var jsonBody = JSON.parse(body);
                fs.writeFile(storageFolder + '!index.json',JSON.stringify(jsonBody, null, 4));
                _.forEach(jsonBody.posts, function(post){
                    if (post.filename) {
                        _this.imagePostHandler.call(_this, post);
                    } else if (post.multi) { // handle multifiles from 7chan
                        _.each(post.multi, function (multiPost) {
                            _this.imagePostHandler.call(_this, multiPost.file);
                        });
                    }
                });
                _this.parsed();
            }
        });
    } else {
        this.emit('error', new Error('Thread not found'));
    }
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
    var _this = this;
    var file = { url: url, fileName : fileName, size: 0, completed: 0, progress: 0};
    if (~this.fin.indexOf(file.url)) {
        return;
    }
    _this.queue.push(file);
};

ChanArchiver.prototype.handleNext = function () {
    var _this = this;

    function save(exists) {

        handleFile.existed = exists;
        if (exists) {
            return f();
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

    if (_this.abort || !_this.queue.length) {
        return;
    }

    var handleFile = this.queue.shift(),
        dest = _this.saveFolder + _this.board + '/' + _this.thread + '/' + handleFile.fileName;

    _this.a++;

    fs.exists(dest, save);
};

ChanArchiver.prototype.stop = function () {
    this.queue.length = 0;
    this.abort = true;
    this._watchTimeOut = null;
    if (this.downloadTimeoutID) {
        clearTimeout(this.downloadTimeoutID);
        this.emit('end');
    }
};

module.exports = ChanArchiver;
