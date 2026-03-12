# جریان زنجیره‌ای (Chain Flow)

چند بار تا الان اشاره کردیم: Promise فقط برای الگوی تک‌گامیِ «این، بعد آن» نیست. آن فقط بلوک سازنده است. در عمل می‌توان چند Promise را به هم زنجیر کرد تا توالی‌ای از گام‌های async بسازیم.

کلید کار روی دو رفتار ذاتی Promise بنا شده:

* هر بار `then(..)` را روی Promise صدا می‌زنید، یک Promise جدید ساخته و برمی‌گرداند که می‌توانیم با آن *chain* کنیم.
* هر مقداری که از fulfillment callback مربوط به `then(..)` برگردانید، خودکار fulfillment مربوط به Promise *زنجیرشده* می‌شود.

اول ببینیم دقیقاً یعنی چه، بعد برسیم به اینکه چطور با آن توالی async می‌سازیم:

```js
var p = Promise.resolve( 21 );

var p2 = p.then( function(v){
	console.log( v );	// 21

	// fulfill `p2` with value `42`
	return v * 2;
} );

// chain off `p2`
p2.then( function(v){
	console.log( v );	// 42
} );
```

با `return v * 2` (یعنی `42`) درواقع Promiseای (`p2`) که `then(..)` اول ساخته بود fulfill می‌شود. وقتی `p2.then(..)` اجرا می‌شود، همان fulfillmentِ `return v * 2` را می‌گیرد. و البته `p2.then(..)` خودش Promise بعدی می‌سازد که می‌شد در `p3` نگه داشت.

اما داشتن متغیرهای میانی (`p2`, `p3`) کمی آزاردهنده است. خوشبختانه راحت می‌شود chain نوشت:

```js
var p = Promise.resolve( 21 );

p
.then( function(v){
	console.log( v );	// 21

	// fulfill the chained promise with value `42`
	return v * 2;
} )
// here's the chained promise
.then( function(v){
	console.log( v );	// 42
} );
```

حالا `then(..)` اول گام اول توالی async است و `then(..)` دوم گام دوم. این می‌تواند هرچقدر لازم باشد ادامه پیدا کند؛ هر بار از Promise خودکار ساخته‌شده توسط `then(..)` قبلی chain می‌کنید.

اما یک چیزی کم است: اگر بخواهیم گام ۲ منتظر کار async گام ۱ بماند چه؟ اینجا `return` فوری داریم که Promise زنجیره‌ای را همان لحظه fulfill می‌کند.

کلید async واقعی در هر گام این است که یادتان باشد `Promise.resolve(..)` وقتی ورودی‌اش Promise/thenable باشد چطور کار می‌کند: Promise واقعی را مستقیم برمی‌گرداند، یا thenable را unwrap می‌کند، و تا وقتی thenable باقی بماند بازگشتی unwrap ادامه پیدا می‌کند.

همین unwrapping وقتی اتفاق می‌افتد که از fulfillment/rejection handler یک Promise یا thenable `return` کنید:

```js
var p = Promise.resolve( 21 );

p.then( function(v){
	console.log( v );	// 21

	// create a promise and return it
	return new Promise( function(resolve,reject){
		// fulfill with value `42`
		resolve( v * 2 );
	} );
} )
.then( function(v){
	console.log( v );	// 42
} );
```

با اینکه `42` را داخل Promise پیچیدیم و برگرداندیم، باز unwrap شد و resolution مربوط به Promise زنجیره‌ای شد؛ پس `then(..)` دوم همچنان `42` گرفت. اگر در Promise برگردانده‌شده async هم بگذاریم، باز درست کار می‌کند:

```js
var p = Promise.resolve( 21 );

p.then( function(v){
	console.log( v );	// 21

	// create a promise to return
	return new Promise( function(resolve,reject){
		// introduce asynchrony!
		setTimeout( function(){
			// fulfill with value `42`
			resolve( v * 2 );
		}, 100 );
	} );
} )
.then( function(v){
	// runs after the 100ms delay in the previous step
	console.log( v );	// 42
} );
```

این فوق‌العاده قدرتمند است! حالا می‌توانیم هر تعداد گام async بسازیم و هر گام در صورت نیاز گام بعدی را delay کند (یا نکند).

البته پاس‌دادن مقدار از گامی به گام بعد اختیاری است. اگر صریحاً مقداری `return` نکنید، مقدار ضمنی `undefined` فرض می‌شود و chain همان‌طور می‌ماند. در این حالت resolution هر Promise صرفاً سیگنال رفتن به گام بعد است.

برای نمایش بیشتر chain، یک utility عمومی delay-Promise می‌سازیم (بدون پیام resolution) که در چند گام reuse شود:

```js
function delay(time) {
	return new Promise( function(resolve,reject){
		setTimeout( resolve, time );
	} );
}

delay( 100 ) // step 1
.then( function STEP2(){
	console.log( "step 2 (after 100ms)" );
	return delay( 200 );
} )
.then( function STEP3(){
	console.log( "step 3 (after another 200ms)" );
} )
.then( function STEP4(){
	console.log( "step 4 (next Job)" );
	return delay( 50 );
} )
.then( function STEP5(){
	console.log( "step 5 (after another 50ms)" );
} )
...
```

فراخوانی `delay(200)` Promiseای می‌سازد که بعد از ۲۰۰ms fulfill می‌شود. وقتی آن را از fulfillment callback مربوط به `then(..)` اول برمی‌گردانیم، Promise مربوط به `then(..)` دوم منتظر آن Promise ۲۰۰msی می‌ماند.

**نکته:** از نظر فنی اینجا دو Promise در جریان‌اند: Promiseِ delay 200ms و Promise زنجیره‌ای که `then(..)` دوم از آن chain می‌کند. اما برای ذهن شاید راحت‌تر باشد این دو را یکی ببینید، چون مکانیزم Promise state آن‌ها را برایتان merge می‌کند. از این زاویه `return delay(200)` انگار Promise قبلی را جایگزین می‌کند.

با این حال، زنجیره‌ی delay بدون انتقال پیام مثال خیلی کاربردی‌ای از flow-control نیست. مثال عملی‌تر: Ajax.

```js
// assume an `ajax( {url}, {callback} )` utility

// Promise-aware ajax
function request(url) {
	return new Promise( function(resolve,reject){
		// the `ajax(..)` callback should be our
		// promise's `resolve(..)` function
		ajax( url, resolve );
	} );
}
```

اول utilityای به نام `request(..)` تعریف می‌کنیم که Promise completion مربوط به `ajax(..)` را می‌سازد:

```js
request( "http://some.url.1/" )
.then( function(response1){
	return request( "http://some.url.2/?v=" + response1 );
} )
.then( function(response2){
	console.log( response2 );
} );
```

**نکته:** توسعه‌دهنده‌ها زیاد با این حالت روبه‌رو می‌شوند که می‌خواهند flow-control Promise-based داشته باشند اما utility پایه خودش Promise-aware نیست (مثل `ajax(..)` که callback می‌خواهد). ES6 Promise به‌تنهایی این pattern را خودکار حل نمی‌کند، ولی تقریباً همه‌ی کتابخانه‌های Promise این قابلیت را دارند (promisify/lift). جلوتر برمی‌گردیم.

با `request(..)` Promise-برگردان، گام اول chain را با URL اول می‌سازیم و روی Promise برگشتی، `then(..)` اول را chain می‌کنیم.

وقتی `response1` رسید، با آن URL دوم می‌سازیم و `request(..)` دوم را می‌زنیم. Promise مربوط به `request(..)` دوم را `return` می‌کنیم تا گام سوم flow تا completion آن Ajax صبر کند. در آخر `response2` را چاپ می‌کنیم.

Chain Promiseای که می‌سازیم فقط flow-control چندگامی نیست، بلکه کانال پیام هم هست که پیام را گام‌به‌گام منتقل می‌کند.

اگر در یکی از گام‌های chain خطا رخ دهد چه؟ error/exception در Promise per-Promise است؛ یعنی می‌شود در هر نقطه گرفتش و chain را از همان‌جا نوعی «reset» کرد تا به حالت عادی برگردد:

```js
// step 1:
request( "http://some.url.1/" )

// step 2:
.then( function(response1){
	foo.bar(); // undefined, error!

	// never gets here
	return request( "http://some.url.2/?v=" + response1 );
} )

// step 3:
.then(
	function fulfilled(response2){
		// never gets here
	},
	// rejection handler to catch the error
	function rejected(err){
		console.log( err );	// `TypeError` from `foo.bar()` error
		return 42;
	}
)

// step 4:
.then( function(msg){
	console.log( msg );		// 42
} );
```

وقتی خطا در گام ۲ رخ می‌دهد، rejection handler در گام ۳ آن را می‌گیرد. مقدار برگشتی rejection handler (`42` اینجا)، Promise گام بعد (۴) را fulfill می‌کند؛ پس chain دوباره در حالت fulfillment است.

**نکته:** همان‌طور که گفتیم، اگر از fulfillment handler Promise برگردانید، unwrap می‌شود و می‌تواند گام بعد را delay کند. همین درباره‌ی rejection handler هم صادق است: اگر به‌جای `return 42` Promise برگردانده شود، گام ۴ می‌تواند منتظر بماند. همچنین اگر داخل fulfillment یا rejection handler استثنا throw شود، Promise زنجیره‌ای بعدی فوراً با همان exception rejected می‌شود.

اگر `then(..)` را روی Promise صدا بزنید و فقط fulfillment handler بدهید، یک rejection handler پیش‌فرض جایگزین می‌شود:

```js
var p = new Promise( function(resolve,reject){
	reject( "Oops" );
} );

var p2 = p.then(
	function fulfilled(){
		// never gets here
	}
	// assumed rejection handler, if omitted or
	// any other non-function value passed
	// function(err) {
	//     throw err;
	// }
);
```

همان‌طور که می‌بینید rejection handler پیش‌فرض صرفاً خطا را دوباره throw می‌کند و باعث می‌شود `p2` (Promise زنجیره‌ای) با همان دلیل rejected شود. یعنی خطا در chain propagate می‌شود تا جایی که rejection handler صریح تعریف شود.

**نکته:** جزئیات error handling Promise بیشتر است و جلوتر دقیق‌تر می‌بینیم.

اگر fulfillment handler معتبر به `then(..)` ندهید هم handler پیش‌فرض جایگزین می‌شود:

```js
var p = Promise.resolve( 42 );

p.then(
	// assumed fulfillment handler, if omitted or
	// any other non-function value passed
	// function(v) {
	//     return v;
	// }
	null,
	function rejected(err){
		// never gets here
	}
);
```

handler پیش‌فرض fulfillment همان مقداری را که می‌گیرد به گام (Promise) بعدی پاس می‌دهد.

**نکته:** الگوی `then(null,function(err){ .. })` -- یعنی فقط مدیریت rejection و عبور fulfillment -- در API shortcut دارد: `catch(function(err){ .. })`. در بخش بعد مفصل‌تر.

بیایید رفتارهای ذاتی Promise که chain flow-control را ممکن می‌کنند خلاصه کنیم:

* صدا زدن `then(..)` روی یک Promise، خودکار Promise جدیدی برای return می‌سازد.
* داخل fulfillment/rejection handler، اگر مقدار برگردانید یا exception throw شود، Promise جدید زنجیره‌ای مطابق آن resolve/reject می‌شود.
* اگر fulfillment/rejection handler یک Promise برگرداند، unwrap می‌شود و resolution آن Promise، resolution Promise زنجیره‌ایِ برگشتی از `then(..)` جاری می‌شود.

هرچند chain flow-control خیلی مفید است، دقیق‌تر این است که آن را اثر جانبیِ compose شدن Promiseها بدانیم، نه هدف اصلی. همان‌طور که بارها گفتیم، Promise ناهمگامی را normalize می‌کند و state زمان‌وابسته‌ی مقدار را encapsulate می‌کند؛ *همین* است که chain مفید را ممکن می‌سازد.

بیان ترتیبی chain (این، بعد این، بعد این...) قطعاً نسبت به شلوغی callbackها (فصل ۲) خیلی بهتر است. اما هنوز boilerplate قابل‌توجهی (`then(..)` و `function(){ .. }`) دارد. فصل بعد با generatorها الگوی بسیار خواناتری برای بیان flow-control ترتیبی می‌بینیم.

### اصطلاحات: Resolve، Fulfill و Reject

قبل از ورود عمیق‌تر به Promise لازم است یک ابهام اصطلاحی درباره‌ی "resolve" و "fulfill" و "reject" را روشن کنیم. اول سازنده‌ی `Promise(..)`:

```js
var p = new Promise( function(X,Y){
	// X() for fulfillment
	// Y() for rejection
} );
```

دو callback داریم (`X` و `Y`). اولی *معمولاً* برای fulfill استفاده می‌شود و دومی *همیشه* Promise را reject می‌کند. این «معمولاً» یعنی چه و روی نام‌گذاری چه اثری دارد؟

در نهایت نام identifier را موتور تفسیر معنایی نمی‌کند، پس فنی مهم نیست؛ `foo(..)` و `bar(..)` هم کار می‌کنند. اما واژه‌ها روی تفکر شما و تیم اثر می‌گذارند. فکر اشتباه درباره‌ی کد async دقیقاً همان جایی است که از callback spaghetti هم بدتر می‌شود.

پس نام‌گذاری واقعاً مهم است.

پارامتر دوم ساده است: تقریباً همه‌ی منابع آن را `reject(..)` می‌نامند و چون دقیقاً همین کار را می‌کند، انتخاب بسیار خوبی است. توصیه‌ی جدی: همیشه `reject(..)`.

اما پارامتر اول مبهم‌تر است؛ در ادبیات Promise معمولاً `resolve(..)` نام‌گذاری می‌شود. این واژه طبیعتاً به "resolution" مربوط است که در ادبیات (از جمله همین کتاب) برای تعیین وضعیت/مقدار نهایی Promise (چه fulfill چه reject) استفاده می‌شود.

اما اگر این پارامتر ظاهراً مخصوص fulfill است، چرا `fulfill(..)` نگوییم؟ برای پاسخ، دو متد API را ببینید:

```js
var fulfilledPr = Promise.resolve( 42 );

var rejectedPr = Promise.reject( "Oops" );
```

`Promise.resolve(..)` Promiseای می‌سازد که به مقدار داده‌شده resolved باشد. اینجا `42` مقدار فوری non-Promise/non-thenable است، پس `fulfilledPr` fulfill می‌شود. `Promise.reject("Oops")` هم Promise rejected با reason `"Oops"` می‌سازد.

حالا ببینیم چرا واژه‌ی "resolve" (مثل `Promise.resolve(..)`) دقیق و بی‌ابهام است، وقتی context می‌تواند به fulfillment *یا* rejection برسد:

```js
var rejectedTh = {
	then: function(resolved,rejected) {
		rejected( "Oops" );
	}
};

var rejectedPr = Promise.resolve( rejectedTh );
```

همان‌طور که گفتیم `Promise.resolve(..)` Promise واقعی را مستقیم برمی‌گرداند یا thenable را unwrap می‌کند. اگر unwrap thenable به وضعیت rejected برسد، Promise برگشتی `Promise.resolve(..)` هم همان وضعیت rejected را می‌گیرد.

پس `Promise.resolve(..)` برای متد API نام دقیق و درستی است، چون نتیجه‌اش می‌تواند fulfillment یا rejection باشد.

پارامتر اول callback در سازنده‌ی `Promise(..)` هم همین رفتار unwrap را برای thenable یا Promise واقعی دارد:

```js
var rejectedPr = new Promise( function(resolve,reject){
	// resolve this promise with a rejected promise
	resolve( Promise.reject( "Oops" ) );
} );

rejectedPr.then(
	function fulfilled(){
		// never gets here
	},
	function rejected(err){
		console.log( err );	// "Oops"
	}
);
```

حالا باید روشن باشد که نام درست برای پارامتر اول سازنده‌ی `Promise(..)` همان `resolve(..)` است.

**هشدار:** `reject(..)` برخلاف `resolve(..)` unwrap انجام نمی‌دهد. اگر Promise/thenable را به `reject(..)` بدهید، همان مقدار دست‌نخورده rejection reason می‌شود. rejection handler بعدی خود Promise/thenable را می‌گیرد، نه مقدار درونی‌اش.

حالا برویم سراغ callbackهایی که به `then(..)` می‌دهیم. چه نامی مناسب‌تر است؟ پیشنهاد من: `fulfilled(..)` و `rejected(..)`:

```js
function fulfilled(msg) {
	console.log( msg );
}

function rejected(err) {
	console.error( err );
}

p.then(
	fulfilled,
	rejected
);
```

در پارامتر اول `then(..)` حالت همیشه fulfillment است، پس دوگانگی "resolve" لازم نیست. ضمن اینکه specification ES6 هم از برچسب‌های `onFulfilled(..)` و `onRejected(..)` استفاده می‌کند که دقیق‌اند.
