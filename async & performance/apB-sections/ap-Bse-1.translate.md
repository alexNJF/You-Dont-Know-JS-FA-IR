# Sequenceهای Iterable

در پیوست قبلی، *iterable sequence*های *asynquence* را معرفی کردیم، اما می‌خواهیم این‌بار با جزئیات بیشتری به آن‌ها برگردیم.

برای یادآوری، این مثال را به خاطر بیاورید:

```js
var domready = ASQ.iterable();

// ..

domready.val( function(){
	// DOM is ready
} );

// ..

document.addEventListener( "DOMContentLoaded", domready.next );
```

حالا بیایید یک توالی چندمرحله‌ای را به‌صورت یک *iterable sequence* تعریف کنیم:

```js
var steps = ASQ.iterable();

steps
.then( function STEP1(x){
	return x * 2;
} )
.then( function STEP2(x){
	return x + 3;
} )
.then( function STEP3(x){
	return x * 4;
} );

steps.next( 8 ).value;	// 16
steps.next( 16 ).value;	// 19
steps.next( 19 ).value;	// 76
steps.next().done;		// true
```

همان‌طور که می‌بینید، یک *iterable sequence* یک *iterator* سازگار با استاندارد است (فصل ۴ را ببینید). بنابراین می‌توان آن را مثل generator (یا هر *iterable* دیگری) با حلقه‌ی ES6 `for..of` پیمایش کرد:

```js
var steps = ASQ.iterable();

steps
.then( function STEP1(){ return 2; } )
.then( function STEP2(){ return 4; } )
.then( function STEP3(){ return 6; } )
.then( function STEP4(){ return 8; } )
.then( function STEP5(){ return 10; } );

for (var v of steps) {
	console.log( v );
}
// 2 4 6 8 10
```

فراتر از مثال trigger شدن رویداد که در پیوست قبل دیدیم، *iterable sequence*ها جالب‌اند چون در اصل می‌توان آن‌ها را جایگزینی برای generatorها یا زنجیره‌های Promise دید، با انعطاف‌پذیری بیشتر.

یک مثال از چند درخواست Ajax را در نظر بگیرید -- همین سناریو را در فصل‌های ۳ و ۴ به‌ترتیب با Promise chain و generator دیده بودیم -- این بار به شکل *iterable sequence*:

```js
// sequence-aware ajax
var request = ASQ.wrap( ajax );

ASQ( "http://some.url.1" )
.runner(
	ASQ.iterable()

	.then( function STEP1(token){
		var url = token.messages[0];
		return request( url );
	} )

	.then( function STEP2(resp){
		return ASQ().gate(
			request( "http://some.url.2/?v=" + resp ),
			request( "http://some.url.3/?v=" + resp )
		);
	} )

	.then( function STEP3(r1,r2){ return r1 + r2; } )
)
.val( function(msg){
	console.log( msg );
} );
```

*Iterable sequence* یک رشته‌مرحله‌ی ترتیبی (هم sync و هم async) را بیان می‌کند که خیلی شبیه Promise chain است -- یعنی از callback تو‌در‌تو خیلی تمیزتر است، اما هنوز به اندازه‌ی نحو ترتیبی مبتنی بر `yield` در generatorها خوانا نیست.

اما ما *iterable sequence* را به `ASQ#runner(..)` می‌دهیم، و runner آن را مثل یک generator تا انتها اجرا می‌کند. اینکه *iterable sequence* در عمل تقریباً مثل generator رفتار می‌کند، از چند جهت مهم است.

اول اینکه *iterable sequence*ها تا حدی معادل پیشا-ES6 برای بخشی از قابلیت‌های generator در ES6 هستند. یعنی یا می‌توانید مستقیم خودشان را بنویسید (برای اجرای گسترده‌تر)، یا generatorهای ES6 بنویسید و آن‌ها را به *iterable sequence* (یا حتی Promise chain) تبدیل/ترنسپایل کنید.

این‌که یک generator از نوع async-run-to-completion را صرفاً sugar نحوی برای Promise chain ببینیم، یک درک مهم از رابطه‌ی ایزومورفیک آن‌هاست.

قبل از ادامه، خوب است اشاره کنیم همین قطعه‌ی قبلی در *asynquence* می‌توانست این‌طور هم نوشته شود:

```js
ASQ( "http://some.url.1" )
.seq( /*STEP 1*/ request )
.seq( function STEP2(resp){
	return ASQ().gate(
		request( "http://some.url.2/?v=" + resp ),
		request( "http://some.url.3/?v=" + resp )
	);
} )
.val( function STEP3(r1,r2){ return r1 + r2; } )
.val( function(msg){
	console.log( msg );
} );
```

علاوه بر این، مرحله‌ی ۲ حتی می‌توانست به این شکل هم بیان شود:

```js
.gate(
	function STEP2a(done,resp) {
		request( "http://some.url.2/?v=" + resp )
		.pipe( done );
	},
	function STEP2b(done,resp) {
		request( "http://some.url.3/?v=" + resp )
		.pipe( done );
	}
)
```

پس چرا باید زحمت بدهیم و جریان کنترل را به‌شکل *iterable sequence* داخل `ASQ#runner(..)` بنویسیم، وقتی یک زنجیره‌ی ساده‌تر/تخت‌تر *asynquence* هم کار را راه می‌اندازد؟

چون فرم *iterable sequence* یک حقه‌ی مهم در آستین دارد که توان بیشتری به ما می‌دهد. ادامه را ببینید.

### گسترش Iterable Sequenceها

Generatorها، sequenceهای معمولی *asynquence*، و Promise chainها همگی **eagerly evaluated** هستند -- یعنی جریان کنترلی که در ابتدا تعریف می‌کنید، همان جریان ثابتی است که اجرا خواهد شد.

اما *iterable sequence*ها **lazily evaluated** هستند؛ یعنی هنگام اجرای sequence می‌توانید در صورت نیاز مراحل جدیدی به آن اضافه کنید.

**نکته:** فقط می‌توانید به انتهای یک *iterable sequence* مرحله اضافه کنید، نه اینکه وسط آن مرحله تزریق کنید.

اول یک مثال ساده‌تر (همگام) از این قابلیت را ببینیم تا با ایده آشنا شویم:

```js
function double(x) {
	x *= 2;

	// should we keep extending?
	if (x < 500) {
		isq.then( double );
	}

	return x;
}

// setup single-step iterable sequence
var isq = ASQ.iterable().then( double );

for (var v = 10, ret;
	(ret = isq.next( v )) && !ret.done;
) {
	v = ret.value;
	console.log( v );
}
```

*Iterable sequence* در ابتدا فقط یک مرحله‌ی تعریف‌شده دارد (`isq.then(double)`)، اما تحت شرایطی (`x < 500`) خودش را گسترش می‌دهد. از نظر فنی sequenceهای *asynquence* و Promise chainها هم *می‌توانند* چیزی شبیه این انجام دهند، اما کمی جلوتر می‌بینیم چرا این قابلیت در آن‌ها کافی نیست.

هرچند این مثال نسبتاً ساده است و می‌شد با یک `while` در generator هم نوشت، اما کمی بعد سراغ حالت‌های پیشرفته‌تر می‌رویم.

برای نمونه، می‌توانید پاسخ یک درخواست Ajax را بررسی کنید و اگر نشان می‌داد داده‌ی بیشتری لازم است، به‌صورت شرطی مرحله‌های جدیدی برای درخواست(های) اضافه وارد *iterable sequence* کنید. یا مثلاً یک مرحله‌ی فرمت‌کردن مقدار را به‌صورت شرطی به انتهای پردازش Ajax اضافه کنید.

این مثال را ببینید:

```js
var steps = ASQ.iterable()

.then( function STEP1(token){
	var url = token.messages[0].url;

	// was an additional formatting step provided?
	if (token.messages[0].format) {
		steps.then( token.messages[0].format );
	}

	return request( url );
} )

.then( function STEP2(resp){
	// add another Ajax request to the sequence?
	if (/x1/.test( resp )) {
		steps.then( function STEP5(text){
			return request(
				"http://some.url.4/?v=" + text
			);
		} );
	}

	return ASQ().gate(
		request( "http://some.url.2/?v=" + resp ),
		request( "http://some.url.3/?v=" + resp )
	);
} )

.then( function STEP3(r1,r2){ return r1 + r2; } );
```

می‌بینید که در دو نقطه‌ی مختلف، `steps` را به‌صورت شرطی با `steps.then(..)` گسترش داده‌ایم. برای اجرای این *iterable sequence* هم کافی است آن را با `ASQ#runner(..)` داخل جریان اصلی برنامه (اینجا با نام `main`) وصل کنیم:

```js
var main = ASQ( {
	url: "http://some.url.1",
	format: function STEP4(text){
		return text.toUpperCase();
	}
} )
.runner( steps )
.val( function(msg){
	console.log( msg );
} );
```

آیا می‌شود این انعطاف‌پذیری (رفتار شرطی) را با generator هم بیان کرد؟ تا حدی بله، اما باید منطق را کمی با فرم نامأنوس‌تری جابه‌جا کنیم:

```js
function *steps(token) {
	// **STEP 1**
	var resp = yield request( token.messages[0].url );

	// **STEP 2**
	var rvals = yield ASQ().gate(
		request( "http://some.url.2/?v=" + resp ),
		request( "http://some.url.3/?v=" + resp )
	);

	// **STEP 3**
	var text = rvals[0] + rvals[1];

	// **STEP 4**
	// was an additional formatting step provided?
	if (token.messages[0].format) {
		text = yield token.messages[0].format( text );
	}

	// **STEP 5**
	// need another Ajax request added to the sequence?
	if (/foobar/.test( resp )) {
		text = yield request(
			"http://some.url.4/?v=" + text
		);
	}

	return text;
}

// note: `*steps()` can be run by the same `ASQ` sequence
// as `steps` was previously
```

اگر از مزایای شناخته‌شده‌ی نحو ترتیبی و sync-نما در generatorها صرف‌نظر کنیم (فصل ۴ را ببینید)، باز هم منطق `steps` در فرم generator (`*steps()`) مجبور شد برای شبیه‌سازی پویایی *iterable sequence* قابل‌گسترش (`steps`) بازآرایی شود.

اما اگر بخواهیم این قابلیت را با Promiseها یا sequenceها بیان کنیم چه؟ *می‌توانید* چیزی شبیه زیر بنویسید:

```js
var steps = something( .. )
.then( .. )
.then( function(..){
	// ..

	// extending the chain, right?
	steps = steps.then( .. );

	// ..
})
.then( .. );
```

مشکلش ظریف اما مهم است. حالا فرض کنید بخواهید این Promise chain به نام `steps` را به جریان اصلی برنامه وصل کنید -- این بار با Promise خالص، نه *asynquence*:

```js
var main = Promise.resolve( {
	url: "http://some.url.1",
	format: function STEP4(text){
		return text.toUpperCase();
	}
} )
.then( function(..){
	return steps;			// hint!
} )
.val( function(msg){
	console.log( msg );
} );
```

مشکل را می‌بینید؟ دقیق‌تر نگاه کنید!

یک race condition در ترتیب مراحل sequence داریم. وقتی `return steps` انجام می‌شود، در همان لحظه `steps` *ممکن است* زنجیره‌ی اولیه‌ی Promise باشد، یا ممکن است با `steps = steps.then(..)` به نسخه‌ی گسترش‌یافته اشاره کند؛ بسته به اینکه ترتیب وقوع اتفاق‌ها چطور باشد.

دو خروجی ممکن داریم:

* اگر `steps` هنوز همان زنجیره‌ی اولیه باشد، وقتی بعداً با `steps = steps.then(..)` «گسترش» پیدا کند، آن Promise اضافه‌شده‌ی انتهایی توسط جریان `main` لحاظ نمی‌شود، چون `main` قبلاً به زنجیره‌ی قبلی متصل شده است. این همان محدودیت نامطلوب **eager evaluation** است.
* اگر `steps` از قبل نسخه‌ی گسترش‌یافته باشد، رفتار مطابق انتظار است و `main` همان زنجیره‌ی توسعه‌یافته را دریافت می‌کند.

جدا از اینکه race condition ذاتاً غیرقابل‌قبول است، نگرانی اصلی همان حالت اول است؛ چون **eager evaluation** در Promise chain را نشان می‌دهد. در مقابل، *iterable sequence* را بدون این مشکل به‌سادگی گسترش دادیم، چون *iterable sequence*ها **lazily evaluated** هستند.

هرچه جریان کنترل شما پویاتر باشد، *iterable sequence*ها بیشتر خودشان را نشان می‌دهند.

**نکته:** برای اطلاعات و مثال‌های بیشتر از *iterable sequence*ها، به مستندات *asynquence* مراجعه کنید: https://github.com/getify/asynquence/blob/master/README.md#iterable-sequences
