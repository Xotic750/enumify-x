import RAW from 'src/index';
import WEB from 'dist/enumify-x';
import MIN from 'dist/enumify-x.min';

const namePrefix = 'EnumifyX';
const methods = [
  {method: RAW, description: `${namePrefix} RAW`},
  {method: WEB, description: `${namePrefix} WEB`},
  {method: MIN, description: `${namePrefix} MIN`},
];

const t = function test1() {
  return undefined;
};

const hasFunctionNames = t.name === 'test1';
const itHasFunctionNames = hasFunctionNames ? it : xit;

/* eslint-disable-next-line compat/compat */
const hasSymbolSupport = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
const itHasSymbolSupport = hasSymbolSupport ? it : xit;

let hasIteratorSupport;

if (hasSymbolSupport) {
  try {
    /* eslint-disable-next-line no-restricted-syntax */
    for (const x of [true]) {
      hasIteratorSupport = x;
    }
  } catch (ignore) {
    hasIteratorSupport = false;
  }
}

const itHasSymbolIterator = hasIteratorSupport ? it : xit;

const testRO = Object.defineProperty({}, 'sentinel', {
  value: 1,
  writable: false,
});
let hasWorkingDP;
try {
  testRO.sentinel = 0;
} catch (ignore) {
  /* empty */
}

if (testRO.sentinel === 1) {
  hasWorkingDP = true;
}

const itHasWorkingDP = hasWorkingDP ? it : xit;

let hasWorkingFreeze;
const testFreeze = Object.freeze({});
try {
  testFreeze.sentinel = 0;
} catch (ignore) {
  /* empty */
}

if (testFreeze.sentinel !== 0) {
  hasWorkingFreeze = true;
}

const itHasWorkingFreeze = hasWorkingFreeze ? it : xit;

methods.forEach(({method, description}) => {
  const Enum = method;

  describe(`${description}`, () => {
    let namesWithoutAliases;
    let valuesWithoutAliases;
    let namesWithAliases;
    let valuesWithAliases;
    let subjectName;
    let subjectProps;

    beforeEach(() => {
      namesWithoutAliases = ['RED', 'YELLOW', 'BLUE', 'PINK', 'GREY'];
      valuesWithoutAliases = [0, 1, 10, 11, Object];
      namesWithAliases = ['RED', 'YELLOW', 'BLUE', 'PINK', 'BLACK', 'GREY'];
      valuesWithAliases = [0, 1, 10, 11, 1, Object];
      subjectName = 'subject';
      subjectProps = [
        'RED',
        'YELLOW',
        {name: 'BLUE', value: 10},
        'PINK',
        {name: 'BLACK', value: 1},
        {name: 'GREY', value: Object},
      ];
    });

    it('enum is a function', () => {
      expect.assertions(1);

      expect(typeof Enum).toStrictEqual('function');
    });

    it('subject is a function', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      expect(typeof subject).toStrictEqual('function');
    });

    it('no args should throw', () => {
      expect.assertions(1);

      expect(() => Enum.create()).toThrowErrorMatchingSnapshot();
    });

    it('bad properties arg', () => {
      expect.assertions(1);

      expect(() => Enum.create(subjectName, null)).toThrowErrorMatchingSnapshot();
    });

    it('subject can not be instantiated', () => {
      expect.assertions(1);

      const Subject = Enum.create(subjectName, subjectProps);
      expect(() => new Subject()).toThrowErrorMatchingSnapshot();
    });

    it('should throw if duplicate name used', () => {
      expect.assertions(1);

      subjectProps.push({name: 'RED', value: 1});
      expect(() => {
        Enum.create(subjectName, subjectProps);
      }).toThrowErrorMatchingSnapshot();
    });

    it('should use the supplied auto function', () => {
      expect.assertions(15);

      const opts = {
        auto() {
          return {
            next(name, value) {
              return [name, value];
            },
          };
        },
      };

      const subject = Enum.create(subjectName, subjectProps, opts);

      namesWithAliases.forEach((name, index) => {
        expect(subject[name].name).toStrictEqual(name);
        const {value} = subject[name];

        if (Array.isArray(value)) {
          expect(value[0]).toStrictEqual(name);
          expect(value[1]).toBeUndefined();
        } else {
          expect(value).toStrictEqual(valuesWithAliases[index]);
        }
      });
    });

    it('should not throw if name is not a string', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, [Object]);
      expect(typeof subject).toStrictEqual('function');
    });

    itHasSymbolSupport('should not throw if name is Symbol', () => {
      expect.assertions(1);

      /* eslint-disable-next-line compat/compat */
      const subject = Enum.create(subjectName, [Symbol('symbol')]);
      expect(typeof subject).toStrictEqual('function');
    });

    it('should not throw if name is not reserved', () => {
      expect.assertions(1);

      const props = ['call', 'hasOwnProperty', 'apply'];
      const subject = Enum.create(subjectName, props);

      expect(typeof subject).toStrictEqual('function');
    });

    it('should throw if name is reserved', () => {
      expect.assertions(4);

      const props = ['forEach', 'toJSON', 'toString', 'valueOf'];
      props.forEach((prop) => {
        expect(() => {
          Enum.create(subjectName, [prop]);
        }).toThrowErrorMatchingSnapshot();
      });
    });

    it('should throw if duplicate value used', () => {
      expect.assertions(3);

      const opts = {unique: true};
      const properties = [
        subjectProps,
        [{name: 'a', value: NaN}, {name: 'b', value: NaN}],
        [{name: 'a', value: 0}, {name: 'b', value: -0}],
      ];

      properties.forEach((props) => {
        expect(() => {
          Enum.create(subjectName, props, opts);
        }).toThrowErrorMatchingSnapshot();
      });
    });

    it('subject.prototype is an instance of Enum', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      expect(subject.prototype instanceof Enum).toStrictEqual(true);
    });

    it('should throw on invalid typeName', () => {
      expect.assertions(8);

      const badNames = ['', '123', {}, [], 'null', 'undefined', 'var', 'const'];
      badNames.forEach((name) => {
        expect(() => {
          Enum.create(name, subjectProps);
        }).toThrowErrorMatchingSnapshot();
      });
    });

    itHasSymbolSupport('should throw on invalid typeName of Symbol', () => {
      expect.assertions(1);

      expect(() => {
        /* eslint-disable-next-line compat/compat */
        Enum.create(Symbol(''), subjectProps);
      }).toThrowErrorMatchingSnapshot();
    });

    itHasFunctionNames('subject.name is as supplied', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      expect(subject.name).toStrictEqual(subjectName);
    });

    it('property should be an instance of Enum', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      expect(subject.RED instanceof Enum).toStrictEqual(true);
    });

    it('property should be an instance of subject', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      expect(subject.RED instanceof subject).toStrictEqual(true);
    });

    it('toString should give the correct value', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      expect(String(subject.RED)).toStrictEqual('subject.RED');
    });

    it('subject should have correct enumMembers with names', () => {
      expect.assertions(6);

      const subject = Enum.create(subjectName, subjectProps);
      namesWithoutAliases.forEach((name) => {
        expect(subject[name].name).toStrictEqual(name);
      });

      expect(subject.BLACK.name).toStrictEqual('YELLOW');
    });

    it('subject should have correct enumMembers with values', () => {
      expect.assertions(6);

      const subject = Enum.create(subjectName, subjectProps);
      namesWithAliases.forEach((name, index) => {
        expect(subject[name].value).toStrictEqual(valuesWithAliases[index]);
      });
    });

    it('subject should have working forEach', () => {
      expect.assertions(11);

      const subject = Enum.create(subjectName, subjectProps);
      let index = 0;
      subject.forEach((enumMember) => {
        expect(enumMember.name).toStrictEqual(namesWithoutAliases[index]);
        expect(enumMember.value).toStrictEqual(valuesWithoutAliases[index]);
        index += 1;
      });

      expect(subject.BLACK).toStrictEqual(subject.YELLOW);
    });

    it('subject should have working find for unique values', () => {
      expect.assertions(2);

      const subject = Enum.create(subjectName, subjectProps);
      const one = subject(0);
      expect(one instanceof Enum).toStrictEqual(true);
      expect(one instanceof subject).toStrictEqual(true);
    });

    it('subject should have working find for repeated values', () => {
      expect.assertions(2);

      const subject = Enum.create(subjectName, subjectProps);
      const one = subject(1);
      expect(one instanceof Enum).toStrictEqual(true);
      expect(one instanceof subject).toStrictEqual(true);
    });

    it('subject should have working find for non-existent values', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      const one = subject(20);
      expect(typeof one).toStrictEqual('undefined');
    });

    it('enumMember found should equal enumMember specified', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      const one = subject(10);
      expect(one).toStrictEqual(subject.BLUE);
    });

    it('subject should serialise as JSON', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      const values = [
        '{"name":"RED","value":0}',
        '{"name":"YELLOW","value":1}',
        '{"name":"BLUE","value":10}',
        '{"name":"PINK","value":11}',
        '{"name":"BLACK","value":1}',
        '{"name":"GREY"}',
      ].join(',');
      const expected = `[${values}]`;
      expect(JSON.stringify(subject)).toStrictEqual(expected);
    });

    it('subject should be cloneable and not be the same object', () => {
      expect.assertions(2);

      const subject = Enum.create(subjectName, subjectProps);
      const clone = Enum.create('clone', subject);
      expect(clone).not.toStrictEqual(subject);
      const values = [
        '{"name":"RED","value":0}',
        '{"name":"YELLOW","value":1}',
        '{"name":"BLUE","value":10}',
        '{"name":"PINK","value":11}',
        '{"name":"BLACK","value":1}',
        '{"name":"GREY"}',
      ].join(',');
      const expected = `[${values}]`;
      expect(JSON.stringify(clone)).toStrictEqual(expected);
    });

    it('actuals should not return actuals', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      expect(subject.YELLOW).toStrictEqual(subject.YELLOW);
    });

    it('aliases should return actuals', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      expect(subject.BLACK).toStrictEqual(subject.YELLOW);
    });

    it('subject toString should work', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      const expected = 'subject { "RED", "YELLOW", "BLUE", "PINK", "BLACK", "GREY" }';
      expect(String(subject)).toStrictEqual(expected);
    });

    it('enum can have class methods defined', () => {
      expect.assertions(1);

      const opts = {
        classMethods: {
          favourite() {
            return this.RED;
          },
        },
      };

      const subject = Enum.create(subjectName, subjectProps, opts);
      expect(subject.favourite()).toStrictEqual(subject.RED);
    });

    it('class method names get added to the reserved list', () => {
      expect.assertions(1);

      const opts = {
        classMethods: {
          favourite() {
            return this.RED;
          },
        },
      };

      expect(() => {
        Enum.create(subjectName, subjectProps, opts);
      }).toThrowErrorMatchingSnapshot();
    });

    it('enum can have instance methods defined', () => {
      expect.assertions(1);

      const opts = {
        instanceMethods: {
          description() {
            return `Description: ${this.toString()}`;
          },
        },
      };

      const subject = Enum.create(subjectName, subjectProps, opts);
      expect(subject.RED.description()).toStrictEqual('Description: subject.RED');
    });

    it('instance method names get added to the reserved list', () => {
      expect.assertions(1);

      const opts = {
        instanceMethods: {
          description() {
            return `Description: ${this.toString()}`;
          },
        },
      };

      expect(() => {
        Enum.create(subjectName, subjectProps, opts);
      }).toThrowErrorMatchingSnapshot();
    });

    itHasSymbolIterator('subject has Symbol.iterator', () => {
      expect.assertions(11);

      const subject = Enum.create(subjectName, subjectProps);
      let index = 0;

      const fn = function(enumMember) {
        expect(enumMember.name).toStrictEqual(namesWithoutAliases[index]);
        expect(enumMember.value).toStrictEqual(valuesWithoutAliases[index]);
        index += 1;
      };

      /* eslint-disable-next-line no-restricted-syntax */
      for (const enumMember of subject) {
        fn(enumMember);
      }

      expect(subject.BLACK).toStrictEqual(subject.YELLOW);
    });

    itHasWorkingDP('subject should not be writeable', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      try {
        subject.BLACK = null;
      } catch (ignore) {
        /* empty */
      }

      expect(subject.BLACK).toStrictEqual(subject.YELLOW);
    });

    itHasWorkingDP('subject.RED.name should not be writeable', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      try {
        subject.RED.name = null;
      } catch (ignore) {
        /* empty */
      }

      expect(subject.RED.name).toStrictEqual('RED');
    });

    itHasWorkingFreeze('subject should not be extendable', () => {
      expect.assertions(1);

      const subject = Enum.create(subjectName, subjectProps);
      try {
        subject.GREEN = 6;
      } catch (ignore) {
        /* empty */
      }

      expect(typeof subject.GREEN).toStrictEqual('undefined');
    });
  });
});
