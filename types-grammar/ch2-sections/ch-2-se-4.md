## Number Behaviors

Numbers are used for a variety of tasks in our programs, but mostly for mathematical computations. Pay close attention to how JS numbers behave, to ensure the outcomes are as expected.

### Floating Point Imprecision

We need to revisit our discussion of IEEE-754 from Chapter 1.

One of the classic gotchas of any IEEE-754 number system in any programming language -- NOT UNIQUELY JS! -- is that not all operations and values can fit neatly into the IEEE-754 representations.

The most common illustration is:

```js
point3a = 0.1 + 0.2;
point3b = 0.3;

point3a;                        // 0.30000000000000004
point3b;                        // 0.3

point3a === point3b;            // false <-- oops!
```

The operation `0.1 + 0.2` ends up creating floating-point error (drift), where the value stored is actually `0.30000000000000004`.

The respective bit representations are:

```
// 0.30000000000000004
00111111110100110011001100110011
00110011001100110011001100110100

// 0.3
00111111110100110011001100110011
00110011001100110011001100110011
```

If you look closely at those bit patterns, only the last 2 bits differ, from `00` to `11`. But that's enough for those two numbers to be unequal!

Again, just to reinforce: this behavior is **NOT IN ANY WAY** unique to JS. This is exactly how any IEEE-754 conforming programming language will work in the same scenario. As I asserted above, the majority of all programming languages use IEEE-754, and thus they will all suffer this same fate.

The temptation to make fun of JS for `0.1 + 0.2 !== 0.3` is strong, I know. But here it's completely bogus.

| NOTE: |
| :--- |
| Pretty much all programmers need to be aware of IEEE-754 and make sure they are careful about these kinds of gotchas. It's somewhat amazing, in a disappointing way, how few of them have any idea how IEEE-754 works. If you've taken your time reading and understanding these concepts so far, you're now in that rare tiny percentage who actually put in the effort to understand the numbers in their programs! |

#### Epsilon Threshold

A common piece of advice to work around such floating-point imprecision uses this *very small* `number` value defined by JS:

```js
Number.EPSILON;                 // 2.220446049250313e-16
```

*Epsilon* is the smallest difference JS can represent between `1` and the next value greater than `1`. While this value is technically implementation/platform dependent, it's generally about `2.2E-16`, or `2^-52`.

To those not paying close enough attention to the details here -- including my past self! -- it's generally assumed that any skew in floating point precision from a single operation should never be greater than `Number.EPSILON`. Thus, in theory, we can use `Number.EPSILON` as a *very small* tolerance value to ensure number equality comparisons are *safe*:

```js
function safeNumberEquals(a,b) {
    return Math.abs(a - b) < Number.EPSILON;
}

point3a = 0.1 + 0.2;
point3b = 0.3;

// are these safely "equal"?
safeNumberEquals(point3a,point3b);      // true
```

| WARNING: |
| :--- |
| In the first edition "Types & Grammar" book, I indeed recommended exactly this approach. I was wrong. I should have researched the topic more closely. |

But, it turns out, this approach isn't safe at all:

```js
point3a = 10.1 + 0.2;
point3b = 10.3;

safeNumberEquals(point3a,point3b);      // false :(
```

Well... that's a bummer!

Unfortunately, `Number.EPSILON` only works as a "safely equal" error threshold for certain small numbers/operations, and in other cases, it's far too small, and yields false negatives.

You could scale `Number.EPSILON` by some factor to produce a larger threshold that avoids false negatives but still filters out all the floating point skew in your program. But what factor to use is entirely a manual judgement call based on what magnitude of values, and operations on them, your program will entail. There's no automatic way to compute a reliable, universal threshold.

Unless you really know what you're doing, you should just *not* use this `Number.EPSILON` threshold approach at all.

| TIP: |
| :--- |
| If you'd like to read more details and solid advice on this topic, I highly recommend reading this post. [^EpsilonBad] But if we can't use `Number.EPSILON` to avoid the perils of floating-point skew, what do we do? If you can avoid floating-point altogether by scaling all your numbers up so they're all whole number integers (or bigints) while performing math, do so. Only deal with decimal values when you have to output/represent a final value after all the math is done. If that's not possible/practical, use an arbitrary precision decimal emulation library and avoid `number` values entirely. Or do your math in another external programming environment that's not based on IEEE-754. |

### Numeric Comparison

Like strings, number values can be compared (for both equality and relational ordering) using the same operators.

Remember that no matter what form the number value takes when being specified as a literal (base-10, octal, hexadecimal, exponential, etc), the underlying value stored is what will be compared. Also keep in mind the floating point imprecision issues discussed in the previous section, as the comparisons will be sensitive to the exact binary contents.

#### Numeric Equality

Just like strings, equality comparisons for numbers use either the `==` / `===` operators or `Object.is(..)`. Also recall that if the types of both operands are the same, `==` performs identically to `===`.

```js
42 == 42;                   // true
42 === 42;                  // true

42 == 43;                   // false
42 === 43;                  // false

Object.is(42,42);           // true
Object.is(42,43);           // false
```

For `==` coercive equality (when the operand types don't match), if either operand is not a string value, `==` prefers a numeric equality check (meaning both operands are coerced to numbers).

```js
// numeric (not string!) comparison
42 == "42";                 // true
```

In this snippet, the coercive equality coerces `"42"` to `42`, not vice versa (`42` to `"42"`). Once both types are `number`, then their values are compared for exact equality, the same as `===` would.

Recall that JS doesn't distinguish between values like `42`, `42.0`, and `42.000000`; under the covers, they're all the same. Unsurpisingly, the `==` and `===` equality checks verify that:

```js
42 == 42.0;                 // true
42.0 == 42.00000;           // true
42.00 === 42.000;           // true
```

The intuition you likely have is, if two numbers are literally the same, they're equal. And that's how JS interprets it. But `0.3` is not literally the same as the result of `0.1 + 0.2`, because (as we saw earlier), the latter produces an underlying value that's *very close* to `0.3`, but is not exactly identical.

What's interesting is, the two values are *so close* that their difference is less than the `Number.EPSILON` threshold, so JS can't actually represent that difference *accurately*.

You might then think, at least informally, that such JS numbers should be "equal", since the difference between them is too small to represent. But notice: JS *can* represent that there *is* a difference, which is why you see that `4` at the very end of the decimal when JS evaluates `0.1 + 0.2`. And you *could* type out the number literal `0.00000000000000004` (aka, `4e-17`), being that difference between `0.3` and `0.1 + 0.2`.

What JS cannot do, with its IEEE-754 floating point numbers, is represent a number that small in an *accurate* enough way that operations on it produce expected results. It's too small to be fully and properly represented in the `number` type JS provides.

So `0.1 + 0.2 == 0.3` resolves to `false`, because there's a difference between the two values, even though JS can't accurately represent or do anything with a value as small as that difference.

Also like we saw with strings, the `!=` (coercive not-equal) and `!==` (strict-not-equal) operators work with numbers. `x != y` is basically `!(x == y)`, and `x !== y` is basically `!(x === y)`.

There are two frustrating exceptions in numeric equality (whether you use `==` or `===`):

```js
NaN === NaN;                // false -- ugh!
-0 === 0;                   // true -- ugh!
```

`NaN` is never equal to itself (even with `===`), and `-0` is always equal to `0` (even with `===`). It sometimes surprises folks that even `===` has these two exceptions in it.

However, the `Object.is(..)` equality check has neither of these exceptions, so for equality comparisons with `NaN` and `-0`, avoid the `==` / `===` operators and use `Object.is(..)` -- or for `NaN` specifically, `Number.isNaN(..)`.

#### Numeric Relational Comparisons

Just like with string values, the JS relational operators (`<`, `<=`, `>`, and `>=`) operate with numbers. The `<` (less-than) and `>` (greater-than) operations should be fairly self explanatory:

```js
41 < 42;                    // true

0.1 + 0.2 > 0.3;            // true (ugh, IEEE-754)
```

Remember: just like `==`, the `<` and `>` operators are also coercive, meaning that any non-number values are coerced to numbers -- unless both operands are already strings, as we saw earlier. There are no strict relational comparison operators.

If you're doing relational comparisons between numbers, the only way to avoid coercion is to ensure that the comparisons always have two numbers. Otherwise, these operators will do *coercive relational* comparisons similar to how `==` performs *coercive equality* comparisons.

### Mathematical Operators

As I asserted earlier, the main reason to have numbers in a programming language is to perform mathematical operations with them. So let's talk about how we do so.

The basic arithmetic operators are `+` (addition), `-` (subtraction), `*` (multiplication), and `/` (division). Also available are the operators `**` (exponentiation) and `%` (modulo, aka *division remainder*). There are also `+=`, `-=`, `*=`, `/=`, `**=`, and `%=` forms of the operators, which additionally assign the result back to the left operand -- must be a valid assignment target like a variable or property.

| NOTE: |
| :--- |
| As we've already seen, the `+` operator is overloaded to work with both numbers and strings. When one or both operands is a string, the result is a string concatenation (including coercing either operand to a string if necessary). But if neither operand is a string, the result is a numeric addition, as expected. |

All these mathematical operators are *binary*, meaning they expect two value operands, one on either side of the operator; they all expect the operands to be number values. If either or both operands are non-numbers, the non-number operand(s) is/are coerced to numbers to perform the operation. We'll cover coercion in detail in a later chapter.

Consider:

```js
40 + 2;                 // 42
44 - 2;                 // 42
21 * 2;                 // 42
84 / 2;                 // 42
7 ** 2;                 // 49
49 % 2;                 // 1

40 + "2";               // "402" (string concatenation)
44 - "2";               // 42 (because "2" is coerced to 2)
21 * "2";               // 42 (..ditto..)
84 / "2";               // 42 (..ditto..)
"7" ** "2";             // 49 (both operands are coerced to numbers)
"49" % "2";             // 1 (..ditto..)
```

The `+` and `-` operators also come in a *unary* form, meaning they only have one operand; again, the operand is expected to be a number, and coerced to a number if not:

```js
+42;                    // 42
-42;                    // -42

+"42";                  // 42
-"42";                  // -42
```

You might have noticed that `-42` looks like it's just a "negative forty-two" numeric literal. That's not quite right. A nuance of JS syntax is that it doesn't recognize negative numeric literals. Instead, JS treats this as a positive numeric literal `42` that's preceded, and negated, by the unary `-` operator in front of it.

Somewhat surprisingly, then:

```js
-42;                    // -42
- 42;                   // -42
-
    42;                 // -42
```

As you can see, whitespace (and even new lines) are allowed between the `-` unary operator and its operand; actually, this is true of all operators and operands.

#### Increment and Decrement

There are two other unary numeric operators: `++` (increment) and `--` decrement. They both perform their respective operation and then reassign the result to the operand -- must be a valid assignment target like a variable or property.

You may sort of think of `++` as equivalent to `+= 1`, and `--` as equivalent to `-= 1`:

```js
myAge = 42;

myAge++;
myAge;                  // 43

numberOfHeadHairs--;
```

However, these are special operators in that they can appear in a postfix (after the operand) position, as above, or in a prefix (before the operand) position:

```js
myAge = 42;

++myAge;
myAge;                  // 43

--numberofHeadHairs;
```

It may seem peculiar that prefix and postfix positions seem to give the same result (incrementing or decrementing) in such examples. The difference is subtle, and isn't related to the final reassigned result. We'll revisit these particular operators in a later chapter to dig into the positional differences.

### Bitwise Operators

JS provides several bitwise operators to perform bit-level operations on number values.

However, these bit operations are not performed against the packed bit-pattern of IEEE-754 numbers (see Chapter 1). Instead, the operand number is first converted to a 32-bit signed *integer*, the bit operation is performed, and then the result is converted back into an IEEE-754 number.

Keep in mind, just like any other primitive operators, these just compute new values, not actually modifying a value in place.

* `&` (bitwise AND): Performs an AND operation with each corresponding bit from the two operands; `42 & 36 === 32` (i.e., `0b00...101010 & 0b00...100100 === 0b00..100000`)

* `|` (bitwise OR): Performs an OR operation with each corresponding bit from the two operands; `42 | 36 === 46` (i.e., `0b00...101010 | 0b00...100100 === 0b00...101110`)

* `^` (bitwise XOR): Performs an XOR (eXclusive-OR) operation with each corresponding bit from the two operands; `42 ^ 36 === 14` (i.e., `0b00...101010 ^ 0b00...100100 === 0b00...001110`)

* `~` (bitwise NOT): Performs a NOT operation against the bits of a single operand; `~42 === -43` (i.e., `~0b00...101010 === 0b11...010101`); using 2's complement, the signed integer has the first bit set to `1` meaning negative, and the rest of the bits (when flipped back, according to 2's complement, which is 1's complement bit flipping and then adding `1`) would be `43` (`0b10...101011`); the equivalent of `~` in decimal number arithmetic is `~x === -(x + 1)`, so `~42 === -43`

* `<<` (left shift): Performs a left-shift of the bits of the left operand by the count of bits specified by the right operand; `42 << 3 == 336` (i.e., `0b00...101010 << 3 === 0b00...101010000`)

* `>>` (right shift): Performs a sign-propagating right-shift of the bits of the left operand by the count of bits specified by the right operand, discarding the bits that fall off the right side; whatever the leftmost bit is (`0`, or `1` is negative) is copied in as bits on the left (thereby preserving the sign of the original value in the result); `42 >> 3 === 5` (i.e., `0b00..101010 >> 3 === 0b00...000101`)

* `>>>` (zero-fill right shift, aka unsigned right shift): Performs the same right-shift as `>>`, but `0` fills on the bits shifted in from the left side instead of copying the leftmost bit (thereby ignoring the sign of the original value in the result); `42 >>> 3 === 5` but `-43 >>> 3 === 536870906` (i.e., `0b11...010101 >>> 3 === 0b0001...111010`)

* `&=`, `|=`, `<<=`, `>>=`, and `>>>=` (bitwise operators with assignment): Performs the corresponding bitwise operation, but then assigns the result to the left operand (which must be a valid assignment target, like a variable or property, not just a literal value); note that `~=` is missing from the list, because there is no such "binary negate with assignment" operator

In all honesty, bitwise operations are not very common in JS. But you may sometimes see a statement like:

```js
myGPA = 3.54;

myGPA | 0;              // 3
```

Since the bitwise operators act only on 32-bit integers, the `| 0` operation truncates (i.e., `Math.trunc(..)`) any decimal value, leaving only the integer.

| WARNING: |
| :--- |
| A common misconception is that `| 0` is like *floor* (i.e., `Math.floor(..)`). The result of `| 0` agrees with `Math.floor(..)` on positive numbers, but differs on negative numbers, because by standard definition, *floor* is an operation that rounds-down towards `-Infinity`. `| 0` merely discards the decimal bits, which is in fact truncation. |

### Number Value Methods

Number values provide the following methods (as properties) for number-specific operations:

* `toExponential(..)`: produces a string representation of the number using scientific notation (e.g., `"4.2e+1"`)

* `toFixed(..)`: produces a non-scientific-notation string representation of the number with the specified number of decimal places (rounding or zero-padding as necessary)

* `toPrecision(..)`: like `toFixed(..)`, except it applies the numeric argument as the number of significant digits (i.e., precision) including both the whole number and decimal places if any

* `toLocaleString(..)`: produces a string representation of the number according to the current locale

```js
myAge = 42;

myAge.toExponential(3);         // "4.200e+1"
```

One particular nuance of JS syntax is that `.` can be ambiguous when dealing with number literals and property/method access.

If a `.` comes immediately (no whitespace) after a numeric literal digit, and there's not already a `.` decimal in the number value, the `.` is assumed to be a starting the decimal portion of the number. But if the position of the `.` is unambiguously *not* part of the numeric literal, then it's always treated as a property access.

```js
42 .toExponential(3);           // "4.200e+1"
```

Here, the whitespace disambiguates the `.`, designating it as a property/method access. It's perhaps more common/preferred to use `(..)` instead of whitespace for such disambiguation:

```js
(42).toExponential(3);          // "4.200e+1"
```

An unusual-looking effect of this JS parsing grammar rule:

```js
42..toExponential(3);           // "4.200e+1"
```

So called the "double-dot" idiom, the first `.` in this expression is a decimal, and thus the second `.` is unambiguously *not* a decimal, but rather a property/method access.

Also, notice there's no digits after the first `.`; it's perfectly legal syntax to leave a trailing `.` on a numeric literal:

```js
myAge = 41. + 1.;

myAge;                          // 42
```

Values of `bigint` type cannot have decimals, so the parsing is unambiguous that a `.` after a literal (with the trailing `n`) is always a property access:

```js
42n.toString();                 // 42
```

### Static `Number` Properties

* `Number.EPSILON`: The smallest value possible between `1` and the next highest number

* `Number.NaN`: The same as the global `NaN` symbol, the special invalid number

* `Number.MIN_SAFE_INTEGER` / `Number.MAX_SAFE_INTEGER`: The positive and negative integers with the largest absolute value (furthest from `0`)

* `Number.MIN_VALUE` / `Number.MAX_VALUE`: The minimum (positive value closest to `0`) and the maximum (positive value furthest from `0`) representable by the `number` type

* `Number.NEGATIVE_INFINITY` / `Number.POSITIVE_INFINITY`: Same as global `-Infinity` and `Infinity`, the values that represent the largest (non-finite) values furthest from `0`

### Static `Number` Helpers

* `Number.isFinite(..)`: returns a boolean indicating if the value is finite -- a `number` that's not `NaN`, nor one of the two infinities

* `Number.isInteger(..)` / `Number.isSafeInteger(..)`: both return booleans indicating if the value is a whole `number` with no decimal places, and if it's within the *safe* range for integers (`-2^53 + 1` - `2^53 - 1`)

* `Number.isNaN(..)`: The bug-fixed version of the global `isNaN(..)` utility, which identifies if the argument provided is the special `NaN` value

* `Number.parseFloat(..)` / `Number.parseInt(..)`: utilities to parse string values for numeric digits, left-to-right, until the end of the string or the first non-float (or non-integer) character is encountered

### Static `Math` Namespace

Since the main usage of `number` values is for performing mathematical operations, JS includes many standard mathematical constants and operation utilities on the `Math` namespace.

There's a bunch of these, so I'll omit listing every single one. But here's a few for illustration purposes:

```js
Math.PI;                        // 3.141592653589793

// absolute value
Math.abs(-32.6);                // 32.6

// rounding
Math.round(-32.6);              // -33

// min/max selection
Math.min(100,Math.max(0,42));   // 42
```

Unlike `Number`, which is also the `Number(..)` function (for number coercion), `Math` is just an object that holds these properties and static function utilities; it cannot be called as a function.

| WARNING: |
| :--- |
| One peculiar member of the `Math` namespace is `Math.random()`, for producing a random floating point value between `0` and `1.0`. It's unusual to consider random number generation -- a task that's inherently stateful/side-effect'ing -- as a mathematical operation. It's also long been a footgun security-wise, as the pseudo-random number generator (PRNG) that JS uses is *not* secure (can be predicted) from a cryptography perspective. The web platform stepped in several years ago with the safer `crypto.getRandomValues(..)` API (based on a better PRNG), which fills a typed-array with random bits that can be interpreted as one or more integers (of type-specified maximum magnitude). Using `Math.random()` is universally discouraged now. |

### BigInts and Numbers Don't Mix

As we covered in Chapter 1, values of `number` type and `bigint` type cannot mix in the same operations. That can trip you up even if you're doing a simple increment of the value (like in a loop):

```js
myAge = 42n;

myAge + 1;                  // TypeError thrown!
myAge += 1;                 // TypeError thrown!

myAge + 1n;                 // 43n
myAge += 1n;                // 43n

myAge++;
myAge;                      // 44n
```

As such, if you're using both `number` and `bigint` values in your programs, you'll need to manually coerce one value-type to the other somewhat regularly. The `BigInt(..)` function (no `new` keyword) can coerce a `number` value to `bigint`. Vice versa, to go the other direction from `bigint` to `number`, use the `Number(..)` function (again, no `new` keyword):

```js
BigInt(42);                 // 42n

Number(42n);                // 42
```

Keep in mind though: coercing between these types has some risk:

```js
BigInt(4.2);                // RangeError thrown!
BigInt(NaN);                // RangeError thrown!
BigInt(Infinity);           // RangeError thrown!

Number(2n ** 1024n);        // Infinity
```
