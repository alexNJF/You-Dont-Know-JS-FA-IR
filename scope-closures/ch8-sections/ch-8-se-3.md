# Node CommonJS Modules

In Chapter 4, we introduced the CommonJS module format used by Node. Unlike the classic module format described earlier, where you could bundle the module factory or IIFE alongside any other code including other modules, CommonJS modules are file-based; one module per file.

Let's tweak our module example to adhere to that format:

```js
module.exports.getName = getName;

// ************************

var records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
];

function getName(studentID) {
    var student = records.find(
        student => student.id == studentID
    );
    return student.name;
}
```

The `records` and `getName` identifiers are in the top-level scope of this module, but that's not the global scope (as explained in Chapter 4). As such, everything here is *by default* private to the module.

To expose something on the public API of a CommonJS module, you add a property to the empty object provided as `module.exports`. In some older legacy code, you may run across references to just a bare `exports`, but for code clarity you should always fully qualify that reference with the `module.` prefix.

For style purposes, I like to put my "exports" at the top and my module implementation at the bottom. But these exports can be placed anywhere. I strongly recommend collecting them all together, either at the top or bottom of your file.

Some developers have the habit of replacing the default exports object, like this:

```js
// defining a new object for the API
module.exports = {
    // ..exports..
};
```

There are some quirks with this approach, including unexpected behavior if multiple such modules circularly depend on each other. As such, I recommend against replacing the object. If you want to assign multiple exports at once, using object literal style definition, you can do this instead:

```js
Object.assign(module.exports,{
   // .. exports ..
});
```

What's happening here is defining the `{ .. }` object literal with your module's public API specified, and then `Object.assign(..)` is performing a shallow copy of all those properties onto the existing `module.exports` object, instead of replacing it This is a nice balance of convenience and safer module behavior.

To include another module instance into your module/program, use Node's `require(..)` method. Assuming this module is located at "/path/to/student.js", this is how we can access it:

```js
var Student = require("/path/to/student.js");

Student.getName(73);
// Suzy
```

`Student` now references the public API of our example module.

CommonJS modules behave as singleton instances, similar to the IIFE module definition style presented before. No matter how many times you `require(..)` the same module, you just get additional references to the single shared module instance.

`require(..)` is an all-or-nothing mechanism; it includes a reference of the entire exposed public API of the module. To effectively access only part of the API, the typical approach looks like this:

```js
var getName = require("/path/to/student.js").getName;

// or alternately:

var { getName } = require("/path/to/student.js");
```

Similar to the classic module format, the publicly exported methods of a CommonJS module's API hold closures over the internal module details. That's how the module singleton state is maintained across the lifetime of your program.

| NOTE: |
| :--- |
| In Node `require("student")` statements, non-absolute paths (`"student"`) assume a ".js" file extension and search "node_modules". |