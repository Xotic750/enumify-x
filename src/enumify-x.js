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

const assertReserved = function assertReserved(strName) {
  if (reserved.has(strName)) {
    throw new SyntaxError(`Name is reserved: ${strName}`);
  }

  return strName;
};

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
    const strName = assertReserved(isSymbol(name) === false && toStr(name));

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

const getItemsObject = function getItemsObject(isClone, properties) {
  if (isClone) {
    return properties.toJSON();
  }

  throw new Error('bad args');
};

const getItems = function getItems(properties) {
  if (isArrayLike(properties)) {
    return {
      isClone: false,
      items: properties,
    };
  }

  const isClone = typeof properties === 'function' && properties.prototype instanceof Enum;

  return {
    isClone,
    items: getItemsObject(isClone, properties),
  };
};

const assertReuse = function assertReuse(results, name) {
  if (results.names.has(name)) {
    throw new TypeError(`Attempted to reuse name: ${name}`);
  }

  return results;
};

const getIdent = function getIdent(obj) {
  const {results, value, name, opts} = obj;
  const oName = results.values.get(value);

  if (opts.unique) {
    throw new TypeError(`Duplicate value (${value}) found: ${name} -> ${oName}`);
  }

  return results.names.get(oName);
};

const initResults = function initResults() {
  return {
    keys: new SetConstructor(),
    names: new MapConstructor(),
    values: new MapConstructor(),
  };
};

/**
 * Initialise a new enum.
 *
 * @param {object} obj - Parameter for initialisation.
 * @property {Function} obj.CstmCtr - The custom constructor.
 * @property {Array|Enum} obj.properties - The properties.
 * @property {!object} obj.opts - The options.
 * @returns {{names: Map<name,object>, keys: Set<string>, values: Map<name,*>}} - Initialised variables.
 */
const initialise = function initialise(obj) {
  const {CstmCtr, properties, opts} = obj;
  const results = initResults();

  const {isClone, items} = getItems(properties);
  const iter = typeof opts.auto === 'function' ? opts.auto() : generateNextValue();
  let next;

  arrayForEach(items, function iteratee(item) {
    let ident;

    if (isClone || isObjectLike(item)) {
      next = iter.next(item.name, item.value);
      ident = new CstmCtr(item.name, item.value);
    } else {
      next = iter.next(item);
      ident = new CstmCtr(item, next);
    }

    const {name, value} = ident;
    assertReuse(results, name).names.set(name, ident);

    if (results.values.has(value)) {
      ident = getIdent({results, value, name, opts});
    } else {
      results.values.set(value, name);
      results.keys.add(name);
    }

    defineProperty(CstmCtr, name, {
      enumerable: true,
      value: ident,
    });
  });

  return results;
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
  names.forEach(function iteratee(enumMember) {
    push.call(strArr, stringify(enumMember.name));
  });

  return `${ctrName} { ${join.call(strArr, ', ')} }`;
};

const definePrototype = function definePrototype(constructionProps) {
  constructionProps.CstmCtr.prototype = objectCreate(Enum.prototype);
  defineProperties(constructionProps.CstmCtr.prototype, {
    constructor: {value: constructionProps.CstmCtr},
    name: {value: constructionProps.ctrName},
  });
};

const getNext = function getNext(iter, constructionProps) {
  return function next() {
    const nxt = iter.next();

    return nxt.done
      ? nxt
      : {
          done: false,
          value: constructionProps.data.names.get(nxt.value),
        };
  };
};

const defineIterator = function defineIterator(constructionProps) {
  /* eslint-disable-next-line compat/compat */
  if (typeof Symbol === 'function' && isSymbol(Symbol(''))) {
    /* eslint-disable-next-line compat/compat */
    defineProperty(constructionProps.CstmCtr, Symbol.iterator, {
      value: function iterator() {
        /* eslint-disable-next-line compat/compat */
        const iter = constructionProps.data.keys[Symbol.iterator]();

        return {
          next: getNext(iter, constructionProps),
        };
      },
    });
  }
};

const defineClassMethods = function defineClassMethods(constructionProps, opts) {
  if (isObjectLike(opts.classMethods)) {
    arrayForEach(objectKeys(opts.classMethods), function iteratee(key) {
      if (reserved.has(key)) {
        throw new SyntaxError(`Name is reserved: ${key}`);
      }

      const method = opts.classMethods[key];

      if (typeof method === 'function') {
        defineProperty(constructionProps.CstmCtr, key, {value: method});
        reserved.add(key);
      }
    });
  }
};

const defineInstanceMethods = function defineInstanceMethods(constructionProps, opts) {
  if (isObjectLike(opts.instanceMethods)) {
    arrayForEach(objectKeys(opts.instanceMethods), function iteratee(key) {
      if (reserved.has(key)) {
        throw new SyntaxError(`Name is reserved: ${key}`);
      }

      const method = opts.instanceMethods[key];

      if (typeof method === 'function') {
        defineProperty(constructionProps.CstmCtr.prototype, key, {value: method});
        reserved.add(key);
      }
    });
  }
};

const defineCstmCtr = function defineCstmCtr(constructionProps) {
  let asString;
  defineProperties(constructionProps.CstmCtr, {
    forEach: {
      value: function forEach(callback, thisArg) {
        constructionProps.data.keys.forEach(function iteratee(key) {
          callback.call(thisArg, constructionProps.data.names.get(key));
        });
      },
    },

    toJSON: {
      value: function toJSON() {
        const value = [];
        constructionProps.data.names.forEach(function iteratee(enumMember) {
          push.call(value, enumMember.toJSON());
        });

        return value;
      },
    },

    toString: {
      value: function toString() {
        if (typeof asString === 'undefined') {
          asString = calcString(constructionProps.ctrName, constructionProps.data.names);
        }

        return asString;
      },
    },
  });
};

const getConstruct = function getConstruct(constructionProps) {
  return function construct(context, args) {
    const argsArr = [...args];

    if (constructionProps.data) {
      if (isObjectLike(context) && context instanceof constructionProps.CstmCtr) {
        throw new SyntaxError('Enum classes can’t be instantiated');
      }

      return constructionProps.data.names.get(constructionProps.data.values.get(shift.call(argsArr)));
    }

    Enum.apply(context, argsArr);

    return context;
  };
};

const getConstructionProps = function getConstructionProps(typeName) {
  const props = {
    CstmCtr: null,
    ctrName: isSymbol(typeName) === false && toStr(typeName),
    data: null,
  };

  if (props.ctrName === 'undefined' || isVarName(props.ctrName) === false) {
    throw new Error(`Invalid enum name: ${props.ctrName}`);
  }

  return props;
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
      const constructionProps = getConstructionProps(typeName);

      /* eslint-disable-next-line no-new-func */
      constructionProps.CstmCtr = Function(
        'construct',
        `return function ${constructionProps.ctrName}(value){return construct(this,arguments)}`,
      )(getConstruct(constructionProps));

      const opts = isObjectLike(options) ? options : {};
      defineCstmCtr(constructionProps);
      definePrototype(constructionProps);
      defineIterator(constructionProps);
      defineClassMethods(constructionProps, opts);
      defineInstanceMethods(constructionProps, opts);
      constructionProps.data = initialise({CstmCtr: constructionProps.CstmCtr, properties, opts});

      return objectFreeze(constructionProps.CstmCtr);
    },
  },
});
