# Composing Peer Objects

Let's take *this delegation* even further.

In the preceding snippet, `point` and `anotherPoint` merely held data, and the behaviors they delegated to were on other objects (`Coordinates` and `Inspect`). But we can add behaviors directly to any of the objects in a delegation chain, and those behaviors can even interact with each other, all through the magic of *virtual composition* (`this` context sharing).

To illustrate, we'll evolve our current *point* example a fair bit. And as a bonus we'll actually draw our points on a `<canvas>` element in the DOM. Let's take a look:

```js
var Canvas = {
    setOrigin(x,y) {
        this.ctx.translate(x,y);

        // flip the canvas context vertically,
        // so coordinates work like on a normal
        // 2d (x,y) graph
        this.ctx.scale(1,-1);
    },
    pixel(x,y) {
        this.ctx.fillRect(x,y,1,1);
    },
    renderScene() {
        // clear the canvas
        var matrix = this.ctx.getTransform();
        this.ctx.resetTransform();
        this.ctx.clearRect(
            0, 0,
            this.ctx.canvas.width,
            this.ctx.canvas.height
        );
        this.ctx.setTransform(matrix);

        this.draw();  // <-- where is draw()?
    },
};

var Coordinates = {
    setX(x) {
        this.x = Math.round(x);
    },
    setY(y) {
        this.y = Math.round(y);
    },
    setXY(x,y) {
        this.setX(x);
        this.setY(y);
        this.render();   // <-- where is render()?
    },
};

var ControlPoint = {
    // delegate to Coordinates
    __proto__: Coordinates,

    // NOTE: must have a <canvas id="my-canvas">
    // element in the DOM
    ctx: document.getElementById("my-canvas")
        .getContext("2d"),

    rotate(angleRadians) {
        var rotatedX = this.x * Math.cos(angleRadians) -
            this.y * Math.sin(angleRadians);
        var rotatedY = this.x * Math.sin(angleRadians) +
            this.y * Math.cos(angleRadians);
        this.setXY(rotatedX,rotatedY);
    },
    draw() {
        // plot the point
        Canvas.pixel.call(this,this.x,this.y);
    },
    render() {
        // clear the canvas, and re-render
        // our control-point
        Canvas.renderScene.call(this);
    },
};

// set the logical (0,0) origin at this
// physical location on the canvas
Canvas.setOrigin.call(ControlPoint,100,100);

ControlPoint.setXY(30,40);
// [renders point (30,40) on the canvas]

// ..
// later:

// rotate the point about the (0,0) origin
// 90 degrees counter-clockwise
ControlPoint.rotate(Math.PI / 2);
// [renders point (-40,30) on the canvas]
```

OK, that's a lot of code to digest. Take your time and re-read the snippet several times. I added a couple of new concrete objects (`Canvas` and `ControlPoint`) alongside the previous `Coordinates` object.

Make sure you see and understand the interactions between these three concrete objects.

`ControlPoint` is linked (via `__proto__`) to *implicitly delegate* (`[[Prototype]]` chain) to `Coordinates`.

Here's an *explicit delegation*: `Canvas.setOrigin.call(ControlPoint,100,100);`; I'm invoking the `Canvas.setOrigin(..)` call in the context of `ControlPoint`. That has the effect of sharing `ctx` with `setOrigin(..)`, via `this`.

`ControlPoint.setXY(..)` delegates *implicitly* to `Coordinates.setXY(..)`, but still in the context of `ControlPoint`. Here's a key detail that's easy to miss: see the `this.render()` inside of `Coordinates.setXY(..)`? Where does that come from? Since the `this` context is `ControlPoint` (not `Coordinates`), it's invoking `ControlPoint.render()`.

`ControlPoint.render()` *explicitly delegates* to `Canvas.renderScene()`, again still in the `ControlPoint` context. `renderScene()` calls `this.draw()`, but where does that come from? Yep, still from `ControlPoint` (via `this` context).

And `ControlPoint.draw()`? It *explicitly delegates* to `Canvas.pixel(..)`, yet again still in the `ControlPoint` context.

All three objects have methods that end up invoking each other. But these calls aren't particularly hard-wired. `Canvas.renderScene()` doesn't call `ControlPoint.draw()`, it calls `this.draw()`. That's important, because it means that `Canvas.renderScene()` is more flexible to use in a different `this` context -- e.g., against another kind of *point* object besides `ControlPoint`.

It's through the `this` context, and the `[[Prototype]]` chain, that these three objects basically are mixed (composed) virtually together, as needed at each step, so that they work together **as if they're one object rather than three seperate objects**.

That's the *beauty* of virtual composition as realized by the delegation pattern in JS.

### Flexible Context

I mentioned above that we can pretty easily add other concrete objects into the mix. Here's an example:

```js
var Coordinates = { /* .. */ };

var Canvas = {
    /* .. */
    line(start,end) {
        this.ctx.beginPath();
        this.ctx.moveTo(start.x,start.y);
        this.ctx.lineTo(end.x,end.y);
        this.ctx.stroke();
    },
};

function lineAnchor(x,y) {
    var anchor = {
        __proto__: Coordinates,
        render() {},
    };
    anchor.setXY(x,y);
    return anchor;
}

var GuideLine = {
    // NOTE: must have a <canvas id="my-canvas">
    // element in the DOM
    ctx: document.getElementById("my-canvas")
        .getContext("2d"),

    setAnchors(sx,sy,ex,ey) {
        this.start = lineAnchor(sx,sy);
        this.end = lineAnchor(ex,ey);
        this.render();
    },
    draw() {
        // plot the point
        Canvas.line.call(this,this.start,this.end);
    },
    render() {
        // clear the canvas, and re-render
        // our line
        Canvas.renderScene.call(this);
    },
};

// set the logical (0,0) origin at this
// physical location on the canvas
Canvas.setOrigin.call(GuideLine,100,100);

GuideLine.setAnchors(-30,65,45,-17);
// [renders line from (-30,65) to (45,-17)
//   on the canvas]
```

That's pretty nice, I think!

But I think another less-obvious benefit is that having objects linked dynamically via `this` context tends to make testing different parts of the program independently, somewhat easier.

For example, `Object.setPrototypeOf(..)` can be used to dynamically change the `[[Prototype]]` linkage of an object, delegating it to a different object such as a mock object. Or you could dynamically redefine `GuideLine.draw()` and `GuideLine.render()` to *explicitly delegate* to a `MockCanvas` instead of `Canvas`.

The `this` keyword, and the `[[Prototype]]` link, are a tremendously flexible mechanism when you understand and leverage them fully.