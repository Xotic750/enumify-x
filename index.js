/**
 * @file Enumerated type library.
 * @version 1.6.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module enumify-x
 */

'use strict';

var defineProperties = require('object-define-properties-x');
var defineProperty = require('object-define-property-x');
var $create = require('object-create-x');
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
var objKeys = require('object-keys-x');
var freeze = Object.freeze || function _freeze(object) {
  return assertIsObject(object);
};

var reserved = new collections.Set([
  'forEach',
  'name',
  'toJSON',
  'toString',
  'value',
  'valueOf'
]);

if (safeToString(symIt) === symIt) {
  reserved.add(symIt);
}

/**
 * Create an enum name/value.
 * @private
 * @param {string} name - The name of the enum.
 * @param {*} - value The value of the enum.
 * @returns {Object} The enum.
 */
var $Enum = function Enum(name, value) {
  if (arguments.length > 0) {
    var strName = safeToString(name);
    if (reserved.has(strName)) {
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
    value: function toJSON() {
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

var $generateNextValue = function generateNextValue() {
  var count = 0;
  var $next = function next(name, value) {
    if (isSafeInteger(value)) {
      count = value;
    }

    var result = count;
    count += 1;
    return result;
  };

  return {
    next: $next
  };
};

var $init = function init(CstmCtr, properties, opts) {
  var keys = new collections.Set();
  var dNames = new collections.Map();
  var dValues = new collections.Map();
  var isClone;
  var items;
  if (isArrayLike(properties)) {
    items = properties;
  } else if (isFunction(properties) && properties.prototype instanceof $Enum) {
    isClone = true;
    items = properties.toJSON();
  } else {
    throw new Error('bad args');
  }

  var iter = isFunction(opts.auto) ? opts.auto() : $generateNextValue();
  var next;
  // forEach
  some(items, function _define(item) {
    var ident;
    if (isClone || isObjectLike(item)) {
      next = iter.next(item.name, item.value);
      ident = new CstmCtr(item.name, item.value);
    } else {
      next = iter.next(item);
      ident = new CstmCtr(item, next);
    }

    var name = ident.name;
    if (dNames.has(name)) {
      throw new TypeError('Attempted to reuse name: ' + name);
    }

    dNames.set(name, ident);
    var value = ident.value;
    if (dValues.has(value)) {
      var oName = dValues.get(value);
      if (opts.unique) {
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
  });

  return {
    keys: keys,
    names: dNames,
    values: dValues
  };
};

var $calcString = function calcString(ctrName, names) {
  var strArr = [];
  names.forEach(function _reducer(enumMember) {
    strArr.push(quote(enumMember.name));
  });

  return ctrName + ' { ' + strArr.join(', ') + ' }';
};

defineProperties($Enum, {
/**
 * Creates an enumeration collection. Primary method.
 *
 * @param {string} typeName - The name of the enum collection.
 * @param {Array} properties - Initialiser array.
 * @param {Object} options - Options to determine behaviour.
 * @returns {Function} The enumeration collection.
 * @example
 * var Enum = require('enumify-x');
 *
 * // Creating an Enum
 * // Example allows duplicate values, known as aliases.
 * // Member values can be anything: number, string, etc.. If the exact value is
 * // unimportant you may use auto instances and an appropriate value will be
 * // chosen for you. Care must be taken if you mix auto with other values.
 * //
 * // The class Color is an enumeration (or enum)
 * // The attributes Color.RED, Color.GREEN, etc., are enumeration members
 * // (or enum members) and are functionally constants.
 * // The enum members have names and values (the name of Color.RED is RED,
 * // value of Color.BLUE is 10, etc.)
 * var Color = Enum.create('Color', [
 *   'RED', // auto assign value, starting 0
 *   'YELLOW', // auto assign value, will be 1
 *   { name: 'BLUE', value: 10 },
 *   'PINK', // auto assign value, will be 11
 *   { name: 'BLACK', value: 1 } // This is an alias for YELLOW
 * ]);
 *
 * Color.YELLOW; // { name: 'YELLOW', value: 1 }
 * Color.BLUE.name; // 'BLUE'
 * Color.BLUE.value; // 10
 * Color.BLACK === Color.YELLOW; // true
 * // Enumeration members have human readable string representations.
 * Color.PINK.toString(); // 'Color.PINK'
 * // Enums also have a human readable string representations.
 * Color.toString(); // 'Color { "RED", "YELLOW", "BLUE", "PINK", "BLACK" }'
 * // The type of an enumeration member is the enumeration it belongs to.
 * Color.PINK instanceof Color; // true
 * // You can access by value too.
 * Color(10); // Color.BLUE
 *
 * // Enumeration members are hashable, so they can be used as property names.
 * var apples = {};
 * apples[Color.RED] = 'Red Delicious';
 * apples[Color.YELLOW] = 'Golden Delicious'
 * apples; // {Color.RED: 'Red Delicious', Color.YELLOW: 'Golden Delicious'}
 *
 * // Having two enum members with the same name is invalid
 * var Fail = Enum.create('Fail', [
 *   'RED',
 *   'RED',
 * ], opts);
 *
 * // However, two enum members are allowed to have the same value. Given two
 * // members A and B with the same value (and A defined first), B is an alias
 * // to A. By-value lookup of the value of A and B will return A. By-name
 * // lookup of B will also return A. as seen in the definition of Color.
 *
 * // No aliases are allowed in this example.
 * var opts = {
 *   unique: true
 * };
 *
 * var Color1 = Enum.create('Color1', [
 *   'RED',
 *   'YELLOW',
 * ], opts);
 *
 * // Depending on the value types used, enumerations are serialisable.
 * JSON.stringify(Color1); // '[{"name":"RED","value":0},{"name":"YELLOW","value":1}]'
 *
 * // Enumerations support iteration, in definition order.
 * // The forEach() method executes a provided function once per each
 * // name/value pair in the Enum object, in insertion order.
 * // Iterating over the members of an enum does not provide the aliases.
 * Color1.forEach(function (enumMember) {
 *   console.log(enumMember.name, enumMember.value)
 * }, thisArg);
 *
 * // Where supported, for..of can be used.
 * // Iterating over the members of an enum does not provide the aliases.
 * for (const { name, value } of Color1) {
 *   console.log(name, value);
 * }
 *
 * // Otherwise, standard iterator pattern.
 * // Iterating over the members of an enum does not provide the aliases.
 * var iter = Color1[Enum.symIt]();
 * var next = iter.next();
 * while (next.done === false) {
 *   var enumMember = next.value;
 *   console.log(enumMember.name, enumMember.value)
 *   next = iter.next();
 * }
 *
 * // To iterate all items, including aliases.
 * var allenumMembers = Color1.toJSON();
 * allenumMembers.forEach(function(enumMember) {
 *    console.log(enumMember.name, enumMember.value);
 * });
 *
 * // Lookups can be perfomed on the value and not just the name.
 * Color1(0) === Color1.RED; // true
 * Color1(1) === Color1['YELLOW']; // true
 *
 * // Values can be anything, but names must be a string.
 * var anotherEnum = Enum.create('anotherEnum', [
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
 *
 * // Options
 * // unique: {boolean} - whether aliases are allowed.
 * // auto: {Function} - if you wish to define your own auto value allocation.
 * // classMethods: {Object<Function>} - to defined methods on the enum.
 * // instanceMethods: {Object<Function>} - to defined methods on the enum members.
 *
 * // ------------------------------------------------------
 *
 * var opts1 = {
 *   auto: function () {
 *     return {
 *       next: function (name, value) {
 *         return name;
 *       }
 *     };
 *   }
 * };
 *
 * var subject1 = Enum.create('subject1', ['RED'], opts1);
 * subject1.RED; // { name: 'RED', value: 'RED'}
 *
 * // ------------------------------------------------------
 *
 * var opts2 = {
 *   classMethods: {
 *     favourite: function () {
 *       return this.RED;
 *     }
 *   }
 * };
 *
 * var subject2 = Enum.create('subject2', ['RED'], opts2);
 * subject2.favourite() === subject2.RED; // true
 *
 * // ------------------------------------------------------
 *
 * var opts3 = {
 *   instanceMethods: {
 *     description: function () {
 *       return 'Description: ' + this.toString();
 *     }
 *   }
 * };
 *
 * var subject3 = Enum.create('subject3', ['RED'], opts3);
 * subject3.RED.description()) === 'Description: subject3.RED'; // true
 */
  create: {
    value: function create(typeName, properties, options) {
      var ctrName = safeToString(typeName);
      if (ctrName === 'undefined' || isValidVarName(ctrName) === false) {
        throw new Error('Invalid enum name: ' + ctrName);
      }

      var opts = isObjectLike(options) ? options : {};
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
          value: function forEach(callback, thisArg) {
            data.keys.forEach(function _iteratee(key) {
              callback.call(thisArg, data.names.get(key));
            });
          }
        },

        toJSON: {
          value: function toJSON() {
            var value = [];
            data.names.forEach(function _reducer(enumMember) {
              value.push(enumMember.toJSON());
            });

            return value;
          }
        },

        toString: {
          value: function _toString() {
            if (isUndefined(asString)) {
              asString = $calcString(ctrName, data.names);
            }

            return asString;
          }
        }
      });

      defineProperty(CstmCtr, symIt, {
        value: function iterator() {
          var iter = data.keys[symIt]();
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

      CstmCtr.prototype = $create($Enum.prototype);
      defineProperties(CstmCtr.prototype, {
        constructor: { value: CstmCtr },
        name: { value: ctrName }
      });

      if (isObjectLike(opts.classMethods)) {
        some(objKeys(opts.classMethods), function _some1(key) {
          if (reserved.has(key)) {
            throw new SyntaxError('Name is reserved: ' + key);
          }

          var method = opts.classMethods[key];
          if (isFunction(method)) {
            defineProperty(CstmCtr, key, { value: method });
            reserved.add(key);
          }
        });
      }

      if (isObjectLike(opts.instanceMethods)) {
        some(objKeys(opts.instanceMethods), function _some2(key) {
          if (reserved.has(key)) {
            throw new SyntaxError('Name is reserved: ' + key);
          }

          var method = opts.instanceMethods[key];
          if (isFunction(method)) {
            defineProperty(CstmCtr.prototype, key, { value: method });
            reserved.add(key);
          }
        });
      }

      data = $init(CstmCtr, properties, opts);
      return freeze(CstmCtr);
    }
  }
});

/**
 * An enumeration is a set of symbolic names (members) bound to unique, constant
 * values. Within an enumeration, the members can be compared by identity, and
 * the enumeration itself can be iterated over.
 * Influenced by Python's Enum implimentation.
 *
 * Create an enum name/value. Not usually called directly.
 *
 * @see {@link https://docs.python.org/3/library/enum.html}
 * @param {string} name - The name of the enum.
 * @param {*} - value The value of the enum.
 * @returns {Object} The enum.
 */
module.exports = $Enum;
