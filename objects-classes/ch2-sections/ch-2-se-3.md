# Object Characteristics

In addition to defining behaviors for specific properties, certain behaviors are configurable across the whole object:

* extensible
* sealed
* frozen

### Extensible

Extensibility refers to whether an object can have new properties defined/added to it. By default, all objects are extensible, but you can change shut off extensibility for an object:

```js
myObj = {
    favoriteNumber: 42
};

myObj.firstName = "Kyle";                  // works fine

Object.preventExtensions(myObj);

myObj.nicknames = [ "getify", "ydkjs" ];   // fails
myObj.favoriteNumber = 123;                // works fine
```

In non-strict-mode, an assignment that creates a new property will silently fail, whereas in strict mode an exception will be thrown.

### Sealed

// TODO

### Frozen

// TODO