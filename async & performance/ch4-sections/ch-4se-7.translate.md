# Thunkها

تا اینجا فرض کردیم بهترین راه مدیریت async با generator این است که از generator، Promise `yield` کنیم و Promise هم با utilityای مثل `run(..)` generator را resume کند. برای شفافیت: همین بهترین گزینه است.

اما یک الگوی دیگر را رد کردیم که تا حدی هم رایج است؛ برای کامل بودن تصویر، کوتاه به آن نگاه می‌کنیم.

در علوم کامپیوتر، مفهومی قدیمی (پیش از JS) داریم به نام "thunk". بدون ورود به تاریخچه، در یک تعریف محدود در JS، thunk تابعی است که -- بدون پارامتر -- طوری بسته‌بندی شده که یک تابع دیگر را صدا بزند.

یعنی دور یک فراخوانی تابع (با پارامترهای لازمش) یک تعریف تابع می‌پیچید تا اجرای آن *به تعویق* بیفتد؛ آن wrapper می‌شود thunk. بعداً که thunk را اجرا کنید، در نهایت همان تابع اصلی صدا زده می‌شود.

مثال:

```js
function foo(x,y) {
	return x + y;
}

function fooThunk() {
	return foo( 3, 4 );
}

// later

console.log( fooThunk() );	// 7
```

پس thunk همزمانی ساده و مستقیم است. اما thunk ناهمگام چطور؟ می‌توانیم تعریف محدود thunk را گسترش دهیم تا callback هم بگیرد.

```js
function foo(x,y,cb) {
	setTimeout( function(){
		cb( x + y );
	}, 1000 );
}

function fooThunk(cb) {
	foo( 3, 4, cb );
}

// later

fooThunk( function(sum){
	console.log( sum );		// 7
} );
```

اینجا `fooThunk(..)` فقط پارامتر `cb(..)` می‌خواهد، چون مقدارهای `3` و `4` برای `x` و `y` از قبل مشخص شده‌اند و آماده‌ی ارسال به `foo(..)` هستند. thunk در واقع منتظر آخرین قطعه‌ی لازم برای اجرای کارش است: callback.

اما نمی‌خواهید thunk را دستی بسازید. پس یک utility می‌سازیم که این wrapping را انجام دهد.

```js
function thunkify(fn) {
	var args = [].slice.call( arguments, 1 );
	return function(cb) {
		args.push( cb );
		return fn.apply( null, args );
	};
}

var fooThunk = thunkify( foo, 3, 4 );

// later

fooThunk( function(sum) {
	console.log( sum );		// 7
} );
```

**نکته:** اینجا فرض می‌کنیم امضای تابع اصلی (`foo(..)`) callback را در آخر می‌خواهد و بقیه پارامترها قبل از آن می‌آیند. این در JS async تقریباً یک استاندارد عمومی است: «callback-last style». اگر به هر دلیل لازم بود حالت «callback-first style» را پشتیبانی کنید، کافی است utilityای بنویسید که به‌جای `args.push(..)` از `args.unshift(..)` استفاده کند.

نسخه‌ی `thunkify(..)` بالا هم reference تابع `foo(..)` را می‌گیرد هم پارامترهایش را، و خود thunk (`fooThunk(..)`) را برمی‌گرداند. اما این معمول‌ترین شکل مواجهه با thunk در JS نیست.

به‌جای اینکه `thunkify(..)` خود thunk را بسازد، معمولاً -- هرچند شاید گیج‌کننده -- utility `thunkify(..)` تابعی می‌سازد که خودش thunk می‌سازد.

بله، دقیقاً.

```js
function thunkify(fn) {
	return function() {
		var args = [].slice.call( arguments );
		return function(cb) {
			args.push( cb );
			return fn.apply( null, args );
		};
	};
}
```

تفاوت اصلی، همان لایه‌ی اضافه‌ی `return function() { .. }` است. کاربردش این‌طور فرق می‌کند:

```js
var whatIsThis = thunkify( foo );

var fooThunk = whatIsThis( 3, 4 );

// later

fooThunk( function(sum) {
	console.log( sum );		// 7
} );
```

سؤال بزرگ این snippet: اسم درست `whatIsThis` چیست؟ خودش thunk نیست؛ چیزی است که از فراخوانی‌های `foo(..)`، thunk تولید می‌کند. چیزی شبیه "factory" برای "thunk". ظاهراً توافق استانداردی برای نامش وجود ندارد.

پیشنهاد من: **thunkory** (`thunk` + `factory`). پس `thunkify(..)` یک thunkory می‌سازد، و thunkory هم thunk می‌سازد. این منطق با اصطلاح پیشنهادی قبلی‌ام «promisory» در فصل ۳ متقارن است:

```js
var fooThunkory = thunkify( foo );

var fooThunk1 = fooThunkory( 3, 4 );
var fooThunk2 = fooThunkory( 5, 6 );

// later

fooThunk1( function(sum) {
	console.log( sum );		// 7
} );

fooThunk2( function(sum) {
	console.log( sum );		// 11
} );
```

**نکته:** مثال `foo(..)` ما callbackی می‌خواهد که سبک error-first نیست. طبیعی است در عمل سبک error-first رایج‌تر است. اگر `foo(..)` احتمال خطای واقعی داشت می‌شد آن را error-first کرد. machinery مربوط به `thunkify(..)` به سبک callback اهمیتی نمی‌دهد. فقط شکل مصرف فرق می‌کند: `fooThunk1(function(err,sum){..`.

نمایش صریح مرحله‌ی thunkory -- به‌جای مدل قبلی `thunkify(..)` که آن را پنهان می‌کرد -- شاید پیچیدگی اضافی به نظر برسد. اما در عمل مفید است: ابتدای برنامه thunkoryهای لازم را برای APIهای موجود می‌سازید، سپس هر وقت لازم شد با آن‌ها thunk تولید می‌کنید. این دو مرحله‌ی جدا جداسازی قابلیت تمیزتری می‌دهد.

برای مقایسه:

```js
// cleaner:
var fooThunkory = thunkify( foo );

var fooThunk1 = fooThunkory( 3, 4 );
var fooThunk2 = fooThunkory( 5, 6 );

// instead of:
var fooThunk1 = thunkify( foo, 3, 4 );
var fooThunk2 = thunkify( foo, 5, 6 );
```

چه thunkory را صریح نگه دارید چه نه، نحوه‌ی استفاده از thunkها (`fooThunk1(..)` و `fooThunk2(..)`) یکسان می‌ماند.

### s/promise/thunk/

حالا این همه بحث thunk چه ربطی به generator دارد؟

در مقایسه‌ی کلی thunk و Promise: مستقیم قابل‌جایگزینی نیستند و رفتار معادل ندارند. Promiseها به‌مراتب تواناتر و قابل‌اعتمادتر از thunk خام هستند.

اما از زاویه‌ی دیگر، هر دو را می‌توان «درخواست یک مقدار» دید که ممکن است پاسخش async باشد.

یادتان هست در فصل ۳ utilityای برای promisify کردن تابع تعریف کردیم: `Promise.wrap(..)` (می‌شد اسمش `promisify(..)` باشد). این utility خودش Promise نمی‌سازد؛ promisory می‌سازد که بعد Promise تولید می‌کند. این دقیقاً با الگوی thunkory/thunk متقارن است.

برای نشان‌دادن تقارن، اول مثال قبلی `foo(..)` را به سبک callback error-first تغییر دهیم:

```js
function foo(x,y,cb) {
	setTimeout( function(){
		// assume `cb(..)` as "error-first style"
		cb( null, x + y );
	}, 1000 );
}
```

حالا مقایسه‌ی `thunkify(..)` با `promisify(..)` (یا همان `Promise.wrap(..)` فصل ۳):

```js
// symmetrical: constructing the question asker
var fooThunkory = thunkify( foo );
var fooPromisory = promisify( foo );

// symmetrical: asking the question
var fooThunk = fooThunkory( 3, 4 );
var fooPromise = fooPromisory( 3, 4 );

// get the thunk answer
fooThunk( function(err,sum){
	if (err) {
		console.error( err );
	}
	else {
		console.log( sum );		// 7
	}
} );

// get the promise answer
fooPromise
.then(
	function(sum){
		console.log( sum );		// 7
	},
	function(err){
		console.error( err );
	}
);
```

هم thunkory و هم promisory در اصل دارند یک سؤال (برای مقدار) می‌پرسند، و به‌ترتیب `fooThunk` و `fooPromise` نماینده‌ی پاسخ آینده‌ی آن سؤال‌اند. از این زاویه تقارن کاملاً روشن است.

با این دید، می‌توانیم ببینیم generatorهایی که برای async، Promise yield می‌کنند می‌توانند به‌جایش thunk yield کنند. فقط یک utility `run(..)` هوشمندتر می‌خواهیم که نه‌تنها Promise yieldشده را تشخیص دهد و وصل کند، بلکه callback مناسب را هم به thunk yieldشده بدهد.

```js
function *foo() {
	var val = yield request( "http://some.url.1" );
	console.log( val );
}

run( foo );
```

در این مثال، `request(..)` می‌تواند یا promisory باشد که Promise برمی‌گرداند، یا thunkory که thunk برمی‌گرداند. از دید منطق داخل generator، این جزئیات پیاده‌سازی اهمیتی ندارد -- نکته‌ای بسیار قدرتمند.

پس `request(..)` می‌تواند یکی از این دو باشد:

```js
// promisory `request(..)` (see Chapter 3)
var request = Promise.wrap( ajax );

// vs.

// thunkory `request(..)`
var request = thunkify( ajax );
```

در نهایت، برای patch کردن `run(..)` قبلی به نسخه‌ی thunk-aware، منطق زیر را می‌خواهیم:

```js
// ..
// did we receive a thunk back?
else if (typeof next.value == "function") {
	return new Promise( function(resolve,reject){
		// call the thunk with an error-first callback
		next.value( function(err,msg) {
			if (err) {
				reject( err );
			}
			else {
				resolve( msg );
			}
		} );
	} )
	.then(
		handleNext,
		function handleErr(err) {
			return Promise.resolve(
				it.throw( err )
			)
			.then( handleResult );
		}
	);
}
```

حالا generatorهای ما می‌توانند یا promisory صدا بزنند و Promise yield کنند، یا thunkory صدا بزنند و thunk yield کنند؛ در هر دو حالت `run(..)` مقدار را مدیریت می‌کند و بعد از completion، generator را resume می‌کند.

از نظر تقارن ظاهری، این دو رویکرد یکسان دیده می‌شوند. اما این تنها از زاویه‌ی «Promise یا thunk به‌عنوان نماینده‌ی مقدار آینده در continuation generator» درست است.

از دید وسیع‌تر، thunkها ذاتاً تقریباً هیچ‌کدام از تضمین‌های اعتمادپذیری/compose‌پذیری Promise را ندارند. استفاده از thunk به‌جای Promise در این الگوی async مبتنی بر generator قابل انجام است، اما در مقایسه با مزایای Promise (فصل ۳) حالت ایده‌آل نیست.

اگر انتخاب دارید، `yield pr` را به `yield th` ترجیح دهید. با این حال هیچ اشکالی ندارد utilityای مثل `run(..)` هر دو نوع مقدار را پشتیبانی کند.

**نکته:** utility `runner(..)` در کتابخانه‌ی *asynquence* من (که در پیوست A بررسی می‌شود) yieldهای Promise، thunk و sequenceهای asynquence را همزمان پشتیبانی می‌کند.
