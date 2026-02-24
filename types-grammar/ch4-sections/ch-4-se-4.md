## Coercion Corner Cases

I've been clear in expressing my pro-coercion opinion thus far. And it *is* just an opinion, though it's based on interpreting facts gleaned from studying the language specification and observable JS behaviors.

That's not to say that coercion is perfect. There's several frustrating corner cases we need to be aware of, so we avoid tripping into those potholes. In case it's not clear, my following characterizations of these corner cases are just more of my opinions. Your mileage may vary.

### Strings

We already saw that the string coercion of an array looks like this:

```js
String([ 1, 2, 3 ]);                // "1,2,3"
```

I personally find that super annoying, that it doesn't include the surrounding `[ ]`. In particular, that leads to this absurdity:

```js
String([]);                         // ""
```

So we can't tell that it's even an array, because all we get is an empty string? Great, JS. That's just stupid. Sorry, but it is. And it gets worse:

```js
String([ null, undefined ]);        // ","
```

WAT!? We know that `null` coerces to the string `"null"`, and `undefined` coerces to the string `"undefined"`. But if those values are in an array, they magically just *disappear* as empty strings in the array-to-string coercion. Only the `","` remains to even hint to us there was anything at all in the array! That's just silly town, right there.

What about objects? Almost as aggravating, though in the opposite direction:

```js
String({});                         // "[object Object]"

String({ a: 1 });                   // "[object Object]"
```

Umm... OK. Sure, thanks JS for no help at all in understanding what the object value is.

### Numbers

I'm about to reveal what I think is *the* worst root of all coercion corner case evil. Are you ready for it?!?

```js
Number("");                         // 0
Number("       ");                  // 0
```

I'm still shaking my head at this one, and I've known about it for nearly 20 years. I still don't get what Brendan was thinking with this one.

The empty string is devoid of any contents; it has nothing in it with which to determine a numeric representation. `0` is absolutely ***NOT*** the numeric equivalent of missing/invalid numeric value. You know what number value we have that is well-suited to communicate that? `NaN`. Don't even get me started on how whitespace is stripped from strings when coercing to a number, so the very-much-not-empty `"       "` string is still treated the same as `""` for numeric coercion purposes.

Even worse, recall how `[]` coerces to the string `""`? By extension:

```js
Number([]);                         // 0
```

Doh! If `""` didn't coerce to `0` -- remember, this is the root of all coercion evil! --, then `[]` wouldn't coerce to `0` either.

This is just absurd, upside-down universe territory.

Much more tame, but still mildly annoying:

```js
Number("NaN");                      // NaN  <--- accidental!

Number("Infinity");                 // Infinity
Number("infinity");                 // NaN  <--- oops, watch case!
```

The string `"NaN"` is not parsed as a recognizable numeric value, so the coercion fails, producing (accidentally!) the `NaN` value. `"Infinity"` is explicitly parseable for the coercion, but any other casing, including `"infinity"`, will fail, again producing `NaN`.

This next example, you may not think is a corner case at all:

```js
Number(false);                      // 0
Number(true);                       // 1
```

It's merely programmer convention, legacy from languages that didn't originally have boolean `true` and `false` values, that we treat `0` as `false`, and `1` as `true`. But does it *really* make sense to go the other direction?

Think about it this way:

```js
false + true + false + false + true;        // 2
```

Really? I don't think there's any case where treating a `boolean` as its `number` equivalent makes any rational sense in a program. I can understand the reverse, for historical reasons: `Boolean(0)` and `Boolean(1)`.

But I genuniely feel that `Number(false)` and `Number(true)` (as well as any implicit coercion forms) should produce `NaN`, not `0` / `1`.

### Coercion Absurdity

To prove my point, let's take the absurdity up to level 11:

```js
[] == ![];                          // true
```

How!? That seems beyond credibility that a value could be coercively equal to its negation, right!?

But follow down the coercion rabbit hole:

1. `[] == ![]`
2. `[] == false`
3. `"" == false`
4. `0 == false`
5. `0 == 0`
6. `0 === 0`  ->  `true`

We've got three different absurdities conspiring against us: `String([])`, `Number("")`, and `Number(false)`; if any of these weren't true, this nonsense corner case outcome wouldn't occur.

Let me make something absolutely clear, though: none of this is `==`'s fault. It gets the blame here, of course. But the real culprits are the underlying `string` and `number` corner cases.
