# Destructuring

ES6 قابلیت نحوی جدیدی به نام *destructuring* معرفی می‌کند که اگر آن را *structured assignment* ببینیم، فهمش ساده‌تر می‌شود. مثال:

```js
function foo() {
	return [1,2,3];
}

var tmp = foo(),
	a = tmp[0], b = tmp[1], c = tmp[2];

console.log( a, b, c );				// 1 2 3
```

اینجا valueهای array خروجی `foo()` را دستی به `a` و `b` و `c` assign کردیم و مجبور شدیم متغیر واسط `tmp` داشته باشیم.

برای object هم مشابه:

```js
function bar() {
	return {
		x: 4,
		y: 5,
		z: 6
	};
}

var tmp = bar(),
	x = tmp.x, y = tmp.y, z = tmp.z;

console.log( x, y, z );				// 4 5 6
```

این سبک assignment دستی همان structured assignment است. ES6 syntax اختصاصی destructuring می‌دهد (array destructuring و object destructuring) تا از `tmp` خلاص شویم:

```js
var [ a, b, c ] = foo();
var { x: x, y: y, z: z } = bar();

console.log( a, b, c );				// 1 2 3
console.log( x, y, z );				// 4 5 6
```

در حالت عادی `[a,b,c]` را در سمت راست `=` می‌دیدیم، اما در destructuring همین الگو به سمت چپ می‌رود و به‌عنوان pattern برای شکستن value سمت راست استفاده می‌شود.

### Object Property Assignment Pattern

در `{ x: x, .. }` اگر نام property و variable یکسان باشد، shorthand داریم:

```js
var { x, y, z } = bar();

console.log( x, y, z );				// 4 5 6
```

اما فرم بلند کاربرد مهمی دارد: می‌توان property را به variable با نام متفاوت assign کرد:

```js
var { x: bam, y: baz, z: bap } = bar();

console.log( bam, baz, bap );		// 4 5 6
console.log( x, y, z );				// ReferenceError
```

اینجا یک نکتهٔ خیلی مهم هست: در object literal معمولی pattern ما `target: source` است:

```js
var X = 10, Y = 20;

var o = { a: X, b: Y };

console.log( o.a, o.b );			// 10 20
```

اما در object destructuring (وقتی `{ .. }` سمت چپ `=` است) pattern برعکس می‌شود:

```js
var { x: bam, y: baz, z: bap } = bar();
```

یعنی اینجا `source: target` داریم. `x: bam` یعنی value از property `x` می‌آید و به variable `bam` می‌رود.

راه دیگر فهم این وارونگی:

```js
var aa = 10, bb = 20;

var o = { x: aa, y: bb };
var     { x: AA, y: BB } = o;

console.log( AA, BB );				// 10 20
```

در هر دو خط، `x` و `y` نام property هستند. این تقارن کمک می‌کند وارونگی syntax را بهتر بپذیریم.

**نکته:** شاید syntaxی مثل `{ AA: x, BB: y }` سازگارتر به‌نظر می‌رسید، اما طراحی ES6 این نیست؛ پس باید ذهن‌مان را به این inversion عادت دهیم.

### Not Just Declarations

destructuring فقط declaration نیست، assignment عمومی است:

```js
var a, b, c, x, y, z;

[a,b,c] = foo();
( { x, y, z } = bar() );

console.log( a, b, c );				// 1 2 3
console.log( x, y, z );				// 4 5 6
```

یعنی variableها می‌توانند از قبل declare شده باشند.

**نکته:** در object destructuring بدون `var`/`let`/`const` باید کل assignment را داخل `( )` بگذارید؛ وگرنه `{ .. }` ابتدای statement به‌عنوان block statement تفسیر می‌شود نه object.

سمت target هم لازم نیست identifier ساده باشد؛ هر assignment expression معتبر مجاز است:

```js
var o = {};

[o.a, o.b, o.c] = foo();
( { x: o.x, y: o.y, z: o.z } = bar() );

console.log( o.a, o.b, o.c );		// 1 2 3
console.log( o.x, o.y, o.z );		// 4 5 6
```

property محاسبه‌شده هم می‌شود:

```js
var which = "x",
	o = {};

( { [which]: o[which] } = bar() );

console.log( o.x );					// 4
```

همین assignmentهای عمومی اجازهٔ mapping/transform هم می‌دهند:

```js
var o1 = { a: 1, b: 2, c: 3 },
	o2 = {};

( { a: o2.x, b: o2.y, c: o2.z } = o1 );

console.log( o2.x, o2.y, o2.z );	// 1 2 3
```

object به array:

```js
var o1 = { a: 1, b: 2, c: 3 },
	a2 = [];

( { a: a2[0], b: a2[1], c: a2[2] } = o1 );

console.log( a2 );					// [1,2,3]
```

array به object:

```js
var a1 = [ 1, 2, 3 ],
	o2 = {};

[ o2.a, o2.b, o2.c ] = a1;

console.log( o2.a, o2.b, o2.c );	// 1 2 3
```

مرتب‌سازی مجدد array:

```js
var a1 = [ 1, 2, 3 ],
	a2 = [];

[ a2[2], a2[0], a2[1] ] = a1;

console.log( a2 );					// [2,3,1]
```

و حتی swap دو variable بدون temp:

```js
var x = 10, y = 20;

[ y, x ] = [ x, y ];

console.log( x, y );				// 20 10
```

**هشدار:** declaration و assignment را بی‌دلیل مخلوط نکنید، مگر اینکه بخواهید همهٔ targetها declaration هم محسوب شوند. به همین دلیل در مثال‌ها `var a2 = []` جدا نوشته شد و بعد `[ a2[0], .. ] = ..`. نوشتن `var [ a2[0], .. ] = ..` معتبر نیست.

### Repeated Assignments

در object destructuring می‌شود یک source property را چند بار لیست کرد:

```js
var { a: X, a: Y } = { a: 1 };

X;	// 1
Y;	// 1
```

پس می‌توانید هم sub-object/array را destructure کنید و هم خود value آن را بگیرید:

```js
var { a: { x: X, x: Y }, a } = { a: { x: 1 } };

X;	// 1
Y;	// 1
a;	// { x: 1 }

( { a: X, a: Y, a: [ Z ] } = { a: [ 1 ] } );

X.push( 2 );
Y[0] = 10;

X;	// [10,2]
Y;	// [10,2]
Z;	// 1
```

نکتهٔ خوانایی: بهتر است patternهای destructuring پیچیده را چندخطی و با indentation مناسب بنویسید:

```js
// harder to read:
var { a: { b: [ c, d ], e: { f } }, g } = obj;

// better:
var {
	a: {
		b: [ c, d ],
		e: { f }
	},
	g
} = obj;
```

یادآوری مهم: **هدف destructuring فقط کم‌تایپی نیست، بلکه خوانایی declarative بیشتر است.**

#### Destructuring Assignment Expressions

completion value در assignment expression destructuring (object/array) همان value کامل سمت راست است:

```js
var o = { a:1, b:2, c:3 },
	a, b, c, p;

p = { a, b, c } = o;

console.log( a, b, c );			// 1 2 3
p === o;						// true
```

برای array هم همین:

```js
var o = [1,2,3],
	a, b, c, p;

p = [ a, b, c ] = o;

console.log( a, b, c );			// 1 2 3
p === o;						// true
```

و چون completion حفظ می‌شود، chaining هم ممکن است:

```js
var o = { a:1, b:2, c:3 },
	p = [4,5,6],
	a, b, c, x, y, z;

( {a} = {b,c} = o );
[x,y] = [z] = p;

console.log( a, b, c );			// 1 2 3
console.log( x, y, z );			// 4 5 4
```

### Too Many, Too Few, Just Enough

در destructuring لازم نیست همهٔ valueهای موجود را assign کنید:

```js
var [,b] = foo();
var { x, z } = bar();

console.log( b, x, z );				// 2 4 6
```

valueهای استفاده‌نشده discard می‌شوند.

اگر target بیشتر از value موجود بخواهید، fallback طبیعی `undefined` است:

```js
var [,,c,d] = foo();
var { w, z } = bar();

console.log( c, z );				// 3 6
console.log( d, w );				// undefined undefined
```

این رفتار با اصل "`undefined` is missing" سازگار است.

`...` علاوه بر function declaration در destructuring هم gather می‌کند:

```js
var a = [2,3,4];
var b = [ 1, ...a, 5 ];

console.log( b );					// [1,2,3,4,5]
```

اینجا `...a` در value-position است و spread می‌کند. اما در pattern destructuring، gather می‌کند:

```js
var a = [2,3,4];
var [ b, ...c ] = a;

console.log( b, c );				// 2 [3,4]
```

`b` مقدار اول را می‌گیرد و `...c` بقیه را array می‌کند.

**نکته:** spread/gather روی object در ES6 نیست؛ در فصل ۸ دربارهٔ قابلیت احتمالی «فراتر از ES6» صحبت می‌شود.

### Default Value Assignment

هر دو نوع destructuring امکان default value برای assignment دارند (`=`)، شبیه default پارامتر تابع:

```js
var [ a = 3, b = 6, c = 9, d = 12 ] = foo();
var { x = 5, y = 10, z = 15, w = 20 } = bar();

console.log( a, b, c, d );			// 1 2 3 12
console.log( x, y, z, w );			// 4 5 6 20
```

ترکیب با syntax alias هم ممکن است:

```js
var { x, y, z, w: WW = 20 } = bar();

console.log( x, y, z, WW );			// 4 5 6 20
```

در defaultهایی که object/array هستند مراقب باشید، چون کد خیلی سخت‌خوان می‌شود:

```js
var x = 200, y = 300, z = 100;
var o1 = { x: { y: 42 }, z: { y: z } };

( { y: x = { y: y } } = o1 );
( { z: y = { y: z } } = o1 );
( { x: z = { y: x } } = o1 );
```

خروجی:

```js
console.log( x.y, y.y, z.y );		// 300 100 42
```

جمع‌بندی: destructuring بسیار مفید است، ولی تیغ تیز هم هست و استفادهٔ ناآگاهانه می‌تواند مغز خواننده را زخمی کند!

### Nested Destructuring

اگر valueهای شما object/array تودرتو داشته باشند، می‌توانید همان nested levelها را هم destructure کنید:

```js
var a1 = [ 1, [2, 3, 4], 5 ];
var o1 = { x: { y: { z: 6 } } };

var [ a, [ b, c, d ], e ] = a1;
var { x: { y: { z: w } } } = o1;

console.log( a, b, c, d, e );		// 1 2 3 4 5
console.log( w );					// 6
```

nested destructuring راه ساده‌ای برای flatten کردن namespace object هم هست:

```js
var App = {
	model: {
		User: function(){ .. }
	}
};

// instead of:
// var User = App.model.User;

var { model: { User } } = App;
```

### Destructuring Parameters

در snippet زیر assignment کجاست؟

```js
function foo(x) {
	console.log( x );
}

foo( 42 );
```

assignment پنهان است: argument یعنی `42` هنگام اجرای `foo(42)` به parameter یعنی `x` assign می‌شود. اگر pairing آرگومان/پارامتر assignment است، پس می‌تواند destructure هم شود.

array destructuring برای پارامترها:

```js
function foo( [ x, y ] ) {
	console.log( x, y );
}

foo( [ 1, 2 ] );					// 1 2
foo( [ 1 ] );						// 1 undefined
foo( [] );							// undefined undefined
```

object destructuring برای پارامترها:

```js
function foo( { x, y } ) {
	console.log( x, y );
}

foo( { y: 1, x: 2 } );				// 2 1
foo( { y: 42 } );					// undefined 42
foo( {} );							// undefined undefined
```

این تکنیک تقریباً شبیه named arguments (درخواستی قدیمی برای JS) عمل می‌کند: propertyهای object به parameterهای هم‌نام map می‌شوند. در نتیجه optional parameterها (در هر موقعیت) هم رایگان می‌گیریم.

تمام variationهای destructuring که گفتیم (nested، default و ...) در parameter destructuring هم قابل استفاده‌اند و با default parameter/rest parameterهای ES6 هم خوب ترکیب می‌شوند:

```js
function f1([ x=2, y=3, z ]) { .. }
function f2([ x, y, ...z], w) { .. }
function f3([ x, y, ...z], ...w) { .. }

function f4({ x: X, y }) { .. }
function f5({ x: X = 10, y = 20 }) { .. }
function f6({ x = 10 } = {}, { y } = { y: 10 }) { .. }
```

مثال:

```js
function f3([ x, y, ...z], ...w) {
	console.log( x, y, z, w );
}

f3( [] );							// undefined undefined [] []
f3( [1,2,3,4], 5, 6 );				// 1 2 [3,4] [5,6]
```

اینجا دو `...` داریم و هر دو gather می‌کنند: `...z` از باقی valueهای array اول، و `...w` از باقی argumentهای اصلی بعد از اولی.

#### Destructuring Defaults + Parameter Defaults

یک نکتهٔ خیلی ظریف و مهم: فرق رفتار default در destructuring با default خود parameter تابع.

```js
function f6({ x = 10 } = {}, { y } = { y: 10 }) {
	console.log( x, y );
}

f6();								// 10 10
```

در نگاه اول هر دو `x` و `y` انگار default `10` دارند، اما رفتارشان در برخی حالت‌ها متفاوت است:

```js
f6( {}, {} );						// 10 undefined
```

چرا؟ `x` به‌صورت destructuring default تعریف شده (`x = 10`) و وقتی property `x` در object اول نباشد اعمال می‌شود.

اما `{ y: 10 }` default *پارامتر تابع* برای argument دوم است، نه destructuring default برای property `y`. پس فقط وقتی اعمال می‌شود که argument دوم اصلاً پاس نشود یا `undefined` باشد.

در `f6({}, {})` ما argument دوم (`{}`) را داده‌ایم؛ بنابراین default پارامتر `{ y: 10 }` فعال نمی‌شود و destructuring `{ y }` روی object خالی انجام می‌شود؛ نتیجه: `y` برابر `undefined`.

مقایسهٔ مهم:

* `{ x = 10 } = {}`
* `{ y } = { y: 10 }`

در حالت `x`:
1) اگر argument اول حذف/undefined باشد، default object یعنی `{}` اعمال می‌شود.
2) سپس destructuring `{ x = 10 }` روی همان object انجام می‌شود.
3) اگر `x` نباشد (یا `undefined` باشد)، مقدار `10` می‌گیرد.

برای مرور:

```js
function f6({ x = 10 } = {}, { y } = { y: 10 }) {
	console.log( x, y );
}

f6();								// 10 10
f6( undefined, undefined );			// 10 10
f6( {}, undefined );				// 10 10

f6( {}, {} );						// 10 undefined
f6( undefined, {} );				// 10 undefined

f6( { x: 2 }, { y: 3 } );			// 2 3
```

معمولاً رفتار `x` مطلوب‌تر و منطقی‌تر از رفتار `y` است. پس مهم است دقیق بفهمید چرا `{ x = 10 } = {}` با `{ y } = { y: 10 }` فرق دارد.

اگر هنوز کمی مبهم است، دوباره بخوانید و خودتان با مثال‌ها بازی کنید. آیندهٔ شما بابت فهم همین gotcha ظریف از شما تشکر خواهد کرد.

#### Nested Defaults: Destructured and Restructured

با ترکیب object destructuring و چیزی که می‌توان *restructuring* نامید، یک idiom جالب برای default دادن به propertyهای nested object به‌دست می‌آید.

فرض کنید defaultها به این شکل باشند:

```js
// taken from: http://es-discourse.com/t/partial-default-arguments/120/7

var defaults = {
	options: {
		remove: true,
		enable: false,
		instance: {}
	},
	log: {
		warn: true,
		error: true
	}
};
```

و objectی مثل `config` داشته باشید که بعضی تنظیمات را دارد و بعضی را نه:

```js
var config = {
	options: {
		remove: false,
		instance: null
	}
};
```

روش دستی سنتی:

```js
config.options = config.options || {};
config.options.remove = (config.options.remove !== undefined) ?
	config.options.remove : defaults.options.remove;
config.options.enable = (config.options.enable !== undefined) ?
	config.options.enable : defaults.options.enable;
...
```

خیلی ناخوشایند است.

روش assign-overwrite با `Object.assign(..)` وسوسه‌کننده است:

```js
config = Object.assign( {}, defaults, config );
```

اما مشکل بزرگ: `Object.assign(..)` shallow است. یعنی `defaults.options` را deep clone نمی‌کند، فقط reference را کپی می‌کند. برای deep clone واقعی باید در همهٔ سطوح درخت object این کار را انجام دهید.

**نکته:** خیلی از libraryها deep clone دارند، ولی جزئیات و gotchaهایشان خارج از بحث فعلی است.

حالا ببینیم destructuring+defaults کمک می‌کند:

```js
config.options = config.options || {};
config.log = config.log || {};
({
	options: {
		remove: config.options.remove = defaults.options.remove,
		enable: config.options.enable = defaults.options.enable,
		instance: config.options.instance = defaults.options.instance
	} = {},
	log: {
		warn: config.log.warn = defaults.log.warn,
		error: config.log.error = defaults.log.error
	} = {}
} = config);
```

از روش دستی بهتر است، هرچند هنوز verbose و تکراری است.

اینجا از مکانیزم destructuring/default به‌صورت hack استفاده شده تا checkهای `=== undefined` و تصمیم assignment را انجام دهد. عملاً `config` destructure می‌شود، اما valueهای destructureشده دوباره داخل خود `config` بازنویسی می‌شوند.

روش بهتر: اگر propertyها نام‌های یکتا داشته باشند، می‌توانیم ابتدا همه را به variableهای top-level destructure کنیم، بعد فوری restructure کنیم و object nested اولیه را بازسازی کنیم.

برای جلوگیری از آلوده شدن scope با variableهای موقت، از block scope استفاده می‌کنیم:

```js
// merge `defaults` into `config`
{
	// destructure (with default value assignments)
	let {
		options: {
			remove = defaults.options.remove,
			enable = defaults.options.enable,
			instance = defaults.options.instance
		} = {},
		log: {
			warn = defaults.log.warn,
			error = defaults.log.error
		} = {}
	} = config;

	// restructure
	config = {
		options: { remove, enable, instance },
		log: { warn, error }
	};
}
```

این approach خواناتر است.

**نکته:** به‌جای block عمومی `{ }` و `let` می‌شد arrow IIFE هم استفاده کرد: destructuring/defaultها در parameter list و restructuring در `return` بدنه.

syntax `{ warn, error }` در بخش restructuring همان concise properties است که در بخش بعدی فصل پوشش داده می‌شود.
