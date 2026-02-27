# Host Objects

The well-covered rules for how variables behave in JS have exceptions to them when it comes to variables that are auto-defined, or otherwise created and provided to JS by the environment that hosts your code (browser, etc.) -- so called, "host objects" (which include both built-in `object`s and `function`s).

For example:

```js
var a = document.createElement( "div" );

typeof a;								// "object" -- as expected
Object.prototype.toString.call( a );	// "[object HTMLDivElement]"

a.tagName;								// "DIV"
```

`a` is not just an `object`, but a special host object because it's a DOM element. It has a different internal `[[Class]]` value (`"HTMLDivElement"`) and comes with predefined (and often unchangeable) properties.

Another such quirk has already been covered, in the "Falsy Objects" section in Chapter 4: some objects can exist but when coerced to `boolean` they (confoundingly) will coerce to `false` instead of the expected `true`.

Other behavior variations with host objects to be aware of can include:

* not having access to normal `object` built-ins like `toString()`
* not being overwritable
* having certain predefined read-only properties
* having methods that cannot be `this`-overriden to other objects
* and more...

Host objects are critical to making our JS code work with its surrounding environment. But it's important to note when you're interacting with a host object and be careful assuming its behaviors, as they will quite often not conform to regular JS `object`s.

One notable example of a host object that you probably interact with regularly is the `console` object and its various functions (`log(..)`, `error(..)`, etc.). The `console` object is provided by the *hosting environment* specifically so your code can interact with it for various development-related output tasks.

In browsers, `console` hooks up to the developer tools' console display, whereas in node.js and other server-side JS environments, `console` is generally connected to the standard-output (`stdout`) and standard-error (`stderr`) streams of the JavaScript environment system process.
