'use strict';
/**
 * 7CHAN Proxy, will be more general in the future. For now, while developing, use the following to
 * test this proxy:
 *
 * Install nodemon:
 * > npm install -g nodemon
 *
 * Uncomment last two lines
 *
 * Start proxy using nodemon
 * > nodemon ./chanproxy.js
 */

var express = require('express'),
    request = require('request'),
    version = require('../../package').version,
    headers = {
        'User-Agent':'Chanarchive/' + version
    },
    cheerio = require('cheerio'),
    app = express(),
    proxyType;

app
    .get('/', function (req, res) {
        if (req.query.url) {
            var url = req.query.url,
                returnObj = {
                    posts : []
                };

            //console.log('ChanProxy url request : ' + url);

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
    proxyType = require('./proxies/' + type);
    this.app = app;
    this.port = 8088;
    this.server = undefined;
}

ChanProxy.prototype.start = function (callback) {
    var cb = callback || function () {};
    this.server = this.app.listen(this.port, cb);
    console.log('ChanProxy started at port ' + this.port);

};

ChanProxy.prototype.stop = function () {
    this.server.close();
    console.log('ChanProxy stopped');
};


exports = module.exports = ChanProxy;
// Comment following links while using this as a proxy for chanarchive
//var proxy = new ChanProxy();
//proxy.start();
