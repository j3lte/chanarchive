var optimist = require('optimist'),
    chalk = require('chalk'),
    chan4RegExp = /^http:\/\/boards\.4chan\.org\/(\w)+\/thread\/(\d)+/,                 // 4chan
    chan8RegExp = /^https:\/\/8chan\.co\/(\w)+\/res\/(\d+)\.html.*/,                    // 8chan
    chan420RegExp = /^http:\/\/boards\.420chan\.org\/(\w){1,}\/res\/(\d){1,}\.php.*/,   // 420chan
    argv, url,
    ChanArchiver = require('./chanarchive');

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
            chalk.green('Chan archiver'),
            '',
            'Run in the directory where you want the archive to be downloaded.',
            '',
            'Usage: chanarchive [OPTIONS] <URL>',
            '',
            'Current supported urls are',
            '',
            '4CHAN   :: http://boards.4chan.org/' + chalk.cyan('<BOARD>') + '/thread/' + chalk.cyan('<THREAD>'),
            '8CHAN   :: https://8chan.co/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.html',
            '420CHAN :: http://boards.420chan.org/' + chalk.cyan('<BOARD>') + '/res/' + chalk.cyan('<THREAD>') + '.php'
        ].join('\n'))
    .boolean('o')
    .alias('o', 'original-filenames')
        .describe('o', 'write original filenames instead of the timestamp filenames')
    .alias('w', 'watch')
        .describe('w', 'watch for new files.')
        .boolean('w')
    .alias('i', 'interval')
        .describe('i', 'watching interval in seconds.')
        .default('i', 10)
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
    process.exit();
}

if (chan4RegExp.test(url)) {
    chanArchiver = new ChanArchiver('4chan', url);
} else if (chan8RegExp.test(url)) {
    chanArchiver = new ChanArchiver('8chan', url);
} else if (chan420RegExp.test(url)) {
    chanArchiver = new ChanArchiver('420chan', url);
} else {
    console.log(optimist.help());
    console.log(chalk.red('\n\nUnsupported url'));
    process.exit();
}

process.on('SIGINT', function() {
    chanArchiver.stop();
    console.log('\nCTRL+C. Chan archiver exit.');
    return process.exit();
});

chanArchiver.useOriginalFileNames(argv.o);
chanArchiver.setMaxThreads(argv.threads);

if (argv.watch) {
    chanArchiver.setWatch(argv.interval * 1000);
}

chanArchiver.on('parse', function () {
    console.log(' ' + chalk.green(chanArchiver.queue.length) + ' new files to download');
});

chanArchiver.on('end', function () {
    console.log(' ' + chalk.green('Download finished.'));
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
});

require('http').globalAgent.maxSockets =
require('https').globalAgent.maxSockets = Math.max(argv.threads, 10);

chanArchiver.download();
