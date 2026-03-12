# محدودیت‌های Promise

خیلی از نکاتی که در این بخش می‌بینیم قبلاً در طول فصل اشاره شده بود، اما اینجا می‌خواهیم مشخصاً خودِ محدودیت‌ها را یک‌جا مرور کنیم.

### مدیریت خطای توالی (Sequence Error Handling)

اوایل همین فصل مدیریت خطای Promise را مفصل دیدیم. نحوه‌ی طراحی Promise -- به‌ویژه chain شدن -- یک دام خیلی ساده می‌سازد که در آن خطا در زنجیره‌ی Promise ممکن است ناخواسته بی‌صدا نادیده گرفته شود.

اما نکته‌ی دیگری هم هست. چون Promise chain چیزی جز Promiseهای متصل‌شده نیست، موجودیت مستقلی برای «کل زنجیره به‌عنوان یک چیز واحد» نداریم؛ یعنی راه بیرونیِ واحدی برای مشاهده‌ی همه‌ی خطاهای ممکن در کل chain وجود ندارد.

اگر chainی بسازید که هیچ error handling نداشته باشد، هر خطا در هرجای chain تا بی‌نهایت پایین زنجیره propagate می‌شود تا جایی observe شود (با ثبت rejection handler). در این حالت داشتن reference به *آخرین* Promise chain کافی است (`p` در مثال زیر)، چون می‌توانید handler خطا را همان‌جا ثبت کنید:

```js
// `foo(..)`, `STEP2(..)` and `STEP3(..)` are
// all promise-aware utilities

var p = foo( 42 )
.then( STEP2 )
.then( STEP3 );
```

شاید کمی گیج‌کننده باشد، اما `p` اینجا به Promise اول chain (خروجی `foo(42)`) اشاره نمی‌کند؛ بلکه Promise آخر (خروجی `then(STEP3)`) است.

همچنین هیچ گامی در chain به‌صورت قابل مشاهده خطای خودش را handle نمی‌کند. پس rejection handler روی `p` هر خطای propagate شده از هر نقطه‌ی chain را می‌گیرد:

```
p.catch( handleErrors );
```

اما اگر هر گامی از chain خودش error handling داشته باشد (حتی اگر برای شما hidden باشد)، دیگر `handleErrors(..)` شما خبر نمی‌شود. شاید همین را بخواهید -- بالاخره «handled rejection» است -- اما شاید هم نخواهید. نداشتن راه اطلاع از خطاهای «قبلاً handle شده» در بعضی use-caseها محدودیت ایجاد می‌کند.

این عملاً همان محدودیتی است که `try..catch` هم دارد: می‌تواند exception را بگیرد و swallow کند. پس **منحصر به Promise نیست**، ولی محدودیتی است که دوست داشتیم workaround بهتری داشته باشد.

متاسفانه معمولاً reference مربوط به گام‌های میانی chain نگه داشته نمی‌شود، و بدون reference نمی‌توانید error handler قابل اتکا روی آن‌ها بگذارید.

### مقدار واحد (Single Value)

Promise طبق تعریف فقط یک fulfillment value یا یک rejection reason دارد. در مثال‌های ساده خیلی مهم نیست، اما در سناریوهای پیشرفته‌تر ممکن است محدودکننده شود.

توصیه‌ی رایج این است که چند مقدار را داخل wrapper مثل `object` یا `array` بسته‌بندی کنید. جواب می‌دهد، اما با هر گام chain این wrap/unwrap می‌تواند خسته‌کننده و awkward شود.

#### شکستن مقدارها

گاهی این یک سیگنال است که مسئله را باید به دو یا چند Promise تفکیک کنید.

فرض کنید utilityای به نام `foo(..)` دو مقدار (`x` و `y`) را async تولید می‌کند:

```js
function getY(x) {
	return new Promise( function(resolve,reject){
		setTimeout( function(){
			resolve( (3 * x) - 1 );
		}, 100 );
	} );
}

function foo(bar,baz) {
	var x = bar * baz;

	return getY( x )
	.then( function(y){
		// wrap both values into container
		return [x,y];
	} );
}

foo( 10, 20 )
.then( function(msgs){
	var x = msgs[0];
	var y = msgs[1];

	console.log( x, y );	// 200 599
} );
```

اول خروجی `foo(..)` را بازآرایی کنیم تا مجبور نباشیم `x` و `y` را داخل یک `array` و در یک Promise حمل کنیم. به‌جای آن هر مقدار را در Promise جدا بگذاریم:

```js
function foo(bar,baz) {
	var x = bar * baz;

	// return both promises
	return [
		Promise.resolve( x ),
		getY( x )
	];
}

Promise.all(
	foo( 10, 20 )
)
.then( function(msgs){
	var x = msgs[0];
	var y = msgs[1];

	console.log( x, y );
} );
```

آیا `array`ای از Promise بهتر از `array`ای از مقدارهاست؟ از نظر syntax خیلی تفاوت بزرگی نیست.

اما این روش با نظریه‌ی Promise سازگارتر است. حالا refactor آینده برای جداکردن محاسبه‌ی `x` و `y` به توابع مستقل آسان‌تر است. همچنین orchestration دو Promise را کد فراخواننده تعیین می‌کند (اینجا `Promise.all([ .. ])`)، نه اینکه جزئیات داخل `foo(..)` پنهان شود.

#### بازکردن/Spread آرگومان‌ها

تخصیص‌های `var x = ..` و `var y = ..` هنوز overhead ناخوشایند دارند. یک ترفند functional (با الهام از Reginald Braithwaite) در helper:

```js
function spread(fn) {
	return Function.apply.bind( fn, null );
}

Promise.all(
	foo( 10, 20 )
)
.then(
	spread( function(x,y){
		console.log( x, y );	// 200 599
	} )
)
```

کمی بهتر شد! حتی می‌شود magic را inline کرد و helper ننوشت:

```js
Promise.all(
	foo( 10, 20 )
)
.then( Function.apply.bind(
	function(x,y){
		console.log( x, y );	// 200 599
	},
	null
) );
```

این ترفندها جالب‌اند، اما ES6 راه بهتر دارد: destructuring. فرم destructuring assignment برای آرایه:

```js
Promise.all(
	foo( 10, 20 )
)
.then( function(msgs){
	var [x,y] = msgs;

	console.log( x, y );	// 200 599
} );
```

و بهترین حالت: destructuring در پارامتر تابع:

```js
Promise.all(
	foo( 10, 20 )
)
.then( function([x,y]){
	console.log( x, y );	// 200 599
} );
```

به اصل «هر Promise یک مقدار» وفادار ماندیم و boilerplate را هم حداقل کردیم.

**نکته:** برای جزئیات destructuring در ES6 کتاب *ES6 & Beyond* را ببینید.

### تک‌resolution بودن (Single Resolution)

یکی از ذاتی‌ترین رفتارهای Promise این است که فقط یک‌بار resolve می‌شود (fulfill یا reject). برای خیلی از use-caseهای async که فقط یک مقدار برمی‌گردانند خوب است.

اما موارد async زیادی هم مدل دیگری دارند -- بیشتر شبیه event یا stream داده. در نگاه اول روشن نیست Promise برای این مدل‌ها چقدر مناسب است. بدون abstraction جدی روی Promise، برای resolution چندمقداری کم می‌آورد.

تصور کنید می‌خواهید زنجیره‌ای از گام‌های async را در پاسخ به stimulusی (مثل event) اجرا کنید که خودش چندبار رخ می‌دهد، مثل کلیک دکمه.

این احتمالاً آن‌طور که می‌خواهید کار نمی‌کند:

```js
// `click(..)` binds the `"click"` event to a DOM element
// `request(..)` is the previously defined Promise-aware Ajax

var p = new Promise( function(resolve,reject){
	click( "#mybtn", resolve );
} );

p.then( function(evt){
	var btnID = evt.currentTarget.id;
	return request( "http://some.url.1/?id=" + btnID );
} )
.then( function(text){
	console.log( text );
} );
```

این رفتار فقط وقتی درست است که دکمه قرار باشد یک‌بار کلیک شود. با کلیک دوم، `p` از قبل resolved شده و `resolve(..)` دوم نادیده گرفته می‌شود.

پس باید پارادایم را وارونه کنید: برای هر بار fire شدن event یک chain جدید Promise بسازید:

```js
click( "#mybtn", function(evt){
	var btnID = evt.currentTarget.id;

	request( "http://some.url.1/?id=" + btnID )
	.then( function(text){
		console.log( text );
	} );
} );
```

این روش *کار می‌کند* چون با هر کلیک یک sequence Promise تازه اجرا می‌شود.

اما جدا از زشتی تعریف chain داخل event handler، از منظر جداسازی نگرانی‌ها (SoC) هم مشکل دارد. ممکن است بخواهید event handler جایی تعریف شود و *response* به event (Promise chain) جایی دیگر؛ این الگو بدون helper سخت و awkward است.

**نکته:** صورت‌بندی دیگر این محدودیت: کاش «observable»ای داشتیم که بتوان Promise chain را subscribe کرد. کتابخانه‌هایی مثل RxJS چنین abstractionهایی ساخته‌اند، اما گاهی آن‌قدر سنگین می‌شوند که ماهیت Promise زیرشان گم می‌شود. این سطح abstraction همچنین سؤال می‌سازد که آیا این مکانیزم‌ها (بدون Promise) به‌اندازه‌ی Promise قابل‌اعتمادند یا نه. در پیوست B به Observable برمی‌گردیم.

### اینرسی (Inertia)

یک مانع واقعی برای شروع Promise این است که حجم بزرگی از کد موجود Promise-aware نیست. اگر کدبیس callback-based زیادی دارید، ادامه دادن همان سبک ساده‌تر به نظر می‌رسد.

«یک کدبیس در حال حرکت (با callback) در همان حرکت (با callback) می‌ماند، مگر اینکه یک توسعه‌دهنده‌ی Promise-aware هوشمند دخالت کند.»

Promise پارادایم متفاوتی می‌دهد؛ پس رویکرد کدنویسی می‌تواند از کمی متفاوت تا خیلی متفاوت تغییر کند. باید آگاهانه واردش شوید؛ چون Promise خودبه‌خود از الگوهای قدیمی کدنویسی بیرون نمی‌آید.

مثال callback-based:

```js
function foo(x,y,cb) {
	ajax(
		"http://some.url.1/?x=" + x + "&y=" + y,
		cb
	);
}

foo( 11, 31, function(err,text) {
	if (err) {
		console.error( err );
	}
	else {
		console.log( text );
	}
} );
```

آیا گام‌های اول تبدیل این کد به Promise-aware فوراً واضح است؟ بستگی به تجربه دارد. هرچه تجربه بیشتر، طبیعی‌تر. اما Promise روی برچسبش دستور تبدیل یک‌سان برای همه ندارد؛ مسئولیت با شماست.

همان‌طور که گفتیم، utility Ajax باید Promise-aware باشد (`request(..)`)، نه callback-based. می‌توانید خودتان بسازید (همین فصل دیدیم). اما اگر مجبور باشید برای هر utility callbackی wrapper Promise دستی بنویسید، احتمال refactor کاهش پیدا می‌کند.

Promise خام پاسخ مستقیمی به این محدودیت ندارد. اما اکثر کتابخانه‌های Promise helper دارند. حتی بدون کتابخانه، helper فرضی زیر را ببینید:

```js
// polyfill-safe guard check
if (!Promise.wrap) {
	Promise.wrap = function(fn) {
		return function() {
			var args = [].slice.call( arguments );

			return new Promise( function(resolve,reject){
				fn.apply(
					null,
					args.concat( function(err,v){
						if (err) {
							reject( err );
						}
						else {
							resolve( v );
						}
					} )
				);
			} );
		};
	};
}
```

بله، utility ریز و تر و تمیزی نیست. اما با وجود ظاهر ترسناک، ایده‌اش ساده‌تر از چیزی است که به نظر می‌رسد: تابعی را می‌گیرد که آخرین پارامترش callback سبک error-first است، و تابع جدیدی می‌دهد که Promise می‌سازد و callback را خودکار جایگزین می‌کند و به fulfillment/rejection وصل می‌کند.

به‌جای ورود به جزئیات پیاده‌سازی `Promise.wrap(..)`, استفاده‌اش را ببینیم:

```js
var request = Promise.wrap( ajax );

request( "http://some.url.1/" )
.then( .. )
..
```

خیلی ساده شد!

`Promise.wrap(..)` خودش Promise نمی‌سازد؛ تابعی می‌سازد که Promise می‌سازد. می‌توان چنین تابعی را نوعی "Promise factory" دانست. من برای این نوع تابع واژه‌ی "promisory" را پیشنهاد می‌کنم (ترکیب Promise + factory).

عمل wrap کردن تابع callbackمحور برای Promise-aware شدن معمولاً "lifting" یا "promisifying" نامیده می‌شود. اما برای خود تابع حاصل، اصطلاح استانداردی جز "lifted function" جا نیفتاده و به نظرم "promisory" توصیفی‌تر است.

**نکته:** "promisory" واژه‌ی ساختگی نیست؛ کلمه‌ی واقعی است و معنایش چیزی است که promise را دربر دارد یا منتقل می‌کند. دقیقاً همین کاری که این توابع می‌کنند.

پس `Promise.wrap(ajax)` یک `ajax(..)` promisory می‌سازد که آن را `request(..)` می‌نامیم، و این promisory برای پاسخ‌های Ajax Promise تولید می‌کند.

اگر همه‌ی توابع از اول promisory بودند، این قدم اضافه لازم نبود. اما خوشبختانه الگوی wrap معمولاً تکرارپذیر است و می‌شود helperی مثل `Promise.wrap(..)` داشت تا کار Promise coding آسان شود.

برگردیم به مثال قبل: هم برای `ajax(..)` هم برای `foo(..)` به promisory نیاز داریم:

```js
// make a promisory for `ajax(..)`
var request = Promise.wrap( ajax );

// refactor `foo(..)`, but keep it externally
// callback-based for compatibility with other
// parts of the code for now -- only use
// `request(..)`'s promise internally.
function foo(x,y,cb) {
	request(
		"http://some.url.1/?x=" + x + "&y=" + y
	)
	.then(
		function fulfilled(text){
			cb( null, text );
		},
		cb
	);
}

// now, for this code's purposes, make a
// promisory for `foo(..)`
var betterFoo = Promise.wrap( foo );

// and use the promisory
betterFoo( 11, 31 )
.then(
	function fulfilled(text){
		console.log( text );
	},
	function rejected(err){
		console.error( err );
	}
);
```

البته وقتی `foo(..)` را با `request(..)` refactor می‌کنید، می‌توانید خود `foo(..)` را هم promisory کنید و اصلاً callback-based نگه ندارید. تصمیم بستگی دارد `foo(..)` باید با بخش‌های callback-based دیگر سازگار بماند یا نه.

```js
// `foo(..)` is now also a promisory because it
// delegates to the `request(..)` promisory
function foo(x,y) {
	return request(
		"http://some.url.1/?x=" + x + "&y=" + y
	);
}

foo( 11, 31 )
.then( .. )
..
```

با اینکه ES6 Promise helper native برای promisory wrapping ندارد، اکثر کتابخانه‌ها دارند یا می‌توانید خودتان بنویسید. پس این محدودیت Promise با درد زیاد قابل حل است (قطعاً کمتر از درد callback hell).

### Promise غیرقابل لغو (Uncancelable)

وقتی Promise ساختید و handlerهای fulfillment/rejection را ثبت کردید، از بیرون کاری نمی‌توانید بکنید که اگر task بی‌اهمیت شد جلوی ادامه‌اش را بگیرید.

**نکته:** خیلی از کتابخانه‌های Promise امکان cancel می‌دهند، اما این ایده بدی است! خیلی‌ها دوست داشتند Promise از اول cancel خارجی داشته باشد، اما مشکلش این است که یک مصرف‌کننده می‌تواند روی توان مشاهده‌ی مصرف‌کننده‌ی دیگر اثر بگذارد. این trustability مربوط به future value (immutability بیرونی) را نقض می‌کند و مصداق anti-pattern معروف "action at a distance" است. هرچقدر مفید به نظر برسد، شما را به همان کابوس callback برمی‌گرداند.

مثال timeout قبلی:

```js
var p = foo( 42 );

Promise.race( [
	p,
	timeoutPromise( 3000 )
] )
.then(
	doSomething,
	handleError
);

p.then( function(){
	// still happens even in the timeout case :(
} );
```

"timeout" بیرون از Promise `p` بود، پس خود `p` ادامه می‌دهد؛ که احتمالاً نمی‌خواهیم.

یک راه invasive این است که callbackهای resolution را دستی کنترل کنید:

```js
var OK = true;

var p = foo( 42 );

Promise.race( [
	p,
	timeoutPromise( 3000 )
	.catch( function(err){
		OK = false;
		throw err;
	} )
] )
.then(
	doSomething,
	handleError
);

p.then( function(){
	if (OK) {
		// only happens if no timeout! :)
	}
} );
```

این کد زشت است؛ کار می‌کند اما ایده‌آل نیست. در کل بهتر است از این سناریوها دوری کنید.

اگر مجبور شدید، همین زشتی راه‌حل نشانه است که *cancelation* باید در abstractionی بالاتر از Promise خام تعریف شود. بهتر است به کتابخانه‌های Promise abstraction تکیه کنید نه hack دستی.

**نکته:** کتابخانه‌ی Promise abstraction من یعنی *asynquence* همین abstraction و قابلیت `abort()` برای sequence را می‌دهد (پیوست A).

Promise تکی واقعاً flow-control جدی نیست (حداقل به‌شکل معنادار)، در حالی که *cancelation* دقیقاً به flow-control مربوط است؛ برای همین cancel روی Promise تکی awkward به نظر می‌رسد.

در مقابل، chain Promiseها به‌صورت جمعی -- چیزی که من "sequence" می‌نامم -- یک بیان flow-control واقعی است؛ پس cancelation در آن سطح منطقی است.

هیچ Promise تکی نباید cancelable باشد، ولی cancelable بودن *sequence* منطقی است، چون sequence را مثل Promise به‌عنوان یک مقدار immutable واحد جابه‌جا نمی‌کنید.

### کارایی Promise

این محدودیت هم ساده است هم پیچیده.

اگر قطعات متحرک یک زنجیره‌ی async callback خام را با Promise chain مقایسه کنید، روشن است Promise کار بیشتری دارد و طبیعتاً کمی کندتر است. فقط به لیست guaranteeهای اعتماد Promise فکر کنید در برابر راه‌حل ad hocی که باید روی callback پیاده کنید.

کار بیشتر، حفاظت بیشتر؛ پس Promise نسبت به callback خامِ غیرقابل‌اعتماد کندتر *هست*. این بدیهی است.

اما چقدر کندتر؟ این پرسش خیلی سخت‌تر از آن است که پاسخ مطلق سراسری داشته باشد.

صادقانه، مقایسه تا حدی apples-to-oranges است و شاید سؤال اصلی اشتباه باشد. بهتر است بپرسید سیستم callback ad hoc با همان سطح حفاظت، از Promise implementation سریع‌تر هست یا نه.

اگر Promise محدودیت عملکردی واقعی داشته باشد، بیشتر این است که انتخاب خط‌به‌خط برای اینکه کدام حفاظت اعتماد را می‌خواهید/نمی‌خواهید نمی‌دهد -- همه را همیشه می‌گیرید.

با این حال اگر بپذیریم Promise معمولاً *کمی* کندتر از callback خام است -- در سناریویی که فرض کنیم می‌توانید بی‌اعتمادی را توجیه کنید -- آیا یعنی باید Promise را کلاً کنار گذاشت؟

یک sanity check: اگر کدتان واقعاً این‌قدر حساس به سرعت ذره‌ای است، **آیا JavaScript اصلاً زبان مناسب چنین کاری هست؟** JS قابل بهینه‌سازی است (فصل ۵ و ۶)، اما آیا وسواس روی trade-offهای ریز Promise با وجود مزایایش واقعاً درست است؟

نکته‌ی ظریف دیگر: Promise همه‌چیز را async می‌کند، یعنی بعضی گام‌های فوری sync هم پیشروی گام بعدی را به یک Job موکول می‌کنند. پس ممکن است توالی Promise کمی از همان توالی callbackی کندتر تمام شود.

البته سؤال اصلی این است: آیا این افت‌های بسیار کوچک کارایی *ارزش* تمام مزایای اعتماد و composability Promise را ندارد؟

نظر من: تقریباً در همه‌ی مواردی که فکر می‌کنید Promise کند است، بهینه‌سازی با حذف Promise anti-pattern است.

بهتر است پیش‌فرض کل کدبیس Promise باشد، بعد پروفایل کنید و مسیرهای داغ را دقیق تحلیل کنید. آیا Promise واقعاً bottleneck است یا فقط حدس نظری؟ فقط *بعد از* بنچمارک معتبر (فصل ۶) منطقی است در همان نقاط بحرانی Promise را حذف کنید.

Promise کمی کندتر است، اما در عوض اعتمادپذیری، پیش‌بینی‌پذیری ضد-Zalgo و composability built-in می‌گیرید. شاید محدودیت اصلی Promise کارایی‌اش نباشد، بلکه کم‌دیدن مزایایش باشد.
