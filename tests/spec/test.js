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

var t = function test1() {};
var hasFunctionNames = t.name === 'test1';
var itHasFunctionNames = hasFunctionNames ? it : xit;

var hasSymbolSupport = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
var itHasSymbolSupport = hasSymbolSupport ? it : xit;

var hasIteratorSupport;
if (hasSymbolSupport) {
  try {
    // eslint-disable-next-line no-eval
    eval('for (var x of [true]) { hasIteratorSupport = x; }');
  } catch (ignore) {
    hasIteratorSupport = false;
  }
}

var itHasSymbolIterator = hasIteratorSupport ? it : xit;

var testRO = Object.defineProperty({}, 'sentinel', {
  value: 1,
  writeable: false
});
var hasWorkingDP;
try {
  testRO.sentinel = 0;
} catch (ignore) {}
if (testRO.sentinel === 1) {
  hasWorkingDP = true;
}
var itHasWorkingDP = hasWorkingDP ? it : xit;

var hasWorkingFreeze;
var testFreeze = Object.freeze({});
try {
  testFreeze.sentinel = 0;
} catch (ignore) {}
if (testFreeze.sentinel !== 0) {
  hasWorkingFreeze = true;
}
var itHasWorkingFreeze = hasWorkingFreeze ? it : xit;

describe('Enum', function () {
  var subject;

  beforeEach(function () {
    subject = Enum.create('subject', [
      'RED',
      'YELLOW',
      {
        name: 'BLUE',
        value: 10
      },
      'PINK',
      {
        name: 'BLACK',
        value: 1
      },
      {
        name: 'GREY',
        value: Object
      }
    ]);
  });

  it('subject is a function', function () {
    expect(typeof subject).toBe('function');
  });

  it('subject can not be instantiated', function () {
    expect(function () {
      // eslint-disable-next-line no-new
      new subject(); // eslint-disable-line new-cap
    }).toThrow();
  });

  it('should throw if duplicate name used', function () {
    expect(function () {
      Enum.create('names', [
        'RED',
        'YELLOW',
        {
          name: 'BLUE',
          value: 10
        },
        'PINK',
        {
          name: 'BLACK',
          value: 1
        },
        {
          name: 'RED',
          value: 1
        }
      ]);
    }).toThrow();
  });

  it('should not throw if name is not a string', function () {
    expect(function () {
      Enum.create('values', [Object]);
    }).not.toThrow();
  });

  itHasSymbolSupport('should not throw if name is not a string', function () {
    expect(function () {
      Enum.create('values', [Symbol('')]);
    }).not.toThrow();
  });

  it('should throw if name is reserved', function () {
    Enum.create('values', ['call']);
    Enum.create('values', ['hasOwnProperty']);
    Enum.create('values', ['apply']);

    expect(function () {
      Enum.create('values', ['iterate']);
    }).toThrow();

    expect(function () {
      Enum.create('values', ['toJSON']);
    }).toThrow();

    expect(function () {
      Enum.create('values', ['toString']);
    }).toThrow();

    expect(function () {
      Enum.create('values', ['valueOf']);
    }).not.toThrow();
  });

  it('should throw if duplicate value used', function () {
    expect(function () {
      Enum.create('values', subject, true);
    }).toThrow();

    expect(function () {
      Enum.create('values', [
        { name: 'a', value: NaN },
        { name: 'b', value: NaN }
      ], true);
    }).toThrow();

    expect(function () {
      Enum.create('values', [
        { name: 'a', value: 0 },
        { name: 'b', value: -0 }
      ], true);
    }).toThrow();
  });

  it('subject.prototype is an instance of Enum', function () {
    expect(subject.prototype instanceof Enum).toBe(true);
  });

  it('should throw on invalid typeName', function () {
    expect(function () {
      Enum.create('', subject);
    }).toThrow();

    expect(function () {
      Enum.create('123', subject);
    }).toThrow();

    expect(function () {
      Enum.create({}, subject);
    }).toThrow();

    expect(function () {
      Enum.create([], subject);
    }).toThrow();

    expect(function () {
      Enum.create('null', subject);
    }).toThrow();

    expect(function () {
      Enum.create('undefined', subject);
    }).toThrow();

    expect(function () {
      Enum.create('var', subject);
    }).toThrow();

    expect(function () {
      Enum.create('var', subject);
    }).toThrow();

    expect(function () {
      Enum.create('const', subject);
    }).toThrow();
  });

  itHasSymbolSupport('should throw on invalid typeName', function () {
    expect(function () {
      Enum.create(Symbol(''), subject);
    }).toThrow();
  });

  itHasFunctionNames('subject.name is as supplied', function () {
    expect(subject.name).toBe('subject');
  });

  it('property should be an instance of Enum', function () {
    expect(subject.RED instanceof Enum).toBe(true);
  });

  it('property should be an instance of subject', function () {
    expect(subject.RED instanceof subject).toBe(true);
  });

  it('toString should give the correct value', function () {
    expect(String(subject.RED)).toBe('subject.RED');
  });

  it('subject should have correct Constants with names', function () {
    expect(subject.RED.name).toBe('RED');
    expect(subject.YELLOW.name).toBe('YELLOW');
    expect(subject.BLUE.name).toBe('BLUE');
    expect(subject.PINK.name).toBe('PINK');
    expect(subject.BLACK.name).toBe('YELLOW');
    expect(subject.GREY.name).toBe('GREY');
  });

  it('subject should have correct Constants with values', function () {
    expect(subject.RED.value).toBe(0);
    expect(subject.YELLOW.value).toBe(1);
    expect(subject.BLUE.value).toBe(10);
    expect(subject.PINK.value).toBe(11);
    expect(subject.BLACK.value).toBe(1);
    expect(subject.GREY.value).toBe(Object);
  });

  it('subject should have working iterate', function () {
    var names = ['RED', 'YELLOW', 'BLUE', 'PINK', 'YELLOW', 'GREY'];
    var keys = ['RED', 'YELLOW', 'BLUE', 'PINK', 'BLACK', 'GREY'];
    var values = [0, 1, 10, 11, 1, Object];
    var index = 0;
    subject.iterate(function (Constant, key, obj) {
      expect(obj).toBe(subject);
      expect(Constant.name).toBe(names[index]);
      expect(key).toBe(keys[index]);
      expect(Constant.value).toBe(values[index]);
      index += 1;
    });
  });

  it('subject should have working find for unique values', function () {
    var one = subject(0);
    expect(one instanceof Enum).toBe(true);
    expect(one instanceof subject).toBe(true);
  });

  it('subject should have working find for repeated values', function () {
    var one = subject(1);
    expect(one instanceof Enum).toBe(true);
    expect(one instanceof subject).toBe(true);
  });

  it('subject should have working find for non-existent values', function () {
    var one = subject(20);
    expect(typeof one).toBe('undefined');
  });

  it('Constant found should equal Constant specified', function () {
    var one = subject(10);
    expect(one).toBe(subject.BLUE);
  });

  it('subject should serialise as JSON', function () {
    var expected = '{"RED":{"name":"RED","value":0},"YELLOW":{"name":"YELLOW","value":1},"BLUE":{"name":"BLUE","value":10},"PINK":{"name":"PINK","value":11},"BLACK":{"name":"YELLOW","value":1},"GREY":{"name":"GREY"}}';
    expect(JSON.stringify(subject)).toBe(expected);
  });

  it('subject should be cloneable and not be the same object', function () {
    var clone = Enum.create('clone', subject);
    expect(clone).not.toBe(subject);
    var expected = '{"RED":{"name":"RED","value":0},"YELLOW":{"name":"YELLOW","value":1},"BLUE":{"name":"BLUE","value":10},"PINK":{"name":"PINK","value":11},"BLACK":{"name":"YELLOW","value":1},"GREY":{"name":"GREY"}}';
    expect(JSON.stringify(clone)).toBe(expected);
  });

  it('Actuals should not return actuals', function () {
    expect(subject.YELLOW).toBe(subject.YELLOW);
  });

  it('Aliases should return actuals', function () {
    expect(subject.BLACK).toBe(subject.YELLOW);
  });

  it('subject toString should work', function () {
    expect(String(subject)).toBe('subject { "RED", "YELLOW", "BLUE", "PINK", "BLACK", "GREY" }');
  });

  itHasSymbolIterator('subject has Symbol.iterator', function () {
    var names = ['RED', 'YELLOW', 'BLUE', 'PINK', 'YELLOW', 'GREY'];
    var keys = ['RED', 'YELLOW', 'BLUE', 'PINK', 'BLACK', 'GREY'];
    var values = [0, 1, 10, 11, 1, Object];
    var index = 0;
    // eslint-disable-next-line no-unused-vars
    var fn = function (entry) {
      var key = entry[0];
      var Constant = entry[1];
      expect(Constant.name).toBe(names[index]);
      expect(key).toBe(keys[index]);
      expect(Constant.value).toBe(values[index]);
      index += 1;
    };

    // eslint-disable-next-line no-eval
    eval('for (var entry of subject) { fn(entry); }');
  });

  itHasWorkingDP('subject should not be writeable', function () {
    expect(function () {
      try {
        subject.BLACK = null;
      } catch (ignore) {}
    }).not.toThrow();

    expect(subject.BLACK).toBe(subject.YELLOW);
  });

  itHasWorkingDP('subject.RED.name should not be writeable', function () {
    expect(function () {
      try {
        subject.RED.name = null;
      } catch (ignore) {}
    }).not.toThrow();

    expect(subject.RED.name).toBe('RED');
  });

  itHasWorkingFreeze('subject should not be extendable', function () {
    expect(function () {
      try {
        subject.GREEN = 6;
      } catch (ignore) {}
    }).not.toThrow();

    expect(typeof subject.GREEN).toBe('undefined');
  });
});
