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

**Version**: 1.1.0  
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

// example allows duplicate values, known as aliases.
var myEnum = Enum.create('myEnum', [
  'RED', // auto assign value, starting 0
  'YELLOW', // auto assign value, will be 1
  { name: 'BLUE', value: 10 },
  'PINK', // auto assign value, will be 11
  { name: 'BLACK', value: 1 } // This is an alias for YELLOW
]);

myEnum.YELLOW; // { name: 'YELLOW', value: 1 }
myEnum.BLUE.name; // 'BLUE'
myEnum.BLUE.value; // 10
myEnum.BLACK === myEnum.YELLOW; // true
myEnum.PINK.toString(); // 'myEnum.PINK'
myEnum.toString(); // 'myEnum { "RED", "YELLOW", "BLUE", "PINK", "BLACK" }'
myEnum.PINK instanceof myEnum; // true

// No aliases are allowed in this example.
var unique = true;
var anEnum = Enum.create('myEnum', [
  'RED',
  'YELLOW',
], unique);

JSON.stringify(anEnum); // '[{"name":"RED","value":0},{"name":"YELLOW","value":1}]'

// The forEach() method executes a provided function once per each
// name/value pair in the Enum object, in insertion order.
// Iterating over the members of an enum does not provide the aliases.
anEnum.forEach(function (Constant) {}, thisArg);

// Where supported, for..of can be used.
// Iterating over the members of an enum does not provide the aliases.
for (const { name, value } of anEnum) {
  console.log(name, value);
}

// Otherwise, standard iterator pattern.
// Iterating over the members of an enum does not provide the aliases.
var iter = anEnum[Enum.symIt]();
var next = iter.next();
while (next.done === false) {
  var Constant = next.value;
  console.log(Constant.name, Constant.value)
  next = iter.next();
}

// To iterate all items, including aliases.
var allConstants = anEnum.toJSON();
allConstants.forEach(function(Constant) {
   console.log(Constant.name, Constant.value);
});

// Lookups can be perfomed on the value and not just the name.
anEnum(0) === anEnum.RED; // true
anEnum(1) === anEnum['YELLOW']; // true

// Values can be anything, but names must be a string.
var anotherEnum = Enum.create('myEnum', [
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
```
