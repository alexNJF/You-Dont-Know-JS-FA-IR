# Accessing Properties

Property access of an existing object is preferably done with the `.` operator:

```js
myObj.favoriteNumber;    // 42
myObj.isDeveloper;       // true
```

If it's possible to access a property this way, it's strongly suggested to do so.

If the property name contains characters that cannot appear in identifiers, such as leading numbers or whitespace, `[ .. ]` brackets can be used instead of the `.`:

```js
myObj["2 nicknames"];    // [ "getify", "ydkjs" ]
```

```js
anotherObj[42];          // "<-- this property name will..."
anotherObj["41"];        // "<-- this property name will..."
```

Even though numeric property "names" remain as numbers, property access via the `[ .. ]` brackets will coerce a string representation to a number (e.g., `"42"` as the `42` numeric equivalent), and then access the associated numeric property accordingly.

Similar to the object literal, the property name to access can be computed via the `[ .. ]` brackets. The expression can be a simple identifier:

```js
propName = "41";
anotherObj[propName];
```

Actually, what you put between the `[ .. ]` brackets can be any arbitrary JS expression, not just identifiers or literal values like `42` or `"isDeveloper"`. JS will first evaluate the expression, and the resulting value will then be used as the property name to look up on the object:

```js
function howMany(x) {
    return x + 1;
}

myObj[`${ howMany(1) } nicknames`];   // [ "getify", "ydkjs" ]
```

In this snippet, the expression is a back-tick delimited `` `template string literal` `` with an interpolated expression of the function call `howMany(1)`. The overall result of that expression is the string value `"2 nicknames"`, which is then used as the property name to access.

### Object Entries

You can get a listing of the properties in an object, as an array of tuples (two-element sub-arrays) holding the property name and value:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

Object.entries(myObj);
// [ ["favoriteNumber",42], ["isDeveloper",true], ["firstName","Kyle"] ]
```

Added in ES6, `Object.entries(..)` retrieves this list of entries -- containing only owned an enumerable properties; see the "Property Descriptors" section in the next chapter -- from a source object.

Such a list can be looped/iterated over, potentially assigning properties to another existing object. However, it's also possible to create a new object from a list of entries, using `Object.fromEntries(..)` (added in ES2019):

```js
myObjShallowCopy = Object.fromEntries( Object.entries(myObj) );

// alternate approach to the earlier discussed:
// myObjShallowCopy = { ...myObj };
```

### Destructuring

Another approach to accessing properties is through object destructuring (added in ES6). Think of destructuring as defining a "pattern" that describes what an object value is supposed to "look like" (structurally), and then asking JS to follow that "pattern" to systematically access the contents of an object value.

The end result of object destructuring is not another object, but rather one or more assignments to other targets (variables, etc) of the values from the source object.

Imagine this sort of pre-ES6 code:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

const favoriteNumber = (
    myObj.favoriteNumber !== undefined ? myObj.favoriteNumber : 42
);
const isDev = myObj.isDeveloper;
const firstName = myObj.firstName;
const lname = (
    myObj.lastName !== undefined ? myObj.lastName : "--missing--"
);
```

Those accesses of the property values, and assignments to other identifiers, is generally called "manual destructuring". To use the declarative object destructuring syntax, it might look like this:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

const { favoriteNumber = 12 } = myObj;
const {
    isDeveloper: isDev,
    firstName: firstName,
    lastName: lname = "--missing--"
} = myObj;

favoriteNumber;   // 42
isDev;            // true
firstName;        // "Kyle"
lname;            // "--missing--"
```

As shown, the `{ .. }` object destucturing resembles an object literal value definition, but it appears on the left-hand side of the `=` operator rather than on the right-hand side where an object value expression would appear. That makes the `{ .. }` on the left-hand side a destructuring pattern rather than another object definition.

The `{ favoriteNumber } = myObj` destructuring tells JS to find a property named `favoriteNumber` on the object, and to assign its value to an identifier of the same name. The single instance of the `favoriteNumber` identifier in the pattern is similar to "concise properties" as discussed earlier in this chapter: if the source (property name) and target (identifier) are the same, you can omit one of them and only list it once.

The `= 12` part tells JS to provide `12` as a default value for the assignment to `favoriteNumber`, if the source object either doesn't have a `favoriteNumber` property, or if the property holds an `undefined` value.

In the second destructuring pattern, the `isDeveloper: isDev` pattern is instructing JS to find a property named `isDeveloper` on the source object, and assign its value to an identifier named `isDev`. It's sort of a "renaming" of the source to the target. By contrast, `firstName: firstName` is providing the source and target for an assignment, but is redundant since they're identical; a single `firstName` would have sufficed here, and is generally more preferred.

The `lastName: lname = "--missing--"` combines both source-target renaming and a default value (if the `lastName` source property is missing or `undefined`).

The above snippet combines object destructuring with variable declarations -- in this example, `const` is used, but `var` and `let` work as well -- but it's not inherently a declaration mechanism. Destructuring is about access and assignment (source to target), so it can operate against existing targets rather than declaring new ones:

```js
let fave;

// surrounding ( ) are required syntax here,
// when a declarator is not used
({ favoriteNumber: fave } = myObj);

fave;  // 42
```

Object destructuring syntax is generally preferred for its declarative and more readable style, over the heavily imperative pre-ES6 equivalents. But don't go overboard with destructuring. Sometimes just doing `x = someObj.x` is perfectly fine!

### Conditional Property Access

Recently (in ES2020), a feature known as "optional chaining" was added to JS, which augments property access capabilities (especially nested property access). The primary form is the two-character compound operator `?.`, like `A?.B`.

This operator will check the left-hand side reference (`A`) to see if it's null'ish (`null` or `undefined`). If so, the rest of the property access expression is short-circuited (skipped), and `undefined` is returned as the result (even if it was `null` that was actually encountered!). Otherwise, `?.` will access the property just as a normal `.` operator would.

For example:

```js
myObj?.favoriteNumber
```

Here, the null'ish check is performed against the `myObj`, meaning that the `favoriteNumber` property access is only performed if the value in `myObj` is non-null'ish. Note that it doesn't verify that `myObj` is actually holding a real object, only that it's non-nullish. However, all non-nullish values can "safely" (no JS exception) be "accessed" via the `.` operator, even if there's no matching property to retrieve.

It's easy to get confused into thinking that the null'ish check is against the `favoriteNumber` property. But one way to keep it straight is to remember that the `?` is on the side where the safety check is performed, while the `.` is on the side that is only conditionally evaluated if the non-null'ish check passes.

Typically, the `?.` operator is used in nested property accesses that may be 3 or more levels deep, such as:

```js
myObj?.address?.city
```

The equivalent operation with the `?.` operator would look like this:

```js
(myObj != null && myObj.address != null) ? myObj.address.city : undefined
```

Again, remember that no check has been performed against the right-most property (`city`) here.

Also, the `?.` should not universally be used in place of every single `.` operator in your programs. You should endeavor to know if a `.` property access will succeed or not before making the access, whenever possible. Use `?.` only when the nature of the values being accessed is subject to conditions that cannot be predicted/controlled.

For example, in the previous snippet, the `myObj?.` usage is probably mis-guided, because it really shouldn't be the case that you start a chain of property access against a variable that might not even hold a top-level object (aside from its contents potentially missing certain properties in certain conditions).

Instead, I would recommend usage more like this:

```js
myObj.address?.city
```

And that expression should only be used in part of your program where you're sure that `myObj` is at least holding a valid object (whether or not it has an `address` property with a sub-object in it).

Another form of the "optional chaining" operator is `?.[`, which is used when the property access you want to make conditional/safe requires a `[ .. ]` bracket.

```js
myObj["2 nicknames"]?.[0];   // "getify"
```

Everything asserted about how `?.` behaves goes the same for `?.[`.

| WARNING: |
| :--- |
| There's a third form of this feature, named "optional call", which uses `?.(` as the operator. It's used for performing a non-null'ish check on a property before executing the function value in the property. For example, instead of `myObj.someFunc(42)`, you can do `myObj.someFunc?.(42)`. The `?.(` checks to make sure `myObj.someFunc` is non-null'ish before invoking it (with the `(42)` part). While that may sound like a useful feature, I think this is dangerous enough to warrant complete avoidance of this form/construct.<br><br>My concern is that `?.(` makes it seem as if we're ensuring that the function is "callable" before calling it, when in fact we're only checking if it's non-null'ish. Unlike `?.` which can allow a "safe" `.` access against a non-null'ish value that's also not an object, the `?.(` non-null'ish check isn't similarly "safe". If the property in question has any non-null'ish, non-function value in it, like `true` or `"Hello"`, the `(42)` call part will be invoked and yet throw a JS exception. So in other words, this form is unfortunately masquerading as more "safe" than it actually is, and should thus be avoided in essentially all circumstances. If a property value can ever *not be* a function, do a more fullsome check for its function'ness before trying to invoke it. Don't pretend that `?.(` is doing that for you, or future readers/maintainers of your code (including your future self!) will likely regret it. |

### Accessing Properties On Non-Objects

This may sound counter-intuitive, but you can generally access properties/methods from values that aren't themselves objects:

```js
fave = 42;

fave;              // 42
fave.toString();   // "42"
```

Here, `fave` holds a primitive `42` number value. So how can we do `.toString` to access a property from it, and then `()` to invoke the function held in that property?

This is a tremendously more indepth topic than we'll get into in this book; see book 4, "Types & Grammar", of this series for more. However, as a quick glimpse: if you perform a property access (`.` or `[ .. ]`) against a non-object, non-null'ish value, JS will by default (temporarily!) coerce the value into an object-wrapped representation, allowing the property access against that implicitly instantiated object.

This process is typically called "boxing", as in putting a value inside a "box" (object container).

So in the above snippet, just for the moment that `.toString` is being accessed on the `42` value, JS will box this value into a `Number` object, and then perform the property access.

Note that `null` and `undefined` can be object-ified, by calling `Object(null)` / `Object(undefined)`. However, JS does not automatically box these null'ish values, so property access against them will fail (as discussed earlier in the "Conditional Property Access" section).

| NOTE: |
| :--- |
| Boxing has a counterpart: unboxing. For example, the JS engine will take an object wrapper -- like a `Number` object wrapped around `42` -- created with `Number(42)` or `Object(42)` -- and unwrap it to retrieve the underlying primitive `42`, whenever a mathematical operation (like `*` or `-`) encounters such an object. Unboxing behavior is way out of scope for our discussion, but is covered fully in the aforementioned "Types & Grammar" title. |