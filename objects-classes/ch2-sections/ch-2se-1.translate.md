# توصیفگرهای ویژگی

هر ویژگی روی شیء به‌طور داخلی با چیزی به نام «property descriptor» توصیف می‌شود. این خودش شیء است (یعنی «metaobject») با چند ویژگی (یعنی «attribute») رویش که نحوهٔ رفتار ویژگی هدف را دیکته می‌کند.

می‌توانیم descriptor ویژگی را برای هر ویژگی موجود با `Object.getOwnPropertyDescriptor(..)` (ES5) بازیابی کنیم:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

Object.getOwnPropertyDescriptor(myObj,"favoriteNumber");
// {
//     value: 42,
//     enumerable: true,
//     writable: true,
//     configurable: true
// }
```

حتی می‌توانیم از چنین descriptor برای تعریف ویژگی جدید روی شیء با `Object.defineProperty(..)` (ES5) استفاده کنیم:

```js
anotherObj = {};

Object.defineProperty(anotherObj,"fave",{
    value: 42,
    enumerable: true,     // پیش‌فرض اگر حذف شود
    writable: true,       // پیش‌فرض اگر حذف شود
    configurable: true    // پیش‌فرض اگر حذف شود
});

anotherObj.fave;          // 42
```

اگر ویژگی موجود هنوز به‌عنوان non-configurable علامت‌گذاری نشده (با `configurable: false` در descriptorش)، همیشه می‌توان با `Object.defineProperty(..)` دوباره تعریف/بازنویسی کرد.

| WARNING: |
| :--- |
| چند بخش قبلی این فصل به «کپی» یا «تکرار» ویژگی‌ها اشاره می‌کنند. ممکن است فرض شود چنین کپی/تکرار در سطح property descriptor باشد. با این حال، هیچ‌کدام از آن عملیات‌ها واقعاً این‌طور کار نمی‌کنند؛ همه دسترسی و انتساب به سبک `=` ساده انجام می‌دهند که اثر نادیده گرفتن هر ظرافتی در نحوهٔ تعریف descriptor زیربنایی ویژگی را دارد. |

هرچند در دنیای واقعی به‌مراتب کمتر رایج به نظر می‌رسد، حتی می‌توانیم چند ویژگی یکجا تعریف کنیم، هر کدام با descriptor خودشان:

```js
anotherObj = {};

Object.defineProperties(anotherObj,{
    "fave": {
        // یک property descriptor
    },
    "superFave": {
        // property descriptor دیگر
    }
});
```

دیدن این استفاده چندان رایج نیست، چون کمتر پیش می‌آید که نیاز به کنترل خاص تعریف چند ویژگی داشته باشید. اما ممکن است در برخی موارد مفید باشد.

### ویژگی‌های Accessor

property descriptor معمولاً ویژگی `value` تعریف می‌کند، همان‌طور که بالا نشان داده شد. با این حال، نوع خاصی از ویژگی به نام «accessor property» (یعنی getter/setter) قابل تعریف است. برای چنین ویژگی‌ای، descriptorش ویژگی ثابت `value` تعریف نمی‌کند، بلکه چیزی شبیه این می‌شود:

```js
{
    get() { .. },    // تابع برای فراخوانی هنگام بازیابی مقدار
    set(v) { .. },   // تابع برای فراخوانی هنگام انتساب مقدار
    // .. enumerable و غیره
}
```

یک getter شبیه دسترسی به ویژگی (`obj.prop`) به نظر می‌رسد، اما در زیر کاپوت متد `get()` تعریف‌شده را فراخوانی می‌کند؛ انگار `obj.prop()` فراخوانی کرده بودید. یک setter شبیه انتساب ویژگی (`obj.prop = value`) به نظر می‌رسد، اما متد `set(..)` تعریف‌شده را فراخوانی می‌کند؛ انگار `obj.prop(value)` فراخوانی کرده بودید.

بیایید یک accessor property از نوع getter/setter را نشان دهیم:

```js
anotherObj = {};

Object.defineProperty(anotherObj,"fave",{
    get() { console.log("Getting 'fave' value!"); return 123; },
    set(v) { console.log(`Ignoring ${v} assignment.`); }
});

anotherObj.fave;
// Getting 'fave' value!
// 123

anotherObj.fave = 42;
// Ignoring 42 assignment.

anotherObj.fave;
// Getting 'fave' value!
// 123
```

### Enumerable، Writable، Configurable

علاوه بر `value` یا `get()` / `set(..)`، ۳ attribute دیگر property descriptor این‌ها هستند (همان‌طور که بالا نشان داده شد):

* `enumerable`
* `writable`
* `configurable`

attribute `enumerable` کنترل می‌کند که آیا ویژگی در شمارش‌های مختلف ویژگی‌های شیء ظاهر شود، مثل `Object.keys(..)`، `Object.entries(..)`، حلقه‌های `for..in` و کپی که با `...` object spread و `Object.assign(..)` رخ می‌دهد. اکثر ویژگی‌ها باید enumerable بمانند، اما می‌توانید ویژگی‌های خاص خاص روی شیء را non-enumerable علامت بزنید اگر نباید iterate/copy شوند.

attribute `writable` کنترل می‌کند که آیا انتساب `value` (از طریق `=`) مجاز است. برای «فقط خواندنی» کردن ویژگی، آن را با `writable: false` تعریف کنید. با این حال، تا زمانی که ویژگی هنوز configurable است، `Object.defineProperty(..)` هنوز می‌تواند مقدار را با تنظیم متفاوت `value` تغییر دهد.

attribute `configurable` کنترل می‌کند که آیا **descriptor** ویژگی می‌تواند دوباره تعریف/بازنویسی شود. ویژگی‌ای که `configurable: false` است به تعریفش قفل است و هر تلاش بعدی برای تغییرش با `Object.defineProperty(..)` شکست می‌خورد. ویژگی non-configurable هنوز می‌تواند مقادیر جدید انتساب شود (از طریق `=`)، تا زمانی که `writable: true` هنوز روی descriptor ویژگی تنظیم است.
