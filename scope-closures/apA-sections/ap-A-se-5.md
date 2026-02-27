# What's the Deal with TDZ?

The TDZ (temporal dead zone) was explained in Chapter 5. We illustrated how it occurs, but we skimmed over any explanation of *why* it was necessary to introduce in the first place. Let's look briefly at the motivations of TDZ.

Some breadcrumbs in the TDZ origin story:

* `const`s should never change
* It's all about time
* Should `let` behave more like `const` or `var`?

### Where It All Started

TDZ comes from `const`, actually.

During early ES6 development work, TC39 had to decide whether `const` (and `let`) were going to hoist to the top of their blocks. They decided these declarations would hoist, similar to how `var` does. Had that not been the case, I think some of the fear was confusion with mid-scope shadowing, such as:

```js
let greeting = "Hi!";

{
    // what should print here?
    console.log(greeting);

    // .. a bunch of lines of code ..

    // now shadowing the `greeting` variable
    let greeting = "Hello, friends!";

    // ..
}
```

What should we do with that `console.log(..)` statement? Would it make any sense to JS devs for it to print "Hi!"? Seems like that could be a gotcha, to have shadowing kick in only for the second half of the block, but not the first half. That's not very intuitive, JS-like behavior. So `let` and `const` have to hoist to the top of the block, visible throughout.

But if `let` and `const` hoist to the top of the block (like `var` hoists to the top of a function), why don't `let` and `const` auto-initialize (to `undefined`) the way `var` does? Here was the main concern:

```js
{
    // what should print here?
    console.log(studentName);

    // later

    const studentName = "Frank";

    // ..
}
```

Let's imagine that `studentName` not only hoisted to the top of this block, but was also auto-initialized to `undefined`. For the first half of the block, `studentName` could be observed to have the `undefined` value, such as with our `console.log(..)` statement. Once the `const studentName = ..` statement is reached, now `studentName` is assigned `"Frank"`. From that point forward, `studentName` can't ever be re-assigned.

But, is it strange or surprising that a constant observably has two different values, first `undefined`, then `"Frank"`? That does seem to go against what we think a `const`ant means; it should only ever be observable with one value.

So... now we have a problem. We can't auto-initialize `studentName` to `undefined` (or any other value for that matter). But the variable has to exist throughout the whole scope. What do we do with the period of time from when it first exists (beginning of scope) and when it's assigned its value?

We call this period of time the "dead zone," as in the "temporal dead zone" (TDZ). To prevent confusion, it was determined that any sort of access of a variable while in its TDZ is illegal and must result in the TDZ error.

OK, that line of reasoning does make some sense, I must admit.

### Who `let` the TDZ Out?

But that's just `const`. What about `let`?

Well, TC39 made the decision: since we need a TDZ for `const`, we might as well have a TDZ for `let` as well. *In fact, if we make let have a TDZ, then we discourage all that ugly variable hoisting people do.* So there was a consistency perspective and, perhaps, a bit of social engineering to shift developers' behavior.

My counter-argument would be: if you're favoring consistency, be consistent with `var` instead of `const`; `let` is definitely more like `var` than `const`. That's especially true since they had already chosen consistency with `var` for the whole hoisting-to-the-top-of-the-scope thing. Let `const` be its own unique deal with a TDZ, and let the answer to TDZ purely be: just avoid the TDZ by always declaring your constants at the top of the scope. I think this would have been more reasonable.

But alas, that's not how it landed. `let` has a TDZ because `const` needs a TDZ, because `let` and `const` mimic `var` in their hoisting to the top of the (block) scope. There ya go. Too circular? Read it again a few times.