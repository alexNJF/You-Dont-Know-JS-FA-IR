# کلاس را `class`y نگه دارید

`class` یا یک declaration یا expression برای کلاس تعریف می‌کند. به‌عنوان declaration، تعریف کلاس در موقعیت statement ظاهر می‌شود و این‌طور به نظر می‌رسد:

```js
class Point2d {
    // ..
}
```

به‌عنوان expression، تعریف کلاس در موقعیت value ظاهر می‌شود و می‌تواند نام داشته باشد یا ناشناس باشد:

```js
// named class expression
const pointClass = class Point2d {
    // ..
};

// anonymous class expression
const anotherClass = class {
    // ..
};
```

محتوای بدنهٔ `class` معمولاً شامل یک یا چند تعریف متد است:

```js
class Point2d {
    setX(x) {
        // ..
    }
    setY(y) {
        // ..
    }
}
```

داخل بدنهٔ `class`، متدها بدون کلمهٔ کلیدی `function` تعریف می‌شوند، و هیچ جداکنندهٔ `,` یا `;` بین تعاریف متد وجود ندارد.

| NOTE: |
| :--- |
| داخل بلوک `class`، همهٔ کد حتی بدون pragmaٔ `"use strict"` در فایل یا توابعش در حالت strict اجرا می‌شود. به‌طور خاص، این بر رفتار `this` برای فراخوانی‌های تابع تأثیر می‌گذارد، همان‌طور که در فصل ۴ توضیح داده شده. |

### Constructor

یک متد خاص که همهٔ کلاس‌ها دارند «constructor» نام دارد. اگر حذف شود، یک constructor خالی پیش‌فرض در تعریف فرض می‌شود.

constructor هر بار که نمونهٔ `new` کلاس ساخته می‌شود فراخوانی می‌شود:

```js
class Point2d {
    constructor() {
        console.log("Here's your new instance!");
    }
}

var point = new Point2d();
// Here's your new instance!
```

حتی با اینکه سینتکس دلالت بر وجود تابعی به نام واقعی `constructor` دارد، جاوااسکریپت تابعی مطابق مشخصات تعریف می‌کند، اما با نام کلاس (`Point2d` بالا):

```js
typeof Point2d;       // "function"
```

اما این *فقط* یک تابع معمولی نیست؛ این نوع خاص تابع کمی متفاوت رفتار می‌کند:

```js
Point2d.toString();
// class Point2d {
//   ..
// }

Point2d();
// TypeError: Class constructor Point2d cannot
// be invoked without 'new'

Point2d.call({});
// TypeError: Class constructor Point2d cannot
// be invoked without 'new'
```

می‌توانید هر تعداد نمونهٔ مختلف از یک کلاس که نیاز دارید بسازید:

```js
var one = new Point2d();
var two = new Point2d();
var three = new Point2d();
```

هر کدام از `one`، `two` و `three` اینجا اشیاء مستقل نمونهٔ کلاس `Point2d` هستند.

| NOTE: |
| :--- |
| هر کدام از اشیاء `one`، `two` و `three` یک اتصال `[[Prototype]]` به شیء `Point2d.prototype` دارند (فصل ۲ را ببینید). در این کد، `Point2d` هم تعریف `class` و هم تابع constructor به همان نام است. |

اگر ویژگی به شیء `one` اضافه کنید:

```js
one.value = 42;
```

آن ویژگی اکنون فقط روی `one` وجود دارد، و به هیچ شکلی که اشیاء مستقل `two` یا `three` بتوانند دسترسی داشته باشند وجود ندارد:

```js
two.value;      // undefined
three.value;    // undefined
```

### متدهای کلاس

همان‌طور که بالا نشان داده شد، تعریف کلاس می‌تواند شامل یک یا چند تعریف متد باشد:

```js
class Point2d {
    constructor() {
        console.log("Here's your new instance!");
    }
    setX(x) {
        console.log(`Setting x to: ${x}`);
        // ..
    }
}

var point = new Point2d();

point.setX(3);
// Setting x to: 3
```

ویژگی (متد) `setX` *به نظر می‌رسد* روی شیء `point` اینجا وجود دارد (owned است). اما این یک سراب است. هر متد کلاس به شیء `prototype`، ویژگی تابع constructor، اضافه می‌شود.

پس، `setX(..)` فقط به‌صورت `Point2d.prototype.setX` وجود دارد. چون `point` از طریق نمونه‌سازی با کلمهٔ کلیدی `new` به `Point2d.prototype` (فصل ۲ را ببینید) `[[Prototype]]` linked است، ارجاع `point.setX(..)` زنجیرهٔ `[[Prototype]]` را طی می‌کند و متد را برای اجرا پیدا می‌کند.

متدهای کلاس فقط باید از طریق نمونه فراخوانی شوند؛ `Point2d.setX(..)` کار نمی‌کند چون چنین ویژگی *وجود ندارد*. *می‌توانستید* `Point2d.prototype.setX(..)` را فراخوانی کنید، اما این به‌طور کلی در کدنویسی استاندارد جهت‌یافته به کلاس مناسب/توصیه‌شده نیست. همیشه متدهای کلاس را از طریق نمونه‌ها دسترسی کنید.
