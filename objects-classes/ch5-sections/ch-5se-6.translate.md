# چرا *This*؟

خب، امیدوارم واضح باشد که الگوی delegation به شدت به ورودی ضمنی تکیه می‌کند، share کردن context از طریق `this` به‌جای پارامتر صریح.

شاید درست بپرسید، چرا همیشه آن context را صریحاً pass نکنیم؟ قطعاً می‌توانیم، اما... برای pass دستی context لازم، باید تقریباً هر signature تابع و هر call-site مربوط را تغییر دهیم.

بیایید مثال delegation مربوط به `ControlPoint` قبلی را دوباره ببینیم، و بدون هیچ اشتراک context `this` جهت‌یافته به delegation پیاده‌سازی کنیم. به تفاوت‌ها دقت کنید:

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

صادقانه بگویم، برخی ممکن است آن سبک کد را ترجیح دهند. و اگر در آن اردوگاه هستید اشکالی ندارد. این snippet `[[Prototype]]` را کاملاً رد می‌کند، و فقط به ارجاعات ویژگی و متد سبک `this.` بسیار کم‌تر تکیه می‌کند.

در مقابل، سبک delegation که در این فصل advocate می‌کنم ناآشنا است و از `[[Prototype]]` و اشتراک `this` به روش‌هایی استفاده می‌کند که احتمالاً با آن‌ها آشنا نیستید. برای استفادهٔ مؤثر از چنین سبکی، باید وقت و تمرین برای ساخت familiarity عمیق‌تر سرمایه‌گذاری کنید.

اما به نظر من، «هزینه» اجتناب از ترکیب مجازی از طریق delegation در همهٔ signatureهای تابع و call-siteها احساس می‌شود؛ آن‌ها را خیلی شلوغ‌تر می‌بینم. آن pass کردن context صریح مالیات نسبتاً سنگینی است.

در واقع، هرگز آن سبک کد را advocate نمی‌کنم. اگر می‌خواهید از delegation اجتناب کنید، احتمالاً بهتر است به کد سبک `class` بچسبید، همان‌طور که در فصل ۳ دیدیم. به‌عنوان تمرین برای خواننده، سعی کنید snippetهای قبلی مربوط به `ControlPoint` / `GuideLine` را به استفاده از `class` تبدیل کنید.

[^TreatyOfOrlando]: "Treaty of Orlando"; Henry Lieberman, Lynn Andrea Stein, David Ungar; Oct 6, 1987; https://web.media.mit.edu/~lieber/Publications/Treaty-of-Orlando-Treaty-Text.pdf ; PDF; Accessed July 2022

[^ClassVsPrototype]: "Classes vs. Prototypes, Some Philosophical and Historical Observations"; Antero Taivalsaari; Apr 22, 1996; https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.56.4713&rep=rep1&type=pdf ; PDF; Accessed July 2022
