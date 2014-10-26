var path = require('path');

exports = module.exports = proxyType = {
    postClass : '.post',
    postHandler : function (postElement, $) {
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
}
