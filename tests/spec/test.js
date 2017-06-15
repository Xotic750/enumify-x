'use strict';

var Enum;
if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');
  if (typeof JSON === 'undefined') {
    JSON = {};
  }
  require('json3').runInContext(null, JSON);
  require('es6-shim');
  var es7 = require('es7-shim');
  Object.keys(es7).forEach(function (key) {
    var obj = es7[key];
    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  Enum = require('../../index.js');
} else {
  Enum = returnExports;
}

describe('Enum', function () {
  var subject;

  beforeEach(function () {
    subject = Enum.create('subject', [
      'RED',
      'YELLOW',
      {
        name: 'BLUE',
        ordinal: 10
      },
      'PINK',
      {
        name: 'BLACK',
        ordinal: 1
      }
    ]);
  });

  /*
  it('subject is an instance of Enum', function () {
    expect(subject instanceof Enum).toBe(true);
  });
  */

  it('property should be an instance of Enum', function () {
    expect(subject.RED instanceof Enum).toBe(true);
  });

  it('property should be an instance of subject', function () {
    expect(subject.RED instanceof subject).toBe(true);
  });

  it('subject should have correct Contants with names', function () {
    expect(subject.RED.name).toBe('RED');
    expect(subject.YELLOW.name).toBe('YELLOW');
    expect(subject.BLUE.name).toBe('BLUE');
    expect(subject.PINK.name).toBe('PINK');
    expect(subject.BLACK.name).toBe('BLACK');
  });

  it('subject should have correct Contants with ordinals', function () {
    expect(subject.RED.ordinal).toBe(0);
    expect(subject.YELLOW.ordinal).toBe(1);
    expect(subject.BLUE.ordinal).toBe(10);
    expect(subject.PINK.ordinal).toBe(11);
    expect(subject.BLACK.ordinal).toBe(1);
  });

  it('subject should have working enumerate', function () {
    var names = ['RED', 'YELLOW', 'BLUE', 'PINK', 'BLACK'];
    var ordinals = [0, 1, 10, 11, 1];
    var index = 0;
    subject.enumerate(function (Constant, key, obj) {
      expect(obj).toBe(subject);
      expect(Constant.name).toBe(names[index]);
      expect(Constant.ordinal).toBe(ordinals[index]);
      index += 1;
    });
  });

  it('subject should have working find for unique ordinals', function () {
    var one = subject(0);
    expect(one instanceof Enum).toBe(true);
    expect(one instanceof subject).toBe(true);
    expect(typeof subject(20)).toBe('undefined');
  });

  it('subject should have working find for repeated ordinals', function () {
    var found = subject(1);
    expect(Array.isArray(found)).toBe(true);
    expect(found.length).toBe(2);
    expect(found[0].ordinal).toBe(1);
    expect(found[1].ordinal).toBe(1);
  });

  it('Constant found should equal Constant specified', function () {
    expect(subject(10)).toBe(subject.BLUE);
  });

  it('subject should serialise as JSON', function () {
    var expected = '{"RED":{"name":"RED","ordinal":0},"YELLOW":{"name":"YELLOW","ordinal":1},"BLUE":{"name":"BLUE","ordinal":10},"PINK":{"name":"PINK","ordinal":11},"BLACK":{"name":"BLACK","ordinal":1}}';
    expect(JSON.stringify(subject)).toBe(expected);
  });

  it('subject should be cloneable and not be the same object', function () {
    var clone = Enum.create('clone', subject);
    expect(clone).not.toBe(subject);
    var expected = '{"RED":{"name":"RED","ordinal":0},"YELLOW":{"name":"YELLOW","ordinal":1},"BLUE":{"name":"BLUE","ordinal":10},"PINK":{"name":"PINK","ordinal":11},"BLACK":{"name":"BLACK","ordinal":1}}';
    expect(JSON.stringify(clone)).toBe(expected);
  });

});
