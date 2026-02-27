# همه به ترتیب

پس اکنون ۴ قانون برای bind کردن `this` در فراخوانی‌های تابع را آشکار کردیم. *همهٔ* کار شما پیدا کردن call-site و بررسی آن برای دیدن کدام قانون اعمال می‌شود است. اما اگر call-site چند قانون واجد شرایط داشته باشد چه؟ باید ترتیب اولویت این قوانین باشد، و پس ترتیب اعمال قوانین را نشان می‌دهیم.

واضح است که *default binding* کم‌اولویت‌ترین قانون از ۴ تاست. پس آن را کنار می‌گذاریم.

*Implicit binding* اولویت دارد یا *explicit binding*؟ بیایید امتحان کنیم:

```js
function foo() {
	console.log( this.a );
}

var obj1 = {
	a: 2,
	foo: foo
};

var obj2 = {
	a: 3,
	foo: foo
};

obj1.foo(); // 2
obj2.foo(); // 3

obj1.foo.call( obj2 ); // 3
obj2.foo.call( obj1 ); // 2
```

پس *explicit binding* بر *implicit binding* اولویت دارد، یعنی **اول** باید بپرسید آیا *explicit binding* اعمال می‌شود قبل از بررسی *implicit binding*.

حالا فقط باید بفهمیم *new binding* در اولویت کجا قرار می‌گیرد.

```js
function foo(something) {
	this.a = something;
}

var obj1 = {
	foo: foo
};

var obj2 = {};

obj1.foo( 2 );
console.log( obj1.a ); // 2

obj1.foo.call( obj2, 3 );
console.log( obj2.a ); // 3

var bar = new obj1.foo( 4 );
console.log( obj1.a ); // 2
console.log( bar.a ); // 4
```

خب، *new binding* بر *implicit binding* اولویت دارد. اما فکر می‌کنید *new binding* نسبت به *explicit binding* اولویت بیشتر دارد یا کمتر؟

**یادداشت:** `new` و `call`/`apply` را نمی‌توان با هم استفاده کرد، پس `new foo.call(obj1)` مجاز نیست تا *new binding* را مستقیماً در برابر *explicit binding* تست کنیم. اما هنوز می‌توانیم از *hard binding* برای تست اولویت دو قانون استفاده کنیم.

قبل از کاوش در یک لیست کد، به نحوهٔ فیزیکی کار *hard binding* فکر کنید، یعنی `Function.prototype.bind(..)` تابع wrapper جدیدی می‌سازد که hard-code شده تا binding مربوط به `this` خودش (هرچه باشد) را نادیده بگیرد و از مورد دستی که ما می‌دهیم استفاده کند.

با آن استدلال، به نظر واضح می‌رسد که *hard binding* (که شکلی از *explicit binding* است) بر *new binding* اولویت دارد و بنابراین با `new` قابل override نیست.

بررسی کنیم:

```js
function foo(something) {
	this.a = something;
}

var obj1 = {};

var bar = foo.bind( obj1 );
bar( 2 );
console.log( obj1.a ); // 2

var baz = new bar( 3 );
console.log( obj1.a ); // 2
console.log( baz.a ); // 3
```

وا! `bar` نسبت به `obj1` hard-bound است، اما `new bar(3)` **نکرد** `obj1.a` را آن‌طور که انتظار داشتیم به `3` تغییر دهد. به‌جای آن، فراخوانی *hard bound* (به `obj1`) یعنی `bar(..)` ***با*** `new` قابل override است. چون `new` اعمال شد، object تازه ساخته‌شده را گرفتیم که `baz` نامیدیم، و در واقع می‌بینیم که `baz.a` مقدار `3` را دارد.

اگر به helper «جعلی» bind ما برگردید باید تعجب‌انگیز باشد:

```js
function bind(fn, obj) {
	return function() {
		fn.apply( obj, arguments );
	};
}
```

اگر دربارهٔ نحوهٔ کار کد helper استدلال کنید، راهی برای فراخوانی با عملگر `new` برای override کردن hard-binding به `obj` همان‌طور که مشاهده کردیم ندارد.

اما `Function.prototype.bind(..)` داخلی از ES5 پیچیده‌تر است، در واقع به‌مراتب. این polyfill (کمی بازفرمت‌شده) از صفحهٔ MDN برای `bind(..)` است:

```js
if (!Function.prototype.bind) {
	Function.prototype.bind = function(oThis) {
		if (typeof this !== "function") {
			// closest thing possible to the ECMAScript 5
			// internal IsCallable function
			throw new TypeError( "Function.prototype.bind - what " +
				"is trying to be bound is not callable"
			);
		}

		var aArgs = Array.prototype.slice.call( arguments, 1 ),
			fToBind = this,
			fNOP = function(){},
			fBound = function(){
				return fToBind.apply(
					(
						this instanceof fNOP &&
						oThis ? this : oThis
					),
					aArgs.concat( Array.prototype.slice.call( arguments ) )
				);
			}
		;

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
	};
}
```

**یادداشت:** polyfill مربوط به `bind(..)` بالا با `bind(..)` داخلی در ES5 دربارهٔ توابع hard-bound که با `new` استفاده می‌شوند فرق دارد (پایین ببینید چرا مفید است). چون polyfill نمی‌تواند تابعی بدون `.prototype` مثل ابزار داخلی بسازد، نوعی ارجاع غیرمستقیم ظریف برای تقریب همان رفتار هست. اگر قصد دارید با تابع hard-bound از `new` استفاده کنید و به این polyfill تکیه دارید، با احتیاط پیش بروید.

بخشی که به `new` اجازهٔ override می‌دهد این است:

```js
this instanceof fNOP &&
oThis ? this : oThis

// ... and:

fNOP.prototype = this.prototype;
fBound.prototype = new fNOP();
```

واقعاً به توضیح نحوهٔ کار این ترفند نمی‌پردازیم (پیچیده و خارج از محدودهٔ ماست)، اما در اصل ابزار تعیین می‌کند آیا تابع hard-bound با `new` فراخوانی شده (که به object تازه ساخته‌شده به‌عنوان `this` منجر می‌شود) یا نه، و اگر چنین است از *همان* `this` تازه ساخته‌شده به‌جای *hard binding* قبلاً مشخص‌شده برای `this` استفاده می‌کند.

چرا مفید است که `new` بتواند *hard binding* را override کند؟

دلیل اصلی این رفتار ساختن تابعی است (که می‌توان با `new` برای construct کردن objectها استفاده کرد) که در اصل *hard binding* مربوط به `this` را نادیده می‌گیرد اما بعضی یا همهٔ argumentهای تابع را از پیش تنظیم می‌کند. یکی از قابلیت‌های `bind(..)` این است که هر argument بعد از اولین argument مربوط به binding یعنی `this` به‌عنوان argumentهای استاندارد پیش‌فرض برای تابع زیرین در نظر گرفته می‌شوند (از نظر فنی «partial application» نامیده می‌شود که زیرمجموعهٔ «currying» است).

مثلاً:

```js
function foo(p1,p2) {
	this.val = p1 + p2;
}

// using `null` here because we don't care about
// the `this` hard-binding in this scenario, and
// it will be overridden by the `new` call anyway!
var bar = foo.bind( null, "p1" );

var baz = new bar( "p2" );

baz.val; // p1p2
```

### تعیین `this`

حالا می‌توانیم قوانین تعیین `this` از call-site فراخوانی تابع را به ترتیب اولویت خلاصه کنیم. این سؤال‌ها را به این ترتیب بپرسید و وقتی اولین قانون اعمال شد متوقف شوید.

1. آیا تابع با `new` فراخوانی شده (**new binding**)? اگر بله، `this` همان object تازه ساخته‌شده است.

    `var bar = new foo()`

2. آیا تابع با `call` یا `apply` (**explicit binding**) فراخوانی شده، حتی پنهان داخل یک *hard binding* با `bind`? اگر بله، `this` همان object صریحاً مشخص‌شده است.

    `var bar = foo.call( obj2 )`

3. آیا تابع با یک context (**implicit binding**) فراخوانی شده، که به‌نام owning یا containing object هم شناخته می‌شود? اگر بله، `this` *همان* context object است.

    `var bar = obj1.foo()`

4. در غیر این صورت، پیش‌فرض **default binding** برای `this`. اگر در `strict mode`، `undefined` را انتخاب کنید، وگرنه global object را.

    `var bar = foo()`

همین. *همین* برای فهم قوانین binding مربوط به `this` برای فراخوانی‌های معمولی تابع کافی است. خوب... تقریباً.
