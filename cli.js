'use strict';
/*
 * chanarchive
 * https://github.com/j3lte/chanarchive
 *
 * Copyright (c) 2014 Jelte Lagendijk
 * Licensed under the MIT license.
 */

var optimist = require('optimist'),
var chalk = require('chalk');
var _ = require('lodash');
var updateNotifier = require('update-notifier');
var currentFolder = require('path').resolve('./') + '/';
var pkg = require('./package.json');
var argv, urls, proxy;
var todo = 0;
var archivers = [];
var chanArchiver = require('./lib/chanarchive');
var chanTypes = require('./lib/chantypes');
var chanProxy = require('./lib/proxy/chanproxy');

var banner = [
'',
'              _                                         _      _               ',
'             | |                                       | |    (_)              ',
'        ____ | |__   _____  ____   _____   ____   ____ | |__   _  _   _  _____ ',
'       / ___)|  _ \\ (____ ||  _ \\ (____ | / ___) / ___)|  _ \\ | || | | || ___ |',
'      ( (___ | | | |/ ___ || | | |/ ___ || |    ( (___ | | | || | \\ V / | ____|',
'       \\____)|_| |_|\\_____||_| |_|\\_____||_|     \\____)|_| |_||_|  \\_/  |_____)',
'                                                                                 ',
'                                                                Version : ' + chalk.cyan(pkg.version),
'                                                                By      : ' + chalk.cyan('@j3lte'),
''].join('\n');

updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
}).notify();

argv = optimist
    .usage([
            '',
            ' ' + chalk.green('Chan archiver : imageboard downloader'),
            '',
            ' Run in the directory where you want the archive to be downloaded.',
            '',
            ' Usage : ' + chalk.bold.cyan('chanarchive [OPTIONS] <URL> [<URL2> <URL3> ... ]'),
            '',
            ' > You can also use a shortcode instead of url: ' + chalk.cyan('chan') + '/' + chalk.cyan('board') + '/' + chalk.cyan('thread'),
            ' > E.g.: chanarchive 8chan/b/9000',
            '',
            ' Current supported imageboard urls are',
            '',
            '  4CHAN   :: http://boards.4chan.org/' + chalk.cyan('<BOARD>') + '/thread/' + chalk.cyan('<THREAD>'),
            '  7CHAN*  :: http://7chan.org/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.html',
            '  8CHAN   :: https://8chan.co/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.html',
            '  420CHAN :: http://boards.420chan.org/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.php',
            '',
            '* This is experimental, because it uses a local proxy to download the page and convert it to JSON. This may',
            '  break when the website decides to change the design.',
            '',
            ' If you experience issues, report them here: ' + chalk.green('https://github.com/j3lte/chanarchive/issues')
        ].join('\n'))
    .boolean('o')
    .alias('o', 'original-filenames')
        .describe('o', 'write original filenames instead of the timestamp filenames (does not always work)')
    .alias('e', 'ext')
        .describe('e', 'only use the following extensions (seperated by slashes; eg: gif/jpeg/webm)')
    .alias('w', 'watch')
        .describe('w', 'watch for new files.')
        .boolean('w')
    .alias('i', 'interval')
        .describe('i', 'watching interval in seconds.')
        .default('i', 10)
    .alias('p', 'proxy')
        .describe('p', 'when using local proxy (*see above) to parse, set port to listen serve local proxy')
        .default('p', 8088)
    .alias('t', 'threads')
        .describe('t', 'Num of concurrent downloads (max 10).')
        .default('t', 10)
    .alias('d', 'debug')
        .describe('d', 'Verbose debug output')
        .boolean('d')
    .alias('v', 'version')
        .describe('v', 'prints current version')
    .argv;

urls = argv._;
todo = urls.length;

if (argv.version) {
    console.log(pkg.name + ', version: ' + pkg.version + '\n');
    process.exit(0);
}

console.log(banner);

if (urls.length === 0) {
    console.log(optimist.help());
    process.exit(0);
}

if (argv.debug) {
    console.log('Using current folder to save: ' + currentFolder + '\n');
}

function runChanArchiver(archiver) {

    require('http').globalAgent.maxSockets =
    require('https').globalAgent.maxSockets = Math.max(argv.threads, 10);

    archiver.useOriginalFileNames(argv.o);

    //var maxThreadsPerDownloader = Math.max(1, Math.floor(argv.threads / urls)); // TODO
    archiver.setMaxThreads(argv.threads);

    if (argv.watch) {
        archiver.setWatch(argv.interval * 1000);
    }

    if (argv.ext) {
        archiver.setExtensions(argv.ext);
    }

    var archiverName = chalk.cyan(archiver.name);

    archiver
        .on('parse', function () {
            console.log(' [ %s ] %s new files to download', archiverName, chalk.green(archiver.queue.length));
        })
        .on('end', function () {
            console.log(' [ %s ] %s', archiverName, chalk.bold.green(' Download finished for: ' + archiver.url));
            if (proxy) {
                proxy.stop();
            }
            var index = _.findIndex(archivers, function(archive) { return archive.name === archiver.name; });
            if (index >= 0) {
                archivers.splice(index, 1);
            }
        })
        .on('file:error', function (err, file) {
            console.log(chalk.red(' [ %s ] File error'), archiverName);
            console.log(err);
        })
        .on('file:start', function (file) {
            if (argv.debug) {
                console.log(' [ %s ] File start : %s, size: %s bytes', archiverName, chalk.green(file.url), chalk.green(file.size));
            }
        })
        .on('file:end', function (file) {
            if (file.existed) {
                console.log(' [ %s ] File : %s skipped, %s already exists', archiverName, chalk.green(file.url), chalk.green(file.fileName));
            } else if (file.completed) {
                console.log(' [ %s ] File : %s saved as %s', archiverName, chalk.green(file.url), chalk.green(file.fileName));
            }
            if (argv.debug) {
                console.log(' [ %s ] Queue/Current/Finished: %s/%s/%s', archiverName, chalk.green(archiver.queue.length), chalk.green(archiver.a), chalk.green(archiver.fin.length));
            }
        })
        .on('file:check', function (file) {
            // File:check is not implemented yet
            if (argv.debug) {
                console.log(' [ %s ] File check : %s, md5: %s', archiverName, chalk.green(file.fileName), chalk.green(file.md5sum));
            }
        })
        .on('error', function (err) {
            console.log(' [ %s ] %s', archiverName, chalk.red(' Error: ' + err.message));
            todo--;
            if (todo === 0) {
                if (proxy) {
                   proxy.stop();
                }
            }
        })
        .download();
}

function addChanArchiver (type, url) {
    var chanArchiver = new chanArchiver({
        chan : type,
        url : url,
        folder : currentFolder
    });
    archivers.push(chanArchiver);
    runChanArchiver(chanArchiver);
}

_.forEach(urls, function (url) {
    chanTypes.get(url, function (chan, returnUrl) {
        if (chan) {
            url = returnUrl || url;
            if (chan.useProxy && proxy === undefined) {
                proxy = new chanProxy(chan.useProxy);

                proxy.port = argv.p;
                chan.proxyPort = argv.p;

                proxy.start(function () {
                    addChanArchiver(chan, url);
                });
            } else {
                addChanArchiver(chan, url);
            }
        } else {
            console.log(chalk.red('\n\nUnsupported url : ' + url));
            todo--;
            if (todo === 0) {
                if (proxy) {
                   proxy.stop();
                }
                process.exit();
            }
        }
    });
});

process.on('SIGINT', function() {
    if (proxy) {
        proxy.stop();
    }
    console.log('\nCTRL+C. Chan archiver exit.');
    return process.exit();
});
