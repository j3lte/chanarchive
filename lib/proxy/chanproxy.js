'use strict';
/*
 * chanarchive
 * https://github.com/j3lte/chanarchive
 *
 * Copyright (c) 2014-2015 Jelte Lagendijk
 * Licensed under the MIT license.
 */

var express = require('express');
var request = require('request');
var chalk = require('chalk');
var version = require('../../package').version;
var headers = { 'User-Agent': 'Chanarchive/' + version };
var cheerio = require('cheerio');
var app = express();
var proxyType;

app
    .get('/', function (req, res) {
        if (req.query.url) {

            var url = req.query.url;
            var returnObj = {
                posts: []
            };
            var options = {
                url: url,
                method: 'GET',
                headers: headers
            };

            request(options, function(error, response, html){

                if (!error) {

                    var $ = cheerio.load(html);
                    $(proxyType.postClass).each(function (i, el) {
                        var post = proxyType.postHandler($(el), $);
                        returnObj.posts.push(post);
                    });

                    res.send(returnObj);
                } else {
                    res.send(error);
                }
            });

        } else {
            res.send({});
        }
    });

function ChanProxy (type) {
    if (!type) {
        //console.log('ChanProxy needs a type!');
        return null;
    }
    proxyType = require('./proxies/' + type);
    this.app = app;
    this.port = 8088;
    this.server = undefined;
}

ChanProxy.prototype.start = function (callback) {
    var cb = callback || function () {};
    this.server = this.app.listen(this.port, cb);
    console.log(' [ %s ] %s', chalk.bold.green('ChanProxy'), chalk.bold.green('started at port ' + this.port));
};

ChanProxy.prototype.stop = function () {
    this.server.close();
    console.log(' [ %s ] %s', chalk.bold.green('ChanProxy'), chalk.bold.green('stopped'));
};

exports = module.exports = ChanProxy;
