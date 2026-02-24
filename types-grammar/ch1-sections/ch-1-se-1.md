## Value Types

JS doesn't apply types to variables or properties -- what I call, "container types" -- but rather, values themselves have types -- what I call, "value types".

The language provides seven built-in, primitive (non-object) value types: [^PrimitiveValues]

* `undefined`
* `null`
* `boolean`
* `number`
* `bigint`
* `symbol`
* `string`

These value-types define collections of one or more concrete values, each with a set of shared behaviors for all values of each type.

### Type-Of

Any value's value-type can be inspected via the `typeof` operator, which always returns a `string` value representing the underlying JS value-type:

```js
typeof true;            // "boolean"

typeof 42;              // "number"

typeof 42n;             // "bigint"

typeof Symbol("42");    // "symbol"
```

The `typeof` operator, when used against a variable instead of a value, is reporting the value-type of *the value in the variable*:

```js
greeting = "Hello";
typeof greeting;        // "string"
```

JS variables themselves don't have types. They hold any arbitrary value, which itself has a value-type.

### Non-objects?

What specifically makes the 7 primitive value types distinct from the object value types (and sub-types)? Why shouldn't we just consider them all as essentially *objects* under the covers?

Consider:

```js
myName = "Kyle";

myName.nickname = "getify";

console.log(myName.nickname);           // undefined
```

This snippet appears to silently fail to add a `nickname` property to a primitive string. Taken at face value, that might imply that primitives are really just objects under the covers, as many have (wrongly) asserted over the years.

| WARNING: |
| :--- |
| One might explain that silent failure as an example of *auto-boxing* (see "Automatic Objects" in Chapter 3), where the primitive is implicitly converted to a `String` instance wrapper object while attempting to assign the property, and then this internal object is thrown away after the statement completes. In fact, I said exactly that in the first edition of this book. But I was wrong; oops! |

Something deeper is at play, as we see in this version of the previous snippet:

```js
"use strict";

myName = "Kyle";

myName.nickname = "getify";
// TypeError: Cannot create property 'nickname'
// on string 'Kyle'
```

Interesting! In strict-mode, JS enforces a restriction that disallows setting a new property on a primitive value, as if implicitly promoting it to a new object.

By contrast, in non-strict mode, JS allows the violation to go unmentioned. So why? Because strict-mode was added to the language in ES5.1 (2011), more than 15 years in, and such a change would have broken existing programs had it not been defined as sensitive to the new strict-mode declaration.

So what can we conclude about the distinction between primitives and objects? Primitives are values that *are not allowed to have properties*; only objects are allowed such.

| TIP: |
| :--- |
| This particular distinction seems to be contradicted by expressions like `"hello".length`; even in strict-mode, it returns the expected value `5`. So it certainly *seems* like the string has a `length` property! But, as just previously mentioned, the correct explanation is *auto-boxing*; we'll cover the topic in "Automatic Objects" in Chapter 3. |
