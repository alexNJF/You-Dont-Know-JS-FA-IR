# تکرار Generatorها به‌صورت Async

Generator دقیقاً چه ربطی به الگوهای کدنویسی async، حل مشکلات callback و این چیزها دارد؟ برویم سراغ همین سؤال مهم.

بیایید یکی از سناریوهای فصل ۳ را دوباره نگاه کنیم. نسخه‌ی callback را به خاطر بیاورید:

```js
function foo(x,y,cb) {
	ajax(
		"http://some.url.1/?x=" + x + "&y=" + y,
		cb
	);
}

foo( 11, 31, function(err,text) {
	if (err) {
		console.error( err );
	}
	else {
		console.log( text );
	}
} );
```

اگر بخواهیم همین flow-control را با generator بیان کنیم، می‌توانیم این‌طور بنویسیم:

```js
function foo(x,y) {
	ajax(
		"http://some.url.1/?x=" + x + "&y=" + y,
		function(err,data){
			if (err) {
				// throw an error into `*main()`
				it.throw( err );
			}
			else {
				// resume `*main()` with received `data`
				it.next( data );
			}
		}
	);
}

function *main() {
	try {
		var text = yield foo( 11, 31 );
		console.log( text );
	}
	catch (err) {
		console.error( err );
	}
}

var it = main();

// start it all up!
it.next();
```

در نگاه اول، این snippet نسبت به callback قبلی طولانی‌تر و شاید کمی پیچیده‌تر به نظر برسد. ولی این حس اولیه گمراه‌کننده است. نسخه‌ی generator در واقع **خیلی** بهتر است! فقط باید اجزای درونش را باز کنیم.

اول مهم‌ترین بخش کد را ببینیم:

```js
var text = yield foo( 11, 31 );
console.log( text );
```

یک لحظه فکر کنید این کد چطور کار می‌کند. یک تابع معمولی `foo(..)` را صدا می‌زنیم و ظاهراً با وجود async بودن Ajax، مقدار `text` را مستقیم می‌گیریم.

چطور ممکن است؟ اوایل فصل ۱ کد تقریباً مشابه داشتیم:

```js
var data = ajax( "..url 1.." );
console.log( data );
```

و آن کد کار نمی‌کرد! فرقش را می‌بینید؟ `yield` داخل generator.

این همان جادوست! چیزی که اجازه می‌دهد کد ظاهراً blocking/synchronous داشته باشیم بدون اینکه کل برنامه block شود؛ فقط کد داخل خود generator pause/block می‌شود.

در `yield foo(11,31)` ابتدا `foo(11,31)` صدا زده می‌شود که چیزی برنمی‌گرداند (`undefined`). یعنی داریم درخواست داده می‌دهیم، و عملاً `yield undefined` انجام می‌شود. این مشکلی ندارد، چون فعلاً کد ما روی مقدار yield شده برای کار خاصی تکیه نکرده. جلوتر دوباره به این نکته برمی‌گردیم.

اینجا `yield` را در معنای message-passing استفاده نکرده‌ایم؛ فقط برای flow-control و pause/block. البته message-passing هم رخ می‌دهد، اما فقط یک‌طرفه، بعد از resume شدن generator.

پس generator روی `yield` pause می‌کند و عملاً می‌پرسد: «چه مقداری باید برگردد تا به متغیر `text` assign شود؟» چه کسی جواب می‌دهد؟

`foo(..)` را ببینید. اگر Ajax موفق باشد، این را صدا می‌زنیم:

```js
it.next( data );
```

این کار generator را با داده‌ی پاسخ resume می‌کند، یعنی expression مربوط به `yield` که متوقف بود همین مقدار را مستقیم می‌گیرد، و وقتی کد generator دوباره راه می‌افتد، مقدار به `text` انتساب می‌یابد.

باحال نیست؟

یک قدم عقب بروید و اثرش را ببینید. داخل generator کدی کاملاً synchronous-looking داریم (به‌جز خود کلمه‌ی `yield`)، اما پشت‌صحنه و داخل `foo(..)` عملیات می‌تواند async کامل شود.

**این خیلی بزرگ است!** تقریباً یک راه‌حل کامل برای مشکلی که قبلاً گفتیم: callback نمی‌تواند ناهمگامی را به‌شکل ترتیبی و synchronous که مغز ما می‌فهمد بیان کند.

در اصل ناهمگامی را به detail پیاده‌سازی پنهان تبدیل می‌کنیم تا بتوانیم درباره‌ی flow-control به‌صورت synchronous/sequential فکر کنیم: «یک Ajax request بزن، و وقتی تمام شد پاسخ را چاپ کن.» و اینجا فقط دو گام بیان کردیم؛ همین توانایی بدون محدودیت به هر تعداد گام قابل گسترش است.

**نکته:** این درک آن‌قدر مهم است که بد نیست همین چند پاراگراف آخر را یک‌بار دیگر بخوانید تا کاملاً جا بیفتد.

### مدیریت خطای همزمان‌نما

اما کد generator بالا یک امتیاز دیگر هم دارد. بیایید به `try..catch` داخل generator دقت کنیم:

```js
try {
	var text = yield foo( 11, 31 );
	console.log( text );
}
catch (err) {
	console.error( err );
}
```

این چطور کار می‌کند؟ `foo(..)` async تمام می‌شود، و مگر نگفته بودیم `try..catch` خطای async را نمی‌گیرد (فصل ۳)؟

قبلاً دیدیم `yield` اجازه می‌دهد statement انتساب pause کند تا `foo(..)` تمام شود و پاسخ در `text` بنشیند. بخش فوق‌العاده اینجاست که همین pause شدن `yield` اجازه می‌دهد generator خطا را هم `catch` کند. خطا را با این بخش از کد قبلی به داخل generator `throw` می‌کنیم:

```js
if (err) {
	// throw an error into `*main()`
	it.throw( err );
}
```

ماهیت pause در generator یعنی نه‌تنها از فراخوانی async مقدار برگشتی همزمان‌نما می‌گیریم، بلکه می‌توانیم خطاهای همان فراخوانی async را هم به‌صورت همزمان‌نما `catch` کنیم!

پس دیدیم می‌شود خطا را *به داخل* generator پرتاب کرد. حالا *به بیرون* generator چطور؟ دقیقاً همان‌طور که انتظار دارید:

```js
function *main() {
	var x = yield "Hello World";

	yield x.toLowerCase();	// cause an exception!
}

var it = main();

it.next().value;			// Hello World

try {
	it.next( 42 );
}
catch (err) {
	console.error( err );	// TypeError
}
```

البته می‌توانستیم به‌جای ایجاد exception، دستی با `throw ..` خطا بیندازیم.

حتی می‌توانیم همان خطایی را که با `throw(..)` به generator می‌اندازیم `catch` کنیم؛ یعنی به generator فرصت مدیریت بدهیم و اگر مدیریت نکرد، کد iterator باید بگیرد:

```js
function *main() {
	var x = yield "Hello World";

	// never gets here
	console.log( x );
}

var it = main();

it.next();

try {
	// will `*main()` handle this error? we'll see!
	it.throw( "Oops" );
}
catch (err) {
	// nope, didn't handle it!
	console.error( err );			// Oops
}
```

مدیریت خطای synchronous-looking (با `try..catch`) در کد async یک برد خیلی بزرگ برای خوانایی و reason-ability است.
