# `String`

رشته‌ها قبل از ES6 هم helperهای نسبتاً زیادی داشتند، اما موارد بیشتری هم به این مجموعه اضافه شده است.

### توابع Unicode

بخش «Unicode-Aware String Operations» در فصل ۲، درباره‌ی `String.fromCodePoint(..)`، `String#codePointAt(..)` و `String#normalize(..)` با جزئیات صحبت می‌کند. این‌ها برای بهبود پشتیبانی Unicode در مقدارهای رشته‌ای JS اضافه شده‌اند.

```js
String.fromCodePoint( 0x1d49e );			// "𝒞"

"ab𝒞d".codePointAt( 2 ).toString( 16 );		// "1d49e"
```

متد prototype رشته یعنی `normalize(..)` برای اجرای normalizationهای Unicode استفاده می‌شود؛ normalizationهایی که یا کاراکترها را با «combining mark»های مجاور ترکیب می‌کنند یا کاراکترهای ترکیب‌شده را تجزیه می‌کنند.

به‌طور کلی normalization اثر ظاهری قابل‌دیدی روی رشته ایجاد نمی‌کند، اما محتوای درونی رشته را تغییر می‌دهد. این تغییر می‌تواند روی چیزهایی مثل `length` یا دسترسی کاراکتر بر اساس موقعیت اثر بگذارد:

```js
var s1 = "e\u0301";
s1.length;							// 2

var s2 = s1.normalize();
s2.length;							// 1
s2 === "\xE9";						// true
```

`normalize(..)` یک آرگومان اختیاری می‌گیرد که فرم normalization را مشخص می‌کند. این آرگومان باید یکی از این چهار مقدار باشد: `"NFC"` (پیش‌فرض)، `"NFD"`، `"NFKC"` یا `"NFKD"`.

**نکته:** فرم‌های normalization و اثر دقیقشان روی رشته‌ها خارج از دامنه‌ی این بحث است. برای اطلاعات بیشتر: [Unicode Normalization Forms](http://www.unicode.org/reports/tr15/).

### تابع ایستای `String.raw(..)`

utility `String.raw(..)` به‌عنوان یک tag function داخلی برای template string literalها ارائه شده (فصل ۲)، تا مقدار خام رشته را بدون پردازش escape sequenceها بگیرید.

این تابع تقریباً هیچ‌وقت دستی صدا زده نمی‌شود و معمولاً با tagged template literal استفاده می‌شود:

```js
var str = "bc";

String.raw`\ta${str}d\xE9`;
// "\tabcd\xE9", not "	abcdé"
```

در رشته‌ی خروجی، `\` و `t` دو کاراکتر خام جدا هستند، نه یک escape sequence واحد (`\t`). درباره‌ی escape sequence یونیکد هم همین‌طور است.

### تابع prototype به نام `repeat(..)`

در زبان‌هایی مثل Python و Ruby می‌توانید رشته را این‌طور تکرار کنید:

```js
"foo" * 3;							// "foofoofoo"
```

این در JS کار نمی‌کند، چون ضرب `*` فقط برای عدد تعریف شده و `"foo"` به عدد `NaN` coercion می‌شود.

اما ES6 متد prototype رشته یعنی `repeat(..)` را برای همین کار تعریف می‌کند:

```js
"foo".repeat( 3 );					// "foofoofoo"
```

### توابع بازرسی رشته

علاوه بر `String#indexOf(..)` و `String#lastIndexOf(..)` از قبل ES6، سه متد جدید برای جست‌وجو/بازرسی اضافه شده: `startsWith(..)`، `endsWith(..)` و `includes(..)`.

```js
var palindrome = "step on no pets";

palindrome.startsWith( "step on" );	// true
palindrome.startsWith( "on", 5 );	// true

palindrome.endsWith( "no pets" );	// true
palindrome.endsWith( "no", 10 );	// true

palindrome.includes( "on" );		// true
palindrome.includes( "on", 6 );		// false
```

برای تمام متدهای جست‌وجو/بازرسی رشته، اگر دنبال رشته‌ی خالی `""` بگردید، یا در ابتدای رشته پیدا می‌شود یا در انتهای آن.

**هشدار:** این متدها به‌صورت پیش‌فرض عبارت باقاعده (regular expression) را به‌عنوان رشته‌ی جست‌وجو نمی‌پذیرند. برای اطلاعات درباره‌ی غیرفعال‌کردن بررسی `isRegExp` روی آرگومان اول، بخش «Regular Expression Symbols» در فصل ۷ را ببینید.
