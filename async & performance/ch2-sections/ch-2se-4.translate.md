# تلاش برای نجات Callback

چندین واریانت از طراحی callback تلاش کرده‌اند بخشی (نه همه!) از مشکلات اعتماد را که دیدیم حل کنند. تلاشی شجاعانه، اما در نهایت محکوم‌به‌شکست، برای جلوگیری از فروریختن الگوی callback روی خودش.

مثلاً برای مدیریت خطای gracefulتر، بعضی APIها از callback جداگانه استفاده می‌کنند (یکی برای موفقیت، یکی برای خطا):

```js
function success(data) {
	console.log( data );
}

function failure(err) {
	console.error( err );
}

ajax( "http://some.url.1", success, failure );
```

در APIهایی با این طراحی، اغلب handler خطای `failure()` اختیاری است و اگر ندهید فرض می‌کنند می‌خواهید خطاها swallowed شوند. افتضاح.

**نکته:** همین split-callback همان الگویی است که Promise API در ES6 استفاده می‌کند. فصل بعد Promiseهای ES6 را مفصل بررسی می‌کنیم.

الگوی رایج دیگر «error-first style» است (گاهی «Node style» هم می‌گویند چون تقریباً تمام APIهای Node.js این قرارداد را دارند). در این مدل، آرگومان اول callback برای شیء خطا رزرو می‌شود (اگر خطا باشد). در حالت موفقیت، آرگومان اول خالی/falsy است (و آرگومان‌های بعدی داده‌ی موفقیت‌اند). در حالت خطا، آرگومان اول truthy می‌شود (و معمولاً چیز دیگری پاس داده نمی‌شود):

```js
function response(err,data) {
	// error?
	if (err) {
		console.error( err );
	}
	// otherwise, assume success
	else {
		console.log( data );
	}
}

ajax( "http://some.url.1", response );
```

در هر دوی این رویکردها چند نکته مهم هست.

اول اینکه برخلاف ظاهر، بخش عمده‌ی مشکلات اعتماد حل نشده‌اند. هیچ‌کدام تضمین نمی‌کند callback ناخواسته چندبار صدا زده نشود. حتی بدتر: ممکن است هم سیگنال موفقیت بگیرید هم خطا، یا هیچ‌کدام را نگیرید، و باز باید این حالت‌ها را پوشش دهید.

دوم اینکه هرچند الگوی استانداردی است، اما verbose و پر از boilerplate است و reuse کمی دارد؛ پس برای هر callback مجبورید دوباره همین را بنویسید.

حالا مسئله‌ی «اصلاً صدا زده نشدن» چه؟ اگر این نگرانی مهم باشد (و معمولاً هست)، احتمالاً باید timeout بگذارید که رویداد را cancel کند. می‌توانید utilityای (صرفاً proof-of-concept) مثل این بسازید:

```js
function timeoutify(fn,delay) {
	var intv = setTimeout( function(){
			intv = null;
			fn( new Error( "Timeout!" ) );
		}, delay )
	;

	return function() {
		// timeout hasn't happened yet?
		if (intv) {
			clearTimeout( intv );
			fn.apply( this, [ null ].concat( [].slice.call( arguments ) ) );
		}
	};
}
```

نحوه‌ی استفاده:

```js
// using "error-first style" callback design
function foo(err,data) {
	if (err) {
		console.error( err );
	}
	else {
		console.log( data );
	}
}

ajax( "http://some.url.1", timeoutify( foo, 500 ) );
```

مسئله‌ی اعتماد دیگر این است که callback «خیلی زود» صدا زده شود. در سطح کاربردی، شاید یعنی قبل از تکمیل یک کار حیاتی. اما عمومی‌تر، مشکل در utilityهایی رخ می‌دهد که callback شما را ممکن است *اکنون* (sync) یا *بعدتر* (async) صدا بزنند.

این nondeterminism در sync-or-async تقریباً همیشه به bugهای سخت‌ردیابی منتهی می‌شود. در بعضی حلقه‌ها، هیولای خیالیِ دیوانه‌کننده‌ای به نام Zalgo را برای همین کابوس sync/async به‌کار می‌برند. شعار «Zalgo را آزاد نکن!» توصیه‌ی محکمی دارد: همیشه callbackها را async صدا بزنید؛ حتی اگر «همین حالا» یعنی نوبت بعدی event loop، تا رفتار callbackها قابل پیش‌بینی async بماند.

**نکته:** برای جزئیات بیشتر درباره‌ی Zalgo:
Oren Golan: https://github.com/oren/oren.github.io/blob/master/posts/zalgo.md
Isaac Z. Schlueter: http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony

مثال:

```js
function result(data) {
	console.log( a );
}

var a = 0;

ajax( "..pre-cached-url..", result );
a++;
```

این کد `0` چاپ می‌کند (فراخوانی sync callback) یا `1` (فراخوانی async callback)؟ بستگی دارد... به شرایط.

می‌بینید پیش‌بینی‌ناپذیری Zalgo چقدر سریع می‌تواند هر برنامه‌ی JS را تهدید کند. پس «never release Zalgo» با اینکه بامزه به نظر می‌رسد، توصیه‌ای بسیار جدی و کاربردی است: همیشه async باشید.

اگر ندانید API موردنظر همیشه async اجرا می‌کند یا نه چه؟ می‌توانید utilityای مثل proof-of-concept زیر بسازید:

```js
function asyncify(fn) {
	var orig_fn = fn,
		intv = setTimeout( function(){
			intv = null;
			if (fn) fn();
		}, 0 )
	;

	fn = null;

	return function() {
		// firing too quickly, before `intv` timer has fired to
		// indicate async turn has passed?
		if (intv) {
			fn = orig_fn.bind.apply(
				orig_fn,
				// add the wrapper's `this` to the `bind(..)`
				// call parameters, as well as currying any
				// passed in parameters
				[this].concat( [].slice.call( arguments ) )
			);
		}
		// already async
		else {
			// invoke original function
			orig_fn.apply( this, arguments );
		}
	};
}
```

نحوه‌ی استفاده‌ی `asyncify(..)`:

```js
function result(data) {
	console.log( a );
}

var a = 0;

ajax( "..pre-cached-url..", asyncify( result ) );
a++;
```

چه درخواست Ajax از cache باشد و بخواهد callback را فوراً صدا بزند، چه لازم باشد از شبکه بیاید و بعدتر کامل شود، خروجی این کد همیشه `1` است نه `0` -- چون `result(..)` ناگزیر async فراخوانی می‌شود، و `a++` فرصت اجرا قبل از آن را پیدا می‌کند.

عالی، یک مشکل اعتماد دیگر هم «حل شد»! اما هم ناکارآمد است، هم دوباره boilerplate سنگین و اضافی.

داستان callbackها همین است: تقریباً هر کاری می‌شود با آن‌ها کرد، اما باید خیلی زحمت بکشید، و این زحمت غالباً بیشتر از چیزی است که باید صرف استدلال درباره‌ی کد کنید.

ممکن است آرزو کنید APIهای built-in یا مکانیزم‌های زبانی برای این مشکلات وجود داشتند. خوشبختانه ES6 آمده و پاسخ‌های خوبی آورده، پس ادامه بدهید!
