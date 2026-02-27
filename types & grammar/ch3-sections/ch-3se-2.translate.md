# Boxing Wrappers

این object wrapperها هدف خیلی مهمی دارند. مقدارهای primitive property یا متد ندارند، پس برای دسترسی به `.length` یا `.toString()` به یک object wrapper دور مقدار نیاز دارید. خوشبختانه JS به‌طور خودکار مقدار primitive را *box* (یعنی wrap) می‌کند تا این دسترسی‌ها برآورده شوند.

```js
var a = "abc";

a.length; // 3
a.toUpperCase(); // "ABC"
```

پس اگر قرار است مرتب به این propertyها/متدها روی مقدارهای رشته‌ایتان دسترسی داشته باشید، مثلاً شرط `i < a.length` در یک حلقهٔ `for`، شاید به نظر برسد منطقی است از اول شکل object مقدار را داشته باشید تا موتور JS مجبور نباشد به‌طور ضمنی برایتان بسازد.

اما معلوم می‌شود ایدهٔ بدی است. مرورگرها مدتها پیش موارد رایج مثل `.length` را بهینه کرده‌اند، یعنی برنامه‌تان *واقعاً کندتر* می‌شود اگر با استفادهٔ مستقیم از شکل object (که در مسیر بهینه نیست) بخواهید «از قبل بهینه» کنید.

به‌طور کلی، اساساً دلیلی برای استفادهٔ مستقیم از شکل object نیست. بهتر است فقط بگذارید boxing جایی که لازم است به‌طور ضمنی اتفاق بیفتد. به عبارت دیگر، هرگز کارهایی مثل `new String("abc")`، `new Number(42)` و غیره نکنید — همیشه استفاده از مقدارهای literal primitive یعنی `"abc"` و `42` را ترجیح دهید.

### Object Wrapper Gotchas

چند نکتهٔ مهم در استفادهٔ مستقیم از object wrapperها هست که اگر *واقعاً* انتخاب کنید استفاده کنید باید بدانید.

مثلاً مقدارهای wrap‌شده با `Boolean` را در نظر بگیرید:

```js
var a = new Boolean( false );

if (!a) {
	console.log( "Oops" ); // never runs
}
```

مشکل این است که یک object wrapper دور مقدار `false` ساخته‌اید، اما خود objectها «truthy» هستند (فصل ۴ را ببینید)، پس استفاده از object برعکس استفاده از خود مقدار زیرین یعنی `false` رفتار می‌کند، که کاملاً خلاف انتظار معمول است.

اگر می‌خواهید دستی یک مقدار primitive را box کنید، می‌توانید از تابع `Object(..)` (بدون کلیدواژهٔ `new`) استفاده کنید:

```js
var a = "abc";
var b = new String( a );
var c = Object( a );

typeof a; // "string"
typeof b; // "object"
typeof c; // "object"

b instanceof String; // true
c instanceof String; // true

Object.prototype.toString.call( b ); // "[object String]"
Object.prototype.toString.call( c ); // "[object String]"
```

باز هم، استفادهٔ مستقیم از object wrapper با boxing (مثل `b` و `c` بالا) معمولاً توصیه نمی‌شود، اما ممکن است در موارد نادری به آن‌ها برخورد کنید که مفید باشند.
