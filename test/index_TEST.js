'use strict';

var expect = require('chai').expect;

describe('dalek-reporter-junit', function() {

  it('should be ok', function(){
    var jUnitReporter = require('../index')({
      events: {emit: function () {}, on: function () {}, off: function () {}},
      config: {get: function () {}}
    });
    expect(jUnitReporter).to.be.ok;
  });

});
