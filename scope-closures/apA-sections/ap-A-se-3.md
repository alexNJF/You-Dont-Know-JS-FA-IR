# Hoisting: Functions and Variables

Chapter 5 articulated both *function hoisting* and *variable hoisting*. Since hoisting is often cited as mistake in the design of JS, I wanted to briefly explore why both these forms of hoisting *can* be beneficial and should still be considered.

Give hoisting a deeper level of consideration by considering the merits of:

* Executable code first, function declarations last
* Semantic placement of variable declarations

### Function Hoisting

To review, this program works because of *function hoisting*:

```js
getStudents();

// ..

function getStudents() {
    // ..
}
```

The `function` declaration is hoisted during compilation, which means that `getStudents` is an identifier declared for the entire scope. Additionally, the `getStudents` identifier is auto-initialized with the function reference, again at the beginning of the scope.

Why is this useful? The reason I prefer to take advantage of *function hoisting* is that it puts the *executable* code in any scope at the top, and any further declarations (functions) below. This means it's easier to find the code that will run in any given area, rather than having to scroll and scroll, hoping to find a trailing `}` marking the end of a scope/function somewhere.

I take advantage of this inverse positioning in all levels of scope:

```js
getStudents();

// *************

function getStudents() {
    var whatever = doSomething();

    // other stuff

    return whatever;

    // *************

    function doSomething() {
        // ..
    }
}
```

When I first open a file like that, the very first line is executable code that kicks off its behavior. That's very easy to spot! Then, if I ever need to go find and inspect `getStudents()`, I like that its first line is also executable code. Only if I need to see the details of `doSomething()` do I go and find its definition down below.

In other words, I think *function hoisting* makes code more readable through a flowing, progressive reading order, from top to bottom.

### Variable Hoisting

What about *variable hoisting*?

Even though `let` and `const` hoist, you cannot use those variables in their TDZ (see Chapter 5). So, the following discussion only applies to `var` declarations. Before I continue, I'll admit: in almost all cases, I completely agree that *variable hoisting* is a bad idea:

```js
pleaseDontDoThis = "bad idea";

// much later
var pleaseDontDoThis;
```

While that kind of inverted ordering was helpful for *function hoisting*, here I think it usually makes code harder to reason about.

But there's one exception that I've found, somewhat rarely, in my own coding. It has to do with where I place my `var` declarations inside a CommonJS module definition.

Here's how I typically structure my module definitions in Node:

```js
// dependencies
var aModuleINeed = require("very-helpful");
var anotherModule = require("kinda-helpful");

// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    // ..
});

// ********************************
// private implementation

var cache = { };
var otherData = [ ];

function getStudents() {
    // ..
}

function addStudents() {
    // ..
}
```

Notice how the `cache` and `otherData` variables are in the "private" section of the module layout? That's because I don't plan to expose them publicly. So I organize the module so they're located alongside the other hidden implementation details of the module.

But I've had a few rare cases where I needed the assignments of those values to happen *above*, before I declare the exported public API of the module. For instance:

```js
// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    refreshData: refreshData.bind(null,cache)
});
```

I need the `cache` variable to have already been assigned a value, because that value is used in the initialization of the public API (the `.bind(..)` partial-application).

Should I just move the `var cache = { .. }` up to the top, above this public API initialization? Well, perhaps. But now it's less obvious that `var cache` is a *private* implementation detail. Here's the compromise I've (somewhat rarely) used:

```js
cache = {};   // used here, but declared below

// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    refreshData: refreshData.bind(null,cache)
});

// ********************************
// private implementation

var cache /* = {}*/;
```

See the *variable hoisting*? I've declared the `cache` down where it belongs, logically, but in this rare case I've used it earlier up above, in the area where its initialization is needed. I even left a hint at the value that's assigned to `cache` in a code comment.

That's literally the only case I've ever found for leveraging *variable hoisting* to assign a variable earlier in a scope than its declaration. But I think it's a reasonable exception to employ with caution.