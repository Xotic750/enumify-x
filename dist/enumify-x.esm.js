function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }

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
var _ref = [],
    push = _ref.push,
    join = _ref.join,
    shift = _ref.shift;
var nativeFreeze = {}.constructor.freeze;
var hasFreeze = typeof nativeFreeze === 'function';
/**
 * The freeze() method freezes an object. A frozen object can no longer be changed; freezing an object prevents new properties
 * from being added to it, existing properties from being removed, prevents changing the enumerability, configurability,
 * or writability of existing properties, and prevents the values of existing properties from being changed. In addition,
 * freezing an object also prevents its prototype from being changed. Freeze() returns the same object that was passed in.
 *
 * @param {*} value - The object to freeze.
 * @returns {*} - The object that was passed to the function.
 */

var objectFreeze = function freeze(value) {
  return hasFreeze ? nativeFreeze(value) : value;
};
/** @type {Set<string>} */


var reserved = new SetConstructor(['forEach', 'name', 'toJSON', 'toString', 'value', 'valueOf']);
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
    var strName = isSymbol(name) === false && toStr(name);

    if (reserved.has(strName)) {
      throw new SyntaxError("Name is reserved: ".concat(strName));
    }

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
/**
 * Generate an iterator.
 *
 * @returns {Iterator} - An iterator.
 */

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
/**
 * Initialise a new enum.
 *
 * @param {Function} CstmCtr - The custom constructor.
 * @param {Array|Enum} properties - The properties.
 * @param {!object} opts - The options.
 * @returns {{names: Map<name,object>, keys: Set<string>, values: Map<name,*>}} - Initialised variables.
 */


var initialise = function initialise(CstmCtr, properties, opts) {
  var _this = this;

  /** @type {Set<string>} */
  var keys = new SetConstructor();
  /** @type {Map<name,object>} */

  var dNames = new MapConstructor();
  /** @type {Map<name,*>} */

  var dValues = new MapConstructor();
  var isClone;
  var items;

  if (isArrayLike(properties)) {
    items = properties;
  } else {
    // noinspection JSUnresolvedVariable
    var isEnum = typeof properties === 'function' && properties.prototype instanceof Enum;

    if (isEnum) {
      isClone = true; // noinspection JSUnresolvedFunction

      items = properties.toJSON();
    } else {
      throw new Error('bad args');
    }
  }

  var iter = typeof opts.auto === 'function' ? opts.auto() : generateNextValue();
  var next;
  arrayForEach(items, function (item) {
    _newArrowCheck(this, _this);

    var ident;

    if (isClone || isObjectLike(item)) {
      next = iter.next(item.name, item.value);
      ident = new CstmCtr(item.name, item.value);
    } else {
      next = iter.next(item);
      ident = new CstmCtr(item, next);
    }

    var _ident = ident,
        name = _ident.name;

    if (dNames.has(name)) {
      throw new TypeError("Attempted to reuse name: ".concat(name));
    }

    dNames.set(name, ident);
    var _ident2 = ident,
        value = _ident2.value;

    if (dValues.has(value)) {
      var oName = dValues.get(value);

      if (opts.unique) {
        var here = "".concat(name, " -> ").concat(oName);
        throw new TypeError("Duplicate value (".concat(value, ") found: ").concat(here));
      }

      ident = dNames.get(oName);
    } else {
      dValues.set(value, name);
      keys.add(name);
    }

    defineProperty(CstmCtr, name, {
      enumerable: true,
      value: ident
    });
  }.bind(this));
  return {
    keys: keys,
    names: dNames,
    values: dValues
  };
};
/**
 * Get a string representation of the enum.
 *
 * @param {string} ctrName - The constructor name.
 * @param {Map} names - The dnames map.
 * @returns {string} - The string representation.
 */


var calcString = function calcString(ctrName, names) {
  var _this2 = this;

  var strArr = [];
  names.forEach(function (enumMember) {
    _newArrowCheck(this, _this2);

    push.call(strArr, stringify(enumMember.name));
  }.bind(this));
  return "".concat(ctrName, " { ").concat(join.call(strArr, ', '), " }");
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
      var _this5 = this;

      var ctrName = isSymbol(typeName) === false && toStr(typeName);

      if (ctrName === 'undefined' || isVarName(ctrName) === false) {
        throw new Error("Invalid enum name: ".concat(ctrName));
      }

      var opts = isObjectLike(options) ? options : {};
      var CstmCtr;
      var data; // noinspection JSUnusedLocalSymbols

      var construct = function construct(context, args) {
        var argsArr = _toConsumableArray(args);

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


      CstmCtr = Function('construct', "return function ".concat(ctrName, "(value){return construct(this,arguments)}"))(construct);
      var asString;
      defineProperties(CstmCtr, {
        forEach: {
          value: function forEach(callback, thisArg) {
            var _this3 = this;

            data.keys.forEach(function (key) {
              _newArrowCheck(this, _this3);

              callback.call(thisArg, data.names.get(key));
            }.bind(this));
          }
        },
        toJSON: {
          value: function toJSON() {
            var _this4 = this;

            var value = [];
            data.names.forEach(function (enumMember) {
              _newArrowCheck(this, _this4);

              push.call(value, enumMember.toJSON());
            }.bind(this));
            return value;
          }
        },
        toString: {
          value: function toString() {
            if (typeof asString === 'undefined') {
              asString = calcString(ctrName, data.names);
            }

            return asString;
          }
        }
      });
      /* eslint-disable-next-line compat/compat */

      if (typeof Symbol === 'function' && isSymbol(Symbol(''))) {
        /* eslint-disable-next-line compat/compat */
        defineProperty(CstmCtr, Symbol.iterator, {
          value: function iterator() {
            /* eslint-disable-next-line compat/compat */
            var iter = data.keys[Symbol.iterator]();

            var $next = function next() {
              var nxt = iter.next();
              return nxt.done ? nxt : {
                done: false,
                value: data.names.get(nxt.value)
              };
            };

            return {
              next: $next
            };
          }
        });
      }

      CstmCtr.prototype = objectCreate(Enum.prototype);
      defineProperties(CstmCtr.prototype, {
        constructor: {
          value: CstmCtr
        },
        name: {
          value: ctrName
        }
      });

      if (isObjectLike(opts.classMethods)) {
        arrayForEach(objectKeys(opts.classMethods), function (key) {
          _newArrowCheck(this, _this5);

          if (reserved.has(key)) {
            throw new SyntaxError("Name is reserved: ".concat(key));
          }

          var method = opts.classMethods[key];

          if (typeof method === 'function') {
            defineProperty(CstmCtr, key, {
              value: method
            });
            reserved.add(key);
          }
        }.bind(this));
      }

      if (isObjectLike(opts.instanceMethods)) {
        arrayForEach(objectKeys(opts.instanceMethods), function (key) {
          _newArrowCheck(this, _this5);

          if (reserved.has(key)) {
            throw new SyntaxError("Name is reserved: ".concat(key));
          }

          var method = opts.instanceMethods[key];

          if (typeof method === 'function') {
            defineProperty(CstmCtr.prototype, key, {
              value: method
            });
            reserved.add(key);
          }
        }.bind(this));
      }

      data = initialise(CstmCtr, properties, opts);
      return objectFreeze(CstmCtr);
    }
  }
});

//# sourceMappingURL=enumify-x.esm.js.map