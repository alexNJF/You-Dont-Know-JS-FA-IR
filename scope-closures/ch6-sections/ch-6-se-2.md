# Hiding in Plain (Function) Scope

It should now be clear why it's important to hide our variable and function declarations in the lowest (most deeply nested) scopes possible. But how do we do so?

We've already seen the `let` and `const` keywords, which are block scoped declarators; we'll come back to them in more detail shortly. But first, what about hiding `var` or `function` declarations in scopes? That can easily be done by wrapping a `function` scope around a declaration.

Let's consider an example where `function` scoping can be useful.

The mathematical operation "factorial" (notated as "6!") is the multiplication of a given integer against all successively lower integers down to `1`—actually, you can stop at `2` since multiplying `1` does nothing. In other words, "6!" is the same as "6 * 5!", which is the same as "6 * 5 * 4!", and so on. Because of the nature of the math involved, once any given integer's factorial (like "4!") has been calculated, we shouldn't need to do that work again, as it'll always be the same answer.

So if you naively calculate factorial for `6`, then later want to calculate factorial for `7`, you might unnecessarily re-calculate the factorials of all the integers from 2 up to 6. If you're willing to trade memory for speed, you can solve that wasted computation by caching each integer's factorial as it's calculated:

```js
var cache = {};

function factorial(x) {
    if (x < 2) return 1;
    if (!(x in cache)) {
        cache[x] = x * factorial(x - 1);
    }
    return cache[x];
}

factorial(6);
// 720

cache;
// {
//     "2": 2,
//     "3": 6,
//     "4": 24,
//     "5": 120,
//     "6": 720
// }

factorial(7);
// 5040
```

We're storing all the computed factorials in `cache` so that across multiple calls to `factorial(..)`, the previous computations remain. But the `cache` variable is pretty obviously a *private* detail of how `factorial(..)` works, not something that should be exposed in an outer scope—especially not the global scope.

| NOTE: |
| :--- |
| `factorial(..)` here is recursive—a call to itself is made from inside—but that's just for brevity of code sake; a non-recursive implementation would yield the same scoping analysis with respect to `cache`. |

However, fixing this over-exposure issue is not as simple as hiding the `cache` variable inside `factorial(..)`, as it might seem. Since we need `cache` to survive multiple calls, it must be located in a scope outside that function. So what can we do?

Define another middle scope (between the outer/global scope and the inside of `factorial(..)`) for `cache` to be located:

```js
// outer/global scope

function hideTheCache() {
    // "middle scope", where we hide `cache`
    var cache = {};

    return factorial;

    // **********************

    function factorial(x) {
        // inner scope
        if (x < 2) return 1;
        if (!(x in cache)) {
            cache[x] = x * factorial(x - 1);
        }
        return cache[x];
    }
}

var factorial = hideTheCache();

factorial(6);
// 720

factorial(7);
// 5040
```

The `hideTheCache()` function serves no other purpose than to create a scope for `cache` to persist in across multiple calls to `factorial(..)`. But for `factorial(..)` to have access to `cache`, we have to define `factorial(..)` inside that same scope. Then we return the function reference, as a value from `hideTheCache()`, and store it in an outer scope variable, also named `factorial`. Now as we call `factorial(..)` (multiple times!), its persistent `cache` stays hidden yet accessible only to `factorial(..)`!

OK, but... it's going to be tedious to define (and name!) a `hideTheCache(..)` function scope each time such a need for variable/function hiding occurs, especially since we'll likely want to avoid name collisions with this function by giving each occurrence a unique name. Ugh.

| NOTE: |
| :--- |
| The illustrated technique—caching a function's computed output to optimize performance when repeated calls of the same inputs are expected—is quite common in the Functional Programming (FP) world, canonically referred to as "memoization"; this caching relies on closure (see Chapter 7). Also, there are memory usage concerns (addressed in "A Word About Memory" in Appendix B). FP libraries will usually provide an optimized and vetted utility for memoization of functions, which would take the place of `hideTheCache(..)` here. Memoization is beyond the *scope* (pun intended!) of our discussion, but see my *Functional-Light JavaScript* book for more information. |

Rather than defining a new and uniquely named function each time one of those scope-only-for-the-purpose-of-hiding-a-variable situations occurs, a perhaps better solution is to use a function expression:

```js
var factorial = (function hideTheCache() {
    var cache = {};

    function factorial(x) {
        if (x < 2) return 1;
        if (!(x in cache)) {
            cache[x] = x * factorial(x - 1);
        }
        return cache[x];
    }

    return factorial;
})();

factorial(6);
// 720

factorial(7);
// 5040
```

Wait! This is still using a function to create the scope for hiding `cache`, and in this case, the function is still named `hideTheCache`, so how does that solve anything?

Recall from "Function Name Scope" (in Chapter 3), what happens to the name identifier from a `function` expression. Since `hideTheCache(..)` is defined as a `function` expression instead of a `function` declaration, its name is in its own scope—essentially the same scope as `cache`—rather than in the outer/global scope.

That means we can name every single occurrence of such a function expression the exact same name, and never have any collision. More appropriately, we can name each occurrence semantically based on whatever it is we're trying to hide, and not worry that whatever name we choose is going to collide with any other `function` expression scope in the program.

In fact, we *could* just leave off the name entirely—thus defining an "anonymous `function` expression" instead. But Appendix A will discuss the importance of names even for such scope-only functions.

### Invoking Function Expressions Immediately

There's another important bit in the previous factorial recursive program that's easy to miss: the line at the end of the `function` expression that contains `})();`.

Notice that we surrounded the entire `function` expression in a set of `( .. )`, and then on the end, we added that second `()` parentheses set; that's actually calling the `function` expression we just defined. Moreover, in this case, the first set of surrounding `( .. )` around the function expression is not strictly necessary (more on that in a moment), but we used them for readability sake anyway.

So, in other words, we're defining a `function` expression that's then immediately invoked. This common pattern has a (very creative!) name: Immediately Invoked Function Expression (IIFE).

An IIFE is useful when we want to create a scope to hide variables/functions. Since it's an expression, it can be used in **any** place in a JS program where an expression is allowed. An IIFE can be named, as with `hideTheCache()`, or (much more commonly!) unnamed/anonymous. And it can be standalone or, as before, part of another statement—`hideTheCache()` returns the `factorial()` function reference which is then `=` assigned to the variable `factorial`.

For comparison, here's an example of a standalone IIFE:

```js
// outer scope

(function(){
    // inner hidden scope
})();

// more outer scope
```

Unlike earlier with `hideTheCache()`, where the outer surrounding `(..)` were noted as being an optional stylistic choice, for a standalone IIFE they're **required**; they distinguish the `function` as an expression, not a statement. For consistency, however, always surround an IIFE `function` with `( .. )`.

| NOTE: |
| :--- |
| Technically, the surrounding `( .. )` aren't the only syntactic way to ensure the `function` in an IIFE is treated by the JS parser as a function expression. We'll look at some other options in Appendix A. |

#### Function Boundaries

Beware that using an IIFE to define a scope can have some unintended consequences, depending on the code around it. Because an IIFE is a full function, the function boundary alters the behavior of certain statements/constructs.

For example, a `return` statement in some piece of code would change its meaning if an IIFE is wrapped around it, because now the `return` would refer to the IIFE's function. Non-arrow function IIFEs also change the binding of a `this` keyword—more on that in the *Objects & Classes* book. And statements like `break` and `continue` won't operate across an IIFE function boundary to control an outer loop or block.

So, if the code you need to wrap a scope around has `return`, `this`, `break`, or `continue` in it, an IIFE is probably not the best approach. In that case, you might look to create the scope with a block instead of a function.