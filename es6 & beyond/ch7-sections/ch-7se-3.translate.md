# Symbolهای شناخته‌شده

در بخش «Symbolها» در فصل ۲، نوع primitive جدید ES6 یعنی `symbol` را پوشش دادیم. علاوه بر symbolهایی که خودتان در برنامه می‌سازید، JS تعدادی symbol داخلی از پیش تعریف‌شده هم دارد که به آن‌ها *Well Known Symbols* (WKS) می‌گویند.

این مقدارهای symbol عمدتاً برای آشکارکردن پراپرتی‌های متای ویژه تعریف شده‌اند تا به برنامه‌های JS شما کنترل بیشتری روی رفتار زبان بدهند.

در این بخش هرکدام را کوتاه معرفی می‌کنیم و هدفش را می‌گوییم.

### `Symbol.iterator`

در فصل‌های ۲ و ۳ نماد `@@iterator` را معرفی و استفاده کردیم که به‌صورت خودکار توسط spread یعنی `...` و حلقه‌های `for..of` استفاده می‌شود. همچنین در فصل ۵ دیدیم `@@iterator` روی کالکشن‌های جدید ES6 تعریف شده است.

`Symbol.iterator` جایگاه ویژه (پراپرتی) روی هر آبجکت را نشان می‌دهد که سازوکارهای زبان به‌طور خودکار دنبال متدی در آن می‌گردند تا یک نمونه iterator برای مصرف مقدارهای آن آبجکت بسازد. خیلی از آبجکت‌ها به‌صورت پیش‌فرض این را دارند.

اما ما هم می‌توانیم با تنظیم `Symbol.iterator` برای هر مقدار آبجکتی منطق iterator خودمان را تعریف کنیم، حتی اگر iterator پیش‌فرض را override کنیم. جنبه‌ی متاپروگرمینگ این است که رفتاری تعریف می‌کنیم که بخش‌های دیگر JS (خصوصاً عملگرها و ساختارهای حلقه) هنگام پردازش آبجکت ما از آن استفاده کنند.

مثال:

```js
var arr = [4,5,6,7,8,9];

for (var v of arr) {
	console.log( v );
}
// 4 5 6 7 8 9

// define iterator that only produces values
// from odd indexes
arr[Symbol.iterator] = function*() {
	var idx = 1;
	do {
		yield this[idx];
	} while ((idx += 2) < this.length);
};

for (var v of arr) {
	console.log( v );
}
// 5 7 9
```

### `Symbol.toStringTag` و `Symbol.hasInstance`

یکی از رایج‌ترین کارهای متاپروگرمینگ، introspection روی مقدار برای تشخیص *نوع* آن است تا تصمیم بگیریم چه عملیاتی برایش مناسب است. در آبجکت‌ها دو تکنیک رایج بازرسی `toString()` و `instanceof` هستند.

مثال:

```js
function Foo() {}

var a = new Foo();

a.toString();				// [object Object]
a instanceof Foo;			// true
```

از ES6 به بعد می‌توانید رفتار این عملیات را کنترل کنید:

```js
function Foo(greeting) {
	this.greeting = greeting;
}

Foo.prototype[Symbol.toStringTag] = "Foo";

Object.defineProperty( Foo, Symbol.hasInstance, {
	value: function(inst) {
		return inst.greeting == "hello";
	}
} );

var a = new Foo( "hello" ),
	b = new Foo( "world" );

b[Symbol.toStringTag] = "cool";

a.toString();				// [object Foo]
String( b );				// [object cool]

a instanceof Foo;			// true
b instanceof Foo;			// false
```

نماد `@@toStringTag` روی prototype (یا خود instance) یک مقدار رشته‌ای مشخص می‌کند که در رشته‌سازی `[object ___]` استفاده شود.

نماد `@@hasInstance` متدی روی تابع سازنده است که مقدار آبجکت instance را می‌گیرد و شما با برگرداندن `true` یا `false` تصمیم می‌گیرید این مقدار instance محسوب بشود یا نه.

**نکته:** برای تنظیم `@@hasInstance` روی یک تابع باید از `Object.defineProperty(..)` استفاده کنید، چون نسخه‌ی پیش‌فرض روی `Function.prototype` دارای `writable: false` است. برای جزئیات بیشتر کتاب *this & Object Prototypes* این مجموعه را ببینید.

### `Symbol.species`

در بخش «Classes» در فصل ۳، نماد `@@species` را معرفی کردیم که تعیین می‌کند متدهای داخلی یک کلاس هنگام نیاز به ساخت نمونه‌ی جدید از کدام سازنده استفاده کنند.

مثال رایج، subclass کردن `Array` و تعیین این است که متدهای inherited مثل `slice(..)` از کدام سازنده (`Array(..)` یا زیرکلاس شما) استفاده کنند. به‌صورت پیش‌فرض، `slice(..)` وقتی روی instance زیرکلاس `Array` صدا زده شود، نمونه‌ی جدیدی از همان زیرکلاس می‌سازد که معمولاً هم همین رفتار مطلوب است.

اما می‌توانید با override کردن تعریف پیش‌فرض `@@species` کلاس، متاپروگرمینگ انجام دهید:

```js
class Cool {
	// defer `@@species` to derived constructor
	static get [Symbol.species]() { return this; }

	again() {
		return new this.constructor[Symbol.species]();
	}
}

class Fun extends Cool {}

class Awesome extends Cool {
	// force `@@species` to be parent constructor
	static get [Symbol.species]() { return Cool; }
}

var a = new Fun(),
	b = new Awesome(),
	c = a.again(),
	d = b.again();

c instanceof Fun;			// true
d instanceof Awesome;		// false
d instanceof Cool;			// true
```

تنظیم `Symbol.species` در سازنده‌های native داخلی به‌صورت پیش‌فرض همان رفتار `return this` است که در کلاس `Cool` دیدید. در کلاس‌های کاربر این پیش‌فرض وجود ندارد، ولی همان‌طور که دیدید تقلید از آن ساده است.

اگر متدهایی دارید که نمونه‌ی جدید می‌سازند، به‌جای hard-wire کردن `new this.constructor(..)` یا `new XYZ(..)` از الگوی متاپروگرمینگ `new this.constructor[Symbol.species](..)` استفاده کنید. آن‌وقت کلاس‌های مشتق می‌توانند `Symbol.species` را سفارشی کنند تا سازنده‌ی مورد استفاده برای ساخت این نمونه‌ها را کنترل کنند.

### `Symbol.toPrimitive`

در کتاب *Types & Grammar* این مجموعه، درباره‌ی عملیات انتزاعی coercion به نام `ToPrimitive` صحبت کردیم که وقتی آبجکت باید برای عملیاتی (مثل مقایسه‌ی `==` یا جمع `+`) به مقدار primitive تبدیل شود استفاده می‌شود. قبل از ES6 راهی برای کنترل این رفتار نبود.

از ES6 به بعد، نماد `@@toPrimitive` به‌عنوان پراپرتی روی هر آبجکت می‌تواند با تعریف یک متد، coercion مربوط به `ToPrimitive` را سفارشی کند.

مثال:

```js
var arr = [1,2,3,4,5];

arr + 10;				// 1,2,3,4,510

arr[Symbol.toPrimitive] = function(hint) {
	if (hint == "default" || hint == "number") {
		// sum all numbers
		return this.reduce( function(acc,curr){
			return acc + curr;
		}, 0 );
	}
};

arr + 10;				// 25
```

متد `Symbol.toPrimitive` یک *hint* با مقدار `"string"`، `"number"` یا `"default"` می‌گیرد (که باید مثل `"number"` تفسیر شود)، بسته به این‌که عملیات فراخواننده‌ی `ToPrimitive` چه نوعی انتظار دارد. در مثال بالا عملگر جمع `+` hint مشخصی ندارد (پس `"default"` پاس داده می‌شود). عملگر ضرب `*` hint `"number"` می‌دهد و `String(arr)` hint `"string"`.

**هشدار:** عملگر `==` اگر مقدار مقایسه‌شونده‌ی دیگر آبجکت نباشد، عملیات `ToPrimitive` را روی آبجکت بدون hint اجرا می‌کند -- یعنی اگر `@@toPrimitive` وجود داشته باشد با hint `"default"` صدا زده می‌شود. اما اگر هر دو طرف مقایسه آبجکت باشند، رفتار `==` دقیقاً مثل `===` می‌شود؛ یعنی خودِ referenceها مستقیم مقایسه می‌شوند. در این حالت `@@toPrimitive` اصلاً فراخوانی نمی‌شود. برای اطلاعات بیشتر درباره‌ی coercion و عملیات انتزاعی، کتاب *Types & Grammar* همین مجموعه را ببینید.

### Symbolهای مربوط به Regular Expression

چهار well-known symbol وجود دارد که برای آبجکت‌های regular expression قابل override هستند و تعیین می‌کنند این regexها در چهار تابع متناظر `String.prototype` با همان نام چطور استفاده شوند:

* `@@match`: مقدار `Symbol.match` در یک regex همان متدی است که برای match کردن کل یا بخشی از رشته با regex داده‌شده استفاده می‌شود. وقتی regex را به `String.prototype.match(..)` بدهید، از همین استفاده می‌شود.

   الگوریتم پیش‌فرض match در بخش 21.2.5.6 مشخصات ES6 آمده است: http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype-@@match . می‌توانید این الگوریتم را override کنید و قابلیت‌های اضافی regex مثل look-behind assertions بدهید.

   `Symbol.match` همچنین توسط عملیات انتزاعی `isRegExp` (نکته‌ی بخش «String Inspection Functions» در فصل ۶) استفاده می‌شود تا تشخیص دهد آبجکت قرار است regex باشد یا نه. اگر بخواهید این بررسی برای آبجکتی fail شود تا regex در نظر گرفته نشود، مقدار `Symbol.match` را `false` (یا هر مقدار falsy) بگذارید.
* `@@replace`: مقدار `Symbol.replace` در regex متدی است که `String.prototype.replace(..)` برای جایگزینی یک یا همه‌ی رخدادهای منطبق با الگوی regex در رشته استفاده می‌کند.

   الگوریتم پیش‌فرض replace در بخش 21.2.5.8 مشخصات ES6 آمده است: http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype-@@replace .

   یک استفاده‌ی جذاب از override این الگوریتم، اضافه کردن گزینه‌های بیشتر برای آرگومان `replacer` است؛ مثلاً پشتیبانی از `"abaca".replace(/a/g,[1,2,3])` که با مصرف iterable مقدارهای جایگزینی پیاپی، خروجی `"1b2c3"` تولید کند.
* `@@search`: مقدار `Symbol.search` در regex متدی است که `String.prototype.search(..)` برای جست‌وجوی زیررشته در یک رشته، مطابق regex داده‌شده، استفاده می‌کند.

   الگوریتم پیش‌فرض search در بخش 21.2.5.9 مشخصات ES6 آمده است: http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype-@@search .
* `@@split`: مقدار `Symbol.split` در regex متدی است که `String.prototype.split(..)` برای شکستن رشته به زیررشته‌ها در محل delimiterهای منطبق با regex داده‌شده استفاده می‌کند.

   الگوریتم پیش‌فرض split در بخش 21.2.5.11 مشخصات ES6 آمده است: http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype-@@split .

override کردن الگوریتم‌های داخلی regex برای افراد کم‌حوصله نیست! JS یک موتور regex بسیار بهینه دارد، پس کد کاربر شما احتمالاً خیلی کندتر خواهد بود. این نوع متاپروگرمینگ جالب و قدرتمند است، اما فقط وقتی واقعاً لازم یا مفید است باید استفاده شود.

### `Symbol.isConcatSpreadable`

نماد `@@isConcatSpreadable` را می‌توان به‌صورت پراپرتی بولی (`Symbol.isConcatSpreadable`) روی هر آبجکت (مثل آرایه یا iterable دیگر) تعریف کرد تا مشخص شود اگر به `concat(..)` آرایه پاس داده شد باید *spread* شود یا نه.

مثال:

```js
var a = [1,2,3],
	b = [4,5,6];

b[Symbol.isConcatSpreadable] = false;

[].concat( a, b );		// [1,2,3,[4,5,6]]
```

### `Symbol.unscopables`

نماد `@@unscopables` را می‌توان به‌صورت پراپرتی آبجکتی (`Symbol.unscopables`) روی هر آبجکت تعریف کرد تا مشخص کند کدام پراپرتی‌ها در دستور `with` می‌توانند/نمی‌توانند به‌عنوان متغیر lexical در scope در معرض دید باشند.

مثال:

```js
var o = { a:1, b:2, c:3 },
	a = 10, b = 20, c = 30;

o[Symbol.unscopables] = {
	a: false,
	b: true,
	c: false
};

with (o) {
	console.log( a, b, c );		// 1 20 3
}
```

مقدار `true` در آبجکت `@@unscopables` یعنی آن پراپرتی باید *unscopable* باشد و از متغیرهای lexical scope فیلتر شود. `false` یعنی حضورش در متغیرهای lexical scope مجاز است.

**هشدار:** دستور `with` در `strict` mode کاملاً ممنوع است و عملاً باید آن را منسوخ‌شده در زبان بدانیم. از آن استفاده نکنید. برای اطلاعات بیشتر کتاب *Scope & Closures* همین مجموعه را ببینید. چون `with` باید اجتناب شود، نماد `@@unscopables` هم عملاً کم‌اهمیت می‌شود.
