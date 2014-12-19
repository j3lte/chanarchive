var expect = require('chai').expect;

var ChanArchiver = require('../lib/chanarchive');

describe('ChanArchiver', function(){
  describe('creating', function(){

    it('should emit error if options is undefined', function(){
      var x = new ChanArchiver();
      expect(x.toString()).to.equal('Error: ChanArchiver not properly configured. Missing options.url');
    });

  });

});