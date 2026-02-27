# ترکیب اشیاء هم‌رده

بیایید *این delegation* را حتی بیشتر ببریم.

در snippet قبلی، `point` و `anotherPoint` صرفاً داده نگه می‌داشتند، و رفتارهایی که به آن‌ها delegate می‌کردند روی اشیاء دیگر (`Coordinates` و `Inspect`) بودند. اما می‌توانیم رفتارها را مستقیماً به هر کدام از اشیاء در زنجیرهٔ delegation اضافه کنیم، و آن رفتارها حتی می‌توانند از طریق جادوی *ترکیب مجازی* (اشتراک context `this`) با هم تعامل کنند.

برای تصویرسازی، مثال *point* فعلی را کمی تکامل می‌دهیم. و به‌عنوان bonus واقعاً نقطه‌هایمان را روی المان `<canvas>` در DOM رسم می‌کنیم. بیایید ببینیم:

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

خب، کد زیادی برای هضم است. وقت بگذارید و چند بار snippet را دوباره بخوانید. دو شیء عینی جدید (`Canvas` و `ControlPoint`) alongside شیء قبلی `Coordinates` اضافه کردم.

مطمئن شوید تعاملات بین این سه شیء عینی را می‌بینید و می‌فهمید.

`ControlPoint` (از طریق `__proto__`) به `Coordinates` link شده تا *ضمنی delegate* کند (زنجیرهٔ `[[Prototype]]`).

اینجا *delegation صریح* است: `Canvas.setOrigin.call(ControlPoint,100,100)`؛ فراخوانی `Canvas.setOrigin(..)` را در context مربوط به `ControlPoint` انجام می‌دهم. این اثر share کردن `ctx` با `setOrigin(..)` از طریق `this` را دارد.

`ControlPoint.setXY(..)` *ضمنی* به `Coordinates.setXY(..)` delegate می‌کند، اما هنوز در context مربوط به `ControlPoint`. جزئیات کلیدی که راحت از دست می‌رود: `this.render()` داخل `Coordinates.setXY(..)` را می‌بینید؟ از کجا می‌آید؟ چون context `this` همان `ControlPoint` است (نه `Coordinates`)، دارد `ControlPoint.render()` را فراخوانی می‌کند.

`ControlPoint.render()` *صریحاً* به `Canvas.renderScene()` delegate می‌کند، دوباره هنوز در context مربوط به `ControlPoint`. `renderScene()` فراخوانی `this.draw()` می‌کند، اما از کجا می‌آید؟ بله، هنوز از `ControlPoint` (از طریق context `this`).

و `ControlPoint.draw()`؟ *صریحاً* به `Canvas.pixel(..)` delegate می‌کند، دوباره هنوز در context مربوط به `ControlPoint`.

هر سه شیء متدهایی دارند که در نهایت همدیگر را فراخوانی می‌کنند. اما این فراخوانی‌ها به‌طور خاص hard-wired نیستند. `Canvas.renderScene()` فراخوانی `ControlPoint.draw()` نمی‌کند، فراخوانی `this.draw()` می‌کند. مهم است، چون یعنی `Canvas.renderScene()` انعطاف‌پذیرتر برای استفاده در context `this` متفاوت است — مثلاً علیه نوع دیگری از شیء *point* غیر از `ControlPoint`.

از طریق context `this` و زنجیرهٔ `[[Prototype]]` است که این سه شیء اساساً به‌طور مجازی با هم mix (ترکیب) می‌شوند، در هر مرحله طبق نیاز، طوری که **انگار یک شیء هستند نه سه شیء جدا** با هم کار می‌کنند.

این *زیبایی* ترکیب مجازی است همان‌طور که الگوی delegation در JS تحقق می‌یابد.

### Context انعطاف‌پذیر

بالا گفتم می‌توانیم به‌راحتی اشیاء عینی دیگر را به mix اضافه کنیم. یک مثال:

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

خیلی خوب است، فکر می‌کنم!

اما فکر می‌کنم مزیت کمتر واضح دیگر این است که داشتن اشیاء link‌شده به‌طور پویا از طریق context `this` تمایل دارد تست کردن بخش‌های مختلف برنامه به‌طور مستقل را تا حدی آسان‌تر کند.

مثلاً، `Object.setPrototypeOf(..)` می‌تواند برای تغییر پویای اتصال `[[Prototype]]` شیء استفاده شود، delegate کردن آن به شیء متفاوتی مثل شیء mock. یا می‌توانید `GuideLine.draw()` و `GuideLine.render()` را به‌طور پویا بازتعریف کنید تا *صریحاً* به `MockCanvas` به‌جای `Canvas` delegate کنند.

کلمهٔ کلیدی `this` و link مربوط به `[[Prototype]]` مکانیزم فوق‌العاده انعطاف‌پذیری هستند وقتی آن‌ها را کاملاً درک و به کار می‌برید.
