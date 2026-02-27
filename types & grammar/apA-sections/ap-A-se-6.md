# Reserved Words

The ES5 spec defines a set of "reserved words" in Section 7.6.1 that cannot be used as standalone variable names. Technically, there are four categories: "keywords", "future reserved words", the `null` literal, and the `true` / `false` boolean literals.

Keywords are the obvious ones like `function` and `switch`. Future reserved words include things like `enum`, though many of the rest of them (`class`, `extends`, etc.) are all now actually used by ES6; there are other strict-mode only reserved words like `interface`.

StackOverflow user "art4theSould" creatively worked all these reserved words into a fun little poem (http://stackoverflow.com/questions/26255/reserved-keywords-in-javascript/12114140#12114140):

> Let this long package float,
> Goto private class if short.
> While protected with debugger case,
> Continue volatile interface.
> Instanceof super synchronized throw,
> Extends final export throws.
>
> Try import double enum?
> - False, boolean, abstract function,
> Implements typeof transient break!
> Void static, default do,
> Switch int native new.
> Else, delete null public var
> In return for const, true, char
> …Finally catch byte.

**Note:** This poem includes words that were reserved in ES3 (`byte`, `long`, etc.) that are no longer reserved as of ES5.

Prior to ES5, the reserved words also could not be property names or keys in object literals, but that restriction no longer exists.

So, this is not allowed:

```js
var import = "42";
```

But this is allowed:

```js
var obj = { import: "42" };
console.log( obj.import );
```

You should be aware though that some older browser versions (mainly older IE) weren't completely consistent on applying these rules, so there are places where using reserved words in object property name locations can still cause issues. Carefully test all supported browser environments.
