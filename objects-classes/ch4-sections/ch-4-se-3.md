# An Arrow Points Somewhere

Everything I've asserted so far about `this` in functions, and how its determined based on the call-site, makes one giant assumption: that you're dealing with a *regular* function (or method).

So what's an *irregular* function?!? It looks like this:

```js
const x = x => x <= x;
```

| NOTE: |
| :--- |
| Yes, I'm being a tad sarcastic and unfair to call an arrow function "irregular" and to use such a contrived example. It's a joke, ok? |

Here's a real example of an `=>` arrow function:

```js
const clickHandler = evt =>
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
```

For comparison sake, let me also show the non-arrow equivalent:

```js
const clickHandler = function(evt) {
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
};
```

Or if we went a bit old-school about it -- this is my jam! -- we could try the standalone function declaration form:

```js
function clickHandler(evt) {
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
}
```

Or if the function appeared as a method in a `class` definition, or as a concise method in an object literal, it would look like this:

```js
// ..
clickHandler(evt) {
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
}
```

What I really want to focus on is how each of these forms of the function will behave with respect to their `this` reference, and whether the first `=>` form differs from the others (hint: it does!). But let's start with a little quiz to see if you've been paying attention.

For each of those function forms just shown, how do we know what each `this` will reference?

### Where's The Call-site?

Hopefully, you responded with something like: "first, we need to see how the functions are called."

Fair enough.

Let's say our program looks like this:

```js
var infoForm = {
    theFormElem: null,
    theSubmitBtn: null,

    init() {
        this.theFormElem =
            document.getElementById("the-info-form");
        this.theSubmitBtn =
            theFormElem.querySelector("button[type=submit]");

        // is *this* the call-site?
        this.theSubmitBtn.addEventListener(
            "click",
            this.clickHandler,
            false
        );
    },

    // ..
}
```

Ah, interesting. Half of you readers have never seen actual DOM API code like `getElementById(..)`, `querySelector(..)`, and `addEventListener(..)` before. I heard the confusion bells whistle just now!

| NOTE: |
| :--- |
| Sorry, I'm dating myself, here. I've been doing this stuff long enough that I remember when we did that kind of code long before we had utilities like jQuery cluttering up the code with `$` everywhere. And after many years of front-end evolution, we seem to have landed somewhere quite a bit more "modern" -- at least, that's the prevailing presumption. |

I'm guessing many of you these days are used to seeing component-framework code (React, etc) somewhat like this:

```jsx
// ..

infoForm(props) {
    return (
        <form ref={this.theFormElem}>
            <button type=submit onClick=this.clickHandler>
                Click Me
            </button>
        </form>
    );
}

// ..
```

Of course, there's a bunch of other ways that code might be shaped, depending on if you're using one framework or another, etc.

Or maybe you're not even using `class` / `this` style components anymore, because you've moved everything to hooks and closures. In any case, for our discussion purposes, *this* chapter is all about `this`, so we need to stick to a coding style like the above, to have code related to the discussion.

And neither of those two previous code snippets show the `clickHandler` function being defined. But I've said repeatedly so far, that doesn't matter; all that matters is ... what? say it with me... all that matters is *how* the function is invoked.

So how is `clickHandler` being invoked? What's the call-site, and which context assignment rule does it match?

### Hidden From Sight

If you're stuck, don't worry. I'm deliberately making this difficult, to point something very important out.

When the `"click"` or `onClick=` event handler bindings happen, in both cases, we specified `this.clickHandler`, which implies that there is a `this` context object with a property on it called `clickHandler`, which is holding our function definition.

So, is `this.clickHandler` the call-site? If it was, what assignment rule applies? The *implicit context* rule (#3)?

Unfortunately, no.

The problem is, **we cannot actually see the call-site** in this program. Uh oh.

If we can't see the call-site, how do we know *how* the function is going to actually get called?

*That's* the exact point I'm making.

It doesn't matter that we passed in `this.clickHandler`. That is merely a reference to a function object value. It's not a call-site.

Under the covers, somewhere inside a framework, library, or even the JS environment itself, when a user clicks the button, a reference to the `clickHandler(..)` function is going to be invoked. And as we've implied, that call-site is even going to pass in the DOM event object as the `evt` argument.

Since we can't see the call-site, we have to *imagine* it. Might it look like...?

```js
// ..
eventCallback( domEventObj );
// ..
```

If it did, which `this` rule would apply? The *default context* rule (#4)?

Or, what if the call-site looked like this...?

```js
// ..
eventCallback.call( domElement, domEventObj );
```

Now which `this` rule would apply? The *explicit context* rule (#2)?

Unless you open and view the source code for the framework/library, or read the documentation/specification, you won't *know* what to expect of that call-site. Which means that predicting, ultimately, what `this` points to in the `clickHandler` function you write, is... to put it mildly... a bit convoluted.

### *This* Is Wrong

To spare you any more pain here, I'll cut to the chase.

Pretty much all implementations of a click-handler mechanism are going to do something like the `.call(..)`, and they're going to set the DOM element (e.g., button) the event listener is bound to, as the *explicit context* for the invocation.

Hmmm... is that ok, or is that going to be a problem?

Recall that our `clickHandler(..)` function is `this`-aware, and that its `this.theFormElem` reference implies referencing an object with a `theFormElem` property, which in turn is pointing at the parent `<form>` element. DOM buttons do not, by default, have a `theFormElem` property on them.

In other words, the `this` reference that our event handler will have set for it is almost certainly wrong. Oops.

Unless we want to rewrite the `clickHandler` function, we're going to need to fix that.

### Fixing `this`

Let's consider some options to address the mis-assignment. To keep things focused, I'll stick to this style of event binding for the discussion:

```js
this.submitBtnaddEventListener(
    "click",
    this.clickHandler,
    false
);
```

Here's one way to address it:

```js
// store a fixed reference to the current
// `this` context
var context = this;

this.submitBtn.addEventListener(
    "click",
    function handler(evt){
        return context.clickHandler(evt);
    },
    false
);
```

| TIP: |
| :--- |
| Most older JS code that uses this approach will say something like `var self = this` instead of the `context` name I'm giving it here. "Self" is a shorter word, and sounds cooler. But it's also entirely the wrong semantic meaning. The `this` keyword is not a "self" reference to the function, but rather the context for that current function invocation. Those may seem like the same thing at a glance, but they're completely different concepts, as different as apples and a Beatles song. So... to paraphrase them, "Hey developer, don't make it bad. Take a sad `self` and make it better `context`." |

What's going on here? I recognized that the enclosing code, where the `addEventListener` call is going to run, has a current `this` context that is correct, and we need to ensure that same `this` context is applied when `clickHandler(..)` gets invoked.

I defined a surrounding function (`handler(..)`) and then forced the call-site to look like:

```js
context.clickHandler(evt);
```

| TIP: |
| :--- |
| Which `this` context assignment rule is applied here? That's right, the *implicit context* rule (#3). |

Now, it doesn't matter what the internal call-site of the library/framework/environment looks like. But, why?

Because we're now *actually* in control of the call-site. It doesn't matter how `handler(..)` gets invoked, or what its `this` is assigned. It only matters than when `clickHandler(..)` is invoked, the `this` context is set to what we wanted.

I pulled off that trick not only by defining a surrounding function (`handler(..)`) so I can control the call-site, but... and this is important, so don't miss it... I defined `handler(..)` as a NON-`this`-aware function! There's no `this` keyword inside of `handler(..)`, so whatever `this` gets set (or not) by the library/framework/environment, is completely irrelevant.

The `var context = this` line is critical to the trick. It defines a lexical variable `context`, which is not some special keyword, holding a snapshot of the value in the outer `this`. Then inside `clickHandler`, we merely reference a lexical variable (`context`), no relative/magic `this` keyword.

### Lexical This

The name for this pattern, by the way, is "lexical this", meaning a `this` that behaves like a lexical scope variable instead of like a dynamic context binding.

But it turns out JS has an easier way of performing the "lexical this" magic trick. Are you ready for the trick reveal!?

...

The `=>` arrow function! Tada!

That's right, the `=>` function is, unlike all other function forms, special, in that it's not special at all. Or, rather, that it doesn't define anything special for `this` behavior whatsoever.

In an `=>` function, the `this` keyword... **is not a keyword**. It's absolutely no different from any other variable, like `context` or `happyFace` or `foobarbaz`.

Let me illustrate *this* point more directly:

```js
function outer() {
    console.log(this.value);

    // define a return an "inner"
    // function
    var inner = () => {
        console.log(this.value);
    };

    return inner;
}

var one = {
    value: 42,
};
var two = {
    value: "sad face",
};

var innerFn = outer.call(one);
// 42

innerFn.call(two);
// 42   <-- not "sad face"
```

The `innerFn.call(two)` would, for any *regular* function definition, have resulted in `"sad face"` here. But since the `inner` function we defined and returned (and assigned to `innerFn`) was an *irregular* `=>` arrow function, it has no special `this` behavior, but instead has "lexical this" behavior.

When the `innerFn(..)` (aka `inner(..)`) function is invoked, even with an *explicit context* assignment via `.call(..)`, that assignment is ignored.

| NOTE: |
| :--- |
| I'm not sure why `=>` arrow functions even have a `call(..)` / `apply(..)` on them, since they are silent no-op functions. I guess it's for consistency with normal functions. But as we'll see later, there are other inconsistencies between *regular* functions and *irregular* `=>` arrow functions. |

When a `this` is encountered (`this.value`) inside an `=>` arrow function, `this` is treated like a normal lexical variable, not a special keyword. And since there is no `this` variable in that function itself, JS does what it always does with lexical variables: it goes up one level of lexical scope -- in this case, to the surrounding `outer(..)` function, and it checks to see if there's any registered `this` in that scope.

Luckily, `outer(..)` is a *regular* function, which means it has a normal `this` keyword. And the `outer.call(one)` invocation assigned `one` to its `this`.

So, `innerFn.call(two)` is invoking `inner()`, but when `inner()` looks up a value for `this`, it gets... `one`, not `two`.

#### Back To The... Button

You thought I was going to make a pun joke and say "future" there, didn't you!?

A more direct and appropriate way of solving our earlier issue, where we had done `var context = this` to get a sort of faked "lexical this" behavior, is to use the `=>` arrow function, since its primary design feature is... "lexical this".

```js
this.submitBtn.addEventListener(
    "click",
    evt => this.clickHandler(evt),
    false
);
```

Boom! Problem solved! Mic drop!

Hear me on *this*: the `=>` arrow function is *not* -- I repeat, *not* -- about typing fewer characters. The primary point of the `=>` function being added to JS was to give us "lexical this" behavior without having to resort to `var context = this` (or worse, `var self = this`) style hacks.

| TIP: |
| :--- |
| If you need "lexical this", always prefer an `=>` arrow function. If you don't need "lexical this", well... the `=>` arrow function might not be the best tool for the job. |

#### Confession Time

I've said all along in this chapter, that how you write a function, and where you write the function, has *nothing* to do with how its `this` will be assigned.

For regular functions, that's true. But when we consider an irregular `=>` arrow function, it's not entirely accurate anymore.

Recall the original `=>` form of `clickHandler` from earlier in the chapter?

```js
const clickHandler = evt =>
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
```

If we use that form, in the same context as our event binding, it could look like this:

```js
const clickHandler = evt =>
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();

this.submitBtn.addEventListener("click",clickHandler,false);
```

A lot of developers prefer to even further reduce it, to an inline `=>` arrow function:

```js
this.submitBtn.addEventListener(
    "click",
    evt => evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation(),
    false
);
```

When we write an `=>` arrow function, we know for sure that its `this` binding will exactly be the current `this` binding of whatever surrounding function is running, regardless of what the call-site of the `=>` arrow function looks like. So in other words, *how* we wrote the `=>` arrow function, and *where* we wrote it, does matter.

That doesn't fully answer the `this` question, though. It just shifts the question to *how the enclosing function was invoked*. Actually, the focus on the call-site is still the only thing that matters.

But the nuance I'm confessing to having omitted until *this* moment is: it matters *which* call-site we consider, not just *any* call-site in the current call stack. The call-site that matters is, the nearest function-invocation in the current call stack ***that actually assigns a `this` context***.

Since an `=>` arrow function never has a `this`-assigning call-site (no matter what), that call-site isn't relevant to the question. We have to keep stepping up the call stack until we find a function invocation that *is* `this`-assigning -- even if such invoked function is not itself `this`-aware.

**THAT** is the only call-site that matters.

#### Find The Right Call-Site

Let me illustrate, with a convoluted mess of a bunch of nested functions/calls:

```js
globalThis.value = { result: "Sad face" };

function one() {
    function two() {
        var three = {
            value: { result: "Hmmm" },

            fn: () => {
                const four = () => this.value;
                return four.call({
                    value: { result: "OK", },
                });
            },
        };
        return three.fn();
    };
    return two();
}

new one();          // ???
```

Can you run through that (nightmare) in your head and determine what will be returned from the `new one()` invocation?

It could be any of these:

```js
// from `four.call(..)`:
{ result: "OK" }

// or, from `three` object:
{ result: "Hmmm" }

// or, from the `globalThis.value`:
{ result: "Sad face" }

// or, empty object from the `new` call:
{}
```

The call-stack for that `new one()` invocation is:

```
four         |
three.fn     |
two          | (this = globalThis)
one          | (this = {})
[ global ]   | (this = globalThis)
```

Since `four()` and `fn()` are both `=>` arrow functions, the `three.fn()` and `four.call(..)` call-sites are not `this`-assigning; thus, they're irrelevant for our query. What's the next invocation to consider in the call-stack? `two()`. That's a regular function (it can accept `this`-assignment), and the call-site matches the *default context* assignment rule (#4). Since we're not in strict-mode, `this` is assigned `globalThis`.

When `four()` is running, `this` is just a normal variable. It looks then to its containing function (`three.fn()`), but it again finds a function with no `this`. So it goes up another level, and finds a `two()` *regular* function that has a `this` defined. And that `this` is `globalThis`. So the `this.value` expression resolves to `globalThis.value`, which returns us... `{ result: "Sad face" }`.

...

Take a deep breath. I know that's a lot to mentally process. And in fairness, that's a super contrived example. You'll almost never see all that complexity mixed in one call-stack.

But you absolutely will find mixed call-stacks in real programs. You need to get comfortable with the analysis I just illustrated, to be able to unwind the call-stack until you find the most recent `this`-assigning call-site.

Remember the addage I quoted earlier: "with great power comes great responsibility". Choosing `this`-oriented code (even `class`es) means choosing both the flexibility it affords us, as well as needing to be comfortable navigating the call-stack to understand how it will behave.

That's the only way to effectively write (and later read!) `this`-aware code.

### This Is Bound To Come Up

Backing up a bit, there's another option if you don't want to use an `=>` arrow function's "lexical this" behavior to address the button event handler functionality.

In addition to `call(..)` / `apply(..)` -- these invoke functions, remember! -- JS functions also have a third utility built in, called `bind(..)` -- which does *not* invoke the function, just to be clear.

The `bind(..)` utility defines a *new* wrapped/bound version of a function, where its `this` is preset and fixed, and cannot be overridden with a `call(..)` or `apply(..)`, or even an *implicit context* object at the call-site:

```js
this.submitBtn.addEventListener(
    "click",
    this.clickHandler.bind(this),
    false
);
```

Since I'm passing in a `this`-bound function as the event handler, it similarly doesn't matter how that utility tries to set a `this`, because I've already forced the `this` to be what I wanted: the value of `this` from the surrounding function invocation context.

#### Hardly New

This pattern is often referred to as "hard binding", since we're creating a function reference that is strongly bound to a particular `this`. A lot of JS writings have claimed that the `=>` arrow function is essentially just syntax for the `bind(this)` hard-binding. It's not. Let's dig in.

If you were going to create a `bind(..)` utility, it might look kinda like *this*:

```js
function bind(fn,context) {
    return function bound(...args){
        return fn.apply(context,args);
    };
}
```

| NOTE: |
| :--- |
| This is not actually how `bind(..)` is implemented. The behavior is more sophisticated and nuanced. I'm only illustrating one portion of its behavior in this snippet. |

Does that look familiar? It's using the good ol' fake "lexical this" hack. And under the covers, it's an *explicit context* assignment, in this case via `apply(..)`.

So wait... doesn't that mean we could just do it with an `=>` arrow function?

```js
function bind(fn,context) {
    return (...args) => fn.apply(context,args);
}
```

Eh... not quite. As with most things in JS, there's a bit of nuance. Let me illustrate:

```js
// candidate implementation, for comparison
function fakeBind(fn,context) {
    return (...args) => fn.apply(context,args);
}

// test subject
function thisAwareFn() {
    console.log(`Value: ${this.value}`);
}

// control data
var obj = {
    value: 42,
};

// experiment
var f = thisAwareFn.bind(obj);
var g = fakeBind(thisAwareFn,obj);

f();            // Value: 42
g();            // Value: 42

new f();        // Value: undefined
new g();        // <--- ???
```

First, look at the `new f()` call. That's admittedly a strange usage, to call `new` on a hard-bound function. It's probably quite rare that you'd ever do so. But it shows something kind of interesting. Even though `f()` was hard-bound to a `this` context of `obj`, the `new` operator was able to hijack the hard-bound function's `this` and re-bind it to the newly created and empty object. That object has no `value` property, which is why we see `"Value: undefined"` printed out.

If that feels strange, I agree. It's a weird corner nuance. It's not something you'd likely ever exploit. But I point it out not just for trivia. Refer back to the four rules presented earlier in this chapter. Remember how I asserted their order-of-precedence, and `new` was at the top (#1), ahead of *explicit* `call(..)` / `apply(..)` assignment rule (#2)?

Since we can sort of think of `bind(..)` as a variation of that rule, we now see that order-of-precedence proven. `new` is more precedent than, and can override, even a hard-bound function. Sort of makes you think the hard-bound function is maybe not so "hard"-bound, huh?!

But... what's going to happen with the `new g()` call, which is invoking `new` on the returned `=>` arrow function? Do you predict the same outcome as `new f()`?

Sorry to disappoint.

That line will actually throw an exception, because an `=>` function cannot be used with the `new` keyword.

But why? My best answer, not being authoritative on TC39 myself, is that conceptually and actually, an `=>` arrow function is not a function with a hard-bound `this`, it's a function that has no `this` at all. As such, `new` makes no sense against such a function, so JS just disallows it.

| NOTE: |
| :--- |
| Recall earlier, when I pointed out that `=>` arrow functions have `call(..)`, `apply(..)`, and indeed even a `bind(..)`. But we've see that such functions basically ignore these utilities as no-ops. It's a bit strange, in my opinion, that `=>` arrow functions have all those utilities as pass-through no-ops, but for the `new` keyword, that's not just, again, a no-op pass-through, but rather disallowed with an exception. |

But the main point is: an `=>` arrow function is *not* a syntactic form of `bind(this)`.

### Losing This Battle

Returning once again to our button event handler example:

```js
this.submitBtnaddEventListener(
    "click",
    this.clickHandler,
    false
);
```

There's a deeper concern we haven't yet addressed.

We've seen several different approaches to construct a different callback function reference to pass in there, in place of `this.clickHandler`.

But whichever of those ways we choose, they are producing literally a different function, not just an in-place modification to our existing `clickHandler` function.

Why does that matter?

Well, first of all, the more functions we create (and re-create), the more processing time (very slight) and the more memory (pretty small, usually) we're chewing up. And when we're re-creating a function reference, and throwing an old one away, that's also leaving un-reclaimed memory sitting around, which puts pressure on the garbage collector (GC) to more often, pause the universe of our program momentarily while it cleans up and reclaims that memory.

If hooking up this event listening is a one-time operation, no big deal. But if it's happening over and over again, the system-level performance effects *can* start to add up. Ever had an otherwise smooth animation jitter? That was probably the GC kicking in, cleaning up a bunch of reclaimable memory.

But another concern is, for things like event handlers, if we're going to remove an event listener at some later time, we need to keep a reference to the exact same function we attached originally. If we're using a library/framework, often (but not always!) they take care of that little dirty-work detail for you. But otherwise, it's on us to make sure that whatever function we plan to attach, we hold onto a reference just in case we need it later.

So the point I'm making is: presetting a `this` assignment, no matter how you do it, so that it's predictable, comes with a cost. A system level cost and a program maintenance/complexity cost. It is *never* free.

One way of reacting to that fact is to decide, OK, we're just going to manufacture all those `this`-assigned function references once, ahead of time, up-front. That way, we're sure to reduce both the system pressure, and the code pressure, to a minimum.

Sounds reasonable, right? Not so fast.

#### Pre-Binding Function Contexts

If you have a one-off function reference that needs to be `this`-bound, and you use an `=>` arrow or a `bind(this)` call, I don't see any problems with that.

But if most or all of the `this`-aware functions in a segment of your code invoked in ways where the `this` isn't the predictable context you expect, and so you decide you need to hard-bind them all... I think that's a big warning signal that you're going about things the wrong way.

Please recall the discussion in the "Avoid This" section from Chapter 3, which started with this snippet of code:

```js
class Point2d {
    x = null
    getDoubleX = () => this.x * 2

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    toString() { /* .. */ }
}

var point = new Point2d(3,4);
```

Now imagine we did this with that code:

```js
const getX = point.getDoubleX;

// later, elsewhere

getX();         // 6
```

As you can see, the problem we were trying to solve is the same as we've been dealing with here in this chapter. It's that we wanted to be able to invoke a function reference like `getX()`, and have that *mean* and *behave like* `point.getDoubleX()`. But `this` rules on *regular* functions don't work that way.

So we used an `=>` arrow function. No big deal, right!?

Wrong.

The real root problem is that we *want* two conflicting things out of our code, and we're trying to use the same *hammer* for both *nails*.

We want to have a `this`-aware method stored on the `class` prototype, so that there's only one definition for the function, and all our subclasses and instances nicely share that same function. And the way they all share is through the power of the dynamic `this` binding.

But at the same time, we *also* want those function references to magically stay `this`-assinged to our instance when we pass those function references around and other code is in charge of the call-site.

In other words, sometimes we want something like `point.getDoubleX` to mean, "give me a reference that's `this`-assigned to `point`", and other times we want the same expression `point.getDoubleX` to mean, give me a dynamic `this`-assignable function reference so it can properly get the context I need it to at this moment.

Perhaps JS could offer a different operator besides `.`, like `::` or `->` or something like that, which would let you distinguish what kind of function reference you're after. In fact, there's a long-standing proposal for a `this`-binding operator (`::`), that picks up attention from time to time, and then seems to stall out. Who knows, maybe someday such an operator will finally land, and we'll have better options.

But I strongly suspect that even if it does land someday, it's going to vend a whole new function reference, exactly as the `=>` or `bind(this)` approaches we've already talked about. It won't come as a free and perfect solution. There will always be a tension between wanting the same function to sometimes be `this`-flexible and sometimes be `this`-predictable.

What JS authors of `class`-oriented code often run up against, sooner or later, is this exact tension. And you know what they do?

They don't consider the *costs* of simply pre-binding all the class's `this`-aware methods as instead `=>` arrow functions in member properties. They don't realize that it's completely defeated the entire purpose of the `[[Prototype]]` chain. And they don't realize that if fixed-context is what they *really need*, there's an entirely different mechanism in JS that is better suited for that purpose.

#### Take A More Critical Look

So when you do this sort of thing:

```js
class Point2d {
    x = null
    y = null
    getDoubleX = () => this.x * 2
    toString = () => `(${this.x},${this.y})`

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

var point = new Point2d(3,4);
var anotherPoint = new Point2d(5,6);

var f = point.getDoubleX;
var g = anotherPoint.toString;

f();            // 6
g();            // (5,6)
```

I say, "ick!", to the hard-bound `this`-aware methods `getDoubleX()` and `toString()` there. To me, that's a code smell. But here's an even *worse* approach that has been favored by many developers in the past:

```js
class Point2d {
    x = null
    y = null

    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.getDoubleX = this.getDoubleX.bind(this);
        this.toString = this.toString.bind(this);
    }
    getDoubleX() { return this.x * 2; }
    toString() { return `(${this.x},${this.y})`; }
}

var point = new Point2d(3,4);
var anotherPoint = new Point2d(5,6);

var f = point.getDoubleX;
var g = anotherPoint.toString;

f();            // 6
g();            // (5,6)
```

Double ick.

In both cases, you're using a `this` mechanism but completely betraying/neutering it, by taking away all the powerful dynamicism of `this`.

You really should at least be contemplating this alternate approach, which skips the whole `this` mechanism altogether:

```js
function Point2d(px,py) {
    var x = px;
    var y = py;

    return {
        getDoubleX() { return x * 2; },
        toString() { return `(${x},${y})`; }
    };
}

var point = Point2d(3,4);
var anotherPoint = Point2d(5,6);

var f = point.getDoubleX;
var g = anotherPoint.toString;

f();            // 6
g();            // (5,6)
```

You see? No ugly or complex `this` to clutter up that code or worry about corner cases for. Lexical scope is super straightforward and intuitive.

When all we want is for most/all of our function behaviors to have a fixed and predictable context, the most appropriate solution, the most straightforward and even performant solution, is lexical variables and scope closure.

When you go to all to the trouble of sprinkling `this` references all over a piece of code, and then you cut off the whole mechanism at the knees with `=>` "lexical this" or `bind(this)`, you chose to make the code more verbose, more complex, more overwrought. And you got nothing out of it that was more beneficial, except to follow the `this` (and `class`) bandwagon.

...

Deep breath. Collect yourself.

I'm talking to myself, not you. But if what I just said bothers you, I'm talking to you, too!

OK, listen. That's just my opinion. If you don't agree, that's fine. But apply the same level of rigor to thinking about how these mechanisms work, as I have, when you decide what conclusions you want to arrive at.