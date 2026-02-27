# Delegation Illustrated

So what is delegation about? At its core, it's about two or more *things* sharing the effort of completing a task.

Instead of defining a `Point2d` general parent *thing* that represents shared behavior that a set of one or more child `point` / `anotherPoint` *things* inherit from, delegation moves us to building our program with discrete peer *things* that cooperate with each other.

I'll sketch that out in some code:

```js
var Coordinates = {
    setX(x) {
        this.x = x;
    },
    setY(y) {
        this.y = y;
    },
    setXY(x,y) {
        this.setX(x);
        this.setY(y);
    },
};

var Inspect = {
    toString() {
        return `(${this.x},${this.y})`;
    },
};

var point = {};

Coordinates.setXY.call(point,3,4);
Inspect.toString.call(point);         // (3,4)

var anotherPoint = Object.create(Coordinates);

anotherPoint.setXY(5,6);
Inspect.toString.call(anotherPoint);  // (5,6)
```

Let's break down what's happening here.

I've defined `Coordinates` as a concrete object that holds some behaviors I associate with setting point coordinates (`x` and `y`). I've also defined `Inspect` as a concrete object that holds some debug inspection logic, such as `toString()`.

I then create two more concrete objects, `point` and `anotherPoint`.

`point` has no specific `[[Prototype]]` (default: `Object.prototype`). Using *explicit context* assignment (see Chapter 4), I invoke the `Coordinates.setXY(..)` and `Inspect.toString()` utilities in the context of `point`. That is what I call *explicit delegation*.

`anotherPoint` is `[[Prototype]]` linked to `Coordinates`, mostly for a bit of convenience. That lets me use *implicit context* assignment with `anotherPoint.setXY(..)`. But I can still *explicitly* share `anotherPoint` as context for the `Inspect.toString()` call. That's what I call *implicit delegation*.

**Don't miss *this*:** We still accomplished composition: we composed the behaviors from `Coordinates` and `Inspect`, during runtime function invocations with `this` context sharing. We didn't have to author-combine those behaviors into a single `class` (or base-subclass `class` hierarchy) for `point` / `anotherPoint` to inherit from. I like to call this runtime composition, **virtual composition**.

The *point* here is: none of these four objects is a parent or child. They're all peers of each other, and they all have different purposes. We can organize our behavior in logical chunks (on each respective object), and share the context via `this` (and, optionally `[[Prototype]]` linkage), which ends up with the same composition outcomes as the other patterns we've examined thus far in the book.

*That* is the heart of the **delegation** pattern, as JS embodies it.

| TIP: |
| :--- |
| In the first edition of this book series, this book ("this & Object Prototypes") coined a term, "OLOO", which stands for "Objects Linked to Other Objects" -- to stand in contrast to "OO" ("Object Oriented"). In this preceding example, you can see the essence of OLOO: all we have are objects, linked to and cooperating with, other objects. I find this beautiful in its simplicity. |