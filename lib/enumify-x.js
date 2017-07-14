(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.returnExports = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * @file Enumerated type library.
 * @version 1.7.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module enumify-x
 */

'use strict';

var defineProperties = _dereq_('object-define-properties-x');
var defineProperty = _dereq_('object-define-property-x');
var $create = _dereq_('object-create-x');
var assertIsObject = _dereq_('assert-is-object-x');
var quote = _dereq_('string-quote-x');
var isObjectLike = _dereq_('is-object-like-x');
var isFunction = _dereq_('is-function-x');
var isArrayLike = _dereq_('is-array-like-x');
var isSafeInteger = _dereq_('is-safe-integer');
var isValidVarName = _dereq_('is-var-name');
var isUndefined = _dereq_('validate.io-undefined');
var getFunctionName = _dereq_('get-function-name-x');
var safeToString = _dereq_('safe-to-string-x');
var some = _dereq_('array.prototype.some');
var slice = _dereq_('array-slice-x');
var collections = _dereq_('collections-x');
var symIt = collections.symIt;
var objKeys = _dereq_('object-keys-x');
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

},{"array-slice-x":2,"array.prototype.some":4,"assert-is-object-x":8,"collections-x":10,"get-function-name-x":28,"is-array-like-x":35,"is-function-x":39,"is-object-like-x":46,"is-safe-integer":49,"is-var-name":53,"object-create-x":59,"object-define-properties-x":60,"object-define-property-x":61,"object-keys-x":63,"safe-to-string-x":67,"string-quote-x":69,"validate.io-undefined":74}],2:[function(_dereq_,module,exports){
/**
 * @file Cross-browser array slicer.
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module array-slice-x
 */

'use strict';

var toObject = _dereq_('to-object-x');
var toInteger = _dereq_('to-integer-x');
var toLength = _dereq_('to-length-x');
var isUndefined = _dereq_('validate.io-undefined');

var setRelative = function _seedRelative(value, length) {
  return value < 0 ? Math.max(length + value, 0) : Math.min(value, length);
};

var slice = function _slice(array, start, end) {
  var object = toObject(array);
  var length = toLength(object.length);
  var k = setRelative(toInteger(start), length);
  var relativeEnd = isUndefined(end) ? length : toInteger(end);
  var finalEnd = setRelative(relativeEnd, length);
  var val = [];
  val.length = Math.max(finalEnd - k, 0);
  var next = 0;
  while (k < finalEnd) {
    if (k in object) {
      val[next] = object[k];
    }

    next += 1;
    k += 1;
  }

  return val;
};

/**
 * The slice() method returns a shallow copy of a portion of an array into a new
 * array object selected from begin to end (end not included). The original
 * array will not be modified.
 *
 * @param {Array|Object} array - The array to slice.
 * @param {number} [start] - Zero-based index at which to begin extraction.
 *  A negative index can be used, indicating an offset from the end of the
 *  sequence. slice(-2) extracts the last two elements in the sequence.
 *  If begin is undefined, slice begins from index 0.
 * @param {number} [end] - Zero-based index before which to end extraction.
 *  Slice extracts up to but not including end. For example, slice(1,4)
 *  extracts the second element through the fourth element (elements indexed
 *  1, 2, and 3).
 *  A negative index can be used, indicating an offset from the end of the
 *  sequence. slice(2,-1) extracts the third element through the second-to-last
 *  element in the sequence.
 *  If end is omitted, slice extracts through the end of the
 *  sequence (arr.length).
 *  If end is greater than the length of the sequence, slice extracts through
 *  the end of the sequence (arr.length).
 * @returns {Array} A new array containing the extracted elements.
 * @example
 * var slice = require('array-slice-x');
 * var fruits = ['Banana', 'Orange', 'Lemon', 'Apple', 'Mango'];
 * var citrus = slice(fruits, 1, 3);
 *
 * // fruits contains ['Banana', 'Orange', 'Lemon', 'Apple', 'Mango']
 * // citrus contains ['Orange','Lemon']
 */
module.exports = slice;

},{"to-integer-x":70,"to-length-x":71,"to-object-x":72,"validate.io-undefined":74}],3:[function(_dereq_,module,exports){
'use strict';

var ES = _dereq_('es-abstract/es5');
var bind = _dereq_('function-bind');
var isString = _dereq_('is-string');

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = Object('a');
var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

var strSplit = bind.call(Function.call, String.prototype.split);

module.exports = function some(callbackfn) {
	var O = ES.ToObject(this);
	var self = splitString && isString(O) ? strSplit(O, '') : O;
	var len = ES.ToUint32(self.length);
	var T;
	if (arguments.length > 1) {
		T = arguments[1];
	}

	// If no callback function or if callback is not a callable function
	if (!ES.IsCallable(callbackfn)) {
		throw new TypeError('Array.prototype.some callback must be a function');
	}

	for (var i = 0; i < len; i++) {
		if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, O) : callbackfn.call(T, self[i], i, O))) {
			return true;
		}
	}
	return false;
};

},{"es-abstract/es5":12,"function-bind":27,"is-string":50}],4:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');
var ES = _dereq_('es-abstract/es6');

var implementation = _dereq_('./implementation');
var getPolyfill = _dereq_('./polyfill');
var polyfill = getPolyfill();
var shim = _dereq_('./shim');

var slice = Array.prototype.slice;

// eslint-disable-next-line no-unused-vars
var boundEveryShim = function some(array, callbackfn) {
	ES.RequireObjectCoercible(array);
	return polyfill.apply(array, slice.call(arguments, 1));
};
define(boundEveryShim, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = boundEveryShim;

},{"./implementation":3,"./polyfill":5,"./shim":6,"define-properties":11,"es-abstract/es6":13}],5:[function(_dereq_,module,exports){
var implementation = _dereq_('./implementation');

module.exports = function getPolyfill() {
	if (typeof Array.prototype.some === 'function') {
		var hasPrimitiveContextInStrict = [1].some(function () {
			'use strict';
			return typeof this === 'string' && this === 'x';
		}, 'x');
		if (hasPrimitiveContextInStrict) {
			return Array.prototype.some;
		}
	}
	return implementation;
};

},{"./implementation":3}],6:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');
var getPolyfill = _dereq_('./polyfill');

module.exports = function shimArrayPrototypeSome() {
	var polyfill = getPolyfill();
	define(
		Array.prototype,
		{ some: polyfill },
		{ some: function () { return Array.prototype.some !== polyfill; } }
	);
	return polyfill;
};

},{"./polyfill":5,"define-properties":11}],7:[function(_dereq_,module,exports){
/**
 * @file If isFunction(callbackfn) is false, throw a TypeError exception.
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module assert-is-function-x
 */

'use strict';

var isFunction = _dereq_('is-function-x');
var safeToString = _dereq_('safe-to-string-x');
var isPrimitive = _dereq_('is-primitive');

/**
 * Tests `callback` to see if it is a function, throws a `TypeError` if it is
 * not. Otherwise returns the `callback`.
 *
 * @param {*} callback - The argument to be tested.
 * @throws {TypeError} Throws if `callback` is not a function.
 * @returns {*} Returns `callback` if it is function.
 * @example
 * var assertIsFunction = require('assert-is-function-x');
 * var primitive = true;
 * var mySymbol = Symbol('mySymbol');
 * var symObj = Object(mySymbol);
 * var object = {};
 * function fn () {}
 *
 * assertIsFunction(primitive);
 *    // TypeError 'true is not a function'.
 * assertIsFunction(object);
 *    // TypeError '#<Object> is not a function'.
 * assertIsFunction(mySymbol);
 *    // TypeError 'Symbol(mySymbol) is not a function'.
 * assertIsFunction(symObj);
 *    // TypeError '#<Object> is not a function'.
 * assertIsFunction(fn);
 *    // Returns fn.
 */
module.exports = function assertIsFunction(callback) {
  if (!isFunction(callback)) {
    var msg = isPrimitive(callback) ? safeToString(callback) : '#<Object>';
    throw new TypeError(msg + ' is not a function');
  }
  return callback;
};

},{"is-function-x":39,"is-primitive":47,"safe-to-string-x":67}],8:[function(_dereq_,module,exports){
/**
 * @file If IsObject(value) is false, throw a TypeError exception.
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module assert-is-object-x
 */

'use strict';

var safeToString = _dereq_('safe-to-string-x');
var isPrimitive = _dereq_('is-primitive');

/**
   * Tests `value` to see if it is an object, throws a `TypeError` if it is
   * not. Otherwise returns the `value`.
   *
   * @param {*} value - The argument to be tested.
   * @throws {TypeError} Throws if `value` is not an object.
   * @returns {*} Returns `value` if it is an object.
   * @example
   * var assertIsObject = require('assert-is-object-x');
   * var primitive = true;
   * var mySymbol = Symbol('mySymbol');
   * var symObj = Object(mySymbol);
   * var object = {};
   * function fn () {}
   *
   * assertIsObject(primitive); // TypeError 'true is not an object'
   * assertIsObject(mySymbol); // TypeError 'Symbol(mySymbol) is not an object'
   * assertIsObject(symObj); // Returns symObj.
   * assertIsObject(object); // Returns object.
   * assertIsObject(fn); // Returns fn.
   */
module.exports = function assertIsObject(value) {
  if (isPrimitive(value)) {
    throw new TypeError(safeToString(value) + ' is not an object');
  }
  return value;
};

},{"is-primitive":47,"safe-to-string-x":67}],9:[function(_dereq_,module,exports){
/**
* @file A big counter.
* @version 2.0.0
* @author Xotic750 <Xotic750@gmail.com>
* @copyright  Xotic750
* @license {@link <https://opensource.org/licenses/MIT> MIT}
* @module big-counter-x
*/

'use strict';

var defineProperties = _dereq_('object-define-properties-x');

/**
 * Serialise the counter's current value.
 *
 * @private
 * @this BigCounter
 * @return {string} A string representation of an integer.
 */
var counterToString = function ToString() {
  return this.count.slice().reverse().join('');
};

/**
 * The BigCounter class.
 *
 * @private
 * @class
 */
var BigC = function BigCounter() {
  if (Boolean(this) === false || (this instanceof BigC) === false) {
    return new BigC();
  }

  defineProperties(this, {
    count: {
      value: [0]
    }
  });
};

defineProperties(BigC.prototype, {
  /**
   * Gets the counter's current value.
   *
   * @function
   * @returns {string} A string representation of an integer.
   */
  get: {
    value: counterToString
  },
  /**
   * Increments the counter's value by `1`.
   *
   * @function
   * @returns {Object} The counter object.
   */
  next: {
    value: function next() {
      var clone = this.count.slice();
      this.count.length = 0;
      var length = clone.length;
      var howMany = Math.max(length, 1);
      var carry = 0;
      var index = 0;
      while (index < howMany || carry) {
        var zi = carry + (index < length ? clone[index] : 0) + (index === 0 ? 1 : 0);
        this.count.push(zi % 10);
        carry = Math.floor(zi / 10);
        index += 1;
      }

      return this;
    }
  },
  /**
   * Resets the counter back to `0`.
   *
   * @function
   * @returns {Object} The counter object.
   */
  reset: {
    value: function reset() {
      this.count.length = 0;
      this.count.push(0);
      return this;
    }
  },
  /**
   * Gets the counter's current value.
   *
   * @function
   * @returns {string} A string representation of an integer.
   */
  toJSON: {
    value: counterToString
  },
  /**
   * Gets the counter's current value.
   *
   * @function
   * @returns {string} A string representation of an integer.
   */
  toString: {
    value: counterToString
  },
  /**
   * Gets the counter's current value.
   *
   * @function
   * @returns {string} A string representation of an integer.
   */
  valueOf: {
    value: counterToString
  }
});

/**
 * Incremental integer counter. Counts from `0` to very big intergers.
 * Javascript's number type allows you to count in integer steps
 * from `0` to `9007199254740991`. As of ES5, Strings can contain
 * approximately 65000 characters and ES6 is supposed to handle
 * the `MAX_SAFE_INTEGER` (though I don't believe any environments supports
 * this). This counter represents integer values as strings and can therefore
 * count in integer steps from `0` to the maximum string length (that's some
 * 65000 digits). In the lower range, upto `9007199254740991`, the strings can
 * be converted to safe Javascript integers `Number(value)` or `+value`. This
 * counter is great for any applications that need a really big count
 * represented as a string, (an ID string).
 *
 * @class
 * @example
 * var BigCounter = require('big-counter-x');
 * var counter = new BigCounter();
 *
 * counter.get(); // '0'
 * counter.next(); // counter object
 * counter.get(); // '1'
 *
 * // Methods are chainable.
 * counter.next().next(); // counter object
 * counter.get(); // '3'
 *
 * counter.reset(); // counter object
 * counter.get(); // '0'
 * counter.toString(); // '0'
 * counter.valueOf(); // '0'
 * counter.toJSON(); // '0'
 *
 * // Values upto `9007199254740991` convert to numbers.
 * Number(counter); // 0
 * +counter; // 0
 */
module.exports = BigC;

},{"object-define-properties-x":60}],10:[function(_dereq_,module,exports){
/**
 * @file ES6 collections fallback library: Map and Set.
 * @version 1.6.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module collections-x
 */

'use strict';

var hasOwn = _dereq_('has-own-property-x');
var isFunction = _dereq_('is-function-x');
var defineProperty = _dereq_('object-define-property-x');
var defineProperties = _dereq_('object-define-properties-x');
var isString = _dereq_('is-string');
var isArrayLike = _dereq_('is-array-like-x');
var isPrimitive = _dereq_('is-primitive');
var isSurrogatePair = _dereq_('is-surrogate-pair-x');
var indexOf = _dereq_('index-of-x');
var assertIsFunction = _dereq_('assert-is-function-x');
var assertIsObject = _dereq_('assert-is-object-x');
var IdGenerator = _dereq_('big-counter-x');
var isNil = _dereq_('is-nil-x');
var some = _dereq_('array.prototype.some');
var hasSymbolSupport = _dereq_('has-symbol-support-x');
var hasRealSymbolIterator = hasSymbolSupport && typeof Symbol.iterator === 'symbol';
var hasFakeSymbolIterator = typeof Symbol === 'object' && typeof Symbol.iterator === 'string';
var symIt;

if (hasRealSymbolIterator || hasFakeSymbolIterator) {
  symIt = Symbol.iterator;
} else if (isFunction(Array.prototype['_es6-shim iterator_'])) {
  symIt = '_es6-shim iterator_';
} else {
  symIt = '@@iterator';
}

/**
 * The iterator identifier that is in use.
 *
 * type {Symbol|string}
 */
module.exports.symIt = symIt;

/**
 * Detect an interator function.
 *
 * @private
 * @param {*} iterable - Value to detect iterator function.
 * @returns {Symbol|string|undefined} The iterator property identifier.
 */
var getSymbolIterator = function _getSymbolIterator(iterable) {
  if (isNil(iterable) === false) {
    if ((hasRealSymbolIterator || hasFakeSymbolIterator) && iterable[symIt]) {
      return symIt;
    }

    if (iterable['_es6-shim iterator_']) {
      return '_es6-shim iterator_';
    }

    if (iterable['@@iterator']) {
      return '@@iterator';
    }
  }

  return void 0;
};

/**
 * If an iterable object is passed, all of its elements will be added to the
 * new Map/Set, null is treated as undefined.
 *
 * @private
 * @param {string} kind - Either 'map' or 'set'.
 * @param {Object} context - The Map/Set object.
 * @param {*} iterable - Value to parsed.
 */
// eslint-disable-next-line complexity
var parseIterable = function _parseIterable(kind, context, iterable) {
  var symbolIterator = getSymbolIterator(iterable);
  if (kind === 'map') {
    defineProperty(context, '[[value]]', {
      value: []
    });
  }

  defineProperties(context, {
    '[[changed]]': {
      value: false
    },
    '[[id]]': {
      value: new IdGenerator()
    },
    '[[key]]': {
      value: []
    },
    '[[order]]': {
      value: []
    }
  });

  var next;
  var key;
  var indexof;
  if (iterable && isFunction(iterable[symbolIterator])) {
    var iterator = iterable[symbolIterator]();
    next = iterator.next();
    if (kind === 'map') {
      if (isArrayLike(next.value) === false || next.value.length < 2) {
        throw new TypeError(
          'Iterator value ' + isArrayLike(next.value) + ' is not an entry object'
        );
      }
    }

    while (next.done === false) {
      key = kind === 'map' ? next.value[0] : next.value;
      indexof = indexOf(
        assertIsObject(context)['[[key]]'],
        key,
        'SameValueZero'
      );

      if (indexof < 0) {
        if (kind === 'map') {
          context['[[value]]'].push(next.value[1]);
        }

        context['[[key]]'].push(key);
        context['[[order]]'].push(context['[[id]]'].get());
        context['[[id]]'].next();
      } else if (kind === 'map') {
        context['[[value]]'][indexof] = next.value[1];
      }

      next = iterator.next();
    }
  }

  if (isString(iterable)) {
    if (kind === 'map') {
      throw new TypeError(
        'Iterator value ' + iterable.charAt(0) + ' is not an entry object'
      );
    }

    next = 0;
    while (next < iterable.length) {
      var char1 = iterable.charAt(next);
      var char2 = iterable.charAt(next + 1);
      if (isSurrogatePair(char1, char2)) {
        key = char1 + char2;
        next += 1;
      } else {
        key = char1;
      }

      indexof = indexOf(
        assertIsObject(context)['[[key]]'],
        key,
        'SameValueZero'
      );

      if (indexof < 0) {
        context['[[key]]'].push(key);
        context['[[order]]'].push(context['[[id]]'].get());
        context['[[id]]'].next();
      }

      next += 1;
    }
  } else if (isArrayLike(iterable)) {
    next = 0;
    while (next < iterable.length) {
      if (kind === 'map') {
        if (isPrimitive(iterable[next])) {
          throw new TypeError(
            'Iterator value ' + isArrayLike(next.value) + ' is not an entry object'
          );
        }

        key = iterable[next][0];
      } else {
        key = iterable[next];
      }

      key = kind === 'map' ? iterable[next][0] : iterable[next];
      indexof = indexOf(
        assertIsObject(context)['[[key]]'],
        key,
        'SameValueZero'
      );

      if (indexof < 0) {
        if (kind === 'map') {
          context['[[value]]'].push(iterable[next][1]);
        }

        context['[[key]]'].push(key);
        context['[[order]]'].push(context['[[id]]'].get());
        context['[[id]]'].next();
      } else if (kind === 'map') {
        context['[[value]]'][indexof] = iterable[next][1];
      }

      next += 1;
    }
  }

  defineProperty(context, 'size', {
    value: context['[[key]]'].length,
    writable: true
  });
};

/**
 * The base forEach method executes a provided function once per each value
 * in the Map/Set object, in insertion order.
 *
 * @private
 * @param {string} kind - Either 'map' or 'set'.
 * @param {Object} context - The Map/Set object.
 * @param {Function} callback - Function to execute for each element.
 * @param {*} [thisArg] - Value to use as this when executing callback.
 * @returns {Object} The Map/Set object.
 */
// eslint-disable-next-line max-params
var baseForEach = function _baseForEach(kind, context, callback, thisArg) {
  assertIsObject(context);
  assertIsFunction(callback);
  var pointers = {
    index: 0,
    order: context['[[order]]'][0]
  };

  context['[[change]]'] = false;
  var length = context['[[key]]'].length;
  while (pointers.index < length) {
    if (hasOwn(context['[[key]]'], pointers.index)) {
      var key = context['[[key]]'][pointers.index];
      var value = kind === 'map' ? context['[[value]]'][pointers.index] : key;
      callback.call(thisArg, value, key, context);
    }

    if (context['[[change]]']) {
      length = context['[[key]]'].length;
      some(context['[[order]]'], function _some1(id, count) {
        pointers.index = count;
        return id > pointers.order;
      });

      context['[[change]]'] = false;
    } else {
      pointers.index += 1;
    }

    pointers.order = context['[[order]]'][pointers.index];
  }

  return context;
};

/**
 * The base has method returns a boolean indicating whether an element with
 * the specified key/value exists in a Map/Set object or not.
 *
 * @private
 * @param {*} key - The key/value to test for presence in the Map/Set object.
 * @returns {boolean} Returns true if an element with the specified key/value
 *  exists in the Map/Set object; otherwise false.
 */
var baseHas = function has(key) {
  // eslint-disable-next-line no-invalid-this
  return indexOf(assertIsObject(this)['[[key]]'], key, 'SameValueZero') > -1;
};

/**
 * The base clear method removes all elements from a Map/Set object.
 *
 * @private
 * @param {string} kind - Either 'map' or 'set'.
 * @param {Object} context - The Map/Set object.
 * @returns {Object} The Map/Set object.
 */
var baseClear = function _baseClear(kind, context) {
  assertIsObject(context);
  context['[[id]]'].reset();
  context['[[change]]'] = true;
  context.size = 0;
  context['[[order]]'].length = 0;
  context['[[key]]'].length = 0;
  if (kind === 'map') {
    context['[[value]]'].length = 0;
  }

  return context;
};

/**
 * The base delete method removes the specified element from a Map/Set object.
 *
 * @private
 * @param {string} kind - Either 'map' or 'set'.
 * @param {Object} context - The Map/Set object.
 * @param {*} key - The key/value of the element to remove from Map/Set object.
 * @returns {Object} The Map/Set object.
 */
var baseDelete = function _baseDelete(kind, context, key) {
  var indexof = indexOf(
    assertIsObject(context)['[[key]]'],
    key,
    'SameValueZero'
  );

  var result = false;
  if (indexof > -1) {
    if (kind === 'map') {
      context['[[value]]'].splice(indexof, 1);
    }

    context['[[key]]'].splice(indexof, 1);
    context['[[order]]'].splice(indexof, 1);
    context['[[change]]'] = true;
    context.size = context['[[key]]'].length;
    result = true;
  }

  return result;
};

/**
 * The base set and add method.
 *
 * @private
 * @param {string} kind - Either 'map' or 'set'.
 * @param {Object} context - The Map/Set object.
 * @param {*} key - The key or value of the element to add/set on the object.
 * @param {*} value - The value of the element to add to the Map object.
 * @returns {Object} The Map/Set object.
 */
// eslint-disable-next-line max-params
var baseAddSet = function _baseAddSet(kind, context, key, value) {
  var index = indexOf(
    assertIsObject(context)['[[key]]'],
    key,
    'SameValueZero'
  );

  if (index > -1) {
    if (kind === 'map') {
      context['[[value]]'][index] = value;
    }
  } else {
    if (kind === 'map') {
      context['[[value]]'].push(value);
    }

    context['[[key]]'].push(key);
    context['[[order]]'].push(context['[[id]]'].get());
    context['[[id]]'].next();
    context['[[change]]'] = true;
    context.size = context['[[key]]'].length;
  }

  return context;
};

/**
 * An object is an iterator when it knows how to access items from a
 * collection one at a time, while keeping track of its current position
 * within that sequence. In JavaScript an iterator is an object that provides
 * a next() method which returns the next item in the sequence. This method
 * returns an object with two properties: done and value. Once created,
 * an iterator object can be used explicitly by repeatedly calling next().
 *
 * @private
 * @class
 * @param {Object} context - The Set object.
 * @param {string} iteratorKind - Values are `value`, `key` or `key+value`.
 */
var SetIt = function SetIterator(context, iteratorKind) {
  defineProperties(this, {
    '[[IteratorHasMore]]': {
      value: true,
      writable: true
    },
    '[[Set]]': {
      value: assertIsObject(context)
    },
    '[[SetIterationKind]]': {
      value: iteratorKind || 'value'
    },
    '[[SetNextIndex]]': {
      value: 0,
      writable: true
    }
  });
};

/**
 * Once initialized, the next() method can be called to access key-value
 * pairs from the object in turn.
 *
 * @private
 * @function next
 * @returns {Object} Returns an object with two properties: done and value.
 */
defineProperty(SetIt.prototype, 'next', {
  value: function next() {
    var context = assertIsObject(this['[[Set]]']);
    var index = this['[[SetNextIndex]]'];
    var iteratorKind = this['[[SetIterationKind]]'];
    var more = this['[[IteratorHasMore]]'];
    var object;
    if (index < context['[[key]]'].length && more) {
      object = { done: false };
      if (iteratorKind === 'key+value') {
        object.value = [context['[[key]]'][index], context['[[key]]'][index]];
      } else {
        object.value = context['[[key]]'][index];
      }

      this['[[SetNextIndex]]'] += 1;
    } else {
      this['[[IteratorHasMore]]'] = false;
      object = {
        done: true,
        value: void 0
      };
    }

    return object;
  }
});

/**
 * The @@iterator property is the same Iterator object.
 *
 * @private
 * @function symIt
 * @memberof SetIterator.prototype
 * @returns {Object} This Iterator object.
 */
defineProperty(SetIt.prototype, symIt, {
  value: function iterator() {
    return this;
  }
});

/**
 * This method returns a new Iterator object that contains the
 * values for each element in the Set object in insertion order.
 *
 * @private
 * @this Set
 * @returns {Object} A new Iterator object.
 */
var setValuesIterator = function values() {
  return new SetIt(this);
};

/**
 * The Set object lets you store unique values of any type, whether primitive
 * values or object references.
 *
 * @class Set
 * @private
 * @param {*} [iterable] - If an iterable object is passed, all of its elements
 * will be added to the new Set. null is treated as undefined.
 * @example
 * var mySet = new Set();
 *
 * mySet.add(1);
 * mySet.add(5);
 * mySet.add("some text");
 * var o = {a: 1, b: 2};
 * mySet.add(o);
 *
 * mySet.has(1); // true
 * mySet.has(3); // false, 3 has not been added to the set
 * mySet.has(5);              // true
 * mySet.has(Math.sqrt(25));  // true
 * mySet.has("Some Text".toLowerCase()); // true
 * mySet.has(o); // true
 *
 * mySet.size; // 4
 *
 * mySet.delete(5); // removes 5 from the set
 * mySet.has(5);    // false, 5 has been removed
 *
 * mySet.size; // 3, we just removed one value
 *
 * // Relation with Array objects
 *
 * var myArray = ["value1", "value2", "value3"];
 *
 * // Use the regular Set constructor to transform an Array into a Set
 * var mySet = new Set(myArray);
 *
 * mySet.has("value1"); // returns true
 *
 * // Use the spread operator to transform a set into an Array.
 * console.log(uneval([...mySet])); // Will show you exactly the same Array
 *                                  // as myArray
 */
var SetObject = function Set() {
  if (Boolean(this) === false || (this instanceof SetObject) === false) {
    throw new TypeError('Constructor Set requires \'new\'');
  }

  parseIterable('set', this, arguments.length ? arguments[0] : void 0);
};

/** @borrows Set as Set */
module.exports.Set = SetObject;
defineProperties(SetObject.prototype, /** @lends module:collections-x.Set.prototype */ {
  /**
   * The add() method appends a new element with a specified value to the end
   * of a Set object.
   *
   * @param {*} value - Required. The value of the element to add to the Set
   *  object.
   * @returns {Object} The Set object.
   * @example
   * var Set = require('collections-x').Set
   * var mySet = new Set();
   *
   * mySet.add(1);
   * mySet.add(5).add("some text"); // chainable
   *
   * console.log(mySet);
   * // Set [1, 5, "some text"]
   */
  add: {
    value: function add(value) {
      return baseAddSet('set', this, value);
    }
  },
  /**
   * The clear() method removes all elements from a Set object.
   *
   * @returns {Object} The Set object.
   * @example
   * var Set = require('collections-x').Set
   * var mySet = new Set();
   * mySet.add(1);
   * mySet.add("foo");
   *
   * mySet.size;       // 2
   * mySet.has("foo"); // true
   *
   * mySet.clear();
   *
   * mySet.size;       // 0
   * mySet.has("bar")  // false
   */
  clear: {
    value: function clear() {
      return baseClear('set', this);
    }
  },
  /**
   * The delete() method removes the specified element from a Set object.
   *
   * @param {*} value - The value of the element to remove from the Set object.
   * @returns {boolean} Returns true if an element in the Set object has been
   *  removed successfully; otherwise false.
   * @example
   * var Set = require('collections-x').Set
   * var mySet = new Set();
   * mySet.add("foo");
   *
   * mySet.delete("bar"); // Returns false. No "bar" element found
   *                      //to be deleted.
   * mySet.delete("foo"); // Returns true.  Successfully removed.
   *
   * mySet.has("foo");    // Returns false. The "foo" element is no
   *                      //longer present.
   */
  'delete': {
    value: function de1ete(value) {
      return baseDelete('set', this, value);
    }
  },
  /**
   * The entries() method returns a new Iterator object that contains an
   * array of [value, value] for each element in the Set object, in
   * insertion order. For Set objects there is no key like in Map objects.
   * However, to keep the API similar to the Map object, each entry has the
   * same value for its key and value here, so that an array [value, value]
   * is returned.
   *
   * @function
   * @returns {Object} A new Iterator object.
   * @example
   * var Set = require('collections-x').Set
   * var mySet = new Set();
   * mySet.add("foobar");
   * mySet.add(1);
   * mySet.add("baz");
   *
   * var setIter = mySet.entries();
   *
   * console.log(setIter.next().value); // ["foobar", "foobar"]
   * console.log(setIter.next().value); // [1, 1]
   * console.log(setIter.next().value); // ["baz", "baz"]
   */
  entries: {
    value: function entries() {
      return new SetIt(this, 'key+value');
    }
  },
  /**
   * The forEach() method executes a provided function once per each value
   * in the Set object, in insertion order.
   *
   * @param {Function} callback - Function to execute for each element.
   * @param {*} [thisArg] - Value to use as this when executing callback.
   * @returns {Object} The Set object.
   * @example
   * function logSetElements(value1, value2, set) {
   *     console.log("s[" + value1 + "] = " + value2);
   * }
   *
   * new Set(["foo", "bar", undefined]).forEach(logSetElements);
   *
   * // logs:
   * // "s[foo] = foo"
   * // "s[bar] = bar"
   * // "s[undefined] = undefined"
   */
  forEach: {
    value: function forEach(callback, thisArg) {
      return baseForEach('set', this, callback, thisArg);
    }
  },
  /**
   * The has() method returns a boolean indicating whether an element with the
   * specified value exists in a Set object or not.
   *
   * @function
   * @param {*} value - The value to test for presence in the Set object.
   * @returns {boolean} Returns true if an element with the specified value
   *  exists in the Set object; otherwise false.
   * @example
   * var Set = require('collections-x').Set;
   * var mySet = new Set();
   * mySet.add("foo");
   *
   * mySet.has("foo");  // returns true
   * mySet.has("bar");  // returns false
   */
  has: {
    value: baseHas
  },
  /**
   * The keys() method is an alias for the `values` method (for similarity
   * with Map objects); it behaves exactly the same and returns values of
   * Set elements.
   *
   * @function
   * @returns {Object} A new Iterator object.
   * @example
   * var Set = require('collections-x').Set
   * var mySet = new Set();
   * mySet.add("foo");
   * mySet.add("bar");
   * mySet.add("baz");
   *
   * var setIter = mySet.keys();
   *
   * console.log(setIter.next().value); // "foo"
   * console.log(setIter.next().value); // "bar"
   * console.log(setIter.next().value); // "baz"
   */
  keys: {
    value: setValuesIterator
  },
  /**
   * The value of size is an integer representing how many entries the Set
   * object has.
   *
   * @name size
   * @memberof module:collections-x.Set
   * @instance
   * @type {number}
   * @example
   * var Set = require('collections-x').Set
   * var mySet = new Set();
   * mySet.add(1);
   * mySet.add(5);
   * mySet.add("some text");
   *
   * mySet.size; // 3
   */
  size: {
    value: 0,
    writable: true
  },
  /**
   * The values() method returns a new Iterator object that contains the
   * values for each element in the Set object in insertion order.
   *
   * @function
   * @returns {Object} A new Iterator object.
   * @example
   * var Set = require('collections-x').Set
   * var mySet = new Set();
   * mySet.add("foo");
   * mySet.add("bar");
   * mySet.add("baz");
   *
   * var setIter = mySet.values();
   *
   * console.log(setIter.next().value); // "foo"
   * console.log(setIter.next().value); // "bar"
   * console.log(setIter.next().value); // "baz"
   */
  values: {
    value: setValuesIterator
  }
});

/**
 * The initial value of the @@iterator property is the same function object
 * as the initial value of the values property.
 *
 * @function symIt
 * @memberof module:collections-x.Set.prototype
 * @returns {Object} A new Iterator object.
 * @example
 * var Set = require('collections-x').Set,
 * var symIt = var Set = require('collections-x').symIt;
 * var mySet = new Set();
 * mySet.add("0");
 * mySet.add(1);
 * mySet.add({});
 *
 * var setIter = mySet[symIt]();
 *
 * console.log(setIter.next().value); // "0"
 * console.log(setIter.next().value); // 1
 * console.log(setIter.next().value); // Object
 */
defineProperty(SetObject.prototype, symIt, {
  value: setValuesIterator
});

/**
 * An object is an iterator when it knows how to access items from a
 * collection one at a time, while keeping track of its current position
 * within that sequence. In JavaScript an iterator is an object that provides
 * a next() method which returns the next item in the sequence. This method
 * returns an object with two properties: done and value. Once created,
 * an iterator object can be used explicitly by repeatedly calling next().
 *
 * @private
 * @class
 * @param {Object} context - The Map object.
 * @param {string} iteratorKind - Values are `value`, `key` or `key+value`.
 */
var MapIt = function MapIterator(context, iteratorKind) {
  defineProperties(this, {
    '[[IteratorHasMore]]': {
      value: true,
      writable: true
    },
    '[[Map]]': {
      value: assertIsObject(context)
    },
    '[[MapIterationKind]]': {
      value: iteratorKind
    },
    '[[MapNextIndex]]': {
      value: 0,
      writable: true
    }
  });
};

/**
 * Once initialized, the next() method can be called to access key-value
 * pairs from the object in turn.
 *
 * @private
 * @function next
 * @returns {Object} Returns an object with two properties: done and value.
 */
defineProperty(MapIt.prototype, 'next', {
  value: function next() {
    var context = assertIsObject(this['[[Map]]']);
    var index = this['[[MapNextIndex]]'];
    var iteratorKind = this['[[MapIterationKind]]'];
    var more = this['[[IteratorHasMore]]'];
    var object;
    assertIsObject(context);
    if (index < context['[[key]]'].length && more) {
      object = { done: false };
      if (iteratorKind === 'key+value') {
        object.value = [context['[[key]]'][index], context['[[value]]'][index]];
      } else {
        object.value = context['[[' + iteratorKind + ']]'][index];
      }

      this['[[MapNextIndex]]'] += 1;
    } else {
      this['[[IteratorHasMore]]'] = false;
      object = {
        done: true,
        value: void 0
      };
    }

    return object;
  }
});

/**
 * The @@iterator property is the same Iterator object.
 *
 * @private
 * @function symIt
 * @memberof MapIterator.prototype
 * @returns {Object} This Iterator object.
 */
defineProperty(MapIt.prototype, symIt, {
  value: function iterator() {
    return this;
  }
});

/**
 * The Map object is a simple key/value map. Any value (both objects and
 * primitive values) may be used as either a key or a value.
 *
 * @class Map
 * @private
 * @param {*} [iterable] - Iterable is an Array or other iterable object whose
 *  elements are key-value pairs (2-element Arrays). Each key-value pair is
 *  added to the new Map. null is treated as undefined.
 * @example
 * var Map = require('collections-x').Map;
 * var myMap = new Map();
 *
 * var keyString = "a string",
 *     keyObj = {},
 *     keyFunc = function () {};
 *
 * // setting the values
 * myMap.set(keyString, "value associated with 'a string'");
 * myMap.set(keyObj, "value associated with keyObj");
 * myMap.set(keyFunc, "value associated with keyFunc");
 *
 * myMap.size; // 3
 *
 * // getting the values
 * myMap.get(keyString);    // "value associated with 'a string'"
 * myMap.get(keyObj);       // "value associated with keyObj"
 * myMap.get(keyFunc);      // "value associated with keyFunc"
 *
 * myMap.get("a string");   // "value associated with 'a string'"
 *                          // because keyString === 'a string'
 * myMap.get({});           // undefined, because keyObj !== {}
 * myMap.get(function() {}) // undefined, because keyFunc !== function () {}
 *
 * // Using NaN as Map keys
 * var myMap = new Map();
 * myMap.set(NaN, "not a number");
 *
 * myMap.get(NaN); // "not a number"
 *
 * var otherNaN = Number("foo");
 * myMap.get(otherNaN); // "not a number"
 *
 * // Relation with Array objects
 * var kvArray = [["key1", "value1"], ["key2", "value2"]];
 *
 * // Use the regular Map constructor to transform a
 * // 2D key-value Array into a map
 * var myMap = new Map(kvArray);
 *
 * myMap.get("key1"); // returns "value1"
 */
var MapObject = function Map() {
  if (Boolean(this) === false || (this instanceof MapObject) === false) {
    throw new TypeError('Constructor Map requires \'new\'');
  }

  parseIterable('map', this, arguments.length ? arguments[0] : void 0);
};

/** @borrows Map as Map */
module.exports.Map = MapObject;
defineProperties(MapObject.prototype, /** @lends module:collections-x.Map.prototype */ {
  /**
   * The clear() method removes all elements from a Map object.
   *
   * @returns {Object} The Map object.
   * @example
   * var Map = require('collections-x').Map;
   * var myMap = new Map();
   * myMap.set("bar", "baz");
   * myMap.set(1, "foo");
   *
   * myMap.size;       // 2
   * myMap.has("bar"); // true
   *
   * myMap.clear();
   *
   * myMap.size;       // 0
   * myMap.has("bar")  // false
   */
  clear: {
    value: function clear() {
      return baseClear('map', this);
    }
  },
  /**
   * The delete() method removes the specified element from a Map object.
   *
   * @param {*} key - The key of the element to remove from the Map object.
   * @returns {boolean} Returns true if an element in the Map object has been
   *  removed successfully.
   * @example
   * var Map = require('collections-x').Map;
   * var myMap = new Map();
   * myMap.set("bar", "foo");
   *
   * myMap.delete("bar"); // Returns true. Successfully removed.
   * myMap.has("bar");    // Returns false.
   *                      // The "bar" element is no longer present.
   */
  'delete': {
    value: function de1ete(key) {
      return baseDelete('map', this, key);
    }
  },
  /**
   * The entries() method returns a new Iterator object that contains the
   * [key, value] pairs for each element in the Map object in insertion order.
   *
   * @returns {Object} A new Iterator object.
   * @example
   * var Map = require('collections-x').Map;
   * var myMap = new Map();
   * myMap.set("0", "foo");
   * myMap.set(1, "bar");
   * myMap.set({}, "baz");
   *
   * var mapIter = myMap.entries();
   *
   * console.log(mapIter.next().value); // ["0", "foo"]
   * console.log(mapIter.next().value); // [1, "bar"]
   * console.log(mapIter.next().value); // [Object, "baz"]
   */
  entries: {
    value: function entries() {
      return new MapIt(this, 'key+value');
    }
  },
  /**
   * The forEach() method executes a provided function once per each
   * key/value pair in the Map object, in insertion order.
   *
   * @param {Function} callback - Function to execute for each element..
   * @param {*} [thisArg] - Value to use as this when executing callback.
   * @returns {Object} The Map object.
   * @example
   * var Map = require('collections-x').Map;
   * function logElements(value, key, map) {
   *      console.log("m[" + key + "] = " + value);
   * }
   * var myMap = new Map([["foo", 3], ["bar", {}], ["baz", undefined]]);
   * myMap.forEach(logElements);
   * // logs:
   * // "m[foo] = 3"
   * // "m[bar] = [object Object]"
   * // "m[baz] = undefined"
   */
  forEach: {
    value: function forEach(callback, thisArg) {
      return baseForEach('map', this, callback, thisArg);
    }
  },
  /**
   * The get() method returns a specified element from a Map object.
   *
   * @param {*} key - The key of the element to return from the Map object.
   * @returns {*} Returns the element associated with the specified key or
   *  undefined if the key can't be found in the Map object.
   * @example
   * var Map = require('collections-x').Map;
   * var myMap = new Map();
   * myMap.set("bar", "foo");
   *
   * myMap.get("bar");  // Returns "foo".
   * myMap.get("baz");  // Returns undefined.
   */
  get: {
    value: function get(key) {
      var index = indexOf(
        assertIsObject(this)['[[key]]'],
        key,
        'SameValueZero'
      );

      return index > -1 ? this['[[value]]'][index] : void 0;
    }
  },
  /**
   * The has() method returns a boolean indicating whether an element with
   * the specified key exists or not.
   *
   * @function
   * @param {*} key - The key of the element to test for presence in the
   *  Map object.
   * @returns {boolean} Returns true if an element with the specified key
   *  exists in the Map object; otherwise false.
   * @example
   * var Map = require('collections-x').Map;
   * var myMap = new Map();
   * myMap.set("bar", "foo");
   *
   * myMap.has("bar");  // returns true
   * myMap.has("baz");  // returns false
   */
  has: {
    value: baseHas
  },
  /**
   * The keys() method returns a new Iterator object that contains the keys
   * for each element in the Map object in insertion order.
   *
   * @returns {Object} A new Iterator object.
   * @example
   * var Map = require('collections-x').Map;
   * var myMap = new Map();
   * myMap.set("0", "foo");
   * myMap.set(1, "bar");
   * myMap.set({}, "baz");
   *
   * var mapIter = myMap.keys();
   *
   * console.log(mapIter.next().value); // "0"
   * console.log(mapIter.next().value); // 1
   * console.log(mapIter.next().value); // Object
   */
  keys: {
    value: function keys() {
      return new MapIt(this, 'key');
    }
  },
  /**
   * The set() method adds a new element with a specified key and value to
   * a Map object.
   *
   * @param {*} key - The key of the element to add to the Map object.
   * @param {*} value - The value of the element to add to the Map object.
   * @returns {Object} The Map object.
   * @example
   * var Map = require('collections-x').Map;
   * var myMap = new Map();
   *
   * // Add new elements to the map
   * myMap.set("bar", "foo");
   * myMap.set(1, "foobar");
   *
   * // Update an element in the map
   * myMap.set("bar", "fuuu");
   */
  set: {
    value: function set(key, value) {
      return baseAddSet('map', this, key, value);
    }
  },
  /**
   * The value of size is an integer representing how many entries the Map
   * object has.
   *
   * @name size
   * @memberof module:collections-x.Map
   * @instance
   * @type {number}
   * @example
   * var Map = require('collections-x').Map;
   * var myMap = new Map();
   * myMap.set(1, true);
   * myMap.set(5, false);
   * myMap.set("some text", 1);
   *
   * myMap.size; // 3
   */
  size: {
    value: 0,
    writable: true
  },
  /**
   * The values() method returns a new Iterator object that contains the
   * values for each element in the Map object in insertion order.
   *
   * @returns {Object} A new Iterator object.
   * @example
   * var Map = require('collections-x').Map;
   * var myMap = new Map();
   * myMap.set("0", "foo");
   * myMap.set(1, "bar");
   * myMap.set({}, "baz");
   *
   * var mapIter = myMap.values();
   *
   * console.log(mapIter.next().value); // "foo"
   * console.log(mapIter.next().value); // "bar"
   * console.log(mapIter.next().value); // "baz"
   */
  values: {
    value: function values() {
      return new MapIt(this, 'value');
    }
  }
});

/**
 * The initial value of the @@iterator property is the same function object
 * as the initial value of the entries property.
 *
 * @function symIt
 * @memberof module:collections-x.Map.prototype
 * @returns {Object} A new Iterator object.
 * @example
 * var Map = require('collections-x').Map;
 * var symIt = require('collections-x').symIt;
 * var myMap = new Map();
 * myMap.set("0", "foo");
 * myMap.set(1, "bar");
 * myMap.set({}, "baz");
 *
 * var mapIter = myMap[symIt]();
 *
 * console.log(mapIter.next().value); // ["0", "foo"]
 * console.log(mapIter.next().value); // [1, "bar"]
 * console.log(mapIter.next().value); // [Object, "baz"]
 */
defineProperty(MapObject.prototype, symIt, {
  value: MapObject.prototype.entries
});

},{"array.prototype.some":4,"assert-is-function-x":7,"assert-is-object-x":8,"big-counter-x":9,"has-own-property-x":29,"has-symbol-support-x":30,"index-of-x":33,"is-array-like-x":35,"is-function-x":39,"is-nil-x":45,"is-primitive":47,"is-string":50,"is-surrogate-pair-x":51,"object-define-properties-x":60,"object-define-property-x":61}],11:[function(_dereq_,module,exports){
'use strict';

var keys = _dereq_('object-keys');
var foreach = _dereq_('foreach');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

var toStr = Object.prototype.toString;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        /* eslint-disable no-unused-vars, no-restricted-syntax */
        for (var _ in obj) { return false; }
        /* eslint-enable no-unused-vars, no-restricted-syntax */
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = Object.defineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		Object.defineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = props.concat(Object.getOwnPropertySymbols(map));
	}
	foreach(props, function (name) {
		defineProperty(object, name, map[name], predicates[name]);
	});
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;

},{"foreach":25,"object-keys":64}],12:[function(_dereq_,module,exports){
'use strict';

var $isNaN = _dereq_('./helpers/isNaN');
var $isFinite = _dereq_('./helpers/isFinite');

var sign = _dereq_('./helpers/sign');
var mod = _dereq_('./helpers/mod');

var IsCallable = _dereq_('is-callable');
var toPrimitive = _dereq_('es-to-primitive/es5');

// https://es5.github.io/#x9
var ES5 = {
	ToPrimitive: toPrimitive,

	ToBoolean: function ToBoolean(value) {
		return Boolean(value);
	},
	ToNumber: function ToNumber(value) {
		return Number(value);
	},
	ToInteger: function ToInteger(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number)) { return 0; }
		if (number === 0 || !$isFinite(number)) { return number; }
		return sign(number) * Math.floor(Math.abs(number));
	},
	ToInt32: function ToInt32(x) {
		return this.ToNumber(x) >> 0;
	},
	ToUint32: function ToUint32(x) {
		return this.ToNumber(x) >>> 0;
	},
	ToUint16: function ToUint16(value) {
		var number = this.ToNumber(value);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x10000);
	},
	ToString: function ToString(value) {
		return String(value);
	},
	ToObject: function ToObject(value) {
		this.CheckObjectCoercible(value);
		return Object(value);
	},
	CheckObjectCoercible: function CheckObjectCoercible(value, optMessage) {
		/* jshint eqnull:true */
		if (value == null) {
			throw new TypeError(optMessage || 'Cannot call method on ' + value);
		}
		return value;
	},
	IsCallable: IsCallable,
	SameValue: function SameValue(x, y) {
		if (x === y) { // 0 === -0, but they are not identical.
			if (x === 0) { return 1 / x === 1 / y; }
			return true;
		}
		return $isNaN(x) && $isNaN(y);
	},

	// http://www.ecma-international.org/ecma-262/5.1/#sec-8
	Type: function Type(x) {
		if (x === null) {
			return 'Null';
		}
		if (typeof x === 'undefined') {
			return 'Undefined';
		}
		if (typeof x === 'function' || typeof x === 'object') {
			return 'Object';
		}
		if (typeof x === 'number') {
			return 'Number';
		}
		if (typeof x === 'boolean') {
			return 'Boolean';
		}
		if (typeof x === 'string') {
			return 'String';
		}
	}
};

module.exports = ES5;

},{"./helpers/isFinite":15,"./helpers/isNaN":16,"./helpers/mod":18,"./helpers/sign":19,"es-to-primitive/es5":20,"is-callable":36}],13:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';
var symbolToStr = hasSymbols ? Symbol.prototype.toString : toStr;

var $isNaN = _dereq_('./helpers/isNaN');
var $isFinite = _dereq_('./helpers/isFinite');
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

var assign = _dereq_('./helpers/assign');
var sign = _dereq_('./helpers/sign');
var mod = _dereq_('./helpers/mod');
var isPrimitive = _dereq_('./helpers/isPrimitive');
var toPrimitive = _dereq_('es-to-primitive/es6');
var parseInteger = parseInt;
var bind = _dereq_('function-bind');
var strSlice = bind.call(Function.call, String.prototype.slice);
var isBinary = bind.call(Function.call, RegExp.prototype.test, /^0b[01]+$/i);
var isOctal = bind.call(Function.call, RegExp.prototype.test, /^0o[0-7]+$/i);
var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
var nonWSregex = new RegExp('[' + nonWS + ']', 'g');
var hasNonWS = bind.call(Function.call, RegExp.prototype.test, nonWSregex);
var invalidHexLiteral = /^[-+]0x[0-9a-f]+$/i;
var isInvalidHexLiteral = bind.call(Function.call, RegExp.prototype.test, invalidHexLiteral);

// whitespace from: http://es5.github.io/#x15.5.4.20
// implementation from https://github.com/es-shims/es5-shim/blob/v3.4.0/es5-shim.js#L1304-L1324
var ws = [
	'\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003',
	'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028',
	'\u2029\uFEFF'
].join('');
var trimRegex = new RegExp('(^[' + ws + ']+)|([' + ws + ']+$)', 'g');
var replace = bind.call(Function.call, String.prototype.replace);
var trim = function (value) {
	return replace(value, trimRegex, '');
};

var ES5 = _dereq_('./es5');

var hasRegExpMatcher = _dereq_('is-regex');

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-abstract-operations
var ES6 = assign(assign({}, ES5), {

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-call-f-v-args
	Call: function Call(F, V) {
		var args = arguments.length > 2 ? arguments[2] : [];
		if (!this.IsCallable(F)) {
			throw new TypeError(F + ' is not a function');
		}
		return F.apply(V, args);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toprimitive
	ToPrimitive: toPrimitive,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toboolean
	// ToBoolean: ES5.ToBoolean,

	// http://www.ecma-international.org/ecma-262/6.0/#sec-tonumber
	ToNumber: function ToNumber(argument) {
		var value = isPrimitive(argument) ? argument : toPrimitive(argument, 'number');
		if (typeof value === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a number');
		}
		if (typeof value === 'string') {
			if (isBinary(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 2));
			} else if (isOctal(value)) {
				return this.ToNumber(parseInteger(strSlice(value, 2), 8));
			} else if (hasNonWS(value) || isInvalidHexLiteral(value)) {
				return NaN;
			} else {
				var trimmed = trim(value);
				if (trimmed !== value) {
					return this.ToNumber(trimmed);
				}
			}
		}
		return Number(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tointeger
	// ToInteger: ES5.ToNumber,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint32
	// ToInt32: ES5.ToInt32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint32
	// ToUint32: ES5.ToUint32,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint16
	ToInt16: function ToInt16(argument) {
		var int16bit = this.ToUint16(argument);
		return int16bit >= 0x8000 ? int16bit - 0x10000 : int16bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint16
	// ToUint16: ES5.ToUint16,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toint8
	ToInt8: function ToInt8(argument) {
		var int8bit = this.ToUint8(argument);
		return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8
	ToUint8: function ToUint8(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number === 0 || !$isFinite(number)) { return 0; }
		var posInt = sign(number) * Math.floor(Math.abs(number));
		return mod(posInt, 0x100);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-touint8clamp
	ToUint8Clamp: function ToUint8Clamp(argument) {
		var number = this.ToNumber(argument);
		if ($isNaN(number) || number <= 0) { return 0; }
		if (number >= 0xFF) { return 0xFF; }
		var f = Math.floor(argument);
		if (f + 0.5 < number) { return f + 1; }
		if (number < f + 0.5) { return f; }
		if (f % 2 !== 0) { return f + 1; }
		return f;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tostring
	ToString: function ToString(argument) {
		if (typeof argument === 'symbol') {
			throw new TypeError('Cannot convert a Symbol value to a string');
		}
		return String(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-toobject
	ToObject: function ToObject(value) {
		this.RequireObjectCoercible(value);
		return Object(value);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-topropertykey
	ToPropertyKey: function ToPropertyKey(argument) {
		var key = this.ToPrimitive(argument, String);
		return typeof key === 'symbol' ? symbolToStr.call(key) : this.ToString(key);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	ToLength: function ToLength(argument) {
		var len = this.ToInteger(argument);
		if (len <= 0) { return 0; } // includes converting -0 to +0
		if (len > MAX_SAFE_INTEGER) { return MAX_SAFE_INTEGER; }
		return len;
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-canonicalnumericindexstring
	CanonicalNumericIndexString: function CanonicalNumericIndexString(argument) {
		if (toStr.call(argument) !== '[object String]') {
			throw new TypeError('must be a string');
		}
		if (argument === '-0') { return -0; }
		var n = this.ToNumber(argument);
		if (this.SameValue(this.ToString(n), argument)) { return n; }
		return void 0;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-requireobjectcoercible
	RequireObjectCoercible: ES5.CheckObjectCoercible,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isarray
	IsArray: Array.isArray || function IsArray(argument) {
		return toStr.call(argument) === '[object Array]';
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iscallable
	// IsCallable: ES5.IsCallable,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isconstructor
	IsConstructor: function IsConstructor(argument) {
		return typeof argument === 'function' && !!argument.prototype; // unfortunately there's no way to truly check this without try/catch `new argument`
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isextensible-o
	IsExtensible: function IsExtensible(obj) {
		if (!Object.preventExtensions) { return true; }
		if (isPrimitive(obj)) {
			return false;
		}
		return Object.isExtensible(obj);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-isinteger
	IsInteger: function IsInteger(argument) {
		if (typeof argument !== 'number' || $isNaN(argument) || !$isFinite(argument)) {
			return false;
		}
		var abs = Math.abs(argument);
		return Math.floor(abs) === abs;
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-ispropertykey
	IsPropertyKey: function IsPropertyKey(argument) {
		return typeof argument === 'string' || typeof argument === 'symbol';
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-isregexp
	IsRegExp: function IsRegExp(argument) {
		if (!argument || typeof argument !== 'object') {
			return false;
		}
		if (hasSymbols) {
			var isRegExp = argument[Symbol.match];
			if (typeof isRegExp !== 'undefined') {
				return ES5.ToBoolean(isRegExp);
			}
		}
		return hasRegExpMatcher(argument);
	},

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevalue
	// SameValue: ES5.SameValue,

	// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-samevaluezero
	SameValueZero: function SameValueZero(x, y) {
		return (x === y) || ($isNaN(x) && $isNaN(y));
	},

	/**
	 * 7.3.2 GetV (V, P)
	 * 1. Assert: IsPropertyKey(P) is true.
	 * 2. Let O be ToObject(V).
	 * 3. ReturnIfAbrupt(O).
	 * 4. Return O.[[Get]](P, V).
	 */
	GetV: function GetV(V, P) {
		// 7.3.2.1
		if (!this.IsPropertyKey(P)) {
			throw new TypeError('Assertion failed: IsPropertyKey(P) is not true');
		}

		// 7.3.2.2-3
		var O = this.ToObject(V);

		// 7.3.2.4
		return O[P];
	},

	/**
	 * 7.3.9 - http://www.ecma-international.org/ecma-262/6.0/#sec-getmethod
	 * 1. Assert: IsPropertyKey(P) is true.
	 * 2. Let func be GetV(O, P).
	 * 3. ReturnIfAbrupt(func).
	 * 4. If func is either undefined or null, return undefined.
	 * 5. If IsCallable(func) is false, throw a TypeError exception.
	 * 6. Return func.
	 */
	GetMethod: function GetMethod(O, P) {
		// 7.3.9.1
		if (!this.IsPropertyKey(P)) {
			throw new TypeError('Assertion failed: IsPropertyKey(P) is not true');
		}

		// 7.3.9.2
		var func = this.GetV(O, P);

		// 7.3.9.4
		if (func == null) {
			return undefined;
		}

		// 7.3.9.5
		if (!this.IsCallable(func)) {
			throw new TypeError(P + 'is not a function');
		}

		// 7.3.9.6
		return func;
	},

	/**
	 * 7.3.1 Get (O, P) - http://www.ecma-international.org/ecma-262/6.0/#sec-get-o-p
	 * 1. Assert: Type(O) is Object.
	 * 2. Assert: IsPropertyKey(P) is true.
	 * 3. Return O.[[Get]](P, O).
	 */
	Get: function Get(O, P) {
		// 7.3.1.1
		if (this.Type(O) !== 'Object') {
			throw new TypeError('Assertion failed: Type(O) is not Object');
		}
		// 7.3.1.2
		if (!this.IsPropertyKey(P)) {
			throw new TypeError('Assertion failed: IsPropertyKey(P) is not true');
		}
		// 7.3.1.3
		return O[P];
	},

	Type: function Type(x) {
		if (typeof x === 'symbol') {
			return 'Symbol';
		}
		return ES5.Type(x);
	},

	// http://www.ecma-international.org/ecma-262/6.0/#sec-speciesconstructor
	SpeciesConstructor: function SpeciesConstructor(O, defaultConstructor) {
		if (this.Type(O) !== 'Object') {
			throw new TypeError('Assertion failed: Type(O) is not Object');
		}
		var C = O.constructor;
		if (typeof C === 'undefined') {
			return defaultConstructor;
		}
		if (this.Type(C) !== 'Object') {
			throw new TypeError('O.constructor is not an Object');
		}
		var S = hasSymbols && Symbol.species ? C[Symbol.species] : undefined;
		if (S == null) {
			return defaultConstructor;
		}
		if (this.IsConstructor(S)) {
			return S;
		}
		throw new TypeError('no constructor found');
	}
});

delete ES6.CheckObjectCoercible; // renamed in ES6 to RequireObjectCoercible

module.exports = ES6;

},{"./es5":12,"./helpers/assign":14,"./helpers/isFinite":15,"./helpers/isNaN":16,"./helpers/isPrimitive":17,"./helpers/mod":18,"./helpers/sign":19,"es-to-primitive/es6":21,"function-bind":27,"is-regex":48}],14:[function(_dereq_,module,exports){
var has = Object.prototype.hasOwnProperty;
module.exports = Object.assign || function assign(target, source) {
	for (var key in source) {
		if (has.call(source, key)) {
			target[key] = source[key];
		}
	}
	return target;
};

},{}],15:[function(_dereq_,module,exports){
var $isNaN = Number.isNaN || function (a) { return a !== a; };

module.exports = Number.isFinite || function (x) { return typeof x === 'number' && !$isNaN(x) && x !== Infinity && x !== -Infinity; };

},{}],16:[function(_dereq_,module,exports){
module.exports = Number.isNaN || function isNaN(a) {
	return a !== a;
};

},{}],17:[function(_dereq_,module,exports){
module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],18:[function(_dereq_,module,exports){
module.exports = function mod(number, modulo) {
	var remain = number % modulo;
	return Math.floor(remain >= 0 ? remain : remain + modulo);
};

},{}],19:[function(_dereq_,module,exports){
module.exports = function sign(number) {
	return number >= 0 ? 1 : -1;
};

},{}],20:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;

var isPrimitive = _dereq_('./helpers/isPrimitive');

var isCallable = _dereq_('is-callable');

// https://es5.github.io/#x8.12
var ES5internalSlots = {
	'[[DefaultValue]]': function (O, hint) {
		var actualHint = hint || (toStr.call(O) === '[object Date]' ? String : Number);

		if (actualHint === String || actualHint === Number) {
			var methods = actualHint === String ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
			var value, i;
			for (i = 0; i < methods.length; ++i) {
				if (isCallable(O[methods[i]])) {
					value = O[methods[i]]();
					if (isPrimitive(value)) {
						return value;
					}
				}
			}
			throw new TypeError('No default value');
		}
		throw new TypeError('invalid [[DefaultValue]] hint supplied');
	}
};

// https://es5.github.io/#x9
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	return ES5internalSlots['[[DefaultValue]]'](input, PreferredType);
};

},{"./helpers/isPrimitive":22,"is-callable":36}],21:[function(_dereq_,module,exports){
'use strict';

var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

var isPrimitive = _dereq_('./helpers/isPrimitive');
var isCallable = _dereq_('is-callable');
var isDate = _dereq_('is-date-object');
var isSymbol = _dereq_('is-symbol');

var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
	if (typeof O === 'undefined' || O === null) {
		throw new TypeError('Cannot call method on ' + O);
	}
	if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
		throw new TypeError('hint must be "string" or "number"');
	}
	var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
	var method, result, i;
	for (i = 0; i < methodNames.length; ++i) {
		method = O[methodNames[i]];
		if (isCallable(method)) {
			result = method.call(O);
			if (isPrimitive(result)) {
				return result;
			}
		}
	}
	throw new TypeError('No default value');
};

var GetMethod = function GetMethod(O, P) {
	var func = O[P];
	if (func !== null && typeof func !== 'undefined') {
		if (!isCallable(func)) {
			throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
		}
		return func;
	}
};

// http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive
module.exports = function ToPrimitive(input, PreferredType) {
	if (isPrimitive(input)) {
		return input;
	}
	var hint = 'default';
	if (arguments.length > 1) {
		if (PreferredType === String) {
			hint = 'string';
		} else if (PreferredType === Number) {
			hint = 'number';
		}
	}

	var exoticToPrim;
	if (hasSymbols) {
		if (Symbol.toPrimitive) {
			exoticToPrim = GetMethod(input, Symbol.toPrimitive);
		} else if (isSymbol(input)) {
			exoticToPrim = Symbol.prototype.valueOf;
		}
	}
	if (typeof exoticToPrim !== 'undefined') {
		var result = exoticToPrim.call(input, hint);
		if (isPrimitive(result)) {
			return result;
		}
		throw new TypeError('unable to convert exotic object to primitive');
	}
	if (hint === 'default' && (isDate(input) || isSymbol(input))) {
		hint = 'string';
	}
	return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
};

},{"./helpers/isPrimitive":22,"is-callable":36,"is-date-object":37,"is-symbol":52}],22:[function(_dereq_,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"dup":17}],23:[function(_dereq_,module,exports){
/**
 * @file This method returns the index of the first element in the array that satisfies the provided testing function.
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module find-index-x
 */

'use strict';

var toLength = _dereq_('to-length-x');
var toObject = _dereq_('to-object-x');
var isString = _dereq_('is-string');
var assertIsFunction = _dereq_('assert-is-function-x');
var pFindIndex = Array.prototype.findIndex;

// eslint-disable-next-line no-sparse-arrays
var implemented = pFindIndex && ([, 1].findIndex(function (item, idx) {
  return idx === 0;
}) === 0);

var findIdx;
if (implemented) {
  findIdx = function findIndex(array, callback) {
    var object = toObject(array);
    assertIsFunction(callback);
    var args = [callback];
    if (arguments.length > 2) {
      args.push(arguments[2]);
    }

    return pFindIndex.apply(object, args);
  };
} else {
  findIdx = function findIndex(array, callback) {
    var object = toObject(array);
    assertIsFunction(callback);
    var length = toLength(object.length);
    if (length < 1) {
      return -1;
    }

    var thisArg;
    if (arguments.length > 2) {
      thisArg = arguments[2];
    }

    var isStr = isString(object);
    var index = 0;
    while (index < length) {
      var item = isStr ? object.charAt(index) : object[index];
      if (callback.call(thisArg, item, index, object)) {
        return index;
      }

      index += 1;
    }

    return -1;
  };
}

/**
 * Like `findIndex`, this method returns an index in the array, if an element
 * in the array satisfies the provided testing function. Otherwise -1 is returned.
 *
 * @param {Array} array - The array to search.
 * @throws {TypeError} If array is `null` or `undefined`-
 * @param {Function} callback - Function to execute on each value in the array,
 *  taking three arguments: `element`, `index` and `array`.
 * @throws {TypeError} If `callback` is not a function.
 * @param {*} [thisArg] - Object to use as `this` when executing `callback`.
 * @returns {number} Returns index of positively tested element, otherwise -1.
 * @example
 * var findIndex = require('find-index-x');
 *
 * function isPrime(element, index, array) {
 *   var start = 2;
 *   while (start <= Math.sqrt(element)) {
 *     if (element % start++ < 1) {
 *       return false;
 *     }
 *   }
 *   return element > 1;
 * }
 *
 * console.log(findIndex([4, 6, 8, 12, 14], isPrime)); // -1, not found
 * console.log(findIndex([4, 6, 7, 12, 13], isPrime)); // 2
 */
module.exports = findIdx;

},{"assert-is-function-x":7,"is-string":50,"to-length-x":71,"to-object-x":72}],24:[function(_dereq_,module,exports){
var isFunction = _dereq_('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":40}],25:[function(_dereq_,module,exports){

var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

module.exports = function forEach (obj, fn, ctx) {
    if (toString.call(fn) !== '[object Function]') {
        throw new TypeError('iterator must be a function');
    }
    var l = obj.length;
    if (l === +l) {
        for (var i = 0; i < l; i++) {
            fn.call(ctx, obj[i], i, obj);
        }
    } else {
        for (var k in obj) {
            if (hasOwn.call(obj, k)) {
                fn.call(ctx, obj[k], k, obj);
            }
        }
    }
};


},{}],26:[function(_dereq_,module,exports){
var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],27:[function(_dereq_,module,exports){
var implementation = _dereq_('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":26}],28:[function(_dereq_,module,exports){
/**
 * @file Get the name of the function.
 * @version 2.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module get-function-name-x
 */

'use strict';

var isFunctionLike;
try {
  // eslint-disable-next-line no-new-func
  new Function('"use strict"; return class My {};')();
  isFunctionLike = function _isFunctionLike(value) {
    return typeof value === 'function';
  };
} catch (ignore) {
  isFunctionLike = _dereq_('is-function-x');
}

var getFnName;
var t = function test1() {};
if (t.name === 'test1') {
  // eslint-disable-next-line no-new-func
  var test2 = new Function();
  if (test2.name === 'anonymous') {
    getFnName = function getName(fn) {
      return fn.name === 'anonymous' ? '' : fn.name;
    };
  } else {
    getFnName = function getName(fn) {
      return fn.name;
    };
  }
} else {
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var fToString = Function.prototype.toString;
  var s = _dereq_('white-space-x').string;
  var x = '^[' + s + ']*(?:async)?[' + s + ']*(?:function|class)[' + s + ']*\\*?[' + s + ']+([\\w\\$]+)[' + s + ']*';
  var reName = new RegExp(x, 'i');
  getFnName = function getName(fn) {
    var match;
    try {
      var str = fToString.call(fn).replace(STRIP_COMMENTS, ' ');
      match = str.match(reName);
    } catch (e) {}

    if (match) {
      var name = match[1];
      return name === 'anonymous' ? '' : name;
    }

    return '';
  };
}

/**
 * This method returns the name of the function, or `undefined` if not
 * a function.
 *
 * @param {Function} fn - The function to get the name of.
 * @returns {undefined|string} The name of the function,  or `undefined` if
 *  not a function.
 * @example
 * var getFunctionName = require('get-function-name-x');
 *
 * getFunctionName(); // undefined
 * getFunctionName(Number.MIN_VALUE); // undefined
 * getFunctionName('abc'); // undefined
 * getFunctionName(true); // undefined
 * getFunctionName({ name: 'abc' }); // undefined
 * getFunctionName(function () {}); // ''
 * getFunctionName(new Function ()); // ''
 * getFunctionName(function test1() {}); // 'test1'
 * getFunctionName(function* test2() {}); // 'test2'
 * getFunctionName(class Test {}); // 'Test'
 */
module.exports = function getFunctionName(fn) {
  if (isFunctionLike(fn) === false) {
    return void 0;
  }

  return getFnName ? getFnName(fn) : fn.name;
};

},{"is-function-x":39,"white-space-x":75}],29:[function(_dereq_,module,exports){
/**
 * @file Used to determine whether an object has an own property with the specified property key.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-hasownproperty|7.3.11 HasOwnProperty (O, P)}
 * @version 2.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-own-property-x
 */

'use strict';

var toObject = _dereq_('to-object-x');
var toPrimitive = _dereq_('es-to-primitive/es6');
var safeToString = _dereq_('safe-to-string-x');
var isSymbol = _dereq_('is-symbol');
var hop = Object.prototype.hasOwnProperty;

/**
 * The `hasOwnProperty` method returns a boolean indicating whether
 * the `object` has the specified `property`. Does not attempt to fix known
 * issues in older browsers, but does ES6ify the method.
 *
 * @param {!Object} object - The object to test.
 * @param {string|Symbol} property - The name or Symbol of the property to test.
 * @returns {boolean} `true` if the property is set on `object`, else `false`.
 * @example
 * var hasOwnProperty = require('has-own-property-x');
 * var o = {
 *   foo: 'bar'
 * };
 *
 *
 * hasOwnProperty(o, 'bar'); // false
 * hasOwnProperty(o, 'foo'); // true
 * hasOwnProperty(undefined, 'foo');
 *                   // TypeError: Cannot convert undefined or null to object
 */
module.exports = function hasOwnProperty(object, property) {
  var prop = isSymbol(property) ? property : safeToString(toPrimitive(property, String));

  return hop.call(toObject(object), prop);
};

},{"es-to-primitive/es6":21,"is-symbol":52,"safe-to-string-x":67,"to-object-x":72}],30:[function(_dereq_,module,exports){
/**
 * @file Tests if ES6 Symbol is supported.
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-symbol-support-x
 */

'use strict';

/**
 * Indicates if `Symbol`exists and creates the correct type.
 * `true`, if it exists and creates the correct type, otherwise `false`.
 *
 * @type boolean
 */
module.exports = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';

},{}],31:[function(_dereq_,module,exports){
/**
 * @file Tests if ES6 @@toStringTag is supported.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-@@tostringtag|26.3.1 @@toStringTag}
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-to-string-tag-x
 */

'use strict';

/**
 * Indicates if `Symbol.toStringTag`exists and is the correct type.
 * `true`, if it exists and is the correct type, otherwise `false`.
 *
 * @type boolean
 */
module.exports = _dereq_('has-symbol-support-x') && typeof Symbol.toStringTag === 'symbol';

},{"has-symbol-support-x":30}],32:[function(_dereq_,module,exports){
var bind = _dereq_('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":27}],33:[function(_dereq_,module,exports){
/**
 * @file An extended ES6 indexOf.
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module index-of-x
 */

'use strict';

var $isNaN = _dereq_('is-nan');
var isString = _dereq_('is-string');
var toInteger = _dereq_('to-integer-x');
var toObject = _dereq_('to-object-x');
var toLength = _dereq_('to-length-x');
var sameValueZero = _dereq_('same-value-zero-x');
var safeToString = _dereq_('safe-to-string-x');
var sameValue = _dereq_('object-is');
var findIndex = _dereq_('find-index-x');
var pIndexOf = Array.prototype.indexOf;

if (typeof pIndexOf !== 'function' || [0, 1].indexOf(1, 2) !== -1) {
  var boxedString = Object('a');
  var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

  pIndexOf = function indexOf(searchElement) {
    // eslint-disable-next-line no-invalid-this
    var self = splitString && isString(this) ? this.split('') : toObject(this);
    var length = toLength(self.length);

    if (length < 1) {
      return -1;
    }

    var i = 0;
    if (arguments.length > 1) {
      i = toInteger(arguments[1]);
    }

    // handle negative indices
    i = i >= 0 ? i : Math.max(0, length + i);
    while (i < length) {
      if (i in self && self[i] === searchElement) {
        return i;
      }

      i += 1;
    }

    return -1;
  };
}

/**
 * This method returns an index in the array, if an element in the array
 * satisfies the provided testing function. Otherwise -1 is returned.
 *
 * @private
 * @param {Array} object - The array to search.
 * @param {*} searchElement - Element to locate in the array.
 * @param {number} fromIndex - The index to start the search at.
 * @param {Function} extendFn - The comparison function to use.
 * @returns {number} Returns index of found element, otherwise -1.
 */
// eslint-disable-next-line max-params
var findIdxFrom = function findIndexFrom(object, searchElement, fromIndex, extendFn) {
  var fIdx = fromIndex;
  var isStr = isString(object);
  var length = toLength(object.length);
  while (fIdx < length) {
    if (fIdx in object) {
      var element = isStr ? object.charAt(fIdx) : object[fIdx];
      if (extendFn(element, searchElement)) {
        return fIdx;
      }
    }

    fIdx += 1;
  }

  return -1;
};

/**
 * This method returns the first index at which a given element can be found
 * in the array, or -1 if it is not present.
 *
 * @param {Array} array - The array to search.
 * @throws {TypeError} If `array` is `null` or `undefined`.
 * @param {*} searchElement - Element to locate in the `array`.
 * @param {number} [fromIndex] - The index to start the search at. If the
 *  index is greater than or equal to the array's length, -1 is returned,
 *  which means the array will not be searched. If the provided index value is
 *  a negative number, it is taken as the offset from the end of the array.
 *  Note: if the provided index is negative, the array is still searched from
 *  front to back. If the calculated index is less than 0, then the whole
 *  array will be searched. Default: 0 (entire array is searched).
 * @param {string} [extend] - Extension type: `SameValue` or `SameValueZero`.
 * @returns {number} Returns index of found element, otherwise -1.
 * @example
 * var indexOf = require('index-of-x');
 * var subject = [2, 3, undefined, true, 'hej', null, 2, false, 0, -0, NaN];
 *
 * // Standard mode, operates just like `Array.prototype.indexOf`.
 * indexOf(subject, null); // 5
 * indexOf(testSubject, '2'); // -1
 * indexOf(testSubject, NaN); // -1
 * indexOf(testSubject, -0); // 8
 * indexOf(testSubject, 2, 2); //6
 *
 * // `SameValueZero` mode extends `indexOf` to match `NaN`.
 * indexOf(subject, null, 'SameValueZero'); // 5
 * indexOf(testSubject, '2', 'SameValueZero'); // -1
 * indexOf(testSubject, NaN, 'SameValueZero'); // 10
 * indexOf(testSubject, -0, 'SameValueZero'); // 8
 * indexOf(testSubject, 2, 2, 'SameValueZero'); //6
 *
 * // `SameValue` mode extends `indexOf` to match `NaN` and signed `0`.
 * indexOf(subject, null, 'SameValue'); // 5
 * indexOf(testSubject, '2', 'SameValue'); // -1
 * indexOf(testSubject, NaN, 'SameValue'); // 10
 * indexOf(testSubject, -0, 'SameValue'); // 9
 * indexOf(testSubject, 2, 2, 'SameValue'); //6
 */
module.exports = function indexOf(array, searchElement) {
  var object = toObject(array);
  var length = toLength(object.length);
  if (length < 1) {
    return -1;
  }

  var args = [searchElement];
  var extend;
  if (arguments.length > 2) {
    if (arguments.length > 3) {
      args.push(arguments[2]);
      extend = arguments[3];
    } else if (isString(arguments[2])) {
      extend = safeToString(arguments[2]);
    }
  }

  var extendFn;
  if (isString(extend)) {
    extend = extend.toLowerCase();
    if (extend === 'samevalue') {
      extendFn = sameValue;
    } else if (extend === 'samevaluezero') {
      extendFn = sameValueZero;
    }
  }

  if (extendFn && (searchElement === 0 || $isNaN(searchElement))) {
    var fromIndex = toInteger(arguments[2]);
    if (fromIndex < length) {
      if (fromIndex < 0) {
        fromIndex = length - Math.abs(fromIndex);
        if (fromIndex < 0) {
          fromIndex = 0;
        }
      }
    }

    if (fromIndex > 0) {
      return findIdxFrom(object, searchElement, fromIndex, extendFn);
    }

    return findIndex(object, function (element, index) {
      return index in object && extendFn(searchElement, element);
    });
  }

  if (Boolean(extendFn) === false && args.length === 1 && arguments.length === 3) {
    args.push(arguments[2]);
  }

  return pIndexOf.apply(object, args);
};

},{"find-index-x":23,"is-nan":42,"is-string":50,"object-is":62,"safe-to-string-x":67,"same-value-zero-x":68,"to-integer-x":70,"to-length-x":71,"to-object-x":72}],34:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;

var isStandardArguments = function isArguments(value) {
	return toStr.call(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		toStr.call(value) !== '[object Array]' &&
		toStr.call(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

},{}],35:[function(_dereq_,module,exports){
/**
 * @file Determine if a value is array like.
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-array-like-x
 */

'use strict';

var isNil = _dereq_('is-nil-x');
var isFunction = _dereq_('is-function-x');
var isLength = _dereq_('lodash.islength');

/**
 * Checks if value is array-like. A value is considered array-like if it's
 * not a function and has a `length` that's an integer greater than or
 * equal to 0 and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @param {*} value - The object to be tested.
 * @returns {boolean} Returns `true` if subject is array-like, else `false`.
 * @example
 * var isArrayLike = require('is-array-like-x');
 *
 * isArrayLike([1, 2, 3]); // true
 * isArrayLike(document.body.children); // true
 * isArrayLike('abc'); // true
 * isArrayLike(_.noop); // false
 */
module.exports = function isArrayLike(value) {
  return isNil(value) === false && isFunction(value) === false && isLength(value.length);
};

},{"is-function-x":39,"is-nil-x":45,"lodash.islength":55}],36:[function(_dereq_,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;

var constructorRegex = /^\s*class /;
var isES6ClassFn = function isES6ClassFn(value) {
	try {
		var fnStr = fnToStr.call(value);
		var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
		var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
		var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
		return constructorRegex.test(spaceStripped);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionObject(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isCallable(value) {
	if (!value) { return false; }
	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
	if (hasToStringTag) { return tryFunctionObject(value); }
	if (isES6ClassFn(value)) { return false; }
	var strClass = toStr.call(value);
	return strClass === fnClass || strClass === genClass;
};

},{}],37:[function(_dereq_,module,exports){
'use strict';

var getDay = Date.prototype.getDay;
var tryDateObject = function tryDateObject(value) {
	try {
		getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var toStr = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) { return false; }
	return hasToStringTag ? tryDateObject(value) : toStr.call(value) === dateClass;
};

},{}],38:[function(_dereq_,module,exports){
/**
 * @file ES6-compliant shim for Number.isFinite.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-number.isfinite|20.1.2.2 Number.isFinite ( number )}
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-finite-x
 */

'use strict';

var $isNaN = _dereq_('is-nan');

var $isFinite;
if (typeof Number.isFinite === 'function') {
  var MAX_SAFE_INTEGER = _dereq_('max-safe-integer');
  try {
    if (Number.isFinite(MAX_SAFE_INTEGER) && Number.isFinite(Infinity) === false) {
      $isFinite = Number.isFinite;
    }
  } catch (ignore) {}
}

/**
 * This method determines whether the passed value is a finite number.
 *
 * @param {*} number - The value to be tested for finiteness.
 * @returns {boolean} A Boolean indicating whether or not the given value is a finite number.
 * @example
 * var numIsFinite = require('is-finite-x');
 *
 * numIsFinite(Infinity);  // false
 * numIsFinite(NaN);       // false
 * numIsFinite(-Infinity); // false
 *
 * numIsFinite(0);         // true
 * numIsFinite(2e64);      // true
 *
 * numIsFinite('0');       // false, would've been true with
 *                         // global isFinite('0')
 * numIsFinite(null);      // false, would've been true with
 */
module.exports = $isFinite || function isFinite(number) {
  return !(typeof number !== 'number' || $isNaN(number) || number === Infinity || number === -Infinity);
};

},{"is-nan":42,"max-safe-integer":58}],39:[function(_dereq_,module,exports){
/**
 * @file Determine whether a given value is a function object.
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-function-x
 */

'use strict';

var fToString = Function.prototype.toString;
var toStringTag = _dereq_('to-string-tag-x');
var hasToStringTag = _dereq_('has-to-string-tag-x');
var isPrimitive = _dereq_('is-primitive');
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var asyncTag = '[object AsyncFunction]';

var constructorRegex = /^\s*class /;
var isES6ClassFn = function isES6ClassFunc(value) {
  try {
    var fnStr = fToString.call(value);
    var singleStripped = fnStr.replace(/\/\/.*\n/g, '');
    var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, '');
    var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' ');
    return constructorRegex.test(spaceStripped);
  } catch (ignore) {}

  return false; // not a function
};

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @private
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 * else `false`.
 */
var tryFuncToString = function funcToString(value) {
  try {
    if (isES6ClassFn(value)) {
      return false;
    }

    fToString.call(value);
    return true;
  } catch (ignore) {}

  return false;
};

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 * else `false`.
 * @example
 * var isFunction = require('is-function-x');
 *
 * isFunction(); // false
 * isFunction(Number.MIN_VALUE); // false
 * isFunction('abc'); // false
 * isFunction(true); // false
 * isFunction({ name: 'abc' }); // false
 * isFunction(function () {}); // true
 * isFunction(new Function ()); // true
 * isFunction(function* test1() {}); // true
 * isFunction(function test2(a, b) {}); // true
 - isFunction(async function test3() {}); // true
 * isFunction(class Test {}); // false
 * isFunction((x, y) => {return this;}); // true
 */
module.exports = function isFunction(value) {
  if (isPrimitive(value)) {
    return false;
  }

  if (hasToStringTag) {
    return tryFuncToString(value);
  }

  if (isES6ClassFn(value)) {
    return false;
  }

  var strTag = toStringTag(value);
  return strTag === funcTag || strTag === genTag || strTag === asyncTag;
};

},{"has-to-string-tag-x":31,"is-primitive":47,"to-string-tag-x":73}],40:[function(_dereq_,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],41:[function(_dereq_,module,exports){
'use strict';

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

module.exports = function isNaN(value) {
	return value !== value;
};

},{}],42:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');

var implementation = _dereq_('./implementation');
var getPolyfill = _dereq_('./polyfill');
var shim = _dereq_('./shim');

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

define(implementation, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = implementation;

},{"./implementation":41,"./polyfill":43,"./shim":44,"define-properties":11}],43:[function(_dereq_,module,exports){
'use strict';

var implementation = _dereq_('./implementation');

module.exports = function getPolyfill() {
	if (Number.isNaN && Number.isNaN(NaN) && !Number.isNaN('a')) {
		return Number.isNaN;
	}
	return implementation;
};

},{"./implementation":41}],44:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');
var getPolyfill = _dereq_('./polyfill');

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

module.exports = function shimNumberIsNaN() {
	var polyfill = getPolyfill();
	define(Number, { isNaN: polyfill }, { isNaN: function () { return Number.isNaN !== polyfill; } });
	return polyfill;
};

},{"./polyfill":43,"define-properties":11}],45:[function(_dereq_,module,exports){
/**
 * @file Checks if `value` is `null` or `undefined`.
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-nil-x
 */

'use strict';

var isUndefined = _dereq_('validate.io-undefined');
var isNull = _dereq_('lodash.isnull');

/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
 * @example
 * var isNil = require('is-nil-x');
 *
 * isNil(null); // => true
 * isNil(void 0); // => true
 * isNil(NaN); // => false
 */
module.exports = function isNil(value) {
  return isNull(value) || isUndefined(value);
};

},{"lodash.isnull":56,"validate.io-undefined":74}],46:[function(_dereq_,module,exports){
/**
 * @file Determine if a value is object like.
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-object-like-x
 */

'use strict';

var isFunction = _dereq_('is-function-x');
var isPrimitive = _dereq_('is-primitive');

/**
 * Checks if `value` is object-like. A value is object-like if it's not a
 * primitive and not a function.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 * var isObjectLike = require('is-object-like-x');
 *
 * isObjectLike({});
 * // => true
 *
 * isObjectLike([1, 2, 3]);
 * // => true
 *
 * isObjectLike(_.noop);
 * // => false
 *
 * isObjectLike(null);
 * // => false
 */
module.exports = function isObjectLike(value) {
  return isPrimitive(value) === false && isFunction(value) === false;
};

},{"is-function-x":39,"is-primitive":47}],47:[function(_dereq_,module,exports){
/*!
 * is-primitive <https://github.com/jonschlinkert/is-primitive>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

// see http://jsperf.com/testing-value-is-primitive/7
module.exports = function isPrimitive(value) {
  return value == null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],48:[function(_dereq_,module,exports){
'use strict';

var has = _dereq_('has');
var regexExec = RegExp.prototype.exec;
var gOPD = Object.getOwnPropertyDescriptor;

var tryRegexExecCall = function tryRegexExec(value) {
	try {
		var lastIndex = value.lastIndex;
		value.lastIndex = 0;

		regexExec.call(value);
		return true;
	} catch (e) {
		return false;
	} finally {
		value.lastIndex = lastIndex;
	}
};
var toStr = Object.prototype.toString;
var regexClass = '[object RegExp]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isRegex(value) {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if (!hasToStringTag) {
		return toStr.call(value) === regexClass;
	}

	var descriptor = gOPD(value, 'lastIndex');
	var hasLastIndexDataProperty = descriptor && has(descriptor, 'value');
	if (!hasLastIndexDataProperty) {
		return false;
	}

	return tryRegexExecCall(value);
};

},{"has":32}],49:[function(_dereq_,module,exports){
'use strict';
var MAX_SAFE_INTEGER = _dereq_('max-safe-integer');

module.exports = Number.isSafeInteger || function (val) {
	return typeof val === 'number' && val === val && val !== Infinity && val !== -Infinity && parseInt(val, 10) === val && Math.abs(val) <= MAX_SAFE_INTEGER;
};

},{"max-safe-integer":58}],50:[function(_dereq_,module,exports){
'use strict';

var strValue = String.prototype.valueOf;
var tryStringObject = function tryStringObject(value) {
	try {
		strValue.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var strClass = '[object String]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isString(value) {
	if (typeof value === 'string') { return true; }
	if (typeof value !== 'object') { return false; }
	return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass;
};

},{}],51:[function(_dereq_,module,exports){
/**
 * @file Tests if 2 characters together are a surrogate pair.
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-surrogate-pair-x
 */

'use strict';

var isString = _dereq_('is-string');

/**
 * Tests if the two character arguments combined are a valid UTF-16
 * surrogate pair.
 *
 * @param {*} char1 - The first character of a suspected surrogate pair.
 * @param {*} char2 - The second character of a suspected surrogate pair.
 * @returns {boolean} Returns true if the two characters create a valid
 *  'UTF-16' surrogate pair; otherwise false.
 * @example
 * var isSurrogatePair = require('is-surrogate-pair-x');
 *
 * var test1 = 'a';
 * var test2 = '𠮟';
 *
 * isSurrogatePair(test1.charAt(0), test1.charAt(1)); // false
 * isSurrogatePair(test2.charAt(0), test2.charAt(1)); // true
 */
module.exports = function isSurrogatePair(char1, char2) {
  if (isString(char1) && char1.length === 1 && isString(char2) && char2.length === 1) {
    var code1 = char1.charCodeAt();
    if (code1 >= 0xD800 && code1 <= 0xDBFF) {
      var code2 = char2.charCodeAt();
      if (code2 >= 0xDC00 && code2 <= 0xDFFF) {
        return true;
      }
    }
  }

  return false;
};

},{"is-string":50}],52:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

if (hasSymbols) {
	var symToStr = Symbol.prototype.toString;
	var symStringRegex = /^Symbol\(.*\)$/;
	var isSymbolObject = function isSymbolObject(value) {
		if (typeof value.valueOf() !== 'symbol') { return false; }
		return symStringRegex.test(symToStr.call(value));
	};
	module.exports = function isSymbol(value) {
		if (typeof value === 'symbol') { return true; }
		if (toStr.call(value) !== '[object Symbol]') { return false; }
		try {
			return isSymbolObject(value);
		} catch (e) {
			return false;
		}
	};
} else {
	module.exports = function isSymbol(value) {
		// this environment does not support Symbols.
		return false;
	};
}

},{}],53:[function(_dereq_,module,exports){
/*!
 * is-var-name | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/is-var-name
*/

module.exports = function isVarName(str) {
  'use strict';

  if (typeof str !== 'string') {
    return false;
  }

  try {
    new Function('var ' + str)();
  } catch (e) {
    return false;
  }
  return true;
};

},{}],54:[function(_dereq_,module,exports){
(function (global){
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],55:[function(_dereq_,module,exports){
/**
 * lodash 4.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],56:[function(_dereq_,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Checks if `value` is `null`.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
 * @example
 *
 * _.isNull(null);
 * // => true
 *
 * _.isNull(void 0);
 * // => false
 */
function isNull(value) {
  return value === null;
}

module.exports = isNull;

},{}],57:[function(_dereq_,module,exports){
/**
 * @file ES6-compliant shim for Math.sign.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-math.sign|20.2.2.29 Math.sign(x)}
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module math-sign-x
 */

'use strict';

var $isNaN = _dereq_('is-nan');

var $sign;
if (typeof Math.sign === 'function') {
  try {
    if (Math.sign(10) === 1 && Math.sign(-10) === -1 && Math.sign(0) === 0) {
      $sign = Math.sign;
    }
  } catch (ignore) {}
}

/**
 * This method returns the sign of a number, indicating whether the number is positive,
 * negative or zero.
 *
 * @param {*} x - A number.
 * @returns {number} A number representing the sign of the given argument. If the argument
 * is a positive number, negative number, positive zero or negative zero, the function will
 * return 1, -1, 0 or -0 respectively. Otherwise, NaN is returned.
 * @example
 * var mathSign = require('math-sign-x');
 *
 * mathSign(3);     //  1
 * mathSign(-3);    // -1
 * mathSign('-3');  // -1
 * mathSign(0);     //  0
 * mathSign(-0);    // -0
 * mathSign(NaN);   // NaN
 * mathSign('foo'); // NaN
 * mathSign();      // NaN
 */
module.exports = $sign || function sign(x) {
  var n = Number(x);
  if (n === 0 || $isNaN(n)) {
    return n;
  }

  return n > 0 ? 1 : -1;
};

},{"is-nan":42}],58:[function(_dereq_,module,exports){
'use strict';
module.exports = 9007199254740991;

},{}],59:[function(_dereq_,module,exports){
/**
 * @file Sham for Object.create
 * @version 1.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-create-x
 */

/* global ActiveXObject */

'use strict';

var isPrimitive = _dereq_('is-primitive');
var isUndefined = _dereq_('validate.io-undefined');
var isNull = _dereq_('lodash.isnull');
var $defineProperties = _dereq_('object-define-properties-x');
var $create = Object.create;

// ES5 15.2.3.5
// http://es5.github.com/#x15.2.3.5
if (Boolean($create) === false) {

  // Contributed by Brandon Benvie, October, 2012
  var createEmpty;
  var supportsProto = ({ __proto__: null } instanceof Object) === false;
  // the following produces false positives
  // in Opera Mini => not a reliable check
  // Object.prototype.__proto__ === null

  // Check for document.domain and active x support
  // No need to use active x approach when document.domain is not set
  // see https://github.com/es-shims/es5-shim/issues/150
  // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
  var shouldUseActiveX = function _shouldUseActiveX() {
    // return early if document.domain not set
    if (Boolean(document.domain) === false) {
      return false;
    }

    try {
      return Boolean(new ActiveXObject('htmlfile'));
    } catch (exception) {
      return false;
    }
  };

  // This supports IE8 when document.domain is used
  // see https://github.com/es-shims/es5-shim/issues/150
  // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
  var getEmptyViaActiveX = function _getEmptyViaActiveX() {
    var empty;
    var xDoc;

    xDoc = new ActiveXObject('htmlfile');

    var script = 'script';
    xDoc.write('<' + script + '></' + script + '>');
    xDoc.close();

    empty = xDoc.parentWindow.Object.prototype;
    xDoc = null;

    return empty;
  };

  // The original implementation using an iframe
  // before the activex approach was added
  // see https://github.com/es-shims/es5-shim/issues/150
  var getEmptyViaIFrame = function _getEmptyViaIFrame() {
    var iframe = document.createElement('iframe');
    var parent = document.body || document.documentElement;
    var empty;

    iframe.style.display = 'none';
    parent.appendChild(iframe);
    // eslint-disable-next-line no-script-url
    iframe.src = 'javascript:';

    empty = iframe.contentWindow.Object.prototype;
    parent.removeChild(iframe);
    iframe = null;

    return empty;
  };

  if (supportsProto || typeof document === 'undefined') {
    createEmpty = function () {
      return { __proto__: null };
    };
  } else {
    // In old IE __proto__ can't be used to manually set `null`, nor does
    // any other method exist to make an object that inherits from nothing,
    // aside from Object.prototype itself. Instead, create a new global
    // object and *steal* its Object.prototype and strip it bare. This is
    // used as the prototype to create nullary objects.
    createEmpty = function () {
      // Determine which approach to use
      // see https://github.com/es-shims/es5-shim/issues/150
      var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();

      delete empty.constructor;
      delete empty.hasOwnProperty;
      delete empty.propertyIsEnumerable;
      delete empty.isPrototypeOf;
      delete empty.toLocaleString;
      delete empty.toString;
      delete empty.valueOf;

      var E = function Empty() {};
      E.prototype = empty;
      // short-circuit future calls
      createEmpty = function () {
        return new E();
      };

      return new E();
    };
  }

  $create = function create(prototype, properties) {

    var object;
    var T = function Type() {}; // An empty constructor.

    if (isNull(prototype)) {
      object = createEmpty();
    } else {
      if (isNull(prototype) === false && isPrimitive(prototype)) {
        // In the native implementation `parent` can be `null`
        // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
        // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
        // like they are in modern browsers. Using `Object.create` on DOM elements
        // is...err...probably inappropriate, but the native version allows for it.
        throw new TypeError('Object prototype may only be an Object or null'); // same msg as Chrome
      }

      T.prototype = prototype;
      object = new T();
      // IE has no built-in implementation of `Object.getPrototypeOf`
      // neither `__proto__`, but this manually setting `__proto__` will
      // guarantee that `Object.getPrototypeOf` will work as expected with
      // objects created using `Object.create`
      // eslint-disable-next-line no-proto
      object.__proto__ = prototype;
    }

    if (isUndefined(properties) === false) {
      $defineProperties(object, properties);
    }

    return object;
  };
}

/**
 * This method method creates a new object with the specified prototype object and properties.
 *
 * @param {*} prototype - The object which should be the prototype of the newly-created object.
 * @param {*} [properties] - If specified and not undefined, an object whose enumerable own properties
 * (that is, those properties defined upon itself and not enumerable properties along its prototype chain)
 * specify property descriptors to be added to the newly-created object, with the corresponding property names.
 * @throws {TypeError} If the properties parameter isn't null or an object.
 * @returns {boolean} A new object with the specified prototype object and properties.
 * @example
 * var create = require('object-create-x');
 *
 * // Shape - superclass
 * function Shape() {
 *   this.x = 0;
 *   this.y = 0;
 * }
 *
 * // superclass method
 * Shape.prototype.move = function(x, y) {
 *   this.x += x;
 *   this.y += y;
 *   console.info('Shape moved.');
 * };
 *
 * // Rectangle - subclass
 * function Rectangle() {
 *   Shape.call(this); // call super constructor.
 * }
 *
 * // subclass extends superclass
 * Rectangle.prototype = create(Shape.prototype);
 * Rectangle.prototype.constructor = Rectangle;
 *
 * var rect = new Rectangle();
 *
 * console.log('Is rect an instance of Rectangle?',
 *   rect instanceof Rectangle); // true
 * console.log('Is rect an instance of Shape?',
 *   rect instanceof Shape); // true
 * rect.move(1, 1); // Outputs, 'Shape moved.'
 */
module.exports = $create;

},{"is-primitive":47,"lodash.isnull":56,"object-define-properties-x":60,"validate.io-undefined":74}],60:[function(_dereq_,module,exports){
/**
 * @file Sham for Object.defineProperties
 * @version 2.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-define-properties-x
 */

'use strict';

var forEach = _dereq_('for-each');
var $keys = _dereq_('object-keys-x');
var $defineProperty = _dereq_('object-define-property-x');
var $defineProperties = Object.defineProperties;
var definePropertiesFallback;

// ES5 15.2.3.6
// http://es5.github.com/#x15.2.3.6

// Patch for WebKit and IE8 standard mode
// Designed by hax <hax.github.com>
// related issue: https://github.com/es-shims/es5-shim/issues#issue/5
// IE8 Reference:
//     http://msdn.microsoft.com/en-us/library/dd282900.aspx
//     http://msdn.microsoft.com/en-us/library/dd229916.aspx
// WebKit Bugs:
//     https://bugs.webkit.org/show_bug.cgi?id=36423

var doesDefinePropertyWork = function _doesDefinePropertyWork(object) {
  try {
    $defineProperty(object, 'sentinel', {});
    return 'sentinel' in object;
  } catch (exception) {
    return false;
  }
};

// check whether defineProperty works if it's given. Otherwise,
// shim partially.
if ($defineProperty) {
  // eslint-disable-next-line id-length
  var definePropertyWorksOnObject = doesDefinePropertyWork({});
  var definePropertyWorksOnDom = typeof document === 'undefined' || doesDefinePropertyWork(document.createElement('div'));
  if (definePropertyWorksOnObject === false || definePropertyWorksOnDom === false) {
    definePropertiesFallback = Object.defineProperties;
  }
}

// ES5 15.2.3.7
// http://es5.github.com/#x15.2.3.7
if (Boolean($defineProperties) === false || definePropertiesFallback) {
  $defineProperties = function defineProperties(object, properties) {
    // make a valiant attempt to use the real defineProperties
    if (definePropertiesFallback) {
      try {
        return definePropertiesFallback.call(Object, object, properties);
      } catch (exception) {
        // try the shim if the real one doesn't work
      }
    }

    forEach($keys(properties), function (property) {
      if (property !== '__proto__') {
        $defineProperty(object, property, properties[property]);
      }
    });
    return object;
  };
}

/**
 * This method defines new or modifies existing properties directly on an object, returning the object.
 *
 * @param {Object} object - The object on which to define or modify properties.
 * @param {Object} properties - An object whose own enumerable properties constitute descriptors for the
 * properties to be defined or modified.
 * @returns {Object} The object that was passed to the function.
 * @example
 * var defineProperties = require('object-define-properties-x');
 *
 * var obj = {};
 * defineProperties(obj, {
 *   'property1': {
 *     value: true,
 *     writable: true
 *   },
 *   'property2': {
 *     value: 'Hello',
 *     writable: true
 *   }
 *   // etc. etc.
 * });
 */
module.exports = $defineProperties;

},{"for-each":24,"object-define-property-x":61,"object-keys-x":63}],61:[function(_dereq_,module,exports){
/**
 * @file Sham for Object.defineProperty
 * @version 2.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-define-property-x
 */

'use strict';

var isPrimitive = _dereq_('is-primitive');
var owns = _dereq_('has-own-property-x');
var $defineProperty = Object.defineProperty;

var prototypeOfObject = Object.prototype;
var definePropertyFallback;
// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
if (supportsAccessors) {
  /* eslint-disable no-underscore-dangle, no-restricted-properties */
  defineGetter = prototypeOfObject.__defineGetter__;
  defineSetter = prototypeOfObject.__defineSetter__;
  lookupGetter = prototypeOfObject.__lookupGetter__;
  lookupSetter = prototypeOfObject.__lookupSetter__;
  /* eslint-enable no-underscore-dangle, no-restricted-properties */
}

// ES5 15.2.3.6
// http://es5.github.com/#x15.2.3.6

// Patch for WebKit and IE8 standard mode
// Designed by hax <hax.github.com>
// related issue: https://github.com/es-shims/es5-shim/issues#issue/5
// IE8 Reference:
//     http://msdn.microsoft.com/en-us/library/dd282900.aspx
//     http://msdn.microsoft.com/en-us/library/dd229916.aspx
// WebKit Bugs:
//     https://bugs.webkit.org/show_bug.cgi?id=36423

var doesDefinePropertyWork = function _doesDefinePropertyWork(object) {
  try {
    $defineProperty(object, 'sentinel', {});
    return 'sentinel' in object;
  } catch (exception) {
    return false;
  }
};

// check whether defineProperty works if it's given. Otherwise,
// shim partially.
if ($defineProperty) {
  // eslint-disable-next-line id-length
  var definePropertyWorksOnObject = doesDefinePropertyWork({});
  var definePropertyWorksOnDom = typeof document === 'undefined' || doesDefinePropertyWork(document.createElement('div'));
  if (definePropertyWorksOnObject === false || definePropertyWorksOnDom === false) {
    definePropertyFallback = Object.defineProperty;
  }
}

if (Boolean($defineProperty) === false || definePropertyFallback) {
  var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
  var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
  // eslint-disable-next-line id-length
  var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';

  $defineProperty = function defineProperty(object, property, descriptor) {
    if (isPrimitive(object)) {
      throw new TypeError(ERR_NON_OBJECT_TARGET + object);
    }
    if (isPrimitive(descriptor)) {
      throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
    }
    // make a valiant attempt to use the real defineProperty
    // for I8's DOM elements.
    if (definePropertyFallback) {
      try {
        return definePropertyFallback.call(Object, object, property, descriptor);
      } catch (exception) {
        // try the shim if the real one doesn't work
      }
    }

    // If it's a data property.
    if ('value' in descriptor) {
      // fail silently if 'writable', 'enumerable', or 'configurable'
      // are requested but not supported
      /*
      // alternate approach:
      if ( // can't implement these features; allow false but not true
          ('writable' in descriptor && !descriptor.writable) ||
          ('enumerable' in descriptor && !descriptor.enumerable) ||
          ('configurable' in descriptor && !descriptor.configurable)
      ))
          throw new RangeError(
            'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
          );
      */

      if (supportsAccessors && (lookupGetter.call(object, property) || lookupSetter.call(object, property))) {
        // As accessors are supported only on engines implementing
        // `__proto__` we can safely override `__proto__` while defining
        // a property to make sure that we don't hit an inherited
        // accessor.
        /* eslint-disable no-proto */
        var prototype = object.__proto__;
        object.__proto__ = prototypeOfObject;
        // Deleting a property anyway since getter / setter may be
        // defined on object itself.
        delete object[property];
        object[property] = descriptor.value;
        // Setting original `__proto__` back now.
        object.__proto__ = prototype;
        /* eslint-enable no-proto */
      } else {
        object[property] = descriptor.value;
      }
    } else {
      var hasGetter = 'get' in descriptor;
      var hasSetter = 'set' in descriptor;
      if (supportsAccessors === false && (hasGetter || hasSetter)) {
        throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
      }
      // If we got that far then getters and setters can be defined !!
      if (hasGetter) {
        defineGetter.call(object, property, descriptor.get);
      }
      if (hasSetter) {
        defineSetter.call(object, property, descriptor.set);
      }
    }
    return object;
  };
}

/**
 * This method defines a new property directly on an object, or modifies an existing property on an object,
 * and returns the object.
 *
 * @param {Object} object - The object on which to define the property.
 * @param {string} property - The name of the property to be defined or modified.
 * @param {Object} descriptor - The descriptor for the property being defined or modified.
 * @returns {Object} The object that was passed to the function.
 * @example
 * var defineProperty = require('object-define-property-x');
 *
 * var o = {}; // Creates a new object
 *
 * Object.defineProperty(o, 'a', {
 *   value: 37,
 *   writable: true
 * });
 */
module.exports = $defineProperty;

},{"has-own-property-x":29,"is-primitive":47}],62:[function(_dereq_,module,exports){
"use strict";

/* https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.is */

var NumberIsNaN = function (value) {
	return value !== value;
};

module.exports = function is(a, b) {
	if (a === 0 && b === 0) {
		return 1 / a === 1 / b;
	} else if (a === b) {
		return true;
	} else if (NumberIsNaN(a) && NumberIsNaN(b)) {
		return true;
	}
	return false;
};


},{}],63:[function(_dereq_,module,exports){
/**
 * @file An ES6 Object.keys shim.
 * @version 1.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-keys-x
 */

'use strict';

var originalKeys = Object.keys;
var objectKeys;
var keysWorksWithArguments;
var keysHasArgumentsLengthBug;
var worksWithPrimitives;
var toObject;

if (originalKeys) {
  try {
    keysWorksWithArguments = (function () {
      // Safari 5.0 bug
      return originalKeys(arguments).length === 2;
    }(1, 2));

    keysHasArgumentsLengthBug = (function () {
      var argKeys = originalKeys(arguments);
      return arguments.length !== 1 || argKeys.length !== 1 || argKeys[0] !== 1;
    }(1));

    worksWithPrimitives = (function () {
      return originalKeys(1).length === 0;
    }(1));

    if (keysWorksWithArguments === false || keysHasArgumentsLengthBug || worksWithPrimitives === false) {
      var slice = _dereq_('array-slice-x');
      var isArguments = _dereq_('is-arguments');
      toObject = _dereq_('to-object-x');
      objectKeys = function keys(object) {
        return originalKeys(isArguments(object) ? slice(object) : toObject(object));
      };
    }
  } catch (e) {}
}

objectKeys = objectKeys || originalKeys;
if (!objectKeys) {
  var shim = _dereq_('object-keys');
  toObject = _dereq_('to-object-x');
  objectKeys = function keys(object) {
    return shim(toObject(object));
  };
}

/**
 * This method returns an array of a given object's own enumerable properties,
 * in the same order as that provided by a for...in loop (the difference being
 * that a for-in loop enumerates properties in the prototype chain as well).
 *
 * @param {*} obj The object of which the enumerable own properties are to be returned.
 * @return {Array} An array of strings that represent all the enumerable properties of the given object.
 * @example
 * var objectKeys = require('object-keys-x');
 *
 * var obj = {
 *   arr: [],
 *   bool: true,
 *   'null': null,
 *   num: 42,
 *   obj: { },
 *   str: 'boz',
 *   undefined: void 0
 * };
 *
 * objectKeys(obj); // ['arr', 'bool', 'null', 'num', 'obj', 'str', 'undefined']
 */
module.exports = objectKeys;

},{"array-slice-x":2,"is-arguments":34,"object-keys":64,"to-object-x":72}],64:[function(_dereq_,module,exports){
'use strict';

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var slice = Array.prototype.slice;
var isArgs = _dereq_('./isArguments');
var isEnumerable = Object.prototype.propertyIsEnumerable;
var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];
var equalsConstructorPrototype = function (o) {
	var ctor = o.constructor;
	return ctor && ctor.prototype === o;
};
var excludedKeys = {
	$console: true,
	$external: true,
	$frame: true,
	$frameElement: true,
	$frames: true,
	$innerHeight: true,
	$innerWidth: true,
	$outerHeight: true,
	$outerWidth: true,
	$pageXOffset: true,
	$pageYOffset: true,
	$parent: true,
	$scrollLeft: true,
	$scrollTop: true,
	$scrollX: true,
	$scrollY: true,
	$self: true,
	$webkitIndexedDB: true,
	$webkitStorageInfo: true,
	$window: true
};
var hasAutomationEqualityBug = (function () {
	/* global window */
	if (typeof window === 'undefined') { return false; }
	for (var k in window) {
		try {
			if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
				try {
					equalsConstructorPrototype(window[k]);
				} catch (e) {
					return true;
				}
			}
		} catch (e) {
			return true;
		}
	}
	return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (o) {
	/* global window */
	if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
		return equalsConstructorPrototype(o);
	}
	try {
		return equalsConstructorPrototype(o);
	} catch (e) {
		return false;
	}
};

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr.call(object) === '[object Function]';
	var isArguments = isArgs(object);
	var isString = isObject && toStr.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			return (Object.keys(arguments) || '').length === 2;
		}(1, 2));
		if (!keysWorksWithArguments) {
			var originalKeys = Object.keys;
			Object.keys = function keys(object) {
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				} else {
					return originalKeys(object);
				}
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./isArguments":65}],65:[function(_dereq_,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],66:[function(_dereq_,module,exports){
/**
 * @file ES6-compliant shim for RequireObjectCoercible.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-requireobjectcoercible|7.2.1 RequireObjectCoercible ( argument )}
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module require-object-coercible-x
 */

'use strict';

var isNil = _dereq_('is-nil-x');

/**
 * The abstract operation RequireObjectCoercible throws an error if argument
 * is a value that cannot be converted to an Object using ToObject.
 *
 * @param {*} value - The `value` to check.
 * @throws {TypeError} If `value` is a `null` or `undefined`.
 * @returns {string} The `value`.
 * @example
 * var RequireObjectCoercible = require('require-object-coercible-x');
 *
 * RequireObjectCoercible(); // TypeError
 * RequireObjectCoercible(null); // TypeError
 * RequireObjectCoercible('abc'); // 'abc'
 * RequireObjectCoercible(true); // true
 * RequireObjectCoercible(Symbol('foo')); // Symbol('foo')
 */
module.exports = function RequireObjectCoercible(value) {
  if (isNil(value)) {
    throw new TypeError('Cannot call method on ' + value);
  }

  return value;
};

},{"is-nil-x":45}],67:[function(_dereq_,module,exports){
/**
 * @file Like ES6 ToString but handles Symbols too.
 * @see {@link https://github.com/Xotic750/to-string-x|to-string-x}
 * @version 1.5.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module safe-to-string-x
 */

'use strict';

var isSymbol = _dereq_('is-symbol');
var pToString = _dereq_('has-symbol-support-x') && Symbol.prototype.toString;

/**
 * The abstract operation `safeToString` converts a `Symbol` literal or
 * object to `Symbol()` instead of throwing a `TypeError`.
 *
 * @param {*} value - The value to convert to a string.
 * @returns {string} The converted value.
 * @example
 * var safeToString = require('safe-to-string-x');
 *
 * safeToString(); // 'undefined'
 * safeToString(null); // 'null'
 * safeToString('abc'); // 'abc'
 * safeToString(true); // 'true'
 * safeToString(Symbol('foo')); // 'Symbol(foo)'
 * safeToString(Symbol.iterator); // 'Symbol(Symbol.iterator)'
 * safeToString(Object(Symbol.iterator)); // 'Symbol(Symbol.iterator)'
 */
module.exports = function safeToString(value) {
  return pToString && isSymbol(value) ? pToString.call(value) : String(value);
};

},{"has-symbol-support-x":30,"is-symbol":52}],68:[function(_dereq_,module,exports){
/**
 * @file ES6-compliant shim for SameValueZero.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-samevaluezero|7.2.10 SameValueZero(x, y)}
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module same-value-zero-x
 */

'use strict';

var is = _dereq_('object-is');

/**
 * This method determines whether two values are the same value.
 * SameValueZero differs from SameValue (`Object.is`) only in its treatment
 * of +0 and -0.
 *
 * @param {*} x - The first value to compare.
 * @param {*} y - The second value to compare.
 * @returns {boolean} A Boolean indicating whether or not the two arguments
 * are the same value.
 * @example
 * var sameValueZero = require('same-value-zero-x');
 * sameValueZero(0, 0); // true
 * sameValueZero(-0, -0); // true
 * sameValueZero(0, -0); // false
 * sameValueZero(NaN, NaN); //true
 * sameValueZero(Infinity, Infinity); // true
 * sameValueZero(-Infinity, -Infinity); // true
 */
module.exports = function sameValueZero(x, y) {
  return x === y || is(x, y);
};

},{"object-is":62}],69:[function(_dereq_,module,exports){
/**
 * @file Wrap a string in double quotes.
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module string-quote-x
 */

'use strict';

var safeToString = _dereq_('safe-to-string-x');
var JSON3 = _dereq_('json3');

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.
var quote = function _quote(string) {
  return JSON3.stringify(safeToString(string));
};

/**
 * This method wraps a string in double quotes and replaces control characters
 * with safe escape sequences.
 *
 * @param {string} string The string to safely wrap in double quotes.
 * @return {string} The wrapped string.
 * @example
 * var quote = require('string-quote-x');
 *
 * var s = quote('hello'); // '"hello"'
 */
module.exports = quote;

},{"json3":54,"safe-to-string-x":67}],70:[function(_dereq_,module,exports){
/**
 * @file ToInteger converts 'argument' to an integral numeric value.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger|7.1.4 ToInteger ( argument )}
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-integer-x
 */

'use strict';

var $isNaN = _dereq_('is-nan');
var $isFinite = _dereq_('is-finite-x');
var $sign = _dereq_('math-sign-x');

/**
 * Converts `value` to an integer.
 *
 * @param {*} value - The value to convert.
 * @returns {number} Returns the converted integer.
 *
 * @example
 * var toInteger = require('to-integer-x');
 * toInteger(3); // 3
 * toInteger(Number.MIN_VALUE); // 0
 * toInteger(Infinity); // 1.7976931348623157e+308
 * toInteger('3'); // 3
 */
module.exports = function ToInteger(value) {
  var number = Number(value);
  if ($isNaN(number)) {
    return 0;
  }

  if (number === 0 || $isFinite(number) === false) {
    return number;
  }

  return $sign(number) * Math.floor(Math.abs(number));
};

},{"is-finite-x":38,"is-nan":42,"math-sign-x":57}],71:[function(_dereq_,module,exports){
/**
 * @file ES6-compliant shim for ToLength.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-tolength|7.1.15 ToLength ( argument )}
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-length-x
 */

'use strict';

var toInteger = _dereq_('to-integer-x');
var MAX_SAFE_INTEGER = _dereq_('max-safe-integer');

/**
 * Converts `value` to an integer suitable for use as the length of an
 * array-like object.
 *
 * @param {*} value - The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 * var toLength = require('to-length-x');
 * toLength(3); // 3
 * toLength(Number.MIN_VALUE); // 0
 * toLength(Infinity); // Number.MAX_SAFE_INTEGER
 * toLength('3'); // 3
 */
module.exports = function ToLength(value) {
  var len = toInteger(value);
  // includes converting -0 to +0
  if (len <= 0) {
    return 0;
  }

  if (len > MAX_SAFE_INTEGER) {
    return MAX_SAFE_INTEGER;
  }

  return len;
};

},{"max-safe-integer":58,"to-integer-x":70}],72:[function(_dereq_,module,exports){
/**
 * @file ES6-compliant shim for ToObject.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-toobject|7.1.13 ToObject ( argument )}
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-object-x
 */

'use strict';

var $requireObjectCoercible = _dereq_('require-object-coercible-x');

/**
 * The abstract operation ToObject converts argument to a value of
 * type Object.
 *
 * @param {*} value - The `value` to convert.
 * @throws {TypeError} If `value` is a `null` or `undefined`.
 * @returns {!Object} The `value` converted to an object.
 * @example
 * var ToObject = require('to-object-x');
 *
 * ToObject(); // TypeError
 * ToObject(null); // TypeError
 * ToObject('abc'); // Object('abc')
 * ToObject(true); // Object(true)
 * ToObject(Symbol('foo')); // Object(Symbol('foo'))
 */
module.exports = function ToObject(value) {
  return Object($requireObjectCoercible(value));
};

},{"require-object-coercible-x":66}],73:[function(_dereq_,module,exports){
/**
 * @file Get an object's ES6 @@toStringTag.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring|19.1.3.6 Object.prototype.toString ( )}
 * @version 1.4.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-string-tag-x
 */

'use strict';

var isNull = _dereq_('lodash.isnull');
var isUndefined = _dereq_('validate.io-undefined');
var toStr = Object.prototype.toString;

/**
 * The `toStringTag` method returns "[object type]", where type is the
 * object type.
 *
 * @param {*} value - The object of which to get the object type string.
 * @returns {string} The object type string.
 * @example
 * var toStringTag = require('to-string-tag-x');
 *
 * var o = new Object();
 * toStringTag(o); // returns '[object Object]'
 */
module.exports = function toStringTag(value) {
  if (isNull(value)) {
    return '[object Null]';
  }

  if (isUndefined(value)) {
    return '[object Undefined]';
  }

  return toStr.call(value);
};

},{"lodash.isnull":56,"validate.io-undefined":74}],74:[function(_dereq_,module,exports){
/**
*
*	VALIDATE: undefined
*
*
*	DESCRIPTION:
*		- Validates if a value is undefined.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

/**
* FUNCTION: isUndefined( value )
*	Validates if a value is undefined.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is undefined
*/
function isUndefined( value ) {
	return value === void 0;
} // end FUNCTION isUndefined()


// EXPORTS //

module.exports = isUndefined;

},{}],75:[function(_dereq_,module,exports){
/**
 * @file List of ECMAScript5 white space characters.
 * @version 2.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module white-space-x
 */

'use strict';

var forEach = _dereq_('for-each');

/**
 * An array of the ES5 whitespace char codes, string, and their descriptions.
 *
 * @name list
 * @type Array.<Object>
 * @example
 * var whiteSpace = require('white-space-x');
 * whiteSpaces.list.foreach(function (item) {
 *   console.log(lib.description, item.code, item.string);
 * });
 */
var list = [
  {
    code: 0x0009,
    description: 'Tab',
    string: '\u0009'
  },
  {
    code: 0x000a,
    description: 'Line Feed',
    string: '\u000a'
  },
  {
    code: 0x000b,
    description: 'Vertical Tab',
    string: '\u000b'
  },
  {
    code: 0x000c,
    description: 'Form Feed',
    string: '\u000c'
  },
  {
    code: 0x000d,
    description: 'Carriage Return',
    string: '\u000d'
  },
  {
    code: 0x0020,
    description: 'Space',
    string: '\u0020'
  },
  /*
  {
    code: 0x0085,
    description: 'Next line - Not ES5 whitespace',
    string: '\u0085'
  }
  */
  {
    code: 0x00a0,
    description: 'No-break space',
    string: '\u00a0'
  },
  {
    code: 0x1680,
    description: 'Ogham space mark',
    string: '\u1680'
  },
  {
    code: 0x180e,
    description: 'Mongolian vowel separator',
    string: '\u180e'
  },
  {
    code: 0x2000,
    description: 'En quad',
    string: '\u2000'
  },
  {
    code: 0x2001,
    description: 'Em quad',
    string: '\u2001'
  },
  {
    code: 0x2002,
    description: 'En space',
    string: '\u2002'
  },
  {
    code: 0x2003,
    description: 'Em space',
    string: '\u2003'
  },
  {
    code: 0x2004,
    description: 'Three-per-em space',
    string: '\u2004'
  },
  {
    code: 0x2005,
    description: 'Four-per-em space',
    string: '\u2005'
  },
  {
    code: 0x2006,
    description: 'Six-per-em space',
    string: '\u2006'
  },
  {
    code: 0x2007,
    description: 'Figure space',
    string: '\u2007'
  },
  {
    code: 0x2008,
    description: 'Punctuation space',
    string: '\u2008'
  },
  {
    code: 0x2009,
    description: 'Thin space',
    string: '\u2009'
  },
  {
    code: 0x200a,
    description: 'Hair space',
    string: '\u200a'
  },
  /*
  {
    code: 0x200b,
    description: 'Zero width space - Not ES5 whitespace',
    string: '\u200b'
  },
  */
  {
    code: 0x2028,
    description: 'Line separator',
    string: '\u2028'
  },
  {
    code: 0x2029,
    description: 'Paragraph separator',
    string: '\u2029'
  },
  {
    code: 0x202f,
    description: 'Narrow no-break space',
    string: '\u202f'
  },
  {
    code: 0x205f,
    description: 'Medium mathematical space',
    string: '\u205f'
  },
  {
    code: 0x3000,
    description: 'Ideographic space',
    string: '\u3000'
  },
  {
    code: 0xfeff,
    description: 'Byte Order Mark',
    string: '\ufeff'
  }
];

var string = '';
forEach(list, function reducer(item) {
  string += item.string;
});

/**
 * A string of the ES5 whitespace characters.
 *
 * @name string
 * @type string
 * @example
 * var whiteSpace = require('white-space-x');
 * var characters = [
 *   '\u0009',
 *   '\u000a',
 *   '\u000b',
 *   '\u000c',
 *   '\u000d',
 *   '\u0020',
 *   '\u00a0',
 *   '\u1680',
 *   '\u180e',
 *   '\u2000',
 *   '\u2001',
 *   '\u2002',
 *   '\u2003',
 *   '\u2004',
 *   '\u2005',
 *   '\u2006',
 *   '\u2007',
 *   '\u2008',
 *   '\u2009',
 *   '\u200a',
 *   '\u2028',
 *   '\u2029',
 *   '\u202f',
 *   '\u205f',
 *   '\u3000',
 *   '\ufeff'
 * ];
 * var ws = characters.join('');
 * var re1 = new RegExp('^[' + whiteSpace.string + ']+$)');
 * re1.test(ws); // true
 */
module.exports = {
  list: list,
  string: string
};

},{"for-each":24}]},{},[1])(1)
});