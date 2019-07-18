function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }

import isArrayLike from 'is-array-like-x';
import isObjectLike from 'is-object-like-x';
import isSafeInteger from 'is-safe-integer-x';
import isVarName from 'is-var-name';
import isSymbol from 'is-symbol';
import { SetConstructor, MapConstructor } from 'collections-x';
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
    var strName = isSymbol(name) === false && String(name);

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
      if (isSafeInteger(value)) {
        count = value;
      }

      var result = count;
      count += 1;
      return result;
    }
  };
};

var initialise = function _initialise(CstmCtr, properties, opts) {
  var keys = new SetConstructor();
  var dNames = new MapConstructor();
  var dValues = new MapConstructor();
  var isClone;
  var items;

  if (isArrayLike(properties)) {
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
   * @param {object} options - Options to determine behaviour.
   * @returns {Function} The enumeration collection.
   */
  create: {
    value: function create(typeName, properties, options) {
      var _this4 = this;

      var ctrName = isSymbol(typeName) === false && String(typeName);

      if (ctrName === 'undefined' || isVarName(ctrName) === false) {
        throw new Error("Invalid enum name: ".concat(ctrName));
      }

      var opts = isObjectLike(options) ? options : {};
      var CstmCtr;
      var data; // noinspection JSUnusedLocalSymbols

      var construct
      /* eslint-disable-line no-unused-vars */
      = function _construct(context, args) {
        var argsArr = _toConsumableArray(args);

        if (data) {
          if (isObjectLike(context) && context instanceof CstmCtr) {
            throw new SyntaxError('Enum classes can’t be instantiated');
          }

          return data.names.get(data.values.get(argsArr.shift()));
        }

        Enum.apply(context, argsArr);
        return context;
      };
      /* eslint-disable-next-line no-eval */


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
        Object.defineProperty(CstmCtr, Symbol.iterator, {
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

      CstmCtr.prototype = Object.create(Enum.prototype);
      Object.defineProperties(CstmCtr.prototype, {
        constructor: {
          value: CstmCtr
        },
        name: {
          value: ctrName
        }
      });

      if (isObjectLike(opts.classMethods)) {
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

      if (isObjectLike(opts.instanceMethods)) {
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

//# sourceMappingURL=enumify-x.esm.js.map