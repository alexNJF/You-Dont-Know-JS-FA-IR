# Object Sub-Types

There are a variety of specialized sub-types of objects in JS. But by far, the two most common ones you'll interact with are arrays and `function`s.

| NOTE: |
| :--- |
| By "sub-type", we mean the notion of a derived type that has inherited the behaviors from a parent type but then specialized or extended those behaviors. In other words, values of these sub-types are fully objects, but are also *more than just* objects. |

### Arrays

Arrays are objects that are specifically intended to be **numerically indexed**, rather than using string named property locations. They are still objects, so a named property like `favoriteNumber` is legal. But it's greatly frowned upon to mix named properties into numerically indexed arrays.

Arrays are preferably defined with literal syntax (similar to objects), but with the `[ .. ]` square brackets rather than `{ .. }` curly brackets:

```js
myList = [ 23, 42, 109 ];
```

JS allows any mixture of value types in arrays, including objects, other arrays, functions, etc. As you're likely already aware, arrays are "zero-indexed", meaning the first element in the array is at the index `0`, not `1`:

```js
myList = [ 23, 42, 109 ];

myList[0];      // 23
myList[1];      // 42
```

Recall that any string property name on an object that "looks like" an integer -- is able to be validly coerced to a numeric integer -- will actually be treated like an integer property (aka, integer index). The same goes for arrays. You should always use `42` as an integer index (aka, property name), but if you use the string `"42"`, JS will assume you meant that as an integer and do that for you.

```js
// "2" works as an integer index here, but it's not advised
myList["2"];    // 109
```

One exception to the "no named properties on arrays" *rule* is that all arrays automatically expose a `length` property, which is automatically kept updated with the "length" of the array.

```js
myList = [ 23, 42, 109 ];

myList.length;   // 3

// "push" another value onto the end of the list
myList.push("Hello");

myList.length;   // 4
```

| WARNING: |
| :--- |
| Many JS developers incorrectly believe that array `length` is basically a *getter* (see "Accessor Properties" earlier in this chapter), but it's not. The offshoot is that these developers feel like it's "expensive" to access this property -- as if JS has to on-the-fly recompute the length -- and will thus do things like capture/store the length of an array before doing a non-mutating loop over it. This used to be "best practice" from a performance perspective. But for at least 10 years now, that's actually been an anti-pattern, because the JS engine is more efficient at managing the `length` property than our JS code is at trying to "outsmart" the engine to avoid invoking something we think is a *getter*. It's more efficient to let the JS engine do its job, and just access the property whenever and however often it's needed. |

#### Empty Slots

JS arrays also have a really unfortunate "flaw" in their design, referred to as "empty slots". If you assign an index of an array more than one position beyond the current end of the array, JS will leave the in between slots "empty" rather than auto-assigning them to `undefined` as you might expect:

```js
myList = [ 23, 42, 109 ];
myList.length;              // 3

myList[14] = "Hello";
myList.length;              // 15

myList;                     // [ 23, 42, 109, empty x 11, "Hello" ]

// looks like a real slot with a
// real `undefined` value in it,
// but beware, it's a trick!
myList[9];                  // undefined
```

You might wonder why empty slots are so bad? One reason: there are APIs in JS, like array's `map(..)`, where empty slots are surprisingly skipped over! Never, ever intentionally create empty slots in your arrays. This in undebateably one of JS's "bad parts".

### Functions

I don't have much specifically to say about functions here, other than to point out that they are also sub-object-types. This means that in addition to being executable, they can also have named properties added to or accessed from them.

Functions have two pre-defined properties you may find yourself interacting with, specifically for meta-programming purposes:

```js
function help(opt1,opt2,...remainingOpts) {
    // ..
}

help.name;          // "help"
help.length;        // 2
```

The `length` of a function is the count of its explicitly defined parameters, up to but not including a parameter that either has a default value defined (e.g., `param = 42`) or a "rest parameter" (e.g., `...remainingOpts`).

#### Avoid Setting Function-Object Properties

You should avoid assigning properties on function objects. If you're looking to store extra information associated with a function, use a separate `Map(..)` (or `WeakMap(..)`) with the function object as the key, and the extra information as the value.

```js
extraInfo = new Map();

extraInfo.set(help,"this is some important information");

// later:
extraInfo.get(help);   // "this is some important information"
```