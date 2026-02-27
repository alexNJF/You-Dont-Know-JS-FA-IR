# گسترش کلاس

راه باز کردن قدرت inheritance کلاس از طریق کلمهٔ کلیدی `extends` است، که رابطهٔ بین دو کلاس را تعریف می‌کند:

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    printDoubleX() {
        console.log(`double x: ${this.getX() * 2}`);
    }
}

var point = new Point2d();

point.getX();                   // 3

var anotherPoint = new Point3d();

anotherPoint.getX();            // 21
anotherPoint.printDoubleX();    // double x: 42
```

چند لحظه وقت بگذارید و آن قطعه کد را دوباره بخوانید و مطمئن شوید کاملاً می‌فهمید چه اتفاقی می‌افتد.

کلاس پایهٔ `Point2d` فیلدهای (memberهای) `x` و `y` را تعریف می‌کند و به ترتیب مقادیر اولیهٔ `3` و `4` به آن‌ها می‌دهد. همچنین متد `getX()` را تعریف می‌کند که این member نمونهٔ `x` را دسترسی می‌کند و برمی‌گرداند. آن رفتار را در فراخوانی متد `point.getX()` می‌بینیم.

اما کلاس `Point3d` از `Point2d` extend می‌کند، و `Point3d` را به کلاس مشتق‌شده، کلاس فرزند، یا (رایج‌تر) زیرکلاس تبدیل می‌کند. در `Point3d`، همان ویژگی `x` که از `Point2d` به ارث برده با مقدار متفاوت `21` دوباره مقداردهی می‌شود، و `y` هم با override از `4` به `10` تغییر می‌کند.

همچنین فیلد/متد member جدید `z` و متد `printDoubleX()` را اضافه می‌کند، که خودش `this.getX()` را فراخوانی می‌کند.

وقتی `anotherPoint.printDoubleX()` فراخوانی می‌شود، `this.getX()` به ارث‌برده فراخوانی می‌شود، و آن متد به `this.x` ارجاع می‌دهد. چون `this` به نمونهٔ کلاس (یعنی `anotherPoint`) اشاره می‌کند، مقداری که پیدا می‌کند اکنون `21` است (به‌جای `3` از member `x` شیء `point`).

### گسترش Expressionها

// TODO: پوشش `class Foo extends ..` جایی که `..` یک expression است، نه نام کلاس

### Override کردن متدها

علاوه بر override کردن فیلد/member در زیرکلاس، می‌توانید متد را هم override (بازتعریف) کنید:

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    getX() {
        return this.x * 2;
    }
    printX() {
        console.log(`double x: ${this.getX()}`);
    }
}

var point = new Point3d();

point.printX();       // double x: 42
```

زیرکلاس `Point3d` متد به‌ارث‌بردهٔ `getX()` را override می‌کند تا رفتار متفاوتی بدهد. با این حال، هنوز می‌توانید کلاس پایهٔ `Point2d` را نمونه‌سازی کنید، که آنگاه شیء‌ای می‌دهد که از تعریف اصلی (`return this.x;`) برای `getX()` استفاده می‌کند.

اگر می‌خواهید حتی در صورت override شدن، از زیرکلاس به متد به‌ارث‌برده دسترسی داشته باشید، می‌توانید به‌جای `this` از `super` استفاده کنید:

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    getX() {
        return this.x * 2;
    }
    printX() {
        console.log(`x: ${super.getX()}`);
    }
}

var point = new Point3d();

point.printX();       // x: 21
```

قابلیت متدهای هم‌نام در سطوح مختلف سلسله‌مراتب inheritance برای نشان دادن رفتار متفاوت وقتی مستقیماً یا نسبی با `super` دسترسی می‌شوند، *method polymorphism* نامیده می‌شود. بخش بسیار قدرتمند جهت‌گیری کلاسی است، وقتی به‌درستی استفاده شود.

### That's Super!

علاوه بر دسترسی متد زیرکلاس به تعریف متد به‌ارث‌برده (حتی اگر روی زیرکلاس override شده) از طریق ارجاع `super.`، constructor زیرکلاس باید دستی constructor کلاس پایهٔ به‌ارث‌برده را از طریق فراخوانی تابع `super(..)` فراخوانی کند:

```js
class Point2d {
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var point = new Point3d(3,4,5);

point.toString();       // (3,4,5)
```

| WARNING: |
| :--- |
| constructor زیرکلاس که صریح تعریف شده *باید* `super(..)` را برای اجرای مقداردهی اولیهٔ کلاس به‌ارث‌برده فراخوانی کند، و این باید قبل از هر ارجاع constructor زیرکلاس به `this` یا تمام شدن/return کردن اتفاق بیفتد. در غیر این صورت، هنگام فراخوانی آن constructor زیرکلاس (از طریق `new`) استثناء runtime پرتاب می‌شود. اگر constructor زیرکلاس را حذف کنید، constructor پیش‌فرض به‌طور خودکار — خوشبختانه! — `super()` را برایتان فراخوانی می‌کند. |

یک nuance که باید بدانید: اگر فیلدی (عمومی یا خصوصی) داخل زیرکلاس تعریف کنید، و صریحاً `constructor(..)` برای این زیرکلاس تعریف کنید، مقداردهی‌های اولیهٔ فیلد در بالای constructor پردازش نمی‌شوند، بلکه *بین* فراخوانی `super(..)` و هر کد بعدی در constructor پردازش می‌شوند.

به ترتیب پیام‌های console اینجا دقت کنید:

```js
class Point2d {
    x
    y
    constructor(x,y) {
        console.log("Running Point2d(..) constructor");
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z = console.log("Initializing field 'z'")

    constructor(x,y,z) {
        console.log("Running Point3d(..) constructor");
        super(x,y);

        console.log(`Setting instance property 'z' to ${z}`);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var point = new Point3d(3,4,5);
// Running Point3d(..) constructor
// Running Point2d(..) constructor
// Initializing field 'z'
// Setting instance property 'z' to 5
```

همان‌طور که پیام‌های console نشان می‌دهند، مقداردهی اولیهٔ `z = ..` *بلافاصله بعد از* فراخوانی `super(x,y)` اتفاق می‌افتد، *قبل از* اجرای ``console.log(`Setting instance...`)``. شاید آن را مثل مقداردهی‌های اولیهٔ فیلد متصل به انتهای فراخوانی `super(..)` تصور کنید، پس قبل از هر چیز دیگری در constructor اجرا می‌شوند.

#### کدام کلاس؟

ممکن است در constructor نیاز داشته باشید تعیین کنید آیا آن کلاس مستقیماً نمونه‌سازی می‌شود، یا از زیرکلاس با فراخوانی `super()` نمونه‌سازی می‌شود. می‌توانیم از «pseudo property» خاص `new.target` استفاده کنیم:

```js
class Point2d {
    // ..

    constructor(x,y) {
        if (new.target === Point2d) {
            console.log("Constructing 'Point2d' instance");
        }
    }

    // ..
}

class Point3d extends Point2d {
    // ..

    constructor(x,y,z) {
        super(x,y);

        if (new.target === Point3d) {
            console.log("Constructing 'Point3d' instance");
        }
    }

    // ..
}

var point = new Point2d(3,4);
// Constructing 'Point2d' instance

var anotherPoint = new Point3d(3,4,5);
// Constructing 'Point3d' instance
```

### اما چه نوع نمونه‌ای؟

ممکن است بخواهید یک نمونهٔ شیء خاص را introspect کنید تا ببینید آیا نمونهٔ کلاس خاصی است. این کار را با عملگر `instanceof` انجام می‌دهیم:

```js
class Point2d { /* .. */ }
class Point3d extends Point2d { /* .. */ }

var point = new Point2d(3,4);

point instanceof Point2d;           // true
point instanceof Point3d;           // false

var anotherPoint = new Point3d(3,4,5);

anotherPoint instanceof Point2d;    // true
anotherPoint instanceof Point3d;    // true
```

شاید عجیب به نظر برسد که `anotherPoint instanceof Point2d` نتیجهٔ `true` بدهد. برای درک بهتر، شاید مفید باشد هر دو زنجیرهٔ `[[Prototype]]` را تصور کنید:

```
Point2d.prototype
        /       \
       /         \
      /           \
  point   Point3d.prototype
                    \
                     \
                      \
                    anotherPoint
```

عملگر `instanceof` فقط به شیء فعلی نگاه نمی‌کند، بلکه کل سلسله‌مراتب inheritance کلاس (زنجیرهٔ `[[Prototype]]`) را تا پیدا کردن تطابق طی می‌کند. پس `anotherPoint` نمونهٔ هر دو `Point3d` و `Point2d` است.

برای نشان دادن این واقعیت کمی واضح‌تر، راه دیگر (کمتر ergonomic) برای همان نوع بررسی مثل `instanceof` با utility به‌ارث‌برده از `Object.prototype`، `isPrototypeOf(..)` است:

```js
Point2d.prototype.isPrototypeOf(point);             // true
Point3d.prototype.isPrototypeOf(point);             // false

Point2d.prototype.isPrototypeOf(anotherPoint);      // true
Point3d.prototype.isPrototypeOf(anotherPoint);      // true
```

این utility کمی واضح‌تر می‌کند چرا هم `Point2d.prototype.isPrototypeOf(anotherPoint)` و هم `anotherPoint instanceof Point2d` نتیجهٔ `true` می‌دهند: شیء `Point2d.prototype` *در* زنجیرهٔ `[[Prototype]]` مربوط به `anotherPoint` است.

اگر به‌جای آن می‌خواستید بررسی کنید نمونهٔ شیء *فقط و مستقیماً* توسط کلاس خاصی ساخته شده، ویژگی `constructor` نمونه را بررسی کنید.

```js
point.constructor === Point2d;          // true
point.constructor === Point3d;          // false

anotherPoint.constructor === Point2d;   // false
anotherPoint.constructor === Point3d;   // true
```

| NOTE: |
| :--- |
| ویژگی `constructor` نشان‌داده‌شده اینجا *واقعاً* روی اشیاء نمونهٔ `point` یا `anotherPoint` (owned) وجود ندارد. پس از کجا می‌آید؟ روی شیء prototype مرتبط با `[[Prototype]]` هر شیء است: `Point2d.prototype.constructor === Point2d` و `Point3d.prototype.constructor === Point3d`. |

### «Inheritance» اشتراک است، نه کپی

شاید به نظر برسد وقتی `Point3d` کلاس `Point2d` را `extends` می‌کند، اساساً *کپی* همهٔ رفتار تعریف‌شده در `Point2d` را می‌گیرد. علاوه بر این، شاید به نظر برسد نمونهٔ عینی شیء `anotherPoint` همهٔ متدها را از `Point3d` (و با گسترش، از `Point2d`) *کپی شده* دریافت می‌کند.

با این حال، این مدل ذهنی صحیح برای پیاده‌سازی جهت‌گیری کلاسی JS نیست. این تعریف کلاس پایه و زیرکلاس و نمونه‌سازی `anotherPoint` را به خاطر بیاورید:

```js
class Point2d {
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var anotherPoint = new Point3d(3,4,5);
```

اگر شیء `anotherPoint` را inspect کنید، می‌بینید فقط ویژگی‌های `x`، `y` و `z` (memberهای نمونه) رویش هست، نه متد `toString()`:

```js
Object.hasOwn(anotherPoint,"x");                       // true
Object.hasOwn(anotherPoint,"y");                       // true
Object.hasOwn(anotherPoint,"z");                       // true

Object.hasOwn(anotherPoint,"toString");                // false
```

متد `toString()` کجا قرار دارد؟ روی شیء prototype:

```js
Object.hasOwn(Point3d.prototype,"toString");    // true
```

و `anotherPoint` از طریق اتصال `[[Prototype]]` (فصل ۲ را ببینید) به آن متد دسترسی دارد. به عبارت دیگر، اشیاء prototype **دسترسی اشتراکی** به متد(های)شان با زیرکلاس(ها) و نمونه(ها) دارند. متد(ها) سر جایشان می‌مانند و در زنجیرهٔ inheritance کپی نمی‌شوند.

هرچند سینتکس `class` خوب است، فراموش نکنید واقعاً چه اتفاقی زیر سینتکس می‌افتد: JS *فقط* اشیاء را در امتداد زنجیرهٔ `[[Prototype]]` به هم وصل می‌کند.
