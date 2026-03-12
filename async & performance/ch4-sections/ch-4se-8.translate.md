# Generatorهای پیش از ES6

احتمالاً تا اینجا قانع شده‌اید generatorها ابزار بسیار مهمی برای برنامه‌نویسی async هستند. اما generator یک syntax جدید ES6 است، و برخلاف Promise (که API جدید است) نمی‌شود به‌سادگی polyfillش کرد. پس اگر هنوز باید مرورگرهای pre-ES6 را هم پشتیبانی کنیم چه کار کنیم؟

برای همه‌ی توسعه‌های syntax جدید در ES6 ابزارهایی وجود دارد -- رایج‌ترین نامشان transpiler (یا trans-compiler) است -- که syntax ES6 شما را به کد معادل pre-ES6 تبدیل می‌کنند (طبعاً زشت‌تر!). بنابراین generator را می‌توان به کدی transpile کرد که همان رفتار را داشته باشد و روی ES5 و پایین‌تر هم کار کند.

اما چطور؟ «جادوی» `yield` در نگاه اول چیزی نیست که آسان transpile شود. در بحث قبلی درباره‌ی iteratorهای مبتنی بر closure، اشاره‌ای به راه‌حل کردیم.

### تبدیل دستی

قبل از transpilerها، ببینیم تبدیل دستی generator چگونه کار می‌کند. این فقط تمرین آکادمیک نیست؛ واقعاً کمک می‌کند فهم generator عمیق‌تر شود.

```js
// `request(..)` is a Promise-aware Ajax utility

function *foo(url) {
	try {
		console.log( "requesting:", url );
		var val = yield request( url );
		console.log( val );
	}
	catch (err) {
		console.log( "Oops:", err );
		return false;
	}
}

var it = foo( "http://some.url.1" );
```

اولین مشاهده: هنوز به یک تابع معمولی `foo()` نیاز داریم که قابل فراخوانی باشد و باید یک iterator برگرداند. پس اسکچ غیر-generator این می‌شود:

```js
function foo(url) {

	// ..

	// make and return an iterator
	return {
		next: function(v) {
			// ..
		},
		throw: function(e) {
			// ..
		}
	};
}

var it = foo( "http://some.url.1" );
```

مشاهده‌ی بعدی: generator با suspend کردن scope/state «جادو» می‌کند، و این را می‌توانیم با closure شبیه‌سازی کنیم (کتاب *Scope & Closures*). برای نوشتن چنین کدی، ابتدا بخش‌های generator را با state علامت‌گذاری کنیم:

```js
// `request(..)` is a Promise-aware Ajax utility

function *foo(url) {
	// STATE *1*

	try {
		console.log( "requesting:", url );
		var TMP1 = request( url );

		// STATE *2*
		var val = yield TMP1;
		console.log( val );
	}
	catch (err) {
		// STATE *3*
		console.log( "Oops:", err );
		return false;
	}
}
```

**نکته:** برای نمایش دقیق‌تر، عبارت `val = yield request..` را به دو بخش شکسته‌ایم و از متغیر موقت `TMP1` استفاده کردیم. `request(..)` در state `*1*` رخ می‌دهد، و assign شدن مقدار completion به `val` در state `*2*`. هنگام تبدیل نهایی غیر-generator این `TMP1` را حذف می‌کنیم.

به بیان دیگر، `*1*` state آغاز، `*2*` state موفقیت `request(..)`, و `*3*` state شکست `request(..)` است. با هر `yield` اضافی، stateهای بیشتر هم اضافه می‌شوند.

برگردیم به generator transpile شده. در closure یک متغیر `state` تعریف می‌کنیم برای ردیابی وضعیت:

```js
function foo(url) {
	// manage generator state
	var state;

	// ..
}
```

حالا داخل closure یک تابع داخلی به نام `process(..)` می‌گذاریم که هر state را با `switch` مدیریت کند:

```js
// `request(..)` is a Promise-aware Ajax utility

function foo(url) {
	// manage generator state
	var state;

	// generator-wide variable declarations
	var val;

	function process(v) {
		switch (state) {
			case 1:
				console.log( "requesting:", url );
				return request( url );
			case 2:
				val = v;
				console.log( val );
				return;
			case 3:
				var err = v;
				console.log( "Oops:", err );
				return false;
		}
	}

	// ..
}
```

هر state در generator با یک `case` در `switch` نمایش داده می‌شود. هر بار لازم باشد state جدید پردازش شود، `process(..)` صدا می‌خورد. چند خط بعد می‌بینیم چطور.

برای متغیرهای سراسری generator مثل `val`، declaration را بیرون `process(..)` می‌بریم تا بین چند فراخوانی `process(..)` زنده بماند. اما متغیر block-scoped مثل `err` فقط در state `*3*` لازم است، پس همان‌جا می‌ماند.

در state `*1*` به‌جای `yield request(..)` نوشتیم `return request(..)`. در state پایانی `*2*` چون `return` صریحی نداشتیم، `return;` گذاشتیم (معادل `return undefined`). در state `*3*` هم `return false` را حفظ کردیم.

حالا باید کد داخل توابع iterator را تعریف کنیم تا `process(..)` را درست صدا بزنند:

```js
function foo(url) {
	// manage generator state
	var state;

	// generator-wide variable declarations
	var val;

	function process(v) {
		switch (state) {
			case 1:
				console.log( "requesting:", url );
				return request( url );
			case 2:
				val = v;
				console.log( val );
				return;
			case 3:
				var err = v;
				console.log( "Oops:", err );
				return false;
		}
	}

	// make and return an iterator
	return {
		next: function(v) {
			// initial state
			if (!state) {
				state = 1;
				return {
					done: false,
					value: process()
				};
			}
			// yield resumed successfully
			else if (state == 1) {
				state = 2;
				return {
					done: true,
					value: process( v )
				};
			}
			// generator already completed
			else {
				return {
					done: true,
					value: undefined
				};
			}
		},
		"throw": function(e) {
			// the only explicit error handling is in
			// state *1*
			if (state == 1) {
				state = 3;
				return {
					done: true,
					value: process( e )
				};
			}
			// otherwise, an error won't be handled,
			// so just throw it right back out
			else {
				throw e;
			}
		}
	};
}
```

این کد چطور کار می‌کند؟

1. اولین فراخوانی `next()` روی iterator، generator را از حالت uninitialized به state `1` می‌برد و `process()` را برای آن state اجرا می‌کند. مقدار برگشتی `request(..)` (Promise پاسخ Ajax) به‌عنوان `value` از `next()` برمی‌گردد.
2. اگر Ajax موفق باشد، فراخوانی دوم `next(..)` باید مقدار پاسخ Ajax را وارد کند؛ state به `2` می‌رود. دوباره `process(..)` اجرا می‌شود (این‌بار با مقدار پاس‌داده‌شده) و `value` خروجی `next(..)` می‌شود `undefined`.
3. اما اگر Ajax fail شود، باید `throw(..)` را با خطا صدا بزنیم؛ در این حالت state از `1` به `3` می‌رود (نه `2`). باز هم `process(..)` با مقدار خطا اجرا می‌شود. آن case مقدار `false` برمی‌گرداند که به‌عنوان `value` خروجی `throw(..)` قرار می‌گیرد.

از بیرون -- یعنی وقتی فقط با iterator کار می‌کنیم -- این تابع معمولی `foo(..)` تقریباً مثل generator `*foo(..)` رفتار می‌کند. پس عملاً generator ES6 را به نسخه‌ی سازگار pre-ES6 «transpile» کردیم!

بعد می‌توانیم یا دستی generator را instantiate کنیم و iteratorش را کنترل کنیم (`var it = foo("..")`, `it.next(..)` و...) یا بهتر، آن را به utility قبلی `run(..)` بدهیم: `run(foo,"..")`.

### Transpile خودکار

تمرین تبدیل دستی generator ES6 به معادل pre-ES6 کمک می‌کند بفهمیم generator مفهومی چطور کار می‌کند. اما تبدیل دستی واقعاً پیچیده بود و برای بقیه‌ی generatorهای کدبیس قابل‌انتقال نبود. انجامش با دست غیرعملی است و تمام مزیت generator را از بین می‌برد.

خوشبختانه ابزارهای متعددی وجود دارد که generator ES6 را خودکار به چیزی شبیه همین تبدیل می‌کنند. نه‌تنها کار سنگین را انجام می‌دهند، بلکه چند پیچیدگی‌ای را هم پوشش می‌دهند که ما از آن گذشتیم.

یکی از این ابزارها `regenerator` است: [https://facebook.github.io/regenerator/](https://facebook.github.io/regenerator/)

اگر generator قبلی را با regenerator transpile کنیم، (در زمان نگارش کتاب) کد خروجی این بوده:

```js
// `request(..)` is a Promise-aware Ajax utility

var foo = regeneratorRuntime.mark(function foo(url) {
    var val;

    return regeneratorRuntime.wrap(function foo$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
            context$1$0.prev = 0;
            console.log( "requesting:", url );
            context$1$0.next = 4;
            return request( url );
        case 4:
            val = context$1$0.sent;
            console.log( val );
            context$1$0.next = 12;
            break;
        case 8:
            context$1$0.prev = 8;
            context$1$0.t0 = context$1$0.catch(0);
            console.log("Oops:", context$1$0.t0);
            return context$1$0.abrupt("return", false);
        case 12:
        case "end":
            return context$1$0.stop();
        }
    }, foo, this, [[0, 8]]);
});
```

شباهت‌های واضحی با تبدیل دستی ما دارد: مثلاً `switch/case`ها و حتی بیرون‌کشیدن `val` از closure.

طبیعتاً یک trade-off داریم: transpile توسط regenerator به helper libraryای به نام `regeneratorRuntime` نیاز دارد که منطق reusable برای مدیریت generator/iterator عمومی را نگه می‌دارد. بخش زیادی از boilerplate آن با نسخه‌ی ما فرق دارد، ولی مفهوم‌ها مشخص‌اند؛ مثلاً `context$1$0.next = 4` برای نگه‌داری state بعدی generator.

نتیجه‌ی اصلی: generator فقط در محیط ES6+ مفید نیست. وقتی مفهوم را بفهمید، می‌توانید در کل کد از آن استفاده کنید و با ابزارها کد را برای محیط‌های قدیمی سازگار کنید.

این کار از یک polyfill ساده‌ی Promise برای pre-ES6 زحمت بیشتری دارد، اما کاملاً می‌ارزد؛ چون generator برای بیان flow-control async به‌شکل معقول، قابل‌درک، sync-looking و ترتیبی بسیار بهتر است.

وقتی به generator عادت کنید، دیگر واقعاً دلتان نمی‌خواهد به جهنم callback spaghetti برگردید!
