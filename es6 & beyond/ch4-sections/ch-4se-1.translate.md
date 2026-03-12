# Promiseها

بیایید چند سوءبرداشت را روشن کنیم: Promiseها قرار نیست callbackها را جایگزین کنند. Promiseها یک واسط قابل‌اعتماد فراهم می‌کنند -- یعنی بین کد فراخواننده‌ی شما و کد asyncی که قرار است کار را انجام دهد -- تا callbackها را مدیریت کنند.

یک روش دیگر برای فکر کردن به Promise این است که آن را مثل event listener ببینیم؛ جایی که برای رویدادی ثبت‌نام می‌کنید تا بفهمید چه زمانی یک کار تمام شده است. این رویداد فقط یک بار رخ می‌دهد، اما همچنان می‌توان آن را یک event در نظر گرفت.

Promiseها قابل chain شدن هستند و می‌توانند مجموعه‌ای از گام‌هایی را که به‌صورت ناهمگام کامل می‌شوند، پشت‌سرهم اجرا کنند. همراه با abstractionهای سطح‌بالاتر مثل متد `all(..)` (در اصطلاح کلاسیک: «gate») و متد `race(..)` (در اصطلاح کلاسیک: «latch»)، زنجیره‌های Promise یک مکانیزم برای کنترل جریان async فراهم می‌کنند.

یک نگاه دیگر به Promise این است که آن را «*مقدار آینده*» در نظر بگیریم؛ ظرفی مستقل از زمان که دور یک مقدار قرار گرفته است. درباره‌ی این ظرف می‌توان چه مقدار نهایی شده باشد چه نشده باشد، یکسان استدلال کرد. با مشاهده‌ی resolve شدن Promise، این مقدار را وقتی در دسترس شد استخراج می‌کنیم. به بیان دیگر، Promise را نسخه‌ی async مقدار بازگشتی یک تابع sync می‌دانند.

یک Promise فقط یکی از دو نتیجه‌ی ممکن را می‌تواند داشته باشد: fulfilled یا rejected، همراه با یک مقدار اختیاری. اگر fulfilled شود، مقدار نهایی را fulfillment می‌گویند. اگر rejected شود، مقدار نهایی را reason می‌گویند (یعنی «دلیل رد شدن»). Promise فقط *یک بار* می‌تواند resolve شود (چه fulfillment چه rejection). هر تلاش بعدی برای fulfill یا reject صرفاً نادیده گرفته می‌شود. بنابراین وقتی Promise resolve شد، به یک مقدار تغییرناپذیر تبدیل می‌شود.

واضح است که برای درک Promise زاویه‌های مختلفی وجود دارد. هیچ نگاه واحدی به‌تنهایی کامل نیست، اما هر کدام بخشی از تصویر کلی را نشان می‌دهند. برداشت اصلی این است که Promiseها نسبت به async صرفاً مبتنی بر callback، بهبود بزرگی می‌دهند: نظم، پیش‌بینی‌پذیری و اعتمادپذیری.

### ساختن و استفاده از Promise

برای ساختن یک نمونه‌ی Promise از سازنده‌ی `Promise(..)` استفاده کنید:

```js
var p = new Promise( function pr(resolve,reject){
	// ..
} );
```

سازنده‌ی `Promise(..)` یک تابع تکی (`pr(..)`) می‌گیرد که بلافاصله اجرا می‌شود و دو تابع کنترلی به‌عنوان آرگومان دریافت می‌کند که معمولاً `resolve(..)` و `reject(..)` نام‌گذاری می‌شوند. استفاده‌شان به این شکل است:

* اگر `reject(..)` را صدا بزنید، Promise رد می‌شود و هر مقداری که به `reject(..)` بدهید، reason رد شدن خواهد بود.
* اگر `resolve(..)` را بدون مقدار، یا با مقداری غیر Promise صدا بزنید، Promise fulfilled می‌شود.
* اگر `resolve(..)` را با Promise دیگری صدا بزنید، این Promise وضعیت آن Promise ورودی را (چه فوری چه در آینده، چه fulfillment چه rejection) به خود می‌گیرد.

این‌گونه معمولاً یک فراخوانی تابعِ وابسته به callback را با Promise بازنویسی می‌کنید. اگر با utilityای مثل `ajax(..)` شروع کنیم که انتظار callback به سبک error-first دارد:

```js
function ajax(url,cb) {
	// make request, eventually call `cb(..)`
}

// ..

ajax( "http://some.url.1", function handler(err,contents){
	if (err) {
		// handle ajax error
	}
	else {
		// handle `contents` success
	}
} );
```

می‌توانید آن را به این شکل تبدیل کنید:

```js
function ajax(url) {
	return new Promise( function pr(resolve,reject){
		// make request, eventually call
		// either `resolve(..)` or `reject(..)`
	} );
}

// ..

ajax( "http://some.url.1" )
.then(
	function fulfilled(contents){
		// handle `contents` success
	},
	function rejected(reason){
		// handle ajax error reason
	}
);
```

Promiseها متدی به نام `then(..)` دارند که یک یا دو callback می‌پذیرد. تابع اول (اگر وجود داشته باشد) handler حالت fulfillment است. تابع دوم (اگر وجود داشته باشد) handler حالت rejection است؛ چه rejection صریح باشد، چه خطا/استثنایی که هنگام resolve شدن گرفته می‌شود.

اگر یکی از آرگومان‌ها حذف شود یا تابع معتبر نباشد -- معمولاً به‌جایش `null` می‌گذارند -- یک placeholder پیش‌فرض معادل استفاده می‌شود. callback پیش‌فرض موفقیت، مقدار fulfillment را عبور می‌دهد و callback پیش‌فرض خطا، reason رد شدن را propagate می‌کند.

فرم کوتاه `then(null,handleRejection)`، همان `catch(handleRejection)` است.

هر دو متد `then(..)` و `catch(..)` به‌صورت خودکار یک Promise جدید می‌سازند و برمی‌گردانند؛ این Promise جدید به نتیجه‌ی مقدار بازگشتی handlerهای fulfillment/rejection Promise قبلی وصل می‌شود (هر کدام که واقعاً اجرا شده باشد). مثال:

```js
ajax( "http://some.url.1" )
.then(
	function fulfilled(contents){
		return contents.toUpperCase();
	},
	function rejected(reason){
		return "DEFAULT VALUE";
	}
)
.then( function fulfilled(data){
	// handle data from original promise's
	// handlers
} );
```

در این قطعه‌کد، از `fulfilled(..)` یا `rejected(..)` یک مقدار فوری برمی‌گردانیم که در نوبت رویداد بعدی به `fulfilled(..)` در `then(..)` دوم می‌رسد. اگر به‌جایش یک Promise جدید برگردانیم، آن Promise جدید جذب می‌شود و نتیجه‌ی نهایی را تعیین می‌کند:

```js
ajax( "http://some.url.1" )
.then(
	function fulfilled(contents){
		return ajax(
			"http://some.url.2?v=" + contents
		);
	},
	function rejected(reason){
		return ajax(
			"http://backup.url.3?err=" + reason
		);
	}
)
.then( function fulfilled(contents){
	// `contents` comes from the subsequent
	// `ajax(..)` call, whichever it was
} );
```

نکته‌ی مهم این است که استثنا (یا Promise ردشده) در `fulfilled(..)` اول، باعث نمی‌شود `rejected(..)` اول صدا زده شود؛ چون آن handler فقط به resolve شدن Promise اولیه‌ی اول واکنش می‌دهد. در عوض، Promise دومی که `then(..)` دوم روی آن صدا زده شده، آن rejection را دریافت می‌کند.

در نمونه‌ی قبلی ما به آن rejection گوش نمی‌دهیم، یعنی برای مشاهده‌ی بعدی نگه داشته می‌شود. اگر هیچ‌وقت با `then(..)` یا `catch(..)` آن را observe نکنید، unhandled باقی می‌ماند. بعضی کنسول‌های توسعه‌دهنده‌ی مرورگر ممکن است این rejectionهای unhandled را تشخیص دهند و گزارش کنند، اما این رفتار همیشه تضمین‌شده نیست؛ شما باید همیشه rejectionهای Promise را observe کنید.

**نکته:** این بخش فقط یک مرور کوتاه از تئوری و رفتار Promise بود. برای بررسی عمیق‌تر، فصل ۳ از کتاب *Async & Performance* در همین مجموعه را ببینید.

### Thenableها

Promiseها نمونه‌های واقعی سازنده‌ی `Promise(..)` هستند. با این حال آبجکت‌های Promise-مانندی به نام *thenable* وجود دارند که عموماً می‌توانند با مکانیزم Promise هم‌کار کنند.

هر آبجکت (یا تابعی) که متد `then(..)` داشته باشد، thenable فرض می‌شود. هر جایی که مکانیزم Promise بتواند وضعیت یک Promise واقعی را بپذیرد، معمولاً thenable را هم می‌تواند مدیریت کند.

thenable در اصل یک برچسب عمومی برای هر مقدار Promise-مانند است که ممکن است به‌وسیله‌ی سیستمی غیر از سازنده‌ی واقعی `Promise(..)` ساخته شده باشد. از این زاویه، thenableها عموماً از Promise واقعی کم‌اعتمادتر هستند. برای مثال این thenable بدرفتار را ببینید:

```js
var th = {
	then: function thener( fulfilled ) {
		// call `fulfilled(..)` once every 100ms forever
		setInterval( fulfilled, 100 );
	}
};
```

اگر این thenable را دریافت کنید و با `th.then(..)` chain کنید، احتمالاً تعجب می‌کنید که handler موفقیت شما مدام صدا زده می‌شود؛ درحالی‌که Promise معمولی باید فقط یک بار resolve شود.

در کل، اگر از یک سیستم دیگر چیزی دریافت می‌کنید که ادعا می‌شود Promise یا thenable است، نباید کورکورانه به آن اعتماد کنید. در بخش بعد utilityای را می‌بینیم که همراه Promiseهای ES6 آمده و به این نگرانی اعتماد کمک می‌کند.

اما برای درک بهتر خطر این موضوع، دقت کنید *هر* آبجکتی در *هر* بخشی از کد که متدی به نام `then(..)` داشته باشد، بالقوه می‌تواند با thenable اشتباه گرفته شود -- البته وقتی کنار Promiseها استفاده شود -- حتی اگر اصلاً قصدی برای ارتباط با async به سبک Promise وجود نداشته باشد.

پیش از ES6 هیچ رزرو خاصی برای متد `then(..)` وجود نداشت و همان‌طور که حدس می‌زنید چند مورد بوده که این نام متد قبل از ورود Promiseها انتخاب شده است. محتمل‌ترین مورد thenable اشتباهی، کتابخانه‌های asyncای هستند که `then(..)` دارند اما کاملاً مطابق Promise نیستند -- و از این موارد در دنیای واقعی کم نیست.

مسئولیت این‌که جلوی استفاده‌ی مستقیم از مقادیری را بگیرید که Promise مکانیزم آن‌ها را به‌اشتباه thenable فرض می‌کند، بر عهده‌ی خودتان است.

### API مربوط به `Promise`

API مربوط به `Promise` چند متد ایستای دیگر هم برای کار با Promiseها ارائه می‌دهد.

متد `Promise.resolve(..)` یک Promise می‌سازد که با مقدار ورودی resolve شده است. مقایسه کنید با روش دستی‌تر:

```js
var p1 = Promise.resolve( 42 );

var p2 = new Promise( function pr(resolve){
	resolve( 42 );
} );
```

رفتار `p1` و `p2` عملاً یکسان است. همین موضوع برای resolve کردن با Promise هم برقرار است:

```js
var theP = ajax( .. );

var p1 = Promise.resolve( theP );

var p2 = new Promise( function pr(resolve){
	resolve( theP );
} );
```

**نکته‌ی کاربردی:** `Promise.resolve(..)` راه‌حل مشکل اعتماد به thenable است که در بخش قبل گفتیم. هر مقداری که مطمئن نیستید Promise قابل‌اعتمادی است -- حتی اگر ممکن است مقدار فوری باشد -- را می‌توانید به `Promise.resolve(..)` بدهید تا نرمال شود. اگر مقدار از قبل Promise/thenable قابل‌شناسایی باشد، وضعیت/resolve آن adopt می‌شود و شما از بدرفتاری احتمالی ایزوله می‌شوید. اگر مقدار فوری باشد، داخل Promise واقعی «wrap» می‌شود و رفتارش به async نرمال می‌شود.

`Promise.reject(..)` یک Promise بلافاصله rejected می‌سازد؛ مشابه همتای سازنده‌ی `Promise(..)`:

```js
var p1 = Promise.reject( "Oops" );

var p2 = new Promise( function pr(resolve,reject){
	reject( "Oops" );
} );
```

در حالی‌که `resolve(..)` و `Promise.resolve(..)` می‌توانند Promise بگیرند و وضعیتش را adopt کنند، `reject(..)` و `Promise.reject(..)` برای مقدار ورودی تفاوتی قائل نمی‌شوند. بنابراین اگر با یک Promise یا thenable reject کنید، خود Promise/thenable به‌عنوان reason رد شدن ثبت می‌شود، نه مقدار درونی‌اش.

`Promise.all([ .. ])` آرایه‌ای از یک یا چند مقدار (مثل مقدار فوری، Promise یا thenable) می‌گیرد. خروجی آن Promiseای است که اگر همه‌ی موارد fulfilled شوند، fulfilled می‌شود؛ و به‌محض این‌که اولین مورد rejected شود، فوراً rejected می‌شود.

با این مقادیر/Promiseها شروع می‌کنیم:

```js
var p1 = Promise.resolve( 42 );
var p2 = new Promise( function pr(resolve){
	setTimeout( function(){
		resolve( 43 );
	}, 100 );
} );
var v3 = 44;
var p4 = new Promise( function pr(resolve,reject){
	setTimeout( function(){
		reject( "Oops" );
	}, 10 );
} );
```

حالا ببینیم `Promise.all([ .. ])` با ترکیب‌های مختلف آن‌ها چطور رفتار می‌کند:

```js
Promise.all( [p1,p2,v3] )
.then( function fulfilled(vals){
	console.log( vals );			// [42,43,44]
} );

Promise.all( [p1,p2,v3,p4] )
.then(
	function fulfilled(vals){
		// never gets here
	},
	function rejected(reason){
		console.log( reason );		// Oops
	}
);
```

درحالی‌که `Promise.all([ .. ])` منتظر همه‌ی fulfillmentها (یا اولین rejection) می‌ماند، `Promise.race([ .. ])` فقط منتظر اولین fulfillment یا rejection می‌ماند. مثال:

```js
// NOTE: re-setup all test values to
// avoid timing issues misleading you!

Promise.race( [p2,p1,v3] )
.then( function fulfilled(val){
	console.log( val );				// 42
} );

Promise.race( [p2,p4] )
.then(
	function fulfilled(val){
		// never gets here
	},
	function rejected(reason){
		console.log( reason );		// Oops
	}
);
```

**هشدار:** درحالی‌که `Promise.all([])` فوری fulfilled می‌شود (بدون مقدار)، `Promise.race([])` برای همیشه معلق می‌ماند. این ناسازگاری عجیبی است و نشان می‌دهد بهتر است هیچ‌وقت این متدها را با آرایه‌ی خالی استفاده نکنید.
