# اعتماد در Promise

تا اینجا دو تشبیه قوی دیدیم که جنبه‌های مختلف Promise را برای کد async توضیح می‌داد. اما اگر همین‌جا بایستیم، شاید مهم‌ترین ویژگی Promise را از دست داده‌ایم: **اعتماد**.

تشبیه *future value* و *completion event* مستقیم در الگوهای کدی که دیدیم ظاهر می‌شوند، اما اینکه Promise دقیقاً چطور مشکلات اعتماد ناشی از *inversion of control* (فصل ۲، بخش «Trust Issues») را حل می‌کند، فوراً واضح نیست. با کمی کندوکاو می‌توانیم تضمین‌های مهمی پیدا کنیم که اعتماد از دست‌رفته در کد async را برمی‌گردانند.

بیایید مشکلات اعتماد در callback-only را مرور کنیم. وقتی callback را به utilityای مثل `foo(..)` می‌دهید، ممکن است:

* callback را خیلی زود صدا بزند
* callback را خیلی دیر صدا بزند (یا اصلاً نزند)
* callback را کمتر یا بیشتر از انتظار صدا بزند
* محیط/پارامترهای لازم را پاس ندهد
* خطا/استثنا را swallow کند

ویژگی‌های Promise عمداً طوری طراحی شده‌اند که برای تمام این نگرانی‌ها پاسخ‌های مفید و تکرارپذیر بدهند.

### صدا زدن خیلی زود

این نگرانی اساساً همان Zalgo است (فصل ۲): گاهی sync، گاهی async، و در نتیجه race condition.

Promise طبق تعریف به این مشکل دچار نمی‌شود؛ چون حتی Promiseای که فوری fulfill شود (مثل `new Promise(function(resolve){ resolve(42); })`) هم *synchronously قابل مشاهده نیست*.

یعنی وقتی `then(..)` را روی Promise صدا می‌زنید، حتی اگر Promise از قبل resolved باشد، callbackی که به `then(..)` می‌دهید **همیشه** async صدا زده می‌شود (برای جزئیات، فصل ۱ بخش Jobs).

دیگر لازم نیست هک `setTimeout(..,0)` را دستی بزنید. Promise به‌طور خودکار جلوی Zalgo را می‌گیرد.

### صدا زدن خیلی دیر

شبیه مورد قبل، callbackهای مشاهده‌ی ثبت‌شده با `then(..)` وقتی `resolve(..)` یا `reject(..)` فراخوانی شوند به‌طور خودکار schedule می‌شوند. این callbackها قابل پیش‌بینی در اولین فرصت async بعدی fire می‌شوند.

چون مشاهده‌ی sync ممکن نیست، پس یک زنجیره‌ی sync نمی‌تواند callback دیگری را «به‌ظاهر» به تاخیر غیرمنتظره بیندازد. وقتی Promise resolved می‌شود، همه‌ی callbackهای `then(..)` ثبت‌شده روی آن به‌ترتیب و در اولین فرصت async اجرا می‌شوند، و چیزی که داخل یکی رخ می‌دهد نمی‌تواند اجرای بقیه را عقب بیندازد.

مثال:

```js
p.then( function(){
	p.then( function(){
		console.log( "C" );
	} );
	console.log( "A" );
} );
p.then( function(){
	console.log( "B" );
} );
// A B C
```

اینجا `"C"` نمی‌تواند قبل از `"B"` بیاید؛ به‌خاطر تعریف رفتاری Promise.

#### ظرافت‌های زمان‌بندی Promise

با این حال، باید دقت کرد که در زمان‌بندی بین callbackهای chain شده از دو Promise جداگانه همیشه نظم نسبی ۱۰۰٪ قابل پیش‌بینی نیست.

اگر دو Promise (`p1` و `p2`) هر دو از قبل resolved باشند، معمولاً انتظار داریم `p1.then(..); p2.then(..)` یعنی callbackهای `p1` قبل از `p2` اجرا شوند. اما موارد ظریفی هست که خلاف این را می‌بینید:

```js
var p3 = new Promise( function(resolve,reject){
	resolve( "B" );
} );

var p1 = new Promise( function(resolve,reject){
	resolve( p3 );
} );

var p2 = new Promise( function(resolve,reject){
	resolve( "A" );
} );

p1.then( function(v){
	console.log( v );
} );

p2.then( function(v){
	console.log( v );
} );

// A B  <-- not  B A  as you might expect
```

`p1` با مقدار فوری resolve نشده، بلکه با Promise دیگری (`p3`) resolve شده که خودش `"B"` دارد. رفتار مشخص‌شده این است که `p3` به‌شکل async در `p1` unwrap شود، و به همین خاطر callbackهای `p1` پشت callbackهای `p2` در Job queue قرار می‌گیرند.

برای دوری از این کابوس‌های ظریف، بهتر است هرگز روی ordering بین callbackهای Promiseهای مختلف تکیه نکنید. حتی بهتر: کدی ننویسید که ordering چند callback برای درست‌بودنش مهم باشد.

### هرگز callback را صدا نزدن

این نگرانی بسیار رایج است. Promise چند راه‌حل می‌دهد.

اول: هیچ‌چیز (حتی JS error) نمی‌تواند مانع شود Promise اگر resolved شد، شما را از resolution باخبر کند. اگر callbackهای fulfillment و rejection را هر دو ثبت کنید و Promise resolved شود، حتماً یکی از این دو callback صدا می‌خورد.

البته اگر خود callbackهای شما JS error بدهند ممکن است نتیجه‌ی مورد انتظار را نبینید، اما callback واقعاً اجرا شده است. جلوتر می‌بینیم چطور از خطای callback هم مطلع شویم؛ این هم swallowed نمی‌شود.

اما اگر خود Promise هیچ‌وقت resolve/reject نشد چه؟ برای این هم Promise abstraction سطح‌بالاتری به نام race دارد:

```js
// a utility for timing out a Promise
function timeoutPromise(delay) {
	return new Promise( function(resolve,reject){
		setTimeout( function(){
			reject( "Timeout!" );
		}, delay );
	} );
}

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

جزئیات بیشتری در این الگو هست که جلوتر برمی‌گردیم.

نکته‌ی مهم: می‌توانیم حتماً از outcome مربوط به `foo()` سیگنال بگیریم تا برنامه بی‌نهایت معطل نماند.

### صدا زدن کمتر یا بیشتر از حد

طبق تعریف، تعداد درست فراخوانی callback برابر *یک* است. حالت «کمتر» یعنی صفر بار، که همان «هرگز» بود.

حالت «بیشتر» ساده است: Promise طبق تعریف فقط یک‌بار می‌تواند resolve شود. اگر به هر دلیلی کد سازنده‌ی Promise چند بار `resolve(..)` یا `reject(..)` را صدا بزند، یا هر دو را بزند، Promise فقط اولین resolution را می‌پذیرد و بقیه را بی‌صدا نادیده می‌گیرد.

چون Promise فقط یک‌بار resolve می‌شود، callbackهای ثبت‌شده با `then(..)` هم هرکدام فقط یک‌بار صدا زده می‌شوند.

البته اگر خودتان یک callback را چند بار ثبت کنید (مثل `p.then(f); p.then(f);`) به همان تعداد صدا می‌خورد. تضمین «هر registration یک بار» مانع اشتباه خودتان نمی‌شود.

### پاس ندادن پارامتر/محیط لازم

Promise نهایتاً یک مقدار resolution دارد (fulfillment یا rejection).

اگر صریحاً هیچ مقداری به `resolve(..)` یا `reject(..)` ندهید، مقدار `undefined` می‌شود (رفتار معمول JS). اما هرچه باشد، همیشه به callbackهای ثبت‌شده‌ی مناسب (fulfillment/rejection) پاس داده می‌شود، now یا later.

نکته: اگر `resolve(..)` یا `reject(..)` را با چند پارامتر صدا بزنید، همه‌ی پارامترهای بعد از اولی بی‌صدا نادیده گرفته می‌شوند. شاید به نظر نقض تضمین قبلی باشد، اما دقیقاً نیست، چون این استفاده‌ی نامعتبر از مکانیزم Promise است. دیگر misuseها (مثل چندبار `resolve(..)`) هم همین‌طور «محافظت‌شده»‌اند، پس رفتار Promise در این زمینه سازگار است.

اگر چند مقدار می‌خواهید پاس دهید، باید در یک مقدار واحد مثل `array` یا `object` بسته‌بندی‌شان کنید.

درباره‌ی محیط (environment): تابع در JS closure مربوط به scope تعریفش را حفظ می‌کند (کتاب *Scope & Closures*)، پس به state اطراف دسترسی خواهد داشت. این ویژگی در callback-only هم هست، پس مزیت اختصاصی Promise نیست، اما تضمینی قابل اتکاست.

### بلعیدن خطا/استثنا

در سطح پایه، این بازنویسی نکته‌ی قبلی است: اگر Promise را با *reason* (پیام خطا) reject کنید، همان مقدار به callback(های) rejection می‌رسد.

اما موضوع بزرگ‌تری هم هست: اگر در هر نقطه از ساخت Promise یا مشاهده‌ی resolution آن، JS exception رخ دهد (مثل `TypeError` یا `ReferenceError`)، آن exception گرفته می‌شود و Promise مربوطه rejected می‌شود.

مثال:

```js
var p = new Promise( function(resolve,reject){
	foo.bar();	// `foo` is not defined, so error!
	resolve( 42 );	// never gets here :(
} );

p.then(
	function fulfilled(){
		// never gets here :(
	},
	function rejected(err){
		// `err` will be a `TypeError` exception object
		// from the `foo.bar()` line.
	}
);
```

exception ناشی از `foo.bar()` به rejection Promise تبدیل می‌شود و می‌توانید مدیریتش کنید.

این نکته مهم است چون یک لحظه‌ی Zalgo بالقوه را هم حل می‌کند: اینکه errorها sync واکنش بدهند ولی non-errorها async. Promise حتی JS exception را هم async می‌کند و احتمال race condition را کم می‌کند.

اما اگر Promise fulfill شده باشد و هنگام observe در callback `then(..)` استثنا رخ دهد چه؟ این‌ها هم گم نمی‌شوند، هرچند شاید رفتارش در نگاه اول عجیب باشد:

```js
var p = new Promise( function(resolve,reject){
	resolve( 42 );
} );

p.then(
	function fulfilled(msg){
		foo.bar();
		console.log( msg );	// never gets here :(
	},
	function rejected(err){
		// never gets here either :(
	}
);
```

انگار exception `foo.bar()` swallow شده؟ نه. مسئله این است که ما به جای درستش گوش نداده‌ایم. خود `p.then(..)` Promise دیگری برمی‌گرداند، و *همان* Promise جدید با `TypeError` rejected می‌شود.

چرا همان handler خطای تعریف‌شده را صدا نمی‌زند؟ در نگاه اول منطقی به نظر می‌رسد. اما این کار اصل بنیادی Promise یعنی **immutability پس از resolve** را نقض می‌کند. `p` قبلاً با مقدار `42` fulfill شده، پس نمی‌شود بعداً فقط به‌خاطر خطای observe شدنش به rejection تغییر کند.

جدا از نقض اصل، این رفتار می‌تواند خرابکاری کند؛ مثلاً اگر چند callback `then(..)` روی `p` ثبت شده باشد، بعضی صدا زده شوند بعضی نه، و دلیلش مبهم شود.

### آیا Promise واقعاً قابل اعتماد است؟

یک جزئیات نهایی برای تکمیل اعتماد در الگوی Promise باقی مانده.

حتماً دیده‌اید Promise callback را حذف نمی‌کند؛ فقط محل پاس‌دادنش را عوض می‌کند. به‌جای پاس callback به `foo(..)`, *چیزی* (ظاهراً Promise واقعی) از `foo(..)` می‌گیریم و callback را به آن *چیز* پاس می‌دهیم.

اما چرا این قابل اعتمادتر از callback خام است؟ از کجا مطمئن شویم آن *چیز* واقعاً Promise قابل اعتماد است؟ نکند کل ماجرا خانه‌ی پوشالی باشد: چون قبلاً اعتماد کردیم، حالا هم اعتماد می‌کنیم؟

یکی از مهم‌ترین و در عین حال کم‌توجه‌شده‌ترین جزئیات Promise این است که برای این هم پاسخ دارد. در ES6 تابع `Promise.resolve(..)` داریم.

اگر یک مقدار فوری (non-Promise/non-thenable) به `Promise.resolve(..)` بدهید، Promiseای می‌گیرید که با همان مقدار fulfill شده است. یعنی `p1` و `p2` زیر تقریباً یکسان رفتار می‌کنند:

```js
var p1 = new Promise( function(resolve,reject){
	resolve( 42 );
} );

var p2 = Promise.resolve( 42 );
```

اما اگر Promise واقعی بدهید، همان Promise را برمی‌گرداند:

```js
var p1 = Promise.resolve( 42 );

var p2 = Promise.resolve( p1 );

p1 === p2; // true
```

مهم‌تر اینکه اگر thenable غیر-Promise بدهید، `Promise.resolve(..)` تلاش می‌کند unwrapش کند و این unwrap تا رسیدن به مقدار نهایی non-Promise-like ادامه پیدا می‌کند.

بحث thenable یادتان هست؟

```js
var p = {
	then: function(cb) {
		cb( 42 );
	}
};

// this works OK, but only by good fortune
p
.then(
	function fulfilled(val){
		console.log( val ); // 42
	},
	function rejected(err){
		// never gets here
	}
);
```

این `p` thenable هست، ولی Promise واقعی نیست. خوش‌شانسیم که رفتارش معقول است. اما اگر این باشد:

```js
var p = {
	then: function(cb,errcb) {
		cb( 42 );
		errcb( "evil laugh" );
	}
};

p
.then(
	function fulfilled(val){
		console.log( val ); // 42
	},
	function rejected(err){
		// oops, shouldn't have run
		console.log( err ); // evil laugh
	}
);
```

این هم thenable است، اما Promise خوش‌رفتاری نیست. بدخواهانه است؟ یا فقط Promise را بد فهمیده؟ مهم نیست. در هر حالت، قابل اعتماد نیست.

با این حال هر دو نسخه‌ی `p` را اگر به `Promise.resolve(..)` بدهیم، خروجی normalize و امن می‌گیریم:

```js
Promise.resolve( p )
.then(
	function fulfilled(val){
		console.log( val ); // 42
	},
	function rejected(err){
		// never gets here
	}
);
```

`Promise.resolve(..)` هر thenableای را می‌پذیرد و به مقدار non-thenable unwrap می‌کند. اما در خروجی یک Promise واقعی و قابل اعتماد می‌گیرید. اگر ورودی از قبل Promise واقعی باشد همان را می‌گیرید، پس عبور دادن از `Promise.resolve(..)` برای کسب اعتماد هیچ downsideی ندارد.

پس اگر `foo(..)` می‌زنید و مطمئن نیستید خروجی‌اش Promise خوش‌رفتار است یا نه، ولی می‌دانید حداقل thenable هست، `Promise.resolve(..)` یک wrapper قابل اعتماد می‌دهد:

```js
// don't just do this:
foo( 42 )
.then( function(v){
	console.log( v );
} );

// instead, do this:
Promise.resolve( foo( 42 ) )
.then( function(v){
	console.log( v );
} );
```

**نکته:** یک مزیت جانبی مهمِ wrap کردن خروجی هر تابع با `Promise.resolve(..)` (چه thenable چه نه) این است که call را به یک task async خوش‌رفتار normalize می‌کند. اگر `foo(42)` گاهی مقدار فوری بدهد و گاهی Promise، با `Promise.resolve( foo(42) )` همیشه خروجی Promise می‌شود. و دوری از Zalgo یعنی کد بسیار بهتر.

### اعتماد ساخته شد

امیدوارم بحث قبلی حالا در ذهن‌تان «resolve» کرده باشد که چرا Promise قابل اعتماد است، و مهم‌تر اینکه چرا این اعتماد برای ساخت نرم‌افزار robust و قابل نگهداری حیاتی است.

می‌شود بدون اعتماد در JS کد async نوشت؟ بله. توسعه‌دهنده‌های JS نزدیک به دو دهه همین کار را با callback انجام داده‌اند.

اما وقتی شروع می‌کنید پرسیدن اینکه آیا مکانیزم‌های زیربنایی واقعاً قابل پیش‌بینی و قابل اتکا هستند یا نه، تازه می‌بینید callback از نظر اعتماد، پیِ خیلی لرزانی دارد.

Promise الگویی است که callback را با semantics قابل اعتماد تقویت می‌کند؛ تا رفتار قابل‌استدلال‌تر و قابل‌اتکاتر شود. با uninvert کردن *inversion of control* callbackها، کنترل را به یک سیستم قابل اعتماد (Promise) می‌سپاریم که دقیقاً برای بازگرداندن عقلانیت به async طراحی شده است.
