# Re-declaration?

What do you think happens when a variable is declared more than once in the same scope? Consider:

```js
var studentName = "Frank";
console.log(studentName);
// Frank

var studentName;
console.log(studentName);   // ???
```

What do you expect to be printed for that second message? Many believe the second `var studentName` has re-declared the variable (and thus "reset" it), so they expect `undefined` to be printed.

But is there such a thing as a variable being "re-declared" in the same scope? No.

If you consider this program from the perspective of the hoisting metaphor, the code would be re-arranged like this for execution purposes:

```js
var studentName;
var studentName;    // clearly a pointless no-op!

studentName = "Frank";
console.log(studentName);
// Frank

console.log(studentName);
// Frank
```

Since hoisting is actually about registering a variable at the beginning of a scope, there's nothing to be done in the middle of the scope where the original program actually had the second `var studentName` statement. It's just a no-op(eration), a pointless statement.

| TIP: |
| :--- |
| In the style of the conversation narrative from Chapter 2, *Compiler* would find the second `var` declaration statement and ask the *Scope Manager* if it had already seen a `studentName` identifier; since it had, there wouldn't be anything else to do. |

It's also important to point out that `var studentName;` doesn't mean `var studentName = undefined;`, as most assume. Let's prove they're different by considering this variation of the program:

```js
var studentName = "Frank";
console.log(studentName);   // Frank

var studentName;
console.log(studentName);   // Frank <--- still!

// let's add the initialization explicitly
var studentName = undefined;
console.log(studentName);   // undefined <--- see!?
```

See how the explicit `= undefined` initialization produces a different outcome than assuming it happens implicitly when omitted? In the next section, we'll revisit this topic of initialization of variables from their declarations.

A repeated `var` declaration of the same identifier name in a scope is effectively a do-nothing operation. Here's another illustration, this time across a function of the same name:

```js
var greeting;

function greeting() {
    console.log("Hello!");
}

// basically, a no-op
var greeting;

typeof greeting;        // "function"

var greeting = "Hello!";

typeof greeting;        // "string"
```

The first `greeting` declaration registers the identifier to the scope, and because it's a `var` the auto-initialization will be `undefined`. The `function` declaration doesn't need to re-register the identifier, but because of *function hoisting* it overrides the auto-initialization to use the function reference. The second `var greeting` by itself doesn't do anything since `greeting` is already an identifier and *function hoisting* already took precedence for the auto-initialization.

Actually assigning `"Hello!"` to `greeting` changes its value from the initial function `greeting()` to the string; `var` itself doesn't have any effect.

What about repeating a declaration within a scope using `let` or `const`?

```js
let studentName = "Frank";

console.log(studentName);

let studentName = "Suzy";
```

This program will not execute, but instead immediately throw a `SyntaxError`. Depending on your JS environment, the error message will indicate something like: "studentName has already been declared." In other words, this is a case where attempted "re-declaration" is explicitly not allowed!

It's not just that two declarations involving `let` will throw this error. If either declaration uses `let`, the other can be either `let` or `var`, and the error will still occur, as illustrated with these two variations:

```js
var studentName = "Frank";

let studentName = "Suzy";
```

and:

```js
let studentName = "Frank";

var studentName = "Suzy";
```

In both cases, a `SyntaxError` is thrown on the *second* declaration. In other words, the only way to "re-declare" a variable is to use `var` for all (two or more) of its declarations.

But why disallow it? The reason for the error is not technical per se, as `var` "re-declaration" has always been allowed; clearly, the same allowance could have been made for `let`.

It's really more of a "social engineering" issue. "Re-declaration" of variables is seen by some, including many on the TC39 body, as a bad habit that can lead to program bugs. So when ES6 introduced `let`, they decided to prevent "re-declaration" with an error.

| NOTE: |
| :--- |
| This is of course a stylistic opinion, not really a technical argument. Many developers agree with the position, and that's probably in part why TC39 included the error (as well as `let` conforming to `const`). But a reasonable case could have been made that staying consistent with `var`'s precedent was more prudent, and that such opinion-enforcement was best left to opt-in tooling like linters. In Appendix A, we'll explore whether `var` (and its associated behavior, like "re-declaration") can still be useful in modern JS. |

When *Compiler* asks *Scope Manager* about a declaration, if that identifier has already been declared, and if either/both declarations were made with `let`, an error is thrown. The intended signal to the developer is "Stop relying on sloppy re-declaration!"

### Constants?

The `const` keyword is more constrained than `let`. Like `let`, `const` cannot be repeated with the same identifier in the same scope. But there's actually an overriding technical reason why that sort of "re-declaration" is disallowed, unlike `let` which disallows "re-declaration" mostly for stylistic reasons.

The `const` keyword requires a variable to be initialized, so omitting an assignment from the declaration results in a `SyntaxError`:

```js
const empty;   // SyntaxError
```

`const` declarations create variables that cannot be re-assigned:

```js
const studentName = "Frank";
console.log(studentName);
// Frank

studentName = "Suzy";   // TypeError
```

The `studentName` variable cannot be re-assigned because it's declared with a `const`.

| WARNING: |
| :--- |
| The error thrown when re-assigning `studentName` is a `TypeError`, not a `SyntaxError`. The subtle distinction here is actually pretty important, but unfortunately far too easy to miss. Syntax errors represent faults in the program that stop it from even starting execution. Type errors represent faults that arise during program execution. In the preceding snippet, `"Frank"` is printed out before we process the re-assignment of `studentName`, which then throws the error. |

So if `const` declarations cannot be re-assigned, and `const` declarations always require assignments, then we have a clear technical reason why `const` must disallow any "re-declarations": any `const` "re-declaration" would also necessarily be a `const` re-assignment, which can't be allowed!

```js
const studentName = "Frank";

// obviously this must be an error
const studentName = "Suzy";
```

Since `const` "re-declaration" must be disallowed (on those technical grounds), TC39 essentially felt that `let` "re-declaration" should be disallowed as well, for consistency. It's debatable if this was the best choice, but at least we have the reasoning behind the decision.

### Loops

So it's clear from our previous discussion that JS doesn't really want us to "re-declare" our variables within the same scope. That probably seems like a straightforward admonition, until you consider what it means for repeated execution of declaration statements in loops. Consider:

```js
var keepGoing = true;
while (keepGoing) {
    let value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

Is `value` being "re-declared" repeatedly in this program? Will we get errors thrown? No.

All the rules of scope (including "re-declaration" of `let`-created variables) are applied *per scope instance*. In other words, each time a scope is entered during execution, everything resets.

Each loop iteration is its own new scope instance, and within each scope instance, `value` is only being declared once. So there's no attempted "re-declaration," and thus no error. Before we consider other loop forms, what if the `value` declaration in the previous snippet were changed to a `var`?

```js
var keepGoing = true;
while (keepGoing) {
    var value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

Is `value` being "re-declared" here, especially since we know `var` allows it? No. Because `var` is not treated as a block-scoping declaration (see Chapter 6), it attaches itself to the global scope. So there's just one `value` variable, in the same scope as `keepGoing` (global scope, in this case). No "re-declaration" here, either!

One way to keep this all straight is to remember that `var`, `let`, and `const` keywords are effectively *removed* from the code by the time it starts to execute. They're handled entirely by the compiler.

If you mentally erase the declarator keywords and then try to process the code, it should help you decide if and when (re-)declarations might occur.

What about "re-declaration" with other loop forms, like `for`-loops?

```js
for (let i = 0; i < 3; i++) {
    let value = i * 10;
    console.log(`${ i }: ${ value }`);
}
// 0: 0
// 1: 10
// 2: 20
```

It should be clear that there's only one `value` declared per scope instance. But what about `i`? Is it being "re-declared"?

To answer that, consider what scope `i` is in. It might seem like it would be in the outer (in this case, global) scope, but it's not. It's in the scope of `for`-loop body, just like `value` is. In fact, you could sorta think about that loop in this more verbose equivalent form:

```js
{
    // a fictional variable for illustration
    let $$i = 0;

    for ( /* nothing */; $$i < 3; $$i++) {
        // here's our actual loop `i`!
        let i = $$i;

        let value = i * 10;
        console.log(`${ i }: ${ value }`);
    }
    // 0: 0
    // 1: 10
    // 2: 20
}
```

Now it should be clear: the `i` and `value` variables are both declared exactly once **per scope instance**. No "re-declaration" here.

What about other `for`-loop forms?

```js
for (let index in students) {
    // this is fine
}

for (let student of students) {
    // so is this
}
```

Same thing with `for..in` and `for..of` loops: the declared variable is treated as *inside* the loop body, and thus is handled per iteration (aka, per scope instance). No "re-declaration."

OK, I know you're thinking that I sound like a broken record at this point. But let's explore how `const` impacts these looping constructs. Consider:

```js
var keepGoing = true;
while (keepGoing) {
    // ooo, a shiny constant!
    const value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

Just like the `let` variant of this program we saw earlier, `const` is being run exactly once within each loop iteration, so it's safe from "re-declaration" troubles. But things get more complicated when we talk about `for`-loops.

`for..in` and `for..of` are fine to use with `const`:

```js
for (const index in students) {
    // this is fine
}

for (const student of students) {
    // this is also fine
}
```

But not the general `for`-loop:

```js
for (const i = 0; i < 3; i++) {
    // oops, this is going to fail with
    // a Type Error after the first iteration
}
```

What's wrong here? We could use `let` just fine in this construct, and we asserted that it creates a new `i` for each loop iteration scope, so it doesn't even seem to be a "re-declaration."

Let's mentally "expand" that loop like we did earlier:

```js
{
    // a fictional variable for illustration
    const $$i = 0;

    for ( ; $$i < 3; $$i++) {
        // here's our actual loop `i`!
        const i = $$i;
        // ..
    }
}
```

Do you spot the problem? Our `i` is indeed just created once inside the loop. That's not the problem. The problem is the conceptual `$$i` that must be incremented each time with the `$$i++` expression. That's **re-assignment** (not "re-declaration"), which isn't allowed for constants.

Remember, this "expanded" form is only a conceptual model to help you intuit the source of the problem. You might wonder if JS could have effectively made the `const $$i = 0` instead into `let $ii = 0`, which would then allow `const` to work with our classic `for`-loop? It's possible, but then it could have introduced potentially surprising exceptions to `for`-loop semantics.

For example, it would have been a rather arbitrary (and likely confusing) nuanced exception to allow `i++` in the `for`-loop header to skirt strictness of the `const` assignment, but not allow other re-assignments of `i` inside the loop iteration, as is sometimes useful.

The straightforward answer is: `const` can't be used with the classic `for`-loop form because of the required re-assignment.

Interestingly, if you don't do re-assignment, then it's valid:

```js
var keepGoing = true;

for (const i = 0; keepGoing; /* nothing here */ ) {
    keepGoing = (Math.random() > 0.5);
    // ..
}
```

That works, but it's pointless. There's no reason to declare `i` in that position with a `const`, since the whole point of such a variable in that position is **to be used for counting iterations**. Just use a different loop form, like a `while` loop, or use a `let`!