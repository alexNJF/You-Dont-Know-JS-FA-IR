# Are Synchronous Callbacks Still Closures?

Chapter 7 presented two different models for tackling closure:

* Closure is a function instance remembering its outer variables even as that function is passed around and **invoked in** other scopes.

* Closure is a function instance and its scope environment being preserved in-place while any references to it are passed around and **invoked from** other scopes.

These models are not wildly divergent, but they do approach from a different perspective. And that different perspective changes what we identify as a closure.

Don't get lost following this rabbit trail through closures and callbacks:

* Calling back to what (or where)?
* Maybe "synchronous callback" isn't the best label
* ***IIF*** functions don't move around, why would they need closure?
* Deferring over time is key to closure

### What is a Callback?

Before we revisit closure, let me spend a brief moment addressing the word "callback." It's a generally accepted norm that saying "callback" is synonymous with both *asynchronous callbacks* and *synchronous callbacks*. I don't think I agree that this is a good idea, so I want to explain why and propose we move away from that to another term.

Let's first consider an *asynchronous callback*, a function reference that will be invoked at some future *later* point. What does "callback" mean, in this case?

It means that the current code has finished or paused, suspended itself, and that when the function in question is invoked later, execution is entering back into the suspended program, resuming it. Specifically, the point of re-entry is the code that was wrapped in the function reference:

```js
setTimeout(function waitForASecond(){
    // this is where JS should call back into
    // the program when the timer has elapsed
},1000);

// this is where the current program finishes
// or suspends
```

In this context, "calling back" makes a lot of sense. The JS engine is resuming our suspended program by *calling back in* at a specific location. OK, so a callback is asynchronous.

### Synchronous Callback?

But what about *synchronous callbacks*? Consider:

```js
function getLabels(studentIDs) {
    return studentIDs.map(
        function formatIDLabel(id){
            return `Student ID: ${
               String(id).padStart(6)
            }`;
        }
    );
}

getLabels([ 14, 73, 112, 6 ]);
// [
//    "Student ID: 000014",
//    "Student ID: 000073",
//    "Student ID: 000112",
//    "Student ID: 000006"
// ]
```

Should we refer to `formatIDLabel(..)` as a callback? Is the `map(..)` utility really *calling back* into our program by invoking the function we provided?

There's nothing to *call back into* per se, because the program hasn't paused or exited. We're passing a function (reference) from one part of the program to another part of the program, and then it's immediately invoked.

There's other established terms that might match what we're doing—passing in a function (reference) so that another part of the program can invoke it on our behalf. You might think of this as *Dependency Injection* (DI) or *Inversion of Control* (IoC).

DI can be summarized as passing in necessary part(s) of functionality to another part of the program so that it can invoke them to complete its work. That's a decent description for the `map(..)` call above, isn't it? The `map(..)` utility knows to iterate over the list's values, but it doesn't know what to *do* with those values. That's why we pass it the `formatIDLabel(..)` function. We pass in the dependency.

IoC is a pretty similar, related concept. Inversion of control means that instead of the current area of your program controlling what's happening, you hand control off to another part of the program. We wrapped the logic for computing a label string in the function `formatIDLabel(..)`, then handed invocation control to the `map(..)` utility.

Notably, Martin Fowler cites IoC as the difference between a framework and a library: with a library, you call its functions; with a framework, it calls your functions. [^fowlerIOC]

In the context of our discussion, either DI or IoC could work as an alternative label for a *synchronous callback*.

But I have a different suggestion. Let's refer to (the functions formerly known as) *synchronous callbacks*, as *inter-invoked functions* (IIFs). Yes, exactly, I'm playing off IIFEs. These kinds of functions are *inter-invoked*, meaning: another entity invokes them, as opposed to IIFEs, which invoke themselves immediately.

What's the relationship between an *asynchronous callback* and an IIF? An *asynchronous callback* is an IIF that's invoked asynchronously instead of synchronously.

### Synchronous Closure?

Now that we've re-labeled *synchronous callbacks* as IIFs, we can return to our main question: are IIFs an example of closure? Obviously, the IIF would have to reference variable(s) from an outer scope for it to have any chance of being a closure. The `formatIDLabel(..)` IIF from earlier does not reference any variables outside its own scope, so it's definitely not a closure.

What about an IIF that does have external references, is that closure?

```js
function printLabels(labels) {
    var list = document.getElementById("labelsList");

    labels.forEach(
        function renderLabel(label){
            var li = document.createElement("li");
            li.innerText = label;
            list.appendChild(li);
        }
    );
}
```

The inner `renderLabel(..)` IIF references `list` from the enclosing scope, so it's an IIF that *could* have closure. But here's where the definition/model we choose for closure matters:

* If `renderLabel(..)` is a **function that gets passed somewhere else**, and that function is then invoked, then yes, `renderLabel(..)` is exercising a closure, because closure is what preserved its access to its original scope chain.

* But if, as in the alternative conceptual model from Chapter 7, `renderLabel(..)` stays in place, and only a reference to it is passed to `forEach(..)`, is there any need for closure to preserve the scope chain of `renderLabel(..)`, while it executes synchronously right inside its own scope?

No. That's just normal lexical scope.

To understand why, consider this alternative form of `printLabels(..)`:

```js
function printLabels(labels) {
    var list = document.getElementById("labelsList");

    for (let label of labels) {
        // just a normal function call in its own
        // scope, right? That's not really closure!
        renderLabel(label);
    }

    // **************

    function renderLabel(label) {
        var li = document.createElement("li");
        li.innerText = label;
        list.appendChild(li);
    }
}
```

These two versions of `printLabels(..)` are essentially the same.

The latter one is definitely not an example of closure, at least not in any useful or observable sense. It's just lexical scope. The former version, with `forEach(..)` calling our function reference, is essentially the same thing. It's also not closure, but rather just a plain ol' lexical scope function call.

### Defer to Closure

By the way, Chapter 7 briefly mentioned partial application and currying (which *do* rely on closure!). This is an interesting scenario where manual currying can be used:

```js
function printLabels(labels) {
    var list = document.getElementById("labelsList");
    var renderLabel = renderTo(list);

    // definitely closure this time!
    labels.forEach( renderLabel );

    // **************

    function renderTo(list) {
        return function createLabel(label){
            var li = document.createElement("li");
            li.innerText = label;
            list.appendChild(li);
        };
    }
}
```

The inner function `createLabel(..)`, which we assign to `renderLabel`, is closed over `list`, so closure is definitely being utilized.

Closure allows us to remember `list` for later, while we defer execution of the actual label-creation logic from the `renderTo(..)` call to the subsequent `forEach(..)` invocations of the `createLabel(..)` IIF. That may only be a brief moment here, but any amount of time could pass, as closure bridges from call to call.