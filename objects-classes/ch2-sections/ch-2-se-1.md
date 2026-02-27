# Property Descriptors

Each property on an object is internally described by what's known as a "property descriptor". This is, itself, an object (aka, "metaobject") with several properties (aka "attributes") on it, dictating how the target property behaves.

We can retrieve a property descriptor for any existing property using `Object.getOwnPropertyDescriptor(..)` (ES5):

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

Object.getOwnPropertyDescriptor(myObj,"favoriteNumber");
// {
//     value: 42,
//     enumerable: true,
//     writable: true,
//     configurable: true
// }
```

We can even use such a descriptor to define a new property on an object, using `Object.defineProperty(..)` (ES5):

```js
anotherObj = {};

Object.defineProperty(anotherObj,"fave",{
    value: 42,
    enumerable: true,     // default if omitted
    writable: true,       // default if omitted
    configurable: true    // default if omitted
});

anotherObj.fave;          // 42
```

If an existing property has not already been marked as non-configurable (with `configurable: false` in its descriptor), it can always be re-defined/overwritten using `Object.defineProperty(..)`.

| WARNING: |
| :--- |
| A number of earlier sections in this chapter refer to "copying" or "duplicating" properties. One might assume such copying/duplication would be at the property descriptor level. However, none of those operations actually work that way; they all do simple `=` style access and assignment, which has the effect of ignoring any nuances in how the underlying descriptor for a property is defined. |

Though it seems far less common out in the wild, we can even define multiple properties at once, each with their own descriptor:

```js
anotherObj = {};

Object.defineProperties(anotherObj,{
    "fave": {
        // a property descriptor
    },
    "superFave": {
        // another property descriptor
    }
});
```

It's not very common to see this usage, because it's rarer that you need to specifically control the definition of multiple properties. But it may be useful in some cases.

### Accessor Properties

A property descriptor usually defines a `value` property, as shown above. However, a special kind of property, known as an "accessor property" (aka, a getter/setter), can be defined. For these a property like this, its descriptor does not define a fixed `value` property, but would instead look something like this:

```js
{
    get() { .. },    // function to invoke when retrieving the value
    set(v) { .. },   // function to invoke when assigning the value
    // .. enumerable, etc
}
```

A getter looks like a property access (`obj.prop`), but under the covers it invokes the `get()` method as defined; it's sort of like if you had called `obj.prop()`. A setter looks like a property assignment (`obj.prop = value`), but it invokes the `set(..)` method as defined; it's sort of like if you had called `obj.prop(value)`.

Let's illustrate a getter/setter accessor property:

```js
anotherObj = {};

Object.defineProperty(anotherObj,"fave",{
    get() { console.log("Getting 'fave' value!"); return 123; },
    set(v) { console.log(`Ignoring ${v} assignment.`); }
});

anotherObj.fave;
// Getting 'fave' value!
// 123

anotherObj.fave = 42;
// Ignoring 42 assignment.

anotherObj.fave;
// Getting 'fave' value!
// 123
```

### Enumerable, Writable, Configurable

Besides `value` or `get()` / `set(..)`, the other 3 attributes of a property descriptor are (as shown above):

* `enumerable`
* `writable`
* `configurable`

The `enumerable` attribute controls whether the property will appear in various enumerations of object properties, such as `Object.keys(..)`, `Object.entries(..)`, `for..in` loops, and the copying that occurs with the `...` object spread and `Object.assign(..)`. Most properties should be left enumerable, but you can mark certain special properties on an object as non-enumerable if they shouldn't be iterated/copied.

The `writable` attribute controls whether a `value` assignment (via `=`) is allowed. To make a property "read only", define it with `writable: false`. However, as long as the property is still configurable, `Object.defineProperty(..)` can still change the value by setting `value` differently.

The `configurable` attribute controls whether a property's **descriptor** can be re-defined/overwritten. A property that's `configurable: false` is locked to its definition, and any further attempts to change it with `Object.defineProperty(..)` will fail. A non-configurable property can still be assigned new values (via `=`), as long as `writable: true` is still set on the property's descriptor.