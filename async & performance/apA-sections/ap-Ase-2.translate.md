# API کتابخانه‌ی *asynquence*

برای شروع، sequence (یعنی یک instance از *asynquence*) را با تابع `ASQ(..)` می‌سازید. اگر `ASQ()` را بدون پارامتر صدا بزنید یک sequence اولیه‌ی خالی می‌سازد. اگر یک یا چند مقدار یا تابع به `ASQ(..)` بدهید، هر آرگومان به‌عنوان stepهای ابتدایی sequence در نظر گرفته می‌شود.

**نکته:** در تمام مثال‌های این بخش، از شناسه‌ی سراسری *asynquence* در مرورگر استفاده می‌کنم: `ASQ`. اگر *asynquence* را از طریق module system (مرورگر یا سرور) وارد کنید، هر نمادی که بخواهید می‌توانید تعریف کنید و *asynquence* هم مشکلی ندارد.

بعضی متدهای API که اینجا می‌بینید در هسته‌ی *asynquence* هستند، و بعضی دیگر با package پلاگین اختیاری "contrib" می‌آیند. برای اینکه بدانید هر متد built-in است یا پلاگین، مستندات *asynquence* را ببینید: [http://github.com/getify/asynquence](http://github.com/getify/asynquence)

### Stepها

اگر یک تابع نماینده‌ی step عادی در sequence باشد، آن تابع با پارامتر اول continuation callback صدا زده می‌شود، و پارامترهای بعدی پیام‌هایی هستند که از step قبلی آمده‌اند. step تا وقتی continuation callback صدا زده نشود کامل نمی‌شود. وقتی صدا زده شد، هر آرگومانی که به آن بدهید به step بعدی sequence فرستاده می‌شود.

برای اضافه کردن step عادی جدید، `then(..)` را صدا می‌زنید (از نظر semantics تقریباً مشابه خود `ASQ(..)`):

```js
ASQ(
	// step 1
	function(done){
		setTimeout( function(){
			done( "Hello" );
		}, 100 );
	},
	// step 2
	function(done,greeting) {
		setTimeout( function(){
			done( greeting + " World" );
		}, 100 );
	}
)
// step 3
.then( function(done,msg){
	setTimeout( function(){
		done( msg.toUpperCase() );
	}, 100 );
} )
// step 4
.then( function(done,msg){
	console.log( msg );			// HELLO WORLD
} );
```

**نکته:** هرچند نام `then(..)` با Promise API بومی یکسان است، این `then(..)` متفاوت است. می‌توانید هر تعداد تابع/مقدار که بخواهید به `then(..)` بدهید و هرکدام step جدا محسوب می‌شوند. semantics دو callback fulfillment/rejection اینجا وجود ندارد.

برخلاف Promise که برای chain کردن Promise بعدی باید آن Promise را از fulfillment handler مربوط به `then(..)` بسازید و `return` کنید، در *asynquence* فقط continuation callback (من معمولاً اسمش را `done()` می‌گذارم) را صدا می‌زنید و اگر خواستید پیام completion را آرگومان می‌دهید.

هر step تعریف‌شده با `then(..)` پیش‌فرض async فرض می‌شود. اگر step شما sync است، یا می‌توانید `done(..)` را فوری صدا بزنید، یا از helper ساده‌تر `val(..)` استفاده کنید:

```js
// step 1 (sync)
ASQ( function(done){
	done( "Hello" );	// manually synchronous
} )
// step 2 (sync)
.val( function(greeting){
	return greeting + " World";
} )
// step 3 (async)
.then( function(done,msg){
	setTimeout( function(){
		done( msg.toUpperCase() );
	}, 100 );
} )
// step 4 (sync)
.val( function(msg){
	console.log( msg );
} );
```

همان‌طور که می‌بینید stepهای `val(..)` continuation callback نمی‌گیرند، چون این بخش برایتان فرض شده است -- در نتیجه لیست پارامترها تمیزتر می‌شود. برای ارسال پیام به step بعدی کافی است `return` کنید.

`val(..)` را به‌عنوان step همزمان‌سازِ «value-only» ببینید؛ مناسب برای عملیات sync روی مقدار، log کردن و موارد مشابه.

### خطاها

یک تفاوت مهم *asynquence* با Promise بومی، مدل مدیریت خطاست.

در Promise، هر Promise (هر step) در chain می‌تواند خطای مستقل خودش را داشته باشد و step بعدی می‌تواند آن خطا را handle کند یا نه. دلیل اصلی این semantics دوباره همان تمرکز روی Promise تکی است، نه کل chain/sequence.

من معتقدم در بیشتر مواقع خطا در یک بخش sequence عموماً قابل بازیابی نیست، پس stepهای بعدی عملاً بی‌معنا هستند و باید رد شوند. بنابراین پیش‌فرض این است: خطا در هر step کل sequence را وارد error mode می‌کند و بقیه stepهای عادی نادیده گرفته می‌شوند.

اگر *واقعاً* لازم باشد stepی خطاپذیر ولی قابل بازیابی داشته باشید، چند متد API دارید؛ مثل `try(..)` (stepی شبیه `try..catch`) یا `until(..)` (حلقه‌ی retry تا موفقیت یا `break()` دستی). *asynquence* حتی `pThen(..)` و `pCatch(..)` هم دارد که دقیقاً مثل Promise `then(..)` و `catch(..)` کار می‌کنند، پس اگر بخواهید می‌توانید وسط sequence هم مدیریت خطای موضعی داشته باشید.

نکته این است که هر دو گزینه را دارید، ولی تجربه‌ی من می‌گوید حالت پیش‌فرض معمول‌تر است. در Promise اگر بخواهید بعد از خطا کل chain بقیه stepها را رد کند، باید مراقب باشید هیچ rejection handlerای در stepها ثبت نکنید؛ وگرنه خطا swallowed-as-handled می‌شود و sequence شاید (ناخواسته) ادامه پیدا کند. مدیریت درست این رفتار کمی awkward است.

برای ثبت error notification handler روی sequence، *asynquence* متد `or(..)` را می‌دهد (alias آن `onerror(..)` است). هرجای sequence می‌توانید صدا بزنید و هر تعداد handler که بخواهید ثبت کنید. این باعث می‌شود چند مصرف‌کننده‌ی مختلف به یک sequence گوش بدهند تا بفهمند fail شده یا نه؛ شبیه error event handler.

مثل Promise، هر JS exception هم sequence error می‌شود، یا می‌توانید برنامه‌ای خطا را سیگنال کنید:

```js
var sq = ASQ( function(done){
	setTimeout( function(){
		// signal an error for the sequence
		done.fail( "Oops" );
	}, 100 );
} )
.then( function(done){
	// will never get here
} )
.or( function(err){
	console.log( err );			// Oops
} )
.then( function(done){
	// won't get here either
} );

// later

sq.or( function(err){
	console.log( err );			// Oops
} );
```

تفاوت خیلی مهم دیگر نسبت به Promise بومی: رفتار پیش‌فرض "unhandled exceptions". همان‌طور که در فصل ۳ مفصل دیدیم، Promise rejected بدون rejection handler فقط بی‌صدا خطا را نگه می‌دارد؛ باید یادتان باشد chain را با `catch(..)` تمام کنید.

در *asynquence* پیش‌فرض برعکس است.

اگر خطا در sequence رخ بدهد و **در همان لحظه** هیچ error handlerی ثبت نشده باشد، خطا به `console` گزارش می‌شود. یعنی unhandled rejectionها پیش‌فرض report می‌شوند تا swallowed و گم نشوند.

به‌محض اینکه error handler روی sequence ثبت کنید، sequence از این گزارش‌دهی opt-out می‌شود تا نویز تکراری نگیرید.

ممکن است واقعاً caseهایی باشد که sequence را بسازید ولی قبل از فرصت ثبت handler وارد error state شود. این حالت رایج نیست، اما رخ می‌دهد.

در این حالت می‌توانید instance sequence را با `defer()` از گزارش‌دهی خطا **opt-out** کنید. فقط وقتی این کار را بکنید که مطمئن باشید خطا را بعداً واقعاً handle می‌کنید:

```js
var sq1 = ASQ( function(done){
	doesnt.Exist();			// will throw exception to console
} );

var sq2 = ASQ( function(done){
	doesnt.Exist();			// will throw only a sequence error
} )
// opt-out of error reporting
.defer();

setTimeout( function(){
	sq1.or( function(err){
		console.log( err );	// ReferenceError
	} );

	sq2.or( function(err){
		console.log( err );	// ReferenceError
	} );
}, 100 );

// ReferenceError (from sq1)
```

این رفتار از Promise بهتر است چون Pit of Success است نه Pit of Failure (فصل ۳).

**نکته:** اگر یک sequence داخل sequence دیگر pipe/subsume شود (بخش "Combining Sequences" را ببینید)، sequence مبدا از error-reporting opt-out می‌شود، و آن‌وقت باید وضعیت گزارش‌دهی sequence مقصد را در نظر بگیرید.

### Stepهای موازی

همه stepهای sequence فقط یک task async ندارند؛ بعضی باید چند substep را «موازی» (concurrent) اجرا کنند. stepی در sequence که چند substep concurrent دارد `gate(..)` نامیده می‌شود -- اگر دوست دارید alias `all(..)` هم هست -- و مستقیماً متناظر `Promise.all([..])` بومی است.

اگر همه‌ی stepهای داخل `gate(..)` موفق تمام شوند، تمام پیام‌های موفقیت به step بعدی sequence می‌روند. اگر هرکدام خطا بدهند، کل sequence فوراً وارد error state می‌شود.

```js
ASQ( function(done){
	setTimeout( done, 100 );
} )
.gate(
	function(done){
		setTimeout( function(){
			done( "Hello" );
		}, 100 );
	},
	function(done){
		setTimeout( function(){
			done( "World", "!" );
		}, 100 );
	}
)
.val( function(msg1,msg2){
	console.log( msg1 );	// Hello
	console.log( msg2 );	// [ "World", "!" ]
} );
```

برای مقایسه، نسخه‌ی مشابه با Promise بومی:

```js
new Promise( function(resolve,reject){
	setTimeout( resolve, 100 );
} )
.then( function(){
	return Promise.all( [
		new Promise( function(resolve,reject){
			setTimeout( function(){
				resolve( "Hello" );
			}, 100 );
		} ),
		new Promise( function(resolve,reject){
			setTimeout( function(){
				// note: we need a [ ] array here
				resolve( [ "World", "!" ] );
			}, 100 );
		} )
	] );
} )
.then( function(msgs){
	console.log( msgs[0] );	// Hello
	console.log( msgs[1] );	// [ "World", "!" ]
} );
```

واقعاً شلوغ است. Promise برای بیان همین flow-control async boilerplate بیشتری می‌خواهد. همین نمونه نشان می‌دهد abstraction و API *asynquence* کار با stepهای Promise-like را خیلی راحت‌تر می‌کند؛ هرچه ناهمگامی پیچیده‌تر شود این مزیت بیشتر می‌شود.

#### variationهای Step

در contrib pluginهای *asynquence* چند variation روی نوع step `gate(..)` دارید که خیلی کاربردی‌اند:

* `any(..)` مثل `gate(..)` است، با این تفاوت که فقط یک segment کافی است نهایتاً موفق شود تا sequence ادامه یابد.
* `first(..)` مثل `any(..)` است، اما به‌محض موفقیت اولین segment، sequence اصلی ادامه می‌دهد (نتایج بعدی segmentهای دیگر نادیده گرفته می‌شود).
* `race(..)` (متناظر `Promise.race([..])`) مثل `first(..)` است، اما sequence اصلی به‌محض اتمام هر segment (موفق یا ناموفق) ادامه می‌دهد.
* `last(..)` مثل `any(..)` است، اما فقط آخرین segment موفق، پیام(ها) را به sequence اصلی می‌فرستد.
* `none(..)` معکوس `gate(..)` است: sequence اصلی فقط وقتی ادامه می‌یابد که همه segmentها fail شوند (پیام‌های خطا به success transposed می‌شوند و برعکس).

اول چند helper برای تمیزتر شدن مثال:

```js
function success1(done) {
	setTimeout( function(){
		done( 1 );
	}, 100 );
}

function success2(done) {
	setTimeout( function(){
		done( 2 );
	}, 100 );
}

function failure3(done) {
	setTimeout( function(){
		done.fail( 3 );
	}, 100 );
}

function output(msg) {
	console.log( msg );
}
```

حالا نمایش variationهای `gate(..)`:

```js
ASQ().race(
	failure3,
	success1
)
.or( output );		// 3


ASQ().any(
	success1,
	failure3,
	success2
)
.val( function(){
	var args = [].slice.call( arguments );
	console.log(
		args		// [ 1, undefined, 2 ]
	);
} );


ASQ().first(
	failure3,
	success1,
	success2
)
.val( output );		// 1


ASQ().last(
	failure3,
	success1,
	success2
)
.val( output );		// 2

ASQ().none(
	failure3
)
.val( output )		// 3
.none(
	failure3
	success1
)
.or( output );		// 1
```

variation دیگر `map(..)` است که اجازه می‌دهد عناصر یک آرایه را async به مقدارهای جدید map کنید، و step تا completion همه‌ی mappingها جلو نمی‌رود. `map(..)` خیلی شبیه `gate(..)` است، با این تفاوت که مقادیر اولیه را از آرایه می‌گیرد (نه تابع‌های جداگانه) و یک callback واحد روی هر مقدار اجرا می‌شود:

```js
function double(x,done) {
	setTimeout( function(){
		done( x * 2 );
	}, 100 );
}

ASQ().map( [1,2,3], double )
.val( output );					// [2,4,6]
```

همچنین `map(..)` می‌تواند هرکدام از دو پارامترش (آرایه یا callback) را از پیام‌های step قبلی بگیرد:

```js
function plusOne(x,done) {
	setTimeout( function(){
		done( x + 1 );
	}, 100 );
}

ASQ( [1,2,3] )
.map( double )			// message `[1,2,3]` comes in
.map( plusOne )			// message `[2,4,6]` comes in
.val( output );			// [3,5,7]
```

variation دیگر `waterfall(..)` است که ترکیبی از جمع‌آوری پیام در `gate(..)` و پردازش ترتیبی در `then(..)` محسوب می‌شود.

step 1 اجرا می‌شود، پیام موفقیت آن به step 2 می‌رود، بعد هر دو پیام موفقیت به step 3 می‌روند، بعد هر سه پیام به step 4، و همین‌طور ادامه؛ پیام‌ها مثل آبشار جمع می‌شوند و پایین می‌آیند.

```js
function double(done) {
	var args = [].slice.call( arguments, 1 );
	console.log( args );

	setTimeout( function(){
		done( args[args.length - 1] * 2 );
	}, 100 );
}

ASQ( 3 )
.waterfall(
	double,					// [ 3 ]
	double,					// [ 6 ]
	double,					// [ 6, 12 ]
	double					// [ 6, 12, 24 ]
)
.val( function(){
	var args = [].slice.call( arguments );
	console.log( args );	// [ 6, 12, 24, 48 ]
} );
```

اگر در هر نقطه‌ی آبشار خطا رخ دهد، کل sequence فوراً وارد error state می‌شود.

#### تحمل خطا

گاهی می‌خواهید خطا را در سطح step مدیریت کنید و نگذارید لزوماً کل sequence error شود. *asynquence* دو variation step برای این کار دارد.

`try(..)` یک step را امتحان می‌کند؛ اگر موفق شود sequence عادی ادامه می‌یابد، اگر fail شود failure به پیام موفقیت با فرم `{ catch: .. }` تبدیل می‌شود که پیام(های) خطا داخلش قرار می‌گیرند:

```js
ASQ()
.try( success1 )
.val( output )			// 1
.try( failure3 )
.val( output )			// { catch: 3 }
.or( function(err){
	// never gets here
} );
```

به‌جایش می‌توانید loop retry با `until(..)` بسازید که step را اجرا کند و اگر fail شد در tick بعدی event loop دوباره تلاش کند و همین‌طور ادامه دهد.

این loop می‌تواند بی‌نهایت ادامه یابد، اما اگر بخواهید خارج شوید، روی completion trigger متد `break()` می‌زنید که sequence اصلی را وارد error state می‌کند:

```js
var count = 0;

ASQ( 3 )
.until( double )
.val( output )					// 6
.until( function(done){
	count++;

	setTimeout( function(){
		if (count < 5) {
			done.fail();
		}
		else {
			// break out of the `until(..)` retry loop
			done.break( "Oops" );
		}
	}, 100 );
} )
.or( output );					// Oops
```

#### Stepهای سبک Promise

اگر ترجیح می‌دهید وسط sequence semantics سبک Promise مثل `then(..)` و `catch(..)` داشته باشید، پلاگین‌های `pThen` و `pCatch` را می‌توانید استفاده کنید:

```js
ASQ( 21 )
.pThen( function(msg){
	return msg * 2;
} )
.pThen( output )				// 42
.pThen( function(){
	// throw an exception
	doesnt.Exist();
} )
.pCatch( function(err){
	// caught the exception (rejection)
	console.log( err );			// ReferenceError
} )
.val( function(){
	// main sequence is back in a
	// success state because previous
	// exception was caught by
	// `pCatch(..)`
} );
```

`pThen(..)` و `pCatch(..)` طوری طراحی شده‌اند که داخل sequence اجرا شوند اما رفتارشان مثل Promise chain عادی باشد. بنابراین می‌توانید از fulfillment handler مربوط به `pThen(..)` یا Promise واقعی resolve کنید یا sequenceهای *asynquence* (فصل ۳).

### Fork کردن Sequence

یک قابلیت مفید Promise این است که می‌توانید چند `then(..)` روی همان Promise ثبت کنید و flow-control را عملاً «fork» کنید:

```js
var p = Promise.resolve( 21 );

// fork 1 (from `p`)
p.then( function(msg){
	return msg * 2;
} )
.then( function(msg){
	console.log( msg );		// 42
} )

// fork 2 (from `p`)
p.then( function(msg){
	console.log( msg );		// 21
} );
```

همین «fork» در *asynquence* با `fork()` خیلی ساده است:

```js
var sq = ASQ(..).then(..).then(..);

var sq2 = sq.fork();

// fork 1
sq.then(..)..;

// fork 2
sq2.then(..)..;
```

### ترکیب Sequenceها

برعکس `fork()`، می‌توانید دو sequence را با subsume کردن یکی در دیگری ترکیب کنید، با متد instanceی `seq(..)`:

```js
var sq = ASQ( function(done){
	setTimeout( function(){
		done( "Hello World" );
	}, 200 );
} );

ASQ( function(done){
	setTimeout( done, 100 );
} )
// subsume `sq` sequence into this sequence
.seq( sq )
.val( function(msg){
	console.log( msg );		// Hello World
} )
```

`seq(..)` می‌تواند خود sequence بگیرد (مثل همینجا)، یا یک تابع. اگر تابع باشد، انتظار می‌رود وقتی صدا زده می‌شود sequence برگرداند، پس کد بالا می‌توانست این‌طور هم باشد:

```js
// ..
.seq( function(){
	return sq;
} )
// ..
```

همچنین این step را می‌شد با `pipe(..)` هم انجام داد:

```js
// ..
.then( function(done){
	// pipe `sq` into the `done` continuation callback
	sq.pipe( done );
} )
// ..
```

وقتی sequence subsume می‌شود، هم success message stream و هم error stream آن pipe می‌شود.

**نکته:** همان‌طور که قبلاً گفتیم، pipe کردن (دستی با `pipe(..)` یا خودکار با `seq(..)`) sequence مبدا را از error-reporting opt-out می‌کند، اما وضعیت گزارش‌دهی خطای sequence مقصد را تغییر نمی‌دهد.
