# Generatorها + Promiseها

قطعاً می‌شود مجموعه‌ای از Promiseها را به‌صورت chain نوشت تا کنترل جریان async برنامه را بیان کند. مثال:

```js
step1()
.then(
	step2,
	step1Failed
)
.then(
	function step3(msg) {
		return Promise.all( [
			step3a( msg ),
			step3b( msg ),
			step3c( msg )
		] )
	}
)
.then(step4);
```

اما گزینه‌ی خیلی بهتری برای بیان کنترل جریان async وجود دارد، و از نظر سبک کدنویسی هم احتمالاً از chainهای بلند Promise بسیار خوش‌خوان‌تر است. می‌توانیم از چیزی که در فصل ۳ درباره‌ی generatorها یاد گرفتیم استفاده کنیم.

الگوی مهمی که باید ببینید این است: یک generator می‌تواند یک Promise را `yield` کند، و سپس همان Promise طوری متصل شود که با مقدار fulfillment خودش، generator را از سر بگیرد.

همان کنترل جریان async مثال قبلی را این بار با generator ببینید:

```js
function *main() {

	try {
		var ret = yield step1();
	}
	catch (err) {
		ret = yield step1Failed( err );
	}

	ret = yield step2( ret );

	// step 3
	ret = yield Promise.all( [
		step3a( ret ),
		step3b( ret ),
		step3c( ret )
	] );

	yield step4( ret );
}
```

در نگاه اول شاید این قطعه‌کد نسبت به chain Promise در نمونه‌ی قبلی پرحرف‌تر به نظر برسد. با این حال، سبک کدنویسی بسیار جذاب‌تر -- و مهم‌تر از آن، قابل‌فهم‌تر و قابل‌استدلال‌تر -- شبیه کد sync ارائه می‌دهد (با انتساب `=` به «مقادیر بازگشتی» و ...). مخصوصاً این‌که می‌توان `try..catch` را در طول مرزهای پنهان async هم برای مدیریت خطا استفاده کرد.

چرا با generator از Promise استفاده می‌کنیم؟ قطعاً می‌شود کدنویسی async با generator را بدون Promise هم انجام داد.

Promiseها یک سیستم قابل‌اعتماد هستند که وارونگی کنترلِ callbackها یا thunkهای معمول را برمی‌گردانند (به کتاب *Async & Performance* در همین مجموعه مراجعه کنید). بنابراین ترکیب اعتمادپذیری Promiseها با ظاهر sync کد در generatorها، عملاً ضعف‌های اصلی callbackها را پوشش می‌دهد. ضمن این‌که utilityهایی مثل `Promise.all([ .. ])` روشی تمیز و روشن برای بیان concurrency در یک گام `yield` از generator هستند.

این «جادو» چطور کار می‌کند؟ به یک *runner* نیاز داریم که generator را اجرا کند، Promise `yield`شده را دریافت کند، و آن را طوری وصل کند که generator یا با مقدار موفقیت fulfillment ادامه پیدا کند، یا با reason رد شدن، خطا داخل generator `throw` شود.

خیلی از utilityها/کتابخانه‌های async چنین «runner»ای دارند؛ مثلاً `Q.spawn(..)` یا افزونه‌ی `runner(..)` در asynquence من. اما این یک runner مستقل است تا روند کار را روشن کند:

```js
function run(gen) {
	var args = [].slice.call( arguments, 1), it;

	it = gen.apply( this, args );

	return Promise.resolve()
		.then( function handleNext(value){
			var next = it.next( value );

			return (function handleResult(next){
				if (next.done) {
					return next.value;
				}
				else {
					return Promise.resolve( next.value )
						.then(
							handleNext,
							function handleErr(err) {
								return Promise.resolve(
									it.throw( err )
								)
								.then( handleResult );
							}
						);
				}
			})( next );
		} );
}
```

**نکته:** برای نسخه‌ای با توضیحات کامنتی خیلی بیشتر از این utility، کتاب *Async & Performance* همین مجموعه را ببینید. همچنین runnerهایی که کتابخانه‌های async مختلف ارائه می‌دهند، اغلب قدرتمندتر از نمونه‌ی این‌جا هستند. مثلاً `runner(..)` در asynquence می‌تواند Promiseهای `yield`شده، sequenceها، thunkها و مقادیر فوری (غیر Promise) را مدیریت کند و انعطاف بسیار بالایی بدهد.

پس اجرای `*main()` که در نمونه‌ی قبلی دیدیم، حالا به سادگی این است:

```js
run( main )
.then(
	function fulfilled(){
		// `*main()` completed successfully
	},
	function rejected(reason){
		// Oops, something went wrong
	}
);
```

عملاً هرجا در برنامه‌تان بیش از دو گام async برای منطق کنترل جریان دارید، می‌توانید -- و بهتر است -- از generatorِ Promise-yielding که با یک utilityِ run هدایت می‌شود استفاده کنید تا کنترل جریان را به شکلی شبیه sync بیان کنید. این کار باعث می‌شود کد خیلی راحت‌تر فهمیده و نگهداری شود.

این الگوی «yield کردن Promise و ادامه دادن generator» آن‌قدر رایج و قدرتمند است که نسخه‌ی بعدی جاوااسکریپت پس از ES6 تقریباً قطعاً یک نوع تابع جدید معرفی می‌کند که این کار را خودکار انجام دهد و دیگر به utilityِ run نیاز نباشد. در فصل ۸، `async function`ها (نام مورد انتظارشان) را پوشش می‌دهیم.
