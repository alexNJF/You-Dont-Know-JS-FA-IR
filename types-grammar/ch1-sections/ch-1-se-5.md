## Number Values

The `number` type contains any numeric value (whole number or decimal), such as `-42` or `3.1415926`. These values are represented by the JS engine as 64-bit, IEEE-754 double-precision binary floating-point values. [^IEEE754]

JS `number`s are always decimals; whole numbers (aka "integers") are not stored in a different/special way. An "integer" stored as a `number` value merely has nothing non-zero as its fraction portion; `42` is thus indistinguishable in JS from `42.0` and `42.000000`.

We can use `Number.isInteger(..)` to determine if a `number` value has any non-zero fraction or not:

```js
Number.isInteger(42);           // true
Number.isInteger(42.0);         // true
Number.isInteger(42.000000);    // true

Number.isInteger(42.0000001);   // false
```

### Parsing vs Coercion

If a string value holds numeric-looking contents, you may need to convert from that string value to a `number`, for mathematical operation purposes.

However, it's very important to distinguish between parsing-conversion and coercive-conversion.

We can parse-convert with JS's built-in `parseInt(..)` or `parseFloat(..)` utilities:

```js
someNumericText = "123.456";

parseInt(someNumericText,10);               // 123
parseFloat(someNumericText);                // 123.456

parseInt("42",10) === parseFloat("42");     // true

parseInt("512px");                          // 512
```

| NOTE: |
| :--- |
| Parsing is only relevant for string values, as it's a character-by-character (left-to-right) operation. It doesn't make sense to parse the contents of a `boolean`, nor to parse the contents of a `number` or a `null`; there's nothing to parse. If you pass anything other than a string value to `parseInt(..)` / `parseFloat(..)`, those utilities first convert that value to a string and then try to parse it. That's almost certainly problematic (leading to bugs) or wasteful -- `parseInt(42)` is silly, and `parseInt(42.3)` is an abuse of `parseInt(..)` to do the job of `Math.floor(..)`. |

Parsing pulls out numeric-looking characters from the string value, and puts them into a `number` value, stopping once it encounters a character that's non-numeric (e.g., not `-`, `.` or `0`-`9`). If parsing fails on the first character, both utilities return the special `NaN` value (see "Invalid Number" below), indicating the operation was invalid and failed.

When `parseInt(..)` encounters the `.` in `"123.456"`, it stops, using just the `123` in the resulting `number` value. `parseFloat(..)` by contrast accepts this `.` character, and keeps right on parsing a float with any decimal digits after the `.`.

The `parseInt(..)` utility specifically, takes as an optional -- but *actually*, rather necessary -- second argument, `radix`: the numeric base to assume for interpreting the string characters for the `number` (range `2` - `36`). `10` is for standard base-10 numbers, `2` is for binary, `8` is for octal, and `16` is for hexadecimal. Any other unusual `radix`, like `23`, assumes digits in order, `0` - `9` followed by the `a` - `z` (case insensitive) character ordination. If the specified radix is outside the `2` - `36` range, `parseInt(..)` fails as invalid and returns the `NaN` value.

If `radix` is omitted, the behavior of `parseInt(..)` is rather nuanced and confusing, in that it attempts to make a best-guess for a radix, based on what it sees in the first character. This historically has lead to lots of subtle bugs, so never rely on the default auto-guessing; always specify an explicit radix (like `10` in the calls above).

`parseFloat(..)` always parses with a radix of `10`, so no second argument is accepted.

| WARNING: |
| :--- |
| One surprising difference between `parseInt(..)` and `parseFloat(..)` is that `parseInt(..)` will not fully parse scientific notation (e.g., `"1.23e+5"`), instead stopping at the `.` as it's not valid for integers; in fact, even `"1e+5"` stops at the `"e"`. `parseFloat(..)` on the other hand fully parses scientific notation as expected. |

In contrast to parsing-conversion, coercive-conversion is an all-or-nothing sort of operation. Either the entire contents of the string are recognized as numeric (integer or floating-point), or the whole conversion fails (resulting in `NaN` -- again, see "Invalid Number" later in this chapter).

Coercive-conversion can be done explicitly with the `Number(..)` function (no `new` keyword) or with the unary `+` operator in front of the value:

```js
someNumericText = "123.456";

Number(someNumericText);        // 123.456
+someNumericText;               // 123.456

Number("512px");                // NaN
+"512px";                       // NaN
```

### Other Numeric Representations

In addition to defining numbers using traditional base-10 numerals (`0`-`9`), JS supports defining whole-number-only number literals in three other bases: binary (base-2), octal (base-8), and hexadecimal (base-16).

```js
// binary
myAge = 0b101010;
myAge;              // 42

// octal
myAge = 0o52;
myAge;              // 42

// hexadecimal
myAge = 0x2a;
myAge;              // 42
```

As you can see, the prefixes `0b` (binary), `0o` (octal), and `0x` (hexadecimal) signal defining numbers in the different bases, but decimals are not allowed on these numeric literals.

| NOTE: |
| :--- |
| JS syntax allows `0B`, `0O`, and `0X` prefixes as well. However, please don't ever use those uppercase prefix forms. I think any sensible person would agree: `0O` is much easier to confuse at a glance than `0o` (which is, itself, a bit visually ambiguous at a glance). Always stick to the lowercase prefix forms! |

It's important to realize that you're not defining a *different number*, just using a different form to produce the same underlying numeric value.

By default, JS represents the underlying numeric value in output/string fashion with standard base-10 form. However, `number` values have a built-in `toString(..)` method that produces a string representation in any specified base/radix (as with `parseInt(..)`, in the range `2` - `36`):

```js
myAge = 42;

myAge.toString(2);          // "101010"
myAge.toString(8);          // "52"
myAge.toString(16);         // "2a"
myAge.toString(23);         // "1j"
myAge.toString(36);         // "16"
```

You can round-trip any arbitrary-radix string representation back into a `number` using `parseInt(..)`, with the appropriate radix:

```js
myAge = 42;

parseInt(myAge.toString("23"),23);      // 42
```

Another allowed form for specifying number literals is using scientific notation:

```js
myAge = 4.2E1;      // or 4.2e1 or 4.2e+1

myAge;              // 42
```

`4.2E1` (or `4.2e1`) means, `4.2 * (10 ** 1)` (`10` to the `1` power). The exponent can optionally have a sign `+` or `-`. If the sign is omitted, it's assumed to be `+`. A negative exponent makes the number smaller (moves the decimal leftward) rather than larger (moving the decimal rightward):

```js
4.2E-3;             // 0.0042
```

This scientific notation form is especially useful for readability when specifying larger powers of `10`:

```js
someBigPowerOf10 = 1000000000;

// vs:

someBigPowerOf10 = 1e9;
```

By default, JS will represent (e.g., as string values, etc) either very large or very small numbers -- specifically, if the values require more than 21 digits of precision -- using this same scientific notation:

```js
ratherBigNumber = 123 ** 11;
ratherBigNumber.toString();     // "9.748913698143826e+22"

prettySmallNumber = 123 ** -11;
prettySmallNumber.toString();   // "1.0257553107587752e-23"
```

Numbers with smaller absolute values (closer to `0`) than these thresholds can still be forced into scientific notation form (as strings):

```js
plainBoringNumber = 42;

plainBoringNumber.toExponential();      // "4.2e+1"
plainBoringNumber.toExponential(0);     // "4e+1"
plainBoringNumber.toExponential(4);     // "4.2000e+1"
```

The optional argument to `toExponential(..)` specifies the number of decimal digits to include in the string representation.

Another readability affordance for specifying numeric literals in code is the ability to insert `_` as a digit separator wherever its convenient/meaningful to do so. For example:

```js
someBigPowerOf10 = 1_000_000_000;

totalCostInPennies = 123_45;  // vs 12_345
```

The decision to use `12345` (no separator), `12_345` (like "12,345"), or `123_45` (like "123.45") is entirely up to the author of the code; JS ignores the separators. But depending on the context, `123_45` could be more semantically meaningful (readability wise) than the more traditional three-digit-grouping-from-the-right-separated-with-commas style mimicked with `12_345`.

### IEEE-754 Bitwise Binary Representations

IEEE-754[^IEEE754] is a technical standard for binary representation of decimal numbers. It's widely used by most computer programming languages, including JS, Python, Ruby, etc.

I'm not going to cover it exhaustively, but I think a brief primer on how numbers work in languages like JS is more than warranted, given how few programmers have *any* familiarity with it.

In 64-bit IEEE-754 -- so called "double-precision", because originally IEEE-754 used to be 32-bit, and now it's double that! -- the 64 bits are divided into three sections: 52 bits for the number's base value (aka, "fraction", "mantissa", or "significand"), 11 bits for the exponent to raise `2` to before multiplying, and 1 bit for the sign of the ultimate value.

| NOTE: |
| :--- |
| Since only 52 of the 64 bits are actually used to represent the base value, `number` doesn't actually have `2^64` values in it. According to the specification for the `number` type[^NumberType], the number of values is precisely `2^64 - 2^53 + 3`, or about 18 quintillion, split about evenly between positive and negative numbers. |

These bits are arranged left-to-right, as so (S = Sign Bit, E = Exponent Bit, M = Mantissa Bit):

```js
SEEEEEEEEEEEMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
```

So, the number `42` (or `42.000000`) would be represented by these bits:

```
// 42:
01000000010001010000000000000000
00000000000000000000000000000000
```

The sign bit is `0`, meaning the number is positive (`1` means negative).

The 11-bit exponent is binary `10000000100`, which in base-10 is `1028`. But in IEEE-754, this value is interpreted as being stored unsigned with an "exponent bias" of `1023`, meaning that we're shifting up the exponent range from `-1022:1023` to `1:2046` (where `0` and `2047` are reserved for special representations). So, take `1028` and subtract the bias `1023`, which gives an effective exponent of `5`. We raise `2` to that value (`2^5`), giving `32`.

| NOTE: |
| :--- |
| If the subtracting `1023` from the exponent value gives a negative (e.g., `-3`), that's still interpreted as `2`'s exponent; raising `2` to negative numbers just produces smaller and smaller values. |

The remaining 52 bits give us the base value `01010000...`, interpreted as binary decimal `1.0101000...` (with all trailing zeros). Converting *that* to base-10, we get `1.3125000...`. Finally, then multiply that by `32` already computed from the exponent. The result: `42`.

As you might be able to tell now, this IEEE-754 number representation standard is called "floating point" because the decimal point "floats" back-and-forth along the bits, depending on the specified exponent value.

The number `42.0000001`, which is only different from `42.000000` by just `0.0000001`, would be represented by these bits:

```
// 42.0000001:
01000000010001010000000000000000
00000000110101101011111110010101
```

Notice how the previous bit pattern and this one differ by quite a few bits in the trailing positions! The binary decimal fraction containing all those extra `1` bits (`1.010100000000...01011111110010101`) converts to base-10 as `1.31250000312500003652`, which multiplied by `32` gives us exactly `42.0000001`.

We'll revisit more details about floating-point (im)precision in Chapter 2. But now you understand a *bit more* about how IEEE-754 works!

### Number Limits

As might be evident now that you've seen how IEEE-754 works, the 52 bits of the number's base must be shared, representing both the whole number portion (if any) as well as the decimal portion (if any), of the intended `number` value. Essentially, the larger the whole number portion to be represented, the less bits are available for the decimal portion, and vice versa.

The largest value that can accurately be stored in the `number` type is exposed as `Number.MAX_VALUE`:

```js
Number.MAX_VALUE;           // 1.7976931348623157e+308
```

You might expect that value to be a decimal value, given the representation. But on closer inspection, `1.79E308` is (approximately) `2^1024 - 1`. That seems much more like it should be an integer, right? We can verify:

```js
Number.isInteger(Number.MAX_VALUE);         // true
```

But what happens if you go above the max value?

```js
Number.MAX_VALUE === (Number.MAX_VALUE + 1);
// true -- oops!

Number.MAX_VALUE === (Number.MAX_VALUE + 10000000);
// true
```

So, is `Number.MAX_VALUE` actually the largest value representable in JS? It's certainly the largest *finite* `number` value.

IEEE-754 defines a special infinite value, which JS exposes as `Infinity`; there's also a `-Infinity` at the far other end of the number line. Values can be tested to see if they are finite or infinite:

```js
Number.isFinite(Number.MAX_VALUE);  // true

Number.isFinite(Infinity);          // false
Number.isFinite(-Infinity);         // false
```

You can't ever count upwards (with `+ 1`) from `Number.MAX_VALUE` to `Infinity`, no matter how long you let the program run, because the `+ 1` operation isn't actually incrementing beyond the top `Number.MAX_VALUE` value.

However, JS arithmetic operations (`+`, `*`, and even `/`) can definitely overflow the `number` type on the top-end, in which case `Infinity` is the result:

```js
Number.MAX_VALUE + 1E291;           // 1.7976931348623157e+308
Number.MAX_VALUE + 1E292;           // Infinity

Number.MAX_VALUE * 1.0000000001;    // Infinity

1 / 1E-308;                         // 1e+308
1 / 1E-309;                         // Infinity
```

| TIP: |
| :--- |
| The reverse is not true: an arithmetic operation on an infinite value *will never* produce a finite value. |

Going from the very large to the very, very small -- actually, closest to zero, which is not the same thing as going very, very negative! -- the smallest absolute decimal value you could theoretically store in the `number` type would be `2^-1022` (remember the IEEE-754 exponent range?), or around `2E-308`. However, JS engines are allowed by the specification to vary in their internal representations for this lower limit. Whatever the engine's effective lower limit is, it'll be exposed as `Number.MIN_VALUE`:

```js
Number.MIN_VALUE;               // 5e-324 <-- usually!
```

Most JS engines seem to have a minimum representable value around `5E-324` (about `2^-1074`). Depending on the engine and/or platform, a different value may be exposed. Be careful about any program logic that relies on such implementation-dependent values.

### Safe Integer Limits

Since `Number.MAX_VALUE` is an integer, you might assume that it's the largest integer in the language. But that's not really accurate.

The largest integer you can accurately store in the `number` type is `2^53 - 1`, or `9007199254740991`, which is *way smaller* than `Number.MAX_VALUE` (about `2^1024 - 1`). This special safer value is exposed as `Number.MAX_SAFE_INTEGER`:

```js
maxInt = Number.MAX_SAFE_INTEGER;

maxInt;             // 9007199254740991

maxInt + 1;         // 9007199254740992

maxInt + 2;         // 9007199254740992
```

We've seen that integers larger than `9007199254740991` can show up. However, those larger integers are not "safe", in that the precision/accuracy start to break down when you do operations with them. As shown above, the `maxInt + 1` and `maxInt + 2` expressions both errantly give the same result, illustrating the hazard when exceeding the `Number.MAX_SAFE_INTEGER` limit.

But what's the smallest safe integer?

Depending on how you interpret "smallest", you could either answer `0` or... `Number.MIN_SAFE_INTEGER`:

```js
Number.MIN_SAFE_INTEGER;    // -9007199254740991
```

And JS provides a utility to determine if a value is an integer in this safe range (`-2^53 + 1` - `2^53 - 1`):

```js
Number.isSafeInteger(2 ** 53);      // false
Number.isSafeInteger(2 ** 53 - 1);  // true
```

### Double Zeros

It may surprise you to learn that JS has two zeros: `0`, and `-0` (negative zero). But what on earth is a "negative zero"? [^SignedZero] A mathematician would surely balk at such a notion.

This isn't just a funny JS quirk; it's mandated by the IEEE-754[^IEEE754] specification. All floating point numbers are signed, including zero. And though JS does kind of hide the existence of `-0`, it's entirely possible to produce it and to detect it:

```js
function isNegZero(v) {
    return v == 0 && (1 / v) == -Infinity;
}

regZero = 0 / 1;
negZero = 0 / -1;

regZero === negZero;        // true -- oops!
Object.is(-0,regZero);      // false -- phew!
Object.is(-0,negZero);      // true

isNegZero(regZero);         // false
isNegZero(negZero);         // true
```

You may wonder why we'd ever need such a thing as `-0`. It can be useful when using numbers to represent both the magnitude of movement (speed) of some item (like a game character or an animation) and also its direction (e.g., negative = left, positive = right).

Without having a signed zero value, you couldn't tell which direction such an item was pointing at the moment it came to rest.

| NOTE: |
| :--- |
| While JS defines a signed zero in the `number` type, there is no corresponding signed zero in the `bigint` number type. As such, `-0n` is just interpreted as `0n`, and the two are indistinguishable. |

### Invalid Number

Mathematical operations can sometimes produce an invalid result. For example:

```js
42 / "Kyle";            // NaN
```

It's probably obvious, but if you try to divide a number by a string, that's an invalid mathematical operation.

Another type of invalid numeric operation is trying to coercively-convert a non-numeric resembling value to a `number`. As discussed earlier, we can do so with either the `Number(..)` function or the unary `+` operator:

```js
myAge = Number("just a number");

myAge;                  // NaN

+undefined;             // NaN
```

All such invalid operations (mathematical or coercive/numeric) produce the special `number` value called `NaN`.

The historical root of "NaN" (from the IEEE-754[^IEEE754] specification) is as an acronym for "Not a Number". Technically, there are about 9 quadrillion values in the 64-bit IEEE-754 number space designated as "NaN", but JS treats all of them indistinguishably as the single `NaN` value.

Unfortunately, that *not a number* meaning produces confusion, since `NaN` is *absolutely* a `number`.

| TIP: |
| :--- |
| Why is `NaN` a `number`?!? Think of the opposite: what if a mathematical/numeric operation, like `+` or `/`, produced a non-`number` value (like `null`, `undefined`, etc)? Wouldn't that be really strange and unexpected? What if they threw exceptions, so that you had to `try..catch` all your math? The only sensible behavior is, numeric/mathematical operations should *always* produce a `number`, even if that value is invalid because it came from an invalid operation. |

To avoid such confusion, I strongly prefer to define "NaN" as any of the following instead:

* "iNvalid Number"
* "Not actual Number"
* "Not available Number"
* "Not applicable Number"

`NaN` is a special value in JS, in that it's the only value in the language that lacks the *identity property* -- it's never equal to itself.

```js
NaN === NaN;            // false
```

So unfortunately, the `===` operator cannot check a value to see if it's `NaN`. But there are some ways to do so:

```js
politicianIQ = "nothing" / Infinity;

Number.isNaN(politicianIQ);         // true

Object.is(NaN,politicianIQ);        // true
[ NaN ].includes(politicianIQ);     // true
```

Here's a fact of virtually all JS programs, whether you realize it or not: `NaN` happens. Seriously, almost all programs that do any math or numeric conversions are subject to `NaN` showing up.

If you're not properly checking for `NaN` in your programs where you do math or numeric conversions, I can say with some degree of certainty: you probably have a number bug in your program somewhere, and it just hasn't bitten you yet (that you know of!).

| WARNING: |
| :--- |
| JS originally provided a global function called `isNaN(..)` for `NaN` checking, but it unfortunately has a long-standing coercion bug. `isNaN("Kyle")` returns `true`, even though the string value `"Kyle"` is most definitely *not* the `NaN` value. This is because the global `isNaN(..)` function forces any non-`number` argument to coerce to a `number` first, before checking for `NaN`. Coercing `"Kyle"` to a `number` produces `NaN`, so now the function sees a `NaN` and returns `true`! This buggy global `isNaN(..)` still exists in JS, but should never be used. When `NaN` checking, always use `Number.isNaN(..)`, `Object.is(..)`, etc. |
