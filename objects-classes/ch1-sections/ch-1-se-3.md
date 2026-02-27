# Defining Properties

Inside the object literal curly braces, you define properties (name and value) with `propertyName: propertyValue` pairs, like this:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};
```

The values you assign to the properties can be literals, as shown, or can be computed by expression:

```js
function twenty() { return 20; }

myObj = {
    favoriteNumber: (twenty() + 1) * 2,
};
```

The expression `(twenty() + 1) * 2` is evaluated immediately, with the result (`42`) assigned as the property value.

Developers sometimes wonder if there's a way to define an expression for a property value where the expression is "lazy", meaning it's not computed at the time of assignment, but defined later. JS does not have lazy expressions, so the only way to do so is for the expression to be wrapped in a function:

```js
function twenty() { return 20; }
function myNumber() { return (twenty() + 1) * 2; }

myObj = {
    favoriteNumber: myNumber   // notice, NOT `myNumber()` as a function call
};
```

In this case, `favoriteNumber` is not holding a numeric value, but rather a function reference. To compute the result, that function reference must be explicitly executed.

### Looks Like JSON?

You may notice that this object-literal syntax we've seen thus far resembles a related syntax, "JSON" (JavaScript Object Notation):

```json
{
    "favoriteNumber": 42,
    "isDeveloper": true,
    "firstName": "Kyle"
}
```

The biggest differences between JS's object literals and JSON are, for objects defined as JSON:

1. property names must be quoted with `"` double-quote characters

2. property values must be literals (either primitives, objects, or arrays), not arbitrary JS expressions

In JS programs, an object literal does not require quoted property names -- you *can* quote them (`'` or `"` allowed), but it's usually optional. There are however characters that are valid in a property name, but which cannot be included without surrounding quotes; for example, leading numbers or whitespace:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle",
    "2 nicknames": [ "getify", "ydkjs" ]
};
```

One other minor difference is, JSON syntax -- that is, text that will be *parsed* as JSON, such as from a `.json` file -- is stricter than general JS. For example, JS allows comments (`// ..` and `/* .. */`), and trailing `,` commas in object and array expressions; JSON does not allow any of these. Thankfully, JSON does still allow arbitrary whitespace.

### Property Names

Property names in object literals are almost always treated/coeced as string values. One exception to this is for integer (or "integer looking") property "names":

```js
anotherObj = {
    42:       "<-- this property name will be treated as an integer",
    "41":     "<-- ...and so will this one",

    true:     "<-- this property name will be treated as a string",
    [myObj]:  "<-- ...and so will this one"
};
```

The `42` property name will be treated as an integer property name (aka, index); the `"41"` string value will also be treated as such since it *looks like* an integer. By contrast, the `true` value will become the string property name `"true"`, and the `myObj` identifier reference, *computed* via the surrounding `[ .. ]`, will coerce the object's value to a string (generally the default `"[object Object]"`).

| WARNING: |
| :--- |
| If you need to actually use an object as a key/property name, never rely on this computed string coercion; its behavior is surprising and almost certainly not what's expected, so program bugs are likely to occur. Instead, use a more specialized data structure, called a `Map` (added in ES6), where objects used as property "names" are left as-is instead of being coerced to a string value. |

As with `[myObj]` above, you can *compute* any **property name** (distinct from computing the property value) at the time of object literal definition:

```js
anotherObj = {
    ["x" + (21 * 2)]: true
};
```

The expression `"x" + (21 * 2)`, which must appear inside of `[ .. ]` brackets, is computed immediately, and the result (`"x42"`) is used as the property name.

### Symbols As Property Names

ES6 added a new primitive value type of `Symbol`, which is often used as a special property name for storing and retrieving property values. They're created via the `Symbol(..)` function call (**without** the `new` keyword), which accepts an optional description string used only for friendlier debugging purposes; if specified, the description is inaccessible to the JS program and thus not used for any other purpose than debug output.

```js
myPropSymbol = Symbol("optional, developer-friendly description");
```

| NOTE: |
| :--- |
| Symbols are sort of like numbers or strings, except that their value is *opaque* to, and globally unique within, the JS program. In other words, you can create and use symbols, but JS doesn't let you know anything about, or do anything with, the underlying value; that's kept as a hidden implementation detail by the JS engine. |

Computed property names, as previously described, are how to define a symbol property name on an object literal:

```js
myPropSymbol = Symbol("optional, developer-friendly description");

anotherObj = {
    [myPropSymbol]: "Hello, symbol!"
};
```

The computed property name used to define the property on `anotherObj` will be the actual primitive symbol value (whatever it is), not the optional description string (`"optional, developer-friendly description"`).

Because symbols are globally unique in your program, there's **no** chance of accidental collision where one part of the program might accidentally define a property name the same as another part of the program tried defined/assigned.

Symbols are also useful to hook into special default behaviors of objects, and we'll cover that in more detail in "Extending the MOP" in the next chapter.

### Concise Properties

When defining an object literal, it's common to use a property name that's the same as an existing in-scope identifier that holds the value you want to assign.

```js
coolFact = "the first person convicted of speeding was going 8 mph";

anotherObj = {
    coolFact: coolFact
};
```

| NOTE: |
| :--- |
| That would have been the same thing as the quoted property name definition `"coolFact": coolFact`, but JS developers rarely quote property names unless strictly necessary. Indeed, it's idiomatic to avoid the quotes unless required, so it's discouraged to include them unnecessarily. |

In this situation, where the property name and value expression identifier are identical, you can omit the property-name portion of the property definition, as a so-called "concise property" definition:

```js
coolFact = "the first person convicted of speeding was going 8 mph";

anotherObj = {
    coolFact   // <-- concise property short-hand
};
```

The property name is `"coolFact"` (string), and the value assigned to the property is what's in the `coolFact` variable at that moment: `"the first person convicted of speeding was going 8 mph"`.

At first, this shorthand convenience may seem confusing. But as you get more familiar with seeing this very common and popular feature being used, you'll likely favor it for typing (and reading!) less.

### Concise Methods

Another similar shorthand is defining functions/methods in an object literal using a more concise form:

```js
anotherObj = {
    // standard function property
    greet: function() { console.log("Hello!"); },

    // concise function/method property
    greet2() { console.log("Hello, friend!"); }
};
```

While we're on the topic of concise method properties, we can also define generator functions (another ES6 feature):

```js
anotherObj = {
    // instead of:
    //   greet3: function*() { yield "Hello, everyone!"; }

    // concise generator method
    *greet3() { yield "Hello, everyone!"; }
};
```

And though it's not particularly common, concise methods/generators can even have quoted or computed names:

```js
anotherObj = {
    "greet-4"() { console.log("Hello, audience!"); },

    // concise computed name
    [ "gr" + "eet 5" ]() { console.log("Hello, audience!"); },

    // concise computed generator name
    *[ "ok, greet 6".toUpperCase() ]() { yield "Hello, audience!"; }
};
```

### Object Spread

Another way to define properties at object literal creation time is with a form of the `...` syntax -- it's not technically an operator, but it certainly seems like one -- often referred to as "object spread".

The `...` when used inside an object literal will "spread" out the contents (properties, aka key/value pairs) of another object value into the object being defined:

```js
anotherObj = {
    favoriteNumber: 12,

    ...myObj,   // object spread, shallow copies `myObj`

    greeting: "Hello!"
}
```

The spreading of `myObj`'s properties is shallow, in that it only copies the top-level properties from `myObj`; any values those properties hold are simply assigned over. If any of those values are references to other objects, the references themselves are assigned (by copy), but the underlying object values are *not* duplicated -- so you end up with multiple shared references to the same object(s).

You can think of object spreading like a `for` loop that runs through the properties one at a time and does an `=` style assignment from the source object (`myObj`) to the target object (`anotherObj`).

Also, consider these property definition operations to happen "in order", from top to bottom of the object literal. In the above snippet, since `myObj` has a `favoriteNumber` property, the object spread will end up overwriting the `favoriteNumber: 12` property assignment from the previous line. Moreover, if `myObj` had contained a `greeting` property that was copied over, the next line (`greeting: "Hello!"`) would override that property definition.

| NOTE: |
| :--- |
| Object spread also only copies *owned* properties (those directly on the object) that are *enumerable* (allowed to be enumerated/listed). It does not duplicate the property -- as in, actually mimic the property's exact characteristics -- but rather do a simple assignment style copy. We'll cover more such details in the "Property Descriptors" section of the next chapter. |

A common way `...` object spread is used is for performing *shallow* object duplication:

```js
myObjShallowCopy = { ...myObj };
```

Keep in mind you cannot `...` spread into an existing object value; the `...` object spread syntax can only appear inside the `{ .. }` object literal, which is creating a new object value. To perform a similar shallow object copy but with APIs instead of syntax, see the "Object Entries" section later in this chapter (with coverage of `Object.entries(..)` and `Object.fromEntries(..)`).

But if you instead want to copy object properties (shallowly) into an *existing* object, see the "Assigning Properties" section later in this chapter (with coverage of `Object.assign(..)`).

### Deep Object Copy

Also, since `...` doesn't do full, deep object duplication, the object spread is generally only suitable for duplicating objects that hold simple, primitive values only, not references to other objects.

Deep object duplication is an incredibly complex and nuanced operation. Duplicating a value like `42` is obvious and straightforward, but what does it mean to copy a function (which is a special kind of object, also held by reference), or to copy an external (not entirely in JS) object reference, such as a DOM element? And what happens if an object has circular references (like where a nested descendant object holds a reference back up to an outer ancestor object)? There's a variety of opinions in the wild about how all these corner cases should be handled, and thus no single standard exists for deep object duplication.

For deep object duplication, the standard approaches have been:

1. Use a library utility that declares a specific opinion on how the duplication behaviors/nuances should be handled.

2. Use the `JSON.parse(JSON.stringify(..))` round-trip trick -- this only "works" correctly if there are no circular references, and if there are no values in the object that cannot be properly serialized with JSON (such as functions).

Recently, though, a third option has landed. This is not a JS feature, but rather a companion API provided to JS by environments like the web platform. Objects can be deep copied now using `structuredClone(..)`[^structuredClone].

```js
myObjCopy = structuredClone(myObj);
```

The underlying algorithm behind this built-in utility supports duplicating circular references, as well as **many more** types of values than the `JSON` round-trip trick. However, this algorithm still has its limits, including no support for cloning functions or DOM elements.