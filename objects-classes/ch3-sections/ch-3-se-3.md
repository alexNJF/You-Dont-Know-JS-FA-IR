# Class Instance `this`

We will cover the `this` keyword in much more detail in a subsequent chapter. But as it relates to class-oriented code, the `this` keyword generally refers to the current instance that is the context of any method invocation.

In the constructor, as well as any methods, you can use `this.` to either add or access properties on the current instance:

```js
class Point2d {
    constructor(x,y) {
        // add properties to the current instance
        this.x = x;
        this.y = y;
    }
    toString() {
        // access the properties from the current instance
        console.log(`(${this.x},${this.y})`);
    }
}

var point = new Point2d(3,4);

point.x;                // 3
point.y;                // 4

point.toString();       // (3,4)
```

Any properties not holding function values, which are added to a class instance (usually via the constructor), are referred to as *members*, as opposed to the term *methods* for executable functions.

While the `point.toString()` method is running, its `this` reference is pointing at the same object that `point` references. That's why both `point.x` and `this.x` reveal the same `3` value that the constructor set with its `this.x = x` operation.

### Public Fields

Instead of defining a class instance member imperatively via `this.` in the constructor or a method, classes can declaratively define *fields* in the `class` body, which correspond directly to members that will be created on each instance:

```js
class Point2d {
    // these are public fields
    x = 0
    y = 0

    constructor(x,y) {
        // set properties (fields) on the current instance
        this.x = x;
        this.y = y;
    }
    toString() {
        // access the properties from the current instance
        console.log(`(${this.x},${this.y})`);
    }
}
```

Public fields can have a value initialization, as shown above, but that's not required. If you don't initialize a field in the class definition, you almost always should initialize it in the constructor.

Fields can also reference each other, via natural `this.` access syntax:

```js
class Point3d {
    // these are public fields
    x
    y = 4
    z = this.y * 5

    // ..
}
```

| TIP: |
| :--- |
| You can mostly think of public field declarations as if they appear at the top of the `constructor(..)`, each prefixed with an implied `this.` that you get to omit in the declarative `class` body form. But, there's a catch! See "That's Super!" later for more information about it. |

Just like computed property names (see Chapter 1), field names can be computed:

```js
var coordName = "x";

class Point2d {
    // computed public field
    [coordName.toUpperCase()] = 42

    // ..
}

var point = new Point2d(3,4);

point.x;        // 3
point.y;        // 4

point.X;        // 42
```

#### Avoid This

One pattern that has emerged and grown quite popular, but which I firmly believe is an anti-pattern for `class`, looks like the following:

```js
class Point2d {
    x = null
    y = null
    getDoubleX = () => this.x * 2

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    toString() { /* .. */ }
}

var point = new Point2d(3,4);

point.getDoubleX();    // 6
```

See the field holding an `=>` arrow function? I say this is a no-no. But why? Let's unwind what's going on.

First, why do this? Because JS developers seem to be perpetually frustrated by the dynamic `this` binding rules (see Chapter 4), so they force a `this` binding via the `=>` arrow function. That way, no matter how `getDoubleX()` is invoked, it's always `this`-bound to the particular instance. That's an understandable convenience to desire, but... it betrays the very nature of the `this` / `[[Prototype]]` pillar of the language. How?

Let's consider the equivalent code to the previous snippet:

```js
class Point2d {
    constructor(x,y) {
        this.x = null;
        this.y = null;
        this.getDoubleX = () => this.x * 2;

        this.x = x;
        this.y = y;
    }
    toString() { /* .. */ }
}

var point = new Point2d(3,4);

point.getDoubleX();    // 6
```

Can you spot the problem? Look closely. I'll wait.

...

We've made it clear repeatedly so far that `class` definitions put their methods on the class constructor's `prototype` object -- that's where they belong! -- such that there's just one of each function and it's inherited (shared) by all instances. That's what will happen with `toString()` in the above snippet.

But what about `getDoubleX()`? That's essentially a class method, but it won't be handled by JS quite the same as `toString()` will. Consider:

```js
Object.hasOwn(point,"x");               // true -- good
Object.hasOwn(point,"toString");        // false -- good
Object.hasOwn(point,"getDoubleX");      // true -- oops :(
```

You see now? By defining a function value and attaching it as a field/member property, we're losing the shared prototypal method'ness of the function, and it becomes just like any per-instance property. That means we're creating a new function property **for each instance**, rather than it being created just once on the class constructor's `prototype`.

That's wasteful in performance and memory, even if by a tiny bit. That alone should be enough to avoid it.

But I would argue that way more importantly, what you've done with this pattern is invalidate the very reason why using `class` and `this`-aware methods is even remotely useful/powerful!

If you go to all the trouble to define class methods with `this.` references throughout them, but then you lock/bind most or all of those methods to a specific object instance, you've basically travelled all the way around the world just to go next door.

If all you want are function(s) that are statically fixed to a particular "context", and don't need any dynamicism or sharing, what you want is... **closure**. And you're in luck: I wrote a whole book in this series ("Scope & Closures") on how to use closure so functions remember/access their statically defined scope (aka "context"). That's a way more appropriate, and simpler to code, approach to get what you're after.

Don't abuse/misuse `class` and turn it into a over-hyped, glorified collection of closure.

To be clear, I'm *not* saying: never use `=>` arrow functions inside classes.

I *am* saying: never attach an `=>` arrow function as an instance property in place of a dynamic prototypal class method, either out of mindless habit, or laziness in typing fewer characters, or misguided `this`-binding convenience.

In a subsequent chapter, we'll dive deep into how to understand and properly leverage the full power of the dynamic `this` mechanism.