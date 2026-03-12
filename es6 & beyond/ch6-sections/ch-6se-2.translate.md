# `Object`

چند helper ایستای دیگر هم به `Object` اضافه شده‌اند. به‌صورت سنتی، این نوع توابع بیشتر روی رفتار/قابلیت‌های مقدارهای آبجکتی متمرکز بودند.

اما از ES6 به بعد، توابع ایستای `Object` برای APIهای عمومی سراسری هم به کار می‌روند؛ هر نوع APIای که جای طبیعی‌تری در بخش دیگری ندارد (مثلاً `Array.from(..)`).

### تابع ایستای `Object.is(..)`

تابع ایستای `Object.is(..)` مقایسه‌ی مقدارها را حتی سخت‌گیرانه‌تر از `===` انجام می‌دهد.

`Object.is(..)` الگوریتم درونی `SameValue` را فراخوانی می‌کند (مشخصات ES6، بخش 7.2.9). الگوریتم `SameValue` تقریباً مثل الگوریتم مقایسه‌ی برابری strict یعنی `===` است (مشخصات ES6، بخش 7.2.13)، با دو استثنای مهم.

مثال:

```js
var x = NaN, y = 0, z = -0;

x === x;							// false
y === z;							// true

Object.is( x, x );					// true
Object.is( y, z );					// false
```

برای مقایسه‌ی strict همچنان بهتر است از `===` استفاده کنید؛ `Object.is(..)` جایگزین عملگر نیست. اما وقتی می‌خواهید دقیقاً `NaN` یا `-0` را تشخیص بدهید، `Object.is(..)` گزینه‌ی ترجیحی است.

**نکته:** ES6 همچنین utilityای به نام `Number.isNaN(..)` اضافه می‌کند (کمی بعد در همین فصل) که شاید کمی راحت‌تر باشد؛ ممکن است `Number.isNaN(x)` را به `Object.is(x,NaN)` ترجیح دهید. می‌توانید `-0` را با عبارت دست‌وپاگیر `x == 0 && 1 / x === -Infinity` هم دقیق تشخیص دهید، اما `Object.is(x,-0)` خیلی بهتر است.

### تابع ایستای `Object.getOwnPropertySymbols(..)`

بخش «Symbolها» در فصل ۲ درباره‌ی نوع primitive جدید Symbol در ES6 توضیح می‌دهد.

احتمالاً Symbolها بیشتر به‌عنوان ویژگی‌های ویژه (meta) روی آبجکت‌ها استفاده می‌شوند. به همین دلیل utility `Object.getOwnPropertySymbols(..)` معرفی شده که فقط ویژگی‌های symbol متعلق به خود آبجکت را برمی‌گرداند:

```js
var o = {
	foo: 42,
	[ Symbol( "bar" ) ]: "hello world",
	baz: true
};

Object.getOwnPropertySymbols( o );	// [ Symbol(bar) ]
```

### تابع ایستای `Object.setPrototypeOf(..)`

در فصل ۲ به utility `Object.setPrototypeOf(..)` هم اشاره کردیم که (همان‌طور که از اسمش پیداست) `[[Prototype]]` آبجکت را برای *واگذاری رفتار* (behavior delegation) تنظیم می‌کند (کتاب *this & Object Prototypes* این مجموعه را ببینید). مثال:

```js
var o1 = {
	foo() { console.log( "foo" ); }
};
var o2 = {
	// .. o2's definition ..
};

Object.setPrototypeOf( o2, o1 );

// delegates to `o1.foo()`
o2.foo();							// foo
```

یا به شکل دیگر:

```js
var o1 = {
	foo() { console.log( "foo" ); }
};

var o2 = Object.setPrototypeOf( {
	// .. o2's definition ..
}, o1 );

// delegates to `o1.foo()`
o2.foo();							// foo
```

در هر دو مثال قبلی، رابطه‌ی بین `o2` و `o1` انتهای تعریف `o2` دیده می‌شود. معمول‌تر این است که این رابطه در ابتدای تعریف `o2` مشخص شود، مثل کلاس‌ها و نیز `__proto__` در object literalها (بخش «تنظیم `[[Prototype]]`» در فصل ۲).

**هشدار:** تنظیم `[[Prototype]]` بلافاصله بعد از ساخت آبجکت منطقی است، همان‌طور که دیدیم. اما تغییر آن خیلی دیرتر معمولاً ایده‌ی خوبی نیست و غالباً بیشتر باعث ابهام می‌شود تا شفافیت.

### تابع ایستای `Object.assign(..)`

خیلی از کتابخانه‌ها/فریم‌ورک‌های JavaScript utilityهایی برای کپی/ترکیب ویژگی‌های یک آبجکت در آبجکت دیگر دارند (مثلاً `extend(..)` در jQuery). بین این utilityها تفاوت‌های ظریفی وجود دارد؛ مثل این‌که آیا ویژگی با مقدار `undefined` نادیده گرفته می‌شود یا نه.

ES6 متد `Object.assign(..)` را اضافه می‌کند که نسخه‌ای ساده‌شده از این الگوریتم‌هاست. آرگومان اول *target* است و بقیه آرگومان‌ها *source* هستند که به ترتیب پردازش می‌شوند. برای هر source، کلیدهای enumerable و own آن (یعنی نه «ارث‌بری‌شده»)، شامل symbolها، مانند انتساب ساده‌ی `=` کپی می‌شوند. `Object.assign(..)` در نهایت خودِ target را برمی‌گرداند.

چیدمان آبجکت زیر را در نظر بگیرید:

```js
var target = {},
	o1 = { a: 1 }, o2 = { b: 2 },
	o3 = { c: 3 }, o4 = { d: 4 };

// setup read-only property
Object.defineProperty( o3, "e", {
	value: 5,
	enumerable: true,
	writable: false,
	configurable: false
} );

// setup non-enumerable property
Object.defineProperty( o3, "f", {
	value: 6,
	enumerable: false
} );

o3[ Symbol( "g" ) ] = 7;

// setup non-enumerable symbol
Object.defineProperty( o3, Symbol( "h" ), {
	value: 8,
	enumerable: false
} );

Object.setPrototypeOf( o3, o4 );
```

فقط ویژگی‌های `a`، `b`، `c`، `e` و `Symbol("g")` به `target` کپی می‌شوند:

```js
Object.assign( target, o1, o2, o3 );

target.a;							// 1
target.b;							// 2
target.c;							// 3

Object.getOwnPropertyDescriptor( target, "e" );
// { value: 5, writable: true, enumerable: true,
//   configurable: true }

Object.getOwnPropertySymbols( target );
// [Symbol("g")]
```

ویژگی‌های `d`، `f` و `Symbol("h")` در کپی لحاظ نمی‌شوند؛ ویژگی‌های non-enumerable و همچنین ویژگی‌های non-own همگی از assign حذف می‌شوند. همچنین `e` به‌صورت انتساب عادی کپی می‌شود، نه به شکل read-only.

کمی قبل دیدیم با `setPrototypeOf(..)` رابطه‌ی `[[Prototype]]` بین `o2` و `o1` می‌سازیم. یک فرم دیگر هم هست که از `Object.assign(..)` استفاده می‌کند:

```js
var o1 = {
	foo() { console.log( "foo" ); }
};

var o2 = Object.assign(
	Object.create( o1 ),
	{
		// .. o2's definition ..
	}
);

// delegates to `o1.foo()`
o2.foo();							// foo
```

**نکته:** `Object.create(..)` utility استاندارد ES5 است که یک آبجکت خالی می‌سازد و آن را با `[[Prototype]]` لینک می‌کند. برای جزئیات بیشتر، کتاب *this & Object Prototypes* این مجموعه را ببینید.
