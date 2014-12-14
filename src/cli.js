'use strict';

var optimist = require('optimist'),
    chalk = require('chalk'),
    _ = require('lodash'),
    currentFolder = require('path').resolve('./') + '/',
    argv, urls, proxy,
    handled = 0,
    archivers = [],
    ChanArchiver = require('./lib/chanarchive'),
    ChanTypes = require('./lib/chantypes'),
    ChanProxy = require('./lib/proxy/chanproxy');

var banner = [
'',
'              _                                         _      _               ',
'             | |                                       | |    (_)              ',
'        ____ | |__   _____  ____   _____   ____   ____ | |__   _  _   _  _____ ',
'       / ___)|  _ \\ (____ ||  _ \\ (____ | / ___) / ___)|  _ \\ | || | | || ___ |',
'      ( (___ | | | |/ ___ || | | |/ ___ || |    ( (___ | | | || | \\ V / | ____|',
'       \\____)|_| |_|\\_____||_| |_|\\_____||_|     \\____)|_| |_||_|  \\_/  |_____)',
'                                                                                 ',
'                                                                Version : ' + chalk.cyan(require('./package').version),
'                                                                By      : ' + chalk.cyan('@j3lte'),
''].join('\n');

console.log(banner);

argv = optimist
    .usage([
            '',
            ' ' + chalk.green('Chan archiver'),
            '',
            ' Run in the directory where you want the archive to be downloaded.',
            '',
            ' Usage: ' + chalk.bold.cyan('chanarchive [OPTIONS] <URL> [<URL2> <URL3> ... ]'),
            '',
            ' Current supported urls are',
            '',
            '  4CHAN   :: http://boards.4chan.org/' + chalk.cyan('<BOARD>') + '/thread/' + chalk.cyan('<THREAD>'),
            '  7CHAN * :: http://7chan.org/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.html',
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

if (argv.version) {
    console.error(require('./package').version);
    process.exit(0);
}

if (argv._.length === 0) {
    console.log(optimist.help());
    process.exit(0);
}

if (argv.debug) {
    console.log('Using current folder to save: ' + currentFolder + '\n');
}

function runChanArchiver(archiver) {
    archiver.useOriginalFileNames(argv.o);
    archiver.setMaxThreads(argv.threads);

    if (argv.watch) {
        archiver.setWatch(argv.interval * 1000);
    }

    if (argv.ext) {
        archiver.setExtensions(argv.ext);
    }

    archiver.on('parse', function () {
        console.log(' [' + chalk.cyan(archiver.name) + '] ' + chalk.green(archiver.queue.length) + ' new files to download');
    });

    archiver.on('end', function () {
        console.log(' [' + chalk.cyan(archiver.name) + '] %s', chalk.green(' Download finished for: ' + archiver.url));
        if (proxy) {
            proxy.stop();
        }
        var index = _.findIndex(archivers, function(archive) { return archive.name === archiver.name; });
        if (index >= 0) {
            archivers.splice(index, 1);
        }
    });

    archiver.on('file:error', function (err, file) {
        console.log(chalk.red(' [' + chalk.cyan(archiver.name) + '] File error'));
        console.log(err);
    });

    if (argv.debug) {
        archiver.on('file:start', function (file) {
            console.log(' [' + chalk.cyan(archiver.name) + '] File start : %s, size: %s bytes', chalk.green(file.url), chalk.green(file.size));
        });

        archiver.on('file:check', function (file) {
            console.log(' [' + chalk.cyan(archiver.name) + '] File check : %s, md5: %s', chalk.green(file.fileName), chalk.green(file.md5sum));
        });
    }

    archiver.on('file:end', function (file) {
        if (file.existed) {
            console.log(' [' + chalk.cyan(archiver.name) + '] File : %s skipped, %s already exists', chalk.green(file.url), chalk.green(file.fileName));
        } else if (file.completed) {
            console.log(' [' + chalk.cyan(archiver.name) + '] File : %s saved as %s', chalk.green(file.url), chalk.green(file.fileName));
        }
        if (argv.debug) {
            console.log(' [' + chalk.cyan(archiver.name) + '] Queue/Current/Finished: %s/%s/%s', chalk.green(archiver.queue.length), chalk.green(archiver.a), chalk.green(archiver.fin.length));
        }
    });

    archiver.on('error', function (err) {
        console.log(' [' + chalk.cyan(archiver.name) + '] ' + chalk.red(' Error: ' + err.message));
        if (proxy) {
            proxy.stop();
        }
    });

    require('http').globalAgent.maxSockets =
    require('https').globalAgent.maxSockets = Math.max(argv.threads, 10);

    archiver.download();
}

_.forEach(urls, function (url) {
    if (url.indexOf('http') !== 0) {
        console.log(chalk.red('\n\nUnsupported url : ' + url));
    } else {
        ChanTypes.get(url, function (type) {
            if (type) {
                if (type.useProxy && proxy === undefined) {
                    proxy = new ChanProxy(type.useProxy);

                    proxy.port = argv.p;
                    type.proxyPort = argv.p;

                    proxy.start(function () {
                        var chanArchiver = new ChanArchiver({
                            chan : type,
                            url : url,
                            folder : currentFolder
                        });
                        archivers.push(chanArchiver);
                        runChanArchiver(chanArchiver);
                    });
                } else {
                    var chanArchiver = new ChanArchiver({
                        chan : type,
                        url : url,
                        folder : currentFolder
                    });
                    archivers.push(chanArchiver);
                    runChanArchiver(chanArchiver);
                }
            } else {
                //console.log(optimist.help());
                console.log(chalk.red('\n\nUnsupported url : ' + url));
                // if (proxy) {
                //     proxy.stop();
                // }
                //process.exit();
            }
        });
    }
});



process.on('SIGINT', function() {
    _.each(archivers, function (archiver) {
        archiver.stop();
    });
    if (proxy) {
        proxy.stop();
    }
    console.log('\nCTRL+C. Chan archiver exit.');
    return process.exit();
});
