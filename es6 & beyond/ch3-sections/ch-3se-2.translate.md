# Generators

همهٔ functionها run-to-completion هستند، درست است؟ یعنی وقتی شروع شدند، قبل از هر مداخله‌ای تمام می‌شوند.

تا قبل از ES6 همین‌طور بود. ES6 یک فرم نسبتاً متفاوت از function معرفی می‌کند: generator. generator می‌تواند وسط اجرا pause شود و بلافاصله یا بعداً resume شود. بنابراین تضمین run-to-completion function معمولی را ندارد.

علاوه بر این، هر چرخهٔ pause/resume امکان پیام‌رسانی دوطرفه می‌دهد: generator یک value بیرون می‌فرستد، و کد کنترل‌کننده در زمان resume می‌تواند value برگرداند.

مثل iteratorها، generator را هم می‌شود از چند زاویه دید؛ پاسخ واحدی برای «بهترین» کاربرد وجود ندارد.

**نکته:** برای اطلاعات بیشتر دربارهٔ generatorها به *Async & Performance* و نیز فصل ۴ همین کتاب مراجعه کنید.

### Syntax

اعلان generator:

```js
function *foo() {
	// ..
}
```

جای `*` از نظر عملکردی فرقی ندارد:

```js
function *foo()  { .. }
function* foo()  { .. }
function * foo() { .. }
function*foo()   { .. }
..
```

فقط سلیقه است. من `function *foo(..)` را ترجیح می‌دهم تا با نگارش `*foo(..)` در متن هماهنگ باشد.

در object literal هم concise generator داریم:

```js
var a = {
	*foo() { .. }
};
```

این هم با سبک `*foo()` سازگارتر است.

#### Executing a Generator

با اینکه generator با `*` تعریف می‌شود، اجرای آن مثل function عادی است:

```js
foo();
```

argument هم می‌گیرد:

```js
function *foo(x,y) {
	// ..
}

foo( 5, 10 );
```

تفاوت اصلی: `foo(5,10)` کد داخل generator را مستقیم اجرا نمی‌کند؛ یک iterator برمی‌گرداند که اجرای generator را کنترل می‌کند.

```js
function *foo() {
	// ..
}

var it = foo();

// to start/advanced `*foo()`, call
// `it.next(..)`
```

#### `yield`

کلیدواژهٔ جدید داخل generator برای pause: `yield`.

```js
function *foo() {
	var x = 10;
	var y = 20;

	yield;

	var z = x + y;
}
```

اینجا دو خط اول اجرا می‌شوند، generator روی `yield` pause می‌شود، و با resume ادامه می‌دهد. `yield` می‌تواند صفر یا چندبار ظاهر شود.

`yield` داخل loop هم می‌آید و نقطهٔ pause تکرارشونده می‌سازد. حتی loop بی‌پایان هم یعنی generator بی‌پایان که گاهی کاملاً مطلوب است.

`yield` فقط pause نیست؛ expression هم هست و هنگام pause value بیرون می‌دهد:

```js
function *foo() {
	while (true) {
		yield Math.random();
	}
}
```

`yield ..` هم value می‌فرستد (بدون value یعنی `yield undefined`) و هم هنگام resume مقدار دریافت می‌کند:

```js
function *foo() {
	var x = yield 10;
	console.log( x );
}
```

ابتدا `10` yield می‌شود. وقتی با `it.next(..)` resume می‌کنید، value پاس‌داده‌شده جای کل expression `yield 10` را می‌گیرد و در `x` می‌نشیند.

`yield ..` هرجا expression عادی مجاز باشد می‌تواند بیاید:

```js
function *foo() {
	var arr = [ yield 1, yield 2, yield 3 ];
	console.log( arr, yield 4 );
}
```

`yield` از نظر precedence شبیه assignment expression رفتار می‌کند:

```js
var a, b;

a = 3;					// valid
b = 2 + a = 3;			// invalid
b = 2 + (a = 3);		// valid

yield 3;				// valid
a = 2 + yield 3;		// invalid
a = 2 + (yield 3);		// valid
```

پس اگر جایگاه expressionی دارید که assignment در آن مستقیم مجاز نیست، `yield` را هم باید در `( )` بگذارید.

همچنین به‌خاطر precedence پایین `yield`، اغلب expression بعد از آن اول محاسبه می‌شود:

```js
yield 2 + 3;			// same as `yield (2 + 3)`

(yield 2) + 3;			// `yield 2` first, then `+ 3`
```

و right-associative است:
`yield yield yield 3` معادل `yield (yield (yield 3))`.

### `yield *`

مثل `function *` که generator declaration است، `yield *` هم سازوکار متفاوتی به نام *yield delegation* است.

`yield * ..` یک iterable می‌خواهد، iterator آن را می‌گیرد و کنترل generator میزبان را تا exhaustion به آن delegate می‌کند:

```js
function *foo() {
	yield *[1,2,3];
}
```

یا delegate به generator دیگر:

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}

function *bar() {
	yield *foo();
}
```

valueهای `*foo()` توسط `*bar()` هم بیرون داده می‌شوند.

completion value در `yield ..` از `next(..)` resume می‌آید؛ اما completion value در `yield *..` از return iterator delegate‌شده می‌آید.

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
	return 4;
}

function *bar() {
	var x = yield *foo();
	console.log( "x:", x );
}

for (var v of bar()) {
	console.log( v );
}
// 1 2 3
// x: 4
```

`1/2/3` بیرون yield می‌شوند، ولی `4` completion value `yield *foo()` می‌شود و داخل `x` می‌نشیند.

با delegation می‌توان recursion هم داشت:

```js
function *foo(x) {
	if (x < 3) {
		x = yield *foo( x + 1 );
	}
	return x * 2;
}

foo( 1 );
```

خروجی نهایی اجرای کامل `24` می‌شود.

### Iterator Control

generator با iterator کنترل می‌شود.

نمونهٔ recursive بالا:

```js
function *foo(x) {
	if (x < 3) {
		x = yield *foo( x + 1 );
	}
	return x * 2;
}

var it = foo( 1 );
it.next();				// { value: 24, done: true }
```

اینجا pause واقعی نداریم (`yield ..` نداریم)، پس یک `next()` کل اجرا را تمام می‌کند.

نمونهٔ چندمرحله‌ای:

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}
```

با `for..of`:

```js
for (var v of foo()) {
	console.log( v );
}
// 1 2 3
```

یادآوری: خود reference تابع (`foo`) iterable نیست؛ باید اجرا شود (`foo()`) تا iterator بدهد.

مصرف دستی:

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}

var it = foo();

it.next();				// { value: 1, done: false }
it.next();				// { value: 2, done: false }
it.next();				// { value: 3, done: false }

it.next();				// { value: undefined, done: true }
```

سه `yield` و چهار `next()` می‌بینید. همیشه یک `next()` بیشتر از تعداد `yield` داریم (اگر کامل اجرا شود)؛ آن `next()` اضافی، همان call آغازگر اولیه است.

مدل پرسش/پاسخ:

```js
function *foo() {
	var x = yield 1;
	var y = yield 2;
	var z = yield 3;
	console.log( x, y, z );
}
```

هر `yield` هم value می‌فرستد و هم منتظر پاسخ می‌ماند.

```js
var it = foo();

it.next();				// { value: 1, done: false }
it.next( "foo" );		// { value: 2, done: false }
it.next( "bar" );		// { value: 3, done: false }
it.next( "baz" );		// "foo" "bar" "baz"
						// { value: undefined, done: true }
```

پس پاسخ هر `yield` توسط `next(..)` بعدی ارسال می‌شود.

generator را می‌توان producer value دید؛ یا عمومی‌تر، اجرای کنترل‌شدهٔ تدریجی کد.

**نکته:** `next(..)` لازم نیست بلافاصله پشت `next(..)` قبلی باشد؛ همین pause داخلی generator اجازه می‌دهد کارهای async زمان resume را کنترل کنند (فصل ۴).

### Early Completion

iterator generator از `return(..)` و `throw(..)` پشتیبانی می‌کند و هر دو می‌توانند generator paused را فوراً terminate کنند.

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}

var it = foo();

it.next();				// { value: 1, done: false }

it.return( 42 );		// { value: 42, done: true }

it.next();				// { value: undefined, done: true }
```

`return(x)` مثل تزریق `return x` در همان لحظه است. بعد از completion (عادی یا زودهنگام)، generator دیگر کدی اجرا نمی‌کند.

`return(..)` علاوه بر call دستی، توسط مصرف‌کننده‌هایی مثل `for..of` و `...` هم ممکن است خودکار صدا شود.

برای cleanup داخل generator از `finally` استفاده کنید:

```js
function *foo() {
	try {
		yield 1;
		yield 2;
		yield 3;
	}
	finally {
		console.log( "cleanup!" );
	}
}

for (var v of foo()) {
	console.log( v );
}
// 1 2 3
// cleanup!

var it = foo();

it.next();				// { value: 1, done: false }
it.return( 42 );		// cleanup!
						// { value: 42, done: true }
```

**هشدار:** داخل `finally`، `yield` نگذارید. قانونی است ولی ایدهٔ بسیار بدی است چون completion `return(..)` را defer می‌کند.

هر بار call کردن generator یک iterator جدید می‌دهد، پس چند iterator همزمان هم ممکن است:

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}

var it1 = foo();
it1.next();				// { value: 1, done: false }
it1.next();				// { value: 2, done: false }

var it2 = foo();
it2.next();				// { value: 1, done: false }

it1.next();				// { value: 3, done: false }

it2.next();				// { value: 2, done: false }
it2.next();				// { value: 3, done: false }

it2.next();				// { value: undefined, done: true }
it1.next();				// { value: undefined, done: true }
```

#### Early Abort

به‌جای `return(..)` می‌توانید `throw(..)` بزنید؛ مثل تزریق `throw x` در pause point.

```js
function *foo() {
	yield 1;
	yield 2;
	yield 3;
}

var it = foo();

it.next();				// { value: 1, done: false }

try {
	it.throw( "Oops!" );
}
catch (err) {
	console.log( err );	// Exception: Oops!
}

it.next();				// { value: undefined, done: true }
```

چون کسی exception را داخل generator handle نکرده، به caller propagate می‌شود. بر خلاف `return(..)`, `throw(..)` خودکار صدا زده نمی‌شود.

### Error Handling

مدیریت خطا با generator و `try..catch` در هر دو جهت inbound/outbound ممکن است:

```js
function *foo() {
	try {
		yield 1;
	}
	catch (err) {
		console.log( err );
	}

	yield 2;

	throw "Hello!";
}

var it = foo();

it.next();				// { value: 1, done: false }

try {
	it.throw( "Hi!" );	// Hi!
						// { value: 2, done: false }
	it.next();

	console.log( "never gets here" );
}
catch (err) {
	console.log( err );	// Hello!
}
```

Propagation خطا در `yield *`:

```js
function *foo() {
	try {
		yield 1;
	}
	catch (err) {
		console.log( err );
	}

	yield 2;

	throw "foo: e2";
}

function *bar() {
	try {
		yield *foo();

		console.log( "never gets here" );
	}
	catch (err) {
		console.log( err );
	}
}

var it = bar();

try {
	it.next();			// { value: 1, done: false }

	it.throw( "e1" );	// e1
						// { value: 2, done: false }

	it.next();			// foo: e2
						// { value: undefined, done: true }
}
catch (err) {
	console.log( "never gets here" );
}

it.next();				// { value: undefined, done: true }
```

`1` از `*foo()` عبور می‌کند، اما `throw "foo: e2"` در `*bar()` catch می‌شود و خود `*bar()` عادی تمام می‌شود.

### Transpiling a Generator

نمایش قابلیت generator پیش از ES6 ممکن است؛ ابزارهایی مثل Regenerator (https://facebook.github.io/regenerator/) این کار را می‌کنند.

برای فهم بهتر، یک تبدیل دستی ساده:

```js
function *foo() {
	var x = yield 42;
	console.log( x );
}
```

نسخهٔ pre-ES6 باید iterator برگرداند:

```js
function foo() {
	// ..

	return {
		next: function(v) {
			// ..
		}

		// we'll skip `return(..)` and `throw(..)`
	};
}
```

با state machine مبتنی بر closure:

```js
function foo() {
	function nextState(v) {
		switch (state) {
			case 0:
				state++;

				// the `yield` expression
				return 42;
			case 1:
				state++;

				// `yield` expression fulfilled
				x = v;
				console.log( x );

				// the implicit `return`
				return undefined;

			// no need to handle state `2`
		}
	}

	var state = 0, x;

	return {
		next: function(v) {
			var ret = nextState( v );

			return { value: ret, done: (state == 2) };
		}

		// we'll skip `return(..)` and `throw(..)`
	};
}
```

تست:

```js
var it = foo();

it.next();				// { value: 42, done: false }

it.next( 10 );			// 10
						// { value: undefined, done: true }
```

این تمرین خوب نشان می‌دهد generator در اصل syntax ساده‌تری برای منطق state machine است.

### Generator Uses

حالا generator به چه درد می‌خورد؟

دو الگوی مهم:

* *تولید یک سری value*: می‌تواند ساده باشد (اعداد افزایشی، رشتهٔ تصادفی) یا ساختاریافته (مثل rowهای query DB). iterator کنترل می‌کند که در هر `next(..)` چه منطقی اجرا شود.
* *صف کارهای سریالی*: برای flow control الگوریتم‌هایی که هر قدمشان داده‌ای از منبع بیرونی می‌خواهد. این داده می‌تواند sync یا async فراهم شود.

از دید کد داخل generator، sync/async بودن در نقطهٔ `yield` پنهان است. این abstraction عمداً پیچیدگی پیاده‌سازی را از بیان ترتیبی طبیعی مراحل جدا می‌کند، و refactor پیاده‌سازی را بدون دست‌زدن به منطق generator آسان‌تر می‌کند.

وقتی generator را با این نگاه ببینیم، فراتر از syntax زیباتر برای state machine می‌شود: یک ابزار abstraction قدرتمند برای سازمان‌دهی و کنترل تولید/مصرف منظم داده.
