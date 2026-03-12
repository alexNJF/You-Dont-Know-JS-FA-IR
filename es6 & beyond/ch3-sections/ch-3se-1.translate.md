# Iterators

*iterator* یک الگوی ساخت‌یافته برای بیرون کشیدن اطلاعات از یک منبع به‌صورت «یک مورد در هر بار» است. این الگو مدت‌هاست در برنامه‌نویسی وجود دارد. در JS هم توسعه‌دهندگان از سال‌ها قبل به‌صورت ad hoc چنین سازوکاری می‌ساختند؛ بنابراین اصل موضوع جدید نیست.

آنچه ES6 اضافه کرده، یک interface استاندارد ضمنی برای iteratorهاست. بسیاری از ساختارهای دادهٔ built-in در JavaScript حالا iterator مطابق این استاندارد ارائه می‌دهند. شما هم می‌توانید iteratorهای خودتان را با همین قرارداد بسازید تا سازگاری حداکثری داشته باشید.

iteratorها راهی برای سازمان‌دهی مصرف ترتیبی، پشت‌سرهم و pull-based داده هستند.

مثلاً می‌توانید utilityای بسازید که هر بار یک شناسهٔ یکتا بدهد. یا یک سری نامتناهی از valueها تولید کنید که round-robin روی یک لیست بچرخد. یا روی نتیجهٔ query پایگاه‌داده iterator بگذارید تا سطرها یک‌به‌یک خوانده شوند.

هرچند در JS کمتر با این نگاه استفاده شده، iteratorها را می‌توان به‌عنوان کنترل رفتار قدم‌به‌قدم هم دید. این موضوع با generatorها (بخش بعدی) خیلی واضح‌تر می‌شود، ولی بدون generator هم شدنی است.

### Interfaces

در زمان نگارش این متن، بخش 25.1.1.2 از draft ES6 (https://people.mozilla.org/~jorendorff/es6-draft.html#sec-iterator-interface) برای interface `Iterator` این الزام را تعریف می‌کند:

```
Iterator [required]
	next() {method}: retrieves next IteratorResult
```

دو عضو اختیاری هم وجود دارد:

```
Iterator [optional]
	return() {method}: stops iterator and returns IteratorResult
	throw() {method}: signals error and returns IteratorResult
```

و `IteratorResult`:

```
IteratorResult
	value {property}: current iteration value or final return value
		(optional if `undefined`)
	done {property}: boolean, indicates completion status
```

**نکته:** وقتی می‌گوییم این interfaceها «ضمنی» هستند، منظور این نیست که در specification صریح نیستند؛ هستند. منظور این است که در ES6 شیء مستقیمی به نام interface نداریم که در کد به آن دسترسی مستقیم داشته باشید. رعایت آن‌ها در کد شما قراردادی است. اما هرجا JS iterator انتظار دارد (مثلاً `for..of`)، باید با همین قرارداد سازگار باشید وگرنه کد می‌شکند.

یک interface دیگر هم داریم: `Iterable` برای objectهایی که باید iterator تولید کنند:

```
Iterable
	@@iterator() {method}: produces an Iterator
```

همان‌طور که در فصل ۲ گفتیم، `@@iterator` همان symbol داخلی ویژه‌ای است که متد تولید iterator را نشان می‌دهد.

#### IteratorResult

return value هر عملیات iterator باید objectی با این فرم باشد:

```js
{ value: .. , done: true / false }
```

iteratorهای built-in همیشه همین فرم را می‌دهند، ولی propertyهای اضافه هم (در صورت نیاز) مجاز است.

مثلاً iterator سفارشی می‌تواند metadata اضافه برگرداند: منبع داده، زمان بازیابی، زمان انقضای cache، فرکانس درخواست بعدی و ...

**نکته:** از نظر فنی `value` اگر `undefined` باشد می‌تواند اصلاً وجود نداشته باشد. چون `res.value` در هر دو حالت `undefined` می‌دهد، وجود/عدم‌وجود property بیشتر جزئیات پیاده‌سازی یا بهینه‌سازی است تا تفاوت عملکردی.

### `next()` Iteration

یک array (که iterable است) و iterator آن:

```js
var arr = [1,2,3];

var it = arr[Symbol.iterator]();

it.next();		// { value: 1, done: false }
it.next();		// { value: 2, done: false }
it.next();		// { value: 3, done: false }

it.next();		// { value: undefined, done: true }
```

هر بار که متد `Symbol.iterator` روی `arr` صدا می‌زنید، یک iterator تازه می‌گیرید. بیشتر ساختارها همین‌طورند، از جمله تمام ساختارهای built-in.

البته بعضی ساختارها ممکن است singleton iterator بدهند (مثل بعضی queue consumerها)، یا در هر لحظه فقط یک iterator فعال را مجاز کنند.

دقت کنید iterator بالا هنگام گرفتن `3` هنوز `done: true` نمی‌دهد. باید یک `next()` اضافه بعد از انتهای array صدا بزنید تا completion بیاید. علتش را کمی جلوتر واضح‌تر می‌بینیم، ولی این تصمیم طراحی معمولاً best practice است.

رشته‌های primitive هم به‌صورت پیش‌فرض iterable هستند:

```js
var greeting = "hello world";

var it = greeting[Symbol.iterator]();

it.next();		// { value: "h", done: false }
it.next();		// { value: "e", done: false }
..
```

**نکته:** دقیق‌تر بگوییم خود primitive iterable نیست؛ به‌کمک boxing، `"hello world"` به wrapper از نوع `String` تبدیل می‌شود که iterable است.

ES6 چند ساختار دادهٔ جدید (collections) هم اضافه کرده که هم iterable هستند و هم API برای ساخت iterator می‌دهند:

```js
var m = new Map();
m.set( "foo", 42 );
m.set( { cool: true }, "hello world" );

var it1 = m[Symbol.iterator]();
var it2 = m.entries();

it1.next();		// { value: [ "foo", 42 ], done: false }
it2.next();		// { value: [ "foo", 42 ], done: false }
..
```

متد `next(..)` می‌تواند argument بگیرد. iteratorهای built-in عموماً از این قابلیت استفاده نمی‌کنند، اما iterator مربوط به generatorها می‌کند (بخش بعدی).

طبق قرارداد عمومی (و در built-inها)، صدا زدن `next(..)` روی iterator تمام‌شده خطا نیست و همیشه `{ value: undefined, done: true }` برمی‌گرداند.

### Optional: `return(..)` and `throw(..)`

متدهای اختیاری `return(..)` و `throw(..)` در اکثر iteratorهای built-in پیاده‌سازی نشده‌اند. اما در generatorها معنای مهمی دارند.

`return(..)` سیگنالی است به iterator که مصرف‌کننده دیگر value نمی‌خواهد. تولیدکننده می‌تواند از این سیگنال برای cleanup استفاده کند: آزاد کردن resource شبکه/DB/file و ...

اگر iterator متد `return(..)` داشته باشد و termination زودهنگام یا غیرعادی رخ دهد، `return(..)` خودکار صدا می‌خورد. دستی هم می‌توانید صدا بزنید.

`return(..)` هم مثل `next(..)` یک `IteratorResult` می‌دهد. معمولاً value پاس‌داده‌شده به `return(..)` به‌عنوان `value` برمی‌گردد (با چند مورد ظریف استثنایی).

`throw(..)` برای سیگنال error/exception به iterator است و لزوماً به معنی توقف کامل نیست (برخلاف `return(..)` که معمولاً توقف کامل می‌دهد).

مثلاً در generator، `throw(..)` یک exception را به context paused تزریق می‌کند که با `try..catch` قابل catch است. اگر catch نشود، iterator generator به‌صورت غیرعادی terminate می‌شود.

**نکته:** طبق قرارداد، بعد از `return(..)` یا `throw(..)` iterator نباید نتیجهٔ جدید تولید کند.

### Iterator Loop

همان‌طور که در فصل ۲ گفتیم، `for..of` مستقیماً iterable سازگار را مصرف می‌کند.

اگر iterator خودش iterable هم باشد، می‌توانید مستقیم با `for..of` مصرفش کنید. کافی است `Symbol.iterator` روی آن بگذارید که خود iterator را برگرداند:

```js
var it = {
	// make the `it` iterator an iterable
	[Symbol.iterator]() { return this; },

	next() { .. },
	..
};

it[Symbol.iterator]() === it;		// true
```

حالا:

```js
for (var v of it) {
	console.log( v );
}
```

معادل دستی:

```js
for (var v, res; (res = it.next()) && !res.done; ) {
	v = res.value;
	console.log( v );
}
```

`it.next()` قبل از هر iteration صدا زده می‌شود و بعد `res.done` بررسی می‌گردد. اگر `done` برابر `true` باشد، iteration اجرا نمی‌شود.

اینجا روشن می‌شود چرا گفتیم بهتر است iterator value نهاییِ واقعی را همراه `done: true` برنگرداند. اگر `{ done: true, value: 42 }` بدهید، `for..of` مقدار `42` را دور می‌اندازد. پس بهتر است `done: true` را فقط بعد از ارسال همهٔ valueهای مهم برگردانید.

**هشدار:** می‌توانید عمداً `done: true` را با value مهم برگردانید، اما باید مستند کنید و مصرف‌کننده را مجبور کنید به‌جای الگوی `for..of` از الگوی دیگری استفاده کند.

### Custom Iterators

علاوه بر built-inها، iterator سفارشی هم می‌توانید بسازید. فقط کافی است با interface مناسب سازگار باشید تا در `for..of` و `...` و ... کار کند.

نمونه: سری نامتناهی Fibonacci:

```js
var Fib = {
	[Symbol.iterator]() {
		var n1 = 1, n2 = 1;

		return {
			// make the iterator an iterable
			[Symbol.iterator]() { return this; },

			next() {
				var current = n2;
				n2 = n1;
				n1 = n1 + current;
				return { value: current, done: false };
			},

			return(v) {
				console.log(
					"Fibonacci sequence abandoned."
				);
				return { value: v, done: true };
			}
		};
	}
};

for (var v of Fib) {
	console.log( v );

	if (v > 50) break;
}
// 1 1 2 3 5 8 13 21 34 55
// Fibonacci sequence abandoned.
```

**هشدار:** اگر `break` نداشتیم حلقه برای همیشه اجرا می‌شد.

`Fib[Symbol.iterator]()` object iteratorی با `next()` و `return(..)` می‌سازد و state با closure متغیرهای `n1` و `n2` نگه‌داری می‌شود.

نمونهٔ دیگر: iterator برای queue کارها:

```js
var tasks = {
	[Symbol.iterator]() {
		var steps = this.actions.slice();

		return {
			// make the iterator an iterable
			[Symbol.iterator]() { return this; },

			next(...args) {
				if (steps.length > 0) {
					let res = steps.shift()( ...args );
					return { value: res, done: false };
				}
				else {
					return { done: true }
				}
			},

			return(v) {
				steps.length = 0;
				return { value: v, done: true };
			}
		};
	},
	actions: []
};
```

این iterator functionهای `actions` را یکی‌یکی اجرا می‌کند، argumentهای `next(..)` را پاس می‌دهد و خروجی را در `IteratorResult` برمی‌گرداند.

```js
tasks.actions.push(
	function step1(x){
		console.log( "step 1:", x );
		return x * 2;
	},
	function step2(x,y){
		console.log( "step 2:", x, y );
		return x + (y * 2);
	},
	function step3(x,y,z){
		console.log( "step 3:", x, y, z );
		return (x * y) + z;
	}
);

var it = tasks[Symbol.iterator]();

it.next( 10 );			// step 1: 10
						// { value:   20, done: false }

it.next( 20, 50 );		// step 2: 20 50
						// { value:  120, done: false }

it.next( 20, 50, 120 );	// step 3: 20 50 120
						// { value: 1120, done: false }

it.next();				// { done: true }
```

این مثال نشان می‌دهد iterator فقط برای data نیست؛ برای سازمان‌دهی functionality هم هست. شبیه چیزی که در generatorها می‌بینیم.

حتی می‌توانید iteratorهای meta تعریف کنید؛ مثلاً روی Number:

```js
if (!Number.prototype[Symbol.iterator]) {
	Object.defineProperty(
		Number.prototype,
		Symbol.iterator,
		{
			writable: true,
			configurable: true,
			enumerable: false,
			value: function iterator(){
				var i, inc, done = false, top = +this;

				// iterate positively or negatively?
				inc = 1 * (top < 0 ? -1 : 1);

				return {
					// make the iterator itself an iterable!
					[Symbol.iterator](){ return this; },

					next() {
						if (!done) {
							// initial iteration always 0
							if (i == null) {
								i = 0;
							}
							// iterating positively
							else if (top >= 0) {
								i = Math.min(top,i + inc);
							}
							// iterating negatively
							else {
								i = Math.max(top,i + inc);
							}

							// done after this iteration?
							if (i == top) done = true;

							return { value: i, done: false };
						}
						else {
							return { done: true };
						}
					}
				};
			}
		}
	);
}
```

و نتیجه:

```js
for (var i of 3) {
	console.log( i );
}
// 0 1 2 3

[...-3];				// [0,-1,-2,-3]
```

ترفند جالبی است، هرچند کاربرد عملی‌اش محل بحث است.

یادآوری مهم: دست‌کاری prototypeهای native باید با احتیاط کامل انجام شود.

**نکته:** برای جزئیات بیشتر این تکنیک:
- http://blog.getify.com/iterating-es6-numbers/
- http://blog.getify.com/iterating-es6-numbers/comment-page-1/#comment-535294

### Iterator Consumption

مصرف موردبه‌مورد iterator را با `for..of` دیدیم. ساختارهای ES6 دیگری هم iterator مصرف می‌کنند.

فرض:

```js
var a = [1,2,3,4,5];
```

`...` کل iterator را exhaust می‌کند:

```js
function foo(x,y,z,w,p) {
	console.log( x + y + z + w + p );
}

foo( ...a );			// 15
```

داخل array هم:

```js
var b = [ 0, ...a, 6 ];
b;						// [0,1,2,3,4,5,6]
```

array destructuring هم می‌تواند بخشی یا کل iterator را مصرف کند:

```js
var it = a[Symbol.iterator]();

var [x,y] = it;			// take just the first two elements from `it`
var [z, ...w] = it;		// take the third, then the rest all at once

// is `it` fully exhausted? Yep.
it.next();				// { value: undefined, done: true }

x;						// 1
y;						// 2
z;						// 3
w;						// [4,5]
```
