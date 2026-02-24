## Concrete Coercions

Now that we've covered all the abstract operations JS defines for handling various coercions, it's time to turn our attention to the concrete statements/expressions we can use in our programs that activate these operations.

### To Boolean

To coerce a value that's not of type `boolean` into that type, we need the abstract `ToBoolean()` operation, as described earlier in this chapter.

Before we explore *how* to activate it, let's discuss *why* you would want to force a `ToBoolean()` coercion.

From a code readability perspective, being *explicit* about type coercions can be preferable (though not universally). But functionally, the most common reason to force a `boolean` is when you're passing data to an external source -- for example, submitting data as JSON to an API endpoint -- and that location expects `true` / `false` without needing to do coercions.

There's several ways that `ToBoolean()` can be activated. Perhaps the most *explicit* (obvious) is the `Boolean(..)` function:

```js
Boolean("hello");               // true
Boolean(42);                    // true

Boolean("");                    // false
Boolean(0);                     // false
```

As mentioned in Chapter 3, keep in mind that `Boolean(..)` is being called without the `new` keyword, to activate the `ToBoolean()` abstract operation.

It's not terribly common to see JS developers use the `Boolean(..)` function for such explicit coercions. More often, developers will use the double-`!` idiom:

```js
!!"hello";                      // true
!!42;                           // true

!!"";                           // false
!!0;                            // false
```

The `!!` is not its own operator, even though it seems that way. It's actually two usages of the unary `!` operator. This operator first coerces any non-`boolean`, then negates it. To undo the negation, the second `!` flips it back.

So... which of the two, `Boolean(..)` or `!!`, do you consider to be more of an explicit coercion?

Given the flipping that `!` does, which must then be undone with another `!`, I'd say `Boolean(..)` is *more* explicit -- at the job of coercing a non-`boolean` to a `boolean` -- than `!!` is. But surveying open-source JS code, the `!!` is used far more often.

If we're defining *explicit* as, "most directly and obviously performing an action", `Boolean(..)` edges out `!!`. But if we're defining *explicit* as, "most recognizably performing an action", `!!` might have the edge. Is there a definitive answer here?

While you're pondering that question, let's look at another JS mechanism that activates `ToBoolean()` under the covers:

```js
specialNumber = 42;

if (specialNumber) {
    // ..
}
```

The `if` statement requires a `boolean` for the conditional to make its control-flow decision. If you pass it a non-`boolean`, a `ToBoolean()` *coercion* is performed.

Unlike previous `ToBoolean()` coercion expressions, like `Boolean(..)` or `!!`, this `if` coercion is ephemeral, in that our JS program never sees the result of the coercion; it's just used internally by the `if`. Some may feel it's not *really* coercion if the program doesn't preserve/use the value. But I strongly disagree, because the coercion most definitely affects the program's behavior.

Many other statement types also activate the `ToBoolean()` coercion, including the `? :` ternary conditional, and `for` / `while` loops. We also have `&&` (logical-AND) and `||` (logical-OR) operators. For example:

```js
isLoggedIn = user.sessionID || req.cookie["Session-ID"];

isAdmin = isLoggedIn && ("admin" in user.permissions);
```

For both operators, the lefthand expression is first evaluated; if it's not already a `boolean`, a `ToBoolean()` coercion is activated to produce a value for the conditional decision.

| NOTE: |
| :--- |
| To briefly explain these operators: for `||`, if the lefthand expression value (post-coercion, if necessary) is `true`, the pre-coercion value is returned; otherwise the righthand expression is evaluated and returned (no coercion). For `&&`, if the lefthand expression value (post-coercion, if necessary) is `false`, the pre-coercion value is returned; otherwise, the righthand expression is evaluated and returned (no coercion). In other words, both `&&` and `||` force a `ToBoolean()` coercion of the lefthand operand for making the decision, but neither operator's final result is actually coerced to a `boolean`. |

In the previous snippet, despite the naming implications, it's unlikely that `isLoggedIn` will actually be a `boolean`; and if it's truthy, `isAdmin` also won't be a `boolean`. That kind of code is quite common, but it's definitely dangerous that the assumed resultant `boolean` types aren't actually there. We'll revisit this example, and these operators, in the next chapter.

Are these kinds of statements/expressions (e.g., `if (..)`, `||`, `&&`, etc) illustrating *explicit* coercion or *implicit* coercion in their conditional decision making?

Again, I think it depends on your perspective. The specification dictates pretty explicitly that they only make their decisions with `boolean` conditional values, requiring coercion if a non-`boolean` is received. On the other hand, a strong argument can also be made that any internal coercion is a secondary (implicit) effect to the main job of `if` / `&&` / etc.

Further, as mentioned earlier in the `ToBoolean()` discussion, some folks don't consider *any* activation of `ToBoolean()` to be a coercion.

I think that's too much of a stretch, though. My take: `Boolean(..)` is the most preferable *explicit* coercion form. I think `!!`, `if`, `for`, `while`, `&&`, and `||` are all *implicitly* coercing non-`boolean`s, but I'm OK with that.

Since most developers, including famous names like Doug Crockford, also in practice use implicit (`boolean`) coercions in their code[^CrockfordIfs], I think we can say that at least *some forms* of *implicit* coercion are widely acceptable, regardless of the ubiquitous rhetoric to the contrary.

### To String

As with `ToBoolean()`, there are a number of ways to activate the `ToString()` coercion (as discussed earlier in the chapter). The decision of which approach is similarly subjective.

Like the `Boolean(..)` function, the `String(..)` function (no `new` keyword) is a primary way of activating *explicit* `ToString()` coercion:

```js
String(true);                   // "true"
String(42);                     // "42"
String(-0);                     // "0"
String(Infinity);               // "Infinity"

String(null);                   // "null"
String(undefined);              // "undefined"
```

However, `String(..)` is more than *just* an activation of `ToString()`. For example:

```js
String(Symbol("ok"));           // "Symbol(ok)"
```

This works, because *explicit* coercion of `symbol` values is allowed. But in cases where a symbol is *implicitly* coerced to a string (e.g., `Symbol("ok") + ""`), the underlying `ToString()` operation throws an exception. That proves that `String(..)` is more than just an activation of `ToString()`. More on *implicit* string coercion of symbols in a bit.

If you call `String(..)` with an object value (e.g., array, etc), it activates the `ToPrimitive()` operation (via the `ToString()` operation), which then looks for an invokes that value's `toString()` method:

```js
String([1,2,3]);                // "1,2,3"

String(x => x + 1);             // "x => x + 1"
```

Aside from `String(..)`, any primitive, non-nullish value (neither `null` nor `undefined`) can be auto-boxed (see Chapter 3) in its respective object wrapper, providing a callable `toString()` method.

```js
true.toString();                // "true"
42..toString();                 // "42"
-0..toString();                 // "0"
Infinity.toString();            // "Infinity"
Symbol("ok").toString();        // "Symbol(ok)"
```

| NOTE: |
| :--- |
| Do keep in mind, these `toString()` methods do *not* necessarily activate the `ToString()` operation, they just define their own rules for how to represent the value as a string. |

As shown with `String(..)` just a moment ago, the various object sub-types -- such as arrays, functions, regular expressions, `Date` and `Error` instances, etc -- all define their own specific `toString()` methods, which can be invoked directly:

```js
[1,2,3].toString();             // "1,2,3"

(x => x + 1).toString();        // "x => x + 1"
```

Moreover, any plain object that's (by default) `[[Prototype]]` linked to `Object.prototype` has a default `toString()` method available:

```js
({ a : 1 }).toString();         // "[object Object]"
```

Is the `toString()` approach to coercion *explicit* or *implicit*? Again, it depends. It's certainly a self-descriptive mechanism, which leans *explicit*. But it often relies on auto-boxing, which is itself a fairly *implicit* coercion.

Let's take a look at another common -- and famously endorsed! -- idiom for coercing a value to a string. Recall from "String Concatenation" in Chapter 2, the `+` operator is overloaded to prefer string concatenation if either operand is already a string, and thus coerces non-string operand to a string if necessary.

Consider:

```js
true + "";                      // "true"
42 + "";                        // "42"
null + "";                      // "null"
undefined + "";                 // "undefined"
```

The `+ ""` idiom for string coercion takes advantage of the `+` overloading, without altering the final coerced string value. By the way, all of these work the same with the operands reversed (i.e., `"" + ..`).

| WARNING: |
| :--- |
| An extremely common misconception is that `String(x)` and `x + ""` are basically equivalent coercions, respectively just *explicit* vs *implicit* in form. But, that's not quite true! We'll revisit this in the "To Primitive" section later in this chapter. |

Some feel this is an *explicit* coercion, but I think it's clearly more *implicit*, in that it's taking advantage of the `+` overloading; further, the `""` is indirectly used to activate the coercion without modifying it. Moreover, consider what happens when this idiom is applied with a symbol value:

```js
Symbol("ok") + "";              // TypeError exception thrown
```

| WARNING: |
| :--- |
| Allowing *explicit* coercion of symbols (`String(Symbol("ok"))`, but disallowing *implicit* coercion (`Symbol("ok") + ""`), is quite intentional by TC39. [^SymbolString] It was felt that symbols, as primitives often used in places where strings are otherwise used, could too easily be mistaken as strings. As such, they wanted to make sure developers expressed intent to coerce a symbol to a string, hopefully avoiding many of those anticipated confusions. This is one of the *extremely rare* cases where the language design asserts an opinion on, and actually discriminates between, *explicit* vs. *implicit* coercions. |

Why the exception? JS treats `+ ""` as an *implicit* coercion, which is why when activated with a symbol, an exception is thrown. I think that's a pretty ironclad proof.

Nevertheless, as I mentioned at the start of this chapter, Brendan Eich endorses `+ ""`[^BrendanToString] as the *best* way to coerce values to strings. I think that carries a lot of weight, in terms of him supporting at least a subset of *implicit* coercion practices. His views on *implicit* coercion must be a bit more nuanced than, "it's all bad."

### To Number

Numeric coercions are a bit more complicated than string coercions, since we can be talking about either `number` or `bigint` as the target type. There's also a much smaller set of values that can be validly represented numerically (everything else becomes `NaN`).

Let's start with the `Number(..)` and `BigInt(..)` functions (no `new` keywords):

```js
Number("42");                   // 42
Number("-3.141596");            // -3.141596
Number("-0");                   // -0

BigInt("42");                   // 42n
BigInt("-0");                   // 0n
```

`Number` coercion which fails (not recognized) results in `NaN` (see "Invalid Number" in Chapter 1), whereas `BigInt` throws an exception:

```js
Number("123px");                // NaN

BigInt("123px");
// SyntaxError: Cannot convert 123px to a BigInt
```

Moreover, even though `42n` is valid syntax as a literal `bigint`, the string `"42n"` is never a recognized string representation of a `bigint`, by either of the coercive function forms:

```js
Number("42n");                  // NaN

BigInt("42n");
// SyntaxError: Cannot convert 42n to a BigInt
```

However, we *can* coerce numeric strings with other representations of the numbers than typical base-10 decimals (see Chapter 1 for more information):

```js
Number("0b101010");             // 42

BigInt("0b101010");             // 42n
```

Typically, `Number(..)` and `BigInt(..)` receive string values, but that's not actually required. For example, `true` and `false` coerce to their typical numeric equivalents:

```js
Number(true);                   // 1
Number(false);                  // 0

BigInt(true);                   // 1n
BigInt(false);                  // 0n
```

You can also generally coerce between `number` and `bigint` types:

```js
Number(42n);                    // 42
Number(42n ** 1000n);           // Infinity

BigInt(42);                     // 42n
```

We can also use the `+` unary operator, which is commonly assumed to coerce the same as the `Number(..)` function:

```js
+"42";                          // 42
+"0b101010";                    // 42
```

Be careful though. If the coercions are unsafe/invalid in certain ways, exceptions are thrown:

```js
BigInt(3.141596);
// RangeError: The number 3.141596 cannot be converted to a BigInt

+42n;
// TypeError: Cannot convert a BigInt value to a number
```

Clearly, `3.141596` does not safely coerce to an integer, let alone a `bigint`.

But `+42n` throwing an exception is an interesting case. By contrast, `Number(42n)` works fine, so it's a bit surprising that `+42n` fails.

| WARNING: |
| :--- |
| That surprise is especially palpable since prepending a `+` in front of a number is typically assumed to just mean a "positive number", the same way `-` in front a number is assumed to mean a "negative number". As explained in Chapter 1, however, JS numeric syntax (`number` and `bigint`) recognize no syntax for "negative values". All numeric literals are parsed as "positive" by default. If a `+` or `-` is prepended, those are treated as unary operators applied against the parsed (positive) number. |

OK, so `+42n` is parsed as `+(42n)`. But still... why is `+` throwing an exception here?

You might recall earlier when we showed that JS allows *explicit* string coercion of symbol values, but disallows *implicit* string coercions? The same thing is going on here. JS language design interprets unary `+` in front of a `bigint` value as an *implicit* `ToNumber()` coercion (thus disallowed!), but `Number(..)` is interpreted as an *explicit* `ToNumber()` coercion (thus allowed!).

In other words, contrary to popular assumption/assertion, `Number(..)` and `+` are not interchangable. I think `Number(..)` is the safer/more reliable form.

#### Mathematical Operations

Mathematical operators (e.g., `+`, `-`, `*`, `/`, `%`, and `**`) expect their operands to be numeric. If you use a non-`number` with them, that value will be coerced to a `number` for the purposes of the mathematical computation.

Similar to how `x + ""` is an idiom for coercing `x` to a string, an expression like `x - 0` safely coerces `x` to a number.

| WARNING: |
| :--- |
| `x + 0` isn't quite as safe, since the `+` operator is overloaded to perform string concatenation if either operand is already a string. The `-` minus operator isn't overloaded like that, so the only coercion will be to `number`. Of course, `x * 1`, `x / 1`, and even `x ** 1` would also generally be equivalent mathematically, but those are much less common, and probably should be avoided as likely confusing to readers of your code. Even `x % 1` seems like it should be safe, but it can introduce floating-point skew (see "Floating Point Imprecision" in Chapter 2). |

Regardless of what mathematical operator is used, if the coercion fails, a `NaN` is the result, and all of these operators will propagate the `NaN` out as their result.

#### Bitwise Operations

Bitwise operators (e.g., `|`, `&`, `^`, `>>`, `<<`, and `<<<`) all expect number operands, but specifically they clamp these values to 32-bit integers.

If you're sure the numbers you're dealing with are safely within the 32-bit integer range, `x | 0` is another common expression idiom that has the effect of coercing `x` to a `number` if necessary.

Moreover, since JS engines know these values will be integers, there's potential for them to optimize for integer-only math if they see `x | 0`. This is one of several recommended "type annotations" from the ASM.js[^ASMjs] efforts from years ago.

#### Property Access

Property access of objects (and index access of arrays) is another place where implicit coercion can occur.

Consider:

```js
myObj = {};

myObj[3] = "hello";
myObj["3"] = "world";

console.log( myObj );
```

What do you expect from the contents of this object? Do you expect two different properties, numeric `3` (holding `"hello"`) and string `"3"` (holding `"world"`)? Or do you think both properties are in the same location?

If you try that code, you'll see that indeed we get an object with a single property, and it holds the `"world"` value. That means that JS is internally coercing either the `3` to `"3"`, or vice versa, when those properties accesses are made.

Interestingly, the developer console may very well represent the object sort of like this:

```js
console.log( myObj );
// {3: 'world'}
```

Does that `3` there indicate the property is a numeric `3`? Not quite. Try adding another property to `myObj`:

```js
myObj.something = 42;

console.log( myObj )
// {3: 'world', something: 42}
```

We can see that this developer console doesn't quote string property keys, so we can't infer anything from `3` versus if the console had used `"3"` for the key name.

Let's instead try consulting the specification for the object value[^ObjectValue], where we find:

> A property key value is either an ECMAScript String value or a Symbol value. All String and Symbol values, including the empty String, are valid as property keys. A property name is a property key that is a String value.

OK! So, in JS, objects only hold string (or symbol) properties. That must mean that the numeric `3` is coerced to a string `"3"`, right?

In the same section of the specification, we further read:

> An integer index is a String-valued property key that is a canonical numeric String (see 7.1.21) and whose numeric value is either +0𝔽 or a positive integral Number ≤ 𝔽(253 - 1). An array index is an integer index whose numeric value i is in the range +0𝔽 ≤ i < 𝔽(232 - 1).

If a property key (like `"3"`) *looks* like a number, it's treated as an integer index. Hmmm... that almost seems to suggest the opposite of what we just posited, right?

Nevertheless, we know from the previous quote that property keys are *only* strings (or symbols). So it must be that "integer index" here is not describing the actual location, but rather the intentional usage of `3` in JS code, as a developer-expressed "integer index"; JS must still then actually store it at the location of the "canonical numeric String".

Consider attempts to use other value-types, like `true`, `null`, `undefined`, or even non-primitives (other objects):

```js
myObj[true] = 100;
myObj[null] = 200;
myObj[undefined] = 300;
myObj[ {a:1} ] = 400;

console.log(myObj);
// {3: 'world', something: 42, true: 100, null: 200,
// undefined: 300, [object Object]: 400}
```

As you can see, all of those other value-types were coerced to strings for the purposes of object property names.

But before we convince ourselves of this interpretation that everything (even numbers) is coerced to strings, let's look at an array example:

```js
myArr = [];

myArr[3] = "hello";
myArr["3"] = "world";

console.log( myArr );
// [empty × 3, 'world']
```

The developer console will likely represent an array a bit differently than a plain object. Nevertheless, we still see that this array only has the single `"world"` value in it, at the numeric index position corresponding to `3`.

That kind of output sort of implies the opposite of our previous interpretation: that the values of an array are being stored only at numeric positions. If we add another string property-name to `myArr`:

```js
myArr.something = 42;
console.log( myArr );
// [empty × 3, 'world', something: 42]
```

Now we see that this developer console represents the numerically indexed positions in the array *without* the property names (locations), but the `something` property is named in the output.

It's also true that JS engines like v8 tend to, for performance optimization reasons, special-case object properties that are numeric-looking strings as actually being stored in numeric positions as if they were arrays. So even if the JS program acts as if the property name is `"3"`, in fact under the covers, v8 might be treating it as if coerced to `3`!

What can take from all this?

The specification clearly tells us that the behavior of object properties is for them to be treated like strings (or symbols). That means we can assume that using `3` to access a location on an object will have the internal effect of coercing that property name to `"3"`.

But with arrays, we observe a sort of opposite semantic: using `"3"` as a property name has the effect of accessing the numerically indexed `3` position, as if the string was coerced to the number. But that's mostly just an offshot of the fact that arrays always tend to behave as numerically indexed, and/or perhaps a reflection of underlying implementation/optimization details in the JS engine.

The important part is, we need to recognize that objects cannot simply use any value as a property name. If it's anything other than a string or a number, we can expect that there *will be* a coercion of that value.

We need to expect and plan for that rather than allowing it to surprise us with bugs down the road!

### To Primitive

Most operators in JS, including those we've seen with coercions to `string` and `number`, are designed to run against primitive values. When any of these operators is used instead against an object value, the abstract `ToPrimitive` algorithm (as described earlier) is activated to coerce the object to a primitive.

Let's set up an object we can use to inspect how different operations behave:

```js
spyObject = {
    toString() {
        console.log("toString() invoked!");
        return "10";
    },
    valueOf() {
        console.log("valueOf() invoked!");
        return 42;
    },
};
```

This object defines both the `toString()` and `valueOf()` methods, and each one returns a different type of value (`string` vs `number`).

Let's try some of the coercion operations we've already seen:

```js
String(spyObject);
// toString() invoked!
// "10"

spyObject + "";
// valueOf() invoked!
// "42"
```

Whoa! I bet that surprised a few of you readers; it certainly did me. It's so common for people to assert that `String(..)` and `+ ""` are equivalent forms of activating the `ToString()` operation. But they're clearly not!

The difference comes down to the *hint* that each operation provides to `ToPrimitive()`. `String(..)` clearly provides `"string"` as the *hint*, whereas the `+ ""` idiom provides no *hint* (similar to *hinting* `"number"`). But don't miss this detail: even though `+ ""` invokes `valueOf()`, when that returns a `number` primitive value of `42`, that value is then coerced to a string (via `ToString()`), so we get `"42"` instead of `42`.

Let's keep going:

```js
Number(spyObject);
// valueOf() invoked!
// 42

+spyObject;
// valueOf() invoked!
// 42
```

This example implies that `Number(..)` and the unary `+` operator both perform the same `ToPrimitive()` coercion (with *hint* of `"number"`), which in our case returns `42`. Since that's already a `number` as requested, the value comes out without further ado.

But what if a `valueOf()` returns a `bigint`?

```js
spyObject2 = {
    valueOf() {
        console.log("valueOf() invoked!");
        return 42n;  // bigint!
    }
};

Number(spyObject2);
// valueOf() invoked!
// 42     <--- look, not a bigint!

+spyObject2;
// valueOf() invoked!
// TypeError: Cannot convert a BigInt value to a number
```

We saw this difference earlier in the "To Number" section. JS allows an *explicit* coercion of the `42n` bigint value to the `42` number value, but it disallows what it considers to be an *implicit* coercion form.

What about the `BigInt(..)` (no `new` keyword) coercion function?

```js
BigInt(spyObject);
// valueOf() invoked!
// 42n    <--- look, a bigint!

BigInt(spyObject2);
// valueOf() invoked!
// 42n

// *******************************

spyObject3 = {
    valueOf() {
        console.log("valueOf() invoked!");
        return 42.3;
    }
};

BigInt(spyObject3);
// valueOf() invoked!
// RangeError: The number 42.3 cannot be converted to a BigInt
```

Again, as we saw in the "To Number" section, `42` can safely be coerced to `42n`. On the other hand, `42.3` cannot safely be coerced to a `bigint`.

We've seen that `toString()` and `valueOf()` are invoked, variously, as certain `string` and `number` / `bigint` coercions are performed.

#### No Primitive Found?

If `ToPrimitive()` fails to produce a primitive value, an exception will be thrown:

```js
spyObject4 = {
    toString() {
        console.log("toString() invoked!");
        return [];
    },
    valueOf() {
        console.log("valueOf() invoked!");
        return {};
    }
};

String(spyObject4);
// toString() invoked!
// valueOf() invoked!
// TypeError: Cannot convert object to primitive value

Number(spyObject4);
// valueOf() invoked!
// toString() invoked!
// TypeError: Cannot convert object to primitive value
```

If you're going to define custom to-primitive coercions via `toString()` / `valueOf()`, make sure to return a primitive from at least one of them!

#### Object To Boolean

What about `boolean` coercions of objects?

```js
Boolean(spyObject);
// true

!spyObject;
// false

if (spyObject) {
    console.log("if!");
}
// if!

result = spyObject ? "ternary!" : "nope";
// "ternary!"

while (spyObject) {
    console.log("while!");
    break;
}
// while!
```

Each of these are activating `ToBoolean()`. But if you recall from earlier, *that* algorithm never delegates to `ToPrimitive()`; thus, we don't see "valueOf() invoked!" being logged out.

#### Unboxing: Wrapper To Primitive

A special form of objects that are often `ToPrimitive()` coerced: boxed/wrapped primitives (as seen in Chapter 3). This particular object-to-primitive coercion is often referred to as *unboxing*.

Consider:

```js
hello = new String("hello");
String(hello);                  // "hello"
hello + "";                     // "hello"

fortyOne = new Number(41);
Number(fortyOne);               // 41
fortyOne + 1;                   // 42
```

The object wrappers `hello` and `fortyOne` above have `toString()` and `valueOf()` methods configured on them, to behave similarly to the `spyObject` / etc objects from our previous examples.

A special case to be careful of with wrapped-object primitives is with `Boolean()`:

```js
nope = new Boolean(false);
Boolean(nope);                  // true   <--- oops!
!!nope;                         // true   <--- oops!
```

Remember, this is because `ToBoolean()` does *not* reduce an object to its primitive form with `ToPrimitive`; it merely looks up the value in its internal table, and since normal (non-exotic[^ExoticFalsyObjects]) objects are always truthy, `true` comes out.

| NOTE: |
| :--- |
| It's a nasty little gotcha. A case could certainly be made that `new Boolean(false)` should configure itself internally as an exotic "falsy object". [^ExoticFalsyObjects] Unfortunately, that change now, 25 years into JS's history, could easily create breakage in programs. As such, JS has left this gotcha untouched. |

#### Overriding Default `toString()`

As we've seen, you can always define a `toString()` on an object to have *it* invoked by the appropriate `ToPrimitive()` coercion. But another option is to override the `Symbol.toStringTag`:

```js
spyObject5a = {};
String(spyObject5a);
// "[object Object]"
spyObject5a.toString();
// "[object Object]"

spyObject5b = {
    [Symbol.toStringTag]: "my-spy-object"
};
String(spyObject5b);
// "[object my-spy-object]"
spyObject5b.toString();
// "[object my-spy-object]"

spyObject5c = {
    get [Symbol.toStringTag]() {
        return `myValue:${this.myValue}`;
    },
    myValue: 42
};
String(spyObject5c);
// "[object myValue:42]"
spyObject5c.toString();
// "[object myValue:42]"
```

`Symbol.toStringTag` is intended to define a custom string value to describe the object whenever its default `toString()` operation is invoked directly, or implicitly via coercion; in its absence, the value used is `"Object"` in the common `"[object Object]"` output.

The `get ..` syntax in `spyObject5c` is defining a *getter*. That means when JS tries to access this `Symbol.toStringTag` as a property (as normal), this getter code instead causes the function we specify to be invoked to compute the result. We can run any arbitrary logic inside this getter to dynamically determine a string *tag* for use by the default `toString()` method.

#### Overriding `ToPrimitive`

You can alternately override the whole default `ToPrimitive()` operation for any object, by setting the special symbol property `Symbol.toPrimitive` to hold a function:

```js
spyObject6 = {
    [Symbol.toPrimitive](hint) {
        console.log(`toPrimitive(${hint}) invoked!`);
        return 25;
    },
    toString() {
        console.log("toString() invoked!");
        return "10";
    },
    valueOf() {
        console.log("valueOf() invoked!");
        return 42;
    },
};

String(spyObject6);
// toPrimitive(string) invoked!
// "25"   <--- not "10"

spyObject6 + "";
// toPrimitive(default) invoked!
// "25"   <--- not "42"

Number(spyObject6);
// toPrimitive(number) invoked!
// 25     <--- not 42 or "25"

+spyObject6;
// toPrimitive(number) invoked!
// 25
```

As you can see, if you define this function on an object, it's used entirely in replacement of the default `ToPrimitive()` abstract operation. Since `hint` is still provided to this invoked function (`[Symbol.toPrimitive](..)`), you could in theory implement your own version of the algorithm, invoking a `toString()`, `valueOf()`, or any other method on the object (`this` context reference).

Or you can just manually define a return value as shown above. Regardless, JS will *not* automatically invoke either `toString()` or `valueOf()` methods.

| WARNING: |
| :--- |
| As discussed prior in "No Primitive Found?", if the defined `Symbol.toPrimitive` function does not actually return a value that's a primitive, an exception will be thrown about being unable to "...convert object to primitive value". Make sure to always return an actual primitive value from such a function! |

### Equality

Thus far, the coercions we've seen have been focused on single values. We turn out attention now to equality comparisons, which inherently involve two values, either or both of which may be subject to coercion.

Earlier in this chapter, we talked about several abstract operations for value equality comparison.

For example, the `SameValue()` operation[^SameValue] is the strictest of the equality comparisons, with absolutely no coercion. The most obvious JS operation that relies on `SameValue()` is:

```js
Object.is(42,42);                   // true
Object.is(-0,-0);                   // true
Object.is(NaN,NaN);                 // true

Object.is(0,-0);                    // false
```

The `SameValueZero()` operation -- recall, it only differs from `SameValue()` by treating `-0` and `0` as indistinguishable -- is used in quite a few more places, including:

```js
[ 1, 2, NaN ].includes(NaN);        // true
```

We can see the `0` / `-0` misdirection of `SameValueZero()` here:

```js
[ 1, 2, -0 ].includes(0);           // true  <--- oops!

(new Set([ 1, 2, 0 ])).has(-0);     // true  <--- ugh

(new Map([[ 0, "ok" ]])).has(-0);   // true  <--- :(
```

In these cases, there's a *coercion* (of sorts!) that treats `-0` and `0` as indistinguishable. No, that's not technically a "coercion" in that the type is not being changed, but I'm sort of fudging the definition to *include* this case in our broader discussion of coercion here.

Contrast the `includes()` / `has()` methods here, which activate `SameValueZero()`, with the good ol' `indexOf(..)` array utility, which instead activates `IsStrictlyEqual()` instead. This algorithm is slightly more "coercive" than `SameValueZero()`, in that it prevents `NaN` values from ever being treated as equal to each other:

```js
[ 1, 2, NaN ].indexOf(NaN);         // -1  <--- not found
```

If these nuanced quirks of `includes(..)` and `indexOf(..)` bother you, when searching -- looking for an equality match within -- for a value in an array, you can avoid any "coercive" quicks and *force* the strictest `SameValue()` equality matching, via `Object.is(..)`:

```js
vals = [ 0, 1, 2, -0, NaN ];

vals.find(v => Object.is(v,-0));            // -0
vals.find(v => Object.is(v,NaN));           // NaN

vals.findIndex(v => Object.is(v,-0));       // 3
vals.findIndex(v => Object.is(v,NaN));      // 4
```

#### Equality Operators: `==` vs `===`

The most obvious place where *coercion* is involved in equality checks is with the `==` operator. Despite any pre-conceived notions you may have about `==`, it behaves extremely predictably, ensuring that both operands match types before performing its equality check.

To state something that may or may not be super obvious: the `==` (and `===`) operators always return a `boolean` (`true` or `false`), indicating the result of the equality check; they never return anything else, regardless of what coercion may happen.

Now, recall and review the steps discussed earlier in the chapter for the `IsLooselyEqual()` operation. [^LooseEquality] Its behavior, and thus how `==` acts, can be pragmatically intuited with just these two facts in mind:

1. If the types of both operands are the same, `==` has the exact same behavior as `===` -- `IsLooselyEqual()` immediately delegates to `IsStrictlyEqual()`. [^StrictEquality]

    For example, when both operands are object references:

    ```js
    myObj = { a: 1 };
    anotherObj = myObj;

    myObj == anotherObj;                // true
    myObj === anotherObj;               // true
    ```

    Here, `==` and `===` determine that both of their respective operands are of the `object` reference type, so both equality checks behave identically; they compare the object references for equality.

2. But if the operand types differ, `==` allows coercion until they match, and prefers numeric comparison; it attempts to coerce both operands to numbers, if possible:

    ```js
    42 == "42";                         // true
    ```

    Here, the `"42"` string is coerced to a `42` number (not vice versa), and thus the comparison is then `42 == 42`, and must clearly return `true`.


Armed with this knowledge, we'll now dispel the common myth that only `===` checks the type and value, while `==` checks only the value. Not true!

In fact, `==` and `===` are both type-sensitive, each checking the types of their operands. The `==` operator allows coercion of mismatched types, whereas `===` disallows any coercion.

It's a nearly universally held opinion that `==` should be avoided in favor of `===`. I may be one of the only developers who publicly advocates a clear and straight-faced case for the opposite. I think the main reason people instead prefer `===`, beyond simply conforming to the status quo, is a lack of taking the time to actually understand `==`.

I'll be revisiting this topic to make the case for preferring `==` over `===`, later in this chapter, in "Type Aware Equality". All I ask is, no matter how strongly you currently disagree with me, try to keep an open mindset.

#### Nullish Coercion

We've already seen a number of JS operations that are nullish -- treating `null` and `undefined` as coercively equal to each other, including the `?.` optional-chaining operator and the `??` nullish-coalescing operator (see "Null'ish" in Chapter 1).

But `==` is the most obvious place that JS exposes nullish coercive equality:

```js
null == undefined;              // true
```

Neither `null` nor `undefined` will ever be coercively equal to any other value in the language, other than to each other. That means `==` makes it ergonomic to treat these two values as indistinguishable.

You might take advantage of this capability as such:

```js
if (someData == null) {
    // `someData` is "unset" (either null or undefined),
    // so set it to some default value
}

// OR:

if (someData != null) {
    // `someData` is set (neither null nor undefined),
    // so use it somehow
}
```

Remember that `!=` is the negation of `==`, whereas `!==` is the negation of `===`. Don't match the count of `=`s unless you want to confuse yourself!

Compare these two approaches:

```js
if (someData == null) {
    // ..
}

// vs:

if (someData === null || someData === undefined) {
    // ..
}
```

Both `if` statements will behave exactly identically. Which one would you rather write, and which one would you rather read later?

To be fair, some of you prefer the more verbose `===` equivalent. And that's OK. I disagree, I think the `==` version of this check is *much* better. And I also maintain that the `==` version is more consistent in stylistic spirit with how the other nullish operators like `?.` and `??` act.

But another minor fact you might consider: in performance benchmarks I've run many times, JS engines can perform the single `== null` check as shown *slightly faster* than the combination of two `===` checks. In other words, there's a tiny but measurable benefit to letting JS's `==` perform the *implicit* nullish coercion than in trying to *explicitly* list out both checks yourself.

I'd observe that even many diehard `===` fans tend to concede that `== null` is at least one such case where `==` is preferable.

#### `==` Boolean Gotcha

Aside from some coercive corner cases we'll address in the next section, probably the biggest gotcha to be aware of with `==` has to do with booleans.

Pay very close attention here, as it's one of the biggest reasons people get bitten by, and then come to despise, `==`. If you take my simple advice (at the end of this section), you'll never be a victim!

Consider the following snippet, and let's assume for a minute that `isLoggedIn` is *not* holding a `boolean` value (`true` or `false`):

```js
if (isLoggedIn) {
    // ..
}

// vs:

if (isLoggedIn == true) {
    // ..
}
```

We've already covered the first `if` statement form. We know `if` expects a `boolean`, so in this case `isLoggedIn` will be coerced to a `boolean` using the lookup table in the `ToBoolean()` abstract operation. Pretty straightforward to predict, right?

But take a look at the `isLoggedIn == true` expression. Do you think it's going to behave the same way?

If your instinct was *yes*, you've just fallen into a tricky little trap. Recall early in this chapter when I warned that the rules of `ToBoolean()` coercion only apply if the JS operation is actually activating that algorithm. Here, it seems like JS must be doing so, because `== true` seems so clearly a "boolean related" type of comparison.

But nope. Go re-read the `IsLooselyEqual()` algorithm (for `==`) earlier in the chapter. Go on, I'll wait. If you don't like my summary, go read the specification algorithm[^LooseEquality] itself.

OK, do you see anything in there that mentions invoking `ToBoolean()` under any circumstance?

Nope!

Remember: when the types of the two `==` operands are not the same, it prefers to coerce them both to numbers.

What might be in `isLoggedIn`, if it's not a `boolean`? Well, it could be a string value like `"yes"`, for example. In that form, `if ("yes") { .. }` would clearly pass the conditional check and execute the block.

But what's going to happen with the `==` form of the `if` conditional? It's going to act like this:

```js
// (1)
"yes" == true

// (2)
"yes" == 1

// (3)
NaN == 1

// (4)
NaN === 1           // false
```

So in other words, if `isLoggedIn` holds a value like `"yes"`, the `if (isLoggedIn) { .. }` block will pass the conditional check, but the `if (isLoggedIn == true)` check will not. Ugh!

What if `isLoggedIn` held the string `"true"`?

```js
// (1)
"true" == true

// (2)
"true" == 1

// (3)
NaN == 1

// (4)
NaN === 1           // false
```

Facepalm.

Here's a pop quiz: what value would `isLoggedIn` need to hold for both forms of the `if` statement conditional to pass?

...

...

...

...

What if `isLoggedIn` was holding the number `1`? `1` is truthy, so the `if (isLoggedIn)` form passes. And the other `==` form that involves coercion:

```js
// (1)
1 == true

// (2)
1 == 1

// (3)
1 === 1             // true
```

But if `isLoggedIn` was instead holding the string `"1"`? Again, `"1"` is truthy, but what about the `==` coercion?

```js
// (1)
"1" == true

// (2)
"1" == 1

// (3)
1 == 1

// (4)
1 === 1             // true
```

OK, so `1` and `"1"` are two values that `isLoggedIn` can hold that are safe to coerce along with `true` in a `==` equality check. But basically almost no other values are safe for `isLoggedIn` to hold.

We have a similar gotcha if the check is `== false`. What values are safe in such a comparison? `""` and `0` work. But:

```js
if ([] == false) {
    // this will run!
}
```

`[]` is a truthy value, but it's also coercively equal to `false`?! Ouch.

What are we to make of these gotchas with `== true` and `== false` checks? I have a plain and simple answer.

Never, ever, under any circumstances, perform a `==` check if either side of the comparison is a `true` or `false` value. It looks like it's going to behave as a nice `ToBoolean()` coercion, but it slyly won't, and will instead be ensnared in a variety of coercion corner cases (addressed in the next section). And avoid the `===` forms, too.

When you're dealing with booleans, stick to the implicitly coercive forms that are genuinely activating `ToBoolean()`, such as `if (isLoggedIn)`, and stay away from the `==` / `===` forms.
