'use strict';
/*
 * chanarchive
 * https://github.com/j3lte/chanarchive
 *
 * Copyright (c) 2014 Jelte Lagendijk
 * Licensed under the MIT license.
 */

var _ = require('lodash');

var genericImagePostHandler = function (post) {
    var filename = this._originalFilenames ? post.filename + '_' + post.tim : post.tim;
    var fullFileName = filename + post.ext;
    var fileUrl = post.fileUrl || this.picUrl + this.board + '/src/' + post.tim + post.ext;

    if (fileUrl && (!this._extensions || this._extensions.indexOf(post.ext) !== -1)) {
        this.addFile(fileUrl, fullFileName);
    }

    // 8chan extra files
    if (post.extra_files && post.extra_files.length) {
        _.each(post.extra_files, function (extra_file) {
            this.imagePostHandler(extra_file);
        }.bind(this));
    }
};

var chans = {
    '4chan' : {
        alias : '4chan',
        templateUrl : 'http://boards.4chan.org/%s/thread/%s',
        regEx : /^http:\/\/boards\.4chan\.org\/(\w)+\/thread\/(\d)+/,
        baseUrl : 'http://a.4cdn.org/',
        del : '/thread/',
        picUrl : 'http://images.4chan.org/',
        b : 5,
        t : 7,
        imagePostHandler : genericImagePostHandler
    },
    '7chan': {
        alias : '7chan',
        templateUrl : 'http://7chan.org/%s/res/%s.html',
        regEx : /^http:\/\/7chan\.org\/(\w)+\/res\/(\d+)\.html/,
        //baseUrl : '',     // NOT USED
        //del : '/res/',    // NOT USED
        //picUrl : '',      // NOT USED
        b : 4,
        t : 6,
        useProxy : '7chan',
        imagePostHandler : genericImagePostHandler
    },
    '8chan': {
        alias : '8chan',
        templateUrl : 'https://8ch.net/%s/res/%s.html',
        regEx : /^https:\/\/8ch\.net\/(\w)+\/res\/(\d+)\.html.*/,
        baseUrl : 'https://8ch.net/',
        del : '/res/',
        picUrl : 'https://8ch.net/',
        b : 4,
        t : 6,
        imagePostHandler : genericImagePostHandler
    },
    '420chan' : {
        alias : '420chan',
        templateUrl : 'http://boards.420chan.org/%s/res/%s.php',
        regEx : /^http:\/\/boards\.420chan\.org\/(\w){1,}\/res\/(\d){1,}\.php.*/,
        baseUrl : 'http://api.420chan.org/',
        del : '/res/',
        picUrl : 'http://boards.420chan.org/',
        b : 5,
        t : 7,
        imagePostHandler : function (post) {
            var fullFileName = post.filename + post.ext;
            var fileUrl = this.picUrl + this.board + '/src/' + post.filename + post.ext;
            this.addFile(fileUrl, fullFileName);
        }
    }
};

var shortRegEx = /(4|7|8|420)chan\/(\w+)\/(\d+)/;

function get (url, callback) {
    var chan,
        returnUrl = null;

    if (typeof callback !== 'function' || !url) {
        return null;
    }

    if (shortRegEx.test(url)) {
        // Shortcode
        var p = url.split('/');

        chan = chans[p[0]];
        returnUrl = chan.templateUrl.replace('%s', p[1]).replace('%s', p[2]);

        callback(chan, returnUrl);
    } else {
        // Basic url
        chan = _.find(chans, function (chan) {
            return chan.regEx.test(url);
        });
        callback(chan, returnUrl);
    }

}

module.exports.get = get;
