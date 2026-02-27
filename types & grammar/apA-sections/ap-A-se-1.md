# Annex B (ECMAScript)

It's a little known fact that the official name of the language is ECMAScript (referring to the ECMA standards body that manages it). What then is "JavaScript"? JavaScript is the common tradename of the language, of course, but more appropriately, JavaScript is basically the browser implementation of the spec.

The official ECMAScript specification includes "Annex B," which discusses specific deviations from the official spec for the purposes of JS compatibility in browsers.

The proper way to consider these deviations is that they are only reliably present/valid if your code is running in a browser. If your code always runs in browsers, you won't see any observable difference. If not (like if it can run in node.js, Rhino, etc.), or you're not sure, tread carefully.

The main compatibility differences:

* Octal number literals are allowed, such as `0123` (decimal `83`) in non-`strict mode`.
* `window.escape(..)` and `window.unescape(..)` allow you to escape or unescape strings with `%`-delimited hexadecimal escape sequences. For example: `window.escape( "?foo=97%&bar=3%" )` produces `"%3Ffoo%3D97%25%26bar%3D3%25"`.
* `String.prototype.substr` is quite similar to `String.prototype.substring`, except that instead of the second parameter being the ending index (noninclusive), the second parameter is the `length` (number of characters to include).

### Web ECMAScript

The Web ECMAScript specification (http://javascript.spec.whatwg.org/) covers the differences between the official ECMAScript specification and the current JavaScript implementations in browsers.

In other words, these items are "required" of browsers (to be compatible with each other) but are not (as of the time of writing) listed in the "Annex B" section of the official spec:

* `<!--` and `-->` are valid single-line comment delimiters.
* `String.prototype` additions for returning HTML-formatted strings: `anchor(..)`, `big(..)`, `blink(..)`, `bold(..)`, `fixed(..)`, `fontcolor(..)`, `fontsize(..)`, `italics(..)`, `link(..)`, `small(..)`, `strike(..)`, and `sub(..)`. **Note:** These are very rarely used in practice, and are generally discouraged in favor of other built-in DOM APIs or user-defined utilities.
* `RegExp` extensions: `RegExp.$1` .. `RegExp.$9` (match-groups) and `RegExp.lastMatch`/`RegExp["$&"]` (most recent match).
* `Function.prototype` additions: `Function.prototype.arguments` (aliases internal `arguments` object) and `Function.caller` (aliases internal `arguments.caller`). **Note:** `arguments` and thus `arguments.caller` are deprecated, so you should avoid using them if possible. That goes doubly so for these aliases -- don't use them!

**Note:** Some other minor and rarely used deviations are not included in our list here. See the external "Annex B" and "Web ECMAScript" documents for more detailed information as needed.

Generally speaking, all these differences are rarely used, so the deviations from the specification are not significant concerns. **Just be careful** if you rely on any of them.
