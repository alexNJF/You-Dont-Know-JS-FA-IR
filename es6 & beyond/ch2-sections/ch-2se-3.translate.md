# Default Parameter Values

یکی از رایج‌ترین idiomها در JavaScript تعیین default value برای parameterهای function است. شکلی که سال‌ها استفاده کرده‌ایم آشناست:

```js
function foo(x,y) {
	x = x || 11;
	y = y || 31;

	console.log( x + y );
}

foo();				// 42
foo( 5, 6 );		// 11
foo( 5 );			// 36
foo( null, 6 );		// 17
```

اگر این الگو را استفاده کرده باشید می‌دانید هم مفید است و هم کمی خطرناک؛ مثلاً وقتی بخواهید مقدار falsy را واقعاً پاس دهید:

```js
foo( 0, 42 );		// 53 <-- Oops, not 42
```

چرا؟ چون `0` falsy است و `x || 11` خروجی `11` می‌دهد نه `0`.

برای حل این gotcha بعضی‌ها verboseتر می‌نویسند:

```js
function foo(x,y) {
	x = (x !== undefined) ? x : 11;
	y = (y !== undefined) ? y : 31;

	console.log( x + y );
}

foo( 0, 42 );			// 42
foo( undefined, 6 );	// 17
```

اینجا هر مقداری جز `undefined` مستقیم پذیرفته می‌شود. `undefined` یعنی «این argument را ندادم». خوب است مگر اینکه واقعاً بخواهید `undefined` پاس دهید.

در آن حالت می‌توانید بفهمید argument واقعاً *حذف* شده یا نه، با بررسی حضورش در `arguments`:

```js
function foo(x,y) {
	x = (0 in arguments) ? x : 11;
	y = (1 in arguments) ? y : 31;

	console.log( x + y );
}

foo( 5 );				// 36
foo( 5, undefined );	// NaN
```

اما چطور argument اول (`x`) را حذف کنیم بدون اینکه هیچ مقدار علامت‌دهنده‌ای (حتی `undefined`) پاس دهیم؟

`foo(,5)` وسوسه‌کننده است ولی syntax نامعتبر است. `foo.apply(null,[,5])` هم به‌خاطر رفتار `apply(..)` عملاً `[undefined,5]` می‌شود و حذف رخ نمی‌دهد.

اگر دقیق‌تر بررسی کنید، حذف argument فقط از انتهای لیست ممکن است (با پاس‌دادن تعداد کمتر). حذف از وسط یا ابتدای argumentها ممکن نیست.

اینجا یک اصل طراحی مهم در JavaScript داریم: `undefined` یعنی *missing*. حداقل برای argumentهای function، بین `undefined` و *missing* تفاوتی نیست.

**نکته:** در بخش‌های دیگر JS این اصل همیشه برقرار نیست (مثل arrayهایی با slot خالی). برای جزئیات به *Types & Grammar* مراجعه کنید.

با این مقدمه، ES6 یک syntax تمیز برای default valueِ argumentهای missing اضافه می‌کند:

```js
function foo(x = 11, y = 31) {
	console.log( x + y );
}

foo();					// 42
foo( 5, 6 );			// 11
foo( 0, 42 );			// 42

foo( 5 );				// 36
foo( 5, undefined );	// 36 <-- `undefined` is missing
foo( 5, null );			// 5  <-- null coerces to `0`

foo( undefined, 6 );	// 17 <-- `undefined` is missing
foo( null, 6 );			// 6  <-- null coerces to `0`
```

نتایج را ببینید: هم تفاوت‌های ظریف دارد و هم شباهت‌هایی با روش‌های قبلی.

`x = 11` در declaration تابع بیشتر شبیه `x !== undefined ? x : 11` است تا idiom رایج `x || 11`. پس هنگام مهاجرت کد پیشا-ES6 به این syntax باید دقت کنید.

**نکته:** پارامتر rest/gather (بخش "Spread/Rest") نمی‌تواند default value داشته باشد. پس چیزی مثل `function foo(...vals=[1,2,3]) {` معتبر نیست و این منطق را باید دستی پیاده کنید.

### Default Value Expressions

default value تابع فقط مقدار ساده مثل `31` نیست؛ هر expression معتبر می‌تواند باشد، حتی function call:

```js
function bar(val) {
	console.log( "bar called!" );
	return y + val;
}

function foo(x = y + 3, z = bar( x )) {
	console.log( x, z );
}

var y = 5;
foo();								// "bar called"
									// 8 13
foo( 10 );							// "bar called"
									// 10 15
y = 6;
foo( undefined, 10 );				// 9 10
```

default expressionها lazy evaluate می‌شوند؛ فقط وقتی لازم باشند اجرا می‌شوند: یعنی وقتی argument parameter حذف شده یا `undefined` است.

یک نکتهٔ ظریف: parameterهای رسمی function scope مخصوص خودشان را دارند (مثل یک scope bubble دور `( .. )` declaration)، نه scope بدنهٔ تابع. بنابراین resolve identifier در default expression اول سراغ scope parameterهای رسمی می‌رود و بعد به scope بیرونی.

```js
var w = 1, z = 2;

function foo( x = w + 1, y = x + 1, z = z + 1 ) {
	console.log( x, y, z );
}

foo();					// ReferenceError
```

در `w + 1`، `w` در scope parameterها پیدا نمی‌شود، پس `w` بیرونی استفاده می‌شود. سپس در `x + 1`، `x` در همان scope parameterها پیدا می‌شود و چون قبلاً initialize شده، assignment `y` درست انجام می‌شود.

اما در `z + 1`، `z` به parameterی می‌خورد که در آن لحظه هنوز initialize نشده؛ بنابراین دیگر به `z` بیرونی مراجعه نمی‌کند.

همان‌طور که در بخش "`let` Declarations" گفتیم، ES6 ناحیهٔ TDZ دارد که دسترسی به variable پیش از initialization را منع می‌کند. بنابراین `z + 1` خطای TDZ از نوع `ReferenceError` می‌دهد.

با اینکه برای خوانایی معمولاً ایدهٔ خوبی نیست، default expression حتی می‌تواند inline function expression call (IIFE) باشد:

```js
function foo( x =
	(function(v){ return v + 11; })( 31 )
) {
	console.log( x );
}

foo();			// 42
```

به‌ندرت پیش می‌آید IIFE (یا هر inline function expression اجرایی) برای default expression مناسب باشد. اگر وسوسه شدید، یک قدم عقب بروید و دوباره ارزیابی کنید.

**هشدار:** اگر آن IIFE سعی می‌کرد به identifier `x` دسترسی پیدا کند و `x` خودش را declare نکرده بود، این هم TDZ error می‌شد.

IIFE در snippet بالا از این جهت IIFE است که function همان‌جا با `(31)` اجرا می‌شود. اگر آن بخش را حذف می‌کردیم، default value `x` خودِ function reference می‌شد (مثلاً callback پیش‌فرض):

```js
function ajax(url, cb = function(){}) {
	// ..
}

ajax( "http://some.url.1" );
```

اینجا عملاً می‌خواهیم `cb` اگر داده نشد به یک no-op function خالی پیش‌فرض شود. این function expression صرفاً reference است، نه call (در انتها `()` ندارد) و همین هدف را محقق می‌کند.

از اوایل JS یک نکتهٔ کمتر شناخته‌شده اما مفید داریم: `Function.prototype` خودش یک no-op function خالی است. پس declaration می‌توانست `cb = Function.prototype` باشد و از ساخت inline function expression هم صرفه‌جویی کند.
