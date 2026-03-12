# واکنش‌گرای رویدادمحور

باید از (حداقل!) فصل ۳ واضح شده باشد که Promiseها ابزار بسیار قدرتمندی در جعبه‌ابزار async شما هستند. اما یک ضعف روشن دارند: Promise فقط یک‌بار resolve می‌شود و برای مدیریت جریان پیوسته‌ی رویدادها مناسب نیست. صادقانه بگوییم همین ضعف، در sequenceهای ساده‌ی *asynquence* هم وجود دارد.

سناریویی را در نظر بگیرید که می‌خواهید هر بار یک رویداد خاص رخ داد، مجموعه‌ای از مراحل اجرا شود. یک Promise یا sequence واحد نمی‌تواند همه‌ی رخدادهای آن رویداد را نمایش دهد. پس مجبور می‌شوید برای *هر بار* رخداد، یک Promise chain (یا sequence) جدید بسازید، مثلاً:

```js
listener.on( "foobar", function(data){

	// create a new event handling promise chain
	new Promise( function(resolve,reject){
		// ..
	} )
	.then( .. )
	.then( .. );

} );
```

این رویکرد قابلیت پایه‌ی موردنیاز را دارد، اما راه خوش‌ساختی برای بیان منطق مدنظر ما نیست. اینجا دو قابلیت جدا با هم قاطی شده‌اند: گوش‌دادن به رویداد، و پاسخ‌دادن به رویداد. اصل separation of concerns می‌گوید بهتر است این‌ها را از هم جدا کنیم.

خواننده‌ی دقیق متوجه می‌شود این مسئله تا حدی متقارن با مشکلات callbackها در فصل ۲ است؛ نوعی inversion of control محسوب می‌شود.

حالا تصور کنید این پارادایم را از حالت وارونه خارج کنیم، مثل این:

```js
var observable = listener.on( "foobar" );

// later
observable
.then( .. )
.then( .. );

// elsewhere
observable
.then( .. )
.then( .. );
```

مقدار `observable` دقیقاً Promise نیست، اما می‌توان آن را مشابه Promise *observe* کرد، پس ارتباط نزدیکی دارد. در واقع می‌توان بارها آن را observe کرد و هر بار که رویدادش (`"foobar"`) رخ دهد، اعلان جدید می‌فرستد.

**نکته:** الگویی که همین‌جا نشان دادم، یک **بیش‌ازحد ساده‌سازی‌شده‌ی بزرگ** از مفاهیم و انگیزه‌های برنامه‌نویسی واکنش‌گرا (RP) است که پروژه‌ها و زبان‌های خوبی آن را پیاده‌سازی/تبیین کرده‌اند. یکی از گونه‌های RP، برنامه‌نویسی واکنش‌گرای تابعی (FRP) است؛ یعنی به‌کارگیری تکنیک‌های برنامه‌نویسی تابعی (immutability، referential integrity و ...) روی جریان‌های داده. واژه‌ی «Reactive» به پخش‌کردن این رفتار در بُعد زمان و در پاسخ به رویدادها اشاره دارد. اگر علاقه‌مندید، «Reactive Observables» را در کتابخانه‌ی فوق‌العاده‌ی «Reactive Extensions» مایکروسافت (RxJS برای JavaScript) مطالعه کنید: http://rxjs.codeplex.com/  . این کتابخانه بسیار پیشرفته‌تر و قدرتمندتر از چیزی است که من اینجا نشان داده‌ام. همچنین Andre Staltz یک نوشته‌ی عالی دارد که RP را خیلی عملی با مثال‌های ملموس توضیح می‌دهد: https://gist.github.com/staltz/868e7e9bc2a7b8c1f754

### Observableهای ES7

در زمان نگارش این متن، یک پیشنهاد اولیه برای ES7 وجود دارد که نوع داده‌ی جدیدی به نام «Observable» معرفی می‌کند: https://github.com/jhusain/asyncgenerator#introducing-observable  
این ایده از نظر روح کلی شبیه چیزی است که گفتیم، اما قطعاً پیچیده‌تر و کامل‌تر است.

در این مدل Observable، روش subscribe کردن به رویدادهای یک stream این است که یک generator بدهید -- در واقع طرفی که اهمیت دارد *iterator* است -- و برای هر رویداد، متد `next(..)` آن فراخوانی شود.

می‌توانید چیزی شبیه این را تصور کنید:

```js
// `someEventStream` is a stream of events, like from
// mouse clicks, and the like.

var observer = new Observer( someEventStream, function*(){
	while (var evt = yield) {
		console.log( evt );
	}
} );
```

Generatorی که پاس می‌دهید با `yield` حلقه‌ی `while` را متوقف می‌کند تا رویداد بعدی برسد. *Iterator* متصل به instance آن generator، هر بار که `someEventStream` رویداد جدیدی منتشر کند `next(..)` می‌شود، و داده‌ی رویداد (`evt`) باعث از سرگیری generator/*iterator* شما خواهد شد.

در قابلیت subscription به رویدادها، آنچه واقعاً مهم است بخش *iterator* است، نه خود generator. بنابراین از نظر مفهومی می‌توان تقریباً هر iterableای را پاس داد، از جمله *iterable sequence*های `ASQ.iterable()`.

جالب اینکه adapterهایی هم پیشنهاد شده‌اند که ساخت Observable از برخی streamها را ساده می‌کنند؛ مثلاً `fromEvent(..)` برای رویدادهای DOM. اگر پیاده‌سازی پیشنهادی `fromEvent(..)` را در همان proposal ببینید، خیلی شبیه `ASQ.react(..)`ی است که در بخش بعد می‌بینیم.

البته همه‌ی این‌ها هنوز proposalهای اولیه‌اند و خروجی نهایی ممکن است از این چیزی که اینجا دیدیم متفاوت باشد. اما دیدن هم‌راستایی اولیه‌ی ایده‌ها بین کتابخانه‌ها و proposalهای زبان واقعاً هیجان‌انگیز است.

### Sequenceهای واکنش‌گرا

با الهام از همین مرور خیلی کوتاه Observableها (و F/RP)، حالا یک adaptation از زیرمجموعه‌ی کوچکی از «Reactive Observables» را نشان می‌دهم که اسمش را «Reactive Sequences» می‌گذارم.

اول ببینیم چطور با utility پلاگینی در *asynquence* به نام `react(..)` یک Observable می‌سازیم:

```js
var observable = ASQ.react( function setup(next){
	listener.on( "foobar", next );
} );
```

حالا ببینیم چطور یک sequence تعریف می‌کنیم که به این `observable` «واکنش» نشان دهد -- در F/RP معمولاً به این کار می‌گویند subscribe شدن:

```js
observable
.seq( .. )
.then( .. )
.val( .. );
```

پس خیلی ساده sequence را از Observable زنجیر می‌کنید. راحت بود، نه؟

در F/RP، stream رویدادها معمولاً از مجموعه‌ای از transformهای تابعی مثل `scan(..)`، `map(..)`، `reduce(..)` و ... عبور می‌کند. در reactive sequenceها، هر رویداد از یک instance تازه از sequence عبور می‌کند. یک مثال ملموس‌تر:

```js
ASQ.react( function setup(next){
	document.getElementById( "mybtn" )
	.addEventListener( "click", next, false );
} )
.seq( function(evt){
	var btnID = evt.target.id;
	return request(
		"http://some.url.1/?id=" + btnID
	);
} )
.val( function(text){
	console.log( text );
} );
```

بخش «reactive» در reactive sequence از آنجا می‌آید که یک یا چند event handler را برای فراخوانی trigger رویداد (یعنی `next(..)`) ثبت می‌کنیم.

بخش «sequence» هم دقیقاً مثل sequenceهایی است که تا اینجا دیدیم: هر مرحله می‌تواند هر تکنیک async مناسبی باشد؛ از continuation callback گرفته تا Promise و generator.

وقتی یک reactive sequence را تنظیم کنید، تا زمانی که رویدادها رخ می‌دهند، instanceهای جدید sequence را راه‌اندازی می‌کند. اگر بخواهید متوقفش کنید، می‌توانید `stop()` را صدا بزنید.

اگر reactive sequence را `stop()` کنید، احتمالاً می‌خواهید event handler(ها) هم deregister شوند. برای همین منظور می‌توانید teardown handler ثبت کنید:

```js
var sq = ASQ.react( function setup(next,registerTeardown){
	var btn = document.getElementById( "mybtn" );

	btn.addEventListener( "click", next, false );

	// will be called once `sq.stop()` is called
	registerTeardown( function(){
		btn.removeEventListener( "click", next, false );
	} );
} )
.seq( .. )
.then( .. )
.val( .. );

// later
sq.stop();
```

**نکته:** ارجاع `this` داخل handler `setup(..)` همان reactive sequence (`sq`) است، پس می‌توانید با `this` تعریف reactive sequence را گسترش دهید، متدهایی مثل `stop()` را صدا بزنید و ...

یک مثال از دنیای Node.js ببینید که reactive sequence را برای مدیریت درخواست‌های HTTP ورودی به‌کار می‌گیرد:

```js
var server = http.createServer();
server.listen(8000);

// reactive observer
var request = ASQ.react( function setup(next,registerTeardown){
	server.addListener( "request", next );
	server.addListener( "close", this.stop );

	registerTeardown( function(){
		server.removeListener( "request", next );
		server.removeListener( "close", request.stop );
	} );
});

// respond to requests
request
.seq( pullFromDatabase )
.val( function(data,res){
	res.end( data );
} );

// node teardown
process.on( "SIGINT", request.stop );
```

Trigger `next(..)` به‌راحتی می‌تواند با streamهای Node هم سازگار شود، با `onStream(..)` و `unStream(..)`:

```js
ASQ.react( function setup(next){
	var fstream = fs.createReadStream( "/some/file" );

	// pipe the stream's "data" event to `next(..)`
	next.onStream( fstream );

	// listen for the end of the stream
	fstream.on( "end", function(){
		next.unStream( fstream );
	} );
} )
.seq( .. )
.then( .. )
.val( .. );
```

همچنین می‌توانید با ترکیب sequenceها چند جریان reactive sequence را compose کنید:

```js
var sq1 = ASQ.react( .. ).seq( .. ).then( .. );
var sq2 = ASQ.react( .. ).seq( .. ).then( .. );

var sq3 = ASQ.react(..)
.gate(
	sq1,
	sq2
)
.then( .. );
```

نکته‌ی اصلی این است که `ASQ.react(..)` یک adaptation سبک از مفاهیم F/RP است که اتصال stream رویداد به sequence را ممکن می‌کند؛ به همین دلیل هم به آن «reactive sequence» می‌گوییم. reactive sequenceها معمولاً برای استفاده‌های واکنش‌گرای پایه، کاملاً کفایت دارند.

**نکته:** اینجا یک نمونه از استفاده‌ی `ASQ.react(..)` برای مدیریت وضعیت UI آمده است: http://jsbin.com/rozipaki/6/edit?js,output  
و یک نمونه‌ی دیگر برای مدیریت streamهای request/response در HTTP: https://gist.github.com/getify/bba5ec0de9d6047b720e
