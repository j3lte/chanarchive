chanarchive
===========

Archiver for chans in NodeJS

Based on the idea of [4chan](https://github.com/ypocat/4chan) by [ypocat](https://github.com/ypocat), and my original [Gist](https://gist.github.com/j3lte/5326383). It archives a thread on a chan.

## Usage

Install Node.js if you don't have it yet. Then from the command line:

    [sudo] npm install chanarchive -g

Then proceed as follows:

    chanarchive [options] <URL>

Call the program with the `--help` option to see more options

It will create a folder called `chanarchive` where it stores the current thread.

## Supported Chans:

  * 4CHAN   ::  `http://boards.4chan.org/<BOARD>/thread/<THREAD>`
  * 420CHAN ::  `http://boards.420chan.org/<BOARD>/res/<THREAD>.php`

## Todo

  * Watch a thread
  * Download multiple boards

## License

(The MIT License)

Copyright (c) 2014 [Jelte Lagendijk](http://jeltelagendijk.nl)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
