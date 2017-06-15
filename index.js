/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/enumify-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/enumify-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/enumify-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/enumify-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/enumify-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/enumify-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/enumify-x" title="npm version">
 * <img src="https://badge.fury.io/js/enumify-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Enum module.
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module enumify-x
 */

'use strict';

var defineProperties = require('object-define-properties-x');
var defineProperty = require('object-define-property-x');
var hasOwn = require('has-own-property-x');
var hasSymbolSupport = require('has-symbol-support-x');
var create = require('object-create-x');
var assertIsObject = require('assert-is-object-x');
var isObjectLike = require('is-object-like-x');
var isFunction = require('is-function-x');
var isString = require('is-string');
var isArray = require('is-array');
var isSafeInteger = require('is-safe-integer');
var some = require('array.prototype.some');
// eslint-disable-next-line no-unused-vars
var slice = require('array-slice-x');
var collections = require('collections-x');
var freeze = Object.freeze || function _freeze(object) {
  return assertIsObject(object);
};
var $Enum;

$Enum = function Enum(name, value) {
  if (arguments.length > 0) {
    if (isString(name) === false) {
      throw new TypeError('name is not a string: ' + name);
    }

    defineProperties(this, {
      name: {
        enumerable: true,
        value: name.toString()
      },
      value: {
        enumerable: true,
        value: value
      }
    });

    freeze(this);
  }
};

defineProperties($Enum.prototype, {
  toJSON: {
    value: function _toJSON() {
      var obj = create(null);
      obj.name = this.name;
      obj.value = this.value;
      return obj;
    }
  },
  toString: {
    value: function _toString() {
      return this.constructor.name + '.' + this.name;
    }
  }
});

var isReservedName = create(null);
isReservedName.iterate = true;
isReservedName.toJSON = true;

var init = function _init(CstmCtr, names, unique) {
  var dKeys = [];
  var dNames = create(null);
  var dValues = new collections.Map();
  var isClone;
  var items;
  if (isArray(names)) {
    items = names;
  } else if (isFunction(names) && names.prototype instanceof $Enum) {
    isClone = true;
    items = [];
    names.iterate(function _mapper(Constant, key) {
      items.push({
        name: key,
        value: Constant.value
      });
    });
  } else {
    throw new Error('bad args');
  }

  var count = 0;
  // forEach
  some(items, function _define(item) {
    var ident;
    if (isClone || isObjectLike(item)) {
      ident = new CstmCtr(item.name, item.value);
    } else {
      ident = new CstmCtr(item, count);
    }

    var name = ident.name;
    if (isReservedName[name]) {
      throw new SyntaxError('name is reserved: ' + name);
    }

    if (hasOwn(dNames, name)) {
      throw new TypeError('Attempted to reuse name: ' + name);
    }

    dKeys.push(name);
    var value = ident.value;
    dNames[name] = value;
    if (dValues.has(value)) {
      var oName = dValues.get(value);
      if (unique) {
        var here = name + ' -> ' + oName;
        throw new TypeError('Duplicate value (' + value + ') found: ' + here);
      }

      ident = CstmCtr[oName];
    } else {
      dValues.set(value, name);
    }

    defineProperty(CstmCtr, name, {
      enumerable: true,
      value: ident
    });

    if (isSafeInteger(value)) {
      count = value + 1;
    }
  });

  return {
    keys: dKeys,
    names: dNames,
    values: dValues
  };
};

defineProperties($Enum, {
  create: {
    value: function _create(ctrName, names, unique) {
      var CstmCtr;
      var data;
      var keys;
      var values;
      var initiated = false;
      // eslint-disable-next-line no-unused-vars
      var eFn = function _eFn(context, args) {
        if (initiated) {
          if (context instanceof CstmCtr) {
            throw new SyntaxError('Enum classes can’t be instantiated');
          }

          return CstmCtr[values.get(args.shift())];
        }

        $Enum.apply(context, args);
        return context;
      };

      var body = ' (value){return eFn(this,slice(arguments))})';
      // eslint-disable-next-line no-eval
      CstmCtr = eval('(0,function ' + ctrName + body);

      defineProperties(CstmCtr, {
        iterate: {
          value: function _iterate(callback, thisArg) {
            return some(keys, function _iteratee(key) {
              return Boolean(callback.call(thisArg, CstmCtr[key], key, CstmCtr));
            });
          }
        },

        toJSON: {
          value: function _toJSON() {
            var value = create(null);
            // forEach
            some(keys, function _reducer(key) {
              value[key] = CstmCtr[key].toJSON();
            });

            return value;
          }
        }
      });

      if (hasSymbolSupport) {
        defineProperty(CstmCtr, Symbol.iterator, {
          value: function _iterator() {
            var index = 0;
            return {
              next: function _next() {
                if (index < keys.length) {
                  var key = keys[index];
                  index += 1;
                  return { done: false, value: [key, CstmCtr[key]] };
                }

                return { done: true };
              }
            };
          }
        });
      }

      CstmCtr.prototype = create($Enum.prototype);
      defineProperties(CstmCtr.prototype, {
        constructor: { value: CstmCtr },
        name: { value: ctrName }
      });

      data = init(CstmCtr, names, unique);
      keys = data.keys;
      values = data.values;
      initiated = true;
      return freeze(CstmCtr);
    }
  }
});

/**
 * An enumeration is a set of symbolic names (members) bound to unique, constant
 * values. Within an enumeration, the members can be compared by identity, and
 * the enumeration itself can be iterated over.
 *
 * @param {string} ctrName The name of the enum collection.
 * @param {Array.<string|Object>} names An array of valid initiators.
 * @param {Boolean} [unique] Ensure unique enumeration values.
 * @return {Function} The enum collection.
 * @example
 * var Enum = require('enumify-x');
 *
 * // example allows duplicate values, known as aliases.
 * var myEnum = Enum.create('myEnum', [
 *   'RED', // auto assign value, starting 0
 *   'YELLOW', // auto assign value, will be 1
 *   { name: 'BLUE', value: 10 },
 *   'PINK', // auto assign value, will be 11
 *   { name: 'BLACK', value: 1 } // This is an alias for YELLOW
 * ]);
 *
 * myEnum.YELLOW; // { name: 'YELLOW', value: 1 }
 * myEnum.BLUE.name; // 'BLUE'
 * myEnum.BLUE.value; // 10
 * myEnum.BLACK === myEnum.YELLOW; // true
 *
 * // No aliases are allowed in this example.
 * var unique = true;
 * var anEnum = Enum.create('myEnum', [
 *   'RED',
 *   'YELLOW',
 * ], unique);
 *
 * JSON.stringify(anEnum); // '{"RED":{"name":"RED","value":0},"YELLOW":{"name":"YELLOW","value":1}}'
 *
 * // Enum#iterate works like Array#some in that the iteration will stop if
 * // a truthy value is returned by the iteratee function.
 * anEnum.iterate(function (Constant, key, obj) {}, thisArg);
 *
 * // Values can be anything, but names must be a string.
 * var myEnum = Enum.create('myEnum', [
 *   { name: 'OBJECT', value: {} },
 *   { name: 'ARRAY', value: [] },
 *   { name: 'FUNCTION', value: function () {} }
 * ]);
 */
module.exports = $Enum;
