<a name="module_enumify-x"></a>

## enumify-x
<a href="https://travis-ci.org/Xotic750/enumify-x"
title="Travis status">
<img
src="https://travis-ci.org/Xotic750/enumify-x.svg?branch=master"
alt="Travis status" height="18">
</a>
<a href="https://david-dm.org/Xotic750/enumify-x"
title="Dependency status">
<img src="https://david-dm.org/Xotic750/enumify-x.svg"
alt="Dependency status" height="18"/>
</a>
<a
href="https://david-dm.org/Xotic750/enumify-x#info=devDependencies"
title="devDependency status">
<img src="https://david-dm.org/Xotic750/enumify-x/dev-status.svg"
alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/enumify-x" title="npm version">
<img src="https://badge.fury.io/js/enumify-x.svg"
alt="npm version" height="18">
</a>

Enum module.

Requires ES3 or above.

**Version**: 1.3.0  
**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  
<a name="exp_module_enumify-x--module.exports"></a>

### `module.exports` ⇒ <code>function</code> ⏏
An enumeration is a set of symbolic names (members) bound to unique, constant
values. Within an enumeration, the members can be compared by identity, and
the enumeration itself can be iterated over.
Influenced by Python's Enum implimentation.

**Kind**: Exported member  
**Returns**: <code>function</code> - The enum collection.  
**See**: [https://docs.python.org/3/library/enum.html](https://docs.python.org/3/library/enum.html)  

| Param | Type | Description |
| --- | --- | --- |
| typeName | <code>string</code> | The name of the enum collection. |
| names | <code>Array.&lt;(string\|Object)&gt;</code> | An array of valid initiators. |
| [unique] | <code>Boolean</code> | Ensure unique enumeration values. |

**Example**  
```js
var Enum = require('enumify-x');

// Creating an Enum
// Example allows duplicate values, known as aliases.
// Member values can be anything: number, string, etc.. If the exact value is
// unimportant you may use auto instances and an appropriate value will be
// chosen for you. Care must be taken if you mix auto with other values.
//
// The class Color is an enumeration (or enum)
// The attributes Color.RED, Color.GREEN, etc., are enumeration members
// (or enum members) and are functionally constants.
// The enum members have names and values (the name of Color.RED is RED,
// value of Color.BLUE is 10, etc.)
var Color = Enum.create('Color', [
  'RED', // auto assign value, starting 0
  'YELLOW', // auto assign value, will be 1
  { name: 'BLUE', value: 10 },
  'PINK', // auto assign value, will be 11
  { name: 'BLACK', value: 1 } // This is an alias for YELLOW
]);

Color.YELLOW; // { name: 'YELLOW', value: 1 }
Color.BLUE.name; // 'BLUE'
Color.BLUE.value; // 10
Color.BLACK === Color.YELLOW; // true
// Enumeration members have human readable string representations.
Color.PINK.toString(); // 'Color.PINK'
// Enums also have a human readable string representations.
Color.toString(); // 'Color { "RED", "YELLOW", "BLUE", "PINK", "BLACK" }'
// The type of an enumeration member is the enumeration it belongs to.
Color.PINK instanceof Color; // true
// You can access by value too.
Color(10); // Color.BLUE

// Enumeration members are hashable, so they can be used as property names.
var apples = {};
apples[Color.RED] = 'Red Delicious';
apples[Color.YELLOW] = 'Golden Delicious'
apples; // {Color.RED: 'Red Delicious', Color.YELLOW: 'Golden Delicious'}

// Having two enum members with the same name is invalid
var Fail = Enum.create('Fail', [
  'RED',
  'RED',
], opts);

// However, two enum members are allowed to have the same value. Given two
// members A and B with the same value (and A defined first), B is an alias
// to A. By-value lookup of the value of A and B will return A. By-name
// lookup of B will also return A. as seen in the definition of Color.

// No aliases are allowed in this example.
var opts = {
  unique: true
};

var Color1 = Enum.create('Color1', [
  'RED',
  'YELLOW',
], opts);

// Depending on the value types used, enumerations are serialisable.
JSON.stringify(Color1); // '[{"name":"RED","value":0},{"name":"YELLOW","value":1}]'

// Enumerations support iteration, in definition order.
// The forEach() method executes a provided function once per each
// name/value pair in the Enum object, in insertion order.
// Iterating over the members of an enum does not provide the aliases.
Color1.forEach(function (enumMember) {
  console.log(enumMember.name, enumMember.value)
}, thisArg);

// Where supported, for..of can be used.
// Iterating over the members of an enum does not provide the aliases.
for (const { name, value } of Color1) {
  console.log(name, value);
}

// Otherwise, standard iterator pattern.
// Iterating over the members of an enum does not provide the aliases.
var iter = Color1[Enum.symIt]();
var next = iter.next();
while (next.done === false) {
  var enumMember = next.value;
  console.log(enumMember.name, enumMember.value)
  next = iter.next();
}

// To iterate all items, including aliases.
var allenumMembers = Color1.toJSON();
allenumMembers.forEach(function(enumMember) {
   console.log(enumMember.name, enumMember.value);
});

// Lookups can be perfomed on the value and not just the name.
Color1(0) === Color1.RED; // true
Color1(1) === Color1['YELLOW']; // true

// Values can be anything, but names must be a string.
var anotherEnum = Enum.create('anotherEnum', [
  { name: 'OBJECT', value: {} },
  { name: 'ARRAY', value: [] },
  { name: 'FUNCTION', value: function () {} }
]);

// Enums can be cloned
var cloneEnum = Enum.create('cloneEnum', anotherEnum);
cloneEnum === anotherEnum; // false
cloneEnum.OBJECT === anotherEnum.OBJECT; // false
cloneEnum.OBJECT.name === anotherEnum.OBJECT.name; // true
cloneEnum.OBJECT.value === anotherEnum.OBJECT.value; // true

// Options
// unique: {boolean} - whether aliases are allowed.
// auto: {Function} - if you wish to define your own auto value allocation.
// classMethods: {Object<Function>} - to defined methods on the enum.
// instanceMethods: {Object<Function>} - to defined methods on the enum members.

// ------------------------------------------------------

var opts1 = {
  auto: function () {
    return {
      next: function (name, value) {
        return name;
      }
    };
  }
};

var subject1 = Enum.create('subject1', ['RED'], opts1);
subject1.RED; // { name: 'RED', value: 'RED'}

// ------------------------------------------------------

var opts2 = {
  classMethods: {
    favourite: function () {
      return this.RED;
    }
  }
};

var subject2 = Enum.create('subject2', ['RED'], opts2);
subject2.favourite() === subject2.RED; // true

// ------------------------------------------------------

var opts3 = {
  instanceMethods: {
    description: function () {
      return 'Description: ' + this.toString();
    }
  }
};

var subject3 = Enum.create('subject3', ['RED'], opts3);
subject3.RED.description()) === 'Description: subject3.RED'; // true
```
