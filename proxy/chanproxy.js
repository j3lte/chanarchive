
var express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    path = require('path'),
    app = express();

function fileName (url) {

}

function handle7ChanPost (postElement, $) {
    var post = {};

    post.no = $(postElement.find('.reflink a').get(1)).html() || '';
    post.now = postElement.find('.post_header').first().contents().filter(function() {
            return this.type === 'text';
        }).text().replace(/\n/g,'') || '';
    post.name = $(postElement.find('.postername')).text();

    var msg = $(postElement.find('.message'));

    post.com = msg ? msg.html().trim() : '';

    var fileSizeElement = $(postElement).find('.file_size');
    // Check if image is there
    if (fileSizeElement.length) {

        var url = fileSizeElement.find('a').first().attr('href');

        post.fileUrl = url;
        post.ext = path.extname(url);
        post.tim = path.basename(url, path.extname(url));

        // Check if filename is present
        var fileSizeText = fileSizeElement.text().trim().replace(/\n/g,' '),
            fileRegEx = new RegExp('(^.* - \()(.*) , (.*) , (.*)( \))', 'gi'),
            filename = fileRegEx.exec(fileSizeText);

        post.filename = filename && filename.length > 5 ? filename[5] : '';
    }
    // Check if multi images
    var multiThumbs = $(postElement).find('span.multithumb,span.multithumbfirst');
    if (multiThumbs.length) {
        post.multi = [];
        multiThumbs.each(function (i, el) {
            var url = $(el).find('a').first().attr('href'),
                file = {};

            file.fileUrl = url;
            file.ext = path.extname(url);
            file.tim = path.basename(url, path.extname(url));
            post.multi.push({ file : file });
        });
    }
    return post;
}

app
    .get('/', function (req, res) {
        if (req.query.url) {
            var url = req.query.url,
                returnObj = {
                    posts : []
                };

            console.log('ChanProxy url request :' + url);

            request(url, function(error, response, html){

                if (!error) {

                    var $ = cheerio.load(html);
                    // First post:
                    $('.post').each(function (i, el) {
                        var post = handle7ChanPost($(el), $);
                        returnObj.posts.push(post);
                    });

                    res.send(returnObj);
                } else {
                    res.send(error);
                }
            });

        } else {
            res.send('EMPTY');
        }
    });

function ChanProxy () {
    this.app = app;
}

ChanProxy.prototype.start = function () {
    this.app.listen('8088');
    console.log('ChanProxy started at port 8088');

};

ChanProxy.prototype.stop = function () {
    this.app.stop();
    console.log('ChanProxy stopped');
};


exports = module.exports = ChanProxy;

var proxy = new ChanProxy();
proxy.start();
