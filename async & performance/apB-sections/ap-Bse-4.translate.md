# پردازش‌های ترتیبیِ ارتباطی (CSP)

«Communicating Sequential Processes» یا به‌اختصار CSP، نخستین‌بار توسط C. A. R. Hoare در مقاله‌ای دانشگاهی در سال ۱۹۷۸ معرفی شد (http://dl.acm.org/citation.cfm?doid=359576.359585)، و بعدتر در کتابی با همین نام در سال ۱۹۸۵ بسط پیدا کرد (http://www.usingcsp.com/). CSP یک روش صوری برای تعامل (یا «ارتباط») میان «پردازش»های هم‌زمان در حین اجرا توصیف می‌کند.

احتمالاً یادتان هست در فصل ۱ هم پردازش‌های هم‌زمان را بررسی کردیم؛ بنابراین این بحث CSP بر همان درک قبلی بنا می‌شود.

مثل بسیاری از مفاهیم مهم علوم کامپیوتر، CSP به‌شدت آکادمیک و صوری است و معمولاً در قالب جبر پردازش بیان می‌شود. اما بعید می‌دانم قضیه‌های جبری نمادین در عمل کمک زیادی به خواننده بکنند، پس بهتر است راه شهودی‌تری برای فهمش پیدا کنیم.

شرح رسمی و اثبات CSP را می‌گذارم برای نوشته‌های Hoare و آثار فوق‌العاده‌ی دیگری که بعد از آن منتشر شده‌اند. اینجا فقط می‌خواهیم ایده‌ی CSP را کوتاه، غیرآکادمیک و تا حد ممکن شهودی توضیح بدهیم.

### پیام‌رسانی

اصل مرکزی در CSP این است که تمام ارتباط/تعامل بین پردازش‌های مستقل باید از طریق پیام‌رسانی صوری انجام شود. شاید برخلاف انتظار شما، پیام‌رسانی در CSP یک عمل همگام (synchronous) تعریف می‌شود؛ یعنی فرستنده و گیرنده باید هر دو آماده باشند تا پیام رد و بدل شود.

چطور ممکن است چنین پیام‌رسانی همگامی به برنامه‌نویسی ناهمگام در JavaScript مربوط شود؟

رابطه‌ی عملی از اینجا می‌آید که generatorهای ES6 می‌توانند عملیاتی sync-نما بسازند که در پشت‌صحنه واقعاً ممکن است هم sync باشند و هم (محتمل‌تر) async.

به بیان دیگر، دو یا چند generator که هم‌زمان اجرا می‌شوند می‌توانند ظاهراً به‌شکل همگام به هم پیام بدهند، در حالی‌که ناهمگامی بنیادی سیستم حفظ می‌شود؛ چون کد هر generator برای ازسرگیری یک عمل async متوقف (یا block) می‌ماند.

این مکانیزم چطور کار می‌کند؟

تصور کنید generatorای (یا «process»ی) به نام "A" می‌خواهد به generator "B" پیام بفرستد. اول "A" پیام را `yield` می‌کند (در نتیجه "A" متوقف می‌شود) تا به "B" برسد. وقتی "B" آماده شد و پیام را گرفت، "A" از حالت block خارج و resume می‌شود.

متقارن با آن، تصور کنید generator "A" می‌خواهد از "B" پیام بگیرد. "A" درخواستش را `yield` می‌کند (پس متوقف می‌شود) و وقتی "B" پیام را بفرستد، "A" پیام را دریافت می‌کند و resume می‌شود.

یکی از شناخته‌شده‌ترین صورت‌بندی‌های نظریه‌ی پیام‌رسانی CSP، از کتابخانه‌ی core.async در ClojureScript و همین‌طور زبان *go* می‌آید. این نسخه‌های CSP معناشناسی ارتباطی بالا را در یک گذرگاه بین پردازش‌ها پیاده می‌کنند که به آن «کانال» (*channel*) می‌گویند.

**نکته:** واژه‌ی *channel* تا حدی به این دلیل استفاده می‌شود که در برخی حالت‌ها می‌توان بیش از یک مقدار را هم‌زمان به «بافر» کانال فرستاد؛ چیزی شبیه stream. اینجا وارد جزئیاتش نمی‌شویم، اما برای مدیریت جریان داده می‌تواند تکنیک بسیار قدرتمندی باشد.

در ساده‌ترین تصویر از CSP، کانالی که بین "A" و "B" می‌سازیم متدی مثل `take(..)` برای block شدن و دریافت مقدار دارد، و متدی مثل `put(..)` برای block شدن و ارسال مقدار.

شکلش می‌تواند این‌طور باشد:

```js
var ch = channel();

function *foo() {
	var msg = yield take( ch );

	console.log( msg );
}

function *bar() {
	yield put( ch, "Hello World" );

	console.log( "message sent" );
}

run( foo );
run( bar );
// Hello World
// "message sent"
```

این تعامل ساخت‌یافته و sync-نما در پیام‌رسانی را با اشتراک پیام غیررسمی/نامنظم `ASQ#runner(..)` مقایسه کنید که با آرایه‌ی `token.messages` و `yield` تعاونی انجام می‌شود. در اصل، `yield put(..)` یک عملیات واحد است که هم مقدار را می‌فرستد و هم اجرا را pause می‌کند تا کنترل جابه‌جا شود، در حالی‌که در مثال‌های قبلی این‌ها را در دو گام جدا انجام می‌دادیم.

علاوه بر این، CSP تأکید می‌کند که شما عملاً «کنترل را منتقل» نمی‌کنید؛ بلکه routineهای هم‌زمان را طوری طراحی می‌کنید که یا برای دریافت مقدار از کانال block شوند، یا برای تلاش جهت ارسال پیام روی کانال block شوند. همین block شدن هنگام دریافت/ارسال پیام، سازوکار هماهنگ‌کردن ترتیب رفتار بین coroutineهاست.

**نکته:** هشدار دوستانه: این الگو بسیار قدرتمند است، اما در شروع کمی ذهن را به‌هم می‌ریزد. لازم است کمی با آن تمرین کنید تا به این مدل جدید فکرکردن برای هماهنگ‌سازی هم‌زمانی عادت کنید.

چند کتابخانه‌ی عالی این flavor از CSP را در JavaScript پیاده کرده‌اند که مهم‌ترینشان "js-csp" است (https://github.com/ubolonton/js-csp). James Long هم فورکی از آن دارد (https://github.com/jlongster/js-csp) و مفصل درباره‌اش نوشته است (http://jlongster.com/Taming-the-Asynchronous-Beast-with-CSP-in-JavaScript). همچنین واقعاً باید روی نوشته‌های فوق‌العاده‌ی David Nolen (http://twitter.com/swannodette) درباره‌ی تطبیق CSP سبک go/core.async در ClojureScript با generatorهای JS تأکید کرد: http://swannodette.github.io/2013/08/24/es6-generators-and-csp

### شبیه‌سازی CSP در asynquence

چون کل این پیوست درباره‌ی الگوهای async در بستر کتابخانه‌ی *asynquence* است، احتمالاً برایتان جالب است که می‌توانیم نسبتاً راحت یک لایه‌ی شبیه‌ساز روی مدیریت generator در `ASQ#runner(..)` اضافه کنیم که تقریباً پورت کاملی از API و رفتار CSP بدهد. این لایه‌ی شبیه‌سازی به‌صورت اختیاری همراه *asynquence* در بسته‌ی "asynquence-contrib" ارائه می‌شود.

خیلی شبیه helper `state(..)` در بخش قبل، `ASQ.csp.go(..)` یک generator می‌گیرد -- در اصطلاح go/core.async به آن goroutine می‌گویند -- و با برگرداندن generator جدید، آن را برای استفاده در `ASQ#runner(..)` سازگار می‌کند.

به‌جای اینکه `token` بگیرید، goroutine شما یک کانال اولیه (`ch`) می‌گیرد که همه‌ی goroutineهای این اجرا آن را به اشتراک می‌گذارند. با `ASQ.csp.chan(..)` می‌توانید کانال‌های بیشتری هم بسازید (که در عمل خیلی هم مفید است).

در CSP، همه‌ی ناهمگامی را بر حسب block شدن روی پیام‌های کانال مدل می‌کنیم، نه block شدن تا تکمیل Promise/sequence/thunk.

پس به‌جای `yield` کردن Promise برگردانده‌شده از `request(..)`، بهتر است `request(..)` یک کانال برگرداند که از آن با `take(..)` مقدار بگیرید. یعنی در این بافت/کاربرد، یک کانال تک‌مقداری تقریباً معادل Promise/sequence است.

اول نسخه‌ی کانال-آگاه `request(..)` را بسازیم:

```js
function request(url) {
	var ch = ASQ.csp.channel();
	ajax( url ).then( function(content){
		// `putAsync(..)` is a version of `put(..)` that
		// can be used outside of a generator. It returns
		// a promise for the operation's completion. We
		// don't use that promise here, but we could if
		// we needed to be notified when the value had
		// been `take(..)`n.
		ASQ.csp.putAsync( ch, content );
	} );
	return ch;
}
```

از فصل ۳ می‌دانیم "promisory" utility تولید Promise است؛ "thunkory" از فصل ۴ utility تولید thunk بود؛ و در پیوست A هم "sequory" را برای تولید sequence ساختیم.

طبیعتاً اینجا هم به یک واژه‌ی متناظر برای utility تولیدکننده‌ی channel نیاز داریم. پس منطقی است آن را "chanory" بنامیم ("channel" + "factory"). به‌عنوان تمرین، خودتان utilityای مثل `channelify(..)` تعریف کنید که مشابه `Promise.wrap(..)`/`promisify(..)` (فصل ۳)، `thunkify(..)` (فصل ۴) و `ASQ.wrap(..)` (پیوست A) باشد.

حالا مثال Ajax هم‌زمان را با CSP به سبک *asynquence* ببینید:

```js
ASQ()
.runner(
	ASQ.csp.go( function*(ch){
		yield ASQ.csp.put( ch, "http://some.url.2" );

		var url1 = yield ASQ.csp.take( ch );
		// "http://some.url.1"

		var res1 = yield ASQ.csp.take( request( url1 ) );

		yield ASQ.csp.put( ch, res1 );
	} ),
	ASQ.csp.go( function*(ch){
		var url2 = yield ASQ.csp.take( ch );
		// "http://some.url.2"

		yield ASQ.csp.put( ch, "http://some.url.1" );

		var res2 = yield ASQ.csp.take( request( url2 ) );
		var res1 = yield ASQ.csp.take( ch );

		// pass along results to next sequence step
		ch.buffer_size = 2;
		ASQ.csp.put( ch, res1 );
		ASQ.csp.put( ch, res2 );
	} )
)
.val( function(res1,res2){
	// `res1` comes from "http://some.url.1"
	// `res2` comes from "http://some.url.2"
} );
```

پیام‌رسانی‌ای که رشته‌های URL را بین دو goroutine جابه‌جا می‌کند نسبتاً سرراست است. goroutine اول به URL اول درخواست Ajax می‌زند و پاسخ را روی کانال `ch` می‌گذارد. goroutine دوم به URL دوم درخواست می‌زند، سپس پاسخ اول (`res1`) را از کانال `ch` برمی‌دارد. در آن لحظه هر دو پاسخ `res1` و `res2` کامل و آماده‌اند.

اگر در پایان اجرای goroutine هنوز مقداری داخل کانال `ch` باقی مانده باشد، به مرحله‌ی بعدی sequence پاس داده می‌شود. بنابراین برای خروج پیام(ها) از goroutine نهایی، آن‌ها را با `put(..)` داخل `ch` بگذارید. همان‌طور که می‌بینید، برای جلوگیری از block شدن `put(..)`های پایانی، `ch` را با تنظیم `buffer_size` روی `2` وارد حالت بافری می‌کنیم (پیش‌فرض: `0`).

**نکته:** نمونه‌های بیشتر از CSP به سبک *asynquence* را اینجا ببینید: https://gist.github.com/getify/e0d04f1f5aa24b1947ae
