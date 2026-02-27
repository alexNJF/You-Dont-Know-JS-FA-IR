# This Is It!

خب، کافی از lecture پرحرف. آمادهٔ شیرجه در *این* کد هستید؟

بیایید `Point2d` را از فصل ۳ دوباره ببینیم (و گسترش دهیم)، اما فقط به‌عنوان شیء با ویژگی‌های داده و توابع رویش، به‌جای استفاده از `class`:

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) {
        var rotatedX = this.x * Math.cos(angleRadians) -
            this.y * Math.sin(angleRadians);
        var rotatedY = this.x * Math.sin(angleRadians) +
            this.y * Math.cos(angleRadians);
        this.x = rotatedX;
        this.y = rotatedY;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
};
```

همان‌طور که می‌بینید، توابع `init(..)`، `rotate(..)` و `toString()` `this`-aware هستند. شاید عادت داشته باشید فرض کنید ارجاع `this` واضحاً همیشه شیء `point` را نگه می‌دارد. اما این به هیچ وجه تضمین نشده.

در ادامهٔ این فصل مدام به خودتان یادآوری کنید: مقدار `this` برای تابع با *نحوهٔ* فراخوانی تابع تعیین می‌شود. یعنی نمی‌توانید به تعریف تابع، و حتی جایی که تابع تعریف شده (حتی `class` محصورکننده!) نگاه کنید. در واقع، حتی جایی که تابع فراخوانی می‌شود هم مهم نیست.

فقط باید به *نحوهٔ* فراخوانی توابع نگاه کنیم؛ این تنها عاملی است که مهم است.

### فراخوانی با Context ضمنی

این فراخوانی را در نظر بگیرید:

```js
point.init(3,4);
```

تابع `init(..)` را فراخوانی می‌کنیم، اما `point.` جلویش را می‌بینید؟ این binding *context ضمنی* است. به JS می‌گوید: تابع `init(..)` را با `this` ارجاع‌دهندهٔ `point` فراخوانی کن.

این *روش معمول* است که انتظار داریم `this` کار کند، و همچنین یکی از رایج‌ترین روش‌های فراخوانی توابع است. پس فراخوانی معمول نتیجهٔ شهودی می‌دهد. چیز خوبی است!

### فراخوانی با Context پیش‌فرض

اما اگر این کار را بکنیم چه می‌شود؟

```js
const init = point.init;
init(3,4);
```

شاید فرض کنید همان نتیجهٔ snippet قبلی را می‌گیریم. اما اینطور که JS انتساب `this` کار می‌کند نیست.

*call-site* برای تابع `init(3,4)` است، که با `point.init(3,4)` فرق دارد. وقتی *context ضمنی* (`point.`) نیست، و هیچ مکانیزم انتساب `this` دیگری هم نیست، انتساب *context پیش‌فرض* اتفاق می‌افتد.

`this` هنگام فراخوانی `init(3,4)` به چه چیزی اشاره می‌کند؟

*بستگی دارد.*

اوه اوه. بستگی دارد؟ گیج‌کننده به نظر می‌رسد.

نگران نباشید، آنقدرها بد نیست. انتساب *context پیش‌فرض* بستگی به اینکه کد در strict-mode هست یا نه دارد. اما خوشبختانه، تقریباً همهٔ کد JS این روزها در strict-mode اجرا می‌شود؛ مثلاً ESM (ES Modules) همیشه در strict-mode اجرا می‌شود، و کد داخل بلوک `class` هم همینطور. و تقریباً همهٔ کد transpiled JS (از طریق Babel، TypeScript و غیره) برای اعلام strict-mode نوشته شده.

پس تقریباً همیشه، کد JS مدرن در strict-mode اجرا می‌شود، و بنابراین انتساب *context پیش‌فرض* به چیزی «بستگی» ندارد؛ نسبتاً سرراست است: `undefined`. همین!

| NOTE: |
| :--- |
| به خاطر داشته باشید: `undefined` یعنی «تعریف نشده» نیست؛ یعنی «تعریف‌شده با مقدار خالی خاص `undefined`». می‌دانم، می‌دانم... نام و معنا mismatch دارند. baggage legacy زبان است. (شانه بالا انداختن) |

یعنی `init(3,4)`، اگر در strict-mode اجرا شود، استثناء پرتاب می‌کند. چرا؟ چون ارجاع `this.x` در `init(..)` دسترسی ویژگی `.x` روی `undefined` است (یعنی `undefined.x`)، که مجاز نیست:

```js
"use strict";

var point = { /* .. */ };

const init = point.init;
init(3,4);
// TypeError: Cannot set properties of
// undefined (setting 'x')
```

یک لحظه توقف کنید و فکر کنید: چرا JS context را به‌طور پیش‌فرض `undefined` انتخاب می‌کند، تا هر فراخوانی *context پیش‌فرض* تابع `this`-aware با چنین استثنایی شکست بخورد؟

چون تابع `this`-aware **همیشه به `this` نیاز دارد**. فراخوانی `init(3,4)` `this` ارائه نمی‌دهد، پس *اشتباه* است، و *باید* استثناء پرتاب کند تا اشتباه اصلاح شود. درس: هرگز تابع `this`-aware را بدون ارائهٔ `this` فراخوانی نکنید!

فقط برای کامل بودن: در حالت non-strict کمتر رایج، *context پیش‌فرض* شیء global است — JS آن را `globalThis` تعریف می‌کند، که در JS مرورگر اساساً alias برای `window` است، و در Node `global` است. پس، وقتی `init(3,4)` در non-strict mode اجرا می‌شود، عبارت `this.x` همان `globalThis.x` است — که در مرورگر `window.x` و در Node `global.x` هم نامیده می‌شود. پس `globalThis.x` به `3` و `globalThis.y` به `4` تنظیم می‌شوند.

```js
// no strict-mode here, beware!

var point = { /* .. */ };

const init = point.init;
init(3,4);

globalThis.x;   // 3
globalThis.y;   // 4
point.x;        // null
point.y;        // null
```

این unfortunate است، چون تقریباً قطعاً *نتیجهٔ* مورد نظر نیست. نه تنها بد است اگر متغیر global باشد، بلکه ویژگی روی شیء `point` ما را هم تغییر نمی‌دهد، پس باگ برنامه تضمین شده.

| WARNING: |
| :--- |
| اوه! هیچ‌کس متغیرهای global تصادفی که از همه جا به‌طور ضمنی ساخته می‌شوند را نمی‌خواهد. درس: همیشه مطمئن شوید کدتان در strict-mode اجرا می‌شود! |

### فراخوانی با Context صریح

توابع می‌توانند به‌طور متناوب با *context صریح* فراخوانی شوند، با utilityهای built-in `call(..)` یا `apply(..)`:

```js
var point = { /* .. */ };

const init = point.init;

init.call( point, 3, 4 );
// or: init.apply( point, [ 3, 4 ] )

point.x;        // 3
point.y;        // 4
```

`init.call(point,3,4)` به‌طور مؤثر همان `point.init(3,4)` است، چون هر دو `point` را به‌عنوان context `this` برای فراخوانی `init(..)` انتساب می‌دهند.

| NOTE: |
| :--- |
| هر دو utility `call(..)` و `apply(..)` آرگومان اولشان را مقدار context `this` می‌گیرند؛ تقریباً همیشه شیء است، اما از نظر فنی می‌تواند هر مقداری (عدد، رشته و غیره) باشد. utility `call(..)` آرگومان‌های بعدی را می‌گیرد و به تابع فراخوانی‌شده pass می‌کند، در حالی که `apply(..)` انتظار دارد آرگومان دومش آرایهٔ مقادیر برای pass به‌عنوان آرگومان باشد. |

شاید awkward به نظر برسد فراخوانی تابع با سبک انتساب *context صریح* (`call(..)` / `apply(..)`) در برنامه را تصور کنید. اما مفیدتر از آنچه در نگاه اول واضح است.

snippet اصلی را به خاطر بیاورید:

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) { /* .. */ },
    toString() {
        return `(${this.x},${this.y})`;
    },
};

point.init(3,4);

var anotherPoint = {};
point.init.call( anotherPoint, 5, 6 );

point.x;                // 3
point.y;                // 4
anotherPoint.x;         // 5
anotherPoint.y;         // 6
```

می‌بینید چه کردم؟

می‌خواستم `anotherPoint` را تعریف کنم، اما نمی‌خواستم تعاریف آن توابع `init(..)` / `rotate(..)` / `toString()` را از `point` تکرار کنم. پس ارجاع تابع را «قرض گرفتم»، `point.init`، و شیء خالی `anotherPoint` را به‌عنوان context `this` صریحاً تنظیم کردم، از طریق `call(..)`.

وقتی `init(..)` در آن لحظه در حال اجراست، `this` داخلش به `anotherPoint` اشاره می‌کند، و به همین دلیل ویژگی‌های `x` / `y` (مقادیر `5` / `6` به ترتیب) آنجا تنظیم می‌شوند.

هر تابع `this`-aware می‌تواند اینطور قرض گرفته شود: `point.rotate.call(anotherPoint, ..)`، `point.toString.call(anotherPoint)`.

#### بازدید از فراخوانی با Context ضمنی

رویکرد دیگر برای اشتراک رفتار بین `point` و `anotherPoint` این بود:

```js
var point = { /* .. */ };

var anotherPoint = {
    init: point.init,
    rotate: point.rotate,
    toString: point.toString,
};

anotherPoint.init(5,6);

anotherPoint.x;         // 5
anotherPoint.y;         // 6
```

این راه دیگری برای «قرض گرفتن» توابع است، با اضافه کردن ارجاعات اشتراکی به توابع روی هر شیء هدف (مثلاً `anotherPoint`). فراخوانی call-site `anotherPoint.init(5,6)` سبک طبیعی‌تر/ergonomic‌تر است که به انتساب *context ضمنی* تکیه می‌کند.

شاید به نظر برسد این رویکرد کمی تمیزتر است، مقایسهٔ `anotherPoint.init(5,6)` با `point.init.call(anotherPoint,5,6)`.

اما downside اصلی این است که باید هر شیء هدف را با چنین ارجاعات تابع اشتراکی تغییر دهید، که می‌تواند verbose، دستی و error-prone باشد. گاهی چنین رویکردی قابل قبول است، اما بارها دیگر انتساب *context صریح* با `call(..)` / `apply(..)` ترجیح داده می‌شود.

### فراخوانی با Context New

تا الان سه روش مختلف انتساب context در call-site تابع دیده‌ایم: *پیش‌فرض*، *ضمنی* و *صریح*.

روش چهارم فراخوانی تابع و انتساب `this` برای آن فراخوانی با کلمهٔ کلیدی `new` است:

```js
var point = {
    // ..

    init: function() { /* .. */ }

    // ..
};

var anotherPoint = new point.init(3,4);

anotherPoint.x;     // 3
anotherPoint.y;     // 4
```

| TIP: |
| :--- |
| این مثال کمی nuance دارد که باید توضیح داده شود. شکل `init: function() { .. }` نشان‌داده‌شده اینجا — به‌طور خاص، expression تابع انتساب‌شده به ویژگی — برای معتبر بودن فراخوانی تابع با کلمهٔ کلیدی `new` لازم است. از snippetهای قبلی، شکل concise method یعنی `init() { .. }` تابعی تعریف می‌کند که *نمی‌توان* با `new` فراخوانی کرد. |

معمولاً `new` را با `class` برای ساختن نمونه‌ها دیده‌اید. اما به‌عنوان مکانیزم زیربنایی زبان JS، `new` ذاتاً عملیات `class` نیست.

به نوعی، کلمهٔ کلیدی `new` تابع را hijack می‌کند و رفتارش را به حالت متفاوتی از فراخوانی معمولی مجبور می‌کند. این ۴ مرحلهٔ خاصی است که JS هنگام فراخوانی تابع با `new` انجام می‌دهد:

1. شیء خالی کاملاً جدید از هیچ بسازید.

2. `[[Prototype]]` آن شیء خالی جدید را به شیء `.prototype` تابع link کنید (فصل ۲ را ببینید).

3. تابع را با context `this` تنظیم‌شده به آن شیء خالی جدید فراخوانی کنید.

4. اگر تابع صریحاً مقدار شیء خودش را return نکرد (با statement `return ..`)، فرض کنید فراخوانی تابع به‌جای آن باید شیء جدید را برگرداند (از مراحل ۱–۳).

| WARNING: |
| :--- |
| مرحله ۴ دلالت دارد که اگر تابعی را با `new` فراخوانی کنید که *صریحاً* شیء خودش را return می‌کند — مثل `return { .. }` و غیره — آنگاه شیء جدید از مراحل ۱–۳ *برگردانده نمی‌شود*. این gotcha حیله‌ای است که باید بدانید، چون اساساً آن شیء جدید را قبل از فرصت برنامه برای دریافت و ذخیره ارجاع به آن دور می‌ریزد. اساساً، `new` هرگز نباید برای فراخوانی تابعی که statement(های) `return ..` صریح در خودش دارد استفاده شود. |

برای درک این ۴ مرحلهٔ `new` به‌طور ملموس‌تر، آن‌ها را در کد تصویرسازی می‌کنم، به‌عنوان جایگزین استفاده از کلمهٔ کلیدی `new`:

```js
// alternative to:
//   var anotherPoint = new point.init(3,4)

var anotherPoint;
// this is a bare block to hide local
// `let` declarations
{
    // (Step 1)
    let tmpObj = {};

    // (Step 2)
    Object.setPrototypeOf(
        tmpObj, point.init.prototype
    );
    // or: tmpObj.__proto__ = point.init.prototype

    // (Step 3)
    let res = point.init.call(tmpObj,3,4);

    // (Step 4)
    anotherPoint = (
        typeof res !== "object" ? tmpObj : res
    );
}
```

واضح است که فراخوانی `new` آن مجموعه مراحل دستی را ساده می‌کند!

| TIP: |
| :--- |
| `Object.setPrototypeOf(..)` در مرحله ۲ می‌توانست از طریق ویژگی `__proto__` هم انجام شود، مثل `tmpObj.__proto__ = point.init.prototype`، یا حتی به‌عنوان بخشی از object literal (مرحله ۱) با `tmpObj = { __proto__: point.init.prototype }`. |

با رد کردن بخشی از رسمیت این مراحل، snippet قبلی را به خاطر بیاورید و ببینیم `new` چطور نتیجهٔ مشابهی تقریب می‌زند:

```js
var point = { /* .. */ };

// this approach:
var anotherPoint = {};
point.init.call(anotherPoint,5,6);

// can instead be approximated as:
var yetAnotherPoint = new point.init(5,6);
```

کمی بهتر است! اما caveat اینجاست.

استفاده از توابع دیگر که `point` نگه می‌دارد علیه `anotherPoint` / `yetAnotherPoint` با `new` نمی‌خواهیم. چرا؟ چون `new` شیء *جدید* می‌سازد، اما اگر قصد فراخوانی تابع علیه شیء موجود را داریم آن چیزی نیست که می‌خواهیم.

به‌جای آن، احتمالاً از انتساب *context صریح* استفاده می‌کنیم:

```js
point.rotate.call( anotherPoint, /*angleRadians=*/Math.PI );

point.toString.call( yetAnotherPoint );
// (5,6)
```

### این را مرور کنید

چهار قانون برای انتساب context `this` در فراخوانی‌های تابع دیدیم. بیایید آن‌ها را به ترتیب اولویت بگذاریم:

1. آیا تابع با `new` فراخوانی می‌شود، و `this` *جدید* می‌سازد و تنظیم می‌کند؟

2. آیا تابع با `call(..)` یا `apply(..)` فراخوانی می‌شود، و `this` را *صریحاً* تنظیم می‌کند؟

3. آیا تابع با ارجاع شیء در call-site فراخوانی می‌شود (مثلاً `point.init(..)`)، و `this` را *ضمنی* تنظیم می‌کند؟

4. اگر هیچ‌کدام از بالا... آیا در non-strict mode هستیم؟ اگر بله، `this` را به‌طور *پیش‌فرض* به `globalThis` تنظیم کنید. اما اگر در strict-mode، `this` را به‌طور *پیش‌فرض* به `undefined` تنظیم کنید.

این قوانین، *به این ترتیب*، نحوهٔ تعیین `this` توسط JS برای فراخوانی تابع است. اگر چند قانون با call-site تطابق داشته باشد (مثلاً `new point.init.call(..)`)، اولین قانون از لیست که تطابق داشته باشد برنده می‌شود.

همین است، اکنون استاد کلمهٔ کلیدی `this` هستید. خب، نه کاملاً. nuanceهای بیشتری برای پوشش هست. اما راه درستی در پیش دارید!
