'use strict';
var _ = require('lodash');

var genericImagePostHandler = function (post) {
    var _this = this,
        filename = _this._originalFilenames ? post.filename + '_' + post.tim : post.tim,
        fullFileName = filename + post.ext,
        fileUrl = post.fileUrl || _this.picUrl + _this.board + '/src/' + post.tim + post.ext;

    if (fileUrl && (!_this._extensions || _this._extensions.indexOf(post.ext) !== -1)) {
        _this.addFile(fileUrl, fullFileName);
    }
};

var chans = {
    '4chan' : {
        alias : '4chan',
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
        regEx : /^https:\/\/8chan\.co\/(\w)+\/res\/(\d+)\.html.*/,
        baseUrl : 'https://8chan.co/',
        del : '/res/',
        picUrl : 'https://8chan.co/',
        b : 4,
        t : 6,
        imagePostHandler : genericImagePostHandler
    },
    '420chan' : {
        alias : '420chan',
        regEx : /^http:\/\/boards\.420chan\.org\/(\w){1,}\/res\/(\d){1,}\.php.*/,
        baseUrl : 'http://api.420chan.org/',
        del : '/res/',
        picUrl : 'http://boards.420chan.org/',
        b : 5,
        t : 7,
        imagePostHandler : function (post) {
            var _this = this,
                fullFileName = post.filename + post.ext,
                fileUrl = _this.picUrl + _this.board + '/src/' + post.filename + post.ext;
            _this.addFile(fileUrl, fullFileName);
        }
    }
};

function get (url, callback) {
    var chan = _.find(chans, function (chan) {
        return chan.regEx.test(url);
    });
    callback(chan);
}

module.exports.get = get;
