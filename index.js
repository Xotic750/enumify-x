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

var defineProperties = require('object-define-properties-x');
var defineProperty = require('object-define-property-x');
var isSafeInteger = require('is-safe-integer');
var hasSymbolSupport = require('has-symbol-support-x');
var create = require('object-create-x');
var assertIsFunction = require('assert-is-function-x');
var assertIsObject = require('assert-is-object-x');
var isObjectLike = require('is-object-like-x');
var isString = require('is-string');
var isArray = require('is-array');
var forEach = require('for-each');
// eslint-disable-next-line no-unused-vars
var slice = require('array-slice-x');
var objectKeys = Object.keys || require('object-keys');
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
