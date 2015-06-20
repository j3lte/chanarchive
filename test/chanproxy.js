var expect = require('chai').expect;

var ChanProxy = require('../lib/proxy/chanproxy');

describe('ChanProxy', function(){
  describe('create a proxy', function(){

    it('without parameters should return null', function(){
        var chanProxy = new ChanProxy();
        expect(chanProxy).to.equal.null;
    });

    it('should set the right parameters on 7chan', function(){
        var chanProxy = new ChanProxy('7chan');
        expect(chanProxy).to.not.equal.null;
        expect(chanProxy.app).to.not.be.undefined;
        expect(chanProxy.port).to.equal(8088);
        expect(chanProxy.server).to.be.undefined;
    });

    it('should set the right methods on 7chan', function(){
        var chanProxy = new ChanProxy('7chan');
        expect(chanProxy.start).to.be.a('function');
        expect(chanProxy.stop).to.be.a('function');
    });

  });

});