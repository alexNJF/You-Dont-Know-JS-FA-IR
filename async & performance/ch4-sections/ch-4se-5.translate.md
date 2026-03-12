# واگذاری در Generator (Generator Delegation)

در بخش قبلی دیدیم از داخل generator می‌توان تابع عادی صدا زد، و این برای پنهان‌کردن جزئیات پیاده‌سازی (مثل flow مبتنی بر Promise) مفید است. اما عیب اصلی تابع عادی این است که باید قوانین تابع عادی را رعایت کند؛ یعنی مثل generator نمی‌تواند خودش با `yield` pause شود.

اینجا ممکن است به ذهن‌تان برسد که یک generator را از داخل generator دیگر صدا بزنید، با helper `run(..)` خودمان، مثلاً:

```js
function *foo() {
	var r2 = yield request( "http://some.url.2" );
	var r3 = yield request( "http://some.url.3/?v=" + r2 );

	return r3;
}

function *bar() {
	var r1 = yield request( "http://some.url.1" );

	// "delegating" to `*foo()` via `run(..)`
	var r3 = yield run( foo );

	console.log( r3 );
}

run( bar );
```

اینجا `*foo()` را داخل `*bar()` با `run(..)` اجرا می‌کنیم. از این ویژگی استفاده کرده‌ایم که `run(..)` قبلی Promise برمی‌گرداند و وقتی generator کامل می‌شود resolve می‌شود (یا اگر خطا کند reject می‌شود). پس اگر Promise برگشتی از `run(foo)` را yield کنیم، `*bar()` خودکار تا اتمام `*foo()` pause می‌شود.

اما راه بهتر هم هست برای ادغام `*foo()` داخل `*bar()`: **yield-delegation**. syntax ویژه‌ی آن این است: `yield * __` (به `*` اضافه دقت کنید). قبل از کاربرد در مثال Ajax، یک مثال ساده‌تر ببینیم:

```js
function *foo() {
	console.log( "`*foo()` starting" );
	yield 3;
	yield 4;
	console.log( "`*foo()` finished" );
}

function *bar() {
	yield 1;
	yield 2;
	yield *foo();	// `yield`-delegation!
	yield 5;
}

var it = bar();

it.next().value;	// 1
it.next().value;	// 2
it.next().value;	// `*foo()` starting
					// 3
it.next().value;	// 4
it.next().value;	// `*foo()` finished
					// 5
```

**نکته:** مشابه توضیح قبلی‌ام درباره‌ی ترجیح `function *foo() ..` نسبت به `function* foo() ..`، اینجا هم برخلاف بیشتر مستندات، من `yield *foo()` را به `yield* foo()` ترجیح می‌دهم. جای‌گذاری `*` کاملاً سلیقه‌ای است. برای من یکدستی سبک جذاب‌تر است.

واگذاری `yield *foo()` چطور کار می‌کند؟

اول، صدا زدن `foo()` یک iterator می‌سازد (همان چیزی که قبلاً دیدیم). بعد `yield *` کنترل iterator مربوط به generator فعلی (`*bar()`) را به iterator مربوط به `*foo()` **واگذار** می‌کند.

پس دو `it.next()` اول در حال کنترل `*bar()` هستند، ولی `it.next()` سوم که می‌آید، `*foo()` شروع می‌شود و حالا کنترل روی `*foo()` است نه `*bar()`. برای همین به آن delegation می‌گوییم -- `*bar()` کنترل iteration خودش را به `*foo()` واگذار کرده.

به‌محض اینکه iteratorِ `it` تمام iteratorِ `*foo()` را exhausted کند، کنترل به‌صورت خودکار برمی‌گردد به `*bar()`.

حالا برگردیم به مثال قبلیِ سه Ajax ترتیبی:

```js
function *foo() {
	var r2 = yield request( "http://some.url.2" );
	var r3 = yield request( "http://some.url.3/?v=" + r2 );

	return r3;
}

function *bar() {
	var r1 = yield request( "http://some.url.1" );

	// "delegating" to `*foo()` via `yield*`
	var r3 = yield *foo();

	console.log( r3 );
}

run( bar );
```

تنها تفاوت این snippet با نسخه‌ی قبل، استفاده از `yield *foo()` به‌جای `yield run(foo)` است.

**نکته:** `yield *` کنترل generator را واگذار نمی‌کند، کنترل **iterator** را واگذار می‌کند؛ وقتی `*foo()` را invoke می‌کنید، در واقع به iterator آن yield-delegate می‌کنید. حتی می‌توانید به هر iterableی واگذاری کنید؛ مثلاً `yield *[1,2,3]` iterator پیش‌فرض آرایه‌ی `[1,2,3]` را مصرف می‌کند.

### چرا Delegation؟

هدف اصلی yield-delegation بیشتر سازمان‌دهی کد است، و از این نظر با فراخوانی تابع عادی تقارن دارد.

دو ماژول را تصور کنید که یکی `foo()` و دیگری `bar()` می‌دهد و `bar()`، `foo()` را صدا می‌زند. دلیل جدا بودنشان معمولاً نیاز سازمان‌دهی درست برنامه است. مثلاً جاهایی `foo()` مستقل صدا زده می‌شود، و جاهایی `bar()` آن را صدا می‌زند.

دقیقاً به همین دلایل، جدا نگه‌داشتن generatorها هم به خوانایی، نگهداری و دیباگ کمک می‌کند. از این زاویه، `yield *` یک میان‌بر نحوی برای iterate دستی گام‌های `*foo()` درون `*bar()` است.

این روش دستی مخصوصاً وقتی گام‌های `*foo()` async باشند پیچیده می‌شود، برای همین احتمالاً باید از `run(..)` کمک بگیرید. و همان‌طور که دیدیم، `yield *foo()` نیاز به sub-instance از `run(..)` (مثل `run(foo)`) را حذف می‌کند.

### واگذاری پیام‌ها

شاید بپرسید این yield-delegation فقط کنترل iterator را منتقل می‌کند یا پیام‌رسانی دوطرفه را هم؟ جریان پیام‌های ورودی/خروجی را دقیق دنبال کنید:

```js
function *foo() {
	console.log( "inside `*foo()`:", yield "B" );

	console.log( "inside `*foo()`:", yield "C" );

	return "D";
}

function *bar() {
	console.log( "inside `*bar()`:", yield "A" );

	// `yield`-delegation!
	console.log( "inside `*bar()`:", yield *foo() );

	console.log( "inside `*bar()`:", yield "E" );

	return "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// inside `*bar()`: 1
// outside: B

console.log( "outside:", it.next( 2 ).value );
// inside `*foo()`: 2
// outside: C

console.log( "outside:", it.next( 3 ).value );
// inside `*foo()`: 3
// inside `*bar()`: D
// outside: E

console.log( "outside:", it.next( 4 ).value );
// inside `*bar()`: 4
// outside: F
```

به‌خصوص بعد از `it.next(3)` به مراحل توجه کنید:

1. مقدار `3` (از مسیر delegation در `*bar()`) به expression منتظر `yield "C"` در `*foo()` می‌رسد.
2. `*foo()` سپس `return "D"` می‌دهد، ولی این مقدار مستقیم به خروجی `it.next(3)` بیرونی نمی‌رود.
3. در عوض `"D"` نتیجه‌ی expression منتظر `yield *foo()` داخل `*bar()` می‌شود -- این expression واگذاری‌دار تا exhaustion کامل `*foo()` pause بوده. پس `"D"` داخل `*bar()` در دسترس قرار می‌گیرد تا چاپ شود.
4. سپس `yield "E"` داخل `*bar()` اجرا می‌شود و `"E"` به‌عنوان `value` خروجی `it.next(3)` به بیرون yield می‌شود.

از دید iterator بیرونی (`it`)، تفاوت ظاهری خاصی بین کنترل generator اولیه و generator واگذارشده وجود ندارد.

در واقع delegation با `yield` لازم نیست حتماً به generator دیگر باشد؛ می‌تواند به iterable غیر-generator هم باشد. مثال:

```js
function *bar() {
	console.log( "inside `*bar()`:", yield "A" );

	// `yield`-delegation to a non-generator!
	console.log( "inside `*bar()`:", yield *[ "B", "C", "D" ] );

	console.log( "inside `*bar()`:", yield "E" );

	return "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// inside `*bar()`: 1
// outside: B

console.log( "outside:", it.next( 2 ).value );
// outside: C

console.log( "outside:", it.next( 3 ).value );
// outside: D

console.log( "outside:", it.next( 4 ).value );
// inside `*bar()`: undefined
// outside: E

console.log( "outside:", it.next( 5 ).value );
// inside `*bar()`: 5
// outside: F
```

به تفاوت محل دریافت/گزارش پیام‌ها در این مثال نسبت به قبلی دقت کنید.

مهم‌تر از همه اینکه iterator پیش‌فرض آرایه اهمیتی به پیام‌های ورودی `next(..)` نمی‌دهد، پس مقدارهای `2`, `3`, `4` عملاً نادیده گرفته می‌شوند. همچنین چون آن iterator `return` صریح ندارد (برخلاف `*foo()` قبلی)، expression مربوط به `yield *` در پایان مقدار `undefined` می‌گیرد.

#### استثناها هم واگذار می‌شوند!

همان‌طور که yield-delegation پیام‌ها را دوطرفه شفاف عبور می‌دهد، error/exception هم در هر دو جهت عبور می‌کند:

```js
function *foo() {
	try {
		yield "B";
	}
	catch (err) {
		console.log( "error caught inside `*foo()`:", err );
	}

	yield "C";

	throw "D";
}

function *bar() {
	yield "A";

	try {
		yield *foo();
	}
	catch (err) {
		console.log( "error caught inside `*bar()`:", err );
	}

	yield "E";

	yield *baz();

	// note: can't get here!
	yield "G";
}

function *baz() {
	throw "F";
}

var it = bar();

console.log( "outside:", it.next().value );
// outside: A

console.log( "outside:", it.next( 1 ).value );
// outside: B

console.log( "outside:", it.throw( 2 ).value );
// error caught inside `*foo()`: 2
// outside: C

console.log( "outside:", it.next( 3 ).value );
// error caught inside `*bar()`: D
// outside: E

try {
	console.log( "outside:", it.next( 4 ).value );
}
catch (err) {
	console.log( "error caught outside:", err );
}
// error caught outside: F
```

چند نکته‌ی مهم از این snippet:

1. وقتی `it.throw(2)` می‌زنیم، پیام خطای `2` وارد `*bar()` می‌شود و از delegation به `*foo()` می‌رسد؛ `*foo()` آن را `catch` می‌کند و مدیریت می‌کند. بعد `yield "C"` مقدار `"C"` را به‌عنوان `value` خروجی `it.throw(2)` بیرون می‌دهد.
2. مقدار `"D"` که بعداً داخل `*foo()` `throw` می‌شود، به بیرون propagate می‌شود تا `*bar()` آن را `catch` و مدیریت کند. سپس `yield "E"` مقدار `"E"` را به‌عنوان خروجی `it.next(3)` می‌دهد.
3. استثنای `*baz()` داخل `*bar()` catch نمی‌شود -- هرچند بیرون catch کردیم -- پس هم `*baz()` و هم `*bar()` complete می‌شوند. بعد از این snippet دیگر با `next(..)`های بعدی به `"G"` نمی‌رسید؛ فقط `undefined` برای `value` می‌گیرید.

### واگذاری ناهمگامی

حالا برگردیم به مثال delegation قبلی با چند Ajax ترتیبی:

```js
function *foo() {
	var r2 = yield request( "http://some.url.2" );
	var r3 = yield request( "http://some.url.3/?v=" + r2 );

	return r3;
}

function *bar() {
	var r1 = yield request( "http://some.url.1" );

	var r3 = yield *foo();

	console.log( r3 );
}

run( bar );
```

به‌جای `yield run(foo)` داخل `*bar()`، فقط `yield *foo()` می‌زنیم.

در نسخه‌ی قبلی، مکانیزم Promise (با کنترل `run(..)`) مقدار `return r3` از `*foo()` را به متغیر `r3` داخل `*bar()` می‌رساند. حالا همان مقدار مستقیم از mechanics مربوط به `yield *` برمی‌گردد.

غیر از این، رفتار تقریباً یکسان است.

### «بازگشت» واگذارشده

طبیعتاً yield-delegation می‌تواند به هر تعداد گام delegation که تعریف کنید ادامه یابد. حتی می‌توانید از آن برای «بازگشت» generatorیِ async استفاده کنید -- یعنی generator به خودش yield-delegate کند:

```js
function *foo(val) {
	if (val > 1) {
		// generator recursion
		val = yield *foo( val - 1 );
	}

	return yield request( "http://some.url/?v=" + val );
}

function *bar() {
	var r1 = yield *foo( 3 );
	console.log( r1 );
}

run( bar );
```

**نکته:** utility `run(..)` ما می‌توانست با `run(foo, 3)` هم فراخوانی شود، چون پارامتر اضافه را به initialization generator پاس می‌دهد. اما اینجا عمداً `*bar()` بدون پارامتر نوشتیم تا انعطاف `yield *` بهتر دیده شود.

مراحل اجرای این کد چیست؟ آماده باشید؛ شرح جزئیاتش پیچیده است:

1. `run(bar)` generator `*bar()` را شروع می‌کند.
2. `foo(3)` iterator مربوط به `*foo(..)` را می‌سازد و `3` را به `val` می‌دهد.
3. چون `3 > 1` است، `foo(2)` iterator دیگری می‌سازد و `2` را به `val` می‌دهد.
4. چون `2 > 1` است، `foo(1)` iterator دیگری می‌سازد و `1` را به `val` می‌دهد.
5. `1 > 1` نادرست است، پس `request(..)` با مقدار `1` صدا زده می‌شود و Promise اولین Ajax برمی‌گردد.
6. آن Promise yield می‌شود و به instance مربوط به `*foo(2)` می‌رسد.
7. `yield *` این Promise را به instance `*foo(3)` پاس می‌دهد. `yield *` دیگر آن را به `*bar()` می‌دهد. و یک `yield *` دیگر هم آن را به `run(..)` می‌رساند تا utility منتظر Promise بماند (اولین Ajax).
8. وقتی Promise resolve می‌شود، مقدار fulfillment برای resume کردن `*bar()` فرستاده می‌شود، سپس از `yield *` به instance `*foo(3)` می‌رود، از آنجا با `yield *` به instance `*foo(2)`، و بعد دوباره از `yield *` به `yield` معمولی منتظر در instance `*foo(1)` می‌رسد.
9. پاسخ Ajax اول فوراً از instance `*foo(1)` `return` می‌شود، نتیجه‌ی expression `yield *` در `*foo(2)` می‌شود و در `val` محلی آن می‌نشیند.
10. داخل `*foo(2)` Ajax دوم با `request(..)` اجرا می‌شود، Promise آن به instance `*foo(3)` می‌رود و با `yield *` تا `run(..)` propagate می‌شود (مثل مرحله ۷). وقتی resolve شود، پاسخ Ajax دوم تا instance `*foo(2)` برمی‌گردد و در `val` محلی‌اش قرار می‌گیرد.
11. در نهایت Ajax سوم با `request(..)` اجرا می‌شود، Promise آن به `run(..)` می‌رود، مقدار resolution برمی‌گردد، و سپس `return` می‌شود تا به expression منتظر `yield *` در `*bar()` برسد.

نفس‌گیر بود، نه؟ شاید بد نباشد یکی دو بار دیگر مرورش کنید و بعد یک استراحت کوتاه برای ریست ذهن بگیرید!
