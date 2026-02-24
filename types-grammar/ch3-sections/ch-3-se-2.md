## Plain Objects

The general object value-type is sometimes referred to as *plain ol' javascript objects* (POJOs).

Plain objects have a literal form:

```js
address = {
    street: "12345 Market St",
    city: "San Francisco",
    state: "CA",
    zip: "94114"
};
```

This plain object (POJO), as defined with the `{ .. }` curly braces, is a collection of named properties (`street`, `city`, `state`, and `zip`). Properties can hold any values, primitives or other objects (including arrays, functions, etc).

The same object could also have been defined imperatively using the `new Object()` constructor:

```js
address = new Object();
address.street = "12345 Market St";
address.city = "San Francisco";
address.state = "CA";
address.zip = "94114";
```

Plain objects are by default `[[Prototype]]` linked to `Object.prototype`, giving them delegated access to several general object methods, such as:

* `toString()` / `toLocaleString()`
* `valueOf()`
* `isPrototypeOf(..)`
* `hasOwnProperty(..)` (recently deprecated -- alternative: static `Object.hasOwn(..)` utility)
* `propertyIsEnumerable(..)`
* `__proto__` (getter function)

```js
address.isPrototypeOf(Object.prototype);    // true
address.isPrototypeOf({});                  // false
```
