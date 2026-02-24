## Arrays

Arrays are objects that are specialized to behave as numerically indexed collections of values, as opposed to holding values at named properties like plain objects do.

Arrays have a literal form:

```js
favoriteNumbers = [ 3, 12, 42 ];

favoriteNumbers[2];                 // 42
```

The same array could also have been defined imperatively using the `new Array()` constructor:

```js
favoriteNumbers = new Array();
favoriteNumbers[0] = 3;
favoriteNumbers[1] = 12;
favoriteNumbers[2] = 42;
```

Arrays are `[[Prototype]]` linked to `Array.prototype`, giving them delegated access to a variety of array-oriented methods, such as `map(..)`, `includes(..)`, etc:

```js
favoriteNumbers.map(v => v * 2);
// [ 6, 24, 84 ]

favoriteNumbers.includes(42);       // true
```

Some of the methods defined on `Array.prototype` -- for example, `push(..)`, `pop(..)`, `sort(..)`, etc -- behave by modifying the array value in place. Other methods -- for example, `concat(..)`, `map(..)`, `slice(..)` -- behave by creating a new array to return, leaving the original array intact. A third category of array functions -- for example, `indexOf(..)`, `includes(..)`, etc -- merely computes and returns a (non-array) result.
