# When Can I Use a Variable?

At what point does a variable become available to use within its scope? There may seem to be an obvious answer: *after* the variable has been declared/created. Right? Not quite.

Consider:

```js
greeting();
// Hello!

function greeting() {
    console.log("Hello!");
}
```

This code works fine. You may have seen or even written code like it before. But did you ever wonder how or why it works? Specifically, why can you access the identifier `greeting` from line 1 (to retrieve and execute a function reference), even though the `greeting()` function declaration doesn't occur until line 4?

Recall Chapter 1 points out that all identifiers are registered to their respective scopes during compile time. Moreover, every identifier is *created* at the beginning of the scope it belongs to, **every time that scope is entered**.

The term most commonly used for a variable being visible from the beginning of its enclosing scope, even though its declaration may appear further down in the scope, is called **hoisting**.

But hoisting alone doesn't fully answer the question. We can see an identifier called `greeting` from the beginning of the scope, but why can we **call** the `greeting()` function before it's been declared?

In other words, how does the variable `greeting` have any value (the function reference) assigned to it, from the moment the scope starts running? The answer is a special characteristic of formal `function` declarations, called *function hoisting*. When a `function` declaration's name identifier is registered at the top of its scope, it's additionally auto-initialized to that function's reference. That's why the function can be called throughout the entire scope!

One key detail is that both *function hoisting* and `var`-flavored *variable hoisting* attach their name identifiers to the nearest enclosing **function scope** (or, if none, the global scope), not a block scope.

| NOTE: |
| :--- |
| Declarations with `let` and `const` still hoist (see the TDZ discussion later in this chapter). But these two declaration forms attach to their enclosing block rather than just an enclosing function as with `var` and `function` declarations. See "Scoping with Blocks" in Chapter 6 for more information. |

### Hoisting: Declaration vs. Expression

*Function hoisting* only applies to formal `function` declarations (specifically those which appear outside of blocks—see "FiB" in Chapter 6), not to `function` expression assignments. Consider:

```js
greeting();
// TypeError

var greeting = function greeting() {
    console.log("Hello!");
};
```

Line 1 (`greeting();`) throws an error. But the *kind* of error thrown is very important to notice. A `TypeError` means we're trying to do something with a value that is not allowed. Depending on your JS environment, the error message would say something like, "'undefined' is not a function," or more helpfully, "'greeting' is not a function."

Notice that the error is **not** a `ReferenceError`. JS isn't telling us that it couldn't find `greeting` as an identifier in the scope. It's telling us that `greeting` was found but doesn't hold a function reference at that moment. Only functions can be invoked, so attempting to invoke some non-function value results in an error.

But what does `greeting` hold, if not the function reference?

In addition to being hoisted, variables declared with `var` are also automatically initialized to `undefined` at the beginning of their scope—again, the nearest enclosing function, or the global. Once initialized, they're available to be used (assigned to, retrieved from, etc.) throughout the whole scope.

So on that first line, `greeting` exists, but it holds only the default `undefined` value. It's not until line 4 that `greeting` gets assigned the function reference.

Pay close attention to the distinction here. A `function` declaration is hoisted **and initialized to its function value** (again, called *function hoisting*). A `var` variable is also hoisted, and then auto-initialized to `undefined`. Any subsequent `function` expression assignments to that variable don't happen until that assignment is processed during runtime execution.

In both cases, the name of the identifier is hoisted. But the function reference association isn't handled at initialization time (beginning of the scope) unless the identifier was created in a formal `function` declaration.

### Variable Hoisting

Let's look at another example of *variable hoisting*:

```js
greeting = "Hello!";
console.log(greeting);
// Hello!

var greeting = "Howdy!";
```

Though `greeting` isn't declared until line 5, it's available to be assigned to as early as line 1. Why?

There's two necessary parts to the explanation:

* the identifier is hoisted,
* **and** it's automatically initialized to the value `undefined` from the top of the scope.

| NOTE: |
| :--- |
| Using *variable hoisting* of this sort probably feels unnatural, and many readers might rightly want to avoid relying on it in their programs. But should all hoisting (including *function hoisting*) be avoided? We'll explore these different perspectives on hoisting in more detail in Appendix A. |