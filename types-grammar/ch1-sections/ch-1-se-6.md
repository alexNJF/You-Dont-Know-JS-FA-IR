## BigInteger Values

As the maximum safe integer in JS `number`s is `9007199254740991` (see above), such a relatively low limit can present a problem if a JS program needs to perform larger integer math, or even just hold values like 64-bit integer IDs (e.g., Twitter Tweet IDs).

For that reason, JS provides the alternate `bigint` type (BigInteger), which can store arbitrarily large (theoretically not limited, except by finite machine memory and/or JS implementation) integers.

To distinguish a `bigint` from a whole (integer) `number` value, which would otherwise both look the same (`42`), JS requires an `n` suffix on `bigint` values:

```js
myAge = 42n;        // this is a bigint, not a number

myKidsAge = 11;     // this is a number, not a bigint
```

Let's illustrate the upper un-boundedness of `bigint`:

```js
Number.MAX_SAFE_INTEGER;        // 9007199254740991

Number.MAX_SAFE_INTEGER + 2;    // 9007199254740992 -- oops!

myBigInt = 9007199254740991n;

myBigInt + 2n;                  // 9007199254740993n -- phew!

myBigInt ** 2n;                 // 81129638414606663681390495662081n
```

As you can see, the `bigint` value-type is able to do precise arithmetic above the integer limit of the `number` value-type.

| WARNING: |
| :--- |
| Notice that the `+` operator required `.. + 2n` instead of just `.. + 2`? You cannot mix `number` and `bigint` value-types in the same expression. This restriction is annoying, but it protects your program from invalid mathematical operations that would give non-obvious unexpected results. |

A `bigint` value can also be created with the `BigInt(..)` function; for example, to convert a whole (integer) `number` value to a `bigint`:

```js
myAge = 42n;

inc = 1;

myAge += BigInt(inc);

myAge;              // 43n
```

| WARNING: |
| :--- |
| Though it may seem counter-intuitive to some readers, `BigInt(..)` is *always* called without the `new` keyword. If `new` is used, an exception will be thrown. |

That's definitely one of the most common usages of the `BigInt(..)` function: to convert `number`s to `bigint`s, for mathematical operation purposes.

But it's not that uncommon to represent large integer values as strings, especially if those values are coming to the JS environment from other language environments, or via certain exchange formats, which themselves do not support `bigint`-style values.

As such, `BigInt(..)` is useful to coerce those string values to `bigint`s:

```js
myBigInt = BigInt("12345678901234567890");

myBigInt;                       // 12345678901234567890n
```

Unlike `parseInt(..)`, if any character in the string is non-numeric (`0-9` digits or `-`), including `.` or even a trailing `n` suffix character, an exception will be thrown. In other words, `BigInt(..)` is an all-or-nothing coercion-conversion, not a parsing-conversion.

| NOTE: |
| :--- |
| I think it's absurd that `BigInt(..)` won't accept the trailing `n` character while string coercing (and thus effectively ignore it). I lobbied vehemently for that behavior, in the TC39 process, but was ultimately denied. In my opinion, it's now a tiny little gotcha wart on JS, but a wart nonetheless. |
