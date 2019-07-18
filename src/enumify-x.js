import isArrayLike from 'is-array-like-x';
import isObjectLike from 'is-object-like-x';
import isSafeInteger from 'is-safe-integer-x';
import isVarName from 'is-var-name';
import isSymbol from 'is-symbol';
import {SetConstructor, MapConstructor} from 'collections-x';

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
  const keys = new SetConstructor();
  const dNames = new MapConstructor();
  const dValues = new MapConstructor();
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
      if (typeof Symbol === 'function' && isSymbol(Symbol(''))) {
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
