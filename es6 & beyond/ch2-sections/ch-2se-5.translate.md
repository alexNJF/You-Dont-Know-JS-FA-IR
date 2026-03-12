# Object Literal Extensions

ES6 چند extension کاربردی مهم به object literal سادهٔ `{ .. }` اضافه می‌کند.

### Concise Properties

شکل کلاسیک declaration:

```js
var x = 2, y = 3,
	o = {
		x: x,
		y: y
	};
```

اگر `x: x` همیشه تکراری به نظر می‌رسید، خبر خوب این است: وقتی نام property و identifier یکی است، می‌توانید `x: x` را به `x` کوتاه کنید:

```js
var x = 2, y = 3,
	o = {
		x,
		y
	};
```

### Concise Methods

در همان مسیر concise properties، functionهای property در object literal هم فرم کوتاه دارند.

روش قدیمی:

```js
var o = {
	x: function(){
		// ..
	},
	y: function(){
		// ..
	}
}
```

در ES6:

```js
var o = {
	x() {
		// ..
	},
	y() {
		// ..
	}
}
```

**هشدار:** هرچند `x() { .. }` شبیه shorthand برای `x: function(){ .. }` است، concise method رفتارهای ویژه‌ای دارد که نسخهٔ قدیمی ندارد؛ مهم‌ترینش پشتیبانی `super` (بخش "Object `super`" همین فصل).

generatorها (فصل ۴) هم فرم concise method دارند:

```js
var o = {
	*foo() { .. }
};
```

#### Concisely Unnamed

با اینکه shorthand جذاب است، یک gotcha ظریف دارد. فرض کنید کد پیشا-ES6 زیر را می‌خواهید refactor کنید:

```js
function runSomething(o) {
	var x = Math.random(),
		y = Math.random();

	return o.something( x, y );
}

runSomething( {
	something: function something(x,y) {
		if (x > y) {
			// recursively call with `x`
			// and `y` swapped
			return something( y, x );
		}

		return y - x;
	}
} );
```

نکتهٔ مهم اینجا نام‌گذاری function است:

```js
runSomething( {
	something: function something(x,y) {
		// ..
	}
} );
```

این تکرار ظاهری واقعاً زائد نیست. `something:` نام public property است (`o.something(..)`)، ولی `function something` یک نام lexical برای ارجاع داخل خود تابع است (برای recursion).

بدون این نام داخلی، خط `return something(y,x)` چیزی برای ارجاع ندارد.

بعضی‌ها به‌جایش به نام object تکیه می‌کنند:

```js
var controller = {
	makeRequest: function(..){
		// ..
		controller.makeRequest(..);
	}
};
```

این خطر دارد چون فرض می‌کنید `controller` همیشه به همان object اشاره می‌کند.

بعضی‌ها هم `this` را ترجیح می‌دهند:

```js
var controller = {
	makeRequest: function(..){
		// ..
		this.makeRequest(..);
	}
};
```

این هم اگر همیشه به‌صورت `controller.makeRequest(..)` صدا بزنید کار می‌کند، ولی در سناریوهایی مثل event handler مشکل binding `this` دارید:

```js
btn.addEventListener( "click", controller.makeRequest, false );
```

و بعد مجبور می‌شوید با `.bind(controller)` یا حتی `var self = this` کار را نجات دهید.

حالا برگردیم به concise method:

```js
runSomething( {
	something(x,y) {
		if (x > y) {
			return something( y, x );
		}

		return y - x;
	}
} );
```

این کد می‌شکند! چون `return something(..)` دیگر identifierای به نام `something` پیدا نمی‌کند و `ReferenceError` می‌دهد.

علت: concise method عملاً شبیه این تفسیر می‌شود:

```js
runSomething( {
	something: function(x,y){
		if (x > y) {
			return something( y, x );
		}

		return y - x;
	}
} );
```

یعنی آن نام داخلی `function something` حذف شده است. خلاصه: concise methodها عملاً function expression بی‌نام‌اند.

**نکته:** شاید فکر کنید arrow function راه‌حل است، اما `=>` هم بی‌نام است و این مشکل را حل نمی‌کند (بخش "Arrow Functions").

خبر نیمه‌خوب این است که در ES6 با function name inference، method شما برای debugging کاملاً بی‌نام نمی‌ماند (فصل ۷). اما برای recursion کافی نیست.

نتیجه‌گیری: concise methodها shortcut خوبی‌اند، ولی فقط وقتی از آن‌ها استفاده کنید که به recursion یا event binding/unbinding مبتنی بر نام lexical نیاز نداشته باشید. در غیر این صورت همان سبک قدیمی `something: function something(..)` مطمئن‌تر است.

#### ES5 Getter/Setter

از نظر فنی ES5 فرم literal برای getter/setter داشت، ولی خیلی رایج نشد (تا حدی به‌خاطر نبود transpilerهای مناسب). این قابلیت تازهٔ ES6 نیست، اما با ES6 کاربردی‌تر می‌شود.

```js
var o = {
	__id: 10,
	get id() { return this.__id++; },
	set id(v) { this.__id = v; }
}

o.id;			// 10
o.id;			// 11
o.id = 20;
o.id;			// 20

// and:
o.__id;			// 21
o.__id;			// 21 -- still!
```

همین فرم getter/setter در classها هم وجود دارد (فصل ۳).

**هشدار:** setter literal دقیقاً باید یک پارامتر داشته باشد؛ حذف یا اضافه کردن پارامتر دیگر syntax غیرقانونی است. این پارامتر می‌تواند destructuring/default داشته باشد، ولی `...` در setter مجاز نیست.

### Computed Property Names

گاهی نام property از یک expression می‌آید و نمی‌توان مستقیم داخل literal نوشت:

```js
var prefix = "user_";

var o = {
	baz: function(..){ .. }
};

o[ prefix + "foo" ] = function(..){ .. };
o[ prefix + "bar" ] = function(..){ .. };
..
```

ES6 syntax جدیدی می‌دهد تا expression محاسبه‌شده را در جای نام property بنویسید:

```js
var prefix = "user_";

var o = {
	baz: function(..){ .. },
	[ prefix + "foo" ]: function(..){ .. },
	[ prefix + "bar" ]: function(..){ .. }
	..
};
```

هر expression معتبر داخل `[ .. ]` در موقعیت نام property مجاز است.

کاربرد رایج computed property با `Symbol`هاست (بخش "Symbols" بعداً):

```js
var o = {
	[Symbol.toStringTag]: "really cool thing",
	..
};
```

`Symbol.toStringTag` یک value داخلی ویژه است که با syntax `[ .. ]` evaluate می‌شود تا `"really cool thing"` به آن property ویژه assign شود.

computed property name می‌تواند نام concise method یا concise generator هم باشد:

```js
var o = {
	["f" + "oo"]() { .. }	// computed concise method
	*["b" + "ar"]() { .. }	// computed concise generator
};
```

### Setting `[[Prototype]]`

جزئیات prototype را اینجا باز نمی‌کنیم (برای اطلاعات بیشتر: *this & Object Prototypes*).

گاهی مفید است همزمان با declaration object literal، `[[Prototype]]` آن را هم مشخص کنیم. این الگو سال‌ها extension غیراستاندارد engineها بود و در ES6 استاندارد شد:

```js
var o1 = {
	// ..
};

var o2 = {
	__proto__: o1,
	// ..
};
```

`o2` با literal معمولی ساخته می‌شود ولی همزمان به `o1` به‌صورت `[[Prototype]]`-linked متصل است. نام `__proto__` می‌تواند string `"__proto__"` هم باشد، ولی نمی‌تواند از computed property name بیاید.

`__proto__` قابلیت بحث‌برانگیزی است: extension proprietary قدیمی که در ES6 بیشتر به‌خاطر سازگاری استاندارد شد. حتی در Annex B آمده که ناحیهٔ موارد compatibility است.

**هشدار:** هرچند استفاده از `__proto__` به‌عنوان کلید literal را اینجا می‌پذیرم، استفاده از شکل propertyای مثل `o.__proto__` را توصیه نمی‌کنم. آن فرم هم getter است هم setter (برای سازگاری)، ولی گزینه‌های بهتر وجود دارد.

برای set کردن `[[Prototype]]` object موجود، از `Object.setPrototypeOf(..)` در ES6 استفاده کنید:

```js
var o1 = {
	// ..
};

var o2 = {
	// ..
};

Object.setPrototypeOf( o2, o1 );
```

**نکته:** در فصل ۶ دوباره `Object` را بررسی می‌کنیم، از جمله "`Object.setPrototypeOf(..)` Static Function" و ارتباط آن با "`Object.assign(..)` Static Function".

### Object `super`

معمولاً `super` را فقط مربوط به class می‌دانند. اما چون JS بر پایهٔ object و prototype است، `super` در concise methodهای object معمولی هم تقریباً همان کارایی و رفتار را دارد.

```js
var o1 = {
	foo() {
		console.log( "o1:foo" );
	}
};

var o2 = {
	foo() {
		super.foo();
		console.log( "o2:foo" );
	}
};

Object.setPrototypeOf( o2, o1 );

o2.foo();		// o1:foo
				// o2:foo
```

**هشدار:** `super` فقط در concise method مجاز است، نه در propertyهایی که function expression معمولی هستند. همچنین فقط به فرم `super.XXX` (دسترسی property/method) مجاز است، نه `super()`.

reference `super` در متد `o2.foo()` به‌صورت static روی `o2` قفل می‌شود و مشخصاً به `[[Prototype]]` آن. اینجا عملاً مثل `Object.getPrototypeOf(o2)` است (که می‌شود `o1`) و از این مسیر `o1.foo()` را پیدا و اجرا می‌کند.

برای جزئیات کامل `super` به بخش "Classes" در فصل ۳ مراجعه کنید.
