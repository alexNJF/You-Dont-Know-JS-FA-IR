# Private Class Behavior

Everything we've discussed so far as part of a `class` definition is publicly visible/accessible, either as static properties/functions on the class, methods on the constructor's `prototype`, or member properties on the instance.

But how do you store information that cannot be seen from outside the class? This was one of the most asked for features, and biggest complaints with JS's `class`, up until it was finally addressed in ES2022.

`class` now supports new syntax for declaring private fields (instance members) and private methods. In addition, private static properties/functions are possible.

### Motivation?

Before we illustrate how to do `class` privates, it bears contemplating why this is a helpful feature?

With closure-oriented design patterns (again, see the "Scope & Closures" book of this series), we automatically get "privacy" built-in. When you declare a variable inside a scope, it cannot be seen outside that scope. Period. Reducing the scope visibility of a declaration is helpful in preventing namespace collisions (identical variable names).

But it's even more important to ensure proper "defensive" design of software, the so called "Principle of Least Privilege" [^POLP]. POLP states that we should only expose a piece of information or capability in our software to the smallest surface area necessary.

Over-exposure opens our software up to several issues that complicate software security/maintenance, including another piece of code acting maliciously to do something our code didn't expect or intend. Moreover, there's the less critical but still as problematic concern of other parts of our software relying on (using) parts of our code that we should have reserved as hidden implementation detail. Once other code relies on our code's implementation details, we stop being able to refactor our code without potentially breaking other parts of the program.

So, in short, we *should* hide implementation details if they're not necessary to be exposed. In this sense, JS's `class` system feels a bit too permissive in that everything defaults to being public. Class-private features are a welcomed addition to more proper software design.

#### Too Private?

All that said, I have to throw a bit of a damper on the class-private party.

I've suggested strongly that you should only use `class` if you're going to really take advantage of most or all of what class-orientation gives you. Otherwise, you'd be better suited using other core pillar features of JS for organizing code, such as with the closure pattern.

One of the most important aspects of class-orientation is subclass inheritance, as we've seen illustrated numerous times so far in this chapter. Guess what happens to a private member/method in a base class, when it's extended by a subclass?

Private members/methods are private **only to the class they're defined in**, and are **not** inherited in any way by a subclass. Uh oh.

That might not seem like too big of a concern, until you start working with `class` and private members/methods in real software. You might quickly run up against a situation where you need to access a private method, or more often even, just a private member, from the subclass, so that the subclass can extend/augment the behavior of the base class as desired. And you might scream in frustration pretty quickly once you realize this is not possible.

What comes next is inevitably an awkward decision: do you just go back to making it public, so the subclass can access it? Ugh. Or, worse, do you try to re-design the base class to contort the design of its members/methods, such that the lack of access is partially worked around. That often involves exhausting over-parameterization (with privates as default parameter values) of methods, and other such tricks. Double ugh.

There's not a particularly great answer here, to be honest. If you have experience with class-orientation in more traditional class languages like Java or C++, you're probably dubious as to why we don't have *protected* visibility in between *public* and *private*. That's exactly what *protected* is for: keeping something private to a class AND any of its subclasses. Those languages also have *friend* features, but that's beyond the scope of our discussion here.

Sadly, not only does JS not have *protected* visibility, it seems (even as useful as it is!) to be unlikely as a JS feature. It's been discussed in great detail for over a decade (before ES6 was even a thing), and there've been multiple proposals for it.

I shouldn't say it will *never* happen, because that's not solid ground to stake on in any software. But it's very unlikely, because it actually betrays the very pillar that `class` is built on. If you are curious, or (more likely) certain that there's just *got to be a way*, I'll cover the incompatibility of *protected* visibility within JS's mechanisms in an appendix.

The point here is, as of now, JS has no *protected* visibility, and it won't any time soon. And *protected* visibility is actually, in practice, way more useful than *private* visibility.

So we return to the question: **Why should you care to make any `class` contents private?**

If I'm being honest: maybe you shouldn't. Or maybe you should. That's up to you. Just go into it aware of the stumbling blocks.

### Private Members/Methods

You're excited to finally see the syntax for magical *private* visibility, right? Please don't shoot the messenger if you feel angered or sad at what you're about to see.

```js
class Point2d {
    // statics
    static samePoint(point1,point2) {
        return point1.#ID === point2.#ID;
    }

    // privates
    #ID = null
    #assignID() {
        this.#ID = Math.round(Math.random() * 1e9);
    }

    // publics
    x
    y
    constructor(x,y) {
        this.#assignID();
        this.x = x;
        this.y = y;
    }
}

var one = new Point2d(3,4);
var two = new Point2d(3,4);

Point2d.samePoint(one,two);         // false
Point2d.samePoint(one,one);         // true
```

No, JS didn't do the sensible thing and introduce a `private` keyword like they did with `static`. Instead, they introduced the `#`. (insert lame joke about social-media millienials loving hashtags, or something)

| TIP: |
| :--- |
| And yes, there's a million and one discussions about why not. I could spend chapters recounting the whole history, but honestly I just don't care to. I think this syntax is ugly, and many others do, too. And some love it! If you're in the latter camp, though I rarely do something like this, I'm just going to say: **just accept it**. It's too late for any more debate or pleading. |

The `#whatever` syntax (including `this.#whatever` form) is only valid inside `class` bodies. It will throw syntax errors if used outside of a `class`.

Unlike public fields/instance members, private fields/instance members *must* be declared in the `class` body. You cannot add a private member to a class declaration dynamically while in the constructor method; `this.#whatever = ..` type assignments only work if the `#whatever` private field is declared in the class body. Moreover, though private fields can be re-assigned, they cannot be `delete`d from an instance, the way a public field/class member can.

#### Subclassing + Privates

I warned earlier that subclassing with classes that have private members/methods can be a limiting trap. But that doesn't mean they cannot be used together.

Because "inheritance" in JS is sharing (through the `[[Prototype]]` chain), if you invoke an inherited method in a subclass, and that inherited method in turn accesses/invokes privates in its host (base) class, this works fine:

```js
class Point2d { /* .. */ }

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
}

var one = new Point3d(3,4,5);
```

The `super(x,y)` call in this constructor invokes the inherited base class constructor (`Point2d(..)`), which itself accesses `Point2d`'s private method `#assignID()` (see the earlier snippet). No exception is thrown, even though `Point3d` cannot directly see or access the `#ID` / `#assignID()` privates that are indeed stored on the instance (named `one` here).

In fact, even the inherited `static samePoint(..)` function will work from either `Point3d` or `Point2d`:

```js
Point2d.samePoint(one,one);         // true
Point3d.samePoint(one,one);         // true
```

Actually, that shouldn't be that surprising, since:

```js
Point2d.samePoint === Point3d.samePoint;
```

The inherited function reference is *the exact same function* as the base function reference; it's not some copy of the function. Because the function in question has no `this` reference in it, no matter from where it's invoked, it should produce the same outcome.

It's still a shame though that `Point3d` has no way to access/influence, or indeed even knowledge of, the `#ID` / `#assignID()` privates from `Point2d`:

```js
class Point2d { /* .. */ }

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;

        console.log(this.#ID);      // will throw!
    }
}
```

| WARNING: |
| :--- |
| Notice that this snippet throws an early static syntax error at the time of defining the `Point3d` class, before ever even getting a chance to create an instance of the class. The same exception would be thrown if the reference was `super.#ID` instead of `this.#ID`. |

#### Existence Check

Keep in mind that only the `class` itself knows about, and can therefore check for, such a private field/method.

You may want to check to see if a private field/method exists on an object instance. For example (as shown below), you may have a static function or method in a class, which receives an external object reference passed in. To check to see if the passed-in object reference is of this same class (and therefore has the same private members/methods in it), you basically need to do a "brand check" against the object.

Such a check could be rather convoluted, because if you access a private field that doesn't already exist on the object, you get a JS exception thrown, requiring ugly `try..catch` logic.

But there's a cleaner approach, so called an "ergonomic brand check", using the `in` keyword:

```js
class Point2d {
    // statics
    static samePoint(point1,point2) {
        // "ergonomic brand checks"
        if (#ID in point1 && #ID in point2) {
            return point1.#ID === point2.#ID;
        }
        return false;
    }

    // privates
    #ID = null
    #assignID() {
        this.#ID = Math.round(Math.random() * 1e9);
    }

    // publics
    x
    y
    constructor(x,y) {
        this.#assignID();
        this.x = x;
        this.y = y;
    }
}

var one = new Point2d(3,4);
var two = new Point2d(3,4);

Point2d.samePoint(one,two);         // false
Point2d.samePoint(one,one);         // true
```

The `#privateField in someObject` check will not throw an exception if the field isn't found, so it's safe to use without `try..catch` and use its simple boolean result.

#### Exfiltration

Even though a member/method may be declared with *private* visibility, it can still be exfiltrated (extracted) from a class instance:

```js
var id, func;

class Point2d {
    // privates
    #ID = null
    #assignID() {
        this.#ID = Math.round(Math.random() * 1e9);
    }

    // publics
    x
    y
    constructor(x,y) {
        this.#assignID();
        this.x = x;
        this.y = y;

        // exfiltration
        id = this.#ID;
        func = this.#assignID;
    }
}

var point = new Point2d(3,4);

id;                     // 7392851012 (...for example)

func;                   // function #assignID() { .. }
func.call(point,42);

func.call({},100);
// TypeError: Cannot write private member #ID to an
// object whose class did not declare it
```

The main concern here is to be careful when passing private methods as callbacks (or in any way exposing privates to other parts of the program). There's nothing stopping you from doing so, which can create a bit of an unintended privacy disclosure.

### Private Statics

Static properties and functions can also use `#` to be marked as private:

```js
class Point2d {
    static #errorMsg = "Out of bounds."
    static #printError() {
        console.log(`Error: ${this.#errorMsg}`);
    }

    // publics
    x
    y
    constructor(x,y) {
        if (x > 100 || y > 100) {
            Point2d.#printError();
        }
        this.x = x;
        this.y = y;
    }
}

var one = new Point2d(30,400);
// Error: Out of bounds.
```

The `#printError()` static private function here has a `this`, but that's referencing the `Point2d` class, not an instance. As such, the `#errorMsg` and `#printError()` are independent of instances and thus are best as statics. Moreover, there's no reason for them to be accessible outside the class, so they're marked private.

Remember: private statics are similarly not-inherited by subclasses just as private members/methods are not.

#### Gotcha: Subclassing With Static Privates and `this`

Recall that inherited methods, invoked from a subclass, have no trouble accessing (via `this.#whatever` style references) any privates from their own base class:

```js
class Point2d {
    // ..

    getID() {
        return this.#ID;
    }

    // ..
}

class Point3d extends Point2d {
    // ..

    printID() {
        console.log(`ID: ${this.getID()}`);
    }
}

var point = new Point3d(3,4,5);
point.printID();
// ID: ..
```

That works just fine.

Unfortunately, and (to me) quite unexpectedly/inconsistently, the same is not true of private statics accessed from inherited public static functions:

```js
class Point2d {
    static #errorMsg = "Out of bounds."
    static printError() {
        console.log(`Error: ${this.#errorMsg}`);
    }

    // ..
}

class Point3d extends Point2d {
    // ..
}

Point2d.printError();
// Error: Out of bounds.

Point3d.printError === Point2d.printError;
// true

Point3d.printError();
// TypeError: Cannot read private member #errorMsg
// from an object whose class did not declare it
```

The `printError()` static is inherited (shared via `[[Prototype]]`) from `Point2d` to `Point3d` just fine, which is why the function references are identical. Like the non-static snippet just above, you might have expected the `Point3d.printError()` static invocation to resolve via the `[[Prototype]]` chain to its original base class (`Point2d`) location, thereby letting it access the base class's `#errorMsg` static private.

But it fails, as shown by the last statement in that snippet. The reason it fails here, but not with the previous snippet, is a convoluted brain twister. I'm not going to dig into the *why* explanation here, frankly because it boils my blood to do so.

There's a *fix*, though. In the static function, instead of `this.#errorMsg`, swap that for `Point2d.#errorMsg`, and now it works:

```js
class Point2d {
    static #errorMsg = "Out of bounds."
    static printError() {
        // the fixed reference vvvvvv
        console.log(`Error: ${Point2d.#errorMsg}`);
    }

    // ..
}

class Point3d extends Point2d {
    // ..
}

Point2d.printError();
// Error: Out of bounds.

Point3d.printError();
// Error: Out of bounds.  <-- phew, it works now!
```

If public static functions are being inherited, use the class name to access any private statics instead of using `this.` references. Beware that gotcha!