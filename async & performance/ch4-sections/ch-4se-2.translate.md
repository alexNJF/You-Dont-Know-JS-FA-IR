# تولید مقدار با Generator

در بخش قبلی گفتیم generator یک کاربرد جالب دارد: تولید مقدار. این **تمرکز اصلی** این فصل نیست، اما اگر مبانی‌اش را نگوییم ناقص می‌ماند، مخصوصاً چون ریشه‌ی نام «generator» دقیقاً همین کاربرد است.

کمی از بحث اصلی فاصله می‌گیریم و کوتاه سراغ *iterator* می‌رویم، بعد دوباره برمی‌گردیم به ارتباطش با generator و استفاده از generator برای *تولید* مقدار.

### تولیدکننده‌ها و Iteratorها

تصور کنید می‌خواهید یک دنباله مقدار تولید کنید که هر مقدار رابطه‌ی مشخصی با مقدار قبلی دارد. برای این کار به یک producer حالت‌مند نیاز دارید که آخرین مقدار خروجی را به خاطر بسپارد.

می‌شود خیلی مستقیم با closure تابعی چنین چیزی را پیاده‌سازی کرد (کتاب *Scope & Closures*):

```js
var gimmeSomething = (function(){
	var nextVal;

	return function(){
		if (nextVal === undefined) {
			nextVal = 1;
		}
		else {
			nextVal = (3 * nextVal) + 6;
		}

		return nextVal;
	};
})();

gimmeSomething();		// 1
gimmeSomething();		// 9
gimmeSomething();		// 33
gimmeSomething();		// 105
```

**نکته:** منطق محاسبه‌ی `nextVal` را می‌شد ساده‌تر نوشت، اما از نظر مفهومی نمی‌خواهیم *مقدار بعدی* را تا زمانی که فراخوانی *بعدی* `gimmeSomething()` انجام نشده حساب کنیم، چون در حالت کلی این می‌تواند برای producerهای با resource محدود/پایدار (جدی‌تر از `number` ساده) طراحی resource-leaky باشد.

تولید یک سری عدد دلخواه مثال خیلی واقع‌گرایانه‌ای نیست. اما اگر در حال تولید record از یک منبع داده باشید، تقریباً همین الگو را خواهید داشت.

در واقع این کار یک pattern رایج طراحی است که معمولاً با iterator حل می‌شود. *iterator* رابطی استاندارد برای جلو رفتن مرحله‌ای روی مجموعه‌ای از مقدارهای یک producer است. در JS (مثل بیشتر زبان‌ها)، رابط iterator این است که هر بار برای گرفتن مقدار بعدی `next()` را صدا بزنید.

می‌توانیم رابط استاندارد *iterator* را برای producer عددی‌مان پیاده کنیم:

```js
var something = (function(){
	var nextVal;

	return {
		// needed for `for..of` loops
		[Symbol.iterator]: function(){ return this; },

		// standard iterator interface method
		next: function(){
			if (nextVal === undefined) {
				nextVal = 1;
			}
			else {
				nextVal = (3 * nextVal) + 6;
			}

			return { done:false, value:nextVal };
		}
	};
})();

something.next().value;		// 1
something.next().value;		// 9
something.next().value;		// 33
something.next().value;		// 105
```

**نکته:** در بخش «Iterables» توضیح می‌دهیم چرا قسمت `[Symbol.iterator]: ..` لازم است. از نظر syntax، اینجا دو ویژگی ES6 داریم. اول، syntax `[ .. ]` که *computed property name* است (کتاب *this & Object Prototypes*): یعنی در object literal یک expression می‌دهید و نتیجه‌ی expression نام پراپرتی می‌شود. دوم، `Symbol.iterator` که یکی از `Symbol`های ویژه‌ی ازپیش‌تعریف‌شده در ES6 است (کتاب *ES6 & Beyond*).

فراخوانی `next()` شیئی با دو پراپرتی برمی‌گرداند: `done` یک `boolean` برای وضعیت پایان *iterator*، و `value` مقدار iteration را نگه می‌دارد.

ES6 همچنین حلقه‌ی `for..of` را اضافه می‌کند، یعنی iterator استاندارد را می‌شود مستقیماً با syntax حلقه‌ی native مصرف کرد:

```js
for (var v of something) {
	console.log( v );

	// don't let the loop run forever!
	if (v > 500) {
		break;
	}
}
// 1 9 33 105 321 969
```

**نکته:** چون iterator ما همیشه `done:false` برمی‌گرداند، این `for..of` تا ابد ادامه می‌داد؛ برای همین `break` گذاشتیم. iterator بی‌پایان کاملاً مجاز است، اما مواردی هم هست که iterator روی مجموعه‌ی محدود حرکت می‌کند و نهایتاً `done:true` برمی‌گرداند.

حلقه‌ی `for..of` به‌صورت خودکار برای هر iteration `next()` را صدا می‌زند -- و مقداری به `next()` پاس نمی‌دهد -- و وقتی `done:true` بگیرد خودکار متوقف می‌شود. برای loop زدن روی داده خیلی مفید است.

البته می‌توانید iteratorها را دستی loop کنید: `next()` بزنید و `done:true` را چک کنید تا بفهمید چه زمانی باید متوقف شوید:

```js
for (
	var ret;
	(ret = something.next()) && !ret.done;
) {
	console.log( ret.value );

	// don't let the loop run forever!
	if (ret.value > 500) {
		break;
	}
}
// 1 9 33 105 321 969
```

**نکته:** این روش دستیِ `for` قطعاً از `for..of` ES6 زشت‌تر است، اما مزیتش این است که اگر لازم باشد می‌توانید به `next(..)` مقدار پاس بدهید.

علاوه بر ساخت iterator سفارشی، خیلی از ساختارهای داده‌ی built-in در JS (از ES6 به بعد)، مثل `array`، iterator پیش‌فرض دارند:

```js
var a = [1,3,5,7,9];

for (var v of a) {
	console.log( v );
}
// 1 3 5 7 9
```

حلقه‌ی `for..of` از `a` iterator می‌گیرد و خودکار با آن روی مقدارهای `a` جلو می‌رود.

**نکته:** شاید عجیب باشد، اما در ES6 عمداً `object` معمولی مثل `array` iterator پیش‌فرض ندارد. دلیلش عمیق‌تر از محدوده‌ی این بحث است. اگر فقط می‌خواهید روی پراپرتی‌های object iterate کنید (بدون تضمین ترتیب خاص)، `Object.keys(..)` یک `array` می‌دهد و بعد می‌توانید چیزی مثل `for (var k of Object.keys(obj)) { .. }` بنویسید. چنین `for..of`ی روی keyها شبیه `for..in` است، با این تفاوت که `Object.keys(..)` پراپرتی‌های زنجیره‌ی `[[Prototype]]` را نمی‌آورد ولی `for..in` می‌آورد (کتاب *this & Object Prototypes*).

### Iterableها

شیء `something` در مثال ما چون متد `next()` دارد یک *iterator* است. اما اصطلاح نزدیک دیگر *iterable* است: یعنی `object`ی که **حاوی** iteratorی باشد که روی مقدارهایش iteration کند.

از ES6 به بعد، روش گرفتن iterator از iterable این است که iterable باید تابعی با نام Symbol ویژه‌ی `Symbol.iterator` داشته باشد. وقتی این تابع صدا زده شود، iterator برگرداند. اجباری نیست، اما معمولاً هر بار باید یک iterator تازه بسازد.

`a` در snippet قبلی یک iterable است. حلقه‌ی `for..of` خودکار تابع `Symbol.iterator` آن را صدا می‌زند و iterator می‌سازد. ولی می‌توانیم دستی هم صدا بزنیم:

```js
var a = [1,3,5,7,9];

var it = a[Symbol.iterator]();

it.next().value;	// 1
it.next().value;	// 3
it.next().value;	// 5
..
```

در کد قبلی که `something` را تعریف کردیم، شاید این خط به چشم‌تان خورده باشد:

```js
[Symbol.iterator]: function(){ return this; }
```

این قطعه‌ی کمی گیج‌کننده باعث می‌شود خود مقدار `something` -- یعنی interface iterator آن -- در عین حال iterable هم باشد؛ یعنی هم iterable است هم iterator. بعد `something` را به `for..of` می‌دهیم:

```js
for (var v of something) {
	..
}
```

حلقه‌ی `for..of` انتظار iterable دارد، پس می‌گردد و `Symbol.iterator` آن را صدا می‌زند. ما آن را طوری تعریف کردیم که `return this` بدهد؛ پس خودش را برمی‌گرداند و `for..of` هم بدون اینکه بداند تفاوتی وجود داشته، ادامه می‌دهد.

### Iterator مربوط به Generator

حالا برگردیم به generatorها در context iterator. generator را می‌توان producer مقدار دانست که با `next()` روی interface iterator، مقدارها را یکی‌یکی بیرون می‌کشیم.

پس خود generator از نظر فنی iterable نیست، هرچند خیلی شبیه است -- وقتی generator را اجرا می‌کنید، iterator می‌گیرید:

```js
function *foo(){ .. }

var it = foo();
```

می‌توانیم همان producer سری عددی بی‌نهایت را با generator بنویسیم:

```js
function *something() {
	var nextVal;

	while (true) {
		if (nextVal === undefined) {
			nextVal = 1;
		}
		else {
			nextVal = (3 * nextVal) + 6;
		}

		yield nextVal;
	}
}
```

**نکته:** حلقه‌ی `while(true)` معمولاً در برنامه‌ی JS واقعی ایده‌ی خیلی بدی است، حداقل اگر `break` یا `return` نداشته باشد؛ چون احتمالاً sync تا ابد اجرا می‌شود و UI مرورگر را قفل می‌کند. اما داخل generator، اگر `yield` داشته باشد معمولاً کاملاً قابل‌قبول است، چون generator در هر iteration روی `yield` pause می‌شود و کنترل را به برنامه‌ی اصلی و/یا صف event loop برمی‌گرداند. به زبان ساده: «generatorها `while(true)` را دوباره به JS برگرداندند!»

این خیلی تمیزتر و ساده‌تر نیست؟ چون generator در هر `yield` pause می‌شود، state (scope) تابع `*something()` حفظ می‌شود؛ بنابراین دیگر boilerplate مربوط به closure برای نگه‌داشتن state بین فراخوانی‌ها لازم نیست.

نه‌فقط کد ساده‌تر است -- چون interface iterator را دستی نساخته‌ایم -- بلکه کد قابل‌استدلال‌تر هم هست، چون intent را شفاف‌تر بیان می‌کند. مثلاً `while(true)` می‌گوید این generator قرار است تا همیشه ادامه بدهد؛ تا وقتی درخواست می‌کنیم مقدار *تولید* کند.

حالا generator جدید `*something()` را با `for..of` استفاده کنیم؛ می‌بینید تقریباً همان‌طور کار می‌کند:

```js
for (var v of something()) {
	console.log( v );

	// don't let the loop run forever!
	if (v > 500) {
		break;
	}
}
// 1 9 33 105 321 969
```

ولی از `for (var v of something()) ..` ساده رد نشوید! اینجا مثل مثال قبل صرفاً `something` را به‌عنوان مقدار ندادیم، بلکه `*something()` را صدا زدیم تا iterator لازم برای `for..of` ساخته شود.

اگر دقیق نگاه کنید، از تعامل generator و loop دو سؤال پیش می‌آید:

* چرا نمی‌توانیم بنویسیم `for (var v of something) ..`؟ چون `something` اینجا generator است و iterable نیست. باید `something()` را صدا بزنیم تا producer برای loop ساخته شود.
* فراخوانی `something()` یک iterator می‌دهد، اما `for..of` iterable می‌خواهد، درست؟ بله. iterator مربوط به generator خودش `Symbol.iterator` دارد که عملاً `return this` می‌کند؛ دقیقاً مثل iterable سفارشی قبلی. یعنی iterator generator هم iterable هست!

#### متوقف کردن Generator

در مثال قبلی ممکن است به نظر برسد instance iterator مربوط به `*something()` بعد از `break` حلقه، برای همیشه suspended مانده.

اما یک رفتار پنهان این را مدیریت می‌کند. «اتمام غیرعادی» (termination زودهنگام) در `for..of` -- معمولاً با `break`، `return` یا exception بدون catch -- سیگنالی به iterator generator می‌فرستد تا terminate شود.

**نکته:** از نظر فنی `for..of` در پایان عادی loop هم همین سیگنال را می‌فرستد. برای generator عملاً بی‌اثر است، چون iterator generator از قبل باید تمام شده باشد تا loop تمام شود. اما iteratorهای سفارشی ممکن است از گرفتن این سیگنال اضافی خوش‌شان بیاید.

اگرچه `for..of` این سیگنال را خودکار می‌فرستد، گاهی می‌خواهید دستی بفرستید؛ این کار را با `return(..)` انجام می‌دهید.

اگر داخل generator بلوک `try..finally` بگذارید، حتی وقتی generator از بیرون تمام شود هم `finally` حتماً اجرا می‌شود. این برای cleanup منابع (اتصال دیتابیس و...) مفید است:

```js
function *something() {
	try {
		var nextVal;

		while (true) {
			if (nextVal === undefined) {
				nextVal = 1;
			}
			else {
				nextVal = (3 * nextVal) + 6;
			}

			yield nextVal;
		}
	}
	// cleanup clause
	finally {
		console.log( "cleaning up!" );
	}
}
```

مثال قبلی با `break` در `for..of`، این `finally` را trigger می‌کند. اما می‌توانید از بیرون هم iterator generator را با `return(..)` terminate کنید:

```js
var it = something();
for (var v of it) {
	console.log( v );

	// don't let the loop run forever!
	if (v > 500) {
		console.log(
			// complete the generator's iterator
			it.return( "Hello World" ).value
		);
		// no `break` needed here
	}
}
// 1 9 33 105 321 969
// cleaning up!
// Hello World
```

وقتی `it.return(..)` را صدا می‌زنیم، generator فوراً terminate می‌شود و طبیعتاً `finally` اجرا می‌شود. همچنین `value` برگشتی برابر چیزی می‌شود که به `return(..)` دادید، برای همین `"Hello World"` مستقیم برمی‌گردد. دیگر `break` لازم نیست چون iterator generator روی `done:true` قرار گرفته و `for..of` در iteration بعدی متوقف می‌شود.

بخش بزرگی از نام generator به همین کاربرد *مصرف مقدار تولیدشده* برمی‌گردد. اما دوباره تاکید: این فقط یکی از کاربردهای generator است، و راستش در context این کتاب حتی اصلی‌ترینش هم نیست.

حالا که mechanics کار را بهتر فهمیدیم، *گام بعد* این است که ببینیم generator در concurrency ناهمگام چطور به کار می‌آید.
