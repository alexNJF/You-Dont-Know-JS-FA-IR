# Promiseها و Callbackها

من فکر می‌کنم sequenceهای *asynquence* روی Promise بومی ارزش زیادی اضافه می‌کنند، و در بیشتر موارد کار در آن سطح abstraction هم خوشایندتر است هم قدرتمندتر. با این حال، ادغام *asynquence* با کدهای دیگرِ غیر-*asynquence* واقعیتی اجتناب‌ناپذیر است.

به‌راحتی می‌توانید یک Promise (یا thenable؛ فصل ۳) را با متد instanceی `promise(..)` داخل sequence subsume کنید:

```js
var p = Promise.resolve( 42 );

ASQ()
.promise( p )			// could also: `function(){ return p; }`
.val( function(msg){
	console.log( msg );	// 42
} );
```

و برای رفتن در جهت برعکس، یعنی fork/vend کردن یک Promise از یک sequence در step خاص، پلاگین contrib به نام `toPromise` را استفاده کنید:

```js
var sq = ASQ.after( 100, "Hello World" );

sq.toPromise()
// this is a standard promise chain now
.then( function(msg){
	return msg.toUpperCase();
} )
.then( function(msg){
	console.log( msg );		// HELLO WORLD
} );
```

برای تطبیق *asynquence* با سیستم‌های callbackمحور چند helper وجود دارد. برای اینکه از sequence شما خودکار یک callback سبک error-first ساخته شود و به utility callbackمحور وصل شود، از `errfcb` استفاده کنید:

```js
var sq = ASQ( function(done){
	// note: expecting "error-first style" callback
	someAsyncFuncWithCB( 1, 2, done.errfcb )
} )
.val( function(msg){
	// ..
} )
.or( function(err){
	// ..
} );

// note: expecting "error-first style" callback
anotherAsyncFuncWithCB( 1, 2, sq.errfcb() );
```

همچنین ممکن است بخواهید نسخه‌ی sequence-wrapped از یک utility بسازید -- شبیه "promisory" در فصل ۳ و "thunkory" در فصل ۴ -- که *asynquence* برایش `ASQ.wrap(..)` را می‌دهد:

```js
var coolUtility = ASQ.wrap( someAsyncFuncWithCB );

coolUtility( 1, 2 )
.val( function(msg){
	// ..
} )
.or( function(err){
	// ..
} );
```

**نکته:** برای وضوح (و کمی سرگرمی!) یک اصطلاح دیگر هم بسازیم برای تابع sequence-producingی که از `ASQ.wrap(..)` می‌آید (مثل `coolUtility` اینجا): پیشنهاد من "sequory" است (`sequence` + `factory`).
