# Abstract Relational Comparison

While this part of *implicit* coercion often gets a lot less attention, it's important nonetheless to think about what happens with `a < b` comparisons (similar to how we just examined `a == b` in depth).

The "Abstract Relational Comparison" algorithm in ES5 section 11.8.5 essentially divides itself into two parts: what to do if the comparison involves both `string` values (second half), or anything else (first half).

**Note:** The algorithm is only defined for `a < b`. So, `a > b` is handled as `b < a`.

The algorithm first calls `ToPrimitive` coercion on both values, and if the return result of either call is not a `string`, then both values are coerced to `number` values using the `ToNumber` operation rules, and compared numerically.

For example:

```js
var a = [ 42 ];
var b = [ "43" ];

a < b;	// true
b < a;	// false
```

**Note:** Similar caveats for `-0` and `NaN` apply here as they did in the `==` algorithm discussed earlier.

However, if both values are `string`s for the `<` comparison, simple lexicographic (natural alphabetic) comparison on the characters is performed:

```js
var a = [ "42" ];
var b = [ "043" ];

a < b;	// false
```

`a` and `b` are *not* coerced to `number`s, because both of them end up as `string`s after the `ToPrimitive` coercion on the two `array`s. So, `"42"` is compared character by character to `"043"`, starting with the first characters `"4"` and `"0"`, respectively. Since `"0"` is lexicographically *less than* than `"4"`, the comparison returns `false`.

The exact same behavior and reasoning goes for:

```js
var a = [ 4, 2 ];
var b = [ 0, 4, 3 ];

a < b;	// false
```

Here, `a` becomes `"4,2"` and `b` becomes `"0,4,3"`, and those lexicographically compare identically to the previous snippet.

What about:

```js
var a = { b: 42 };
var b = { b: 43 };

a < b;	// ??
```

`a < b` is also `false`, because `a` becomes `[object Object]` and `b` becomes `[object Object]`, and so clearly `a` is not lexicographically less than `b`.

But strangely:

```js
var a = { b: 42 };
var b = { b: 43 };

a < b;	// false
a == b;	// false
a > b;	// false

a <= b;	// true
a >= b;	// true
```

Why is `a == b` not `true`? They're the same `string` value (`"[object Object]"`), so it seems they should be equal, right? Nope. Recall the previous discussion about how `==` works with `object` references.

But then how are `a <= b` and `a >= b` resulting in `true`, if `a < b` **and** `a == b` **and** `a > b` are all `false`?

Because the spec says for `a <= b`, it will actually evaluate `b < a` first, and then negate that result. Since `b < a` is *also* `false`, the result of `a <= b` is `true`.

That's probably awfully contrary to how you might have explained what `<=` does up to now, which would likely have been the literal: "less than *or* equal to." JS more accurately considers `<=` as "not greater than" (`!(a > b)`, which JS treats as `!(b < a)`). Moreover, `a >= b` is explained by first considering it as `b <= a`, and then applying the same reasoning.

Unfortunately, there is no "strict relational comparison" as there is for equality. In other words, there's no way to prevent *implicit* coercion from occurring with relational comparisons like `a < b`, other than to ensure that `a` and `b` are of the same type explicitly before making the comparison.

Use the same reasoning from our earlier `==` vs. `===` sanity check discussion. If coercion is helpful and reasonably safe, like in a `42 < "43"` comparison, **use it**. On the other hand, if you need to be safe about a relational comparison, *explicitly coerce* the values first, before using `<` (or its counterparts).

```js
var a = [ 42 ];
var b = "043";

a < b;						// false -- string comparison!
Number( a ) < Number( b );	// true -- number comparison!
```
