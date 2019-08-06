<a
  href="https://travis-ci.org/Xotic750/enumify-x"
  title="Travis status">
<img
  src="https://travis-ci.org/Xotic750/enumify-x.svg?branch=master"
  alt="Travis status" height="18">
</a>
<a
  href="https://david-dm.org/Xotic750/enumify-x"
  title="Dependency status">
<img src="https://david-dm.org/Xotic750/enumify-x/status.svg"
  alt="Dependency status" height="18"/>
</a>
<a
  href="https://david-dm.org/Xotic750/enumify-x?type=dev"
  title="devDependency status">
<img src="https://david-dm.org/Xotic750/enumify-x/dev-status.svg"
  alt="devDependency status" height="18"/>
</a>
<a
  href="https://badge.fury.io/js/enumify-x"
  title="npm version">
<img src="https://badge.fury.io/js/enumify-x.svg"
  alt="npm version" height="18">
</a>
<a
  href="https://www.jsdelivr.com/package/npm/enumify-x"
  title="jsDelivr hits">
<img src="https://data.jsdelivr.com/v1/package/npm/enumify-x/badge?style=rounded"
  alt="jsDelivr hits" height="18">
</a>
<a
  href="https://bettercodehub.com/results/Xotic750/enumify-x"
  title="bettercodehub score">
<img src="https://bettercodehub.com/edge/badge/Xotic750/enumify-x?branch=master"
  alt="bettercodehub score" height="18">
</a>
<a
  href="https://coveralls.io/github/Xotic750/enumify-x?branch=master"
  title="Coverage Status">
<img src="https://coveralls.io/repos/github/Xotic750/enumify-x/badge.svg?branch=master"
  alt="Coverage Status" height="18">
</a>

<a name="module_enumify-x"></a>

## enumify-x

Enumerated type library.

**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](https://opensource.org/licenses/MIT)  
**Copyright**: Xotic750

- [enumify-x](#module_enumify-x)
  - [`module.exports`](#exp_module_enumify-x--module.exports) ⇒ <code>Object</code> ⏏
    - [`~create`](#module_enumify-x--module.exports..create) ⇒ <code>function</code>

<a name="exp_module_enumify-x--module.exports"></a>

### `module.exports` ⇒ <code>Object</code> ⏏

An enumeration is a set of symbolic names (members) bound to unique, constant
values. Within an enumeration, the members can be compared by identity, and
the enumeration itself can be iterated over.
Influenced by Python's Enum implimentation.

Create an enum name/value. Not usually called directly.

**Kind**: Exported member  
**Returns**: <code>Object</code> - The enum.  
**See**: [https://docs.python.org/3/library/enum.html](https://docs.python.org/3/library/enum.html)

| Param | Type                | Description                  |
| ----- | ------------------- | ---------------------------- |
| name  | <code>string</code> | The name of the enum.        |
|       | <code>\*</code>     | value The value of the enum. |

<a name="module_enumify-x--module.exports..create"></a>

#### `module.exports~create` ⇒ <code>function</code>

Creates an enumeration collection. Primary method.

**Kind**: inner property of [<code>module.exports</code>](#exp_module_enumify-x--module.exports)  
**Returns**: <code>function</code> - The enumeration collection.

| Param      | Type                | Description                      |
| ---------- | ------------------- | -------------------------------- |
| typeName   | <code>string</code> | The name of the enum collection. |
| properties | <code>Array</code>  | Initialiser array.               |
| options    | <code>Object</code> | Options to determine behaviour.  |

**Example**

```js
import Enum from 'enumify-x';

// Creating an Enum
// Example allows duplicate values, known as aliases.
// Member values can be anything: number, string, etc.. If the exact value is
// unimportant you may use auto instances and an appropriate value will be
// chosen for you. Care must be taken if you mix auto with other values.
//
// The class color is an enumeration (or enum)
// The attributes color.RED, color.GREEN, etc., are enumeration members
// (or enum members) and are functionally constants.
// The enum members have names and values (the name of color.RED is RED,
// value of color.BLUE is 10, etc.)
const color = Enum.create('color', [
  'RED', // auto assign value, starting 0
  'YELLOW', // auto assign value, will be 1
  {name: 'BLUE', value: 10},
  'PINK', // auto assign value, will be 11
  {name: 'BLACK', value: 1}, // This is an alias for YELLOW
]);

console.log(color.YELLOW); // { name: 'YELLOW', value: 1 }
console.log(color.BLUE.name); // 'BLUE'
console.log(color.BLUE.value); // 10
console.log(color.BLACK === color.YELLOW); // true
// Enumeration members have human readable string representations.
color.PINK.toString(); // 'color.PINK'
// Enums also have a human readable string representations.
color.toString(); // 'color { "RED", "YELLOW", "BLUE", "PINK", "BLACK" }'
// The type of an enumeration member is the enumeration it belongs to.
console.log(color.PINK instanceof color); // true
// You can access by value too.
console.log(color(10)); // color.BLUE

// Enumeration members are hashable, so they can be used as property names.
const apples = {};
apples[color.RED] = 'Red Delicious';
apples[color.YELLOW] = 'Golden Delicious';
console.log(apples); // {color.RED: 'Red Delicious', color.YELLOW: 'Golden Delicious'}

// No aliases are allowed in this example.
const opts = {
  unique: true,
};

// Having two enum members with the same name is invalid
Enum.create('fail', ['RED', 'RED'], opts);

// However, two enum members are allowed to have the same value. Given two
// members A and B with the same value (and A defined first), B is an alias
// to A. By-value lookup of the value of A and B will return A. By-name
// lookup of B will also return A. as seen in the definition of color.

const color1 = Enum.create('color1', ['RED', 'YELLOW'], opts);

// Depending on the value types used, enumerations are serialisable.
JSON.stringify(color1); // '[{"name":"RED","value":0},{"name":"YELLOW","value":1}]'

// Enumerations support iteration, in definition order.
// The forEach() method executes a provided function once per each
// name/value pair in the Enum object, in insertion order.
// Iterating over the members of an enum does not provide the aliases.
color1.forEach((enumMember) => {
  console.log(enumMember.name, enumMember.value);
});

// Where supported, for..of can be used.
// Iterating over the members of an enum does not provide the aliases.
for (const {name, value} of color1) {
  console.log(name, value);
}

// Otherwise, standard iterator pattern.
// Iterating over the members of an enum does not provide the aliases.
const iter = color1[Symbol.iterator]();
let next = iter.next();
while (next.done === false) {
  const enumMember = next.value;
  console.log(enumMember.name, enumMember.value);
  next = iter.next();
}

// To iterate all items, including aliases.
const allenumMembers = color1.toJSON();
allenumMembers.forEach((enumMember) => {
  console.log(enumMember.name, enumMember.value);
});

// Lookups can be performed on the value and not just the name.
console.log(color1(0) === color1.RED); // true
console.log(color1(1) === color1.YELLOW); // true

// Values can be anything, but names must be a string.
const anotherEnum = Enum.create('anotherEnum', [
  {name: 'OBJECT', value: {}},
  {name: 'ARRAY', value: []},
  {
    name: 'FUNCTION',
    value() {
      return undefined;
    },
  },
]);

// Enums can be cloned
const cloneEnum = Enum.create('cloneEnum', anotherEnum);
console.log(cloneEnum === anotherEnum); // false
console.log(cloneEnum.OBJECT === anotherEnum.OBJECT); // false
console.log(cloneEnum.OBJECT.name === anotherEnum.OBJECT.name); // true
console.log(cloneEnum.OBJECT.value === anotherEnum.OBJECT.value); // true

// Options
// unique: {boolean} - whether aliases are allowed.
// auto: {Function} - if you wish to define your own auto value allocation.
// classMethods: {Object<Function>} - to defined methods on the enum.
// instanceMethods: {Object<Function>} - to defined methods on the enum members.

// ------------------------------------------------------

const opts1 = {
  auto() {
    return {
      next(name /* , value */) {
        return name;
      },
    };
  },
};

const subject1 = Enum.create('subject1', ['RED'], opts1);
console.log(subject1.RED); // { name: 'RED', value: 'RED'}

// ------------------------------------------------------

const opts2 = {
  classMethods: {
    favourite() {
      return this.RED;
    },
  },
};

const subject2 = Enum.create('subject2', ['RED'], opts2);
console.log(subject2.favourite() === subject2.RED); // true

// ------------------------------------------------------

const opts3 = {
  instanceMethods: {
    description() {
      return `Description: ${this.toString()}`;
    },
  },
};

const subject3 = Enum.create('subject3', ['RED'], opts3);
console.log(subject3.RED.description() === 'Description: subject3.RED'); // true
```
