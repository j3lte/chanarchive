var optimist = require('optimist'),
    chalk = require('chalk'),
    argv, url, chanArchiver, proxy,
    ChanArchiver = require('./lib/chanarchive'),
    ChanTypes = require('./lib/chantypes'),
    Proxy = require('./proxy/chanproxy');

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
''].join('\n');

console.log(banner);

argv = optimist
    .usage([
            '',
            ' ' + chalk.green('Chan archiver'),
            '',
            ' Run in the directory where you want the archive to be downloaded.',
            '',
            ' Usage: chanarchive [OPTIONS] <URL>',
            '',
            ' Current supported urls are',
            '',
            '  4CHAN   :: http://boards.4chan.org/' + chalk.cyan('<BOARD>') + '/thread/' + chalk.cyan('<THREAD>'),
            '  7CHAN * :: http://7chan.org/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.html',
            '  8CHAN   :: https://8chan.co/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.html',
            '  420CHAN :: http://boards.420chan.org/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.php',
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
    .alias('v', 'version')
    .alias('t', 'threads')
        .describe('t', 'Num of concurrent downloads.')
        .default('t', 10)
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
        console.log(' ' + chalk.green('Download finished.'));
        proxy && proxy.stop();
    });

    chanArchiver.on('file:error', function (err, file) {
        console.log('file error');
        console.log(err);
    });

    chanArchiver.on('file:end', function (file) {
        if (file.existed) {
            console.log(' %s skipped, %s already exists', chalk.green(file.url), chalk.green(file.fileName));
        } else if (file.completed) {
            console.log(' %s saved as %s', chalk.green(file.url), chalk.green(file.fileName));
        }
    });

    chanArchiver.on('error', function (err) {
        console.log(' ' + chalk.red('Error: ' + err.message));
        proxy && proxy.stop();
    });

    require('http').globalAgent.maxSockets =
    require('https').globalAgent.maxSockets = Math.max(argv.threads, 10);

    chanArchiver.download();
}

ChanTypes.get(url, function (type) {
    if (type) {
        if (type.useProxy) {
            proxy = new Proxy(type.useProxy);

            proxy.port = argv.p;
            type.proxyPort = argv.p;

            proxy.start(function () {
                chanArchiver = new ChanArchiver(type, url);
                runChanArchiver();
            });
        } else {
            chanArchiver = new ChanArchiver(type, url);
            runChanArchiver();
        }
    } else {
        console.log(optimist.help());
        console.log(chalk.red('\n\nUnsupported url'));
        process.exit();
    }
});

process.on('SIGINT', function() {
    chanArchiver.stop();
    console.log('\nCTRL+C. Chan archiver exit.');
    return process.exit();
});
