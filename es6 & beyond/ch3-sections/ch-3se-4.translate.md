# Classes

از همان سال‌های ابتدایی JavaScript، syntax و الگوهای توسعه تلاش می‌کردند ظاهر class-oriented به زبان بدهند. وجود چیزهایی مثل `new` و `instanceof` و propertyای مثل `.constructor` خیلی‌ها را وسوسه می‌کرد که JS حتماً جایی «class واقعی» دارد.

البته «class» در JS معادل class کلاسیک نیست. تفاوت‌ها مستند شده‌اند.

**نکته:** برای الگوهای fake class در JS و نگاه «delegation» به prototype، نیمهٔ دوم کتاب *this & Object Prototypes* را ببینید.

### `class`

با اینکه prototype mechanism در JS مثل class سنتی کار نمی‌کند، تقاضای زیاد برای syntax شبیه class باعث شد ES6 keyword `class` را اضافه کند.

این قابلیت حاصل یک بحث طولانی و پرچالش بود و در نهایت یک سازش بین دیدگاه‌های متفاوت شد. بسیاری از طرفداران class از بعضی بخش‌ها راضی‌اند، اما هنوز قسمت‌هایی را ناکافی می‌دانند. TC39 هم روی تکمیل آن در post-ES6 کار می‌کند.

هستهٔ مکانیزم جدید:

```js
class Foo {
	constructor(a,b) {
		this.x = a;
		this.y = b;
	}

	gimmeXY() {
		return this.x * this.y;
	}
}
```

نکات:

* `class Foo` یک function ویژه به نام `Foo` می‌سازد.
* `constructor(..)` امضا و بدنهٔ function `Foo(..)` را مشخص می‌کند.
* methodهای class از concise method syntax استفاده می‌کنند (مثل object literal)، شامل generator و getter/setter. اما methodهای class غیر-enumerable هستند.
* در body کلاس بین اعضا comma نداریم (و مجاز هم نیست).

معادل تقریبی pre-ES6:

```js
function Foo(a,b) {
	this.x = a;
	this.y = b;
}

Foo.prototype.gimmeXY = function() {
	return this.x * this.y;
}
```

استفاده:

```js
var f = new Foo( 5, 15 );

f.x;						// 5
f.y;						// 15
f.gimmeXY();				// 75
```

اما `class Foo` دقیقاً مثل `function Foo` نیست:

* باید با `new` صدا زده شود (`Foo.call(obj)` دیگر جواب نمی‌دهد).
* `class` مثل `function` hoist نمی‌شود؛ باید قبل از استفاده declare شود.
* `class Foo` در global scope identifier لغوی می‌سازد ولی property global object با آن نام نمی‌سازد.

`instanceof` همچنان کار می‌کند، چون `class` نهایتاً constructor function می‌سازد. ES6 با `Symbol.hasInstance` هم امکان custom کردن رفتار `instanceof` می‌دهد.

راه مفید برای فکر کردن به `class`: نوعی *macro* برای پر کردن خودکار `prototype` (و در صورت `extends`، تنظیم ارتباط `[[Prototype]]`).

**نکته:** `class` expression هم داریم:
`var x = class Y { .. }`

### `extends` and `super`

ES6 برای اتصال prototype chain بین classها syntax `extends` می‌دهد:

```js
class Bar extends Foo {
	constructor(a,b,c) {
		super( a, b );
		this.z = c;
	}

	gimmeXYZ() {
		return super.gimmeXY() * this.z;
	}
}

var b = new Bar( 5, 15, 25 );

b.x;						// 5
b.y;						// 15
b.z;						// 25
b.gimmeXYZ();				// 1875
```

`super` اضافهٔ مهم ES6 است. در constructor به parent constructor اشاره می‌کند (`Foo(..)`)، در method به parent object (`Foo.prototype`).

`Bar extends Foo` یعنی `Bar.prototype` به `Foo.prototype` لینک می‌شود.

**نکته:** `super` فقط مخصوص class نیست؛ در object literal هم کار می‌کند.

#### There Be `super` Dragons

`super` بسته به محل استفاده رفتار متفاوتی دارد. بیشتر وقت‌ها مشکلی نیست، ولی خارج از الگوی رایج ممکن است غافلگیر شوید.

در constructor، `super.prototype` کاربردی ندارد؛ `super(..)` عملاً call به parent constructor است.

در method، `super.constructor` به function `Foo` اشاره می‌کند، اما معمولاً کاربرد عملی کمی دارد.

مهم‌تر: `super` مثل `this` dynamic نیست؛ *static* bind می‌شود. یعنی در زمان declaration متد به همان class hierarchy قفل می‌شود.

پس اگر methodی که `super` دارد را با `call/apply` برای class دیگر borrow کنید، `this` عوض می‌شود ولی `super` نه:

```js
class ParentA {
	constructor() { this.id = "a"; }
	foo() { console.log( "ParentA:", this.id ); }
}

class ParentB {
	constructor() { this.id = "b"; }
	foo() { console.log( "ParentB:", this.id ); }
}

class ChildA extends ParentA {
	foo() {
		super.foo();
		console.log( "ChildA:", this.id );
	}
}

class ChildB extends ParentB {
	foo() {
		super.foo();
		console.log( "ChildB:", this.id );
	}
}

var a = new ChildA();
a.foo();					// ParentA: a
							// ChildA: a
var b = new ChildB();		// ParentB: b
b.foo();					// ChildB: b
```

```js
// borrow `b.foo()` to use in `a` context
b.foo.call( a );			// ParentB: a
							// ChildB: a
```

`this` dynamic rebind شده، ولی `super` همچنان به `ParentB` قفل است.

نتیجه: `class + super` با hierarchy ایستا خوب کار می‌کند. اگر انعطاف dynamic و borrow/mixin زیاد می‌خواهید، احتمالاً رویکرد classless object + `[[Prototype]]` delegation مناسب‌تر است.

#### Subclass Constructor

constructor در class/subclass اجباری نیست؛ اگر ننویسید، default constructor جایگزین می‌شود.

در subclass، default constructor به‌طور خودکار parent constructor را با همهٔ argumentها صدا می‌زند:

```js
constructor(...args) {
	super(...args);
}
```

این با برخی زبان‌ها متفاوت است (مثلاً Java). در الگوهای pre-ES6 هم این auto-call به‌صورت پیش‌فرض نبود.

نکتهٔ مهم دیگر: در constructor subclass تا قبل از `super(..)` اجازهٔ دسترسی به `this` ندارید؛ چون parent constructor مسئول ساخت/initialize `this` است.

pre-ES6:

```js
function Foo() {
	this.a = 1;
}

function Bar() {
	this.b = 2;
	Foo.call( this );
}

// `Bar` "extends" `Foo`
Bar.prototype = Object.create( Foo.prototype );
```

ES6 معادل زیر مجاز نیست:

```js
class Foo {
	constructor() { this.a = 1; }
}

class Bar extends Foo {
	constructor() {
		this.b = 2;			// not allowed before `super()`
		super();			// to fix swap these two statements
	}
}
```

#### `extend`ing Natives

یکی از مزیت‌های مهم `class/extends`: subclass کردن nativeها مثل `Array`:

```js
class MyCoolArray extends Array {
	first() { return this[0]; }
	last() { return this[this.length - 1]; }
}

var a = new MyCoolArray( 1, 2, 3 );

a.length;					// 3
a;							// [1,2,3]

a.first();					// 1
a.last();					// 3
```

در pre-ES6 شبه-subclass کردن `Array` ناقص بود (مثلاً `length` درست رفتار نمی‌کرد). ES6 این مشکل را بهتر حل می‌کند.

همین‌طور برای `Error` و custom error:

```js
class Oops extends Error {
	constructor(reason) {
		super(reason);
		this.oops = reason;
	}
}

// later:
var ouch = new Oops( "I messed up!" );
throw ouch;
```

این object واقعاً مثل Error واقعی رفتار می‌کند (از جمله `stack`).

### `new.target`

ES6 یک meta property جدید معرفی می‌کند: `new.target`.

در function معمولی همیشه `undefined` است. در constructor به constructorای اشاره می‌کند که واقعاً با `new` صدا زده شده، حتی اگر از parent constructor توسط `super(..)` وارد شده باشید:

```js
class Foo {
	constructor() {
		console.log( "Foo: ", new.target.name );
	}
}

class Bar extends Foo {
	constructor() {
		super();
		console.log( "Bar: ", new.target.name );
	}
	baz() {
		console.log( "baz: ", new.target );
	}
}

var a = new Foo();
// Foo: Foo

var b = new Bar();
// Foo: Bar   <-- respects the `new` call-site
// Bar: Bar

b.baz();
// baz: undefined
```

اگر `new.target` برابر `undefined` باشد یعنی function بدون `new` صدا زده شده.

### `static`

وقتی `Bar extends Foo` داریم، علاوه بر لینک prototypeها، constructor functionها هم chain جداگانه‌ای دارند. این برای `static` methodها مفید است، چون روی خود constructor function قرار می‌گیرند نه روی `prototype`:

```js
class Foo {
	static cool() { console.log( "cool" ); }
	wow() { console.log( "wow" ); }
}

class Bar extends Foo {
	static awesome() {
		super.cool();
		console.log( "awesome" );
	}
	neat() {
		super.wow();
		console.log( "neat" );
	}
}

Foo.cool();					// "cool"
Bar.cool();					// "cool"
Bar.awesome();				// "cool"
							// "awesome"

var b = new Bar();
b.neat();					// "wow"
							// "neat"

b.awesome;					// undefined
b.cool;						// undefined
```

پس static member روی chain constructorهاست، نه روی chain prototype instanceها.

#### `Symbol.species` Constructor Getter

جایی که `static` کاربردی است: تعریف getter برای `Symbol.species` در subclass.

با آن می‌توانید به parent بگویید هنگام ساخت instance جدید (در methodهای parent) از کدام constructor استفاده کند.

مثلاً برای subclass از `Array` که می‌خواهید methodهایی مثل `map` همچنان `Array` معمولی برگردانند:

```js
class MyCoolArray extends Array {
	// force `species` to be parent constructor
	static get [Symbol.species]() { return Array; }
}

var a = new MyCoolArray( 1, 2, 3 ),
	b = a.map( function(v){ return v * 2; } );

b instanceof MyCoolArray;	// false
b instanceof Array;			// true
```

نمونهٔ عمومی‌تر:

```js
class Foo {
	// defer `species` to derived constructor
	static get [Symbol.species]() { return this; }
	spawn() {
		return new this.constructor[Symbol.species]();
	}
}

class Bar extends Foo {
	// force `species` to be parent constructor
	static get [Symbol.species]() { return Foo; }
}

var a = new Foo();
var b = a.spawn();
b instanceof Foo;					// true

var x = new Bar();
var y = x.spawn();
y instanceof Bar;					// false
y instanceof Foo;					// true
```

در `Foo` مقدار species به derived defer می‌شود (`return this`). `Bar` آن را override می‌کند و `Foo` را برمی‌گرداند.
