import arrayForEach from 'array-for-each-x';
import {MapConstructor, SetConstructor} from 'collections-x';
import isArrayLike from 'is-array-like-x';
import isObjectLike from 'is-object-like-x';
import isSafeInteger from 'is-safe-integer-x';
import isSymbol from 'is-symbol';
import isVarName from 'is-var-name';
import {stringify} from 'json3';
import objectCreate from 'object-create-x';
import defineProperties from 'object-define-properties-x';
import defineProperty from 'object-define-property-x';
import objectKeys from 'object-keys-x';
import toStr from 'to-string-x';

const {push, join, shift} = [];
const nativeFreeze = {}.constructor.freeze;
const hasFreeze = typeof nativeFreeze === 'function';

/**
 * The freeze() method freezes an object. A frozen object can no longer be changed; freezing an object prevents new properties
 * from being added to it, existing properties from being removed, prevents changing the enumerability, configurability,
 * or writability of existing properties, and prevents the values of existing properties from being changed. In addition,
 * freezing an object also prevents its prototype from being changed. Freeze() returns the same object that was passed in.
 *
 * @param {*} value - The object to freeze.
 * @returns {*} - The object that was passed to the function.
 */
const objectFreeze = function freeze(value) {
  return hasFreeze ? nativeFreeze(value) : value;
};

/** @type {Set<string>} */
const reserved = new SetConstructor(['forEach', 'name', 'toJSON', 'toString', 'value', 'valueOf']);

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
    const strName = isSymbol(name) === false && toStr(name);

    if (reserved.has(strName)) {
      throw new SyntaxError(`Name is reserved: ${strName}`);
    }

    defineProperties(this, {
      name: {
        enumerable: true,
        value: strName,
      },
      value: {
        enumerable: true,
        value,
      },
    });

    objectFreeze(this);
  }
}

defineProperties(Enum.prototype, {
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

/**
 * Generate an iterator.
 *
 * @returns {Iterator} - An iterator.
 */
const generateNextValue = function generateNextValue() {
  let count = 0;

  // noinspection JSValidateTypes
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

/**
 * Initialise a new enum.
 *
 * @param {Function} CstmCtr - The custom constructor.
 * @param {Array|Enum} properties - The properties.
 * @param {!object} opts - The options.
 * @returns {{names: Map<name,object>, keys: Set<string>, values: Map<name,*>}} - Initialised variables.
 */
const initialise = function initialise(CstmCtr, properties, opts) {
  /** @type {Set<string>} */
  const keys = new SetConstructor();
  /** @type {Map<name,object>} */
  const dNames = new MapConstructor();
  /** @type {Map<name,*>} */
  const dValues = new MapConstructor();
  let isClone;
  let items;

  if (isArrayLike(properties)) {
    items = properties;
  } else {
    // noinspection JSUnresolvedVariable
    const isEnum = typeof properties === 'function' && properties.prototype instanceof Enum;

    if (isEnum) {
      isClone = true;
      // noinspection JSUnresolvedFunction
      items = properties.toJSON();
    } else {
      throw new Error('bad args');
    }
  }

  const iter = typeof opts.auto === 'function' ? opts.auto() : generateNextValue();
  let next;

  arrayForEach(items, (item) => {
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

    defineProperty(CstmCtr, name, {
      enumerable: true,
      value: ident,
    });
  });

  return {
    keys,
    names: dNames,
    values: dValues,
  };
};

/**
 * Get a string representation of the enum.
 *
 * @param {string} ctrName - The constructor name.
 * @param {Map} names - The dnames map.
 * @returns {string} - The string representation.
 */
const calcString = function calcString(ctrName, names) {
  const strArr = [];
  names.forEach((enumMember) => {
    push.call(strArr, stringify(enumMember.name));
  });

  return `${ctrName} { ${join.call(strArr, ', ')} }`;
};

defineProperties(Enum, {
  /**
   * Creates an enumeration collection. Primary method.
   *
   * @param {string} typeName - The name of the enum collection.
   * @param {Array} properties - Initialiser array.
   * @param {object} options - Options to determine behaviour.
   * @returns {Function} The enumeration collection.
   */
  create: {
    value: function create(typeName, properties, options) {
      const ctrName = isSymbol(typeName) === false && toStr(typeName);

      if (ctrName === 'undefined' || isVarName(ctrName) === false) {
        throw new Error(`Invalid enum name: ${ctrName}`);
      }

      const opts = isObjectLike(options) ? options : {};
      let CstmCtr;
      let data;

      // noinspection JSUnusedLocalSymbols
      const construct = function construct(context, args) {
        const argsArr = [...args];

        if (data) {
          if (isObjectLike(context) && context instanceof CstmCtr) {
            throw new SyntaxError('Enum classes can’t be instantiated');
          }

          return data.names.get(data.values.get(shift.call(argsArr)));
        }

        Enum.apply(context, argsArr);

        return context;
      };

      /* eslint-disable-next-line no-new-func */
      CstmCtr = Function('construct', `return function ${ctrName}(value){return construct(this,arguments)}`)(construct);

      let asString;
      defineProperties(CstmCtr, {
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
              push.call(value, enumMember.toJSON());
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
      if (typeof Symbol === 'function' && isSymbol(Symbol(''))) {
        /* eslint-disable-next-line compat/compat */
        defineProperty(CstmCtr, Symbol.iterator, {
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

      CstmCtr.prototype = objectCreate(Enum.prototype);
      defineProperties(CstmCtr.prototype, {
        constructor: {value: CstmCtr},
        name: {value: ctrName},
      });

      if (isObjectLike(opts.classMethods)) {
        arrayForEach(objectKeys(opts.classMethods), (key) => {
          if (reserved.has(key)) {
            throw new SyntaxError(`Name is reserved: ${key}`);
          }

          const method = opts.classMethods[key];

          if (typeof method === 'function') {
            defineProperty(CstmCtr, key, {value: method});
            reserved.add(key);
          }
        });
      }

      if (isObjectLike(opts.instanceMethods)) {
        arrayForEach(objectKeys(opts.instanceMethods), (key) => {
          if (reserved.has(key)) {
            throw new SyntaxError(`Name is reserved: ${key}`);
          }

          const method = opts.instanceMethods[key];

          if (typeof method === 'function') {
            defineProperty(CstmCtr.prototype, key, {value: method});
            reserved.add(key);
          }
        });
      }

      data = initialise(CstmCtr, properties, opts);

      return objectFreeze(CstmCtr);
    },
  },
});
