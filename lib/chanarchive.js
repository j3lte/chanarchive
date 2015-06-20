/*eslint no-use-before-define:0*/
// Disabling this one because of ChanArchiver.prototype.handleNext
'use strict';
/*
 * chanarchive
 * https://github.com/j3lte/chanarchive
 *
 * Copyright (c) 2014-2015 Jelte Lagendijk
 * Licensed under the MIT license.
 */

var fs = require('fs');
var request = require('request');
var mkdirp = require('mkdirp');
var version = require('../package').version;
var headers = { 'User-Agent': 'Chanarchive/' + version };
var _ = require('lodash');
var Emitter = require('events').EventEmitter;
var util = require('util');

function ChanArchiver (options) {

    if (!(this instanceof ChanArchiver)) {
        return new ChanArchiver(options);
    }
    Emitter.call(this);

    if (!options || !options.chan) {
        return new Error('ChanArchiver not properly configured. Missing options.url');
    }

    _.extend(this, options.chan);

    if (!options.chan.alias) {
        return new Error('Unknown board type');
    }

    if (options.chan.useProxy) {
        var proxyPort = options.chan.proxyPort || 8088;
        this.proxyUrl = 'http://localhost:' + proxyPort + '/?url=' + options.url;
    }

    this.url = options.url;
    this.type = options.chan.alias;
    this._originalFilenames = false;

    var folderRoot = options.folder || './';
    this.saveFolder = folderRoot + options.chan.alias + '/';

    this._extensions = null;

    this.queue = [];
    this.fin = [];
    this.a = 0; // currently busy

    this.downloadTimeoutID = null;
    this.abort = false;
    this._concurrentThreads = 1;
    this._watchTimeOut = null;

    this.board = options.url.split(/\/|\?|&|=|\./g)[options.chan.b];
    this.thread = options.url.split(/\/|\?|&|=|\./g)[options.chan.t];

    this.name = this.type + '/' + this.board + '/' + this.thread;
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
};

ChanArchiver.prototype.download = function () {
    var boardUrl = this.proxyUrl || this.baseUrl + this.board + this.del + this.thread + '.json';
    var options = {
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
        var storageFolder = this.saveFolder + this.board + '/' + this.thread + '/';
        mkdirp(storageFolder, function(err) {
            if (err) {
                _this.emit('error', new Error('Error creating the folder'));
            } else {
                var jsonBody = JSON.parse(body);
                fs.writeFile(storageFolder + '!index.json', JSON.stringify(jsonBody, null, 4));
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
    this.emit('parse');
    if (this.queue.length) {
        for (var t = 0; t < this._concurrentThreads; t++) {
            this.handleNext();
        }
    } else if (this._watchTimeOut) {
        this.watchDownload();
    } else {
        this.emit('end');
    }
};

ChanArchiver.prototype.addFile = function (url, fileName) {
    var file = { url: url, fileName: fileName, size: 0, completed: 0, progress: 0};
    if (~this.fin.indexOf(file.url)) {
        return;
    }
    this.queue.push(file);
};

ChanArchiver.prototype.handleNext = function () {

    var save = function (exists) {

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

    };

    // RESPONSE (START)
    var r = function (res) {
        handleFile.size = parseInt(res.headers['content-length'], 10);
        this.emit('file:start', handleFile);
    }.bind(this);

    // ONDATA
    var d = function (chunk) {
        handleFile.completed += chunk.length;
        if (handleFile.size) {
            handleFile.progress = handleFile.completed / handleFile.size;
        }
        this.emit('file:chunk', handleFile, chunk);
        this.emit('file:progress', handleFile);
    }.bind(this);

    // ERROR
    var e = function (err) {
        this.emit('file:error', err, handleFile);
        fs.unlink(dest, function () {});
        next();
    }.bind(this);

    // FINISH
    var f = function () {
        this.emit('file:end', handleFile);
        this.fin.push(handleFile.url);
        next();
    }.bind(this);

    var next = function () {
        this.a -= 1;
        if (this.queue.length) {
            this.handleNext();
        } else if (!this.a) {
            if (this._watchTimeOut) {
                this.watchDownload();
            } else {
                this.emit('end');
            }
        }
    }.bind(this);

    if (this.abort || !this.queue.length) {
        return;
    }

    var handleFile = this.queue.shift();
    var dest = this.saveFolder + this.board + '/' + this.thread + '/' + handleFile.fileName;

    this.a += 1;

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
