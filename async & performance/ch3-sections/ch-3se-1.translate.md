# Promise چیست؟

وقتی توسعه‌دهنده‌ها می‌خواهند تکنولوژی یا الگوی جدیدی یاد بگیرند، معمولاً اولین واکنش این است: «کدش رو نشون بده!». طبیعی است که مستقیم بپریم وسط کار و حین انجام یاد بگیریم.

اما بعضی abstractionها فقط با API فهمیده نمی‌شوند. Promise یکی از همان‌هاست؛ از شیوه‌ی استفاده‌ی افراد از Promise خیلی زود می‌شود فهمید واقعاً فلسفه‌اش را می‌دانند یا فقط syntax API را حفظ کرده‌اند.

پس قبل از نشان‌دادن کد Promise، می‌خواهم دقیق روشن کنم Promise از نظر مفهومی چیست. امیدوارم این دیدگاه وقتی می‌خواهید نظریه‌ی Promise را وارد flow async خودتان کنید، راهنمای بهتری باشد.

با این ذهنیت، دو تشبیه متفاوت برای Promise را ببینیم.

### مقدار آینده (Future Value)

این سناریو را تصور کنید: می‌روید پشت کانتر فست‌فود و یک چیزبرگر سفارش می‌دهید. به صندوقدار ۱.۴۷ دلار می‌دهید. با ثبت سفارش و پرداخت، در واقع برای دریافت یک *مقدار* (چیزبرگر) درخواست داده‌اید؛ یعنی یک تراکنش شروع کرده‌اید.

اما اغلب چیزبرگر همان لحظه آماده نیست. صندوقدار به‌جای چیزبرگر، یک رسید با شماره سفارش می‌دهد. این شماره سفارش یک IOU یا همان *promise* است که تضمین می‌کند در نهایت باید چیزبرگر را بگیرید.

پس رسید و شماره سفارش را نگه می‌دارید. می‌دانید این نماینده‌ی *چیزبرگر آینده‌ی* شماست، پس فعلاً دیگر لازم نیست نگرانش باشید -- جز گرسنگی!

تا وقتی منتظرید می‌توانید کارهای دیگر بکنید، مثلاً به دوستتان پیام بدهید: «میای ناهار؟ من دارم چیزبرگر می‌خورم.»

شما همین الان درباره‌ی *چیزبرگر آینده* استدلال می‌کنید، با اینکه هنوز دستتان نیست. مغزتان این کار را می‌کند چون شماره سفارش را به‌عنوان placeholder چیزبرگر در نظر می‌گیرد. این placeholder مقدار را عملاً *مستقل از زمان* می‌کند. این همان **future value** است.

در نهایت صدای «سفارش ۱۱۳!» را می‌شنوید و با خوشحالی می‌روید جلو. رسید را می‌دهید و چیزبرگر را می‌گیرید.

یعنی وقتی *future value* آماده شد، promiseِ مقدار را با خود مقدار عوض کردید.

اما یک خروجی دیگر هم ممکن است: شماره سفارشتان را صدا می‌کنند، ولی صندوقدار می‌گوید: «متاسفیم، چیزبرگر تمام شده.» فعلاً از ناراحتی مشتری بگذریم؛ یک ویژگی مهم future value را می‌بینیم: می‌تواند موفق یا ناموفق باشد.

هر بار چیزبرگر سفارش می‌دهید می‌دانید نهایتاً یا چیزبرگر می‌گیرید، یا خبر بد کمبود چیزبرگر و باید فکر دیگری برای ناهار کنید.

**نکته:** در کد، اوضاع کمی پیچیده‌تر است؛ چون ممکن است استعاره‌ای شماره سفارش هیچ‌وقت صدا زده نشود و در حالت unresolved بمانیم. بعداً به این حالت برمی‌گردیم.

#### مقدارهای اکنون و بعدتر

ممکن است این حرف‌ها هنوز بیش‌ازحد انتزاعی به نظر برسد. بیایید ملموس‌ترش کنیم.

اما قبل از معرفی Promise، از کدی که از قبل می‌شناسیم -- callback -- شروع می‌کنیم تا ببینیم *future value* را چطور مدیریت می‌کنیم.

وقتی درباره‌ی یک مقدار کد می‌نویسید (مثلاً عملیات ریاضی روی `number`) چه بدانید چه ندانید یک فرض بنیادی دارید: مقدار همین *الان* concrete و آماده است:

```js
var x, y = 2;

console.log( x + y ); // NaN  <-- because `x` isn't set yet
```

عملیات `x + y` فرض می‌کند `x` و `y` از قبل set شده‌اند. با اصطلاحی که جلوتر باز می‌کنیم، فرض می‌کنیم `x` و `y` *resolved* هستند.

بی‌معناست انتظار داشته باشیم عملگر `+` خودش جادویی تشخیص دهد کدام آماده نیست و صبر کند تا هر دو آماده شوند، بعد عملیات را انجام دهد. اگر statementها بعضی *اکنون* تمام شوند و بعضی *بعدتر*، برنامه به‌هم می‌ریزد.

چطور می‌شود درباره‌ی رابطه‌ی دو statement استدلال کرد اگر یکی (یا هر دو) ممکن است هنوز تمام نشده باشد؟ اگر statement 2 به اتمام statement 1 وابسته باشد فقط دو حالت داریم: یا ۱ همین *الان* تمام شده و همه‌چیز خوب است، یا نشده و ۲ fail می‌شود.

اگر این حرف‌ها شما را یاد فصل ۱ می‌اندازد، عالی!

به مثال `x + y` برگردیم. فرض کنید راهی بود بگوییم: «`x` و `y` را جمع کن، اما اگر یکی آماده نیست، صبر کن تا آماده شوند و در اولین فرصت جمع کن.»

شاید ذهن‌تان رفت سمت callback. پس:

```js
function add(getX,getY,cb) {
	var x, y;
	getX( function(xVal){
		x = xVal;
		// both are ready?
		if (y != undefined) {
			cb( x + y );	// send along sum
		}
	} );
	getY( function(yVal){
		y = yVal;
		// both are ready?
		if (x != undefined) {
			cb( x + y );	// send along sum
		}
	} );
}

// `fetchX()` and `fetchY()` are sync or async
// functions
add( fetchX, fetchY, function(sum){
	console.log( sum ); // that was easy, huh?
} );
```

چند ثانیه مکث کنید و زیبایی (یا بی‌زیبایی!) این تکه‌کد را هضم کنید.

با اینکه زشتی‌اش واضح است، یک نکته‌ی مهم دارد:

در این کد `x` و `y` را future value در نظر گرفتیم و عملیاتی به نام `add(..)` نوشتیم که از بیرون فرقی ندارد `x` و `y` همین حالا آماده باشند یا بعدتر. یعنی *now* و *later* را normalize می‌کند تا نتیجه‌ی `add(..)` قابل پیش‌بینی شود.

وقتی `add(..)` از نظر زمانی سازگار باشد -- یعنی در now و later رفتار یکسانی داشته باشد -- استدلال روی کد async خیلی آسان‌تر می‌شود.

واضح‌تر: برای مدیریت یکنواخت now و later، هر دو را later می‌کنیم: همه‌ی عملیات‌ها async می‌شوند.

البته این راه‌حل خامِ callbackی هنوز خیلی کم‌وکاستی دارد. فقط یک قدم خیلی کوچک برای درک مزیت استدلال بر اساس future value بدون دغدغه‌ی «چه زمانی آماده می‌شود».

#### مقدار Promise

جلوتر خیلی مفصل‌تر Promise را باز می‌کنیم -- پس اگر این بخش الان کمی گیج‌کننده است نگران نباشید -- اما خیلی کوتاه ببینیم مثال `x + y` را با Promise چطور بیان می‌کنیم:

```js
function add(xPromise,yPromise) {
	// `Promise.all([ .. ])` takes an array of promises,
	// and returns a new promise that waits on them
	// all to finish
	return Promise.all( [xPromise, yPromise] )

	// when that promise is resolved, let's take the
	// received `X` and `Y` values and add them together.
	.then( function(values){
		// `values` is an array of the messages from the
		// previously resolved promises
		return values[0] + values[1];
	} );
}

// `fetchX()` and `fetchY()` return promises for
// their respective values, which may be ready
// *now* or *later*.
add( fetchX(), fetchY() )

// we get a promise back for the sum of those
// two numbers.
// now we chain-call `then(..)` to wait for the
// resolution of that returned promise.
.then( function(sum){
	console.log( sum ); // that was easier!
} );
```

در این کد دو لایه Promise داریم.

`fetchX()` و `fetchY()` مستقیم صدا زده می‌شوند و خروجی‌شان (Promise) به `add(..)` می‌رود. مقدارهای زیرین ممکن است now یا later آماده شوند، اما Promise رفتار را در هر دو حالت normalize می‌کند. پس درباره‌ی `X` و `Y` مستقل از زمان استدلال می‌کنیم.

لایه‌ی دوم Promiseای است که `add(..)` می‌سازد (با `Promise.all([ .. ])`) و برمی‌گرداند؛ ما هم با `then(..)` منتظرش می‌مانیم. وقتی `add(..)` تمام شد، future value مربوط به `sum` آماده است و می‌توانیم چاپش کنیم. منطق انتظار برای `X` و `Y` داخل `add(..)` پنهان شده است.

**نکته:** داخل `add(..)`، فراخوانی `Promise.all([ .. ])` یک Promise می‌سازد (که منتظر resolve شدن `xPromise` و `yPromise` است). سپس `.then(..)` Promise دیگری می‌سازد که با `return values[0] + values[1]` فوراً resolve می‌شود. بنابراین `then(..)` انتهای snippet که بعد از `add(..)` زنجیر کرده‌ایم، در عمل روی Promise دوم کار می‌کند، نه Promise اول `Promise.all([ .. ])`. ضمن اینکه همان then دوم هم Promise دیگری ساخته که اگر بخواهیم می‌توانیم observe کنیم. جزئیات chaining را جلوتر کامل توضیح می‌دهیم.

مثل سفارش چیزبرگر، resolve شدن Promise می‌تواند rejection هم باشد نه fulfillment. برخلاف fulfilled Promise که مقدارش همیشه programmatic است، مقدار rejection (معمولاً «rejection reason») یا مستقیم توسط منطق برنامه set می‌شود یا ضمنی از runtime exception می‌آید.

در Promise، متد `then(..)` می‌تواند دو تابع بگیرد: اولی برای fulfillment (مثل قبل)، دومی برای rejection:

```js
add( fetchX(), fetchY() )
.then(
	// fulfillment handler
	function(sum) {
		console.log( sum );
	},
	// rejection handler
	function(err) {
		console.error( err ); // bummer!
	}
);
```

اگر در گرفتن `X` یا `Y` مشکلی پیش بیاید، یا هنگام جمع چیزی fail شود، Promise برگشتی `add(..)` rejected می‌شود و callback دوم در `then(..)` مقدار rejection را می‌گیرد.

چون Promise state زمان‌وابسته (انتظار برای fulfillment/rejection مقدار زیرین) را کپسوله می‌کند، خود Promise از بیرون زمان‌مستقل است؛ و به همین خاطر Promiseها را می‌شود مستقل از زمان/خروجی زیرین به‌شکل قابل پیش‌بینی compose کرد.

همچنین Promise بعد از resolve شدن برای همیشه همان‌طور می‌ماند -- به مقدار *immutable* تبدیل می‌شود -- و می‌توان هرچند بار لازم باشد آن را observe کرد.

**نکته:** چون Promise resolved از بیرون immutable است، می‌توان با خیال راحت آن را به هر طرفی پاس داد و مطمئن بود ناخواسته یا مخرب تغییر نمی‌کند. خصوصاً وقتی چند طرف resolution یک Promise را observe می‌کنند؛ هیچ طرفی نمی‌تواند توان مشاهده‌ی طرف دیگر را خراب کند. immutability شاید آکادمیک به نظر برسد، اما یکی از بنیادی‌ترین نکات طراحی Promise است.

این یکی از مهم‌ترین مفاهیم Promise است. با زحمت زیاد می‌توانید همین اثر را ad hoc فقط با callback ugly هم بسازید، اما راهبرد مؤثری نیست، مخصوصاً چون باید بارها تکرارش کنید.

Promise یک مکانیزم تکرارپذیر و تمیز برای کپسوله‌کردن و compose کردن *future value* است.

### رویداد Completion

همان‌طور که دیدیم، Promise تکی مثل *future value* رفتار می‌کند. اما می‌توان resolution Promise را از زاویه‌ی دیگری هم دید: سازوکار flow-control زمانی (این-بعد-آن) برای دو یا چند گام در یک task async.

فرض کنید `foo(..)` را برای انجام کاری صدا می‌زنیم. جزئیاتش را نمی‌دانیم و لازم هم نیست. شاید کار را فوراً تمام کند، شاید طول بکشد.

فقط لازم است بدانیم `foo(..)` چه زمانی تمام شد تا برویم گام بعد. یعنی می‌خواهیم از completion `foo(..)` notification بگیریم تا بتوانیم *ادامه* بدهیم.

طبق سبک رایج JavaScript، وقتی می‌خواهید notification بگیرید احتمالاً به رویداد فکر می‌کنید. پس می‌توانیم نیازمان را این‌طور بازبیان کنیم: گوش‌دادن به یک رویداد *completion* (یا *continuation*) که `foo(..)` منتشر می‌کند.

**نکته:** اینکه بگویید «completion event» یا «continuation event» بستگی به زاویه دید دارد. تمرکز روی خود `foo(..)` است یا روی چیزی که *بعد از* اتمامش رخ می‌دهد؟ هر دو درست‌اند. notification می‌گوید `foo(..)` تمام شده، و همزمان می‌گوید می‌توانید ادامه دهید. حتی callbackی که برای notification می‌دهید همان چیزی است که قبل‌تر continuation می‌نامیدیم. چون فعلاً تمرکز ما بیشتر روی خود `foo(..)` است، در ادامه عبارت *completion event* را ترجیح می‌دهیم.

در callback، این «notification» همان callbackی است که task (`foo(..)`) صدا می‌زند. اما با Promise رابطه را برعکس می‌کنیم: انتظار داریم از `foo(..)` رویداد گوش کنیم و پس از notification اقدام بعدی را انجام دهیم.

اول یک pseudocode:

```js
foo(x) {
	// start doing something that could take a while
}

foo( 42 )

on (foo "completion") {
	// now we can do the next step!
}

on (foo "error") {
	// oops, something went wrong in `foo(..)`
}
```

`foo(..)` را صدا می‌زنیم و دو listener ثبت می‌کنیم: یکی برای `"completion"` و یکی برای `"error"` -- دو خروجی نهایی ممکن `foo(..)`. در اصل، `foo(..)` لازم نیست بداند کد فراخواننده subscribe کرده یا نه؛ این جداسازی نگرانی‌ها خیلی خوب است.

متاسفانه چنین کدی به «جادویی» نیاز دارد که در JS وجود ندارد (و احتمالاً عملی هم نیست). فرم طبیعی‌تر در JS:

```js
function foo(x) {
	// start doing something that could take a while

	// make a `listener` event notification
	// capability to return

	return listener;
}

var evt = foo( 42 );

evt.on( "completion", function(){
	// now we can do the next step!
} );

evt.on( "failure", function(err){
	// oops, something went wrong in `foo(..)`
} );
```

`foo(..)` صریحاً یک قابلیت subscribe به event می‌سازد و برمی‌گرداند، و کد فراخواننده handlerها را روی آن ثبت می‌کند.

وارونگی نسبت به callback کلاسیک واضح است و عمدی: به‌جای اینکه callback را بدهیم `foo(..)`, خود `foo(..)` قابلیتی برمی‌گرداند (`evt`) که callbackها را دریافت می‌کند.

اما همان‌طور که در فصل ۲ گفتیم، callback خودش هم *inversion of control* است. پس وارونه‌کردن الگوی callback یعنی *inversionِ inversion* یا همان *uninversion of control* -- یعنی بازگرداندن کنترل به کد فراخواننده.

یک مزیت مهم: چند بخش جدا از کد می‌توانند همان قابلیت listen را بگیرند و مستقل از هم هنگام completion `foo(..)` مطلع شوند و گام بعدی خودشان را انجام دهند:

```js
var evt = foo( 42 );

// let `bar(..)` listen to `foo(..)`'s completion
bar( evt );

// also, let `baz(..)` listen to `foo(..)`'s completion
baz( evt );
```

*Uninversion of control* جداسازی نگرانی بهتری می‌دهد: `bar(..)` و `baz(..)` لازم نیست درگیر نحوه‌ی فراخوانی `foo(..)` باشند. همین‌طور `foo(..)` لازم نیست بداند `bar(..)` و `baz(..)` وجود دارند یا منتظر notificationند.

در اصل این شیء `evt` طرف سوم خنثی برای مذاکره‌ی بین نگرانی‌های جداست.

#### «رویداد»های Promise

احتمالاً حدس زده‌اید قابلیت `evt` در این مثال، قیاسی از Promise است.

در رویکرد Promise، `foo(..)` یک نمونه `Promise` می‌سازد و برمی‌گرداند، و همان Promise به `bar(..)` و `baz(..)` می‌رود.

**نکته:** «رویداد»های resolution Promise که گوش می‌کنیم دقیقاً event رسمی نیستند (هرچند برای این بحث شبیه event رفتار می‌کنند) و معمولاً `"completion"` یا `"error"` نام ندارند. در عوض با `then(..)` روی رویداد `"then"` ثبت می‌کنیم. دقیق‌تر بگوییم `then(..)` رویداد(های) `"fulfillment"` و/یا `"rejection"` ثبت می‌کند، هرچند این واژه‌ها را مستقیم در کد نمی‌بینیم.

```js
function foo(x) {
	// start doing something that could take a while

	// construct and return a promise
	return new Promise( function(resolve,reject){
		// eventually, call `resolve(..)` or `reject(..)`,
		// which are the resolution callbacks for
		// the promise.
	} );
}

var p = foo( 42 );

bar( p );

baz( p );
```

**نکته:** الگوی `new Promise( function(..){ .. } )` معمولاً "revealing constructor" نام دارد. تابع ورودی بلافاصله اجرا می‌شود (برخلاف callbackهای `then(..)` که async هستند) و دو پارامتر می‌گیرد که این‌جا `resolve` و `reject` نام‌گذاری شده‌اند. این‌ها resolution functionهای Promise هستند؛ معمولاً `resolve(..)` برای fulfillment و `reject(..)` برای rejection است.

احتمالاً حدس می‌زنید `bar(..)` و `baz(..)` درونشان چطور است:

```js
function bar(fooPromise) {
	// listen for `foo(..)` to complete
	fooPromise.then(
		function(){
			// `foo(..)` has now finished, so
			// do `bar(..)`'s task
		},
		function(){
			// oops, something went wrong in `foo(..)`
		}
	);
}

// ditto for `baz(..)`
```

resolution Promise لازم نیست حتماً پیام داده‌ای حمل کند، مثل وقتی Promise را future value می‌دیدیم. می‌تواند فقط سیگنال flow-control باشد، همان‌طور که بالا دیدیم.

راه دیگر:

```js
function bar() {
	// `foo(..)` has definitely finished, so
	// do `bar(..)`'s task
}

function oopsBar() {
	// oops, something went wrong in `foo(..)`,
	// so `bar(..)` didn't run
}

// ditto for `baz()` and `oopsBaz()`

var p = foo( 42 );

p.then( bar, oopsBar );

p.then( baz, oopsBaz );
```

**نکته:** اگر قبلاً Promise زیاد دیده باشید، شاید وسوسه شوید دو خط آخر را به‌صورت chaining بنویسید: `p.then(..).then(..)` به‌جای `p.then(..); p.then(..)`. این رفتار کاملاً متفاوتی می‌دهد، پس دقت کنید! این تفاوت همین الان شاید شفاف نباشد، ولی در واقع الگوی async دیگری است: splitting/forking. جلوتر برمی‌گردیم.

در این فرم به‌جای پاس‌دادن `p` به `bar(..)` و `baz(..)`, خود Promise را برای کنترل زمان اجرای آن‌ها استفاده می‌کنیم. تفاوت اصلی در error handling است.

در رویکرد اول، `bar(..)` چه `foo(..)` موفق شود چه fail، صدا زده می‌شود و خودش fallback را مدیریت می‌کند. برای `baz(..)` هم همین‌طور.

در رویکرد دوم، `bar(..)` فقط وقتی `foo(..)` موفق شود اجرا می‌شود، وگرنه `oopsBar(..)` اجرا می‌شود. برای `baz(..)` هم مشابه.

هیچ‌کدام ذاتاً «درست‌تر» نیستند؛ بسته به سناریو یکی ترجیح دارد.

در هر دو حالت، Promiseای که از `foo(..)` برمی‌گردد (`p`) کنترل‌کننده‌ی گام بعدی است.

همچنین اینکه در هر دو snippet دو بار `then(..)` روی همان `p` صدا می‌زنیم، نکته‌ی قبلی را تایید می‌کند: Promise بعد از resolve شدن، همان نتیجه (fulfillment یا rejection) را برای همیشه نگه می‌دارد و می‌شود هرچند بار لازم بود observe اش کرد.

هر زمان `p` resolve شود، گام بعدی همیشه یکسان است؛ چه *اکنون* چه *بعدتر*.
