var expect = require('chai').expect;

var ChanArchiver = require('../lib/chanarchive');
var chanTypes = require('../lib/chantypes');

// fake4ChanType is used for creating a valid ChanArchiver
var fake4ChanType = {
  chan: {
    alias: '4chan',
    templateUrl: 'http://boards.4chan.org/%s/thread/%s',
    regEx: /^http:\/\/boards\.4chan\.org\/(\w)+\/thread\/(\d)+/,
    baseUrl: 'http://a.4cdn.org/',
    del: '/thread/',
    picUrl: 'http://images.4chan.org/',
    b: 5,
    t: 7,
    imagePostHandler: null
  },
  url: 'http://boards.4chan.org/b/thread/9000'
};

describe('ChanArchiver', function(){
  describe('creating empty', function(){

    it('should emit error if options is undefined', function(){
      var x = new ChanArchiver();
      expect(x.toString()).to.equal('Error: ChanArchiver not properly configured. Missing options.url');
    });

    it('should emit error if options.chan is undefined', function(){
      var x = new ChanArchiver({});
      expect(x.toString()).to.equal('Error: ChanArchiver not properly configured. Missing options.url');
    });

  });

  describe('creating valid 4chan ChanArchiver', function(){

    var chanArchiver;
    var chanType;
    var url;

    beforeEach(function(done){
      var returnF = function (chan, returnUrl) {
          chanType = chan;
          url = returnUrl;
          chanArchiver = new ChanArchiver({chan: chan, url: url});
          done();
      };
      chanTypes.get('4chan/b/9000', returnF);
    });

    it('should set the right properties', function(done){
      expect(chanArchiver.alias).to.equal(chanType.alias);
      expect(chanArchiver.picUrl).to.equal(chanType.picUrl);
      expect(chanArchiver.imagePostHandler).to.equal(chanType.imagePostHandler);
      expect(chanArchiver.url).to.equal(url);
      expect(chanArchiver.name).to.equal('4chan/b/9000');
      expect(chanArchiver.board).to.equal('b');
      expect(chanArchiver.thread).to.equal('9000');
      expect(chanArchiver.saveFolder).to.equal('./4chan/');
      expect(chanArchiver.useProxy).to.be.undefined;
      expect(chanArchiver.proxyUrl).to.be.undefined;
      done();
    });

    it('should set the right saveFolder when added to chanArchiver', function(done){
      chanArchiver = new ChanArchiver({chan: chanType, url: url, folder: './chan/'});
      expect(chanArchiver.saveFolder).to.equal('./chan/4chan/');
      done();
    });

  });

  describe('creating valid 8chan ChanArchiver', function(){

    var chanArchiver;
    var chanType;
    var url;

    beforeEach(function(done){
      var returnF = function (chan, returnUrl) {
          chanType = chan;
          url = returnUrl;
          chanArchiver = new ChanArchiver({chan: chan, url: url});
          done();
      };
      chanTypes.get('8chan/b/9000', returnF);
    });

    it('should set the right properties', function(done){
      expect(chanArchiver.alias).to.equal(chanType.alias);
      expect(chanArchiver.picUrl).to.equal(chanType.picUrl);
      expect(chanArchiver.imagePostHandler).to.equal(chanType.imagePostHandler);
      expect(chanArchiver.url).to.equal(url);
      expect(chanArchiver.name).to.equal('8chan/b/9000');
      expect(chanArchiver.board).to.equal('b');
      expect(chanArchiver.thread).to.equal('9000');
      expect(chanArchiver.saveFolder).to.equal('./8chan/');
      expect(chanArchiver.useProxy).to.be.undefined;
      expect(chanArchiver.proxyUrl).to.be.undefined;
      done();
    });

    it('should set the right saveFolder when added to chanArchiver', function(done){
      chanArchiver = new ChanArchiver({chan: chanType, url: url, folder: './chan/'});
      expect(chanArchiver.saveFolder).to.equal('./chan/8chan/');
      done();
    });

  });

  describe('creating valid 7chan ChanArchiver (with proxy)', function(){

    var chanArchiver;
    var chanType;
    var url;

    beforeEach(function(done){
      var returnF = function (chan, returnUrl) {
          chanType = chan;
          url = returnUrl;
          chanArchiver = new ChanArchiver({chan: chan, url: url});
          done();
      };
      chanTypes.get('7chan/b/9000', returnF);
    });

    it('should set the right properties', function(done){
      expect(chanArchiver.alias).to.equal(chanType.alias);
      expect(chanArchiver.picUrl).to.equal(chanType.picUrl);
      expect(chanArchiver.imagePostHandler).to.equal(chanType.imagePostHandler);
      expect(chanArchiver.url).to.equal(url);
      expect(chanArchiver.name).to.equal('7chan/b/9000');
      expect(chanArchiver.board).to.equal('b');
      expect(chanArchiver.thread).to.equal('9000');
      expect(chanArchiver.saveFolder).to.equal('./7chan/');
      done();
    });

    it('should set the right saveFolder when added to chanArchiver', function(done){
      chanArchiver = new ChanArchiver({chan: chanType, url: url, folder: './chan/'});
      expect(chanArchiver.saveFolder).to.equal('./chan/7chan/');
      done();
    });

    it('should set a proxy URL', function(done){
      expect(chanArchiver.proxyUrl).to.not.be.undefined;
      expect(chanArchiver.useProxy).to.not.be.undefined;
      expect(chanArchiver.proxyUrl).to.equal('http://localhost:8088/?url=http://7chan.org/b/res/9000.html');
      expect(chanArchiver.useProxy).to.equal('7chan');
      done();
    });

  });

  describe('creating valid 420chan ChanArchiver', function(){

    var chanArchiver;
    var chanType;
    var url;

    beforeEach(function(done){
      var returnF = function (chan, returnUrl) {
          chanType = chan;
          url = returnUrl;
          chanArchiver = new ChanArchiver({chan: chan, url: url});
          done();
      };
      chanTypes.get('420chan/b/9000', returnF);
    });

    it('should set the right properties', function(done){
      expect(chanArchiver.alias).to.equal(chanType.alias);
      expect(chanArchiver.picUrl).to.equal(chanType.picUrl);
      expect(chanArchiver.imagePostHandler).to.equal(chanType.imagePostHandler);
      expect(chanArchiver.url).to.equal(url);
      expect(chanArchiver.name).to.equal('420chan/b/9000');
      expect(chanArchiver.board).to.equal('b');
      expect(chanArchiver.thread).to.equal('9000');
      expect(chanArchiver.saveFolder).to.equal('./420chan/');
      expect(chanArchiver.useProxy).to.be.undefined;
      expect(chanArchiver.proxyUrl).to.be.undefined;
      done();
    });

    it('should set the right saveFolder when added to chanArchiver', function(done){
      chanArchiver = new ChanArchiver({chan: chanType, url: url, folder: './chan/'});
      expect(chanArchiver.saveFolder).to.equal('./chan/420chan/');
      done();
    });

  });

  describe('creating valid krautchan ChanArchiver (with proxy)', function(){

    var chanArchiver;
    var chanType;
    var url;

    beforeEach(function(done){
      var returnF = function (chan, returnUrl) {
          chanType = chan;
          url = returnUrl;
          chanArchiver = new ChanArchiver({chan: chan, url: url});
          done();
      };
      chanTypes.get('krautchan/b/9000', returnF);
    });

    it('should set the right properties', function(done){
      expect(chanArchiver.alias).to.equal(chanType.alias);
      expect(chanArchiver.picUrl).to.equal(chanType.picUrl);
      expect(chanArchiver.imagePostHandler).to.equal(chanType.imagePostHandler);
      expect(chanArchiver.url).to.equal(url);
      expect(chanArchiver.name).to.equal('krautchan/b/9000');
      expect(chanArchiver.board).to.equal('b');
      expect(chanArchiver.thread).to.equal('9000');
      expect(chanArchiver.saveFolder).to.equal('./krautchan/');
      done();
    });

    it('should set the right saveFolder when added to chanArchiver', function(done){
      chanArchiver = new ChanArchiver({chan: chanType, url: url, folder: './chan/'});
      expect(chanArchiver.saveFolder).to.equal('./chan/krautchan/');
      done();
    });

    it('should set a proxy URL', function(done){
      expect(chanArchiver.proxyUrl).to.not.be.undefined;
      expect(chanArchiver.useProxy).to.not.be.undefined;
      expect(chanArchiver.proxyUrl).to.equal('http://localhost:8088/?url=http://krautchan.net/b/thread-9000.html');
      expect(chanArchiver.useProxy).to.equal('krautchan');
      done();
    });

  });

});