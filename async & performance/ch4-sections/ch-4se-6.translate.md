# هم‌روندی Generator

همان‌طور که در فصل ۱ و اوایل همین فصل گفتیم، دو «فرایند» هم‌زمان می‌توانند به‌صورت cooperative عملیات‌شان را interleave کنند، و خیلی وقت‌ها این کار بیان‌های async بسیار قدرتمندی می‌دهد.

صادقانه، مثال‌های قبلیِ interleave چند generator بیشتر نشان داد چطور می‌شود خیلی گیج‌کننده‌اش کرد. اما اشاره کردیم جاهایی این قابلیت واقعاً مفید است.

سناریویی را از فصل ۱ به یاد بیاورید: دو handler متفاوت برای Ajax response باید با هم هماهنگ می‌شدند تا ارتباط داده race condition نشود. پاسخ‌ها را این‌طور در آرایه‌ی `res` می‌گذاشتیم:

```js
function response(data) {
	if (data.url == "http://some.url.1") {
		res[0] = data;
	}
	else if (data.url == "http://some.url.2") {
		res[1] = data;
	}
}
```

حالا همین سناریو را چطور با اجرای concurrent چند generator حل کنیم؟

```js
// `request(..)` is a Promise-aware Ajax utility

var res = [];

function *reqData(url) {
	res.push(
		yield request( url )
	);
}
```

**نکته:** اینجا دو instance از generator `*reqData(..)` استفاده می‌کنیم، اما از نظر استدلال فرقی با اجرای یک instance از دو generator متفاوت ندارد؛ هر دو یکسان تحلیل می‌شوند. چند خط بعد هماهنگی دو generator متفاوت را هم می‌بینیم.

به‌جای اینکه دستی `res[0]` و `res[1]` را جدا کنیم، از ترتیب‌دهی هماهنگ استفاده می‌کنیم تا `res.push(..)` مقدارها را در ترتیب قابل پیش‌بینی بگذارد. منطق بیان‌شده تمیزتر می‌شود.

اما این تعامل را عملاً چطور orchestrate کنیم؟ اول دستی با Promise:

```js
var it1 = reqData( "http://some.url.1" );
var it2 = reqData( "http://some.url.2" );

var p1 = it1.next().value;
var p2 = it2.next().value;

p1
.then( function(data){
	it1.next( data );
	return p2;
} )
.then( function(data){
	it2.next( data );
} );
```

دو instance از `*reqData(..)` هم‌زمان شروع می‌شوند، Ajax می‌زنند و روی `yield` pause می‌کنند. بعد ما انتخاب می‌کنیم وقتی `p1` resolve شد instance اول resume شود، و بعد با resolve شدن `p2` instance دوم restart شود. به این شکل با orchestration Promise تضمین می‌کنیم `res[0]` پاسخ اول و `res[1]` پاسخ دوم باشد.

اما واقعاً خیلی دستی است، و generatorها چندان خودشان orchestration نمی‌کنند؛ درحالی‌که قدرت اصلی همینجاست. یک روش دیگر:

```js
// `request(..)` is a Promise-aware Ajax utility

var res = [];

function *reqData(url) {
	var data = yield request( url );

	// transfer control
	yield;

	res.push( data );
}

var it1 = reqData( "http://some.url.1" );
var it2 = reqData( "http://some.url.2" );

var p1 = it1.next().value;
var p2 = it2.next().value;

p1.then( function(data){
	it1.next( data );
} );

p2.then( function(data){
	it2.next( data );
} );

Promise.all( [p1,p2] )
.then( function(){
	it1.next();
	it2.next();
} );
```

این کمی بهتر است (هرچند هنوز دستی!) چون حالا دو instance از `*reqData(..)` واقعاً concurrent و (حداقل در بخش اول) مستقل اجرا می‌شوند.

در snippet قبلی، instance دوم داده‌اش را بعد از پایان کامل instance اول می‌گرفت. اما اینجا هر instance به‌محض رسیدن response خودش داده را می‌گیرد و سپس یک `yield` دیگر برای transfer کنترل انجام می‌دهد. بعد ترتیب resume را در handler مربوط به `Promise.all([ .. ])` انتخاب می‌کنیم.

نکته‌ی کمتر واضح این است که این رویکرد به‌خاطر تقارنش، راه را برای یک utility reusable ساده‌تر باز می‌کند. حتی بهتر هم می‌شود. فرض کنید utilityای به نام `runAll(..)` داشته باشیم:

```js
// `request(..)` is a Promise-aware Ajax utility

var res = [];

runAll(
	function*(){
		var p1 = request( "http://some.url.1" );

		// transfer control
		yield;

		res.push( yield p1 );
	},
	function*(){
		var p2 = request( "http://some.url.2" );

		// transfer control
		yield;

		res.push( yield p2 );
	}
);
```

**نکته:** کد `runAll(..)` را اینجا نمی‌آوریم، چون هم طولانی است هم ادامه‌ی منطق `run(..)` قبلی است. به‌عنوان تمرین خوب، سعی کنید `run(..)` را به شکلی تکامل دهید که مثل `runAll(..)` کار کند. همچنین `runner(..)` در کتابخانه‌ی *asynquence* من همین قابلیت را دارد و در پیوست A بحث می‌شود.

پردازش داخلی `runAll(..)` این‌طور خواهد بود:

1. generator اول Promise مربوط به Ajax اول (`"http://some.url.1"`) را می‌گیرد و کنترل را با `yield` به `runAll(..)` برمی‌گرداند.
2. generator دوم هم همین کار را برای `"http://some.url.2"` می‌کند و کنترل را برمی‌گرداند.
3. generator اول resume می‌شود و Promise خودش (`p1`) را yield می‌کند. `runAll(..)` مثل `run(..)` روی آن منتظر resolve می‌ماند و همان generator را resume می‌کند (بدون transfer کنترل). وقتی `p1` resolve شد، `runAll(..)` generator اول را با مقدار resolved ادامه می‌دهد و `res[0]` مقدار می‌گیرد. با finish شدن generator اول، transfer کنترل ضمنی رخ می‌دهد.
4. generator دوم resume می‌شود، `p2` را yield می‌کند، منتظر resolve می‌ماند، و بعد `runAll(..)` آن را با مقدار resolved ادامه می‌دهد تا `res[1]` تنظیم شود.

در مثال ما از متغیر بیرونی `res` برای ذخیره‌ی نتیجه‌های دو Ajax استفاده کردیم -- همین متغیر مشترک، هماهنگی concurrency را ممکن کرد.

اما شاید بهتر باشد `runAll(..)` را بیشتر توسعه دهیم تا فضای متغیر داخلی shared برای چند instance generator بدهد، مثلاً یک object خالی که پایین اسمش را `data` گذاشته‌ایم. همچنین می‌تواند مقدارهای non-Promise که yield می‌شوند را بگیرد و به generator بعدی پاس بدهد.

مثال:

```js
// `request(..)` is a Promise-aware Ajax utility

runAll(
	function*(data){
		data.res = [];

		// transfer control (and message pass)
		var url1 = yield "http://some.url.2";

		var p1 = request( url1 ); // "http://some.url.1"

		// transfer control
		yield;

		data.res.push( yield p1 );
	},
	function*(data){
		// transfer control (and message pass)
		var url2 = yield "http://some.url.1";

		var p2 = request( url2 ); // "http://some.url.2"

		// transfer control
		yield;

		data.res.push( yield p2 );
	}
);
```

در این صورت‌بندی، دو generator فقط کنترل را هماهنگ نمی‌کنند، بلکه واقعاً با هم ارتباط هم برقرار می‌کنند: هم از طریق `data.res` و هم از طریق پیام‌های yield شده که `url1` و `url2` را ردوبدل می‌کند. این فوق‌العاده قدرتمند است!

این درک همچنین پایه‌ی مفهومی تکنیک async پیشرفته‌تری به نام CSP (Communicating Sequential Processes) است که در پیوست B می‌بینیم.
