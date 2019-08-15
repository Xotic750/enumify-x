function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

import arrayForEach from 'array-for-each-x';
import { MapConstructor, SetConstructor } from 'collections-x';
import isArrayLike from 'is-array-like-x';
import isObjectLike from 'is-object-like-x';
import isSafeInteger from 'is-safe-integer-x';
import isSymbol from 'is-symbol';
import isVarName from 'is-var-name';
import { stringify } from 'json3';
import objectCreate from 'object-create-x';
import defineProperties from 'object-define-properties-x';
import defineProperty from 'object-define-property-x';
import objectKeys from 'object-keys-x';
import toStr from 'to-string-x';
import objectFreeze from 'object-freeze-x';
var _ref = [],
    push = _ref.push,
    join = _ref.join,
    shift = _ref.shift;
/** @type {Set<string>} */

var reserved = new SetConstructor(['forEach', 'name', 'toJSON', 'toString', 'value', 'valueOf']);

var assertReserved = function assertReserved(strName) {
  if (reserved.has(strName)) {
    throw new SyntaxError("Name is reserved: ".concat(strName));
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
    var strName = assertReserved(isSymbol(name) === false && toStr(name));
    defineProperties(this, {
      name: {
        enumerable: true,
        value: strName
      },
      value: {
        enumerable: true,
        value: value
      }
    });
    objectFreeze(this);
  }
}
defineProperties(Enum.prototype, {
  toJSON: {
    value: function toJSON() {
      return {
        name: this.name,
        value: this.value
      };
    }
  },
  toString: {
    value: function toString() {
      return "".concat(this.constructor.name, ".").concat(this.name);
    }
  }
});

var generateNextValue = function generateNextValue() {
  var count = 0; // noinspection JSValidateTypes

  return {
    next: function next(name, value) {
      if (isSafeInteger(value)) {
        count = value;
      }

      var result = count;
      count += 1;
      return result;
    }
  };
};

var getItemsObject = function getItemsObject(isClone, properties) {
  if (isClone) {
    return properties.toJSON();
  }

  throw new Error('bad args');
};

var getItems = function getItems(properties) {
  if (isArrayLike(properties)) {
    return {
      isClone: false,
      items: properties
    };
  }

  var isClone = typeof properties === 'function' && properties.prototype instanceof Enum;
  return {
    isClone: isClone,
    items: getItemsObject(isClone, properties)
  };
};

var assertReuse = function assertReuse(results, name) {
  if (results.names.has(name)) {
    throw new TypeError("Attempted to reuse name: ".concat(name));
  }

  return results;
};

var getIdent = function getIdent(obj) {
  var results = obj.results,
      value = obj.value,
      name = obj.name,
      opts = obj.opts;
  var oName = results.values.get(value);

  if (opts.unique) {
    throw new TypeError("Duplicate value (".concat(value, ") found: ").concat(name, " -> ").concat(oName));
  }

  return results.names.get(oName);
};

var initResults = function initResults() {
  return {
    keys: new SetConstructor(),
    names: new MapConstructor(),
    values: new MapConstructor()
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


var initialise = function initialise(obj) {
  var CstmCtr = obj.CstmCtr,
      properties = obj.properties,
      opts = obj.opts;
  var results = initResults();

  var _getItems = getItems(properties),
      isClone = _getItems.isClone,
      items = _getItems.items;

  var iter = typeof opts.auto === 'function' ? opts.auto() : generateNextValue();
  var next;
  arrayForEach(items, function iteratee(item) {
    var ident;

    if (isClone || isObjectLike(item)) {
      next = iter.next(item.name, item.value);
      ident = new CstmCtr(item.name, item.value);
    } else {
      next = iter.next(item);
      ident = new CstmCtr(item, next);
    }

    var _ident = ident,
        name = _ident.name,
        value = _ident.value;
    assertReuse(results, name).names.set(name, ident);

    if (results.values.has(value)) {
      ident = getIdent({
        results: results,
        value: value,
        name: name,
        opts: opts
      });
    } else {
      results.values.set(value, name);
      results.keys.add(name);
    }

    defineProperty(CstmCtr, name, {
      enumerable: true,
      value: ident
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


var calcString = function calcString(ctrName, names) {
  var strArr = [];
  names.forEach(function iteratee(enumMember) {
    push.call(strArr, stringify(enumMember.name));
  });
  return "".concat(ctrName, " { ").concat(join.call(strArr, ', '), " }");
};

var definePrototype = function definePrototype(constructionProps) {
  constructionProps.CstmCtr.prototype = objectCreate(Enum.prototype);
  defineProperties(constructionProps.CstmCtr.prototype, {
    constructor: {
      value: constructionProps.CstmCtr
    },
    name: {
      value: constructionProps.ctrName
    }
  });
};

var getNext = function getNext(iter, constructionProps) {
  return function next() {
    var nxt = iter.next();
    return nxt.done ? nxt : {
      done: false,
      value: constructionProps.data.names.get(nxt.value)
    };
  };
};

var defineIterator = function defineIterator(constructionProps) {
  /* eslint-disable-next-line compat/compat */
  if (typeof Symbol === 'function' && isSymbol(Symbol(''))) {
    /* eslint-disable-next-line compat/compat */
    defineProperty(constructionProps.CstmCtr, Symbol.iterator, {
      value: function iterator() {
        /* eslint-disable-next-line compat/compat */
        var iter = constructionProps.data.keys[Symbol.iterator]();
        return {
          next: getNext(iter, constructionProps)
        };
      }
    });
  }
};

var defineClassMethods = function defineClassMethods(constructionProps, opts) {
  if (isObjectLike(opts.classMethods)) {
    arrayForEach(objectKeys(opts.classMethods), function iteratee(key) {
      if (reserved.has(key)) {
        throw new SyntaxError("Name is reserved: ".concat(key));
      }

      var method = opts.classMethods[key];

      if (typeof method === 'function') {
        defineProperty(constructionProps.CstmCtr, key, {
          value: method
        });
        reserved.add(key);
      }
    });
  }
};

var defineInstanceMethods = function defineInstanceMethods(constructionProps, opts) {
  if (isObjectLike(opts.instanceMethods)) {
    arrayForEach(objectKeys(opts.instanceMethods), function iteratee(key) {
      if (reserved.has(key)) {
        throw new SyntaxError("Name is reserved: ".concat(key));
      }

      var method = opts.instanceMethods[key];

      if (typeof method === 'function') {
        defineProperty(constructionProps.CstmCtr.prototype, key, {
          value: method
        });
        reserved.add(key);
      }
    });
  }
};

var defineCstmCtr = function defineCstmCtr(constructionProps) {
  var asString;
  defineProperties(constructionProps.CstmCtr, {
    forEach: {
      value: function forEach(callback, thisArg) {
        constructionProps.data.keys.forEach(function iteratee(key) {
          callback.call(thisArg, constructionProps.data.names.get(key));
        });
      }
    },
    toJSON: {
      value: function toJSON() {
        var value = [];
        constructionProps.data.names.forEach(function iteratee(enumMember) {
          push.call(value, enumMember.toJSON());
        });
        return value;
      }
    },
    toString: {
      value: function toString() {
        if (typeof asString === 'undefined') {
          asString = calcString(constructionProps.ctrName, constructionProps.data.names);
        }

        return asString;
      }
    }
  });
};

var getConstruct = function getConstruct(constructionProps) {
  return function construct(context, args) {
    var argsArr = _toConsumableArray(args);

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

var getConstructionProps = function getConstructionProps(typeName) {
  var props = {
    CstmCtr: null,
    ctrName: isSymbol(typeName) === false && toStr(typeName),
    data: null
  };

  if (props.ctrName === 'undefined' || isVarName(props.ctrName) === false) {
    throw new Error("Invalid enum name: ".concat(props.ctrName));
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
      var constructionProps = getConstructionProps(typeName);
      /* eslint-disable-next-line no-new-func */

      constructionProps.CstmCtr = Function('construct', "return function ".concat(constructionProps.ctrName, "(value){return construct(this,arguments)}"))(getConstruct(constructionProps));
      var opts = isObjectLike(options) ? options : {};
      defineCstmCtr(constructionProps);
      definePrototype(constructionProps);
      defineIterator(constructionProps);
      defineClassMethods(constructionProps, opts);
      defineInstanceMethods(constructionProps, opts);
      constructionProps.data = initialise({
        CstmCtr: constructionProps.CstmCtr,
        properties: properties,
        opts: opts
      });
      return objectFreeze(constructionProps.CstmCtr);
    }
  }
});

//# sourceMappingURL=enumify-x.esm.js.map