# نحو بهتر

یکی از چیزهای خوشایندی که `class`ِ ES6 را این‌قدر فریبنده جذاب می‌کند (پیوست الف را برای دلیل اجتناب ببینید!) سینتکس کوتاه برای اعلام متدهای class است:

```js
class Foo {
	methodName() { /* .. */ }
}
```

می‌توانیم کلمهٔ `function` را از اعلام حذف کنیم، که باعث شادی توسعه‌دهندگان JS همه‌جا می‌شود!

و شاید متوجه شده و آزرده شده باشید که سینتکس پیشنهادی OLOO بالا ظاهرهای زیادی از `function` دارد، که کمی خلاف هدف ساده‌سازی OLOO به‌نظر می‌رسد. **اما لازم نیست این‌طور باشد!**

از ES6 به بعد می‌توانیم *concise method declarations* را در هر object literal به‌کار ببریم، پس یک object به سبک OLOO می‌تواند این‌طور اعلام شود (همان sugar کوتاهِ بدنهٔ `class`):

```js
var LoginController = {
	errors: [],
	getUser() { // Look ma, no `function`!
		// ...
	},
	getPassword() {
		// ...
	}
	// ...
};
```

تقریباً تنها تفاوت این است که object literalها هنوز به جداکنندهٔ `,` بین المان‌ها نیاز دارند در حالی که سینتکس `class` ندارد. در کل طرح امور امتیازدهی کوچکی است.

افزون بر این، از ES6 به بعد، سینتکس سنگین‌تری که استفاده می‌کنید (مثل تعریف `AuthController`)، جایی که propertyها را جداگانه assign می‌کنید و از object literal استفاده نمی‌کنید، می‌تواند با object literal بازنویسی شود (تا بتوانید از concise methodها استفاده کنید)، و می‌توانید `[[Prototype]]` آن object را با `Object.setPrototypeOf(..)` تغییر دهید، این‌طور:

```js
// use nicer object literal syntax w/ concise methods!
var AuthController = {
	errors: [],
	checkAuth() {
		// ...
	},
	server(url,data) {
		// ...
	}
	// ...
};

// NOW, link `AuthController` to delegate to `LoginController`
Object.setPrototypeOf( AuthController, LoginController );
```

OLOO از ES6 به بعد، با concise methodها، **به‌مراتب دوستانه‌تر** از قبل است (و حتی آن موقع هم از کد سبک prototype کلاسیک بسیار ساده‌تر و خوشایندتر بود). **برای سینتکس object تمیز و خوشایند لازم نیست class** (پیچیدگی) را انتخاب کنید!

### Unlexical

یک نقطهٔ ضعف برای concise methodها وجود دارد که ظریف اما مهم است. این کد را در نظر بگیرید:

```js
var Foo = {
	bar() { /*..*/ },
	baz: function baz() { /*..*/ }
};
```

این de-sugaring سینتکسی است که بیان می‌کند آن کد چطور عمل می‌کند:

```js
var Foo = {
	bar: function() { /*..*/ },
	baz: function baz() { /*..*/ }
};
```

تفاوت را می‌بینید؟ short-handِ `bar()` به یک *anonymous function expression* (`function()..`) متصل به propertyِ `bar` تبدیل شد، چون خود function object شناسهٔ نام ندارد. آن را با *named function expression* دستی (`function baz()..`) مقایسه کنید که علاوه بر اتصال به propertyِ `.baz` شناسهٔ نام lexicalِ `baz` را دارد.

پس چه؟ در عنوان *«Scope & Closures»* این سری کتاب *«You Don't Know JS»* سه نقطهٔ ضعف اصلی *anonymous function expression*ها را به‌تفصیل پوشش می‌دهیم. فقط به‌طور خلاصه تکرار می‌کنیم تا با short-handِ concise method مقایسه کنیم.

نداشتن شناسهٔ `name` روی یک تابع anonymous:

1. debugging stack traceها را سخت‌تر می‌کند
2. self-referencing (بازگشت، event (un)binding و غیره) را سخت‌تر می‌کند
3. کد را (کمی) سخت‌تر فهم می‌کند

موارد ۱ و ۳ برای concise methodها صدق نمی‌کنند.

حتی با اینکه de-sugaring از *anonymous function expression* استفاده می‌کند که معمولاً در stack traceها `name` ندارد، مشخص شده که concise methodها propertyِ داخلی `name`ِ function object را متناسب تنظیم می‌کنند، پس stack traceها باید بتوانند از آن استفاده کنند (هرچند وابسته به پیاده‌سازی است و تضمین نشده).

متأسفانه مورد ۲ **هنوز نقطهٔ ضعف concise methodهاست**. شناسهٔ lexical برای استفاده به‌عنوان self-reference نخواهند داشت. در نظر بگیرید:

```js
var Foo = {
	bar: function(x) {
		if (x < 10) {
			return Foo.bar( x * 2 );
		}
		return x;
	},
	baz: function baz(x) {
		if (x < 10) {
			return baz( x * 2 );
		}
		return x;
	}
};
```

ارجاع دستی `Foo.bar(x*2)` بالا در این مثال تا حدی کافی است، اما موارد زیادی هست که یک تابع لزوماً نمی‌تواند چنین کند، مثل مواردی که تابع در delegation در objectهای مختلف به‌اشتراک گذاشته شده و از `this` binding استفاده می‌کند و غیره. می‌خواهید از یک self-reference واقعی استفاده کنید، و شناسهٔ `name`ِ function object بهترین راه برای آن است.

فقط از این caveat برای concise methodها آگاه باشید، و اگر با چنین مشکلاتی به‌خاطر نبود self-reference مواجه شدید، حتماً سینتکس concise method را **فقط برای همان اعلام** کنار بگذارید و به‌جای آن از شکل اعلام دستی *named function expression* استفاده کنید: `baz: function baz(){..}`.
