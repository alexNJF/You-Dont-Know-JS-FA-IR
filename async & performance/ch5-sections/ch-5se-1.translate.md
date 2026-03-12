# Web Workerها

اگر کارهای پردازشی سنگین دارید ولی نمی‌خواهید روی thread اصلی اجرا شوند (چون ممکن است مرورگر/UI را کند کنند)، احتمالاً آرزو کرده‌اید JavaScript بتواند چندریسمانی اجرا شود.

در فصل ۱ مفصل گفتیم JavaScript تک‌ریسمانی است. این هنوز درست است. اما تک‌ریسمانی بودن تنها روش سازمان‌دهی اجرای برنامه نیست.

برنامه‌تان را تصور کنید که به دو بخش تقسیم شده: یک بخش روی thread اصلی UI اجرا می‌شود و بخش دیگر روی یک thread کاملاً جدا.

این معماری چه دغدغه‌هایی می‌آورد؟

اول اینکه می‌خواهید بدانید اجرای thread جدا یعنی واقعاً موازی هم اجرا می‌شود (روی سیستم‌های چند CPU/چند هسته) تا یک پردازش طولانی روی thread دوم **thread اصلی برنامه** را block نکند. وگرنه «ریسمان‌بندی مجازی» نسبت به async concurrency فعلی JS فایده‌ی زیادی ندارد.

و می‌خواهید بدانید آیا این دو بخش برنامه به scope/resource مشترک دسترسی دارند یا نه. اگر داشته باشند، همه‌ی مسائل کلاسیک زبان‌های چندریسمانی (Java، C++ و...) را دارید: lockهای cooperative یا preemptive (mutex و...)، که بار اضافه‌ی بزرگی است.

یا اگر scope/resource مشترک ندارند، باید بدانید این دو بخش چطور با هم «ارتباط» برقرار می‌کنند.

این‌ها سؤال‌های عالی‌ای هستند وقتی می‌رویم سراغ قابلیتی که حوالی HTML5 به پلتفرم وب اضافه شد: **Web Workers**. این ویژگی مربوط به مرورگر (host environment) است و تقریباً ربطی به خود زبان JS ندارد. یعنی JavaScript فعلی ذاتاً قابلیت اجرای threaded ندارد.

اما محیطی مثل مرورگر می‌تواند چند instance از JS engine بسازد، هر کدام روی thread خودش، و در هر thread برنامه‌ی متفاوتی اجرا کند. هرکدام از این قطعات threaded جدا، یک "(Web) Worker" نام دارد. این نوع parallelism را «task parallelism» می‌گویند، چون تمرکز روی شکستن برنامه به تکه‌هایی است که موازی اجرا شوند.

از برنامه‌ی اصلی JS (یا Worker دیگر)، این‌طور Worker می‌سازید:

```js
var w1 = new Worker( "http://some.url.1/mycoolworker.js" );
```

URL باید به یک فایل JS اشاره کند (نه HTML) که قرار است داخل Worker لود شود. مرورگر یک thread جدا بالا می‌آورد و آن فایل را به‌عنوان برنامه‌ی مستقل در همان thread اجرا می‌کند.

**نکته:** Workeri که با URL می‌سازید "Dedicated Worker" است. اما می‌توانید به‌جای URL فایل خارجی، با Blob URL هم "Inline Worker" بسازید (ویژگی دیگر HTML5): عملاً فایل inline در یک مقدار باینری واحد. Blob خارج از بحث اینجاست.

Workerها هیچ scope/resource مشترکی با هم یا با برنامه‌ی اصلی ندارند -- تا کابوس‌های برنامه‌نویسی threaded سر باز نکند -- و به‌جای آن یک مکانیزم پیام‌رسانی event-محور ساده بینشان است.

شیء Worker یعنی `w1` یک event listener/trigger است که با آن می‌توانید هم به eventهای Worker گوش دهید و هم به Worker event بفرستید.

گوش‌دادن به event (در عمل event ثابت `"message"`):

```js
w1.addEventListener( "message", function(evt){
	// evt.data
} );
```

و ارسال `"message"` به Worker:

```js
w1.postMessage( "something cool to say" );
```

داخل خود Worker هم پیام‌رسانی کاملاً متقارن است:

```js
// "mycoolworker.js"

addEventListener( "message", function(evt){
	// evt.data
} );

postMessage( "a really cool reply" );
```

توجه کنید Dedicated Worker رابطه‌ی یک‌به‌یک با برنامه‌ی سازنده‌اش دارد. یعنی event `"message"` نیاز به ابهام‌زدایی ندارد، چون مشخص است فقط می‌تواند از همین رابطه‌ی یک‌به‌یک آمده باشد -- یا از Worker یا از صفحه‌ی اصلی.

معمولاً برنامه‌ی صفحه‌ی اصلی Worker را می‌سازد، ولی Worker خودش هم می‌تواند child Worker (subworker) بسازد. گاهی برای واگذاری جزئیات به یک Worker «master» مفید است که خودش Workerهای دیگر را برای بخش‌های مختلف task ایجاد کند. متاسفانه زمان نگارش متن، Chrome هنوز subworker را پشتیبانی نمی‌کرد ولی Firefox می‌کرد.

برای کشتن فوری Worker از سمت برنامه‌ی سازنده، روی شیء Worker (مثل `w1`) متد `terminate()` را صدا بزنید. پایان دادن ناگهانی threadِ Worker فرصتی برای اتمام کار یا cleanup منابع نمی‌دهد؛ شبیه بستن تب مرورگر است.

اگر دو یا چند صفحه (یا چند تب از همان صفحه) در مرورگر بخواهند Workerی از یک URL یکسان بسازند، در عمل Workerهای کاملاً جدا ساخته می‌شوند. کمی بعد راهی برای «اشتراک» Worker می‌بینیم.

**نکته:** شاید به نظر برسد برنامه‌ی مخرب می‌تواند با ساخت صدها Worker حمله‌ی DoS بزند. هرچند تا حدی Worker روی thread جدا اجرا می‌شود، ولی این تضمین نامحدود نیست. سیستم آزاد است تصمیم بگیرد واقعاً چند thread/CPU/core بسازد. هیچ راهی برای تضمین دقیق تعداد در دسترس ندارید، هرچند خیلی‌ها فرض می‌کنند حداقل برابر تعداد coreهاست. امن‌ترین فرض: حداقل یک thread اضافه غیر از thread اصلی UI وجود دارد.

### محیط Worker

داخل Worker به منابع برنامه‌ی اصلی دسترسی ندارید. یعنی نه globalهای آن، نه DOM صفحه و نه منابع دیگر. یادتان باشد: thread کاملاً جداست.

اما می‌توانید عملیات شبکه (Ajax, WebSocket) انجام دهید و timer بگذارید. همچنین Worker به کپی خودش از چند global/feature مهم دسترسی دارد: `navigator`, `location`, `JSON`, `applicationCache`.

همچنین می‌توانید اسکریپت JS اضافه داخل Worker لود کنید با `importScripts(..)`:

```js
// inside the Worker
importScripts( "foo.js", "bar.js" );
```

این اسکریپت‌ها همزمان‌ساز (synchronous) لود می‌شوند؛ یعنی `importScripts(..)` بقیه‌ی اجرای Worker را تا پایان لود و اجرای فایل(ها) block می‌کند.

**نکته:** بحث‌هایی هم بوده برای اینکه API مربوط به `<canvas>` داخل Worker هم در دسترس شود. اگر با Transferable بودن canvasها ترکیب شود (بخش "Data Transfer")، Worker می‌تواند پردازش گرافیکی پیشرفته‌ی off-thread انجام دهد که برای بازی‌های پرفورمنس‌محور (WebGL) و موارد مشابه مفید است. زمان نگارش در مرورگرها وجود نداشت، ولی احتمالاً نزدیک بود.

کاربردهای رایج Web Worker:

* محاسبات ریاضی سنگین
* مرتب‌سازی مجموعه‌داده‌های بزرگ
* عملیات داده (فشرده‌سازی، تحلیل صوت، دستکاری پیکسل تصویر و...)
* ارتباطات شبکه‌ای پرترافیک

### انتقال داده

احتمالاً ویژگی مشترک بیشتر کاربردهای بالا را می‌بینید: نیاز به انتقال حجم زیاد اطلاعات از مانع بین threadها با مکانیزم event، گاهی دوطرفه.

در روزهای اول Workerها تنها راه، serialize کردن کل داده به string بود. جدا از هزینه‌ی زمانی serialize/deserialize دوطرفه، مشکل بزرگ این بود که داده کپی می‌شد؛ یعنی مصرف حافظه دو برابر و فشار GC بیشتر.

خوشبختانه حالا گزینه‌های بهتر داریم.

اگر object بفرستید، الگوریتمی به نام "Structured Cloning Algorithm" برای کپی/تکثیر object سمت دیگر استفاده می‌شود. این الگوریتم پیشرفته است و حتی objectهای circular referenceدار را هم کپی می‌کند. هزینه‌ی to-string/from-string نداریم، ولی همچنان کپی حافظه داریم. این در IE10+ و بقیه مرورگرهای اصلی پشتیبانی می‌شود.

گزینه‌ی بهتر (خصوصاً برای داده‌های بزرگ) "Transferable Objects" است. در این حالت «مالکیت» object منتقل می‌شود، نه خود داده. وقتی object را به Worker transfer می‌کنید، در مبدا خالی یا غیرقابل‌دسترسی می‌شود -- این خطرهای threaded programming روی scope مشترک را حذف می‌کند. انتقال مالکیت هم می‌تواند دوطرفه باشد.

برای opt-in کردن به Transferable معمولاً کار خاصی لازم نیست؛ هر ساختار داده‌ای که interface مربوط به Transferable را پیاده کند خودکار این‌طور منتقل می‌شود (پشتیبانی Firefox و Chrome).

مثلاً typed array مثل `Uint8Array` (کتاب *ES6 & Beyond*) یک Transferable است. ارسال با `postMessage(..)`:

```js
// `foo` is a `Uint8Array` for instance

postMessage( foo.buffer, [ foo.buffer ] );
```

پارامتر اول raw buffer است و پارامتر دوم لیست چیزهایی است که باید transfer شوند.

مرورگرهایی که Transferable ندارند، خودکار به structured cloning degrade می‌کنند؛ یعنی feature نمی‌شکند، فقط performance افت می‌کند.

### Shared Workerها

اگر سایت/اپ شما چند تب از یک صفحه را باز می‌گذارد (خیلی رایج)، احتمالاً می‌خواهید مصرف منابع سیستم را کم کنید و Workerهای dedicated تکراری نسازید؛ رایج‌ترین منبع محدود در اینجا connection شبکه‌ی socket است، چون مرورگر تعداد اتصال همزمان به یک host را محدود می‌کند. البته کاهش اتصال‌های کلاینتی فشار سرور را هم کم می‌کند.

در این حالت، ساخت یک Worker مرکزی واحد که همه‌ی instanceهای صفحه بتوانند *share* کنند خیلی مفید است.

این می‌شود `SharedWorker` که این‌طور ساخته می‌شود (پشتیبانی محدود به Firefox و Chrome):

```js
var w1 = new SharedWorker( "http://some.url.1/mycoolworker.js" );
```

چون Shared Worker می‌تواند از چند instance برنامه/صفحه روی سایت وصل شود، Worker باید بفهمد هر پیام از کدام برنامه آمده. این شناسه‌ی یکتا "port" نام دارد (شبیه پورت socket شبکه). پس برنامه‌ی فراخواننده باید برای ارتباط از شیء `port` مربوط به Worker استفاده کند:

```js
w1.port.addEventListener( "message", handleMessages );

// ..

w1.port.postMessage( "something cool" );
```

همچنین connection مربوط به port باید initialize شود:

```js
w1.port.start();
```

داخل Shared Worker یک event اضافی هم باید handle شود: `"connect"`. این event شیء `port` را برای همان connection خاص می‌دهد. راحت‌ترین راه جدا نگه داشتن چند connection این است که روی `port` closure بگیرید (کتاب *Scope & Closures*) و listener/ارسال همان connection را داخل handler رویداد `"connect"` تعریف کنید:

```js
// inside the shared Worker
addEventListener( "connect", function(evt){
	// the assigned port for this connection
	var port = evt.ports[0];

	port.addEventListener( "message", function(evt){
		// ..

		port.postMessage( .. );

		// ..
	} );

	// initialize the port connection
	port.start();
} );
```

به‌جز این تفاوت، Shared و Dedicated Worker قابلیت‌ها و semantics یکسانی دارند.

**نکته:** Shared Worker اگر connection یک port قطع شود و portهای دیگر هنوز زنده باشند، به حیاتش ادامه می‌دهد. اما Dedicated Worker هر وقت ارتباطش با برنامه‌ی سازنده قطع شود terminate می‌شود.

### Polyfill کردن Web Worker

Web Worker از نظر performance برای اجرای موازی برنامه‌های JS بسیار جذاب است. اما ممکن است کدتان باید روی مرورگرهای قدیمی بدون پشتیبانی هم اجرا شود. چون Worker یک API است (نه syntax)، تا حدی قابل polyfill است.

اگر مرورگر Worker پشتیبانی نکند، از نظر performance هیچ راه واقعی‌ای برای شبیه‌سازی چندریسمانی وجود ندارد. Iframeها معمولاً محیط موازی تصور می‌شوند، ولی در مرورگرهای مدرن روی همان thread صفحه‌ی اصلی اجرا می‌شوند و برای شبیه‌سازی parallelism کافی نیستند.

همان‌طور که در فصل ۱ گفتیم، ناهمگامی JS (نه parallelism) از صف event loop می‌آید، پس می‌توانید Worker تقلبی را با timer (`setTimeout(..)` و...) async کنید. بعد فقط یک polyfill برای API Worker لازم دارید. چند مورد در این لینک فهرست شده‌اند، اما راستش خیلی‌شان خوب به نظر نمی‌رسند.

من یک اسکچ polyfill برای `Worker` نوشته‌ام. پایه‌ای است، اما برای پشتیبانی ساده‌ی Worker کافی است، به‌شرط اینکه پیام‌رسانی دوطرفه و `onerror` درست کار کند. احتمالاً می‌توانید با featureهای بیشتر (مثل `terminate()` یا Shared Worker تقلبی) توسعه‌اش بدهید.

**نکته:** block همزمان‌ساز را نمی‌شود تقلبی ساخت، بنابراین این polyfill استفاده از `importScripts(..)` را ممنوع می‌کند. گزینه‌ی دیگر می‌توانست parse/transform کد Worker پس از Ajax load باشد تا به شکل async برای `importScripts(..)` بازنویسی شود، شاید با یک interface Promise-aware.
