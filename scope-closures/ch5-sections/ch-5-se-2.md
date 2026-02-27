# Hoisting: Yet Another Metaphor

Chapter 2 was full of metaphors (to illustrate scope), but here we are faced with yet another: hoisting itself. Rather than hoisting being a concrete execution step the JS engine performs, it's more useful to think of hoisting as a visualization of various actions JS takes in setting up the program **before execution**.

The typical assertion of what hoisting means: *lifting*—like lifting a heavy weight upward—any identifiers all the way to the top of a scope. The explanation often asserted is that the JS engine will actually *rewrite* that program before execution, so that it looks more like this:

```js
var greeting;           // hoisted declaration
greeting = "Hello!";    // the original line 1
console.log(greeting);  // Hello!
greeting = "Howdy!";    // `var` is gone!
```

The hoisting (metaphor) proposes that JS pre-processes the original program and re-arranges it a bit, so that all the declarations have been moved to the top of their respective scopes, before execution. Moreover, the hoisting metaphor asserts that `function` declarations are, in their entirety, hoisted to the top of each scope. Consider:

```js
studentName = "Suzy";
greeting();
// Hello Suzy!

function greeting() {
    console.log(`Hello ${ studentName }!`);
}
var studentName;
```

The "rule" of the hoisting metaphor is that function declarations are hoisted first, then variables are hoisted immediately after all the functions. Thus, the hoisting story suggests that program is *re-arranged* by the JS engine to look like this:

```js
function greeting() {
    console.log(`Hello ${ studentName }!`);
}
var studentName;

studentName = "Suzy";
greeting();
// Hello Suzy!
```

This hoisting metaphor is convenient. Its benefit is allowing us to hand wave over the magical look-ahead pre-processing necessary to find all these declarations buried deep in scopes and somehow move (hoist) them to the top; we can just think about the program as if it's executed by the JS engine in a **single pass**, top-down.

Single-pass definitely seems more straightforward than Chapter 1's assertion of a two-phase processing.

Hoisting as a mechanism for re-ordering code may be an attractive simplification, but it's not accurate. The JS engine doesn't actually re-arrange the code. It can't magically look ahead and find declarations; the only way to accurately find them, as well as all the scope boundaries in the program, would be to fully parse the code.

Guess what parsing is? The first phase of the two-phase processing! There's no magical mental gymnastics that gets around that fact.

So if the hoisting metaphor is (at best) inaccurate, what should we do with the term? I think it's still useful—indeed, even members of TC39 regularly use it!—but I don't think we should claim it's an actual re-arrangement of source code.

| WARNING: |
| :--- |
| Incorrect or incomplete mental models often still seem sufficient because they can occasionally lead to accidental right answers. But in the long run it's harder to accurately analyze and predict outcomes if your thinking isn't particularly aligned with how the JS engine works. |

I assert that hoisting *should* be used to refer to the **compile-time operation** of generating runtime instructions for the automatic registration of a variable at the beginning of its scope, each time that scope is entered.

That's a subtle but important shift, from hoisting as a runtime behavior to its proper place among compile-time tasks.