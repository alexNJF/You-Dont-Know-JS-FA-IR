# مدیریت خطا

تا اینجا چند مثال دیدیم که rejection Promise -- چه عمدی با `reject(..)`، چه ناخواسته از JS exception -- چطور مدیریت خطا را در برنامه‌نویسی async منطقی‌تر می‌کند. اما بیایید دقیق‌تر به جزئیاتش برگردیم.

طبیعی‌ترین فرم مدیریت خطا برای بیشتر توسعه‌دهنده‌ها ساختار syncِ `try..catch` است. اما متاسفانه این ابزار فقط sync است و در الگوهای async کمک نمی‌کند:

```js
function foo() {
	setTimeout( function(){
		baz.bar();
	}, 100 );
}

try {
	foo();
	// later throws global error from `baz.bar()`
}
catch (err) {
	// never gets here
}
```

داشتن `try..catch` عالی بود، اما across عملیات async کار نمی‌کند. مگر اینکه محیط پشتیبانی اضافه بدهد، که درباره‌اش با generatorها در فصل ۴ برمی‌گردیم.

در callbackها چند استاندارد برای مدیریت خطا شکل گرفته، معروف‌ترینش «error-first callback»:

```js
function foo(cb) {
	setTimeout( function(){
		try {
			var x = baz.bar();
			cb( null, x ); // success!
		}
		catch (err) {
			cb( err );
		}
	}, 100 );
}

foo( function(err,val){
	if (err) {
		console.error( err ); // bummer :(
	}
	else {
		console.log( val );
	}
} );
```

**نکته:** `try..catch` اینجا فقط چون `baz.bar()` همان لحظه sync موفق/ناموفق می‌شود کار می‌کند. اگر خود `baz.bar()` async بود، خطاهای async درونش catch نمی‌شد.

callback پاس‌داده‌شده به `foo(..)` انتظار دارد سیگنال خطا را در آرگومان اول (`err`) بگیرد. اگر باشد یعنی خطا، اگر نباشد موفقیت.

این سبک از نظر فنی *قابل استفاده در async* است، اما compose شدنش خیلی ضعیف است. چند لایه callbackِ error-first با شرط‌های تکراری `if` خیلی زود شما را به callback hell می‌برد (فصل ۲).

پس برگردیم به Promise: error handling با rejection handler در `then(..)`. Promise از سبک error-first استفاده نمی‌کند، بلکه "split callbacks": یکی برای fulfillment و یکی برای rejection:

```js
var p = Promise.reject( "Oops" );

p.then(
	function fulfilled(){
		// never gets here
	},
	function rejected(err){
		console.log( err ); // "Oops"
	}
);
```

این الگو روی سطح منطقی به نظر می‌رسد، اما ظرافت‌های مدیریت خطا در Promise معمولاً پیچیده‌تر از چیزی است که اول به نظر می‌آید.

مثال:

```js
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// numbers don't have string functions,
		// so will throw an error
		console.log( msg.toLowerCase() );
	},
	function rejected(err){
		// never gets here
	}
);
```

اگر `msg.toLowerCase()` واقعاً خطا throw می‌کند (که می‌کند!) چرا error handler ما خبر نمی‌شود؟ همان‌طور که گفتیم، چون آن error handler مربوط به Promise `p` است که قبلاً با `42` fulfill شده. `p` immutable است، پس Promiseی که خطا را می‌گیرد Promise برگشتی `p.then(..)` است، که اینجا capture نشده.

همین نشان می‌دهد خطایابی با Promise چقدر مستعد خطاست (بازی کلامی عمدی). خیلی راحت خطاها swallow می‌شوند، در حالی که معمولاً چنین چیزی قصد شما نیست.

**هشدار:** اگر Promise API را نامعتبر استفاده کنید و خطایی رخ دهد که اصلاً Promise ساخته نشود، نتیجه یک exception فوری throw شده است، **نه Promise rejected**. نمونه‌های misuse: `new Promise(null)`, `Promise.all()`, `Promise.race(42)` و... . وقتی Promise اصلاً ساخته نشود، rejection Promise هم نداریم.

### چاله‌ی ناامیدی

Jeff Atwood سال‌ها پیش گفت زبان‌ها معمولاً طوری طراحی می‌شوند که توسعه‌دهنده پیش‌فرض در «pit of despair» بیفتد -- یعنی خطاها مجازات شوند -- و برای درست‌نویسی باید بیشتر زور بزند. پیشنهادش «pit of success» بود: پیش‌فرض شما را در مسیر رفتار درست بیندازد و برای خراب‌کردن مجبور شوید بیشتر تلاش کنید.

مدیریت خطا در Promise بی‌تردید طراحی «pit of despair» است. پیش‌فرض این است که خطا در state Promise نگه داشته شود و اگر یادتان برود observe کنید، خطا بی‌صدا گم می‌شود.

برای اینکه خطا در Promise فراموش‌شده گم نشود، بعضی توسعه‌دهنده‌ها می‌گویند best practice این است که chain را همیشه با `catch(..)` تمام کنید:

```js
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// numbers don't have string functions,
		// so will throw an error
		console.log( msg.toLowerCase() );
	}
)
.catch( handleErrors );
```

چون rejection handler به `then(..)` ندادیم، handler پیش‌فرض جایگزین شد که خطا را به Promise بعدی propagate می‌کند. در نتیجه هم خطاهای ورودی به `p` و هم خطاهای بعد از resolution آن (مثل `msg.toLowerCase()`) به `handleErrors(..)` می‌رسند.

پس مشکل حل شد؟ نه آنقدر سریع!

اگر خود `handleErrors(..)` هم خطا داشته باشد چه؟ چه کسی آن را می‌گیرد؟ باز یک Promise unattended داریم: Promise برگشتی `catch(..)` که نه capture کردیم نه rejection handler دادیم.

نمی‌توانید بی‌نهایت `catch(..)` پشت‌سر هم بچسبانید، چون آن‌ها هم می‌توانند fail شوند. آخرین گام هر chain Promise همیشه این احتمال را دارد که خطای uncaught در Promise مشاهده‌نشده گیر کند.

به نظر معمای حل‌نشدنی می‌آید؟

### رسیدگی به خطای Uncaught

حل کاملش ساده نیست. راه‌های دیگری هست که خیلی‌ها بهتر می‌دانند.

بعضی کتابخانه‌های Promise متدی برای ثبت چیزی شبیه "global unhandled rejection" دارند که به‌جای global thrown error اجرا می‌شود. اما تشخیص «uncaught بودن» را معمولاً با تایمر دلخواه (مثلاً ۳ ثانیه پس از rejection) انجام می‌دهند. اگر Promise rejected شود و قبل از پایان تایمر handler ثبت نشود، فرض می‌گیرند هرگز ثبت نخواهد شد و آن را uncaught می‌دانند.

در عمل برای خیلی کتابخانه‌ها خوب جواب داده، چون الگوی رایج استفاده فاصله‌ی زیاد بین rejection و observe شدن ندارد. اما مشکل این روش این است که ۳ ثانیه دلخواه است، و مواردی هم واقعاً وجود دارد که می‌خواهید Promise مدتی نامشخص در حالت rejected بماند و نمی‌خواهید false positive بگیرید.

پیشنهاد رایج دیگر این است که Promise متدی مثل `done(..)` داشته باشد که chain را «تمام‌شده» علامت بزند. `done(..)` Promise جدید نمی‌سازد و برنمی‌گرداند، پس callbackهایش هم طبیعتاً به Promise زنجیره‌ای بعدی متصل نیستند.

پس چه می‌شود؟ مثل خطای uncaught معمولی رفتار می‌شود: هر exception داخل rejection handler مربوط به `done(..)` به‌صورت global uncaught throw می‌شود (عملاً در console توسعه‌دهنده):

```js
var p = Promise.resolve( 42 );

p.then(
	function fulfilled(msg){
		// numbers don't have string functions,
		// so will throw an error
		console.log( msg.toLowerCase() );
	}
)
.done( null, handleErrors );

// if `handleErrors(..)` caused its own exception, it would
// be thrown globally here
```

شاید این روش جذاب‌تر از chain بی‌پایان یا timeout دلخواه به نظر برسد. اما مشکل بزرگ: جزو استاندارد ES6 نیست؛ پس هرچقدر خوب باشد، تا ubiquitous شدنش راه زیادی مانده.

پس گیر کرده‌ایم؟ نه کاملاً.

مرورگرها یک قابلیت ویژه دارند که کد ما ندارد: می‌توانند دقیق بفهمند چه زمانی یک object دور ریخته و garbage collected شده. پس مرورگر می‌تواند Promiseها را track کند، و اگر Promise در لحظه‌ی GC rejected باشد، با قطعیت تشخیص دهد این یک "uncaught error" واقعی بوده و آن را در console گزارش کند.

**نکته:** زمان نگارش متن، Chrome و Firefox تلاش‌های اولیه‌ای برای چنین "uncaught rejection" داشتند، هرچند پشتیبانی کامل نبود.

اما اگر Promise GC نشود -- و این خیلی راحت با الگوهای مختلف کدنویسی رخ می‌دهد -- این sniffing کمکی نمی‌کند تشخیص دهید Promise rejected بی‌صدا در حافظه مانده.

راه دیگر هست؟ بله.

### چاله‌ی موفقیت

بخش بعدی نظری است: اینکه Promise *می‌توانست* در آینده این‌طور تغییر کند. به نظر من از وضعیت فعلی بهتر است. فکر می‌کنم حتی بعد از ES6 هم شدنی بود چون احتمالاً با سازگاری وب نمی‌شکند. حتی می‌شود polyfill/prollyfill کرد اگر با دقت.

* Promiseها می‌توانستند پیش‌فرض هر rejection را در tick بعدی Job/event loop به console گزارش کنند، اگر همان لحظه هنوز error handler ثبت نشده باشد.
* برای مواردی که می‌خواهید Promise rejected برای زمان نامشخص نگه داشته شود و بعداً observe شود، متد `defer()` می‌داشتیم تا گزارش خودکار خطا را سرکوب کند.

یعنی اگر Promise rejected شود، پیش‌فرضش گزارش noisy به console باشد (نه سکوت). می‌توانستید یا ضمنی opt-out کنید (با ثبت handler قبل از rejection) یا صریح (با `defer()`). در هر دو حالت، کنترل false positive دست *شما* است.

مثال:

```js
var p = Promise.reject( "Oops" ).defer();

// `foo(..)` is Promise-aware
foo( 42 )
.then(
	function fulfilled(){
		return p;
	},
	function rejected(err){
		// handle `foo(..)` error
	}
);
...
```

وقتی `p` را می‌سازیم می‌دانیم می‌خواهیم دیرتر rejection آن را observe کنیم، پس `defer()` می‌زنیم و گزارشی به‌صورت global نمی‌آید. `defer()` همان Promise را برای chaining برمی‌گرداند.

Promise برگشتی `foo(..)` هم بلافاصله error handler می‌گیرد، پس آن هم ضمنی opt-out می‌شود و گزارش global ندارد.

اما Promise برگشتی `then(..)` چون نه `defer()` دارد نه handler خطا، اگر rejected شود (داخل هرکدام از resolution handlerها)، در console توسعه‌دهنده به‌عنوان uncaught گزارش می‌شود.

**این طراحی، pit of success است.** پیش‌فرض این است که همه‌ی خطاها یا handle شوند یا report -- همان چیزی که تقریباً همه‌ی توسعه‌دهنده‌ها در اکثر موارد می‌خواهند. یا handler می‌دهید یا آگاهانه opt-out می‌کنید و مسئولیت اضافه‌ی defer کردن خطا تا *بعدتر* را می‌پذیرید.

تنها خطر واقعی وقتی است که Promise را `defer()` کنید اما در نهایت هیچ‌وقت rejection آن را observe/handle نکنید.

اما آنجا خودتان عمدی `defer()` زده‌اید و از پیش‌فرض pit of success خارج شده‌اید؛ پس دیگر خیلی نمی‌شود از اشتباه خودتان نجاتتان داد.

به نظرم هنوز برای بهتر شدن مدیریت خطای Promise (پس از ES6) امید هست. امیدوارم تصمیم‌گیران استاندارد دوباره فکر کنند. تا آن زمان، می‌توانید خودتان چنین چیزی پیاده‌سازی کنید (تمرین چالشی!) یا از کتابخانه‌ی Promise *هوشمندتر* استفاده کنید.

**نکته:** همین مدل دقیق مدیریت/گزارش خطا در کتابخانه‌ی Promise abstraction من یعنی *asynquence* پیاده شده است که در پیوست A کتاب درباره‌اش صحبت می‌کنیم.
