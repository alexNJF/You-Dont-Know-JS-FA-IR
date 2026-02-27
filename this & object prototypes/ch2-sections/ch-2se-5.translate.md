# `this` واژگانی

توابع معمولی از ۴ قانونی که پوشش دادیم پیروی می‌کنند. اما ES6 نوع خاصی از تابع معرفی می‌کند که از این قوانین استفاده نمی‌کند: arrow-function.

Arrow-functionها نه با واژه‌کلیدی `function` بلکه با عملگر به‌اصطلاح «فلش چاق» یعنی `=>` مشخص می‌شوند. به‌جای استفاده از چهار قانون استاندارد `this`، arrow-functionها binding مربوط به `this` را از scope احاطه‌کننده (تابع یا سراسری) می‌گیرند.

بیایید lexical scope مربوط به arrow-function را نشان دهیم:

```js
function foo() {
	// return an arrow function
	return (a) => {
		// `this` here is lexically adopted from `foo()`
		console.log( this.a );
	};
}

var obj1 = {
	a: 2
};

var obj2 = {
	a: 3
};

var bar = foo.call( obj1 );
bar.call( obj2 ); // 2, not 3!
```

arrow-function ساخته‌شده در `foo()` هرچه `this` مربوط به `foo()` در زمان فراخوانی‌اش باشد را به‌صورت واژگانی ضبط می‌کند. چون `foo()` به `obj1` با `this` bind شده بود، `bar` (ارجاع به arrow-function برگشتی) هم به `obj1` با `this` bind می‌شود. binding واژگانی arrow-function قابل override نیست (حتی با `new`!).

رایج‌ترین مورد استفاده احتمالاً در callbackهاست، مثل event handlerها یا timerها:

```js
function foo() {
	setTimeout(() => {
		// `this` here is lexically adopted from `foo()`
		console.log( this.a );
	},100);
}

var obj = {
	a: 2
};

foo.call( obj ); // 2
```

هرچند arrow-functionها جایگزینی برای استفاده از `bind(..)` روی تابع برای اطمینان از `this` آن فراهم می‌کنند که می‌تواند جذاب به نظر برسد، مهم است بدانید که در اصل مکانیزم سنتی `this` را به نفع lexical scoping گسترده‌تر فهمیده‌شده غیرفعال می‌کنند. قبل از ES6، الگوی نسبتاً رایجی برای این کار داشتیم که اساساً تقریباً از نظر روح با arrow-functionهای ES6 غیرقابل تشخیص است:

```js
function foo() {
	var self = this; // lexical capture of `this`
	setTimeout( function(){
		console.log( self.a );
	}, 100 );
}

var obj = {
	a: 2
};

foo.call( obj ); // 2
```

هرچند `self = this` و arrow-functionها هر دو به نظر «راه‌حل» خوبی برای نخواستن استفاده از `bind(..)` می‌رسند، در اصل به‌جای فهم و پذیرش `this` از آن فرار می‌کنند.

اگر دیدید کد به سبک `this` می‌نویسید، اما بیشتر یا همیشه مکانیزم `this` را با lexical `self = this` یا «ترفند»های arrow-function شکست می‌دهید، شاید باید یا:

1. فقط از lexical scope استفاده کنید و تظاهر دروغین کد به سبک `this` را فراموش کنید.

2. مکانیزم‌های به سبک `this` را کاملاً بپذیرید، از جمله استفاده از `bind(..)` در جایی که لازم است، و سعی کنید از «ترفند»های `self = this` و «lexical this» با arrow-function اجتناب کنید.

یک برنامه می‌تواند هر دو سبک کد (lexical و `this`) را به‌طور مؤثر استفاده کند، اما داخل همان تابع، و در واقع برای همان نوع جستجوها، مخلوط کردن دو مکانیزم معمولاً یعنی درخواست کد سخت‌تر برای نگهداری، و احتمالاً بیش از حد برای باهوش بودن زحمت کشیدن.
