# تغییرات

قبل از بستن بحث طولانی‌مان دربارهٔ `this`، چند تغییر نامنظم در فراخوانی‌های تابع هست که باید بحث کنیم.

### فراخوانی‌های غیرمستقیم تابع

این مثال از اوایل فصل را به خاطر دارید؟

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) { /* .. */ },
    toString() { /* .. */ },
};

var init = point.init;
init(3,4);                  // broken!
```

این شکسته است چون call-site مربوط به `init(3,4)` سیگنال انتساب `this` لازم را ارائه نمی‌دهد. اما راه‌های دیگری برای مشاهدهٔ شکستگی مشابه هست. مثلاً:

```js
(1,point.init)(3,4);        // broken!
```

این سینتکس عجیب اول expression `(1,point.init)` را ارزیابی می‌کند، که expression سری کاما است. نتیجهٔ چنین expressionی آخرین مقدار ارزیابی‌شده است، که در این مورد ارجاع تابع (نگه‌داشته‌شده توسط `point.init`) است.

پس نتیجه آن ارجاع تابع را روی expression stack می‌گذارد، و سپس آن مقدار را با `(3,4)` فراخوانی می‌کند. این فراخوانی غیرمستقیم تابع است. و نتیجه چیست؟ در واقع با قانون انتساب *context پیش‌فرض* (#۴) که اوایل فصل دیدیم تطابق دارد.

پس در non-strict mode، `this` برای فراخوانی `point.init(..)` همان `globalThis` است. اگر در strict-mode بودیم، `undefined` می‌شد، و عملیات `this.x = x` آنگاه برای دسترسی نامعتبر به ویژگی `x` روی مقدار `undefined` استثناء پرتاب می‌کرد.

راه‌های مختلفی برای گرفتن فراخوانی غیرمستقیم تابع هست. مثلاً:

```js
(()=>point.init)()(3,4);    // broken!
```

و مثال دیگر فراخوانی غیرمستقیم تابع الگوی IIFE (Immediately Invoked Function Expression) است:

```js
(function(){
    // `this` assigned via "default" rule
})();
```

همان‌طور که می‌بینید، مقدار expression تابع روی expression stack گذاشته می‌شود، و سپس با `()` انتهایی فراخوانی می‌شود.

اما این کد چطور:

```js
(point.init)(3,4);
```

نتیجهٔ آن کد چه خواهد بود؟

با همان استدلالی که در مثال‌های قبلی دیدیم، منطقی است که expression `point.init` مقدار تابع را روی expression stack می‌گذارد، و سپس با `(3,4)` به‌طور غیرمستقیم فراخوانی می‌شود.

نه کاملاً! دستور زبان JS قانون خاصی برای handle کردن شکل فراخوانی `(someIdentifier)(..)` دارد، طوری که انگار `someIdentifier(..)` بوده (بدون `(..)` دور نام identifier).

تعجب می‌کنید چرا ممکن است بخواهید *context پیش‌فرض* برای انتساب `this` را از طریق فراخوانی غیرمستقیم تابع مجبور کنید؟

### دسترسی به `globalThis`

قبل از پاسخ، راه دیگری برای انجام انتساب `this` فراخوانی غیرمستقیم تابع معرفی می‌کنیم. تا الان الگوهای فراخوانی غیرمستقیم تابع نشان‌داده‌شده به strict-mode حساس‌اند. اما اگر می‌خواستیم انتساب `this` فراخوانی غیرمستقیم تابعی که strict-mode را رعایت نمی‌کند چه می‌شد.

constructor `Function(..)` رشته‌ای از کد می‌گیرد و تابع معادل را به‌طور پویا تعریف می‌کند. با این حال، همیشه طوری انجام می‌دهد که انگار آن تابع در scope سراسری اعلام شده. و علاوه بر این، اطمینان می‌دهد چنین تابعی *در strict-mode اجرا نشود*، صرف نظر از وضعیت strict-mode برنامه. همان نتیجهٔ اجرای غیرمستقیم است.

یک استفادهٔ niche از چنین انتساب `this` فراخوانی غیرمستقیم agnostic به strict-mode، گرفتن ارجاع قابل اعتماد به شیء global واقعی قبل از زمانی است که مشخصات JS واقعاً identifier مربوط به `globalThis` را تعریف کرد (مثلاً در polyfill برایش):

```js
"use strict";

var gt = new Function("return this")();
gt === globalThis;                      // true
```

در واقع، نتیجهٔ مشابه، با ترفند عملگر کاما (بخش قبلی را ببینید) و `eval(..)`:

```js
"use strict";

function getGlobalThis() {
    return (1,eval)("this");
}

getGlobalThis() === globalThis;      // true
```

| NOTE: |
| :--- |
| `eval("this")` به strict-mode حساس است، اما `(1,eval)("this")` نیست، و بنابراین به‌طور قابل اعتماد `globalThis` را در هر برنامه می‌دهد. |

متأسفانه، رویکردهای `new Function(..)` و `(1,eval)(..)` هر دو محدودیت مهمی دارند: آن کد در کد JS مبتنی بر مرورگر اگر اپ با محدودیت‌های خاص Content-Security-Policy (CSP) سرو شود، که ارزیابی کد پویا را برای دلایل امنیتی disallow می‌کند، block می‌شود.

می‌توانیم دورش بزنیم؟ بله، mostly. [^globalThisPolyfill]

مشخصات JS می‌گوید تابع getter تعریف‌شده روی شیء global، یا روی هر شیء که از آن ارث می‌برد (مثل `Object.prototype`)، تابع getter را با context `this` انتساب‌یافته به `globalThis` اجرا می‌کند، صرف نظر از strict-mode برنامه.

```js
// Adapted from: https://mathiasbynens.be/notes/globalthis#robust-polyfill
function getGlobalThis() {
    Object.defineProperty(Object.prototype,"__get_globalthis__",{
        get() { return this; },
        configurable: true
    });
    var gt = __get_globalthis__;
    delete Object.prototype.__get_globalthis__;
    return gt;
}

getGlobalThis() === globalThis;      // true
```

بله، super gnarly است. اما این `this` جاوااسکریپت است!

### توابع Tag مربوط به Template

یک تغییر نامعمول دیگر فراخوانی تابع هست که باید پوشش دهیم: توابع tagged template.

رشته‌های template — که ترجیح می‌دهم literalهای interpolated بنامم — می‌توانند با تابع پیشوندی «tag» شوند، که با محتوای parse‌شدهٔ template literal فراخوانی می‌شود:

```js
function tagFn(/* .. */) {
    // ..
}

tagFn`actually a function invocation!`;
```

همان‌طور که می‌بینید، سینتکس فراخوانی `(..)` نیست، فقط تابع tag (`tagFn`) قبل از `` `template literal` `` ظاهر می‌شود؛ فاصلهٔ خالی بین آن‌ها مجاز است، اما خیلی غیرمعمول است.

با وجود ظاهر عجیب، تابع `tagFn(..)` فراخوانی می‌شود. لیست یک یا چند literal رشته‌ای که از template literal parse شده به آن pass می‌شود، همراه با هر مقدار expression interpolated که مواجه شده.

قرار نیست همهٔ جزئیات توابع tagged template را پوشش دهیم — واقعاً یکی از قدرتمندترین و جالب‌ترین ویژگی‌های اضافه‌شده به JS هستند — اما چون دربارهٔ انتساب `this` در فراخوانی‌های تابع صحبت می‌کنیم، برای کامل بودن باید دربارهٔ نحوهٔ انتساب `this` حرف بزنیم.

شکل دیگر توابع tag که ممکن است مواجه شوید:

```js
var someObj = {
    tagFn() { /* .. */ }
};

someObj.tagFn`also a function invocation!`;
```

توضیح ساده این است: `` tagFn`..` `` و `` someObj.tagFn`..` `` هر کدام رفتار انتساب `this` مطابق با call-siteهای `tagFn(..)` و `someObj.tagFn(..)` دارند. به عبارت دیگر، `` tagFn`..` `` طبق قانون انتساب *context پیش‌فرض* (#۴) رفتار می‌کند، و `` someObj.tagFn`..` `` طبق قانون انتساب *context ضمنی* (#۳).

خوشبختانه برای ما، نیازی به نگرانی دربارهٔ قوانین انتساب `new` یا `call(..)` / `apply(..)` نیست، چون آن شکل‌ها با توابع tag ممکن نیستند.

باید اشاره شود که خیلی نادر است تابع tagged template literal به‌عنوان `this`-aware تعریف شود، پس نسبتاً بعید است نیاز به اعمال این قوانین داشته باشید. اما در هر صورت، اکنون در *know* هستید.
