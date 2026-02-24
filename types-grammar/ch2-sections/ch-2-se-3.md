## String Behaviors

String values have a number of specific behaviors that every JS developer should be aware of.

### String Character Access

Though strings are not actually arrays, JS allows `[ .. ]` array-style access of a character at a numeric (`0`-based) index:

```js
greeting = "Hello!";

greeting[4];            // "o"
```

If the value/expression between the `[ .. ]` doesn't resolve to a number, the value will be implicitly coerced to its whole/integer numeric representation (if possible).

```js
greeting["4"];          // "o"
```

If the value/expression resolves to a number outside the integer range of `0` - `length - 1` (or `NaN`), or if it's not a `number` value-type, the access will instead be treated as a property access with the string equivalent property name. If the property access thus fails, the result is `undefined`.

| NOTE: |
| :--- |
|  We'll cover coercion in-depth later in the book. |

### Character Iteration

Strings are not arrays, but they certainly mimic arrays closely in many ways. One such behavior is that, like arrays, strings are iterables. This means that the characters (code-units) of a string can be iterated individually:

```js
myName = "Kyle";

for (let char of myName) {
    console.log(char);
}
// K
// y
// l
// e

chars = [ ...myName ];
chars;
// [ "K", "y", "l", "e" ]
```

Values, such as strings and arrays, are iterables (via `...`, `for..of`, and `Array.from(..)`), if they expose an iterator-producing method at the special symbol property location `Symbol.iterator` (see "Well-Known Symbols" in Chapter 1):

```js
myName = "Kyle";
it = myName[Symbol.iterator]();

it.next();      // { value: "K", done: false }
it.next();      // { value: "y", done: false }
it.next();      // { value: "l", done: false }
it.next();      // { value: "e", done: false }
it.next();      // { value: undefined, done: true }
```

| NOTE: |
| :--- |
| The specifics of the iterator protocol, including the fact that the `{ value: "e" .. }` result still shows `done: false`, are covered in detail in the "Sync & Async" title of this series. |

### Length Computation

As mentioned in Chapter 1, string values have a `length` property that automatically exposes the length of the string; this property can only be accessed; attempts to set it are silently ignored.

The reported `length` value somewhat corresponds to the number of characters in the string (actually, code-units), but as we saw in Chapter 1, it's more complex when Unicode characters are involved.

Most people visually distinguish symbols as separate characters; this notion of an independent visual symbol is referred to as a *grapheme*, or a *grapheme cluster*. So when counting the "length" of a string, we typically mean that we're counting the number of graphemes.

But that's not how the computer deals with characters.

In JS, each *character* is a code-unit (16 bits), with a code-point value at or below `65535`. The `length` property of a string always counts the number of code-units in the string value, not code-points. A code-unit might represent a single character by itself, or it may be part of a surrogate pair, or it may be combined with an adjacent *combining* symbol, or part of a grapheme cluster. As such, `length` doesn't match the typical notion of counting visual characters/graphemes.

To get closer to an expected/intuitive *grapheme length* for a string, the string value first needs to be normalized with `normalize("NFC")` (see "Normalizing Unicode" in Chapter 1) to produce any *composed* code-units (where possible), in case any characters were originally stored *decomposed* as separate code-units.

For example:

```js
favoriteItem = "teléfono";
favoriteItem.length;            // 9 -- uh oh!

favoriteItem = favoriteItem.normalize("NFC");
favoriteItem.length;            // 8 -- phew!
```

Unfortunately, as we saw in Chapter 1, we'll still have the possibility of characters of code-point greater the `65535`, and thus needing a surrogate pair to be represented. Such characters will count double in the `length`:

```js
// "☎" === "\u260E"
oldTelephone = "☎";
oldTelephone.length;            // 1

// "📱" === "\u{1F4F1}" === "\uD83D\uDCF1"
cellphone = "📱";
cellphone.length;               // 2 -- oops!
```

So what do we do?

One fix is to use character iteration (via `...` operator) as we saw in the previous section, since it automatically returns each combined character from a surrogate pair:

```js
cellphone = "📱";
cellphone.length;               // 2 -- oops!
[ ...cellphone ].length;        // 1 -- phew!
```

But, unfortunately, grapheme clusters (as explained in Chapter 1) throw yet another wrench into a string's length computation. For example, if we take the thumbs down emoji (`"\u{1F44E}"` and add to it the skin-tone modifier for medium-dark skin (`"\u{1F3FE}"`), we get:

```js
// "👎🏾" = "\u{1F44E}\u{1F3FE}"
thumbsDown = "👎🏾";

thumbsDown.length;              // 4 -- oops!
[ ...thumbsDown ].length;       // 2 -- oops!
```

As you can see, these are two distinct code-points (not a surrogate pair) that, by virtue of their ordering and adjacency, cause the computer's Unicode rendering to draw the thumbs-down symbol but with a darker skin tone than its default. The computed string length is thus `2`.

It would take replicating most of a platform's complex Unicode rendering logic to be able to recognize such clusters of code-points as a single "character" for length-counting sake. There are libraries that purport to do so, but they're not necessarily perfect, and they come at a hefty cost in terms of extra code.

| NOTE: |
| :--- |
| As a Twitter user, you might expect to be able to put 280 thumbs-down emojis into a single tweet, since it looks like a single character. Twitter counts the `"👎"` (default thumbs-down), the `"👎🏾"` (medium-dark-skintone thumbs-down), and even the `"👩‍👩‍👦‍👦"` (family emoji grapheme cluster) all as 2 characters each, even though their respective string lengths (from JS's perspective) are `2`, `4`, and `7`; thus, you can only fit half the number of emojis (140 instead of 280) in a tweet. In fact, Twitter implemented this change in 2018 to specifically level the counting of all Unicode characters, at 2 characters per symbol. [^TwitterUnicode] That was a welcomed change for Twitter users, especially those who want to use emoji characters that are most representative of intended gender, skintone, etc. Still, it *is* curious that Twitter chose to count all Unicode/emoji symbols as 2 characters each, instead of the more intuitive 1 character (grapheme) each. |

Counting the *length* of a string to match our human intuitions is a remarkably challenging task, perhaps more of an art than a science. We can get acceptable approximations in many cases, but there's plenty of other cases that may confound our programs.

### Internationalization (i18n) and Localization (l10n)

To serve the growing need for JS programs to operate as expected in any international language/culture context, the ECMAScript committee also publishes the ECMAScript Internationalization API. [^INTLAPI]

A JS program defaults to a locale/language according to the environment running the program (web browser page, Node instance, etc). The in-effect locale affects sorting (and value comparisons), formatting, and several other assumed behaviors. Such altered behaviors are perhaps a bit more obvious with strings, but they can also be seen with numbers (and dates!).

But string characters also can have language/locale information embedded in them, which takes precedence over the environment default. If the string character is ambiguous/shared in terms of its language/locale (such as `"a"`), the default environment setting is used.

Depending on the contents of the string, it may be interpreted as being ordered from left-to-right (LTR) or right-to-left (RTL). As such, many of the string methods we'll cover later use logical descriptors in their names, like "start", "end", "begin", "end", and "last", rather than directional terms like "left" and "right".

For example, Hebrew and Arabic are both common RTL languages:

```js
hebrewHello = "\u{5e9}\u{5dc}\u{5d5}\u{5dd}";

console.log(hebrewHello);                       // שלום
```

Notice that the first listed character in the string literal (`"\u{5e9}"`) is actually the right-most character when the string is rendered?

Even though Hebrew is an RTL language, you don't actually type the characters in the string literal in reversed (RTL) order the way they should be rendered. You enter the characters in logical order, where position `0` is the first character, position `1` is the second character, etc. The rendering layer is where RTL characters are reversed to be shown in their correct order.

That also means that if you access `hebrewHello[0]` (or `hebrewHello.charAt(0)`) -- to get the character as position `0` -- you get `"ש"` because that's logically the first character of the string, not `"ם"` (logically the last character of the string). Index-positional access follows the logical position, not the rendered position.

Here's the same example in another RTL language, Arabic:

```js
arabicHello = "\u{631}\u{62d}\u{628}\u{627}";

console.log(arabicHello);                       // رحبا

console.log(arabicHello[0]);                    // ر
```

JS programs can force a specific language/locale, using various `Intl` APIs such as `Intl.Collator`: [^INTLCollator]

```js
germanStringSorter = new Intl.Collator("de");

listOfGermanWords = [ /* .. */ ];

germanStringSorter.compare("Hallo","Welt");
// -1 (or negative number)

// examples adapted from MDN:
//
germanStringSorter.compare("Z","z");
// 1 (or positive number)

caseFirstSorter = new Intl.Collator("de",{ caseFirst: "upper", });
caseFirstSorter.compare("Z","z");
// -1 (or negative number)
```

Multiple-word strings can be segmented using `Intl.Segmenter`: [^INTLSegmenter]

```js
arabicHelloWorld = "\u{645}\u{631}\u{62d}\u{628}\u{627} \
\u{628}\u{627}\u{644}\u{639}\u{627}\u{644}\u{645}";

console.log(arabicHelloWorld);      // مرحبا بالعالم

arabicSegmenter = new Intl.Segmenter("ar",{ granularity: "word" });

for (
    let { segment: word, isWordLike } of
    arabicSegmenter.segment(arabicHelloWorld)
) {
    if (isWordLike) {
        console.log(word);
    }
}
// مرحبا
//لعالم
```

| NOTE: |
| :--- |
| The `segment(..)` method (from instances of`Intl.Segmenter`) returns a standard JS iterator, which the `for..of` loop here consumes. More on iteration protocols in the "Sync & Async" title of this series. |

### String Comparison

String values can be compared (for both equality and relational ordering) to other string values, using various built-in operators. It's important to keep in mind that such comparisons are sensitive to the actual string contents, including especially the underlying code-points from non-BPM Unicode characters.

Both equality and relational comparison are case-sensitive, for any characters where uppercase and lowercase are well-defined. To make case-insensitive comparisons, normalize the casing of both values first (with `toUpperCase()` or `toLowerCase()`).

#### String Equality

The `===` and `==` operators (along with their negated counterparts `!==` and `!=`, respectively) are the most common way equality comparisons are made for primitive values, including string values:

```js
"my name" === "my n\x61me";               // true

"my name" !== String.raw`my n\x61me`;     // true
```

The `===` operator[^StrictEquality] -- often referred to as "strict equality" -- first checks to see if the types match, and if not, returns `false` right away. If the types match, then it checks to see if the values are the same; for strings, this is a per-code-unit comparison, from start to end.

Despite the "strict" naming, there are nuances to `===` (such as `-0` and `NaN` handling), but we'll cover those later.

##### Coercive Equality

By contrast, the `==` operator[^LooseEquality] -- often referred to as "loose equality" -- performs *coercive equality*: if the value-types of the two operands do not match, `==` first coerces one or both operands until the value-types *do* match, and then it hands off the comparison internally to `===`.

Coercion is an extremely important topic -- it's an inherent part of the JS types system, one of the language's 3 pillars -- but we're only going to briefly introduce it here in this chapter, and revisit it in detail later.

| NOTE: |
| :--- |
| You may have heard the oft-quoted, but nevertheless inaccurate, explanation that the difference between `==` and `===` is that `==` compares the values while `==` compares both the values and the types. Not true, and you can read the spec yourself to verify -- both `isStrictlyEqual(..)` and `isLooselyEqual(..)` specification algorithms are linked as footnotes in the preceding paragraphs. To summarize, though: both `==` and `===` are aware of and sensitive to the types of the operands. If the operand types are the same, both operators do literally the exact same thing; if the types differ, `==` forces coercion until the types match, whereas `===` returns `false` immediately. |

It's extremely common for developers to assert that the `==` operator is confusing and too hard to use without surprises (thus the near universal preference for `===`). I think that's totally bogus, and in fact, JS developers should be defaulting to `==` (and avoiding `===` if possible). But we need a lot more discussion to back such a controversial statement; hold onto your objections until we revisit it later.

For now, to gain some intuition about the coercive nature of `==`, the most illuminating observation is that if the types don't match, `==` *prefers* numeric comparison. That means it will attempt to convert both operands to numbers, and then perform the equality check (the same as `===`).

So, as it relates to our present discussion, actual string equality can *only be* checked if both operands are already strings:

```js
// actual string equality check (via === internally):
"42" == "42";           // true
```

`==` does not really perform string equality checks itself. If the operand value-types are both strings, `==` just hands off the comparison to `===`. If they're not both strings, the coercive steps in `==` will reduce the comparison matching to numeric instead of string:

```js
// numeric (not string!) equality check:
42 == "42";             // true
```

We'll cover numeric equality later in this chapter.

##### *Really* Strict Equality

In addition to `==` and `===`, JS provides the `Object.is(..)` utility, which returns `true` if both arguments are *exactly identical*, and `false` otherwise (no exceptions or nuances):

```js
Object.is("42",42);             // false

Object.is("42","\x34\x32");     // true
```

Since `===` adds a `=` onto the end of `==` to make it more strict in behavior, I kind of half-joke that the `Object.is(..)` utility is like a `====` (a fourth `=` added) operator, for the really-truly-strict-no-exceptions kind of equality checking!

That said, `===` (and `==` by virtue of its internal delegation to `===`) are *extremely predictable*, with no weird exceptions, when it comes to comparing two actually-already-string values. I strongly recommend using `==` for such checks (or `===`), and reserve `Object.is(..)` for the corner cases (which are numeric).

#### String Relational Comparisons

In addition to equality checks between strings, JS supports relational comparisons between primitive values, like strings: `<`, `<=`, `>`, and `>=`.

The `<` (less-than) and `>` (greater-than) operations compare two string values lexicographically -- like you would sort words in a dictionary -- and should thus be fairly self explanatory:

```js
"hello" < "world";          // true
```

| NOTE: |
| :--- |
| As mentioned earlier, the running JS program has a default locale, and these operators compare according to that locale. |

Like `==`, the `<` and `>` operators are numerically coercive. Any non-number values are coerced to numbers. So the only way to do a relational comparison with strings is to ensure both operands are already string values.

Perhaps somewhat surprisingly, the `<` and `>` have no strict-comparison equivalent, the way `===` avoids the coercion of `==`. These operators are always coercive (when the types don't match), and there's no way in JS to avoid that.

So what happens when both values are *numeric-looking* strings?

```js
"100" < "11";               // true
```

Numerically, of course, `100` should *not be* less than `11`.

But relational comparisons between two strings use the lexicographic ordering. So the second `"0"` character (in `"100"`) is less than the second `"1"` (in `"11"`), and thus `"100"` would be sorted in a *dictionary* before `"11"`. The relational operators only coerce to numbers if the operand types are not already strings.

The `<=` (less-than-or-equal) and `>=` (greater-than-or-equal) operators are effectively a shorthand for a compound check.

```js
"hello" <= "hello";                             // true
("hello" < "hello") || ("hello" == "hello");    // true

"hello" >= "hello";                             // true
("hello" > "hello") || ("hello" == "hello");    // true
```

| NOTE: |
| :--- |
| Here's an interesting bit of specification nuance: JS doesn't actually define the underlying greater-than (for `>`) or greater-than-or-equal (for `>=`) operations. Instead, it defines them by reversing the arguments to their *less-than* complement counterparts. So `x > y` is treated by JS essentially as `y <= x`, and `x >= y` is treated by JS essentially as `y < x`. So JS only needs to specify how `<` and `==` work, and thus gets `>` and `>=` for free! |

##### Locale-Aware Relational Comparisons

As I mentioned a moment ago, the relational operators assume and use the current in-effect locale. However, it can sometimes be useful to force a specific locale for comparisons (such as when sorting a list of strings).

JS provides the method `localCompare(..)` on JS strings for this purpose:

```js
"hello".localeCompare("world");
// -1 (or negative number)

"world".localeCompare("hello","en");
// 1 (or positive number)

"hello".localeCompare("hello","en",{ ignorePunctuation: true });
// 0

// examples from MDN:
//
// in German, ä sorts before z
"ä".localeCompare("z","de");
// -1 (or negative number) // a negative value

// in Swedish, ä sorts after z
"ä".localeCompare("z","sv");
// 1 (or positive number)
```

The optional second and third arguments to `localeCompare(..)` control which locale to use, via the `Intl.Collator` API[^INTLCollatorApi], as covered earlier.

You might use `localeCompare(..)` when sorting an array of strings:

```js
studentNames = [
    "Lisa",
    "Kyle",
    "Jason"
];

// Array::sort() mutates the array in place
studentNames.sort(function alphabetizeNames(name1,name2){
    return name1.localeCompare(name2);
});

studentNames;
// [ "Jason", "Kyle", "Lisa" ]
```

But as discussed earlier, a more straightforward way (and slightly more performant when sorting many strings) is using `Intl.Collator` directly:

```js
studentNames = [
    "Lisa",
    "Kyle",
    "Jason"
];

nameSorter = new Intl.Collator("en");

// Array::sort() mutates the array in place
studentNames.sort(nameSorter.compare);

studentNames;
// [ "Jason", "Kyle", "Lisa" ]
```

### String Concatenation

Two or more string values can be concatenated (combined) into a new string value, using the `+` operator:

```js
greeting = "Hello, " + "Kyle!";

greeting;               // Hello, Kyle!
```

The `+` operator will act as a string concatenation if either of the two operands (values on left or right sides of the operator) are already a string (even an empty string `""`).

If one operand is a string and the other is not, the one that's not a string will be coerced to its string representation for the purposes of the concatenation:

```js
userCount = 7;

status = "There are " + userCount + " users online";

status;         // There are 7 users online
```

String concatenation of this sort is essentially interpolation of data into the string, which is the main purpose of template literals (see Chapter 1). So the following code will have the same outcome but is generally considered to be the more preferred approach:

```js
userCount = 7;

status = `There are ${userCount} users online`;

status;         // There are 7 users online
```

Other options for string concatenation include `"one".concat("two","three")` and `[ "one", "two", "three" ].join("")`, but these kinds of approaches are only preferable when the number of strings to concatenate is dependent on runtime conditions/computation. If the string has a fixed/known set of content, as above, template literals are the better option.

### String Value Methods

String values provide a whole slew of additional string-specific methods (as properties):

* `charAt(..)`: produces a new string value at the numeric index, similar to `[ .. ]`; unlike `[ .. ]`, the result is always a string, either the character at position `0` (if a valid number outside the indices range), or the empty string `""` (if missing/invalid index)

* `at(..)` is similar to `charAt(..)`, but negative indices count backwards from the end of the string

* `charCodeAt(..)`: returns the numeric code-unit (see "JS Character Encodings" in Chapter 1) at the specified index

* `codePointAt(..)`: returns the whole code-point starting at the specified index; if a surrogate pair is found there, the whole character (code-point) s returned

* `substr(..)` / `substring(..)` / `slice(..)`: produces a new string value that represents a range of characters from the original string; these differ in how the range's start/end indices are specified or determined

* `toUpperCase()`: produces a new string value that's all uppercase characters

* `toLowerCase()`: produces a new string value that's all lowercase characters

* `toLocaleUpperCase()` / `toLocaleLowerCase()`: uses locale mappings for uppercase or lowercase operations

* `concat(..)`: produces a new string value that's the concatenation of the original string and all of the string value arguments passed in

* `indexOf(..)`: searches for a string value argument in the original string, optionally starting from the position specified in the second argument; returns the `0`-based index position if found, or `-1` if not found

* `lastIndexOf(..)`: like `indexOf(..)` but, from the end of the string (right in LTR locales, left in RTL locales)

* `includes(..)`: similar to `indexOf(..)` but returns a boolean result

* `search(..)`: similar to `indexOf(..)` but with a regular-expression matching as specified

* `trimStart()` / `trimEnd()` / `trim()`: produces a new string value with whitespace trimmed from the start of the string (left in LTR locales, right in RTL locales), or the end of the string (right in LTR locales, left in RTL locales), or both

* `repeat(..)`: produces a new string with the original string value repeated the specified number of times

* `split(..)`: produces an array of string values as split at the specified string or regular-expression boundaries

* `padStart(..)` / `padEnd(..)`: produces a new string value with padding (default " " whitespace, but can be overridden) applied to either the start (left in LTR locales, right in RTL locales) or the end (right in LTR locales), left in RTL locales), so that the final string result is at least of a specified length

* `startsWith(..)` / `endsWith(..)`: checks either the start (left in LTR locales, right in RTL locales) or the end (right in LTR locales) of the original string for the string value argument; returns a boolean result

* `match(..)` / `matchAll(..)`: returns an array-like regular-expression matching result against the original string

* `replace(..)`: returns a new string with a replacement from the original string, of one or more matching occurrences of the specified regular-expression match

* `normalize(..)`: produces a new string with Unicode normalization (see "Unicode Normalization" in Chapter 1) having been performed on the contents

* `localCompare(..)`: function that compares two strings according to the current locale (useful for sorting); returns a negative number (usually `-1` but not guaranteed) if the original string value is comes before the argument string value lexicographically, a positive number (usually `1` but not guaranteed) if the original string value comes after the argument string value lexicographically, and `0` if the two strings are identical

* `anchor()`, `big()`, `blink()`, `bold()`, `fixed()`, `fontcolor()`, `fontsize()`, `italics()`, `link()`, `small()`, `strike()`, `sub()`, and `sup()`: historically, these were useful in generating HTML string snippets; they're now deprecated and should be avoided

| WARNING: |
| :--- |
| Many of the methods described above rely on position indices. As mentioned earlier in the "Length Computation" section, these positions are dependent on the internal contents of the string value, which means that if an extended Unicode character is present and takes up two code-unit slots, that will count as two index positions instead of one. Failing to account for *decomposed* code-units, surrogate pairs, and grapheme cluseters is a common source of bugs in JS string handling. |

These string methods can all be called directly on a literal value, or on a variable/property that's holding a string value. When applicable, they produce a new string value rather than modifying the existing string value (since strings are immutable):

```js
"all these letters".toUpperCase();      // ALL THESE LETTERS

greeting = "Hello!";
greeting.repeat(2);                     // Hello!Hello!
greeting;                               // Hello!
```

### Static `String` Helpers

The following string utility functions are provided directly on the `String` object, rather than as methods on individual string values:

* `String.fromCharCode(..)` / `String.fromCodePoint(..)`: produce a string from one or more arguments representing the code-units (`fromCharCode(..)`) or whole code-points (`fromCodePoint(..)`)

* `String.raw(..)`: a default template-tag function that allows interpolation on a template literal but prevents character escape sequences from being parsed, so they remain in their *raw* individual input characters from the literal

Moreover, most values (especially primitives) can be explicitly coerced to their string equivalent by passing them to the `String(..)` function (no `new` keyword). For example:

```js
String(true);           // "true"
String(42);             // "42"
String(Infinity);       // "Infinity"
String(undefined);      // "undefined"
```

We'll cover much more detail about such type coercions in a later chapter.
