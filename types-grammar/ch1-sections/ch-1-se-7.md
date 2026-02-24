## Symbol Values

The `symbol` type contains special opaque values called "symbols". These values can only be created by the `Symbol(..)` function:

```js
secret = Symbol("my secret");
```

| WARNING: |
| :--- |
| Just as with `BigInt(..)`, the `Symbol(..)` function must be called without the `new` keyword. |

The `"my secret"` string passed into the `Symbol(..)` function call is *not* the symbol value itself, even though it seems that way. It's merely an optional descriptive label, used only for debugging purposes for the benefit of the developer.

The underlying value returned from `Symbol(..)` is a special kind of value that resists the program/developer inspecting anything about its underlying representation. That's what I mean by "opaque".

| NOTE: |
| :--- |
| You could think of symbols as if they are monotonically incrementing integer numbers -- indeed, that's similar to how at least some JS engines implement them. But the JS engine will never expose any representation of a symbol's underlying value in any way that you or the program can see. |

Symbols are guaranteed by the JS engine to be unique (only within the program itself), and are unguessable. In other words, a duplicate symbol value can never be created in a program.

You might be wondering at this point what symbols are used for?

One typical usage is as "special" values that the developer distinguishes from any other values that could accidentally collide. For example:

```js
EMPTY = Symbol("not set yet");
myNickname = EMPTY;

// later:

if (myNickname == EMPTY) {
    // ..
}
```

Here, I've defined a special `EMPTY` value and initialized `myNickname` to it. Later, I check to see if it's still that special value, and then perform some action if so. I might not want to have used `null` or `undefined` for such purposes, as another developer might be able to pass in one of those common built-in values. `EMPTY` by contrast here is a unique, unguessable value that only I've defined and have control over and access to.

Perhaps even more commonly, symbols are often used as special (meta-) properties on objects:

```js
myInfo = {
    name: "Kyle Simpson",
    nickname: "getify",
    age: 42
};

// later:
PRIVATE_ID = Symbol("private unique ID, don't touch!");

myInfo[PRIVATE_ID] = generateID();
```

It's important to note that symbol properties are still publicly visible on any object; they're not *actually* private. But they're treated as special and set-apart from the normal collection of object properties. It's similar to if I had done instead:

```js
Object.defineProperty(myInfo,"__private_id_dont_touch",{
    value: generateID(),
    enumerable: false,
});
```

By convention only, most developers know that if a property name is prefixed with `_` (or even more so, `__`!), that means it's "pseudo-private" and to leave it alone unless they're really supposed to access it.

Symbols basically serve the same use-case, but a bit more ergonomically than the prefixing approach.

### Well-Known Symbols (WKS)

JS pre-defines a set of symbols, referred to as *well-known symbols* (WKS), that represent certain special meta-programming hooks on objects. These symbols are stored as static properties on the `Symbol` function object. For example:

```js
myInfo = {
    // ..
};

String(myInfo);         // [object Object]

myInfo[Symbol.toStringTag] = "my-info";
String(myInfo);         // [object my-info]
```

`Symbol.toStringTag` is a well-known symbol for accessing and overriding the default string representation of a plain object (`"[object Object]"`), replacing the `"Object"` part with a different value (e.g., `"my-info"`).

See the "Objects & Classes" book of this series for more information about Well-Known Symbols and metaprogramming.

### Global Symbol Registry

Often, you want to keep symbol values private, such as inside a module scope. But occasionally, you want to expose them so they're accessible globally throughout all the files in a JS program.

Instead of just attaching them as global variables (i.e., properties on the `globalThis` object), JS provides an alternate *global namespace* to register symbols in:

```js
// retrieve if already registered,
// otherwise register
PRIVATE_ID = Symbol.for("private-id");

// elsewhere:

privateIDKey = Symbol.keyFor(PRIVATE_ID);
privateIDKey;           // "private-id"

// elsewhere:

// retrieve symbol from registry undeer
// specified key
privateIDSymbol = Symbol.for(privateIDKey);
```

The value passed to `Symbol.for(..)` is *not* the same as passed to `Symbol(..)`. `Symbol.for(..)` expects a unique *key* for the symbol to be registered under in the global registry, whereas `Symbol(..)` optionally accepts a descriptive label (not necessarily unique).

If the registry doesn't have a symbol under that specified *key*, a new symbol (with no descriptive label) is created and automatically registered there. Otherwise, `Symbol.for(..)` returns whatever previously registered symbol is under that *key*.

Going in the opposite direction, if you have the symbol value itself, and want to retrieve the *key* it's registered under, `Symbol.keyFor(..)` takes the symbol itself as input, and returns the *key* (if any). That's useful in case it's more convenient to pass around the *key* string value than the symbol itself.

### Object or Primitive?

Unlike other primitives like `42`, where you can create multiple copies of the same value, symbols *do* act more like specific object references in that they're always completely unique (for purposes of value assignment and equality comparison). The specification also categorizes the `Symbol()` function under the "Fundamental Objects" section, calling the function a "constructor", and even defining its `prototype` property.

However, as mentioned earlier, `new` cannot be used with `Symbol(..)`; this is similar to the `BigInt()` "constructor". We clearly know `bigint` values are primitives, so `symbol` values seem to be of the same *kind*.

And in the specification's "Terms and Definitions", it lists symbol as a primitive value. [^PrimitiveValues] Moreover, the values themselves are used in JS programs as primitives rather than objects. For example, symbols are primarily used as keys in objects -- we know objects cannot use other object values as keys! -- along with strings, which are also primitives.

As mentioned earlier, some JS engines even internally implement symbols as unique, monotonically incrementing integers (primitives!).

Finally, as explained at the top of this chapter, we know primitive values are *not allowed* to have properties set on them, but are *auto-boxed* (see "Automatic Objects" in Chapter 3) internally to the corresponding object-wrapper type to facilitate property/method access. Symbols follow all these exact behaviors, the same as all the other primitives.

All this considered, I think symbols are *much more* like primitives than objects, so that's how I present them in this book.
