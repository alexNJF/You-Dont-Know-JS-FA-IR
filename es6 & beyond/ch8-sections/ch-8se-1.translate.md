# `async function`ها

در بخش «Generators + Promises» فصل ۴ گفتیم پیشنهادی وجود دارد برای پشتیبانی سینتکسی مستقیم از الگویی که در آن generatorها Promise `yield` می‌کنند و یک utility شبیه runner پس از کامل‌شدن Promise آن‌ها را ادامه می‌دهد. بیایید نگاهی کوتاه به این قابلیت پیشنهادی به نام `async function` بیندازیم.

نمونه‌ی generator فصل ۴ را یادتان بیاورید:

```js
run( function *main() {
	var ret = yield step1();

	try {
		ret = yield step2( ret );
	}
	catch (err) {
		ret = yield step2Failed( err );
	}

	ret = yield Promise.all([
		step3a( ret ),
		step3b( ret ),
		step3c( ret )
	]);

	yield step4( ret );
} )
.then(
	function fulfilled(){
		// `*main()` completed successfully
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

سینتکس پیشنهادی `async function` همین منطق کنترل جریان را بدون utilityِ `run(..)` بیان می‌کند، چون JS خودش می‌فهمد کجا باید منتظر Promise بماند و بعد ادامه دهد:

```js
async function main() {
	var ret = await step1();

	try {
		ret = await step2( ret );
	}
	catch (err) {
		ret = await step2Failed( err );
	}

	ret = await Promise.all( [
		step3a( ret ),
		step3b( ret ),
		step3c( ret )
	] );

	await step4( ret );
}

main()
.then(
	function fulfilled(){
		// `main()` completed successfully
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

به‌جای `function *main() { ..` از فرم `async function main() { ..` استفاده می‌کنیم. و به‌جای `yield` کردن Promise، آن را `await` می‌کنیم. فراخوانی `main()` خودش Promise برمی‌گرداند که مستقیم قابل observe است؛ همان معادلی که قبلاً از `run(main)` می‌گرفتیم.

تقارن را می‌بینید؟ `async function` عملاً sugar سینتکسی روی الگوی generators + promises + `run(..)` است؛ زیر پوسته همان منطق را اجرا می‌کند.

اگر توسعه‌دهنده‌ی #C هستید و `async`/`await` برایتان آشناست، دلیلش این است که این قابلیت مستقیماً از ویژگی مشابه در #C الهام گرفته شده. دیدن همگرایی زبان‌ها جذاب است.

Babel، Traceur و transpilerهای دیگر از الان پشتیبانی اولیه از وضعیت فعلی `async function` دارند، پس همین حالا می‌توانید استفاده کنید. اما در بخش بعد («Caveats») می‌بینیم چرا شاید هنوز نباید عجله کنید.

**نکته:** پیشنهادی هم برای `async function*` وجود دارد که به آن «async generator» می‌گویند. در یک کد می‌توانید هم `yield` داشته باشید هم `await`، حتی در یک statement مثل `x = await yield y`. به نظر می‌رسد پیشنهاد async generator هنوز در حال تغییر بیشتری است -- مخصوصاً مقدار بازگشتی‌اش هنوز کاملاً نهایی نشده. بعضی‌ها معتقدند باید یک *observable* برگرداند (چیزی شبیه ترکیب iterator و Promise). فعلاً وارد جزئیاتش نمی‌شویم.

### ملاحظات (Caveats)

یکی از بحث‌های حل‌نشده درباره‌ی `async function` این است که چون فقط Promise برمی‌گرداند، از بیرون راهی برای *cancel* کردن نمونه‌ی درحال‌اجرای آن وجود ندارد. این می‌تواند مشکل شود اگر عملیات async پرهزینه باشد و بخواهید به‌محض بی‌نیازشدن از نتیجه، منابع آزاد شوند.

مثال:

```js
async function request(url) {
	var resp = await (
		new Promise( function(resolve,reject){
			var xhr = new XMLHttpRequest();
			xhr.open( "GET", url );
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						resolve( xhr );
					}
					else {
						reject( xhr.statusText );
					}
				}
			};
			xhr.send();
		} )
	);

	return resp.responseText;
}

var pr = request( "http://some.url.1" );

pr.then(
	function fulfilled(responseText){
		// ajax success
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

این `request(..)` شبیه utility پیشنهادی `fetch(..)` در پلتفرم وب است. سؤال این‌جاست: اگر بخواهید با `pr` somehow اعلام کنید که درخواست Ajax طولانی باید cancel شود چه؟

Promiseها (فعلاً) cancelable نیستند. به نظر من و خیلی‌های دیگر، اساساً هم نباید باشند (کتاب *Async & Performance* را ببینید). و حتی اگر Promise متد `cancel()` داشت، آیا واقعاً باید `pr.cancel()` سیگنال لغو را در کل زنجیره تا خود `async function` propagate کند؟

چند راه‌حل پیشنهادی برای این بحث مطرح شده:

* `async function` اصلاً cancelable نباشد (وضعیت فعلی)
* در زمان فراخوانی، یک «cancel token» به async function پاس داده شود
* نوع مقدار بازگشتی به یک Promise قابل لغو جدید تغییر کند
* مقدار بازگشتی به چیزی غیر Promise تغییر کند (مثلاً observable یا control token با قابلیت Promise و cancel)

در زمان نگارش متن، `async function`ها Promise معمولی برمی‌گرداندند، پس احتمال تغییر کامل نوع بازگشتی کمتر به نظر می‌رسد. با این حال هنوز زود است که نتیجه‌ی نهایی را قطعی بدانیم.
