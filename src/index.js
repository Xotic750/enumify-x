import isArrayLike from 'lodash/isArrayLike';
import isObjectLike from 'lodash/isObjectLike';
import isSafeInteger from 'lodash/isSafeInteger';
import isVarName from 'is-var-name';
import isSymbol from 'is-symbol';
import Set from 'core-js-pure/features/set';
import Map from 'core-js-pure/features/map';

const reserved = new Set(['forEach', 'name', 'toJSON', 'toString', 'value', 'valueOf']);

/**
 * An enumeration is a set of symbolic names (members) bound to unique, constant
 * values. Within an enumeration, the members can be compared by identity, and
 * the enumeration itself can be iterated over.
 * Influenced by Python's Enum implementation.
 *
 * Create an enum name/value. Not usually called directly.
 *
 * @see @link https://docs.python.org/3/library/enum.html
 * @param {string} name - The name of the enum.
 * @param {*} value - The value of the enum.
 * @returns {object} The enum.
 */
export default function Enum(name, value) {
  if (arguments.length > 0) {
    const strName = isSymbol(name) === false && String(name);

    if (reserved.has(strName)) {
      throw new SyntaxError(`Name is reserved: ${strName}`);
    }

    Object.defineProperties(this, {
      name: {
        enumerable: true,
        value: strName,
      },
      value: {
        enumerable: true,
        value,
      },
    });

    Object.freeze(this);
  }
}

Object.defineProperties(Enum.prototype, {
  toJSON: {
    value: function toJSON() {
      return {
        name: this.name,
        value: this.value,
      };
    },
  },
  toString: {
    value: function toString() {
      return `${this.constructor.name}.${this.name}`;
    },
  },
});

const generateNextValue = function _generateNextValue() {
  let count = 0;

  return {
    next(name, value) {
      if (isSafeInteger(value)) {
        count = value;
      }

      const result = count;

      count += 1;

      return result;
    },
  };
};

const initialise = function _initialise(CstmCtr, properties, opts) {
  const keys = new Set();
  const dNames = new Map();
  const dValues = new Map();
  let isClone;
  let items;

  if (isArrayLike(properties)) {
    items = properties;
  } else if (typeof properties === 'function' && properties.prototype instanceof Enum) {
    isClone = true;
    items = properties.toJSON();
  } else {
    throw new Error('bad args');
  }

  const iter = typeof opts.auto === 'function' ? opts.auto() : generateNextValue();
  let next;

  const itemsIteratee = function _itemsIteratee(item) {
    let ident;

    if (isClone || isObjectLike(item)) {
      next = iter.next(item.name, item.value);
      ident = new CstmCtr(item.name, item.value);
    } else {
      next = iter.next(item);
      ident = new CstmCtr(item, next);
    }

    const {name} = ident;

    if (dNames.has(name)) {
      throw new TypeError(`Attempted to reuse name: ${name}`);
    }

    dNames.set(name, ident);
    const {value} = ident;

    if (dValues.has(value)) {
      const oName = dValues.get(value);

      if (opts.unique) {
        const here = `${name} -> ${oName}`;

        throw new TypeError(`Duplicate value (${value}) found: ${here}`);
      }

      ident = dNames.get(oName);
    } else {
      dValues.set(value, name);
      keys.add(name);
    }

    Object.defineProperty(CstmCtr, name, {
      enumerable: true,
      value: ident,
    });
  };

  items.forEach(itemsIteratee);

  return {
    keys,
    names: dNames,
    values: dValues,
  };
};

const calcString = function _calcString(ctrName, names) {
  const strArr = [];
  names.forEach((enumMember) => {
    strArr.push(JSON.stringify(enumMember.name));
  });

  return `${ctrName} { ${strArr.join(', ')} }`;
};

Object.defineProperties(Enum, {
  /**
   * Creates an enumeration collection. Primary method.
   *
   * @param {string} typeName - The name of the enum collection.
   * @param {Array} properties - Initialiser array.
   * @param {object} options - Options to determine behaviour.
   * @returns {Function} The enumeration collection.
   * @example
   * import Enum from 'enumify-x';
   *
   * // Creating an Enum
   * // Example allows duplicate values, known as aliases.
   * // Member values can be anything: number, string, etc.. If the exact value is
   * // unimportant you may use auto instances and an appropriate value will be
   * // chosen for you. Care must be taken if you mix auto with other values.
   * //
   * // The class color is an enumeration (or enum)
   * // The attributes color.RED, color.GREEN, etc., are enumeration members
   * // (or enum members) and are functionally constants.
   * // The enum members have names and values (the name of color.RED is RED,
   * // value of color.BLUE is 10, etc.)
   * const color = Enum.create('color', [
   *   'RED', // auto assign value, starting 0
   *   'YELLOW', // auto assign value, will be 1
   *   {name: 'BLUE', value: 10},
   *   'PINK', // auto assign value, will be 11
   *   {name: 'BLACK', value: 1}, // This is an alias for YELLOW
   * ]);
   *
   * console.log(color.YELLOW); // { name: 'YELLOW', value: 1 }
   * console.log(color.BLUE.name); // 'BLUE'
   * console.log(color.BLUE.value); // 10
   * console.log(color.BLACK === color.YELLOW); // true
   * // Enumeration members have human readable string representations.
   * color.PINK.toString(); // 'color.PINK'
   * // Enums also have a human readable string representations.
   * color.toString(); // 'color { "RED", "YELLOW", "BLUE", "PINK", "BLACK" }'
   * // The type of an enumeration member is the enumeration it belongs to.
   * console.log(color.PINK instanceof color); // true
   * // You can access by value too.
   * console.log(color(10)); // color.BLUE
   *
   * // Enumeration members are hashable, so they can be used as property names.
   * const apples = {};
   * apples[color.RED] = 'Red Delicious';
   * apples[color.YELLOW] = 'Golden Delicious';
   * console.log(apples); // {color.RED: 'Red Delicious', color.YELLOW: 'Golden Delicious'}
   *
   * // No aliases are allowed in this example.
   * const opts = {
   *   unique: true,
   * };
   *
   * // Having two enum members with the same name is invalid
   * Enum.create('fail', ['RED', 'RED'], opts);
   *
   * // However, two enum members are allowed to have the same value. Given two
   * // members A and B with the same value (and A defined first), B is an alias
   * // to A. By-value lookup of the value of A and B will return A. By-name
   * // lookup of B will also return A. as seen in the definition of color.
   *
   * const color1 = Enum.create('color1', ['RED', 'YELLOW'], opts);
   *
   * // Depending on the value types used, enumerations are serialisable.
   * JSON.stringify(color1); // '[{"name":"RED","value":0},{"name":"YELLOW","value":1}]'
   *
   * // Enumerations support iteration, in definition order.
   * // The forEach() method executes a provided function once per each
   * // name/value pair in the Enum object, in insertion order.
   * // Iterating over the members of an enum does not provide the aliases.
   * color1.forEach((enumMember) => {
   *   console.log(enumMember.name, enumMember.value);
   * });
   *
   * // Where supported, for..of can be used.
   * // Iterating over the members of an enum does not provide the aliases.
   * for (const {name, value} of color1) {
   *   console.log(name, value);
   * }
   *
   * // Otherwise, standard iterator pattern.
   * // Iterating over the members of an enum does not provide the aliases.
   * const iter = color1[Symbol.iterator]();
   * let next = iter.next();
   * while (next.done === false) {
   *   const enumMember = next.value;
   *   console.log(enumMember.name, enumMember.value);
   *   next = iter.next();
   * }
   *
   * // To iterate all items, including aliases.
   * const allenumMembers = color1.toJSON();
   * allenumMembers.forEach((enumMember) => {
   *   console.log(enumMember.name, enumMember.value);
   * });
   *
   * // Lookups can be performed on the value and not just the name.
   * console.log(color1(0) === color1.RED); // true
   * console.log(color1(1) === color1.YELLOW); // true
   *
   * // Values can be anything, but names must be a string.
   * const anotherEnum = Enum.create('anotherEnum', [
   *   {name: 'OBJECT', value: {}},
   *   {name: 'ARRAY', value: []},
   *   {
   *     name: 'FUNCTION',
   *     value() {
   *       return undefined;
   *     },
   *   },
   * ]);
   *
   * // Enums can be cloned
   * const cloneEnum = Enum.create('cloneEnum', anotherEnum);
   * console.log(cloneEnum === anotherEnum); // false
   * console.log(cloneEnum.OBJECT === anotherEnum.OBJECT); // false
   * console.log(cloneEnum.OBJECT.name === anotherEnum.OBJECT.name); // true
   * console.log(cloneEnum.OBJECT.value === anotherEnum.OBJECT.value); // true
   *
   * // Options
   * // unique: {boolean} - whether aliases are allowed.
   * // auto: {Function} - if you wish to define your own auto value allocation.
   * // classMethods: {Object<Function>} - to defined methods on the enum.
   * // instanceMethods: {Object<Function>} - to defined methods on the enum members.
   *
   * // ------------------------------------------------------
   *
   * const opts1 = {
   *   auto() {
   *     return {
   *       next(name, value) {
   *         return name;
   *       },
   *     };
   *   },
   * };
   *
   * const subject1 = Enum.create('subject1', ['RED'], opts1);
   * console.log(subject1.RED); // { name: 'RED', value: 'RED'}
   *
   * // ------------------------------------------------------
   *
   * const opts2 = {
   *   classMethods: {
   *     favourite() {
   *       return this.RED;
   *     },
   *   },
   * };
   *
   * const subject2 = Enum.create('subject2', ['RED'], opts2);
   * console.log(subject2.favourite() === subject2.RED); // true
   *
   * // ------------------------------------------------------
   *
   * const opts3 = {
   *   instanceMethods: {
   *     description() {
   *       return `Description: ${this.toString()}`;
   *     },
   *   },
   * };
   *
   * const subject3 = Enum.create('subject3', ['RED'], opts3);
   * console.log(subject3.RED.description() === 'Description: subject3.RED'); // true
   */
  create: {
    value: function create(typeName, properties, options) {
      const ctrName = isSymbol(typeName) === false && String(typeName);

      if (ctrName === 'undefined' || isVarName(ctrName) === false) {
        throw new Error(`Invalid enum name: ${ctrName}`);
      }

      const opts = isObjectLike(options) ? options : {};
      let CstmCtr;
      let data;

      // noinspection JSUnusedLocalSymbols
      const construct /* eslint-disable-line no-unused-vars */ = function _construct(context, args) {
        const argsArr = [...args];

        if (data) {
          if (isObjectLike(context) && context instanceof CstmCtr) {
            throw new SyntaxError('Enum classes can’t be instantiated');
          }

          return data.names.get(data.values.get(argsArr.shift()));
        }

        Enum.apply(context, argsArr);

        return context;
      };

      /* eslint-disable-next-line no-eval */
      CstmCtr = eval(`(0,function ${ctrName}(value){return construct(this,arguments)})`);

      let asString;
      Object.defineProperties(CstmCtr, {
        forEach: {
          value: function forEach(callback, thisArg) {
            data.keys.forEach((key) => {
              callback.call(thisArg, data.names.get(key));
            });
          },
        },

        toJSON: {
          value: function toJSON() {
            const value = [];
            data.names.forEach((enumMember) => {
              value.push(enumMember.toJSON());
            });

            return value;
          },
        },

        toString: {
          value: function toString() {
            if (typeof asString === 'undefined') {
              asString = calcString(ctrName, data.names);
            }

            return asString;
          },
        },
      });

      /* eslint-disable-next-line compat/compat */
      if (typeof Symbol === 'function' && typeof Symbol('') === 'symbol') {
        /* eslint-disable-next-line compat/compat */
        Object.defineProperty(CstmCtr, Symbol.iterator, {
          value: function iterator() {
            /* eslint-disable-next-line compat/compat */
            const iter = data.keys[Symbol.iterator]();
            const $next = function next() {
              const nxt = iter.next();

              return nxt.done
                ? nxt
                : {
                    done: false,
                    value: data.names.get(nxt.value),
                  };
            };

            return {
              next: $next,
            };
          },
        });
      }

      CstmCtr.prototype = Object.create(Enum.prototype);
      Object.defineProperties(CstmCtr.prototype, {
        constructor: {value: CstmCtr},
        name: {value: ctrName},
      });

      if (isObjectLike(opts.classMethods)) {
        Object.keys(opts.classMethods).forEach((key) => {
          if (reserved.has(key)) {
            throw new SyntaxError(`Name is reserved: ${key}`);
          }

          const method = opts.classMethods[key];

          if (typeof method === 'function') {
            Object.defineProperty(CstmCtr, key, {value: method});
            reserved.add(key);
          }
        });
      }

      if (isObjectLike(opts.instanceMethods)) {
        Object.keys(opts.instanceMethods).forEach((key) => {
          if (reserved.has(key)) {
            throw new SyntaxError(`Name is reserved: ${key}`);
          }

          const method = opts.instanceMethods[key];

          if (typeof method === 'function') {
            Object.defineProperty(CstmCtr.prototype, key, {value: method});
            reserved.add(key);
          }
        });
      }

      data = initialise(CstmCtr, properties, opts);

      return Object.freeze(CstmCtr);
    },
  },
});
