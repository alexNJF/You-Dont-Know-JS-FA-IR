# API مربوط به `Reflect`

آبجکت `Reflect` یک آبجکت ساده است (مثل `Math`)، نه تابع/سازنده مثل بعضی nativeهای دیگر.

این آبجکت شامل توابع ایستایی است که با کارهای مختلف متاپروگرمینگ متناظرند و شما می‌توانید آن‌ها را کنترل کنید. این توابع با متدهای handler (*trap*) قابل تعریف در Proxyها رابطه‌ی یک‌به‌یک دارند.

بعضی تابع‌ها با نام مشابه در `Object` را قبلاً دیده‌اید:

* `Reflect.getOwnPropertyDescriptor(..)`
* `Reflect.defineProperty(..)`
* `Reflect.getPrototypeOf(..)`
* `Reflect.setPrototypeOf(..)`
* `Reflect.preventExtensions(..)`
* `Reflect.isExtensible(..)`

این utilityها عموماً مثل نسخه‌ی `Object.*` کار می‌کنند. اما یک تفاوت مهم: نسخه‌های `Object.*` تلاش می‌کنند اگر آرگومان اول (target) آبجکت نباشد آن را به آبجکت coercion کنند. متدهای `Reflect.*` در این حالت مستقیم خطا می‌دهند.

کلیدهای آبجکت را می‌شود با این utilityها دسترسی/بازرسی کرد:

* `Reflect.ownKeys(..)`: فهرست تمام کلیدهای own (غیر «ارث‌بری‌شده») را برمی‌گرداند؛ معادل خروجی ترکیبی `Object.getOwnPropertyNames(..)` و `Object.getOwnPropertySymbols(..)`. برای ترتیب کلیدها بخش «ترتیب enumerate کردن پراپرتی‌ها» را ببینید.
* `Reflect.enumerate(..)`: iteratorی برمی‌گرداند که همه‌ی کلیدهای non-symbol از نوع enumerable (چه own چه «ارث‌بری‌شده») را تولید می‌کند. عملاً همان مجموعه کلیدهایی است که `for..in` پردازش می‌کند. برای ترتیب کلیدها همان بخش «ترتیب enumerate کردن پراپرتی‌ها» را ببینید.
* `Reflect.has(..)`: عملاً معادل عملگر `in` است برای بررسی وجود پراپرتی روی آبجکت یا زنجیره‌ی `[[Prototype]]` آن. مثلاً `Reflect.has(o,"foo")` عملاً همان `"foo" in o` است.

فراخوانی تابع و سازنده را می‌شود جدا از سینتکس عادی (`(..)` و `new`) دستی انجام داد:

* `Reflect.apply(..)`: مثلاً `Reflect.apply(foo,thisObj,[42,"bar"])` تابع `foo(..)` را با `thisObj` به‌عنوان `this` صدا می‌زند و آرگومان‌های `42` و `"bar"` را پاس می‌دهد.
* `Reflect.construct(..)`: مثلاً `Reflect.construct(foo,[42,"bar"])` عملاً همان `new foo(42,"bar")` است.

دسترسی، تنظیم و حذف پراپرتی آبجکت هم دستی با این utilityها ممکن است:

* `Reflect.get(..)`: مثلاً `Reflect.get(o,"foo")` مقدار `o.foo` را می‌گیرد.
* `Reflect.set(..)`: مثلاً `Reflect.set(o,"foo",42)` عملاً همان `o.foo = 42` است.
* `Reflect.deleteProperty(..)`: مثلاً `Reflect.deleteProperty(o,"foo")` عملاً همان `delete o.foo` است.

قابلیت‌های متاپروگرمینگ `Reflect` معادل‌های برنامه‌نویسی‌شده‌ای برای امکانات سینتکسی فراهم می‌کنند و عملیات انتزاعی قبلاً پنهان را در اختیار می‌گذارند. مثلاً می‌توانید با این‌ها ویژگی‌ها و APIهای *زبان‌های دامنه‌محور* (DSL) را توسعه دهید.

### ترتیب پراپرتی‌ها

قبل از ES6، ترتیبی که کلیدها/پراپرتی‌های آبجکت فهرست می‌شدند وابسته به پیاده‌سازی بود و در مشخصات تعریف نشده بود. معمولاً اغلب موتور‌ها به ترتیب ایجاد enumerate می‌کردند، ولی توسعه‌دهنده‌ها همیشه تشویق می‌شدند روی این ترتیب تکیه نکنند.

از ES6 به بعد، ترتیب فهرست‌کردن پراپرتی‌های own توسط الگوریتم `[[OwnPropertyKeys]]` (مشخصات ES6، بخش 9.1.12) تعریف شده است؛ این الگوریتم همه‌ی پراپرتی‌های own (رشته یا symbol) را مستقل از enumerable بودن برمی‌گرداند. این ترتیب فقط برای `Reflect.ownKeys(..)` تضمین‌شده است (و به تبع آن `Object.getOwnPropertyNames(..)` و `Object.getOwnPropertySymbols(..)`).

ترتیب به این شکل است:

1. اول پراپرتی‌های own که اندیس صحیح هستند، به ترتیب عددی صعودی
2. سپس بقیه‌ی نام‌های پراپرتی رشته‌ای own، به ترتیب ایجاد
3. در پایان پراپرتی‌های symbol از نوع own، به ترتیب ایجاد

مثال:

```js
var o = {};

o[Symbol("c")] = "yay";
o[2] = true;
o[1] = true;
o.b = "awesome";
o.a = "cool";

Reflect.ownKeys( o );				// [1,2,"b","a",Symbol(c)]
Object.getOwnPropertyNames( o );	// [1,2,"b","a"]
Object.getOwnPropertySymbols( o );	// [Symbol(c)]
```

در مقابل، الگوریتم `[[Enumerate]]` (مشخصات ES6، بخش 9.1.11) فقط پراپرتی‌های enumerable را برمی‌گرداند، هم از target و هم از زنجیره‌ی `[[Prototype]]`. این الگوریتم توسط `Reflect.enumerate(..)` و `for..in` استفاده می‌شود. ترتیب قابل مشاهده وابسته به پیاده‌سازی است و مشخصات آن را کنترل نمی‌کند.

اما `Object.keys(..)` با `[[OwnPropertyKeys]]` فهرست کلیدهای own را می‌گیرد، سپس non-enumerableها را حذف می‌کند و بعد ترتیب را به‌منظور هم‌خوانی با رفتار قدیمی وابسته به پیاده‌سازی (به‌خصوص `JSON.stringify(..)` و `for..in`) بازمرتب می‌کند. بنابراین ترتیبش به‌صورت غیرمستقیم با `Reflect.enumerate(..)` هم‌راستا می‌شود.

یعنی چهار سازوکار (`Reflect.enumerate(..)`، `Object.keys(..)`، `for..in` و `JSON.stringify(..)`) از نظر ترتیب قابل مشاهده با هم match می‌شوند، هرچند از مسیرهای فنی متفاوت به آن می‌رسند.

پیاده‌سازی‌ها مجازند این چهار مورد را با ترتیب `[[OwnPropertyKeys]]` یکسان کنند، ولی اجباری ندارند. با این حال احتمالاً رفتاری شبیه این می‌بینید:

```js
var o = { a: 1, b: 2 };
var p = Object.create( o );
p.c = 3;
p.d = 4;

for (var prop of Reflect.enumerate( p )) {
	console.log( prop );
}
// c d a b

for (var prop in p) {
	console.log( prop );
}
// c d a b

JSON.stringify( p );
// {"c":3,"d":4}

Object.keys( p );
// ["c","d"]
```

خلاصه: از ES6 به بعد `Reflect.ownKeys(..)`، `Object.getOwnPropertyNames(..)` و `Object.getOwnPropertySymbols(..)` ترتیب قابل‌پیش‌بینی و قابل‌اتکای تضمین‌شده در مشخصات دارند. پس کدی که روی این ترتیب تکیه می‌کند امن است.

`Reflect.enumerate(..)`، `Object.keys(..)` و `for..in` (و به تبع آن `JSON.stringify(..)`) همچنان مثل قبل ترتیب قابل مشاهده‌ی مشترک دارند، اما این ترتیب لزوماً با `Reflect.ownKeys(..)` یکسان نیست. پس هنوز باید در تکیه بر ترتیب وابسته به پیاده‌سازی با احتیاط عمل کرد.
