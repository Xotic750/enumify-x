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

**Version**: 1.0.2  
**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  
<a name="exp_module_enumify-x--module.exports"></a>

### `module.exports` ⇒ <code>function</code> ⏏
An enumeration is a set of symbolic names (members) bound to unique, constant
values. Within an enumeration, the members can be compared by identity, and
the enumeration itself can be iterated over.

**Kind**: Exported member  
**Returns**: <code>function</code> - The enum collection.  

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

// No aliases are allowed in this example.
var unique = true;
var anEnum = Enum.create('myEnum', [
  'RED',
  'YELLOW',
], unique);

JSON.stringify(anEnum); // '{"RED":{"name":"RED","value":0},"YELLOW":{"name":"YELLOW","value":1}}'

// Enum#iterate works like Array#some in that the iteration will stop if
// a truthy value is returned by the iteratee function.
anEnum.iterate(function (Constant, key, obj) {}, thisArg);

// Values can be anything, but names must be a string.
var myEnum = Enum.create('myEnum', [
  { name: 'OBJECT', value: {} },
  { name: 'ARRAY', value: [] },
  { name: 'FUNCTION', value: function () {} }
]);
```
