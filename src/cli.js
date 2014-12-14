'use strict';

var optimist = require('optimist'),
    chalk = require('chalk'),
    currentFolder = require('path').resolve('./') + '/',
    argv, url, chanArchiver, proxy,
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
            ' Usage: ' + chalk.bold.cyan('chanarchive [OPTIONS] <URL>'),
            '',
            ' Current supported urls are',
            '',
            '  4CHAN   :: http://boards.4chan.org/' + chalk.cyan('<BOARD>') + '/thread/' + chalk.cyan('<THREAD>'),
            '  7CHAN * :: http://7chan.org/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.html',
            '  8CHAN   :: https://8chan.co/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.html',
            '  420CHAN :: http://boards.420chan.org/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.php',
            '',
            ' If you experience issues, report them here: ' + chalk.green('https://github.com/j3lte/chanarchive/issues'),
            '',
            '* This is experimental, because it uses a local proxy to download the page and convert it to JSON. This may',
            '  break when the website decides to change the design. If you have problems, report them on my Github page:',
            '  https://github.com/j3lte/chanarchive/issues'
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
        .describe('t', 'Num of concurrent downloads.')
        .default('t', 10)
    .alias('d', 'debug')
        .describe('d', 'Output verbose debug output')
        .boolean('d')
    .alias('v', 'version')
        .describe('v', 'prints current version')
    .argv;

url = argv._[0];

if (argv.version) {
    console.error(require('./package').version);
    process.exit(0);
}

if (argv._.length !== 1 || url.indexOf('http') !== 0) {
    console.log(optimist.help());
    process.exit(0);
}

if (argv.debug) {
    console.log('Using current folder to save: ' + currentFolder + '\n');
}

function runChanArchiver() {
    chanArchiver.useOriginalFileNames(argv.o);
    chanArchiver.setMaxThreads(argv.threads);

    if (argv.watch) {
        chanArchiver.setWatch(argv.interval * 1000);
    }

    if (argv.ext) {
        chanArchiver.setExtensions(argv.ext);
    }

    chanArchiver.on('parse', function () {
        console.log(' ' + chalk.green(chanArchiver.queue.length) + ' new files to download');
    });

    chanArchiver.on('end', function () {
        console.log(' %s', chalk.green('Download finished.'));
        if (proxy) {
            proxy.stop();
        }
    });

    chanArchiver.on('file:error', function (err, file) {
        console.log(chalk.red(' File error'));
        console.log(err);
    });

    if (argv.debug) {
        chanArchiver.on('file:start', function (file) {
            console.log(' File start : %s, size: %s bytes', chalk.green(file.url), chalk.green(file.size));
        });

        chanArchiver.on('file:check', function (file) {
            console.log(' File check : %s, md5: %s', chalk.green(file.fileName), chalk.green(file.md5sum));
        });
    }

    chanArchiver.on('file:end', function (file) {
        if (file.existed) {
            console.log(' File : %s skipped, %s already exists', chalk.green(file.url), chalk.green(file.fileName));
        } else if (file.completed) {
            console.log(' File : %s saved as %s', chalk.green(file.url), chalk.green(file.fileName));
        }
        if (argv.debug) {
            console.log(' Queue/Current/Finished: %s/%s/%s', chalk.green(chanArchiver.queue.length), chalk.green(chanArchiver.a), chalk.green(chanArchiver.fin.length));
        }
    });

    chanArchiver.on('error', function (err) {
        console.log(' ' + chalk.red('Error: ' + err.message));
        if (proxy) {
            proxy.stop();
        }
    });

    require('http').globalAgent.maxSockets =
    require('https').globalAgent.maxSockets = Math.max(argv.threads, 10);

    chanArchiver.download();
}

ChanTypes.get(url, function (type) {
    if (type) {
        if (type.useProxy) {
            proxy = new ChanProxy(type.useProxy);

            proxy.port = argv.p;
            type.proxyPort = argv.p;

            proxy.start(function () {
                chanArchiver = new ChanArchiver({
                    chan : type,
                    url : url,
                    folder : currentFolder
                });
                runChanArchiver();
            });
        } else {
            chanArchiver = new ChanArchiver({
                chan : type,
                url : url,
                folder : currentFolder
            });
            runChanArchiver();
        }
    } else {
        console.log(optimist.help());
        console.log(chalk.red('\n\nUnsupported url'));
        if (proxy) {
            proxy.stop();
        }
        process.exit();
    }
});

process.on('SIGINT', function() {
    chanArchiver.stop();
    console.log('\nCTRL+C. Chan archiver exit.');
    return process.exit();
});
