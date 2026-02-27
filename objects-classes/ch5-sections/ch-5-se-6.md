# Why *This*?

OK, so it's hopefully clear that the delegation pattern leans heavily on implicit input, sharing context via `this` rather than through an explicit parameter.

You might rightly ask, why not just always pass around that context explicitly? We can certainly do so, but... to manually pass along the necessary context, we'll have to change pretty much every single function signature, and any corresponding call-sites.

Let's revisit the earlier `ControlPoint` delegation example, and implement it without any delegation-oriented `this` context sharing. Pay careful attention to the differences:

```js
var Canvas = {
    setOrigin(ctx,x,y) {
        ctx.translate(x,y);
        ctx.scale(1,-1);
    },
    pixel(ctx,x,y) {
        ctx.fillRect(x,y,1,1);
    },
    renderScene(ctx,entity) {
        // clear the canvas
        var matrix = ctx.getTransform();
        ctx.resetTransform();
        ctx.clearRect(
            0, 0,
            ctx.canvas.width,
            ctx.canvas.height
        );
        ctx.setTransform(matrix);

        entity.draw();
    },
};

var Coordinates = {
    setX(entity,x) {
        entity.x = Math.round(x);
    },
    setY(entity,y) {
        entity.y = Math.round(y);
    },
    setXY(entity,x,y) {
        this.setX(entity,x);
        this.setY(entity,y);
        entity.render();
    },
};

var ControlPoint = {
    // NOTE: must have a <canvas id="my-canvas">
    // element in the DOM
    ctx: document.getElementById("my-canvas")
        .getContext("2d"),

    setXY(x,y) {
        Coordinates.setXY(this,x,y);
    },
    rotate(angleRadians) {
        var rotatedX = this.x * Math.cos(angleRadians) -
            this.y * Math.sin(angleRadians);
        var rotatedY = this.x * Math.sin(angleRadians) +
            this.y * Math.cos(angleRadians);
        this.setXY(rotatedX,rotatedY);
    },
    draw() {
        // plot the point
        Canvas.pixel(this.ctx,this.x,this.y);
    },
    render() {
        // clear the canvas, and re-render
        // our control-point
        Canvas.renderScene(this.ctx,this);
    },
};

// set the logical (0,0) origin at this
// physical location on the canvas
Canvas.setOrigin(ControlPoint.ctx,100,100);

// ..
```

To be honest, some of you may prefer that style of code. And that's OK if you're in that camp. This snippet avoids `[[Prototype]]` entirely, and only relies on far fewer basic `this.`-style references to properties and methods.

By contrast, the delegation style I'm advocating for in this chapter is unfamiliar and uses `[[Prototype]]` and `this` sharing in ways you're not likely familiar with. To use such a style effectively, you'll have to invest the time and practice to build a deeper familiarity.

But in my opinion, the "cost" of avoiding virtual composition through delegation can be felt across all the function signatures and call-sites; I find them way more cluttered. That explicit context passing is quite a tax.

In fact, I'd never advocate that style of code at all. If you want to avoid delegation, it's probably best to just stick to `class` style code, as seen in Chapter 3. As an exercise left to the reader, try to convert the earlier `ControlPoint` / `GuideLine` code snippets to use `class`.

[^TreatyOfOrlando]: "Treaty of Orlando"; Henry Lieberman, Lynn Andrea Stein, David Ungar; Oct 6, 1987; https://web.media.mit.edu/~lieber/Publications/Treaty-of-Orlando-Treaty-Text.pdf ; PDF; Accessed July 2022

[^ClassVsPrototype]: "Classes vs. Prototypes, Some Philosophical and Historical Observations"; Antero Taivalsaari; Apr 22, 1996; https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.56.4713&rep=rep1&type=pdf ; PDF; Accessed July 2022