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
 * @version 1.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module enumify-x
 */

'use strict';

var defineProperties = require('object-define-properties-x');
var defineProperty = require('object-define-property-x');
var create = require('object-create-x');
var assertIsObject = require('assert-is-object-x');
var quote = require('string-quote-x');
var isObjectLike = require('is-object-like-x');
var isFunction = require('is-function-x');
var isArrayLike = require('is-array-like-x');
var isSafeInteger = require('is-safe-integer');
var isValidVarName = require('is-var-name');
var isUndefined = require('validate.io-undefined');
var getFunctionName = require('get-function-name-x');
var safeToString = require('safe-to-string-x');
var some = require('array.prototype.some');
var slice = require('array-slice-x');
var collections = require('collections-x');
var symIt = collections.symIt;
var freeze = Object.freeze || function _freeze(object) {
  return assertIsObject(object);
};

var reserved = new collections.Set([
  'forEach',
  'toJSON',
  'toString',
  'valueOf'
]);

if (safeToString(symIt) === symIt) {
  reserved.add(symIt);
}

var $Enum = function Enum(name, value) {
  if (arguments.length > 0) {
    var strName = safeToString(name);
    if (reserved.has(reserved)) {
      throw new SyntaxError('Name is reserved: ' + strName);
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

    freeze(this);
  }
};

defineProperty($Enum, 'symIt', { value: symIt });

defineProperties($Enum.prototype, {
  toJSON: {
    value: function _toJSON() {
      return {
        name: this.name,
        value: this.value
      };
    }
  },
  toString: {
    value: function _toString() {
      return getFunctionName(this.constructor) + '.' + this.name;
    }
  }
});

var init = function _init(CstmCtr, names, unique) {
  var keys = new collections.Set();
  var dNames = new collections.Map();
  var dValues = new collections.Map();
  var isClone;
  var items;
  if (isArrayLike(names)) {
    items = names;
  } else if (isFunction(names) && names.prototype instanceof $Enum) {
    isClone = true;
    items = names.toJSON();
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
    if (dNames.has(name)) {
      throw new TypeError('Attempted to reuse name: ' + name);
    }

    dNames.set(name, ident);
    var value = ident.value;
    if (dValues.has(value)) {
      var oName = dValues.get(value);
      if (unique) {
        var here = name + ' -> ' + oName;
        throw new TypeError('Duplicate value (' + value + ') found: ' + here);
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

    if (isSafeInteger(value)) {
      count = value + 1;
    }
  });

  return {
    keys: keys,
    names: dNames,
    values: dValues
  };
};

var calcString = function _calcString(ctrName, names) {
  var strArr = [];
  names.forEach(function _reducer(Constant) {
    strArr.push(quote(Constant.name));
  });

  return ctrName + ' { ' + strArr.join(', ') + ' }';
};

defineProperties($Enum, {
  create: {
    value: function _create(typeName, properties, unique) {
      var ctrName = safeToString(typeName);
      if (ctrName === 'undefined' || isValidVarName(ctrName) === false) {
        throw new Error('Invalid enum name: ' + ctrName);
      }

      var CstmCtr;
      var data;
      // eslint-disable-next-line no-unused-vars
      var f = function _f(context, args) {
        var argsArr = slice(args);
        if (data) {
          if (isObjectLike(context) && context instanceof CstmCtr) {
            throw new SyntaxError('Enum classes can’t be instantiated');
          }

          return data.names.get(data.values.get(argsArr.shift()));
        }

        $Enum.apply(context, argsArr);
        return context;
      };

      // eslint-disable-next-line no-eval
      CstmCtr = eval('(0,function ' + ctrName + '(value){return f(this,arguments)})');

      var asString;
      defineProperties(CstmCtr, {
        forEach: {
          value: function _forEach(callback, thisArg) {
            data.keys.forEach(function _iteratee(key) {
              callback.call(thisArg, data.names.get(key));
            });
          }
        },

        toJSON: {
          value: function _toJSON() {
            var value = [];
            data.names.forEach(function _reducer(Constant) {
              value.push(Constant.toJSON());
            });

            return value;
          }
        },

        toString: {
          value: function _toString() {
            if (isUndefined(asString)) {
              asString = calcString(ctrName, data.names);
            }

            return asString;
          }
        }
      });

      defineProperty(CstmCtr, symIt, {
        value: function _iterator() {
          var iter = data.keys[symIt]();
          return {
            next: function _next() {
              var next = iter.next();
              return next.done ? next : {
                done: false,
                value: data.names.get(next.value)
              };
            }
          };
        }
      });

      CstmCtr.prototype = create($Enum.prototype);
      defineProperties(CstmCtr.prototype, {
        constructor: { value: CstmCtr },
        name: { value: ctrName }
      });

      data = init(CstmCtr, properties, unique);
      return freeze(CstmCtr);
    }
  }
});

/**
 * An enumeration is a set of symbolic names (members) bound to unique, constant
 * values. Within an enumeration, the members can be compared by identity, and
 * the enumeration itself can be iterated over.
 * Influenced by Python's Enum implimentation.
 * @see {@link https://docs.python.org/3/library/enum.html}
 *
 * @param {string} typeName The name of the enum collection.
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
 * myEnum.PINK.toString(); // 'myEnum.PINK'
 * myEnum.toString(); // 'myEnum { "RED", "YELLOW", "BLUE", "PINK", "BLACK" }'
 * myEnum.PINK instanceof myEnum; // true
 *
 * // No aliases are allowed in this example.
 * var unique = true;
 * var anEnum = Enum.create('myEnum', [
 *   'RED',
 *   'YELLOW',
 * ], unique);
 *
 * JSON.stringify(anEnum); // '[{"name":"RED","value":0},{"name":"YELLOW","value":1}]'
 *
 * // The forEach() method executes a provided function once per each
 * // name/value pair in the Enum object, in insertion order.
 * // Iterating over the members of an enum does not provide the aliases.
 * anEnum.forEach(function (Constant) {}, thisArg);
 *
 * // Where supported, for..of can be used.
 * // Iterating over the members of an enum does not provide the aliases.
 * for (const { name, value } of anEnum) {
 *   console.log(name, value);
 * }
 *
 * // Otherwise, standard iterator pattern.
 * // Iterating over the members of an enum does not provide the aliases.
 * var iter = anEnum[Enum.symIt]();
 * var next = iter.next();
 * while (next.done === false) {
 *   var Constant = next.value;
 *   console.log(Constant.name, Constant.value)
 *   next = iter.next();
 * }
 *
 * // To iterate all items, including aliases.
 * var allConstants = anEnum.toJSON();
 * allConstants.forEach(function(Constant) {
 *    console.log(Constant.name, Constant.value);
 * });
 *
 * // Lookups can be perfomed on the value and not just the name.
 * anEnum(0) === anEnum.RED; // true
 * anEnum(1) === anEnum['YELLOW']; // true
 *
 * // Values can be anything, but names must be a string.
 * var anotherEnum = Enum.create('myEnum', [
 *   { name: 'OBJECT', value: {} },
 *   { name: 'ARRAY', value: [] },
 *   { name: 'FUNCTION', value: function () {} }
 * ]);
 *
 * // Enums can be cloned
 * var cloneEnum = Enum.create('cloneEnum', anotherEnum);
 * cloneEnum === anotherEnum; // false
 * cloneEnum.OBJECT === anotherEnum.OBJECT; // false
 * cloneEnum.OBJECT.name === anotherEnum.OBJECT.name; // true
 * cloneEnum.OBJECT.value === anotherEnum.OBJECT.value; // true
 */
module.exports = $Enum;
