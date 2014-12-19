var expect = require('chai').expect;

var chanTypes = require('../lib/chantypes');

describe('chanTypes', function(){
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
            expect(returnUrl).to.not.equal(null);
        };
        chanTypes.get('8chan/b/9000', returnF);
    });

  });

});