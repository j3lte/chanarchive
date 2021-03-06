'use strict';

/**
 * 7CHAN handler
 * Based on design seen @ October 27, 2014
 * Last checked working: June 20, 2015
 * If anything is broken (due to design change), report it at :: https://github.com/j3lte/chanarchive/issues
 */

var path = require('path');

module.exports = {
    postClass: '.post',
    postHandler: function (postElement, $) {
        var post = {};

        post.no = $(postElement.find('.reflink a').get(1)).html() || '';
        post.now = postElement.find('.post_header').first().contents().filter(function() {
                return this.type === 'text';
            }).text().replace(/\n/g, '') || '';
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
            var fileSizeText = fileSizeElement.text().trim().replace(/\n/g, ' '),
                fileRegEx = new RegExp('(^.* - \()(.*) , (.*) , (.*)( \))', 'gi'),
                filename = fileRegEx.exec(fileSizeText);

            post.filename = filename && filename.length > 5 ? filename[5] : '';
        }
        // Check if multi images
        var multiThumbs = $(postElement).find('span.multithumb,span.multithumbfirst');
        if (multiThumbs.length) {
            post.multi = [];
            multiThumbs.each(function (i, el) {
                var findUrl = $(el).find('a').first().attr('href'),
                    file = {};

                file.fileUrl = findUrl;
                file.ext = path.extname(findUrl);
                file.tim = path.basename(findUrl, path.extname(findUrl));

                post.multi.push({ file: file });
            });
        }
        return post;
    }
};
