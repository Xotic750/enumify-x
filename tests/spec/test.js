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
  var namesWithoutAliases;
  var valuesWithoutAliases;
  var namesWithAliases;
  var valuesWithAliases;
  var subject;
  var subjectName;
  var subjectProps;

  beforeEach(function () {
    namesWithoutAliases = [
      'RED',
      'YELLOW',
      'BLUE',
      'PINK',
      'GREY'
    ];
    valuesWithoutAliases = [
      0,
      1,
      10,
      11,
      Object
    ];
    namesWithAliases = [
      'RED',
      'YELLOW',
      'BLUE',
      'PINK',
      'BLACK',
      'GREY'
    ];
    valuesWithAliases = [
      0,
      1,
      10,
      11,
      1,
      Object
    ];
    subject = null;
    subjectName = 'subject';
    subjectProps = [
      'RED',
      'YELLOW',
      { name: 'BLUE', value: 10 },
      'PINK',
      { name: 'BLACK', value: 1 },
      { name: 'GREY', value: Object }
    ];
  });

  it('Enum is a function', function () {
    expect(typeof Enum).toBe('function');
  });

  it('Enum has symIt', function () {
    expect(typeof Enum.symIt).toBe(hasIteratorSupport ? 'symbol' : 'string');
  });

  it('Can create', function () {
    Enum.create(subjectName, subjectProps);
  });

  it('subject is a function', function () {
    subject = Enum.create(subjectName, subjectProps);
    expect(typeof subject).toBe('function');
  });

  it('subject can not be instantiated', function () {
    subject = Enum.create(subjectName, subjectProps);
    expect(function () {
      // eslint-disable-next-line no-new
      new subject(); // eslint-disable-line new-cap
    }).toThrow();
  });

  it('should throw if duplicate name used', function () {
    subjectProps.push({ name: 'RED', value: 1 });
    expect(function () {
      Enum.create(subjectName, subjectProps);
    }).toThrow();
  });

  it('should use the supplied auto function', function () {
    var opts = {
      auto: function () {
        return {
          next: function (name, value) {
            return [name, value];
          }
        };
      }
    };

    subject = Enum.create(subjectName, subjectProps, opts);

    namesWithAliases.forEach(function (name, index) {
      expect(subject[name].name).toBe(name);
      var value = subject[name].value;
      if (Array.isArray(value)) {
        expect(value[0]).toBe(name);
        expect(value[1]).toBe(undefined);
      } else {
        expect(value).toBe(valuesWithAliases[index]);
      }
    });
  });

  it('should not throw if name is not a string', function () {
    expect(function () {
      Enum.create(subjectName, [Object]);
    }).not.toThrow();
  });

  itHasSymbolSupport('should not throw if name is not a string', function () {
    expect(function () {
      Enum.create(subjectName, [Symbol('')]);
    }).not.toThrow();
  });

  it('should no throw if name is not reserved', function () {
    var props = [
      'call',
      'hasOwnProperty',
      'apply'
    ];
    Enum.create(subjectName, props);

  });

  it('should throw if name is reserved', function () {
    var props = [
      'forEach',
      'toJSON',
      'toString',
      'valueOf'
    ];
    props.forEach(function (prop) {
      expect(function () {
        Enum.create(subjectName, [prop]);
      }).toThrow();
    });
  });

  it('should throw if duplicate value used', function () {
    var opts = { unique: true };
    var properties = [
      subjectProps,
      [{ name: 'a', value: NaN }, { name: 'b', value: NaN }],
      [{ name: 'a', value: 0 }, { name: 'b', value: -0 }]
    ];

    properties.forEach(function (props) {
      expect(function () {
        Enum.create(subjectName, props, opts);
      }).toThrow();
    });
  });

  it('subject.prototype is an instance of Enum', function () {
    subject = Enum.create(subjectName, subjectProps);
    expect(subject.prototype instanceof Enum).toBe(true);
  });

  it('should throw on invalid typeName', function () {
    var badNames = [
      '',
      '123',
      {},
      [],
      'null',
      'undefined',
      'var',
      'const'
    ];
    badNames.forEach(function (name) {
      expect(function () {
        Enum.create(name, subjectProps);
      }).toThrow();
    });
  });

  itHasSymbolSupport('should throw on invalid typeName', function () {
    expect(function () {
      Enum.create(Symbol(''), subjectProps);
    }).toThrow();
  });

  itHasFunctionNames('subject.name is as supplied', function () {
    subject = Enum.create(subjectName, subjectProps);
    expect(subject.name).toBe(subjectName);
  });

  it('property should be an instance of Enum', function () {
    subject = Enum.create(subjectName, subjectProps);
    expect(subject.RED instanceof Enum).toBe(true);
  });

  it('property should be an instance of subject', function () {
    subject = Enum.create(subjectName, subjectProps);
    expect(subject.RED instanceof subject).toBe(true);
  });

  it('toString should give the correct value', function () {
    subject = Enum.create(subjectName, subjectProps);
    expect(String(subject.RED)).toBe('subject.RED');
  });

  it('subject should have correct enumMembers with names', function () {
    subject = Enum.create(subjectName, subjectProps);
    namesWithoutAliases.forEach(function (name) {
      expect(subject[name].name).toBe(name);
    });

    expect(subject.BLACK.name).toBe('YELLOW');
  });

  it('subject should have correct enumMembers with values', function () {
    subject = Enum.create(subjectName, subjectProps);
    namesWithAliases.forEach(function (name, index) {
      expect(subject[name].value).toBe(valuesWithAliases[index]);
    });
  });

  it('subject should have working forEach', function () {
    subject = Enum.create(subjectName, subjectProps);
    var index = 0;
    subject.forEach(function (enumMember) {
      expect(enumMember.name).toBe(namesWithoutAliases[index]);
      expect(enumMember.value).toBe(valuesWithoutAliases[index]);
      index += 1;
    });
  });

  it('subject should have working find for unique values', function () {
    subject = Enum.create(subjectName, subjectProps);
    var one = subject(0);
    expect(one instanceof Enum).toBe(true);
    expect(one instanceof subject).toBe(true);
  });

  it('subject should have working find for repeated values', function () {
    subject = Enum.create(subjectName, subjectProps);
    var one = subject(1);
    expect(one instanceof Enum).toBe(true);
    expect(one instanceof subject).toBe(true);
  });

  it('subject should have working find for non-existent values', function () {
    subject = Enum.create(subjectName, subjectProps);
    var one = subject(20);
    expect(typeof one).toBe('undefined');
  });

  it('enumMember found should equal enumMember specified', function () {
    subject = Enum.create(subjectName, subjectProps);
    var one = subject(10);
    expect(one).toBe(subject.BLUE);
  });

  it('subject should serialise as JSON', function () {
    subject = Enum.create(subjectName, subjectProps);
    var expected = '[{"name":"RED","value":0},{"name":"YELLOW","value":1},{"name":"BLUE","value":10},{"name":"PINK","value":11},{"name":"BLACK","value":1},{"name":"GREY"}]';
    expect(JSON.stringify(subject)).toBe(expected);
  });

  it('subject should be cloneable and not be the same object', function () {
    subject = Enum.create(subjectName, subjectProps);
    var clone = Enum.create('clone', subject);
    expect(clone).not.toBe(subject);
    var expected = '[{"name":"RED","value":0},{"name":"YELLOW","value":1},{"name":"BLUE","value":10},{"name":"PINK","value":11},{"name":"BLACK","value":1},{"name":"GREY"}]';
    expect(JSON.stringify(clone)).toBe(expected);
  });

  it('Actuals should not return actuals', function () {
    subject = Enum.create(subjectName, subjectProps);
    expect(subject.YELLOW).toBe(subject.YELLOW);
  });

  it('Aliases should return actuals', function () {
    subject = Enum.create(subjectName, subjectProps);
    expect(subject.BLACK).toBe(subject.YELLOW);
  });

  it('subject toString should work', function () {
    subject = Enum.create(subjectName, subjectProps);
    var expected = 'subject { "RED", "YELLOW", "BLUE", "PINK", "BLACK", "GREY" }';
    expect(String(subject)).toBe(expected);
  });

  it('Enum can have class methods defined', function () {
    var opts = {
      classMethods: {
        favourite: function () {
          return this.RED;
        }
      }
    };

    subject = Enum.create(subjectName, subjectProps, opts);
    expect(subject.favourite()).toBe(subject.RED);
  });

  it('Class method names get added to the reserved list', function () {
    var opts = {
      classMethods: {
        favourite: function () {
          return this.RED;
        }
      }
    };

    expect(function () {
      Enum.create(subjectName, subjectProps, opts);
    }).toThrow();
  });

  it('Enum can have instance methods defined', function () {
    var opts = {
      instanceMethods: {
        description: function () {
          return 'Description: ' + this.toString();
        }
      }
    };

    subject = Enum.create(subjectName, subjectProps, opts);
    expect(subject.RED.description()).toBe('Description: subject.RED');
  });

  it('Class method names get added to the reserved list', function () {
    var opts = {
      instanceMethods: {
        description: function () {
          return 'Description: ' + this.toString();
        }
      }
    };

    expect(function () {
      Enum.create(subjectName, subjectProps, opts);
    }).toThrow();
  });

  it('subject has symIt iterator', function () {
    subject = Enum.create(subjectName, subjectProps);
    var index = 0;
    var fn = function (enumMember) {
      expect(enumMember.name).toBe(namesWithoutAliases[index]);
      expect(enumMember.value).toBe(valuesWithoutAliases[index]);
      index += 1;
    };

    var iter = subject[Enum.symIt]();
    var next = iter.next();
    while (next.done === false) {
      fn(next.value);
      next = iter.next();
    }
  });

  itHasSymbolIterator('subject has Symbol.iterator', function () {
    subject = Enum.create(subjectName, subjectProps);
    var index = 0;
    // eslint-disable-next-line no-unused-vars
    var fn = function (enumMember) {
      expect(enumMember.name).toBe(namesWithoutAliases[index]);
      expect(enumMember.value).toBe(valuesWithoutAliases[index]);
      index += 1;
    };

    // eslint-disable-next-line no-eval
    eval('for (var enumMember of subject) { fn(enumMember); }');
  });

  itHasWorkingDP('subject should not be writeable', function () {
    subject = Enum.create(subjectName, subjectProps);
    try {
      subject.BLACK = null;
    } catch (ignore) {}

    expect(subject.BLACK).toBe(subject.YELLOW);
  });

  itHasWorkingDP('subject.RED.name should not be writeable', function () {
    subject = Enum.create(subjectName, subjectProps);
    try {
      subject.RED.name = null;
    } catch (ignore) {}

    expect(subject.RED.name).toBe('RED');
  });

  itHasWorkingFreeze('subject should not be extendable', function () {
    subject = Enum.create(subjectName, subjectProps);
    try {
      subject.GREEN = 6;
    } catch (ignore) {}

    expect(typeof subject.GREEN).toBe('undefined');
  });
});
