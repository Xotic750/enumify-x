<a name="module_enum-x"></a>

## enum-x
<a href="https://travis-ci.org/Xotic750/enum-x"
title="Travis status">
<img
src="https://travis-ci.org/Xotic750/enum-x.svg?branch=master"
alt="Travis status" height="18">
</a>
<a href="https://david-dm.org/Xotic750/enum-x"
title="Dependency status">
<img src="https://david-dm.org/Xotic750/enum-x.svg"
alt="Dependency status" height="18"/>
</a>
<a
href="https://david-dm.org/Xotic750/enum-x#info=devDependencies"
title="devDependency status">
<img src="https://david-dm.org/Xotic750/enum-x/dev-status.svg"
alt="devDependency status" height="18"/>
</a>
<a href="https://badge.fury.io/js/enum-x" title="npm version">
<img src="https://badge.fury.io/js/enum-x.svg"
alt="npm version" height="18">
</a>

Enum module.

Requires ES3 or above.

**Version**: 1.0.0  
**Author**: Xotic750 <Xotic750@gmail.com>  
**License**: [MIT](&lt;https://opensource.org/licenses/MIT&gt;)  
**Copyright**: Xotic750  
<a name="exp_module_enum-x--module.exports"></a>

### `module.exports` ⇒ <code>Object</code> ⏏
This method allows precise addition to or modification of a property on an object.
For more details see the Object.defineProperty which is similar.
Object.defineProperty returns the object or throws a TypeError if the property
has not been successfully defined. Reflect.defineProperty, however, simply returns
a Boolean indicating whether or not the property was successfully defined.

**Kind**: Exported member  
**Returns**: <code>Object</code> - A Boolean indicating whether or not the property was successfully defined.  
**Throws**:

- <code>TypeError</code> If target is not an Object.


| Param | Type | Description |
| --- | --- | --- |
| target | <code>\*</code> | The target object on which to define the property. |
| propertyKey | <code>\*</code> | The name of the property to be defined or modified. |
| attributes | <code>\*</code> | The attributes for the property being defined or modified. |

**Example**  
```js
var reflectDefineProperty = require('enum-x');
var obj = {};
reflectDefineProperty(obj, 'x', {value: 7}); // true
obj.x; // 7
```
