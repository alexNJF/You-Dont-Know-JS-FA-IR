# Statements & Expressions

It's fairly common for developers to assume that the term "statement" and "expression" are roughly equivalent. But here we need to distinguish between the two, because there are some very important differences in our JS programs.

To draw the distinction, let's borrow from terminology you may be more familiar with: the English language.

A "sentence" is one complete formation of words that expresses a thought. It's comprised of one or more "phrases," each of which can be connected with punctuation marks or conjunction words ("and," "or," etc). A phrase can itself be made up of smaller phrases. Some phrases are incomplete and don't accomplish much by themselves, while other phrases can stand on their own. These rules are collectively called the *grammar* of the English language.

And so it goes with JavaScript grammar. Statements are sentences, expressions are phrases, and operators are conjunctions/punctuation.

Every expression in JS can be evaluated down to a single, specific value result. For example:

```js
var a = 3 * 6;
var b = a;
b;
```

In this snippet, `3 * 6` is an expression (evaluates to the value `18`). But `a` on the second line is also an expression, as is `b` on the third line. The `a` and `b` expressions both evaluate to the values stored in those variables at that moment, which also happens to be `18`.

Moreover, each of the three lines is a statement containing expressions. `var a = 3 * 6` and `var b = a` are called "declaration statements" because they each declare a variable (and optionally assign a value to it). The `a = 3 * 6` and `b = a` assignments (minus the `var`s) are called assignment expressions.

The third line contains just the expression `b`, but it's also a statement all by itself (though not a terribly interesting one!). This is generally referred to as an "expression statement."

### Statement Completion Values

It's a fairly little known fact that statements all have completion values (even if that value is just `undefined`).

How would you even go about seeing the completion value of a statement?

The most obvious answer is to type the statement into your browser's developer console, because when you execute it, the console by default reports the completion value of the most recent statement it executed.

Let's consider `var b = a`. What's the completion value of that statement?

The `b = a` assignment expression results in the value that was assigned (`18` above), but the `var` statement itself results in `undefined`. Why? Because `var` statements are defined that way in the spec. If you put `var a = 42;` into your console, you'll see `undefined` reported back instead of `42`.

**Note:** Technically, it's a little more complex than that. In the ES5 spec, section 12.2 "Variable Statement," the `VariableDeclaration` algorithm actually *does* return a value (a `string` containing the name of the variable declared -- weird, huh!?), but that value is basically swallowed up (except for use by the `for..in` loop) by the `VariableStatement` algorithm, which forces an empty (aka `undefined`) completion value.

In fact, if you've done much code experimenting in your console (or in a JavaScript environment REPL -- read/evaluate/print/loop tool), you've probably seen `undefined` reported after many different statements, and perhaps never realized why or what that was. Put simply, the console is just reporting the statement's completion value.

But what the console prints out for the completion value isn't something we can use inside our program. So how can we capture the completion value?

That's a much more complicated task. Before we explain *how*, let's explore *why* you would want to do that.

We need to consider other types of statement completion values. For example, any regular `{ .. }` block has a completion value of the completion value of its last contained statement/expression.

Consider:

```js
var b;

if (true) {
	b = 4 + 38;
}
```

If you typed that into your console/REPL, you'd probably see `42` reported, since `42` is the completion value of the `if` block, which took on the completion value of its last assignment expression statement `b = 4 + 38`.

In other words, the completion value of a block is like an *implicit return* of the last statement value in the block.

**Note:** This is conceptually familiar in languages like CoffeeScript, which have implicit `return` values from `function`s that are the same as the last statement value in the function.

But there's an obvious problem. This kind of code doesn't work:

```js
var a, b;

a = if (true) {
	b = 4 + 38;
};
```

We can't capture the completion value of a statement and assign it into another variable in any easy syntactic/grammatical way (at least not yet!).

So, what can we do?

**Warning**: For demo purposes only -- don't actually do the following in your real code!

We could use the much maligned `eval(..)` (sometimes pronounced "evil") function to capture this completion value.

```js
var a, b;

a = eval( "if (true) { b = 4 + 38; }" );

a;	// 42
```

Yeeeaaahhhh. That's terribly ugly. But it works! And it illustrates the point that statement completion values are a real thing that can be captured not just in our console but in our programs.

There's a proposal for ES7 called "do expression." Here's how it might work:

```js
var a, b;

a = do {
	if (true) {
		b = 4 + 38;
	}
};

a;	// 42
```

The `do { .. }` expression executes a block (with one or many statements in it), and the final statement completion value inside the block becomes the completion value *of* the `do` expression, which can then be assigned to `a` as shown.

The general idea is to be able to treat statements as expressions -- they can show up inside other statements -- without needing to wrap them in an inline function expression and perform an explicit `return ..`.

For now, statement completion values are not much more than trivia. But they're probably going to take on more significance as JS evolves, and hopefully `do { .. }` expressions will reduce the temptation to use stuff like `eval(..)`.

**Warning:** Repeating my earlier admonition: avoid `eval(..)`. Seriously. See the *Scope & Closures* title of this series for more explanation.

### Expression Side Effects

Most expressions don't have side effects. For example:

```js
var a = 2;
var b = a + 3;
```

The expression `a + 3` did not *itself* have a side effect, like for instance changing `a`. It had a result, which is `5`, and that result was assigned to `b` in the statement `b = a + 3`.

The most common example of an expression with (possible) side effects is a function call expression:

```js
function foo() {
	a = a + 1;
}

var a = 1;
foo();		// result: `undefined`, side effect: changed `a`
```

There are other side-effecting expressions, though. For example:

```js
var a = 42;
var b = a++;
```

The expression `a++` has two separate behaviors. *First*, it returns the current value of `a`, which is `42` (which then gets assigned to `b`). But *next*, it changes the value of `a` itself, incrementing it by one.

```js
var a = 42;
var b = a++;

a;	// 43
b;	// 42
```

Many developers would mistakenly believe that `b` has value `43` just like `a` does. But the confusion comes from not fully considering the *when* of the side effects of the `++` operator.

The `++` increment operator and the `--` decrement operator are both unary operators (see Chapter 4), which can be used in either a postfix ("after") position or prefix ("before") position.

```js
var a = 42;

a++;	// 42
a;		// 43

++a;	// 44
a;		// 44
```

When `++` is used in the prefix position as `++a`, its side effect (incrementing `a`) happens *before* the value is returned from the expression, rather than *after* as with `a++`.

**Note:** Would you think `++a++` was legal syntax? If you try it, you'll get a `ReferenceError` error, but why? Because side-effecting operators **require a variable reference** to target their side effects to. For `++a++`, the `a++` part is evaluated first (because of operator precedence -- see below), which gives back the value of `a` _before_ the increment. But then it tries to evaluate `++42`, which (if you try it) gives the same `ReferenceError` error, since `++` can't have a side effect directly on a value like `42`.

It is sometimes mistakenly thought that you can encapsulate the *after* side effect of `a++` by wrapping it in a `( )` pair, like:

```js
var a = 42;
var b = (a++);

a;	// 43
b;	// 42
```

Unfortunately, `( )` itself doesn't define a new wrapped expression that would be evaluated *after* the *after side effect* of the `a++` expression, as we might have hoped. In fact, even if it did, `a++` returns `42` first, and unless you have another expression that reevaluates `a` after the side effect of `++`, you're not going to get `43` from that expression, so `b` will not be assigned `43`.

There's an option, though: the `,` statement-series comma operator. This operator allows you to string together multiple standalone expression statements into a single statement:

```js
var a = 42, b;
b = ( a++, a );

a;	// 43
b;	// 43
```

**Note:** The `( .. )` around `a++, a` is required here. The reason is operator precedence, which we'll cover later in this chapter.

The expression `a++, a` means that the second `a` statement expression gets evaluated *after* the *after side effects* of the first `a++` statement expression, which means it returns the `43` value for assignment to `b`.

Another example of a side-effecting operator is `delete`. As we showed in Chapter 2, `delete` is used to remove a property from an `object` or a slot from an `array`. But it's usually just called as a standalone statement:

```js
var obj = {
	a: 42
};

obj.a;			// 42
delete obj.a;	// true
obj.a;			// undefined
```

The result value of the `delete` operator is `true` if the requested operation is valid/allowable, or `false` otherwise. But the side effect of the operator is that it removes the property (or array slot).

**Note:** What do we mean by valid/allowable? Nonexistent properties, or properties that exist and are configurable (see Chapter 3 of the *this & Object Prototypes* title of this series) will return `true` from the `delete` operator. Otherwise, the result will be `false` or an error.

One last example of a side-effecting operator, which may at once be both obvious and nonobvious, is the `=` assignment operator.

Consider:

```js
var a;

a = 42;		// 42
a;			// 42
```

It may not seem like `=` in `a = 42` is a side-effecting operator for the expression. But if we examine the result value of the `a = 42` statement, it's the value that was just assigned (`42`), so the assignment of that same value into `a` is essentially a side effect.

**Tip:** The same reasoning about side effects goes for the compound-assignment operators like `+=`, `-=`, etc. For example, `a = b += 2` is processed first as `b += 2` (which is `b = b + 2`), and the result of *that* `=` assignment is then assigned to `a`.

This behavior that an assignment expression (or statement) results in the assigned value is primarily useful for chained assignments, such as:

```js
var a, b, c;

a = b = c = 42;
```

Here, `c = 42` is evaluated to `42` (with the side effect of assigning `42` to `c`), then `b = 42` is evaluated to `42` (with the side effect of assigning `42` to `b`), and finally `a = 42` is evaluated (with the side effect of assigning `42` to `a`).

**Warning:** A common mistake developers make with chained assignments is like `var a = b = 42`. While this looks like the same thing, it's not. If that statement were to happen without there also being a separate `var b` (somewhere in the scope) to formally declare `b`, then `var a = b = 42` would not declare `b` directly. Depending on `strict` mode, that would either throw an error or create an accidental global (see the *Scope & Closures* title of this series).

Another scenario to consider:

```js
function vowels(str) {
	var matches;

	if (str) {
		// pull out all the vowels
		matches = str.match( /[aeiou]/g );

		if (matches) {
			return matches;
		}
	}
}

vowels( "Hello World" ); // ["e","o","o"]
```

This works, and many developers prefer such. But using an idiom where we take advantage of the assignment side effect, we can simplify by combining the two `if` statements into one:

```js
function vowels(str) {
	var matches;

	// pull out all the vowels
	if (str && (matches = str.match( /[aeiou]/g ))) {
		return matches;
	}
}

vowels( "Hello World" ); // ["e","o","o"]
```

**Note:** The `( .. )` around `matches = str.match..` is required. The reason is operator precedence, which we'll cover in the "Operator Precedence" section later in this chapter.

I prefer this shorter style, as I think it makes it clearer that the two conditionals are in fact related rather than separate. But as with most stylistic choices in JS, it's purely opinion which one is *better*.

### Contextual Rules

There are quite a few places in the JavaScript grammar rules where the same syntax means different things depending on where/how it's used. This kind of thing can, in isolation, cause quite a bit of confusion.

We won't exhaustively list all such cases here, but just call out a few of the common ones.

#### `{ .. }` Curly Braces

There's two main places (and more coming as JS evolves!) that a pair of `{ .. }` curly braces will show up in your code. Let's take a look at each of them.

##### Object Literals

First, as an `object` literal:

```js
// assume there's a `bar()` function defined

var a = {
	foo: bar()
};
```

How do we know this is an `object` literal? Because the `{ .. }` pair is a value that's getting assigned to `a`.

**Note:** The `a` reference is called an "l-value" (aka left-hand value) since it's the target of an assignment. The `{ .. }` pair is an "r-value" (aka right-hand value) since it's used *just* as a value (in this case as the source of an assignment).

##### Labels

What happens if we remove the `var a =` part of the above snippet?

```js
// assume there's a `bar()` function defined

{
	foo: bar()
}
```

A lot of developers assume that the `{ .. }` pair is just a standalone `object` literal that doesn't get assigned anywhere. But it's actually entirely different.

Here, `{ .. }` is just a regular code block. It's not very idiomatic in JavaScript (much more so in other languages!) to have a standalone `{ .. }` block like that, but it's perfectly valid JS grammar. It can be especially helpful when combined with `let` block-scoping declarations (see the *Scope & Closures* title in this series).

The `{ .. }` code block here is functionally pretty much identical to the code block being attached to some statement, like a `for`/`while` loop, `if` conditional, etc.

But if it's a normal block of code, what's that bizarre looking `foo: bar()` syntax, and how is that legal?

It's because of a little known (and, frankly, discouraged) feature in JavaScript called "labeled statements." `foo` is a label for the statement `bar()` (which has omitted its trailing `;` -- see "Automatic Semicolons" later in this chapter). But what's the point of a labeled statement?

If JavaScript had a `goto` statement, you'd theoretically be able to say `goto foo` and have execution jump to that location in code. `goto`s are usually considered terrible coding idioms as they make code much harder to understand (aka "spaghetti code"), so it's a *very good thing* that JavaScript doesn't have a general `goto`.

However, JS *does* support a limited, special form of `goto`: labeled jumps. Both the `continue` and `break` statements can optionally accept a specified label, in which case the program flow "jumps" kind of like a `goto`. Consider:

```js
// `foo` labeled-loop
foo: for (var i=0; i<4; i++) {
	for (var j=0; j<4; j++) {
		// whenever the loops meet, continue outer loop
		if (j == i) {
			// jump to the next iteration of
			// the `foo` labeled-loop
			continue foo;
		}

		// skip odd multiples
		if ((j * i) % 2 == 1) {
			// normal (non-labeled) `continue` of inner loop
			continue;
		}

		console.log( i, j );
	}
}
// 1 0
// 2 0
// 2 1
// 3 0
// 3 2
```

**Note:** `continue foo` does not mean "go to the 'foo' labeled position to continue", but rather, "continue the loop that is labeled 'foo' with its next iteration." So, it's not *really* an arbitrary `goto`.

As you can see, we skipped over the odd-multiple `3 1` iteration, but the labeled-loop jump also skipped iterations `1 1` and `2 2`.

Perhaps a slightly more useful form of the labeled jump is with `break __` from inside an inner loop where you want to break out of the outer loop. Without a labeled `break`, this same logic could sometimes be rather awkward to write:

```js
// `foo` labeled-loop
foo: for (var i=0; i<4; i++) {
	for (var j=0; j<4; j++) {
		if ((i * j) >= 3) {
			console.log( "stopping!", i, j );
			// break out of the `foo` labeled loop
			break foo;
		}

		console.log( i, j );
	}
}
// 0 0
// 0 1
// 0 2
// 0 3
// 1 0
// 1 1
// 1 2
// stopping! 1 3
```

**Note:** `break foo` does not mean "go to the 'foo' labeled position to continue," but rather, "break out of the loop/block that is labeled 'foo' and continue *after* it." Not exactly a `goto` in the traditional sense, huh?

The nonlabeled `break` alternative to the above would probably need to involve one or more functions, shared scope variable access, etc. It would quite likely be more confusing than labeled `break`, so here using a labeled `break` is perhaps the better option.

A label can apply to a non-loop block, but only `break` can reference such a non-loop label. You can do a labeled `break ___` out of any labeled block, but you cannot `continue ___` a non-loop label, nor can you do a non-labeled `break` out of a block.

```js
function foo() {
	// `bar` labeled-block
	bar: {
		console.log( "Hello" );
		break bar;
		console.log( "never runs" );
	}
	console.log( "World" );
}

foo();
// Hello
// World
```

Labeled loops/blocks are extremely uncommon, and often frowned upon. It's best to avoid them if possible; for example using function calls instead of the loop jumps. But there are perhaps some limited cases where they might be useful. If you're going to use a labeled jump, make sure to document what you're doing with plenty of comments!

It's a very common belief that JSON is a proper subset of JS, so a string of JSON (like `{"a":42}` -- notice the quotes around the property name as JSON requires!) is thought to be a valid JavaScript program. **Not true!** Try putting `{"a":42}` into your JS console, and you'll get an error.

That's because statement labels cannot have quotes around them, so `"a"` is not a valid label, and thus `:` can't come right after it.

So, JSON is truly a subset of JS syntax, but JSON is not valid JS grammar by itself.

One extremely common misconception along these lines is that if you were to load a JS file into a `<script src=..>` tag that only has JSON content in it (like from an API call), the data would be read as valid JavaScript but just be inaccessible to the program. JSON-P (the practice of wrapping the JSON data in a function call, like `foo({"a":42})`) is usually said to solve this inaccessibility by sending the value to one of your program's functions.

**Not true!** The totally valid JSON value `{"a":42}` by itself would actually throw a JS error because it'd be interpreted as a statement block with an invalid label. But `foo({"a":42})` is valid JS because in it, `{"a":42}` is an `object` literal value being passed to `foo(..)`. So, properly said, **JSON-P makes JSON into valid JS grammar!**

##### Blocks

Another commonly cited JS gotcha (related to coercion -- see Chapter 4) is:

```js
[] + {}; // "[object Object]"
{} + []; // 0
```

This seems to imply the `+` operator gives different results depending on whether the first operand is the `[]` or the `{}`. But that actually has nothing to do with it!

On the first line, `{}` appears in the `+` operator's expression, and is therefore interpreted as an actual value (an empty `object`). Chapter 4 explained that `[]` is coerced to `""` and thus `{}` is coerced to a `string` value as well: `"[object Object]"`.

But on the second line, `{}` is interpreted as a standalone `{}` empty block (which does nothing). Blocks don't need semicolons to terminate them, so the lack of one here isn't a problem. Finally, `+ []` is an expression that *explicitly coerces* (see Chapter 4) the `[]` to a `number`, which is the `0` value.

##### Object Destructuring

Starting with ES6, another place that you'll see `{ .. }` pairs showing up is with "destructuring assignments" (see the *ES6 & Beyond* title of this series for more info), specifically `object` destructuring. Consider:

```js
function getData() {
	// ..
	return {
		a: 42,
		b: "foo"
	};
}

var { a, b } = getData();

console.log( a, b ); // 42 "foo"
```

As you can probably tell, `var { a , b } = ..` is a form of ES6 destructuring assignment, which is roughly equivalent to:

```js
var res = getData();
var a = res.a;
var b = res.b;
```

**Note:** `{ a, b }` is actually ES6 destructuring shorthand for `{ a: a, b: b }`, so either will work, but it's expected that the shorter `{ a, b }` will become the preferred form.

Object destructuring with a `{ .. }` pair can also be used for named function arguments, which is sugar for this same sort of implicit object property assignment:

```js
function foo({ a, b, c }) {
	// no need for:
	// var a = obj.a, b = obj.b, c = obj.c
	console.log( a, b, c );
}

foo( {
	c: [1,2,3],
	a: 42,
	b: "foo"
} );	// 42 "foo" [1, 2, 3]
```

So, the context we use `{ .. }` pairs in entirely determines what they mean, which illustrates the difference between syntax and grammar. It's very important to understand these nuances to avoid unexpected interpretations by the JS engine.

#### `else if` And Optional Blocks

It's a common misconception that JavaScript has an `else if` clause, because you can do:

```js
if (a) {
	// ..
}
else if (b) {
	// ..
}
else {
	// ..
}
```

But there's a hidden characteristic of the JS grammar here: there is no `else if`. But `if` and `else` statements are allowed to omit the `{ }` around their attached block if they only contain a single statement. You've seen this many times before, undoubtedly:

```js
if (a) doSomething( a );
```

Many JS style guides will insist that you always use `{ }` around a single statement block, like:

```js
if (a) { doSomething( a ); }
```

However, the exact same grammar rule applies to the `else` clause, so the `else if` form you've likely always coded is *actually* parsed as:

```js
if (a) {
	// ..
}
else {
	if (b) {
		// ..
	}
	else {
		// ..
	}
}
```

The `if (b) { .. } else { .. }` is a single statement that follows the `else`, so you can either put the surrounding `{ }` in or not. In other words, when you use `else if`, you're technically breaking that common style guide rule and just defining your `else` with a single `if` statement.

Of course, the `else if` idiom is extremely common and results in one less level of indentation, so it's attractive. Whichever way you do it, just call out explicitly in your own style guide/rules and don't assume things like `else if` are direct grammar rules.
