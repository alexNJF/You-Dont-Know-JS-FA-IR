# `try..finally`

احتمالاً با نحوهٔ کار بلوک `try..catch` آشنا هستید. اما آیا تا به حال به بند `finally` که می‌تواند با آن جفت شود فکر کرده‌اید؟ در واقع، آیا می‌دانستید که `try` فقط به `catch` یا `finally` نیاز دارد، هرچند در صورت نیاز هر دو می‌توانند حاضر باشند.

کد در بند `finally` *همیشه* اجرا می‌شود (هرچه باشد)، و همیشه درست بعد از تمام شدن `try` (و `catch` در صورت وجود)، قبل از هر کد دیگر اجرا می‌شود. به یک معنا، می‌توانید کد در بند `finally` را نوعی داخل یک تابع callback تصور کنید که صرف‌نظر از رفتار بقیهٔ بلوک همیشه فراخوانی می‌شود.

پس اگر داخل بند `try` یک statement `return` باشد چه می‌شود؟ واضح است که مقداری برمی‌گرداند، درست؟ اما آیا کد فراخوان‌کننده‌ای که آن مقدار را دریافت می‌کند قبل یا بعد از `finally` اجرا می‌شود؟

```js
function foo() {
	try {
		return 42;
	}
	finally {
		console.log( "Hello" );
	}

	console.log( "never runs" );
}

console.log( foo() );
// Hello
// 42
```

`return 42` فوراً اجرا می‌شود، که مقدار تکمیل فراخوانی `foo()` را تنظیم می‌کند. این عمل بند `try` را تکمیل می‌کند و بلافاصله بعد بند `finally` اجرا می‌شود. فقط آنگاه تابع `foo()` کامل است، تا مقدار تکمیلش برای استفادهٔ statement `console.log(..)` برگردانده شود.

دقیقاً همان رفتار برای `throw` داخل `try` برقرار است:

```js
 function foo() {
	try {
		throw 42;
	}
	finally {
		console.log( "Hello" );
	}

	console.log( "never runs" );
}

console.log( foo() );
// Hello
// Uncaught Exception: 42
```

حالا، اگر یک exception (تصادفی یا عمدی) داخل بند `finally` پرتاب شود، به‌عنوان تکمیل اصلی آن تابع override می‌شود. اگر یک `return` قبلی در بلوک `try` مقدار تکمیل تابع را تنظیم کرده بود، آن مقدار رها می‌شود.

```js
function foo() {
	try {
		return 42;
	}
	finally {
		throw "Oops!";
	}

	console.log( "never runs" );
}

console.log( foo() );
// Uncaught Exception: Oops!
```

نباید تعجب‌آور باشد که statementهای کنترل غیرخطی دیگر مثل `continue` و `break` رفتاری مشابه `return` و `throw` نشان می‌دهند:

```js
for (var i=0; i<10; i++) {
	try {
		continue;
	}
	finally {
		console.log( i );
	}
}
// 0 1 2 3 4 5 6 7 8 9
```

statement `console.log(i)` در انتهای تکرار حلقه اجرا می‌شود، که به‌خاطر statement `continue` است. با این حال، هنوز قبل از statement به‌روزرسانی تکرار `i++` اجرا می‌شود، که دلیل چاپ مقدارهای `0..9` به‌جای `1..10` است.

| NOTE: |
| :--- |
| ES6 یک statement `yield` اضافه می‌کند، در generatorها (عنوان *Async & Performance* این مجموعه را ببینید) که از جهاتی می‌توان آن را یک statement `return` میانی دانست. با این حال، برخلاف `return`، یک `yield` تا ازسرگیری generator کامل نیست، یعنی یک `try { .. yield .. }` تکمیل نشده. پس یک بند `finally` متصل بلافاصله بعد از `yield` مثل `return` اجرا نمی‌شود. |

یک `return` داخل `finally` توانایی خاص override کردن یک `return` قبلی از بند `try` یا `catch` را دارد، اما فقط اگر `return` صریحاً فراخوانی شود:

```js
function foo() {
	try {
		return 42;
	}
	finally {
		// no `return ..` here, so no override
	}
}

function bar() {
	try {
		return 42;
	}
	finally {
		// override previous `return 42`
		return;
	}
}

function baz() {
	try {
		return 42;
	}
	finally {
		// override previous `return 42`
		return "Hello";
	}
}

foo();	// 42
bar();	// undefined
baz();	// "Hello"
```

معمولاً، حذف `return` در یک تابع همان `return;` یا حتی `return undefined;` است، اما داخل بلوک `finally` حذف `return` مثل یک `return undefined` overrideکننده عمل نمی‌کند؛ فقط می‌گذارد `return` قبلی بماند.

در واقع، اگر `finally` را با `break` دارای label (که قبلاً در فصل بحث شد) ترکیب کنیم واقعاً می‌توانیم دیوانگی را بالا ببریم:

```js
function foo() {
	bar: {
		try {
			return 42;
		}
		finally {
			// break out of `bar` labeled block
			break bar;
		}
	}

	console.log( "Crazy" );

	return "Hello";
}

console.log( foo() );
// Crazy
// Hello
```

اما... این کار را نکنید. جدی. استفاده از `finally` + `break` دارای label برای لغو مؤثر یک `return` یعنی تمام تلاشتان برای ساخت گیج‌کننده‌ترین کد ممکن. شرط می‌بندم هیچ مقدار کامنت این کد را نجات نمی‌دهد.
