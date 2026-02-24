## Fundamental Objects

JS defines several *fundamental* object types, which are instances of various built-in constructors, including:

* `new String()`
* `new Number()`
* `new Boolean()`

Note that these constructors must be used with the `new` keyword to construct instances of the fundamental objects. Otherwise, these functions actually perform type coercion (see Chapter 4).

These fundamental object constructors create object value-types instead of a primitives:

```js
myName = "Kyle";
typeof myName;                      // "string"

myNickname = new String("getify");
typeof myNickname;                  // "object"
```

In other words, an instance of a fundamental object constructor can actually be seen as a wrapper around the corresponding underlying primitive value.

| WARNING: |
| :--- |
| It's nearly universally regarded as *bad practice* to ever directly instantiate these fundamental objects. The primitive counterparts are generally more predictable, more performant, and offer *auto-boxing* (see "Automatic Objects" section below) whenever the underlying object-wrapper form is needed for property/method access. |

The `Symbol(..)` and `BigInt(..)` functions are referred to in the specification as "constructors", though they're not used with the `new` keyword, and the values they produce in a JS program are indeed primitives.

How, there are internal *fundamental objects* for these two types, used for prototype delegation and *auto-boxing*.

By contrast, for `null` and `undefined` primitive values, there aren't `Null()` or `Undefined()` "constructors", nor corresponding fundamental objects or prototypes.

### Prototypes

Instances of the fundamental object constructors are `[[Prototype]]` linked to their constructors' `prototype` objects:

* `String.prototype`: defines `length` property, as well as string-specific methods, like `toUpperCase()`, etc.

* `Number.prototype`: defines number-specific methods, like `toPrecision(..)`, `toFixed(..)`, etc.

* `Boolean.prototype`: defines default `toString()` and `valueOf()` methods.

* `Symbol.prototype`: defines `description` (getter), as well as default `toString()` and `valueOf()` methods.

* `BigInt.prototype`: defines default `toString()`, `toLocaleString()`, and `valueOf()` methods.

Any direct instance of the built-in constructors have `[[Prototype]]` delegated access to its respective `prototype` properties/methods. Moreover, corresponding primitive values also have such delegated access, by way of *auto-boxing*.

### Automatic Objects

I've mentioned *auto-boxing* several times (including Chapters 1 and 2, and a few times so far in this chapter). It's finally time for us to explain that concept.

Accessing a property or method on a value requires that the value be an object. As we've already seen in Chapter 1, primitives *are not* objects, so JS needs to then temporarily convert/wrap such a primitive to its fundamental object counterpart[^AutoBoxing] to perform that access.

For example:

```js
myName = "Kyle";

myName.length;              // 4

myName.toUpperCase();       // "KYLE"
```

Accessing the `length` property or the `toUpperCase()` method, is only allowed on a primitive string value because JS *auto-boxes* the primitive `string` into a wrapper fundamental object, an instance of `new String(..)`. Otherwise, all such accesses would have to fail, since primitives do not have any properties.

More importantly, when the primitive value is *auto-boxed* to its fundamental object counterpart, those internally created objects have access to predefined properties/methods (like `length` and `toUpperCase()`) via a `[[Prototype]]` link to their respective fundamental object's prototype.

So an *auto-boxed* `string` is an instance of `new String()`, and is thus linked to `String.prototype`. Further, the same is true of `number` (wrapped as an instance of `new Number()`) and `boolean` (wrapped as an instance of `new Boolean()`).

Even though the `Symbol(..)` and `BigInt(..)` "constructors" (used without `new`produce primitive values, these primitive values can also be *auto-boxed* to their internal fundamental object wrapper forms, for the purposes of delegated access to properties/methods.

| NOTE: |
| :--- |
| See the "Objects & Classes" book of this series for more on `[[Prototype]]` linkages and delegated/inherited access to the fundamental object constructors' prototype objects. |

Since `null` and `undefined` have no corresponding fundamental objects, there is no *auto-boxing* of these values.

A subjective question to consider: is *auto-boxing* a form of coercion? I say it is, though some disagree. Internally, a primitive is converted to an object, meaning a change in value-type has occurred. Yes, it's temporary, but plenty of coercions are temporary. Moreover, the conversion is rather *implicit* (implied by the property/method access, but only happens internally). We'll revisit the nature of coercion in Chapter 4.
