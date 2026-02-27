# Global This

Reviewing the JS environments we've looked at so far, a program may or may not:

* Declare a global variable in the top-level scope with `var` or `function` declarations—or `let`, `const`, and `class`.

* Also add global variables declarations as properties of the global scope object if `var` or `function` are used for the declaration.

* Refer to the global scope object (for adding or retrieving global variables, as properties) with `window`, `self`, or `global`.

I think it's fair to say that global scope access and behavior is more complicated than most developers assume, as the preceding sections have illustrated. But the complexity is never more obvious than in trying to nail down a universally applicable reference to the global scope object.

Yet another "trick" for obtaining a reference to the global scope object looks like:

```js
const theGlobalScopeObject =
    (new Function("return this"))();
```

| NOTE: |
| :--- |
| A function can be dynamically constructed from code stored in a string value with the `Function()` constructor, similar to `eval(..)` (see "Cheating: Runtime Scope Modifications" in Chapter 1). Such a function will automatically be run in non-strict-mode (for legacy reasons) when invoked with the normal `()` function invocation as shown; its `this` will point at the global object. See the third book in the series, *Objects & Classes*, for more information on determining `this` bindings. |

So, we have `window`, `self`, `global`, and this ugly `new Function(..)` trick. That's a lot of different ways to try to get at this global object. Each has its pros and cons.

Why not introduce yet another!?!?

As of ES2020, JS has finally defined a standardized reference to the global scope object, called `globalThis`. So, subject to the recency of the JS engines your code runs in, you can use `globalThis` in place of any of those other approaches.

We could even attempt to define a cross-environment polyfill that's safer across pre-`globalThis` JS environments, such as:

```js
const theGlobalScopeObject =
    (typeof globalThis != "undefined") ? globalThis :
    (typeof global != "undefined") ? global :
    (typeof window != "undefined") ? window :
    (typeof self != "undefined") ? self :
    (new Function("return this"))();
```

Phew! That's certainly not ideal, but it works if you find yourself needing a reliable global scope reference.

(The proposed name `globalThis` was fairly controversial while the feature was being added to JS. Specifically, I and many others felt the "this" reference in its name was misleading, since the reason you reference this object is to access to the global scope, never to access some sort of global/default `this` binding. There were many other names considered, but for a variety of reasons ruled out. Unfortunately, the name chosen ended up as a last resort. If you plan to interact with the global scope object in your programs, to reduce confusion, I strongly recommend choosing a better name, such as (the laughably long but accurate!) `theGlobalScopeObject` used here.)