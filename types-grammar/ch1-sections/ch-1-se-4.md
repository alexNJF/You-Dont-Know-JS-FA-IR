## String Values

The `string` type contains any value which is a collection of one or more characters, delimited (surrounding on either side) by quote characters:

```js
myName = "Kyle";
```

JS does not distinguish a single character as a different type as some languages do; `"a"` is a string just like `"abc"` is.

Strings can be delimited by double-quotes (`"`), single-quotes (`'`), or back-ticks (`` ` ``). The ending delimiter must always match the starting delimiter.

Strings have an intrinsic length which corresponds to how many code-points -- actually, code-units, more on that in a bit -- they contain.

```js
myName = "Kyle";

myName.length;      // 4
```

This does not necessarily correspond to the number of visible characters present between the start and end delimiters (aka, the string literal). It can sometimes be a little confusing to keep straight the difference between a string literal and the underlying string value, so pay close attention.

| NOTE: |
| :--- |
| We'll cover length computation of strings in detail, in Chapter 2. |

### JS Character Encodings

What type of character encoding does JS use for string characters?

You've probably heard of "Unicode" and perhaps even "UTF-8" (8-bit) or "UTF-16" (16-bit). If you're like me (before doing the research it took to write this text), you might have just hand-waved and decided that's all you need to know about character encodings in JS strings.

But... it's not. Not even close.

It turns out, you need to understand how a variety of aspects of Unicode work, and even to consider concepts from UCS-2 (2-byte Universal Character Set), which is similar to UTF-16, but not quite the same. [^UTFUCS]

Unicode defines all the "characters" we can represent universally in computer programs, by assigning a specific number to each, called code-points. These numbers range from `0` all the way up to a maximum of `1114111` (`10FFFF` in hexadecimal).

The standard notation for Unicode characters is `U+` followed by 4-6 hexadecimal characters. For example, the `❤` (heart symbol) is code-point `10084` (`2764` in hexadecimal), and is thus notated with `U+2764`.

The first group of 65,535 code points in Unicode is called the BMP (Basic Multilingual Plane). These can all be represented with 16 bits (2 bytes). When representing Unicode characters from the BMP, it's fairly straightforward, as they can *fit* neatly into single UTF-16 JS characters.

All the rest of the code points are grouped into 16 so called "supplemental planes" or "astral planes". These code-points require more than 16 bits to represent -- 21 bits to be exact -- so when representing extended/supplemental characters above the BMP, JS actually stores these code-points as a pairing of two adjacent 16-bit code units, called *surrogate halves* (or *surrogate pairs*).

For example, the Unicode code point `127878` (hexadecimal `1F386`) is `🎆` (fireworks symbol). JS stores this in a string value as two surrogate-halve code units: `U+D83C` and `U+DF86`. Keep in mind that these two parts of the whole character do *not* standalone; they're only valid/meaningful when paired immediately adjacent to each other.

This has implications on the length of strings, because a single visible character like the `🎆` fireworks symbol, when in a JS string, is a counted as 2 characters for the purposes of the string length!

We'll revisit Unicode characters in a bit, and then cover the challenges of computing string length in Chapter 2.

### Escape Sequences

If `"` or `'` are used to delimit a string literal, the contents are only parsed for *character-escape sequences*: `\` followed by one or more characters that JS recognizes and parses with special meaning. Any other characters in a string that don't parse as escape-sequences (single-character or multi-character), are inserted as-is into the string value.

For single-character escape sequences, the following characters are recognized after a `\`: `b`, `f`, `n`, `r`, `t`, `v`, `0`, `'`, `"`, and `\`. For example,  `\n` means new-line, `\t` means tab, etc.

If a `\` is followed by any other character (except `x` and `u` -- explained below), like for example `\k`, that sequence is interpreted as the `\` being an unnecessary escape, which is thus dropped, leaving just the literal character itself (`k`).

To include a `"` in the middle of a `"`-delimited string literal, use the `\"` escape sequence. Similarly, if you're including a `'` character in the middle of a `'`-delimited string literal, use the `\'` escape sequence. By contrast, a `'` does *not* need to be escaped inside a `"`-delimited string, nor vice versa.

```js
myTitle = "Kyle Simpson (aka, \"getify\"), former O'Reilly author";

console.log(myTitle);
// Kyle Simpson (aka, "getify"), former O'Reilly author
```

In text, forward slash `/` is most common. But occasionally, you need a backward slash `\`. To include a literal `\` backslash character without it performing as the start of a character-escape sequence, use the `\\` (double backslashes).

So, then... what would `\\\` (three backslashes) in a string parse as? The first two `\`'s would be a `\\` escape sequence, thereby inserting just a single `\` character in the string value, and the remaining `\` would just escape whatever character comes immediately after it.

One place backslashes show up commonly is in Windows file paths, which use the `\` separator instead of the `/` separator used in linux/unix style paths:

```js
windowsFontsPath =
    "C:\\Windows\\Fonts\\";

console.log(windowsFontsPath);
// C:\Windows\Fonts\"
```

| TIP: |
| :--- |
| What about four backslashes `\\\\` in a string literal? Well, that's just two `\\` escape sequences next to each other, so it results in two adjacent backslashes (`\\`) in the underlying string value. You might recognize there's an odd/even rule pattern at play. You should thus be able to deciper any odd (`\\\\\`, `\\\\\\\\\`, etc) or even (`\\\\\\`, `\\\\\\\\\\`, etc) number of backslashes in a string literal. |

#### Line Continuation

The `\` character followed by an actual new-line character (not just literal `n`) is a special case, and it creates what's called a line-continuation:

```js
greeting = "Hello \
Friends!";

console.log(greeting);
// Hello Friends!
```

As you can see, the new-line at the end of the `greeting = ` line is immediately preceded by a `\`, which allows this string literal to continue onto the subsequent line. Without the escaping `\` before it, a new-line -- the actual new-line, not the `\n` character escape sequence -- appearing in a `"` or `'` delimited string literal would actually produce a JS syntax parsing error.

Because the end-of-line `\` turns the new-line character into a line continuation, the new-line character is omitted from the string, as shown by the `console.log(..)` output.

| NOTE: |
| :--- |
| This line-continuation feature is often referred to as "multi-line strings", but I think that's a confusing label. As you can see, the string value itself doesn't have multiple lines, it only was defined across multiple lines via the line continuations. A multi-line string would actually have multiple lines in the underlying value. We'll revisit this topic later in this chapter when we cover Template Literals. |

### Multi-Character Escapes

Multi-character escape sequences may be hexadecimal or Unicode sequences.

Hexadecimal escape sequences are used to encode any of the base ASCII characters (codes 0-255), and look like `\x` followed by exactly two hexadecimal characters (`0-9` and `a-f` / `A-F` -- case insensitive). For example, `A9` or `a9` are decimal value `169`, which corresponds to:

```js
copyright = "\xA9";  // or "\xa9"

console.log(copyright);     // ©
```

For any normal character that can be typed on a keyboard, such as `"a"`, it's usually most readable to just specify the literal character, as opposed to a more obfuscated hexadecimal representation:

```js
"a" === "\x61";             // true
```

#### Unicode In Strings

Unicode escape sequences alone can encode any of the characters from the Unicode BMP. They look like `\u` followed by exactly four hexadecimal characters.

For example, the escape-sequence `\u00A9` (or `\u00a9`) corresponds to that same `©` symbol, while `\u263A` (or `\u263a`) corresponds to the Unicode character with code-point `9786`: `☺` (smiley face symbol).

When any character-escape sequence (regardless of length) is recognized, the single character it represents is inserted into the string, rather than the original separate characters. So, in the string `"\u263A"`, there's only one (smiley) character, not six individual characters.

But as explained earlier, many Unicode code-points are well above `65535`. For example, `1F4A9` (or `1f4a9`) is decimal code-point `128169`, which corresponds to the funny `💩` (pile-of-poo) symbol.

But `\u1F4A9` wouldn't work to include this character in a string, since it would be parsed as the Unicode escape sequence `\u1F4A`, followed by a literal `9` character. To address this limitation, a variation of Unicode escape sequences was introduced to allow an arbitrary number of hexadecimal characters after the `\u`, by surrounding them with `{ .. }` curly braces:

```js
myReaction = "\u{1F4A9}";

console.log(myReaction);
// 💩
```

Recall the earlier discussion of extended (non-BMP) Unicode characters and *surrogate halves*? The same `💩` could also be defined with two explicit code-units, that form a surrogate pair:

```js
myReaction = "\uD83D\uDCA9";

console.log(myReaction);
// 💩
```

All three representations of this same character are stored internally by JS identically, and are indistinguishable:

```js
"💩" === "\u{1F4A9}";                // true
"\u{1F4A9}" === "\uD83D\uDCA9";     // true
```

Even though JS doesn't care which way such a character is represented in your program, consider the readability differences carefully when authoring your code.

| NOTE: |
| :--- |
| Even though `💩` looks like a single character, its internal representation affects things like the length computation of a string with that character in it. We'll cover length computation of strings in Chapter 2. |

##### Unicode Normalization

Another wrinkle in Unicode string handling is that even certain single BMP characters can be represented in different ways.

For example, the `"é"` character can either be represented as itself (code-point `233`, aka `\xe9` or `\u00e9` or `\u{e9}`), or as the combination of two code-points: the `"e"` character (code-point `101`, aka `\x65`, `\u0065`, `\u{65}`) and the *combining tilde* (code-point `769`, aka `\u0301`, `\u{301}`).

Consider:

```js
eTilde1 = "é";
eTilde2 = "\u00e9";
eTilde3 = "\u0065\u0301";

console.log(eTilde1);       // é
console.log(eTilde2);       // é
console.log(eTilde3);       // é
```

The string literal assigned to `eTilde3` in this snippet stores the accent mark as a separate *combining mark* symbol. Like surrogate pairs, a combining mark only makes sense in connection with the symbol it's adjacent to (usually after).

The rendering of the Unicode symbol should be the same regardless, but how the `"é"` character is internally stored affects things like `length` computation of the containing string, as well as equality and relational comparison (more on these in Chapter 2):

```js
eTilde1.length;             // 2
eTilde2.length;             // 1
eTilde3.length;             // 2

eTilde1 === eTilde2;        // false
eTilde1 === eTilde3;        // true
```

One particular challenge is that you may copy-paste a string with an `"é"` character visible in it, and that character you copied may have been in the *composed* or *decomposed* form. But there's no visual way to tell, and yet the underlying string value in the literal will be different:

```js
"é" === "é";           // false!!
```

This internal representation difference can be quite challenging if not carefully planned for. Fortunately, JS provides a `normalize(..)` utility method on strings to help:

```js
eTilde1 = "é";
eTilde2 = "\u{e9}";
eTilde3 = "\u{65}\u{301}";

eTilde1.normalize("NFC") === eTilde2;
eTilde2.normalize("NFD") === eTilde3;
```

The `"NFC"` normalization mode combines adjacent code-points into the *composed* code-point (if possible), whereas the `"NFD"` normalization mode splits a single code-point into its *decomposed* code-points (if possible).

And there can actually be more than two individual *decomposed* code-points that make up a single *composed* code-point -- for example, a single character could have several diacritical marks applied to it.

When dealing with Unicode strings that will be compared, sorted, or length analyzed, it's very important to keep Unicode normalization in mind, and use it where necessary.

##### Unicode Grapheme Clusters

A final complication of Unicode string handling is the support for clustering of multiple adjacent code-points into a single visually distinct symbol, referred to as a *grapheme* (or a *grapheme cluster*).

An example would be a family emoji such as `"👩‍👩‍👦‍👦"`, which is actually made up of 7 code-points that all cluster/group together into a single visual symbol.

Consider:

```js
familyEmoji = "\u{1f469}\u{200d}\u{1f469}\u{200d}\u{1f466}\u{200d}\u{1f466}";

familyEmoji;            // 👩‍👩‍👦‍👦
```

This emoji is *not* a single registered Unicode code-point, and as such, there's no *normalization* that can be performed to compose these 7 separate code-points into a single entity. The visual rendering logic for such composite symbols is quite complex, well beyond what most of JS developers want to embed into our programs. Libraries do exist for handling some of this logic, but they're often large and still don't necessarily cover all of the nuances/variations.

Unlike surrogate pairs and combining marks, the symbols in grapheme clusters can in fact act as standalone characters, but have the special combining behavior when placed adjacent to each other.

This kind of complexity significantly affects length computations, comparison, sorting, and many other common string-oriented operations.

### Template Literals

I mentioned earlier that strings can alternately be delimited with `` `..` `` back-ticks:

```js
myName = `Kyle`;
```

All the same rules for character encodings, character escape sequences, and lengths apply to these types of strings.

However, the contents of these template (string) literals are additionally parsed for a special delimiter sequence `${ .. }`, which marks an expression to evaluate and interpolate into the string value at that location:

```js
myName = `Kyle`;

greeting = `Hello, ${myName}!`;

console.log(greeting);      // Hello, Kyle!
```

Everything between the `{ .. }` in such a template literal is an arbitrary JS expression. It can be simple variables like `myName`, or complex JS programs, or anything in between (even another template literal expression!).

| TIP: |
| :--- |
| This feature is commonly called "template literals" or "template strings", but I think that's confusing. "Template" usually means, in programming contexts, a reusable set of text that can be re-evaluated with different data. For example, *template engines* for pages, email templates for newsletter campaigns, etc. This JS feature is not re-usable. It's a literal, and it produces a single, immediate value (usually a string). You can put such a value in a function, and call the function multiple times. But then the function is acting as the template, not the the literal itself. I prefer instead to refer to this feature as *interpolated literals*, or the funny, short-hand: *interpoliterals*. I just think that name is more accurately descriptive. |

Template literals also have an interesting different behavior with respect to new-lines, compared to classic `"` or `'` delimited strings. Recall that for those strings, a line-continuation required a `\` at the end of each line, right before a new-line. Not so, with template literals!

```js
myPoem = `
Roses are red
Violets are blue
C3PO's a funny robot
and so R2.`;

console.log(myPoem);
//
// Roses are red
// Violets are blue
// C3PO's a funny robot
// and so R2.
```

Line-continuations with template literals do *not require* escaping. However, that means the new-line is part of the string, even the first new-line above. In other words, `myPoem` above holds a truly *multi-line string*, as shown. However, if you `\` escape the end of any line in a template literal, the new-line will be omitted, just like with non-template literal strings.

Template literals usually result in a string value, but not always. A form of template literal that may look kind of strange is called a *tagged template literal*:

```js
price = formatCurrency`The cost is: ${totalCost}`;
```

Here, `formatCurrency` is a tag applied to the template literal value, which actually invokes `formatCurrency(..)` as a function, passing it the string literals and interpolated expressions parsed from the value. This function can then assemble those in any way it sees fit -- such as formatting a `number` value as currency in the current locale -- and return whatever value, string or otherwise, that it wants.

So tagged template literals are not always strings; they can be any value. But untagged template literals *will always be* strings.

Some JS developers believe that untagged template literal strings are best to use for *all* strings, even if not using any expression interpolation or multiple lines. I disagree. I think they should only be used when interpolating (or multi-line'ing).

| TIP: |
| :--- |
| The principle I always apply in making such determinations: use the closest-matched, and least capable, feature/tool, for any task. |

Moreover, there are a few places where `` `..` `` style strings are disallowed. For example, the `"use strict"` pragma cannot use back-ticks, or the pragma will be silently ignored (and thus the program accidentally runs in non-strict mode). Also, this style of strings cannot be used in quoted property names of object literals, destruturing patterns, or in the ES Module `import .. from ..` module-specifier clause.

My take: use `` `..` `` delimited strings where allowed, but only when interpolation/multi-line is needed; and keep using `".."` or `'..'` delimited strings for everything else.
