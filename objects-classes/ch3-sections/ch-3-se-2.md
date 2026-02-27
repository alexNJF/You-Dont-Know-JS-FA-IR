# Keep It `class`y

`class` defines either a declaration or expression for a class. As a declaration, a class definition appears in a statement position and looks like this:

```js
class Point2d {
    // ..
}
```

As an expression, a class definition appears in a value position and can either have a name or be anonymous:

```js
// named class expression
const pointClass = class Point2d {
    // ..
};

// anonymous class expression
const anotherClass = class {
    // ..
};
```

The contents of a `class` body typically include one or more method definitions:

```js
class Point2d {
    setX(x) {
        // ..
    }
    setY(y) {
        // ..
    }
}
```

Inside a `class` body, methods are defined without the `function` keyword, and there's no `,` or `;` separators between the method definitions.

| NOTE: |
| :--- |
| Inside a `class` block, all code runs in strict-mode even without the `"use strict"` pragma present in the file or its functions. In particular, this impacts the `this` behavior for function calls, as explained in Chapter 4. |

### The Constructor

One special method that all classes have is called a "constructor". If omitted, there's a default empty constructor assumed in the definition.

The constructor is invoked any time a `new` instance of the class is created:

```js
class Point2d {
    constructor() {
        console.log("Here's your new instance!");
    }
}

var point = new Point2d();
// Here's your new instance!
```

Even though the syntax implies a function actually named `constructor` exists, JS defines a function as specified, but with the name of the class (`Point2d` above):

```js
typeof Point2d;       // "function"
```

It's not *just* a regular function, though; this special kind of function behaves a bit differently:

```js
Point2d.toString();
// class Point2d {
//   ..
// }

Point2d();
// TypeError: Class constructor Point2d cannot
// be invoked without 'new'

Point2d.call({});
// TypeError: Class constructor Point2d cannot
// be invoked without 'new'
```

You can construct as many different instances of a class as you need:

```js
var one = new Point2d();
var two = new Point2d();
var three = new Point2d();
```

Each of `one`, `two`, and `three` here are objects that are independent instances of the `Point2d` class.

| NOTE: |
| :--- |
| Each of the `one`, `two`, and `three` objects have a `[[Prototype]]` linkage to the `Point2d.prototype` object (see Chapter 2). In this code, `Point2d` is both a `class` definition and the constructor function of the same name. |

If you add a property to the object `one`:

```js
one.value = 42;
```

That property now exists only on `one`, and does not exist in any way that the independent `two` or `three` objects can access:

```js
two.value;      // undefined
three.value;    // undefined
```

### Class Methods

As shown above, a class definition can include one or more method definitions:

```js
class Point2d {
    constructor() {
        console.log("Here's your new instance!");
    }
    setX(x) {
        console.log(`Setting x to: ${x}`);
        // ..
    }
}

var point = new Point2d();

point.setX(3);
// Setting x to: 3
```

The `setX` property (method) *looks like* it exists on (is owned by) the `point` object here. But that's a mirage. Each class method is added to the `prototype`object, a property of the constructor function.

So, `setX(..)` only exists as `Point2d.prototype.setX`. Since `point` is `[[Prototype]]` linked to `Point2d.prototype` (see Chapter 2) via the `new` keyword instantiation, the `point.setX(..)` reference traverses the `[[Prototype]]` chain and finds the method to execute.

Class methods should only be invoked via an instance; `Point2d.setX(..)` doesn't work because there *is no* such property. You *could* invoke `Point2d.prototype.setX(..)`, but that's not generally proper/advised in standard class-oriented coding. Always access class methods via the instances.