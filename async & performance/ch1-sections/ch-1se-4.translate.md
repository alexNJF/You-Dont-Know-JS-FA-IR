# همروندی (Concurrency)

فرض کنید سایتی دارید که فهرستی از status updateها (مثل news feed شبکه اجتماعی) را نشان می‌دهد و با اسکرول کاربر، محتوا را تدریجی لود می‌کند. برای درست کار کردن چنین قابلیتی، حداقل دو «فرآیند» جدا باید *هم‌زمان* در حال اجرا باشند (یعنی در یک بازه‌ی زمانی مشترک، نه لزوماً در یک لحظه‌ی دقیق).

**نکته:** این‌جا «فرآیند» را در گیومه می‌گذاریم چون منظور process واقعی سیستم‌عاملی نیست. منظور فرایند/تسک مجازی است که یک زنجیره‌ی منطقیِ پیوسته از عملیات را نشان می‌دهد. برای هماهنگی اصطلاحات، «process» را به‌جای «task» به کار می‌بریم.

«process» اول به رویدادهای `onscroll` پاسخ می‌دهد (و برای محتوای جدید Ajax می‌زند) وقتی کاربر بیشتر اسکرول می‌کند. «process» دوم پاسخ‌های Ajax را دریافت می‌کند (و محتوا را روی صفحه رندر می‌کند).

واضح است اگر کاربر سریع اسکرول کند، ممکن است قبل از رسیدن/پردازش پاسخ اول، دو یا چند `onscroll` fire شوند. در نتیجه رویدادهای `onscroll` و پاسخ‌های Ajax با سرعت بالا و درهم‌رفته رخ می‌دهند.

Concurrency یعنی دو یا چند «process» در یک بازه‌ی زمانی مشترک در حال اجرا باشند، فارغ از اینکه عملیات ریزشان *واقعاً موازی* باشد (در یک لحظه روی چند هسته/پردازنده) یا نه. می‌توانید concurrency را parallelism در سطح process/task بدانید، نه parallelism در سطح operation (threadهای پردازنده‌ای جدا).

**نکته:** Concurrency یک ایده‌ی اختیاریِ تعامل این «process»ها با هم را هم وارد می‌کند. جلوتر به آن برمی‌گردیم.

برای یک پنجره‌ی زمانی مشخص (مثلاً چند ثانیه اسکرول کاربر)، هر «process» مستقل را به‌صورت زنجیره‌ای از رویداد/عملیات تصور کنیم:

"Process" 1 (`onscroll` events):
```
onscroll, request 1
onscroll, request 2
onscroll, request 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
onscroll, request 7
```

"Process" 2 (Ajax response events):
```
response 1
response 2
response 3
response 4
response 5
response 6
response 7
```

کاملاً ممکن است یک `onscroll` و یک پاسخ Ajax دقیقاً در یک *لحظه* آماده‌ی پردازش باشند. مثلاً timeline زیر:

```
onscroll, request 1
onscroll, request 2          response 1
onscroll, request 3          response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6          response 4
onscroll, request 7
response 6
response 5
response 7
```

اما با توجه به event loop، JS در هر لحظه فقط یک رویداد را پردازش می‌کند. پس یا `onscroll, request 2` اول رخ می‌دهد یا `response 1`؛ هر دو نمی‌توانند دقیقاً یک لحظه رخ بدهند. مثل صف غذا در مدرسه: هرچقدر بیرون شلوغ باشد، داخل باید یک صف واحد تشکیل شود.

حالا interleave شدن این رویدادها را روی صف event loop ببینیم:

Event Loop Queue:
```
onscroll, request 1   <--- Process 1 starts
onscroll, request 2
response 1            <--- Process 2 starts
onscroll, request 3
response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
response 4
onscroll, request 7   <--- Process 1 finishes
response 6
response 5
response 7            <--- Process 2 finishes
```

«Process 1» و «Process 2» هم‌روند اجرا می‌شوند (موازی در سطح تسک)، اما رویدادهای درونشان در صف event loop به‌صورت ترتیبی اجرا می‌شوند.

راستی، دقت کردید `response 6` قبل از `response 5` برگشت؟

event loop تک‌ریسمانی یکی از بیان‌های concurrency است (و فقط همین هم نیست؛ جلوتر دوباره برمی‌گردیم).

### بدون تعامل

وقتی دو یا چند «process» در یک برنامه هم‌زمان interleave می‌شوند، اگر کارها نامرتبط باشند الزاماً لازم نیست با هم تعامل داشته باشند. **اگر تعامل نداشته باشند، nondeterminism کاملاً قابل قبول است.**

مثال:

```js
var res = {};

function foo(results) {
	res.foo = results;
}

function bar(results) {
	res.bar = results;
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

`foo()` و `bar()` دو «process» هم‌روند هستند و ترتیب fire شدنشان نامعین است. اما برنامه را طوری ساخته‌ایم که ترتیب مهم نباشد، چون مستقل‌اند و نیازی به تعامل ندارند.

این race condition نیست، چون کد در هر ترتیبی درست کار می‌کند.

### تعامل

معمول‌تر این است که «process»های هم‌روند ناگزیر تعامل داشته باشند، غیرمستقیم از طریق scope و/یا DOM. وقتی این تعامل وجود دارد، باید هماهنگش کنید تا از race condition جلوگیری شود.

مثال ساده‌ای از دو «process» هم‌روند با تعاملِ مبتنی بر ترتیب ضمنی که فقط *گاهی* خراب می‌شود:

```js
var res = [];

function response(data) {
	res.push( data );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

دو «process» هم‌روند همان دو فراخوانی `response()` هستند. هرکدام می‌توانند اول رخ دهند.

فرض کنید انتظار این باشد که `res[0]` نتیجه‌ی `"http://some.url.1"` و `res[1]` نتیجه‌ی `"http://some.url.2"` باشد. گاهی همین می‌شود، گاهی برعکس؛ بسته به اینکه کدام درخواست زودتر تمام شود. این nondeterminism با احتمال زیاد race condition است.

**نکته:** در این موقعیت‌ها خیلی مراقب فرضیاتتان باشید. مثلاً رایج است توسعه‌دهنده ببیند `"http://some.url.2"` «همیشه» کندتر از `"http://some.url.1"` پاسخ می‌دهد (مثلاً یکی کوئری دیتابیس می‌زند و یکی فایل استاتیک). حتی اگر هر دو درخواست به یک سرور بروند و سرور عمداً ترتیبی جواب بدهد، باز تضمین *واقعی* برای ترتیب رسیدن پاسخ‌ها به مرورگر ندارید.

پس برای رفع race condition باید ترتیب تعامل را هماهنگ کنید:

```js
var res = [];

function response(data) {
	if (data.url == "http://some.url.1") {
		res[0] = data;
	}
	else if (data.url == "http://some.url.2") {
		res[1] = data;
	}
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

فرقی ندارد کدام پاسخ زودتر برسد؛ با بررسی `data.url` (با فرض اینکه سرور برگرداند) جای درست داده را در `res` تعیین می‌کنیم. پس `res[0]` همیشه نتیجه‌ی URL اول است و `res[1]` همیشه URL دوم. با یک هماهنگی ساده، nondeterminismِ race condition حذف شد.

همین منطق برای تعامل‌های موازی روی DOM هم صدق می‌کند. مثلاً یکی محتوای `<div>` را آپدیت کند و دیگری style/attribute آن را (مثلاً visible شدن بعد از آماده شدن محتوا). طبیعتاً نمی‌خواهید قبل از محتوا عنصر را نمایش دهید؛ پس باید ترتیب درست را هماهنگ کنید.

بعضی سناریوهای concurrency بدون هماهنگی *همیشه* خراب‌اند (نه فقط *گاهی*). مثال:

```js
var a, b;

function foo(x) {
	a = x * 2;
	baz();
}

function bar(y) {
	b = y * 2;
	baz();
}

function baz() {
	console.log(a + b);
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

اینجا چه `foo()` اول اجرا شود چه `bar()`، اولین اجرای `baz()` زود است (یکی از `a` یا `b` هنوز `undefined` است). اجرای دوم `baz()` درست خواهد بود چون هر دو مقدار موجود شده‌اند.

راه‌های مختلفی برای حلش هست. یک راه ساده:

```js
var a, b;

function foo(x) {
	a = x * 2;
	if (a && b) {
		baz();
	}
}

function bar(y) {
	b = y * 2;
	if (a && b) {
		baz();
	}
}

function baz() {
	console.log( a + b );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

شرط `if (a && b)` دور `baz()` را معمولاً «gate» می‌گویند: ترتیب رسیدن `a` و `b` معلوم نیست، اما تا وقتی هر دو نرسیده‌اند جلو نمی‌رویم و gate را باز نمی‌کنیم.

نوع دیگری از تعامل concurrency را گاهی «race» می‌گویند، ولی دقیق‌تر «latch» است: «فقط اولی برنده است». اینجا nondeterminism قابل قبول است، چون صریحاً می‌گویید اشکالی ندارد فقط یکی برنده شود.

کد خراب:

```js
var a;

function foo(x) {
	a = x * 2;
	baz();
}

function bar(x) {
	a = x / 2;
	baz();
}

function baz() {
	console.log( a );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

هرکدام (`foo()` یا `bar()`) که دیرتر اجرا شود، هم مقدار `a` قبلی را overwrite می‌کند و هم اجرای `baz()` را تکرار می‌کند (که احتمالاً مطلوب نیست).

پس با یک latch ساده، فقط اولی را عبور می‌دهیم:

```js
var a;

function foo(x) {
	if (a == undefined) {
		a = x * 2;
		baz();
	}
}

function bar(x) {
	if (a == undefined) {
		a = x / 2;
		baz();
	}
}

function baz() {
	console.log( a );
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", foo );
ajax( "http://some.url.2", bar );
```

شرط `if (a == undefined)` فقط اولین فراخوانی `foo()` یا `bar()` را عبور می‌دهد و دومی (و بعدی‌ها) نادیده گرفته می‌شوند. نفر دوم فضیلتی ندارد!

**نکته:** در این مثال‌ها از متغیر سراسری برای سادگی استفاده کردیم، اما منطق به آن وابسته نیست. کافی است توابع به متغیرها از طریق scope دسترسی داشته باشند. تکیه به متغیر lexical scoped (کتاب *Scope & Closures*) و به‌ویژه global مثل این مثال‌ها، یکی از ضعف‌های این سبک هماهنگی concurrency است. در فصل‌های بعد روش‌های تمیزتری می‌بینیم.

### همکاری (Cooperation)

بیان دیگری از هماهنگی concurrency، «cooperative concurrency» است. این‌جا تمرکز کمتر روی تعامل از مسیر اشتراک مقدار در scopeهاست (هرچند مجاز است). هدف این است که یک «process» طولانی را به گام‌ها یا batchهای کوچک‌تر بشکنیم تا «process»های هم‌روند دیگر هم فرصت interleave در صف event loop داشته باشند.

مثلاً یک handler پاسخ Ajax را تصور کنید که باید لیست بزرگی از نتایج را transform کند. برای کوتاه‌بودن کد از `Array#map(..)` استفاده می‌کنیم:

```js
var res = [];

// `response(..)` receives array of results from the Ajax call
function response(data) {
	// add onto existing `res` array
	res = res.concat(
		// make a new transformed array with all `data` values doubled
		data.map( function(val){
			return val * 2;
		} )
	);
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

اگر `"http://some.url.1"` اول برگردد، کل لیست یکجا map می‌شود. اگر چند هزار رکورد باشد معمولاً مسئله‌ای نیست. اما اگر مثلاً ۱۰ میلیون رکورد باشد، زمان اجرا زیاد می‌شود (چند ثانیه روی لپ‌تاپ قوی، خیلی بیشتر روی موبایل و ...).

در حین اجرای این «process»، هیچ چیز دیگری در صفحه پیش نمی‌رود: نه `response(..)`های بعدی، نه آپدیت UI، نه رویداد کاربر مثل اسکرول/تایپ/کلیک. این واقعاً بد است.

برای داشتن سیستمی همکارانه‌تر و responsive‌تر که صف event loop را اشغال نکند، نتایج را در batchهای async پردازش می‌کنیم و بعد از هر batch کنترل را به event loop برمی‌گردانیم تا رویدادهای منتظر اجرا شوند.

یک روش ساده:

```js
var res = [];

// `response(..)` receives array of results from the Ajax call
function response(data) {
	// let's just do 1000 at a time
	var chunk = data.splice( 0, 1000 );

	// add onto existing `res` array
	res = res.concat(
		// make a new transformed array with all `chunk` values doubled
		chunk.map( function(val){
			return val * 2;
		} )
	);

	// anything left to process?
	if (data.length > 0) {
		// async schedule next batch
		setTimeout( function(){
			response( data );
		}, 0 );
	}
}

// ajax(..) is some arbitrary Ajax function given by a library
ajax( "http://some.url.1", response );
ajax( "http://some.url.2", response );
```

داده را در chunkهای حداکثر ۱۰۰۰تایی پردازش می‌کنیم. این‌طور هر «process» کوتاه می‌شود، حتی اگر تعداد processها بیشتر شود. در مقابل interleave بهتر روی event loop می‌گیریم و سایت/اپ responsiveتر می‌شود.

البته این‌جا ترتیب اجرای processها را هماهنگ نکرده‌ایم، پس ترتیب نتایج در `res` قابل پیش‌بینی نیست. اگر ترتیب مهم باشد، باید از تکنیک‌های تعاملی که بالاتر گفتیم (یا فصل‌های بعد) استفاده کنید.

اینجا از هک `setTimeout(..0)` برای زمان‌بندی async استفاده کردیم؛ یعنی تقریباً «این تابع را انتهای صف فعلی event loop بگذار».

**نکته:** `setTimeout(..0)` از نظر فنی آیتم را مستقیم داخل event loop نمی‌گذارد. تایمر در اولین فرصت ممکن رویداد را وارد می‌کند. مثلاً دو `setTimeout(..0)` پشت‌سرهم تضمین صددرصدی ندارند به همان ترتیب فراخوانی پردازش شوند، پس drift زمانی و بی‌نظمی ترتیب ممکن است رخ دهد. در Node.js رویکرد مشابه `process.nextTick(..)` است. با اینکه راحت و معمولاً performant است، هنوز راه مستقیم و واحدی بین همه‌ی محیط‌ها برای تضمین ordering رویداد async نداریم. بخش بعد دقیق‌تر می‌پردازد.
