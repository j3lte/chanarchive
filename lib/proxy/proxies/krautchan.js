'use strict';

/**
 * Krautchan handler
 * Based on design seen @ June 20, 2015
 * Last checked working: June 20, 2015
 * If anything is broken (due to design change), report it at :: https://github.com/j3lte/chanarchive/issues
 */

var path = require('path');

module.exports = {
    postClass: '.file_thread,.file_reply',
    postHandler: function (postElement, $) {
        var post = {};

        var $filename = $(postElement).find('.filename');
        // Check if image is there
        if ($filename.length) {

            var url = $filename.find('a').first().attr('href');
            if (url.indexOf('http://krautchan.net') !== 0) {
                url = 'http://krautchan.net' + url;
            }
            var filename = $filename.find('a').first().text().trim();

            post.fileUrl = url;
            post.ext = path.extname(url);

            post.tim = path.dirname(url).replace(/http:\/\/krautchan\.net\/download\/(\d+)\..*/, '$1');

            post.filename = filename;
        }
        return post;
    }
};
