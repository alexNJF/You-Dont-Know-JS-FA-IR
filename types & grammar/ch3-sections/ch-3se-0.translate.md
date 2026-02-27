# شما جاوااسکریپت را نمی‌دانید: Types و Grammar - ویرایش اول
# فصل ۳: Natives

چند بار در فصل‌های ۱ و ۲ به built-inهای مختلف، که معمولاً «natives» نامیده می‌شوند، مثل `String` و `Number` اشاره کردیم. حالا آن‌ها را دقیق بررسی می‌کنیم.

فهرست رایج‌ترین natives:

* `String()`
* `Number()`
* `Boolean()`
* `Array()`
* `Object()`
* `Function()`
* `RegExp()`
* `Date()`
* `Error()`
* `Symbol()` — از ES6 اضافه شد!

همان‌طور که می‌بینید، این natives در واقع تابع‌های از پیش‌تعریف‌شده هستند.

اگر از زبانی مثل Java به JS می‌آیید، `String()` در JavaScript شبیه constructor یعنی `String(..)` که برای ساختن مقدار رشته عادت دارید به نظر می‌رسد. پس به‌سرعت می‌بینید می‌توانید کارهایی مثل این بکنید:

```js
var s = new String( "Hello World!" );

console.log( s.toString() ); // "Hello World!"
```

*درست* است که هر کدام از این natives را می‌توان به‌عنوان native constructor به کار برد. اما آنچه ساخته می‌شود ممکن است با آنچه فکر می‌کنید فرق داشته باشد.

```js
var a = new String( "abc" );

typeof a; // "object" ... not "String"

a instanceof String; // true

Object.prototype.toString.call( a ); // "[object String]"
```

نتیجهٔ شکل constructor برای ساختن مقدار (`new String("abc")`) یک object wrapper دور مقدار primitive (`"abc"`) است.

مهم این که `typeof` نشان می‌دهد این شیءها type خاص خودشان نیستند، بلکه درست‌تر subtypeهای type یعنی `object` هستند.

این object wrapper را می‌توان با این هم مشاهده کرد:

```js
console.log( a );
```

خروجی آن دستور بسته به مرورگرتان فرق می‌کند، چون کنسولهای توسعه‌دهنده آزادند هرطور مناسب می‌دانند شیء را برای بررسی سریال کنند.

**توجه:** در زمان نگارش، آخرین Chrome چیزی شبیه این چاپ می‌کند: `String {0: "a", 1: "b", 2: "c", length: 3, [[PrimitiveValue]]: "abc"}`. اما نسخه‌های قدیمی‌تر Chrome فقط این را چاپ می‌کردند: `String {0: "a", 1: "b", 2: "c"}`. آخرین Firefox الان `String ["a","b","c"]` چاپ می‌کند، اما قبلاً `"abc"` را به صورت ایتالیک چاپ می‌کرد که با کلیک بازکنندهٔ inspector شیء بود. البته این نتایج ممکن است سریع عوض شوند و تجربهٔ شما متفاوت باشد.

نکته این است که `new String("abc")` یک شیء wrapper رشته دور `"abc"` می‌سازد، نه فقط خود مقدار primitive یعنی `"abc"`.
