var expect = require('chai').expect;

var chanTypes = require('../lib/chantypes');

describe('ChanTypes', function(){
  describe('get', function(){

    it('without parameters should return null', function(){
      var c = chanTypes.get();
      expect(c).to.equal(null);
    });

    it('without callback should return null', function(){
      var c = chanTypes.get('8chan/b/9000');
      expect(c).to.equal(null);
    });

    it('with invalid shortcodes should return null', function(){
        var returnF = function (chan, returnUrl) {
            expect(returnUrl).to.equal(null);
        };
        chanTypes.get('chan/b/9000', returnF);
        chanTypes.get('8chan//9000', returnF);
        chanTypes.get('8chan/b/', returnF);
    });

    it('with valid shortcode should return chan && returnUrl', function(){
        var returnF = function (chan, returnUrl) {
            expect(chan).to.not.equal(null);
            expect(returnUrl).to.not.equal(null);
        };
        chanTypes.get('8chan/b/9000', returnF);
    });

    it('get a valid 8chan url with shortcode', function(){
        var returnF = function (chan, returnUrl) {
            expect(returnUrl).to.equal('https://8ch.net/b/res/9000.html');
        };
        chanTypes.get('8chan/b/9000', returnF);
    });

    it('get a valid 4chan url with shortcode', function(){
        var returnF = function (chan, returnUrl) {
            expect(returnUrl).to.equal('http://boards.4chan.org/b/thread/9000');
        };
        chanTypes.get('4chan/b/9000', returnF);
    });

    it('get a valid 7chan url with shortcode', function(){
        var returnF = function (chan, returnUrl) {
            expect(returnUrl).to.equal('http://7chan.org/b/res/9000.html');
        };
        chanTypes.get('7chan/b/9000', returnF);
    });

    it('get a valid 420chan url with shortcode', function(){
        var returnF = function (chan, returnUrl) {
            expect(returnUrl).to.equal('http://boards.420chan.org/b/res/9000.php');
        };
        chanTypes.get('420chan/b/9000', returnF);
    });

    it('get a valid krautchan url with shortcode', function(){
        var returnF = function (chan, returnUrl) {
            expect(returnUrl).to.equal('http://krautchan.net/b/thread-9000.html');
        };
        chanTypes.get('krautchan/b/9000', returnF);
    });

  });

});