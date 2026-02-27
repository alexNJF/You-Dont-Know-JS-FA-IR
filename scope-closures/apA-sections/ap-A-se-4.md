# The Case for `var`

Speaking of *variable hoisting*, let's have some real talk for a bit about `var`, a favorite villain devs love to blame for many of the woes of JS development. In Chapter 5, we explored `let`/`const` and promised we'd revisit where `var` falls in the whole mix.

As I lay out the case, don't miss:

* `var` was never broken
* `let` is your friend
* `const` has limited utility
* The best of both worlds: `var` *and* `let`

### Don't Throw Out `var`

`var` is fine, and works just fine. It's been around for 25 years, and it'll be around and useful and functional for another 25 years or more. Claims that `var` is broken, deprecated, outdated, dangerous, or ill-designed are bogus bandwagoning.

Does that mean `var` is the right declarator for every single declaration in your program? Certainly not. But it still has its place in your programs. Refusing to use it because someone on the team chose an aggressive linter opinion that chokes on `var` is cutting off your nose to spite your face.

OK, now that I've got you really riled up, let me try to explain my position.

For the record, I'm a fan of `let`, for block-scoped declarations. I really dislike TDZ and I think that was a mistake. But `let` itself is great. I use it often. In fact, I probably use it as much or more than I use `var`.

### `const`-antly Confused

`const` on the other hand, I don't use as often. I'm not going to dig into all the reasons why, but it comes down to `const` not *carrying its own weight*. That is, while there's a tiny bit of benefit of `const` in some cases, that benefit is outweighed by the long history of troubles around `const` confusion in a variety of languages, long before it ever showed up in JS.

`const` pretends to create values that can't be mutated—a misconception that's extremely common in developer communities across many languages—whereas what it really does is prevent re-assignment.

```js
const studentIDs = [ 14, 73, 112 ];

// later

studentIDs.push(6);   // whoa, wait... what!?
```

Using a `const` with a mutable value (like an array or object) is asking for a future developer (or reader of your code) to fall into the trap you set, which was that they either didn't know, or sorta forgot, that *value immutability* isn't at all the same thing as *assignment immutability*.

I just don't think we should set those traps. The only time I ever use `const` is when I'm assigning an already-immutable value (like `42` or `"Hello, friends!"`), and when it's clearly a "constant" in the sense of being a named placeholder for a literal value, for semantic purposes. That's what `const` is best used for. That's pretty rare in my code, though.

If variable re-assignment were a big deal, then `const` would be more useful. But variable re-assignment just isn't that big of a deal in terms of causing bugs. There's a long list of things that lead to bugs in programs, but "accidental re-assignment" is way, way down that list.

Combine that with the fact that `const` (and `let`) are supposed to be used in blocks, and blocks are supposed to be short, and you have a really small area of your code where a `const` declaration is even applicable. A `const` on line 1 of your ten-line block only tells you something about the next nine lines. And the thing it tells you is already obvious by glancing down at those nine lines: the variable is never on the left-hand side of an `=`; it's not re-assigned.

That's it, that's all `const` really does. Other than that, it's not very useful. Stacked up against the significant confusion of value vs. assignment immutability, `const` loses a lot of its luster.

A `let` (or `var`!) that's never re-assigned is already behaviorally a "constant", even though it doesn't have the compiler guarantee. That's good enough in most cases.

### `var` *and* `let`

In my mind, `const` is pretty rarely useful, so this is only two-horse race between `let` and `var`. But it's not really a race either, because there doesn't have to be just one winner. They can both win... different races.

The fact is, you should be using both `var` and `let` in your programs. They are not interchangeable: you shouldn't use `var` where a `let` is called for, but you also shouldn't use `let` where a `var` is most appropriate.

So where should we still use `var`? Under what circumstances is it a better choice than `let`?

For one, I always use `var` in the top-level scope of any function, regardless of whether that's at the beginning, middle, or end of the function. I also use `var` in the global scope, though I try to minimize usage of the global scope.

Why use `var` for function scoping? Because that's exactly what `var` does. There literally is no better tool for the job of function scoping a declaration than a declarator that has, for 25 years, done exactly that.

You *could* use `let` in this top-level scope, but it's not the best tool for that job. I also find that if you use `let` everywhere, then it's less obvious which declarations are designed to be localized and which ones are intended to be used throughout the function.

By contrast, I rarely use a `var` inside a block. That's what `let` is for. Use the best tool for the job. If you see a `let`, it tells you that you're dealing with a localized declaration. If you see `var`, it tells you that you're dealing with a function-wide declaration. Simple as that.

```js
function getStudents(data) {
    var studentRecords = [];

    for (let record of data.records) {
        let id = `student-${ record.id }`;
        studentRecords.push({
            id,
            record.name
        });
    }

    return studentRecords;
}
```

The `studentRecords` variable is intended for use across the whole function. `var` is the best declarator to tell the reader that. By contrast, `record` and `id` are intended for use only in the narrower scope of the loop iteration, so `let` is the best tool for that job.

In addition to this *best tool* semantic argument, `var` has a few other characteristics that, in certain limited circumstances, make it more powerful.

One example is when a loop is exclusively using a variable, but its conditional clause cannot see block-scoped declarations inside the iteration:

```js
function commitAction() {
    do {
        let result = commit();
        var done = result && result.code == 1;
    } while (!done);
}
```

Here, `result` is clearly only used inside the block, so we use `let`. But `done` is a bit different. It's only useful for the loop, but the `while` clause cannot see `let` declarations that appear inside the loop. So we compromise and use `var`, so that `done` is hoisted to the outer scope where it can be seen.

The alternative—declaring `done` outside the loop—separates it from where it's first used, and either necessitates picking a default value to assign, or worse, leaving it unassigned and thus looking ambiguous to the reader. I think `var` inside the loop is preferable here.

Another helpful characteristic of `var` is seen with declarations inside unintended blocks. Unintended blocks are blocks that are created because the syntax requires a block, but where the intent of the developer is not really to create a localized scope. The best illustration of unintended scope is the `try..catch` statement:

```js
function getStudents() {
    try {
        // not really a block scope
        var records = fromCache("students");
    }
    catch (err) {
        // oops, fall back to a default
        var records = [];
    }
    // ..
}
```

There are other ways to structure this code, yes. But I think this is the *best* way, given various trade-offs.

I don't want to declare `records` (with `var` or `let`) outside of the `try` block, and then assign to it in one or both blocks. I prefer initial declarations to always be as close as possible (ideally, same line) to the first usage of the variable. In this simple example, that would only be a couple of lines distance, but in real code it can grow to many more lines. The bigger the gap, the harder it is to figure out what variable from what scope you're assigning to. `var` used at the actual assignment makes it less ambiguous.

Also notice I used `var` in both the `try` and `catch` blocks. That's because I want to signal to the reader that no matter which path is taken, `records` always gets declared. Technically, that works because `var` is hoisted once to the function scope. But it's still a nice semantic signal to remind the reader what either `var` ensures. If `var` were only used in one of the blocks, and you were only reading the other block, you wouldn't as easily discover where `records` was coming from.

This is, in my opinion, a little superpower of `var`. Not only can it escape the unintentional `try..catch` blocks, but it's allowed to appear multiple times in a function's scope. You can't do that with `let`. It's not bad, it's actually a little helpful feature. Think of `var` more like a declarative annotation that's reminding you, each usage, where the variable comes from. "Ah ha, right, it belongs to the whole function."

This repeated-annotation superpower is useful in other cases:

```js
function getStudents() {
    var data = [];

    // do something with data
    // .. 50 more lines of code ..

    // purely an annotation to remind us
    var data;

    // use data again
    // ..
}
```

The second `var data` is not re-declaring `data`, it's just annotating for the readers' benefit that `data` is a function-wide declaration. That way, the reader doesn't need to scroll up 50+ lines of code to find the initial declaration.

I'm perfectly fine with re-using variables for multiple purposes throughout a function scope. I'm also perfectly fine with having two usages of a variable be separated by quite a few lines of code. In both cases, the ability to safely "re-declare" (annotate) with `var` helps make sure I can tell where my `data` is coming from, no matter where I am in the function.

Again, sadly, `let` cannot do this.

There are other nuances and scenarios when `var` turns out to offer some assistance, but I'm not going to belabor the point any further. The takeaway is that `var` can be useful in our programs alongside `let` (and the occasional `const`). Are you willing to creatively use the tools the JS language provides to tell a richer story to your readers?

Don't just throw away a useful tool like `var` because someone shamed you into thinking it wasn't cool anymore. Don't avoid `var` because you got confused once years ago. Learn these tools and use them each for what they're best at.