/*!
{
  "copywrite": "Copyright (c) 2017-present",
  "date": "2018-11-04T22:59:13.392Z",
  "describe": "",
  "description": "Enumerated type library.",
  "file": "enumify-x.js",
  "hash": "0562820cf433137b13a3",
  "license": "MIT",
  "version": "2.0.1"
}
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["EnumifyX"] = factory();
	else
		root["EnumifyX"] = factory();
})((function () {
  'use strict';

  if (typeof self !== 'undefined') {
    return self;
  }

  if (typeof window !== 'undefined') {
    return window;
  }

  if (typeof global !== 'undefined') {
    return global;
  }

  return Function('return this')();
}()), function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Enum;

var _isArrayLike = _interopRequireDefault(__webpack_require__(1));

var _isObjectLike = _interopRequireDefault(__webpack_require__(6));

var _isVarName = _interopRequireDefault(__webpack_require__(7));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }

var reserved = new Set(['forEach', 'name', 'toJSON', 'toString', 'value', 'valueOf']);
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
 * @returns {Object} The enum.
 */

function Enum(name, value) {
  if (arguments.length > 0) {
    var strName = String(name);

    if (reserved.has(strName)) {
      throw new SyntaxError("Name is reserved: ".concat(strName));
    }

    Object.defineProperties(this, {
      name: {
        enumerable: true,
        value: strName
      },
      value: {
        enumerable: true,
        value: value
      }
    });
    Object.freeze(this);
  }
}

Object.defineProperties(Enum.prototype, {
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

var generateNextValue = function _generateNextValue() {
  var count = 0;
  return {
    next: function next(name, value) {
      if (Number.isSafeInteger(value)) {
        count = value;
      }

      var result = count;
      count += 1;
      return result;
    }
  };
};

var initialise = function _initialise(CstmCtr, properties, opts) {
  var keys = new Set();
  var dNames = new Map();
  var dValues = new Map();
  var isClone;
  var items;

  if ((0, _isArrayLike.default)(properties)) {
    items = properties;
  } else if (typeof properties === 'function' && properties.prototype instanceof Enum) {
    isClone = true;
    items = properties.toJSON();
  } else {
    throw new Error('bad args');
  }

  var iter = typeof opts.auto === 'function' ? opts.auto() : generateNextValue();
  var next;

  var itemsIteratee = function _itemsIteratee(item) {
    var ident;

    if (isClone || (0, _isObjectLike.default)(item)) {
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

    Object.defineProperty(CstmCtr, name, {
      enumerable: true,
      value: ident
    });
  };

  items.forEach(itemsIteratee);
  return {
    keys: keys,
    names: dNames,
    values: dValues
  };
};

var calcString = function _calcString(ctrName, names) {
  var _this = this;

  var strArr = [];
  names.forEach(function (enumMember) {
    _newArrowCheck(this, _this);

    strArr.push(JSON.stringify(enumMember.name));
  }.bind(this));
  return "".concat(ctrName, " { ").concat(strArr.join(', '), " }");
};

Object.defineProperties(Enum, {
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
   * var iter = Color1[Symbol.iterator]();
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
      var _this4 = this;

      var ctrName = String(typeName);

      if (ctrName === 'undefined' || (0, _isVarName.default)(ctrName) === false) {
        throw new Error("Invalid enum name: ".concat(ctrName));
      }

      var opts = (0, _isObjectLike.default)(options) ? options : {};
      var CstmCtr;
      var data; // eslint-disable-next-line no-unused-vars

      var construct = function _construct(context, args) {
        var argsArr = _toConsumableArray(args);

        if (data) {
          if ((0, _isObjectLike.default)(context) && context instanceof CstmCtr) {
            throw new SyntaxError('Enum classes can’t be instantiated');
          }

          return data.names.get(data.values.get(argsArr.shift()));
        }

        Enum.apply(context, argsArr);
        return context;
      }; // eslint-disable-next-line no-eval


      CstmCtr = eval("(0,function ".concat(ctrName, "(value){return construct(this,arguments)})"));
      var asString;
      Object.defineProperties(CstmCtr, {
        forEach: {
          value: function forEach(callback, thisArg) {
            var _this2 = this;

            data.keys.forEach(function (key) {
              _newArrowCheck(this, _this2);

              callback.call(thisArg, data.names.get(key));
            }.bind(this));
          }
        },
        toJSON: {
          value: function toJSON() {
            var _this3 = this;

            var value = [];
            data.names.forEach(function (enumMember) {
              _newArrowCheck(this, _this3);

              value.push(enumMember.toJSON());
            }.bind(this));
            return value;
          }
        },
        toString: {
          value: function _toString() {
            if (typeof asString === 'undefined') {
              asString = calcString(ctrName, data.names);
            }

            return asString;
          }
        }
      });
      Object.defineProperty(CstmCtr, Symbol.iterator, {
        value: function iterator() {
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
      CstmCtr.prototype = Object.create(Enum.prototype);
      Object.defineProperties(CstmCtr.prototype, {
        constructor: {
          value: CstmCtr
        },
        name: {
          value: ctrName
        }
      });

      if ((0, _isObjectLike.default)(opts.classMethods)) {
        Object.keys(opts.classMethods).forEach(function (key) {
          _newArrowCheck(this, _this4);

          if (reserved.has(key)) {
            throw new SyntaxError("Name is reserved: ".concat(key));
          }

          var method = opts.classMethods[key];

          if (typeof method === 'function') {
            Object.defineProperty(CstmCtr, key, {
              value: method
            });
            reserved.add(key);
          }
        }.bind(this));
      }

      if ((0, _isObjectLike.default)(opts.instanceMethods)) {
        Object.keys(opts.instanceMethods).forEach(function (key) {
          _newArrowCheck(this, _this4);

          if (reserved.has(key)) {
            throw new SyntaxError("Name is reserved: ".concat(key));
          }

          var method = opts.instanceMethods[key];

          if (typeof method === 'function') {
            Object.defineProperty(CstmCtr.prototype, key, {
              value: method
            });
            reserved.add(key);
          }
        }.bind(this));
      }

      data = initialise(CstmCtr, properties, opts);
      return Object.freeze(CstmCtr);
    }
  }
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(2),
    isLength = __webpack_require__(5);

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(3),
    isObject = __webpack_require__(4);

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
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


/***/ }),
/* 6 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),
/* 7 */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return isVarName; });
/*!
 * is-var-name | ISC (c) Shinnosuke Watanabe
 * https://github.com/shinnn/is-var-name
*/
function isVarName(str) {
	if (typeof str !== 'string') {
		return false;
	}

	if (str.trim() !== str) {
		return false;
	}

	try {
		new Function(str, 'var ' + str);
	} catch (e) {
		return false;
	}

	return true;
}


/***/ })
/******/ ]);
});
//# sourceMappingURL=enumify-x.js.map