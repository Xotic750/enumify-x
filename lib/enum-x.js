(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.returnExports = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/enum-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/enum-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/enum-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/enum-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/enum-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/enum-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/enum-x" title="npm version">
 * <img src="https://badge.fury.io/js/enum-x.svg"
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
 * @module enum-x
 */

'use strict';

var defineProperties = _dereq_('object-define-properties-x');
var defineProperty = _dereq_('object-define-property-x');
var isSafeInteger = _dereq_('is-safe-integer');
var hasSymbolSupport = _dereq_('has-symbol-support-x');
var create = _dereq_('object-create-x');
var assertIsFunction = _dereq_('assert-is-function-x');
var assertIsObject = _dereq_('assert-is-object-x');
var isObjectLike = _dereq_('is-object-like-x');
var isString = _dereq_('is-string');
var isArray = _dereq_('is-array');
var forEach = _dereq_('for-each');
// eslint-disable-next-line no-unused-vars
var slice = _dereq_('array-slice-x');
var objectKeys = Object.keys || _dereq_('object-keys');
var freeze = Object.freeze || function _freeze(object) {
  return assertIsObject(object);
};
var $Enum;

var generator = function _generator(object) {
  var keys = objectKeys(object);
  var index = 0;
  return {
    next: function _next() {
      if (index < keys.length) {
        var key = keys[index];
        index += 1;
        return {
          done: false,
          value: object[key]
        };
      }

      return { done: true };
    }
  };
};

var init = function _init(CstmCtr, names) {
  var items;
  if (isArray(names)) {
    items = names;
  } else if (isObjectLike(names) && names instanceof $Enum) {
    var results = [];
    names.enumerate(function mapper(Constant) {
      results.push(Constant);
    });

    items = results;
  } else {
    throw new Error('bad args');
  }

  var count = 0;
  forEach(items, function _define(item) {
    var isObj = isObjectLike(item);
    var name = isObj ? item.name : item;
    var ordinal = isObj ? item.ordinal : count;
    var ident = new CstmCtr(name, ordinal);
    if ($Enum.reservedNames[name] === true) {
      throw new SyntaxError('name is reserved: ' + name);
    }

    count = ident.ordinal + 1;
    defineProperty(CstmCtr, ident.name, {
      enumerable: true,
      value: ident
    });
  });
};

$Enum = function Enum(name, ordinal) {
  if (arguments.length > 0) {
    if (isString(name) === false) {
      throw new TypeError('name is not a string: ' + name);
    }

    if (ordinal < 0 || isSafeInteger(ordinal) === false) {
      var msg = 'ordinal is not a safe positive integer: ' + ordinal;
      throw new TypeError(msg);
    }

    defineProperties(this, {
      name: {
        enumerable: true,
        value: name.toString()
      },
      ordinal: {
        enumerable: true,
        value: ordinal.valueOf()
      }
    });

    freeze(this);
  }
};

defineProperties($Enum.prototype, {
  toJSON: {
    value: function _toJSON() {
      var value = create(null);
      value.name = this.name;
      value.ordinal = this.ordinal;
      return value;
    }
  },
  toString: {
    value: function _toString() {
      return this.constructor.name + '.' + this.name;
    }
  }
});

defineProperties($Enum, {
  create: {
    value: function _create(ctrName, names) {
      var find;
      var initiated = false;
      // eslint-disable-next-line no-unused-vars
      var eFn = function _eFn(context, args) {
        if (initiated) {
          return find(args.shift());
        }

        $Enum.apply(context, args);
        return context;
      };

      // eslint-disable-next-line no-eval
      var CstmCtr = eval('(0,function ' + ctrName + ' (ordinal){return eFn(this,slice(arguments))})');

      var enumerate = function _enumerate(callback, thisArg) {
        assertIsFunction(callback);
        var iterator = generator(CstmCtr);
        var next = iterator.next();
        while (next.done === false) {
          var name = next.value.name;
          if (callback.call(thisArg, CstmCtr[name], name, CstmCtr)) {
            return true;
          }

          next = iterator.next();
        }

        return false;
      };

      find = function _find(ordinal) {
        var results = [];
        enumerate.call(CstmCtr, function _filter(Constant) {
          if (Constant.ordinal === ordinal) {
            results.push(Constant);
          }
        });

        return results.length < 2 ? results.pop() : results;
      };

      defineProperties(CstmCtr, {
        enumerate: { value: enumerate },

        toJSON: {
          value: function _toJSON() {
            var value = create(null);
            enumerate.call(CstmCtr, function _mapper(Constant, key) {
              value[key] = Constant.toJSON();
            });

            return value;
          }
        }
      });

      if (hasSymbolSupport) {
        defineProperty(CstmCtr, Symbol.iterator, {
          value: function iterator() {
            return generator(this);
          }
        });
      }

      CstmCtr.prototype = create($Enum.prototype);
      defineProperties(CstmCtr.prototype, {
        constructor: { value: CstmCtr },
        name: { value: ctrName }
      });

      init(CstmCtr, names);
      initiated = true;
      return freeze(CstmCtr);
    }
  },

  reservedNames: {
    value: defineProperties(create(null), {
      enumerate: {
        enumerable: true,
        value: true
      },
      toJSON: {
        enumerable: true,
        value: true
      }
    })
  }
});

/**
 * This method allows precise addition to or modification of a property on an object.
 * For more details see the Object.defineProperty which is similar.
 * Object.defineProperty returns the object or throws a TypeError if the property
 * has not been successfully defined. Reflect.defineProperty, however, simply returns
 * a Boolean indicating whether or not the property was successfully defined.
 *
 * @param {*} target The target object on which to define the property.
 * @param {*} propertyKey The name of the property to be defined or modified.
 * @param {*} attributes The attributes for the property being defined or modified.
 * @throws {TypeError} If target is not an Object.
 * @return {Object} A Boolean indicating whether or not the property was successfully defined.
 * @example
 * var reflectDefineProperty = require('enum-x');
 * var obj = {};
 * reflectDefineProperty(obj, 'x', {value: 7}); // true
 * obj.x; // 7
 */
module.exports = $Enum;

},{"array-slice-x":2,"assert-is-function-x":3,"assert-is-object-x":4,"for-each":8,"has-symbol-support-x":11,"is-array":13,"is-object-like-x":24,"is-safe-integer":26,"is-string":27,"object-create-x":32,"object-define-properties-x":33,"object-define-property-x":34,"object-keys":35}],2:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/array-slice-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/array-slice-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/array-slice-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/array-slice-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/array-slice-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/array-slice-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/array-slice-x" title="npm version">
 * <img src="https://badge.fury.io/js/array-slice-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Array slice module.
 *
 * Requires ES3 or above.
 *
 * @version 1.0.1
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
 * @param {Array|Object} array The array to slice.
 * @param {number} [start] Zero-based index at which to begin extraction.
 *  A negative index can be used, indicating an offset from the end of the
 *  sequence. slice(-2) extracts the last two elements in the sequence.
 *  If begin is undefined, slice begins from index 0.
 * @param {number} [end] Zero-based index before which to end extraction.
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
 * @return {Array} A new array containing the extracted elements.
 * @example
 * var slice = require('array-slice-x');
 * var fruits = ['Banana', 'Orange', 'Lemon', 'Apple', 'Mango'];
 * var citrus = slice(fruits, 1, 3);
 *
 * // fruits contains ['Banana', 'Orange', 'Lemon', 'Apple', 'Mango']
 * // citrus contains ['Orange','Lemon']
 */
module.exports = slice;

},{"to-integer-x":39,"to-length-x":40,"to-object-x":41,"validate.io-undefined":43}],3:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/assert-is-function-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/assert-is-function-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/assert-is-function-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/assert-is-function-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/assert-is-function-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/assert-is-function-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/assert-is-function-x" title="npm version">
 * <img src="https://badge.fury.io/js/assert-is-function-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * If isFunction(callbackfn) is false, throw a TypeError exception.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module assert-is-function-x
 */

/* eslint strict: 1 */

/* global require, module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isFunction = _dereq_('is-function-x');
  var safeToString = _dereq_('safe-to-string-x');
  var isPrimitive = _dereq_('is-primitive');

  /**
   * Tests `callback` to see if it is a function, throws a `TypeError` if it is
   * not. Otherwise returns the `callback`.
   *
   * @param {*} callback The argument to be tested.
   * @throws {TypeError} Throws if `callback` is not a function.
   * @return {*} Returns `callback` if it is function.
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
}());

},{"is-function-x":17,"is-primitive":25,"safe-to-string-x":38}],4:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/assert-is-object-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/assert-is-object-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/assert-is-object-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/assert-is-object-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/assert-is-object-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/assert-is-object-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/assert-is-object-x" title="npm version">
 * <img src="https://badge.fury.io/js/assert-is-object-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * If IsObject(value) is false, throw a TypeError exception.
 *
 * @version 1.1.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module assert-is-object-x
 */

/* eslint strict: 1 */

/* global require, module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var safeToString = _dereq_('safe-to-string-x');
  var isPrimitive = _dereq_('is-primitive');

  /**
   * Tests `value` to see if it is an object, throws a `TypeError` if it is
   * not. Otherwise returns the `value`.
   *
   * @param {*} value The argument to be tested.
   * @throws {TypeError} Throws if `value` is not an object.
   * @return {*} Returns `value` if it is an object.
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
}());

},{"is-primitive":25,"safe-to-string-x":38}],5:[function(_dereq_,module,exports){
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

},{"foreach":9,"object-keys":35}],6:[function(_dereq_,module,exports){
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

},{"./helpers/isPrimitive":7,"is-callable":14,"is-date-object":15,"is-symbol":28}],7:[function(_dereq_,module,exports){
module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],8:[function(_dereq_,module,exports){
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

},{"is-function":18}],9:[function(_dereq_,module,exports){

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


},{}],10:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/has-own-property-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/has-own-property-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/has-own-property-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/has-own-property-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/has-own-property-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/has-own-property-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/has-own-property-x" title="npm version">
 * <img src="https://badge.fury.io/js/has-own-property-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Used to determine whether an object has an own property with the specified property key.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-hasownproperty|7.3.11 HasOwnProperty (O, P)}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-own-property-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var toObject = _dereq_('to-object-x');
  var toPrimitive = _dereq_('es-to-primitive/es6');
  var safeToString = _dereq_('safe-to-string-x');
  var hop = Object.prototype.hasOwnProperty;

  /**
   * The `hasOwnProperty` method returns a boolean indicating whether
   * the `object` has the specified `property`. Does not attempt to fix known
   * issues in older browsers, but does ES6ify the method.
   *
   * @param {!Object} object The object to test.
   * @param {string|Symbol} property The name or Symbol of the property to test.
   * @return {boolean} `true` if the property is set on `object`, else `false`.
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
    return hop.call(toObject(object), safeToString(toPrimitive(property, String)));
  };
}());

},{"es-to-primitive/es6":6,"safe-to-string-x":38,"to-object-x":41}],11:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/has-symbol-support-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/has-symbol-support-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/has-symbol-support-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/has-symbol-support-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/has-symbol-support-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/has-symbol-support-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/has-symbol-support-x" title="npm version">
 * <img src="https://badge.fury.io/js/has-symbol-support-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Tests if `Symbol` exists and creates the correct type.
 *
 * Requires ES3 or above.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-symbol-support-x
 */

/* eslint strict: 1, symbol-description: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  /**
   * Indicates if `Symbol`exists and creates the correct type.
   * `true`, if it exists and creates the correct type, otherwise `false`.
   *
   * @type boolean
   */
  module.exports = typeof Symbol === 'function' && typeof Symbol() === 'symbol';
}());

},{}],12:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/has-to-string-tag-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/has-to-string-tag-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/has-to-string-tag-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/has-to-string-tag-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/has-to-string-tag-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/has-to-string-tag-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/has-to-string-tag-x" title="npm version">
 * <img src="https://badge.fury.io/js/has-to-string-tag-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Tests if ES6 @@toStringTag is supported.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-@@tostringtag|26.3.1 @@toStringTag}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-to-string-tag-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  /**
   * Indicates if `Symbol.toStringTag`exists and is the correct type.
   * `true`, if it exists and is the correct type, otherwise `false`.
   *
   * @type boolean
   */
  module.exports = _dereq_('has-symbol-support-x') && typeof Symbol.toStringTag === 'symbol';
}());

},{"has-symbol-support-x":11}],13:[function(_dereq_,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],14:[function(_dereq_,module,exports){
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

},{}],15:[function(_dereq_,module,exports){
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

},{}],16:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-finite-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/is-finite-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-finite-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-finite-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/is-finite-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-finite-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-finite-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-finite-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for Number.isFinite.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-number.isfinite|20.1.2.2 Number.isFinite ( number )}
 *
 * @version 1.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-finite-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var $isNaN = _dereq_('is-nan');

  var $isFinite;
  if (typeof Number.isFinite === 'function') {
    try {
      if (Number.isFinite(9007199254740991) && !Number.isFinite(Infinity)) {
        $isFinite = Number.isFinite;
      }
    } catch (ignore) {}
  }

  /**
   * This method determines whether the passed value is a finite number.
   *
   * @param {*} number The value to be tested for finiteness.
   * @return {boolean} A Boolean indicating whether or not the given value is a finite number.
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
}());

},{"is-nan":20}],17:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-function-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/is-function-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-function-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-function-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/is-function-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-function-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-function-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-function-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Determine whether a given value is a function object.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-function-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var fToString = Function.prototype.toString;
  var toStringTag = _dereq_('to-string-tag-x');
  var hasToStringTag = _dereq_('has-to-string-tag-x');
  var isPrimitive = _dereq_('is-primitive');
  var funcTag = '[object Function]';
  var genTag = '[object GeneratorFunction]';
  var asyncTag = '[object AsyncFunction]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @private
   * @param {*} value The value to check.
   * @return {boolean} Returns `true` if `value` is correctly classified,
   * else `false`.
   */
  var tryFuncToString = function funcToString(value) {
    try {
      fToString.call(value);
      return true;
    } catch (ignore) {}
    return false;
  };

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @param {*} value The value to check.
   * @return {boolean} Returns `true` if `value` is correctly classified,
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
   * isFunction(class Test {}); // true
   * isFunction((x, y) => {return this;}); // true
   */
  module.exports = function isFunction(value) {
    if (isPrimitive(value)) {
      return false;
    }
    if (hasToStringTag) {
      return tryFuncToString(value);
    }
    var strTag = toStringTag(value);
    return strTag === funcTag || strTag === genTag || strTag === asyncTag;
  };
}());

},{"has-to-string-tag-x":12,"is-primitive":25,"to-string-tag-x":42}],18:[function(_dereq_,module,exports){
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

},{}],19:[function(_dereq_,module,exports){
'use strict';

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

module.exports = function isNaN(value) {
	return value !== value;
};

},{}],20:[function(_dereq_,module,exports){
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

},{"./implementation":19,"./polyfill":21,"./shim":22,"define-properties":5}],21:[function(_dereq_,module,exports){
'use strict';

var implementation = _dereq_('./implementation');

module.exports = function getPolyfill() {
	if (Number.isNaN && Number.isNaN(NaN) && !Number.isNaN('a')) {
		return Number.isNaN;
	}
	return implementation;
};

},{"./implementation":19}],22:[function(_dereq_,module,exports){
'use strict';

var define = _dereq_('define-properties');
var getPolyfill = _dereq_('./polyfill');

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

module.exports = function shimNumberIsNaN() {
	var polyfill = getPolyfill();
	define(Number, { isNaN: polyfill }, { isNaN: function () { return Number.isNaN !== polyfill; } });
	return polyfill;
};

},{"./polyfill":21,"define-properties":5}],23:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-nil-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-nil-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-nil-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-nil-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-nil-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-nil-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-nil-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-nil-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Checks if `value` is `null` or `undefined`.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-nil-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isUndefined = _dereq_('validate.io-undefined');
  var isNull = _dereq_('lodash.isnull');

  /**
   * Checks if `value` is `null` or `undefined`.
   *
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
   * @example
   *
   * _.isNil(null);
   * // => true
   *
   * _.isNil(void 0);
   * // => true
   *
   * _.isNil(NaN);
   * // => false
   */
  module.exports = function isNil(value) {
    return isNull(value) || isUndefined(value);
  };
}());

},{"lodash.isnull":29,"validate.io-undefined":43}],24:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/is-object-like-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/is-object-like-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-object-like-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/is-object-like-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/is-object-like-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/is-object-like-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/is-object-like-x" title="npm version">
 * <img src="https://badge.fury.io/js/is-object-like-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6 isObjectLike module.
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module is-object-like-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isFunction = _dereq_('is-function-x');
  var isPrimitive = _dereq_('is-primitive');

  /**
   * Checks if `value` is object-like. A value is object-like if it's not a
   * primitive and not a function.
   *
   * @param {*} value The value to check.
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
    return !isPrimitive(value) && !isFunction(value);
  };
}());

},{"is-function-x":17,"is-primitive":25}],25:[function(_dereq_,module,exports){
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

},{}],26:[function(_dereq_,module,exports){
'use strict';
var MAX_SAFE_INTEGER = _dereq_('max-safe-integer');

module.exports = Number.isSafeInteger || function (val) {
	return typeof val === 'number' && val === val && val !== Infinity && val !== -Infinity && parseInt(val, 10) === val && Math.abs(val) <= MAX_SAFE_INTEGER;
};

},{"max-safe-integer":31}],27:[function(_dereq_,module,exports){
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

},{}],28:[function(_dereq_,module,exports){
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

},{}],29:[function(_dereq_,module,exports){
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

},{}],30:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/math-sign-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/math-sign-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/math-sign-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/math-sign-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/math-sign-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/math-sign-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/math-sign-x" title="npm version">
 * <img src="https://badge.fury.io/js/math-sign-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for Math.sign.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-math.sign|20.2.2.29 Math.sign(x)}
 *
 * @version 1.1.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module math-sign-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

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
   * @param {*} x A number.
   * @return {number} A number representing the sign of the given argument. If the argument
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
}());

},{"is-nan":20}],31:[function(_dereq_,module,exports){
'use strict';
module.exports = 9007199254740991;

},{}],32:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/object-create-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/object-create-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/object-create-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/object-create-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/object-create-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/object-create-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/object-create-x" title="npm version">
 * <img src="https://badge.fury.io/js/object-create-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Sham for Object.create
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-create-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1, id-length: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isPrimitive = _dereq_('is-primitive');
  var isUndefined = _dereq_('validate.io-undefined');
  var isNull = _dereq_('lodash.isnull');
  var $defineProperties = _dereq_('object-define-properties-x');
  var $create = Object.create;

  // ES5 15.2.3.5
  // http://es5.github.com/#x15.2.3.5
  if (!$create) {

    // Contributed by Brandon Benvie, October, 2012
    var createEmpty;
    var supportsProto = !({ __proto__: null } instanceof Object);
    // the following produces false positives
    // in Opera Mini => not a reliable check
    // Object.prototype.__proto__ === null

    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    /* global ActiveXObject */
    var shouldUseActiveX = function _shouldUseActiveX() {
      // return early if document.domain not set
      if (!document.domain) {
        return false;
      }

      try {
        return !!new ActiveXObject('htmlfile');
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

    /* global document */
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
        if (!isNull(prototype) && isPrimitive(prototype)) {
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

      if (!isUndefined(properties)) {
        $defineProperties(object, properties);
      }

      return object;
    };
  }

  /**
   * This method method creates a new object with the specified prototype object and properties.
   *
   * @param {*} prototype The object which should be the prototype of the newly-created object.
   * @param {*} [properties] If specified and not undefined, an object whose enumerable own properties
   * (that is, those properties defined upon itself and not enumerable properties along its prototype chain)
   * specify property descriptors to be added to the newly-created object, with the corresponding property names.
   * @throws {TypeError} If the properties parameter isn't null or an object.
   * @return {boolean} A new object with the specified prototype object and properties.
   * @example
   * var create = require('object-create-x');
   */
  module.exports = $create;
}());

},{"is-primitive":25,"lodash.isnull":29,"object-define-properties-x":33,"validate.io-undefined":43}],33:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/object-define-properties-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/object-define-properties-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/object-define-properties-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-properties-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/object-define-properties-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-properties-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/object-define-properties-x" title="npm version">
 * <img src="https://badge.fury.io/js/object-define-properties-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Sham for Object.defineProperties
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-define-properties-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1, id-length: 1 */

/* global module, document */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var forEach = _dereq_('foreach');
  var $keys = _dereq_('object-keys');
  var $defineProperty = _dereq_('object-define-property-x');
  var $defineProperties = Object.defineProperties;

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
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document === 'undefined' || doesDefinePropertyWork(document.createElement('div'));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
      var definePropertiesFallback = Object.defineProperties;
    }
  }

  // ES5 15.2.3.7
  // http://es5.github.com/#x15.2.3.7
  if (!$defineProperties || definePropertiesFallback) {
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
   * @param {Object} object The object on which to define or modify properties.
   * @param {Object} properties An object whose own enumerable properties constitute descriptors for the
   * properties to be defined or modified.
   * @return {Object} The object that was passed to the function.
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
}());

},{"foreach":9,"object-define-property-x":34,"object-keys":35}],34:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/object-define-property-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/object-define-property-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/object-define-property-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-property-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/object-define-property-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/object-define-property-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/object-define-property-x" title="npm version">
 * <img src="https://badge.fury.io/js/object-define-property-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Sham for Object.deineProperty
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-define-property-x
 */

/* eslint strict: 1, max-statements: 1, complexity: 1, id-length: 1 */

/* global module, document */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isPrimitive = _dereq_('is-primitive');
  var owns = _dereq_('has-own-property-x');
  var $defineProperty = Object.defineProperty;

  var prototypeOfObject = Object.prototype;
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
    var definePropertyWorksOnObject = doesDefinePropertyWork({});
    var definePropertyWorksOnDom = typeof document === 'undefined' || doesDefinePropertyWork(document.createElement('div'));
    if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
      var definePropertyFallback = Object.defineProperty;
    }
  }

  if (!$defineProperty || definePropertyFallback) {
    var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
    var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
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
        if (!supportsAccessors && (hasGetter || hasSetter)) {
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
   * @param {Object} object The object on which to define the property.
   * @param {string} property The name of the property to be defined or modified.
   * @param {Object} descriptor The descriptor for the property being defined or modified.
   * @return {Object} The object that was passed to the function.
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
}());

},{"has-own-property-x":10,"is-primitive":25}],35:[function(_dereq_,module,exports){
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

},{"./isArguments":36}],36:[function(_dereq_,module,exports){
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

},{}],37:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/require-object-coercible-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/require-object-coercible-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/require-object-coercible-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/require-object-coercible-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/require-object-coercible-x#info=devDependencies"
 * title="devDependency status">
 * <img
 * src="https://david-dm.org/Xotic750/require-object-coercible-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a
 * href="https://badge.fury.io/js/require-object-coercible-x"
 * title="npm version">
 * <img src="https://badge.fury.io/js/require-object-coercible-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for RequireObjectCoercible.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-requireobjectcoercible|7.2.1 RequireObjectCoercible ( argument )}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module require-object-coercible-x
 */

/* eslint strict: 1, id-length: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isNil = _dereq_('is-nil-x');

  /**
   * The abstract operation RequireObjectCoercible throws an error if argument
   * is a value that cannot be converted to an Object using ToObject.
   *
   * @param {*} value The `value` to check.
   * @throws {TypeError} If `value` is a `null` or `undefined`.
   * @return {string} The `value`.
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
}());

},{"is-nil-x":23}],38:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/safe-to-string-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/safe-to-string-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/safe-to-string-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/safe-to-string-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/safe-to-string-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/safe-to-string-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/safe-to-string-x" title="npm version">
 * <img src="https://badge.fury.io/js/safe-to-string-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6 safeToString module. Converts a `Symbol` literal or object to `Symbol()`
 * instead of throwing a `TypeError`. Its primary use is for logging/debugging.
 *
 * Requires ES3 or above.
 *
 * @see {@link https://github.com/Xotic750/to-string-x|to-string-x}
 *
 * @version 1.3.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module safe-to-string-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isSymbol = _dereq_('is-symbol');
  var pToString = _dereq_('has-symbol-support-x') && Symbol.prototype.toString;

  /**
   * The abstract operation `safeToString` converts a `Symbol` literal or
   * object to `Symbol()` instead of throwing a `TypeError`.
   *
   * @param {*} value The value to convert to a string.
   * @return {string} The converted value.
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
}());

},{"has-symbol-support-x":11,"is-symbol":28}],39:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/to-integer-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/to-integer-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-integer-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/to-integer-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/to-integer-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/to-integer-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/to-integer-x" title="npm version">
 * <img src="https://badge.fury.io/js/to-integer-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for toInteger.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger|7.1.4 ToInteger ( argument )}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-integer-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var $isNaN = _dereq_('is-nan');
  var $isFinite = _dereq_('is-finite-x');
  var $sign = _dereq_('math-sign-x');

  /**
   * Converts `value` to an integer.
   *
   * @param {*} value The value to convert.
   * @return {number} Returns the converted integer.
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
    if (number === 0 || !$isFinite(number)) {
      return number;
    }
    return $sign(number) * Math.floor(Math.abs(number));
  };
}());

},{"is-finite-x":16,"is-nan":20,"math-sign-x":30}],40:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/to-length-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/to-length-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-length-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/to-length-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/to-length-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/to-length-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/to-length-x" title="npm version">
 * <img src="https://badge.fury.io/js/to-length-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for ToLength.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-tolength|7.1.15 ToLength ( argument )}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-length-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var toInteger = _dereq_('to-integer-x');
  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Converts `value` to an integer suitable for use as the length of an
   * array-like object.
   *
   * @param {*} value The value to convert.
   * @return {number} Returns the converted integer.
   * @example
   * var toLength = require('to-length-x');
   * toLength(3); // 3
   * toLength(Number.MIN_VALUE); // 0
   * toLength(Infinity); // Number.MAX_SAFE_INTEGER
   * toLength('3'); // 3
   */
  module.exports = function ToLength(value) {
    var len = toInteger(value);
    if (len <= 0) {
      return 0;
    } // includes converting -0 to +0
    if (len > MAX_SAFE_INTEGER) {
      return MAX_SAFE_INTEGER;
    }
    return len;
  };
}());

},{"to-integer-x":39}],41:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/to-object-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/to-object-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-object-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/to-object-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/to-object-x#info=devDependencies"
 * title="devDependency status">
 * <img
 * src="https://david-dm.org/Xotic750/to-object-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a
 * href="https://badge.fury.io/js/to-object-x"
 * title="npm version">
 * <img src="https://badge.fury.io/js/to-object-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * ES6-compliant shim for ToObject.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-toobject|7.1.13 ToObject ( argument )}
 *
 * @version 1.2.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-object-x
 */

/* eslint strict: 1, id-length: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var $requireObjectCoercible = _dereq_('require-object-coercible-x');

  /**
   * The abstract operation ToObject converts argument to a value of
   * type Object.
   *
   * @param {*} value The `value` to convert.
   * @throws {TypeError} If `value` is a `null` or `undefined`.
   * @return {!Object} The `value` converted to an object.
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
}());

},{"require-object-coercible-x":37}],42:[function(_dereq_,module,exports){
/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/to-string-tag-x"
 * title="Travis status">
 * <img src="https://travis-ci.org/Xotic750/to-string-tag-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-string-tag-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/to-string-tag-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a href="https://david-dm.org/Xotic750/to-string-tag-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/to-string-tag-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/to-string-tag-x" title="npm version">
 * <img src="https://badge.fury.io/js/to-string-tag-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * Get an object's ES6 @@toStringTag.
 *
 * Requires ES3 or above.
 *
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring|19.1.3.6 Object.prototype.toString ( )}
 *
 * @version 1.2.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module to-string-tag-x
 */

/* eslint strict: 1 */

/* global module */

;(function () { // eslint-disable-line no-extra-semi

  'use strict';

  var isNull = _dereq_('lodash.isnull');
  var isUndefined = _dereq_('validate.io-undefined');
  var nullTag = '[object Null]';
  var undefTag = '[object Undefined]';
  var toStr = Object.prototype.toString;

  /**
   * The `toStringTag` method returns "[object type]", where type is the
   * object type.
   *
   * @param {*} value The object of which to get the object type string.
   * @return {string} The object type string.
   * @example
   * var o = new Object();
   *
   * toStringTag(o); // returns '[object Object]'
   */
  module.exports = function toStringTag(value) {
    if (isNull(value)) {
      return nullTag;
    }
    if (isUndefined(value)) {
      return undefTag;
    }
    return toStr.call(value);
  };
}());

},{"lodash.isnull":29,"validate.io-undefined":43}],43:[function(_dereq_,module,exports){
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

},{}]},{},[1])(1)
});