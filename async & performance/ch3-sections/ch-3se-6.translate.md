# الگوهای Promise

تا اینجا به‌صورت ضمنی الگوی sequence را با Promise chain دیده‌ایم (جریان «این-بعد-آن-بعد-آن»). اما تنوع زیادی از الگوهای async وجود دارد که می‌توانیم روی Promise به‌عنوان abstraction بسازیم. این الگوها بیان flow-control async را ساده‌تر می‌کنند -- و کد را قابل‌استدلال‌تر و نگهداری‌پذیرتر می‌کنند -- حتی در پیچیده‌ترین بخش‌های برنامه.

دو الگو از این‌ها مستقیماً در ES6 `Promise` آمده‌اند و رایگان در اختیارمان هستند تا برای ساخت الگوهای دیگر از آن‌ها استفاده کنیم.

### `Promise.all([ .. ])`

در sequence async (Promise chain)، در هر لحظه فقط یک task async هماهنگ می‌شود -- گام ۲ دقیقاً بعد از ۱ و گام ۳ دقیقاً بعد از ۲. اما اگر بخواهیم دو یا چند گام را هم‌زمان (parallel/concurrent) اجرا کنیم چه؟

در اصطلاح کلاسیک برنامه‌نویسی، «gate» مکانیزمی است که برای باز شدن، منتظر اتمام دو یا چند کار موازی/هم‌روند می‌ماند. ترتیب اتمام مهم نیست؛ فقط باید همه تمام شوند تا gate باز شود.

در API Promise این الگو `all([ .. ])` نام دارد.

فرض کنید می‌خواهید دو درخواست Ajax را هم‌زمان بزنید و بعد از اتمام هر دو (بدون توجه به ترتیبشان) درخواست سومی بدهید:

```js
// `request(..)` is a Promise-aware Ajax utility,
// like we defined earlier in the chapter

var p1 = request( "http://some.url.1/" );
var p2 = request( "http://some.url.2/" );

Promise.all( [p1,p2] )
.then( function(msgs){
	// both `p1` and `p2` fulfill and pass in
	// their messages here
	return request(
		"http://some.url.3/?v=" + msgs.join(",")
	);
} )
.then( function(msg){
	console.log( msg );
} );
```

`Promise.all([ .. ])` یک آرگومان می‌گیرد: `array`ای که معمولاً Promise instanceها داخل آن است. Promise برگشتیِ `Promise.all([ .. ])` در fulfillment، پیامی (`msgs`) از نوع `array` می‌گیرد که شامل همه‌ی پیام‌های fulfillment Promiseهای ورودی است، در همان ترتیب اعلام‌شده (فارغ از ترتیب completion واقعی).

**نکته:** از نظر فنی آرایه‌ی ورودی `Promise.all([ .. ])` می‌تواند Promise، thenable یا حتی مقدار فوری داشته باشد. هر آیتم عملاً از `Promise.resolve(..)` عبور می‌کند تا Promise واقعی شود؛ پس مقدار فوری هم به Promise normalize می‌شود. اگر آرایه خالی باشد، Promise اصلی فوراً fulfill می‌شود.

Promise اصلیِ `Promise.all([ .. ])` فقط وقتی fulfill می‌شود که همه‌ی Promiseهای درونی fulfill شوند. اگر یکی rejected شود، Promise اصلی بلافاصله rejected می‌شود و نتایج دیگر کنار گذاشته می‌شوند.

همیشه روی هر Promise، مخصوصاً Promise برگشتی `Promise.all([ .. ])`، rejection/error handler وصل کنید.

### `Promise.race([ .. ])`

وقتی `Promise.all([ .. ])` چند Promise را هم‌زمان هماهنگ می‌کند، فرضش این است که همه لازم‌اند. اما گاهی فقط «اولین Promiseی که به خط پایان برسد» مهم است و بقیه اهمیتی ندارند.

این الگو در اصطلاح کلاسیک «latch» است، ولی در Promise به آن `race` می‌گوییم.

**هشدار:** استعاره‌ی «اولین نفر برنده می‌شود» مناسب است، اما واژه‌ی "race" بار معنایی دارد چون "race condition" معمولاً bug است (فصل ۱). `Promise.race([ .. ])` را با race condition اشتباه نگیرید.

`Promise.race([ .. ])` هم یک `array` از Promise/thenable/مقدار فوری می‌گیرد. race با مقدار فوری از نظر عملی کم‌معناست، چون اولین مقدار لیست آشکارا برنده می‌شود -- مثل مسابقه‌ای که یکی از خط پایان شروع کند!

مثل `Promise.all([ .. ])`، `Promise.race([ .. ])` اگر اولین resolution از نوع fulfillment باشد fulfill می‌شود، و اگر اولین resolution rejection باشد rejected.

**هشدار:** race حداقل یک «دونده» می‌خواهد. اگر آرایه‌ی خالی بدهید، برخلاف انتظار Promise اصلی فوراً resolve نمی‌شود و برای همیشه unresolved می‌ماند. این footgun است! ES6 بهتر بود اینجا یا fulfill/reject می‌کرد یا خطای sync می‌داد. به‌خاطر سابقه‌ی کتابخانه‌های Promise پیش از ES6 این نکته حفظ شده، پس هرگز آرایه‌ی خالی ندهید.

مثال Ajax قبلی را این‌بار در قالب race بین `p1` و `p2`:

```js
// `request(..)` is a Promise-aware Ajax utility,
// like we defined earlier in the chapter

var p1 = request( "http://some.url.1/" );
var p2 = request( "http://some.url.2/" );

Promise.race( [p1,p2] )
.then( function(msg){
	// either `p1` or `p2` will win the race
	return request(
		"http://some.url.3/?v=" + msg
	);
} )
.then( function(msg){
	console.log( msg );
} );
```

چون فقط یکی برنده است، مقدار fulfillment یک پیام واحد است، نه `array` مثل `Promise.all([ .. ])`.

#### Timeout Race

این مثال را قبلاً دیدیم که `Promise.race([ .. ])` چطور الگوی timeout Promise را بیان می‌کند:

```js
// `foo()` is a Promise-aware function

// `timeoutPromise(..)`, defined ealier, returns
// a Promise that rejects after a specified delay

// setup a timeout for `foo()`
Promise.race( [
	foo(),					// attempt `foo()`
	timeoutPromise( 3000 )	// give it 3 seconds
] )
.then(
	function(){
		// `foo(..)` fulfilled in time!
	},
	function(err){
		// either `foo()` rejected, or it just
		// didn't finish in time, so inspect
		// `err` to know which
	}
);
```

این الگو در اغلب موارد خوب جواب می‌دهد، اما ظرافت‌هایی دارد که در `Promise.race([ .. ])` و `Promise.all([ .. ])` هر دو مهم‌اند.

#### «Finally»

سؤال کلیدی: «Promiseهایی که discard/ignore می‌شوند چه می‌شود؟» از زاویه‌ی performance نمی‌پرسیم (معمولاً GC می‌شوند)، بلکه از زاویه‌ی رفتاری (side effect و...).

Promise قابل cancel نیست -- و بهتر هم هست نباشد چون immutability بیرونی که در بخش "Promise Uncancelable" می‌آید را می‌شکند -- پس فقط می‌توان بی‌صدا نادیده‌اش گرفت.

اما اگر `foo()` در مثال قبل resource رزرو کرده باشد و timeout زودتر fire شود چه؟ آیا این pattern کاری می‌کند آن resource آزاد شود یا side effectها خنثی شوند؟ یا فرض کنید فقط می‌خواستید timeout شدن `foo()` را log کنید.

برای همین بعضی توسعه‌دهنده‌ها پیشنهاد داده‌اند Promise باید `finally(..)` داشته باشد که همیشه هنگام resolution اجرا شود و cleanup لازم را انجام دهد. فعلاً در specification نیست، اما شاید در ES7+ بیاید.

فرم احتمالی:

```js
var p = Promise.resolve( 42 );

p.then( something )
.finally( cleanup )
.then( another )
.finally( cleanup );
```

**نکته:** در خیلی از کتابخانه‌های Promise، `finally(..)` هم Promise جدید می‌سازد و برمی‌گرداند. اگر `cleanup(..)` Promise برگرداند، وارد chain می‌شود و باز همان مسائل unhandled rejection ممکن است پیش بیاید.

تا آن زمان می‌توانیم helper ایستایی بسازیم که resolution Promise را «مشاهده کند» بدون اینکه در آن دخالت کند:

```js
// polyfill-safe guard check
if (!Promise.observe) {
	Promise.observe = function(pr,cb) {
		// side-observe `pr`'s resolution
		pr.then(
			function fulfilled(msg){
				// schedule callback async (as Job)
				Promise.resolve( msg ).then( cb );
			},
			function rejected(err){
				// schedule callback async (as Job)
				Promise.resolve( err ).then( cb );
			}
		);

		// return original promise
		return pr;
	};
}
```

استفاده در مثال timeout:

```js
Promise.race( [
	Promise.observe(
		foo(),					// attempt `foo()`
		function cleanup(msg){
			// clean up after `foo()`, even if it
			// didn't finish before the timeout
		}
	),
	timeoutPromise( 3000 )	// give it 3 seconds
] )
```

این `Promise.observe(..)` فقط یک نمونه است برای مشاهده‌ی completion Promiseها بدون دست‌بردن در آن‌ها. کتابخانه‌های مختلف راه‌حل‌های خودشان را دارند. مهم این است که در بعضی جاها نمی‌خواهید Promiseها صرفاً بی‌صدا ignore شوند.

### واریانت‌هایی از all([ .. ]) و race([ .. ])

با اینکه ES6 Promise به‌صورت built-in `Promise.all([ .. ])` و `Promise.race([ .. ])` دارد، چند الگوی رایج دیگر هم هستند که روی همین semantics تغییر می‌دهند:

* `none([ .. ])`: شبیه `all([ .. ])` اما fulfillment/rejection جابه‌جا می‌شود؛ همه باید rejected شوند.
* `any([ .. ])`: شبیه `all([ .. ])` اما rejectionها را نادیده می‌گیرد؛ کافی است یکی fulfill شود.
* `first([ .. ])`: شبیه race + any؛ rejectionها نادیده گرفته می‌شوند و اولین fulfillment برنده است.
* `last([ .. ])`: شبیه `first([ .. ])` اما آخرین fulfillment برنده است.

برخی کتابخانه‌ها این‌ها را دارند، ولی خودتان هم می‌توانید با Promise + `race([ .. ])` + `all([ .. ])` بسازید.

مثلاً `first([ .. ])`:

```js
// polyfill-safe guard check
if (!Promise.first) {
	Promise.first = function(prs) {
		return new Promise( function(resolve,reject){
			// loop through all promises
			prs.forEach( function(pr){
				// normalize the value
				Promise.resolve( pr )
				// whichever one fulfills first wins, and
				// gets to resolve the main promise
				.then( resolve );
			} );
		} );
	};
}
```

**نکته:** این پیاده‌سازی `first(..)` اگر همه rejected شوند reject نمی‌کند؛ مثل `Promise.race([])` hang می‌کند. اگر بخواهید، می‌توانید منطق اضافه بگذارید که rejectionها را بشمارد و اگر همه rejected شدند `reject()` روی Promise اصلی زده شود.

### Iteration هم‌زمان

گاهی می‌خواهید روی لیستی از Promiseها iterate کنید و کاری روی همه انجام دهید، مثل utilityهای sync آرایه (`forEach(..)`, `map(..)`, `some(..)`, `every(..)`). اگر کار روی هر Promise اساساً sync باشد، این‌ها مثل قبل خوب‌اند (مثل `forEach(..)` بالا).

اما اگر taskها ذاتاً async باشند یا بخواهند/بتوانند concurrent اجرا شوند، می‌توانید نسخه‌های async همین utilityها را (که خیلی کتابخانه‌ها می‌دهند) استفاده کنید.

مثلاً `map(..)` async که یک `array` از مقدارها (Promise یا هر چیز دیگر) و یک تابع task می‌گیرد. خود `map(..)` Promiseای برمی‌گرداند که fulfillment آن آرایه‌ای از خروجی async هر task است:

```js
if (!Promise.map) {
	Promise.map = function(vals,cb) {
		// new promise that waits for all mapped promises
		return Promise.all(
			// note: regular array `map(..)`, turns
			// the array of values into an array of
			// promises
			vals.map( function(val){
				// replace `val` with a new promise that
				// resolves after `val` is async mapped
				return new Promise( function(resolve){
					cb( val, resolve );
				} );
			} )
		);
	};
}
```

**نکته:** در این پیاده‌سازی `map(..)` راه سیگنال async rejection ندارید، اما اگر داخل callback نگاشت (`cb(..)`) exception sync رخ دهد، Promise اصلیِ `Promise.map(..)` rejected می‌شود.

استفاده از `map(..)` با لیستی از Promiseها:

```js
var p1 = Promise.resolve( 21 );
var p2 = Promise.resolve( 42 );
var p3 = Promise.reject( "Oops" );

// double values in list even if they're in
// Promises
Promise.map( [p1,p2,p3], function(pr,done){
	// make sure the item itself is a Promise
	Promise.resolve( pr )
	.then(
		// extract value as `v`
		function(v){
			// map fulfillment `v` to new value
			done( v * 2 );
		},
		// or, map to promise rejection message
		done
	);
} )
.then( function(vals){
	console.log( vals );	// [42,84,"Oops"]
} );
```
