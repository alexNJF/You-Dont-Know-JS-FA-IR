# Generatorها + Promiseها

در بحث قبلی نشان دادیم generatorها را می‌شود async iterate کرد، که برای reason-ability ترتیبی، جهش بزرگی نسبت به درهم‌ریختگی callbackهاست. اما یک چیز خیلی مهم را از دست دادیم: اعتمادپذیری و compose‌پذیری Promiseها (فصل ۳)!

نگران نباشید -- می‌توانیم آن را برگردانیم. بهترین حالت در ES6 این است که generatorها (کد async با ظاهر synchronous) را با Promiseها (قابل‌اعتماد و compose‌پذیر) ترکیب کنیم.

اما چطور؟

نسخه‌ی Promise-based مثال Ajax جاری را از فصل ۳ به یاد بیاورید:

```js
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

foo( 11, 31 )
.then(
	function(text){
		console.log( text );
	},
	function(err){
		console.error( err );
	}
);
```

در نسخه‌ی generator قبلیِ همین مثال، `foo(..)` چیزی برنمی‌گرداند (`undefined`) و کد کنترل iterator هم اهمیتی به مقدار yield شده نمی‌داد.

اما اینجا `foo(..)` که Promise-aware است بعد از Ajax یک Promise برمی‌گرداند. این یعنی می‌توانیم با `foo(..)` یک Promise بسازیم، آن را از generator `yield` کنیم، و کد کنترل iterator همان Promise را دریافت کند.

اما iterator باید با Promise چه کار کند؟

باید منتظر resolution Promise بماند (fulfillment یا rejection)، بعد یا generator را با پیام fulfillment resume کند، یا با دلیل rejection یک خطا به داخل generator throw کند.

این را دوباره می‌گویم چون خیلی مهم است: طبیعی‌ترین راه برای گرفتن بهترین نتیجه از Promise و generator این است که **یک Promise را `yield` کنید** و آن Promise را به کنترل iterator generator وصل کنید.

بیایید امتحان کنیم! اول `foo(..)` Promise-aware را کنار generator `*main()` می‌گذاریم:

```js
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

function *main() {
	try {
		var text = yield foo( 11, 31 );
		console.log( text );
	}
	catch (err) {
		console.error( err );
	}
}
```

قوی‌ترین نکته‌ی این refactor این است که کد داخل `*main()` **اصلاً لازم نبود تغییر کند!** داخل generator هر چیزی که yield می‌شود فقط یک detail پیاده‌سازی opaque است؛ نه لازم است از آن خبر داشته باشیم، نه لازم است نگرانش باشیم.

حالا `*main()` را چطور اجرا کنیم؟ هنوز کمی plumbing پیاده‌سازی لازم داریم تا Promise yield شده را بگیریم و طوری وصلش کنیم که با resolve شدن، generator resume شود. فعلاً دستی امتحان کنیم:

```js
var it = main();

var p = it.next().value;

// wait for the `p` promise to resolve
p.then(
	function(text){
		it.next( text );
	},
	function(err){
		it.throw( err );
	}
);
```

راستش آن‌قدرها هم دردناک نبود، نه؟

این snippet خیلی شبیه همان چیزی است که قبلاً با generator دستی و callback error-first انجام داده بودیم. به‌جای `if (err) { it.throw..`، Promise خودش fulfillment و rejection را برایمان split می‌کند، اما کنترل iterator در اصل همان است.

البته از چند جزئیات مهم رد شدیم.

مهم‌ترینش اینکه اینجا از این واقعیت استفاده کردیم که `*main()` فقط یک گام Promise-aware دارد. اگر بخواهیم generatorای با هر تعداد گام را Promise-drive کنیم چه؟ که قطعاً نمی‌خواهیم برای هر generator زنجیره‌ی Promise را دستی بازنویسی کنیم. بهتر است راهی باشد iteration control را تکرار (loop) کند: هر بار Promise بیرون آمد منتظر resolveش بماند و بعد ادامه دهد.

همچنین اگر generator حین `it.next(..)` خطا throw کند (عمدی یا تصادفی) چه؟ باید متوقف شویم یا catch کنیم و دوباره برگردانیم داخل؟ همین‌طور اگر `it.throw(..)` برای rejection Promise را به generator بدهیم و مدیریت نشود و برگردد بیرون چه؟

### Runner برای Generator آگاه به Promise

هرچه بیشتر این مسیر را بررسی کنید، بیشتر می‌گویید: «کاش یک utility آماده این کار را انجام دهد.» و کاملاً درست است. این pattern آن‌قدر مهم است که نمی‌خواهید اشتباه پیاده‌اش کنید یا مدام تکرارش کنید؛ پس بهترین انتخاب utilityای است که مشخصاً برای *run* کردن generatorهایی که Promise `yield` می‌کنند طراحی شده.

چندین کتابخانه‌ی Promise abstraction همین utility را دارند، از جمله کتابخانه‌ی *asynquence* من با `runner(..)` که در پیوست A بحث می‌شود.

اما برای یادگیری و نمایش، بیایید utility مستقل خودمان را تعریف کنیم: `run(..)`:

```js
// thanks to Benjamin Gruenbaum (@benjamingr on GitHub) for
// big improvements here!
function run(gen) {
	var args = [].slice.call( arguments, 1), it;

	// initialize the generator in the current context
	it = gen.apply( this, args );

	// return a promise for the generator completing
	return Promise.resolve()
		.then( function handleNext(value){
			// run to the next yielded value
			var next = it.next( value );

			return (function handleResult(next){
				// generator has completed running?
				if (next.done) {
					return next.value;
				}
				// otherwise keep going
				else {
					return Promise.resolve( next.value )
						.then(
							// resume the async loop on
							// success, sending the resolved
							// value back into the generator
							handleNext,

							// if `value` is a rejected
							// promise, propagate error back
							// into the generator for its own
							// error handling
							function handleErr(err) {
								return Promise.resolve(
									it.throw( err )
								)
								.then( handleResult );
							}
						);
				}
			})(next);
		} );
}
```

همان‌طور که می‌بینید، به‌مراتب پیچیده‌تر از چیزی است که بخواهید هر بار خودتان بنویسید، و قطعاً نمی‌خواهید برای هر generator تکرارش کنید. پس helper آماده‌ی کتابخانه/utility بهترین مسیر است. با این حال پیشنهاد می‌کنم چند دقیقه روی این کد وقت بگذارید تا الگوی مذاکره‌ی generator+Promise بهتر جا بیفتد.

برای مثال Ajax جاری، `run(..)` را با `*main()` چطور استفاده می‌کنیم؟

```js
function *main() {
	// ..
}

run( main );
```

همین! `run(..)` که نوشتیم generator ورودی را خودکار و async تا پایان جلو می‌برد.

**نکته:** `run(..)`ای که تعریف کردیم خودش Promise برمی‌گرداند که با اتمام generator resolve می‌شود، یا اگر خطای مدیریت‌نشده‌ای باشد آن را دریافت می‌کند. این قابلیت را اینجا نشان نمی‌دهیم، ولی بعداً برمی‌گردیم.

#### ES7: `async` و `await`؟

الگوی بالا -- generatorی که Promise yield می‌کند و Promise هم iterator generator را تا completion پیش می‌برد -- آن‌قدر قدرتمند و مفید است که اگر بدون شلوغی helper کتابخانه (مثل `run(..)`) انجام شود خیلی بهتر است.

احتمالاً خبر خوب داریم. زمان نگارش این متن، برای اضافه‌شدن syntax جدید در بازه‌ی بعد از ES6 (حوالی ES7) حمایت اولیه‌ی جدی وجود داشت. هنوز زود است برای تضمین جزئیات، اما احتمال خوبی هست چیزی شبیه این نهایی شود:

```js
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

async function main() {
	try {
		var text = await foo( 11, 31 );
		console.log( text );
	}
	catch (err) {
		console.error( err );
	}
}

main();
```

همان‌طور که می‌بینید دیگر `run(..)` نداریم (یعنی helper کتابخانه‌ای لازم نیست) و `main()` مثل تابع عادی صدا زده می‌شود. همچنین `main()` دیگر generator نیست؛ نوع جدیدی از تابع است: `async function`. و به‌جای `yield` کردن Promise، روی آن `await` می‌کنیم.

`async function` خودش می‌فهمد با `await` روی Promise چه کند: تابع را pause می‌کند (مثل generator) تا Promise resolve شود. در این snippet نشان ندادیم، اما فراخوانی async function مثل `main()` خودش Promise برمی‌گرداند که با اتمام تابع resolve می‌شود.

**نکته:** syntax مربوط به `async` / `await` برای کسانی که C# کار کرده‌اند خیلی آشناست، چون تقریباً یکسان است.

این proposal عملاً همان الگویی را که خودمان استخراج کردیم به یک مکانیزم نحوی رسمی تبدیل می‌کند: ترکیب Promise با flow-control همزمان‌نما. یعنی بهترین‌های هر دو دنیا برای پاسخ دادن عملی به تقریباً همه‌ی نگرانی‌های اصلی callback.

اینکه proposalی در این سطح همین حالا وجود دارد و حمایت اولیه گرفته، یک رأی اعتماد جدی به اهمیت آینده‌ی این الگوی async است.

### هم‌روندی Promise در Generator

تا اینجا فقط flow async تک‌مرحله‌ای با Promise+generator را نشان دادیم. اما کد واقعی معمولاً چندین گام async دارد.

اگر مراقب نباشید، ظاهر syncگونه‌ی generator ممکن است شما را در ساختار concurrency کد بی‌دقت کند و الگوهای عملکردی ضعیف بسازد. پس کمی روی گزینه‌ها دقیق می‌شویم.

سناریو: باید از دو منبع مختلف داده بگیرید، پاسخ‌ها را ترکیب کنید، درخواست سومی بزنید، و پاسخ آخر را چاپ کنید. مشابهش را در فصل ۳ با Promise دیدیم؛ این‌بار با generator نگاه کنیم.

اولین غریزه ممکن است این باشد:

```js
function *foo() {
	var r1 = yield request( "http://some.url.1" );
	var r2 = yield request( "http://some.url.2" );

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// use previously defined `run(..)` utility
run( foo );
```

این کد کار می‌کند، اما برای سناریوی ما بهینه نیست. می‌بینید چرا؟

چون درخواست‌های `r1` و `r2` می‌توانند -- و برای performance *باید* -- هم‌زمان اجرا شوند، اما این کد آن‌ها را ترتیبی اجرا می‌کند؛ URL دوم تا پایان درخواست اول fetch نمی‌شود. این دو مستقل‌اند، پس بهتر است موازی اجرا شوند.

اما با generator و `yield` چطور این را انجام دهیم؟ `yield` فقط یک pause point است؛ نمی‌توانید واقعاً دو pause هم‌زمان داشته باشید.

پاسخ طبیعی و مؤثر این است که flow async را روی Promise بنا کنیم، مخصوصاً توانایی Promise در مدیریت state مستقل از زمان (بخش "Future Value" در فصل ۳).

ساده‌ترین رویکرد:

```js
function *foo() {
	// make both requests "in parallel"
	var p1 = request( "http://some.url.1" );
	var p2 = request( "http://some.url.2" );

	// wait until both promises resolve
	var r1 = yield p1;
	var r2 = yield p2;

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// use previously defined `run(..)` utility
run( foo );
```

چرا این با snippet قبلی فرق دارد؟ دقت کنید `yield` کجا هست و کجا نیست. `p1` و `p2` Promiseهای دو Ajax هم‌زمان‌اند. مهم نیست کدام زودتر تمام شود، چون Promise تا هر زمان لازم باشد state resolved را نگه می‌دارد.

بعد با دو `yield` بعدی، resolution هر Promise را می‌گیریم (`r1` و `r2`). اگر `p1` زودتر resolve شود، `yield p1` اول resume می‌شود و سپس روی `yield p2` منتظر می‌ماند. اگر `p2` زودتر resolve شود، مقدارش را نگه می‌دارد تا نوبت خواندنش برسد، اما `yield p1` همچنان اول منتظر می‌ماند تا `p1` resolve شود.

در هر حالت، `p1` و `p2` concurrent اجرا می‌شوند، و هر دو باید (با هر ترتیبی) تمام شوند تا Ajax مربوط به `r3 = yield request..` اجرا شود.

اگر این مدل flow-control آشناست، همان الگوی "gate" فصل ۳ است که با `Promise.all([ .. ])` ممکن می‌شود. پس می‌توانیم همین جریان را این‌طور هم بنویسیم:

```js
function *foo() {
	// make both requests "in parallel," and
	// wait until both promises resolve
	var results = yield Promise.all( [
		request( "http://some.url.1" ),
		request( "http://some.url.2" )
	] );

	var r1 = results[0];
	var r2 = results[1];

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// use previously defined `run(..)` utility
run( foo );
```

**نکته:** همان‌طور که در فصل ۳ گفتیم، با destructuring ES6 می‌شود `var r1 = .. var r2 = ..` را ساده کرد: `var [r1,r2] = results`.

به بیان دیگر، تمام قابلیت‌های concurrency مربوط به Promise در رویکرد generator+Promise هم در دسترس است. پس هرجا flow async شما فراتر از گام‌های ترتیبی این-بعد-آن باشد، Promise معمولاً بهترین انتخاب است.

#### Promiseها، پنهان

یک هشدار سبکی: مراقب باشید چقدر منطق Promise را **داخل generator** می‌ریزید. کل هدف استفاده از generator در async این است که کد ساده، ترتیبی، و sync-looking بسازیم و جزئیات ناهمگامی را تا جای ممکن پنهان کنیم.

مثلاً این می‌تواند تمیزتر باشد:

```js
// note: normal function, not generator
function bar(url1,url2) {
	return Promise.all( [
		request( url1 ),
		request( url2 )
	] );
}

function *foo() {
	// hide the Promise-based concurrency details
	// inside `bar(..)`
	var results = yield bar(
		"http://some.url.1",
		"http://some.url.2"
	);

	var r1 = results[0];
	var r2 = results[1];

	var r3 = yield request(
		"http://some.url.3/?v=" + r1 + "," + r2
	);

	console.log( r3 );
}

// use previously defined `run(..)` utility
run( foo );
```

داخل `*foo()` روشن‌تر است که فقط از `bar(..)` نتیجه می‌خواهیم و روی آن `yield`-wait می‌کنیم. لازم نیست بدانیم زیرپوست، `Promise.all([ .. ])` کار را پیش می‌برد.

**ما ناهمگامی و حتی Promise را به detail پیاده‌سازی تبدیل می‌کنیم.**

پنهان‌کردن منطق Promise داخل تابعی که generator فقط صدایش می‌زند، مخصوصاً وقتی flow-control پیچیده دارید خیلی مفید است. مثلاً:

```js
function bar() {
	return	Promise.all( [
		  baz( .. )
		  .then( .. ),
		  Promise.race( [ .. ] )
		] )
		.then( .. )
}
```

گاهی چنین منطق پیچیده‌ای لازم است، و اگر مستقیم در generator بریزید، عملاً بخش زیادی از دلیل استفاده از generator را از بین برده‌اید. بهتر است این جزئیات را عمداً از کد generator abstraction کنیم تا بیان task سطح‌بالا شلوغ نشود.

علاوه بر functional و performant بودن، باید تلاش کنیم کدی بنویسیم که تا حد ممکن reason-able و maintainable باشد.

**نکته:** abstraction همیشه مفید نیست -- گاهی در برابر خلاصه‌نویسی، پیچیدگی اضافه می‌کند. اما در این مورد، برای کد async مبتنی بر generator+Promise به‌نظرم سالم‌تر از گزینه‌های دیگر است. با این حال مثل هر توصیه‌ی فنی، context پروژه و تیم‌تان را مبنا قرار دهید.
