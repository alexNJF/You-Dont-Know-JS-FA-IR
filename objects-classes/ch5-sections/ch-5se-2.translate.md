# Constructor اصلاً چیست؟

در فصل ۳، `constructor(..)` را به‌عنوان نقطهٔ ورود اصلی ساخت نمونهٔ `class` دیدیم. اما `constructor(..)` واقعاً هیچ کار *ساخت* انجام نمی‌دهد، فقط کار *مقداردهی اولیه* است. به عبارت دیگر، نمونه قبلاً ساخته شده وقتی `constructor(..)` اجرا می‌شود و آن را مقداردهی می‌کند — مثلاً انتساب‌های نوع `this.whatever`.

پس کار *ساخت* واقعاً کجا اتفاق می‌افتد؟ در عملگر `new`. همان‌طور که بخش «New Context Invocation» در فصل ۴ توضیح می‌دهد، چهار مرحله وجود دارد که کلمهٔ کلیدی `new` انجام می‌دهد؛ اولین آن‌ها ساخت شیء خالی جدید (نمونه) است. `constructor(..)` تا مرحله ۳ تلاش‌های `new` حتی فراخوانی نمی‌شود.

اما `new` تنها — یا شاید حتی بهترین — راه *ساخت* شیء «نمونه» نیست. در نظر بگیرید:

```js
// a non-class "constructor"
function Point2d(x,y) {
    // create an object (1)
    var instance = {};

    // initialize the instance (3)
    instance.x = x;
    instance.y = y;

    // return the instance (4)
    return instance;
}

var point = Point2d(3,4);

point.x;                    // 3
point.y;                    // 4
```

هیچ `class`ی نیست، فقط تعریف تابع معمولی (`Point2d(..)`). هیچ فراخوانی `new`ی نیست، فقط فراخوانی تابع معمولی (`Point2d(3,4)`). و هیچ ارجاع `this`ی نیست، فقط انتساب‌های ویژگی شیء معمولی (`instance.x = ..`).

اصطلاحی که اغلب برای اشاره به این الگوی کد استفاده می‌شود این است که `Point2d(..)` اینجا *تابع کارخانه* (factory function) است. فراخوانی آن باعث ساخت (ایجاد و مقداردهی اولیه) شیء می‌شود و آن را برمی‌گرداند. الگوی فوق‌العاده رایجی است، حداقل به رایجی کد جهت‌یافته به کلاس.

در آن snippet با `(1)`، `(3)` و `(4)` comment-annotate کردم، که تقریباً با مراحل ۱، ۳ و ۴ عملیات `new` مطابقت دارند. اما مرحله ۲ کجاست؟

اگر به خاطر دارید، مرحله ۲ مربوط به `new` دربارهٔ link کردن شیء (ساخته‌شده در مرحله ۱) به شیء دیگر از طریق slot مربوط به `[[Prototype]]` است (فصل ۲ را ببینید). پس به چه شیءی ممکن است بخواهیم شیء `instance` را link کنیم؟ می‌توانیم آن را به شیءی link کنیم که توابعی را که می‌خواهیم با نمونهٔمان مرتبط/استفاده کنیم نگه می‌دارد.

snippet قبلی را اصلاح می‌کنیم:

```js
var prototypeObj = {
    toString() {
        return `(${this.x},${this.y})`;
    },
}

// a non-class "constructor"
function Point2d(x,y) {
    // create an object (1)
    var instance = {
        // link the instance's [[Prototype]] (2)
        __proto__: prototypeObj,
    };

    // initialize the instance (3)
    instance.x = x;
    instance.y = y;

    // return the instance (4)
    return instance;
}

var point = Point2d(3,4);

point.toString();           // (3,4)
```

حالا انتساب `__proto__` را می‌بینید که اتصال داخلی `[[Prototype]]` را تنظیم می‌کند، که مرحلهٔ گم‌شده ۲ بود. اینجا صرفاً برای تصویرسازی از `__proto__` استفاده کردم؛ استفاده از `setPrototypeOf(..)` همان‌طور که در فصل ۴ نشان داده شد همان کار را انجام می‌داد.

### نمونهٔ کارخانه *New*

فکر می‌کنید اگر از `new` برای فراخوانی تابع `Point2d(..)` همان‌طور که اینجا نشان داده شده استفاده کنیم چه می‌شود؟

```js
var anotherPoint = new Point2d(5,6);

anotherPoint.toString(5,6);         // (5,6)
```

صبر کنید! چه اتفاقی می‌افتد؟ تابع کارخانه معمولی غیر-`class` با کلمهٔ کلیدی `new` فراخوانی می‌شود، انگار `class` بود. آیا چیزی در نتیجهٔ کد تغییر می‌کند؟

نه... و بله. `anotherPoint` اینجا دقیقاً همان شیء است که اگر `new` استفاده نکرده بودم می‌بود. اما! شیءای که `new` می‌سازد، link می‌کند و به‌عنوان context `this` انتساب می‌دهد؟ *آن* شیء کاملاً نادیده گرفته و دور انداخته شد، در نهایت برای garbage collection توسط JS. متأسفانه، موتور JS نمی‌تواند پیش‌بینی کند که از شیءی که از `new` خواستید بسازد استفاده نمی‌کنید، پس همیشه هنوز ساخته می‌شود حتی اگر استفاده نشود.

درست است! استفاده از کلمهٔ کلیدی `new` علیه تابع کارخانه ممکن است *ergonomic‌تر یا آشناتر* به نظر برسد، اما کاملاً اتلاف است، چون **دو** شیء می‌سازد و یکی را به‌طور اتلاف‌آمیز دور می‌ریزد.

### مقداردهی اولیهٔ کارخانه

در مثال کد فعلی، تابع `Point2d(..)` هنوز خیلی شبیه `constructor(..)` معمولی تعریف `class` به نظر می‌رسد. اما اگر کد مقداردهی اولیه را به تابع جداگانه‌ای، مثلاً به نام `init(..)` منتقل کنیم چه می‌شود:

```js
var prototypeObj = {
    init(x,y) {
        // initialize the instance (3)
        this.x = x;
        this.y = y;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
}

// a non-class "constructor"
function Point2d(x,y) {
    // create an object (1)
    var instance = {
        // link the instance's [[Prototype]] (2)
        __proto__: prototypeObj,
    };

    // initialize the instance (3)
    instance.init(x,y);

    // return the instance (4)
    return instance;
}

var point = Point2d(3,4);

point.toString();           // (3,4)
```

فراخوانی `instance.init(..)` از اتصال `[[Prototype]]` تنظیم‌شده از طریق انتساب `__proto__` استفاده می‌کند. پس به `prototypeObj.init(..)` در زنجیرهٔ prototype *delegate* می‌کند، و آن را با context `this` مربوط به `instance` فراخوانی می‌کند — از طریق انتساب *context ضمنی* (فصل ۴ را ببینید).

ادامهٔ deconstruction را می‌دهیم. آمادهٔ switcheroo شوید!

```js
var Point2d = {
    init(x,y) {
        // initialize the instance (3)
        this.x = x;
        this.y = y;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
};
```

واو، چی!؟ تابع `Point2d(..)` را دور انداختم و به‌جای آن `prototypeObj` را به نام `Point2d` تغییر نام دادم. عجیب.

اما بقیهٔ کد را ببینیم:

```js
// steps 1, 2, and 4
var point = { __proto__: Point2d, };

// step 3
point.init(3,4);

point.toString();           // (3,4)
```

و یک refinement آخر: از utility built-in که JS به ما می‌دهد به نام `Object.create(..)` استفاده کنیم:

```js
// steps 1, 2, and 4
var point = Object.create(Point2d);

// step 3
point.init(3,4);

point.toString();           // (3,4)
```

`Object.create(..)` چه عملیاتی انجام می‌دهد؟

1. شیء خالی کاملاً جدید از هیچ بسازید.

2. `[[Prototype]]` آن شیء خالی جدید را به شیء `.prototype` تابع link کنید.

اگر آشنا به نظر می‌رسند، چون دقیقاً همان دو مرحلهٔ اول کلمهٔ کلیدی `new` هستند (فصل ۴ را ببینید).

حالا دوباره جمعش کنیم:

```js
var Point2d = {
    init(x,y) {
        this.x = x;
        this.y = y;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
};

var point = Object.create(Point2d);

point.init(3,4);

point.toString();           // (3,4)
```

هممم. چند لحظه تأمل کنید چه چیزی اینجا استخراج شده. چطور با رویکرد `class` مقایسه می‌شود؟

این الگو کلمات کلیدی `class` و `new` را کنار می‌گذارد، اما دقیقاً همان نتیجه را به دست می‌آورد. *هزینه*؟ عملیات واحد `new` به دو statement شکسته شد: `Object.create(Point2d)` و `point.init(3,4)`.

#### کمک کنید بازسازی کنم!

اگر جدا بودن آن دو عملیات شما را اذیت می‌کند — *خیلی deconstructed* است!؟ — همیشه می‌توان آن‌ها را در یک helper کارخانهٔ کوچک دوباره ترکیب کرد:

```js
function make(objType,...args) {
    var instance = Object.create(objType);
    instance.init(...args);
    return instance;
}

var point = make(Point2d,3,4);

point.toString();           // (3,4)
```

| TIP: |
| :--- |
| چنین تابع helper کارخانهٔ `make(..)` به‌طور کلی برای هر نوع شیء کار می‌کند، تا زمانی که از convention ضمنی پیروی کنید که هر `objType`ی که به آن link می‌کنید تابعی به نام `init(..)` رویش دارد. |

و البته، هنوز می‌توانید هر تعداد نمونه که می‌خواهید بسازید:

```js
var point = make(Point2d,3,4);

var anotherPoint = make(Point2d,5,6);
```
