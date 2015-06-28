chanarchive
===========

[![NPM](https://nodei.co/npm/chanarchive.svg?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/chanarchive/)

[![Build Status](https://travis-ci.org/j3lte/chanarchive.svg?branch=master)](https://travis-ci.org/j3lte/chanarchive)
[![DAVID](https://david-dm.org/j3lte/chanarchive.svg)](https://david-dm.org/j3lte/chanarchive)
[![npm version](https://badge.fury.io/js/chanarchive.svg)](http://badge.fury.io/js/chanarchive)
[![Development Dependency Status](https://david-dm.org/j3lte/chanarchive/dev-status.svg?theme=shields.io)](https://david-dm.org/j3lte/chanarchive#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/j3lte/chanarchive/badges/gpa.svg)](https://codeclimate.com/github/j3lte/chanarchive)

Archiver for imageboards in NodeJS

Based on the idea of [4chan](https://github.com/ypocat/4chan) by [ypocat](https://github.com/ypocat), and my original [Gist](https://gist.github.com/j3lte/5326383). It archives a thread on an imageboard. Partly based on [4chan-downloader](https://www.npmjs.org/package/4chan-downloader).

## Usage

Install Node.js if you don't have it yet. Then from the command line:

    [sudo] npm install chanarchive -g

Then proceed as follows:

    chanarchive [options] <URL> [<URL2> <URL3> ... ]

You can also use shortcodes! Shortcode: imageboard/board/thread, e.g.: `8chan/b/9000`

Call the program with the `-h` or `--help` option to see more options. You can see the current output here in the [docs](https://github.com/j3lte/chanarchive/blob/master/docs/cli.md)

It will create a folder based on the imageboard, where it stores the current thread. This follows the pattern of the shortcode

## Supported Chans:

  * [4CHAN](http://www.4chan.org/)   ::  `http://boards.4chan.org/<BOARD>/thread/<THREAD>`
  * [7CHAN](http://7chan.org/)*  ::  `http://7chan.org/<BOARD>/res/<THREAD>`
  * [8CHAN](https://8ch.net/)   ::  `https://8ch.net/<BOARD>/res/<THREAD>.html`
  * [420CHAN](http://420chan.org/) ::  `http://boards.420chan.org/<BOARD>/res/<THREAD>.php`
  * [KRAUTCHAN](http://krautchan.net/)  ::  `http://krautchan.net/<BOARD>/thread-<THREAD>.html`

## Local proxy

Some of the imageboards (see above marked with a *) do not have a JSON API, so I decided to use a local proxy. Basically, chanarchive starts a local proxy where it does the requests. The local proxy returns a valid JSON that is parsed.

See the `proxy\proxies` directory. It downloads the imageboard page, uses cheerio to parse it and returns a JSON that is somewhat equal to the 4chan API output. It is highly experimental and it is possible that it breaks, when the website decides to update it's design.

## Todo (See [history](https://github.com/j3lte/chanarchive/blob/master/History.md))

  * Seperate chanarchive from the cli, so that it can me used as a seperate module (need restructuring)
  * Download a complete page (as in, all threads on front-page of some board)
  * Choose folder where to store the downloaded files
  * Generate a HTML page/template for offline viewing the thread

## [License](https://github.com/j3lte/chanarchive/blob/master/LICENSE)

(The MIT License)

Copyright (c) 2014 Jelte Lagendijk <jwlagendijk@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
