# Proxyها

یکی از واضح‌ترین قابلیت‌های متاپروگرمینگ که در ES6 اضافه شد، قابلیت `Proxy` است.

Proxy نوع خاصی از آبجکت است که می‌سازید تا یک آبجکت عادی دیگر را «wrap» کند (یا جلوی آن بنشیند). روی Proxy می‌توانید handlerهای ویژه (یا *trap*) ثبت کنید که هنگام انجام عملیات مختلف روی Proxy فراخوانی می‌شوند. این handlerها فرصت دارند علاوه بر *forward* کردن عملیات به آبجکت هدف/اصلی، منطق اضافی هم اجرا کنند.

یکی از trapهایی که می‌توانید تعریف کنید `get` است که عملیات `[[Get]]` را intercept می‌کند -- یعنی وقتی می‌خواهید پراپرتی‌ای از آبجکت بخوانید. مثال:

```js
var obj = { a: 1 },
	handlers = {
		get(target,key,context) {
			// note: target === obj,
			// context === pobj
			console.log( "accessing: ", key );
			return Reflect.get(
				target, key, context
			);
		}
	},
	pobj = new Proxy( obj, handlers );

obj.a;
// 1

pobj.a;
// accessing: a
// 1
```

ما `get(..)` را به‌صورت متد نام‌دار روی آبجکت *handler* (آرگومان دوم `Proxy(..)`) تعریف می‌کنیم. این متد reference به آبجکت *target* (`obj`)، نام پراپرتی *key* (`"a"`)، و receiver/proxy (`pobj`) را می‌گیرد.

بعد از `console.log(..)` عملیات را با `Reflect.get(..)` به `obj` forward می‌کنیم. در بخش بعد API مربوط به `Reflect` را پوشش می‌دهیم. هر trap موجود در Proxy یک تابع متناظر هم‌نام در `Reflect` دارد.

این نگاشت‌ها عمداً متقارن هستند: handlerهای Proxy هنگام انجام هر کار متاپروگرمینگ آن را intercept می‌کنند، و utilityهای `Reflect` همان کار متاپروگرمینگ را روی آبجکت انجام می‌دهند. هر trap یک رفتار پیش‌فرض دارد که خودکار utility متناظر در `Reflect` را صدا می‌زند. تقریباً همیشه `Proxy` و `Reflect` را کنار هم استفاده می‌کنید.

فهرست handlerهایی که می‌توانید روی Proxy برای آبجکت/تابع *target* تعریف کنید و زمان فعال شدنشان:

* `get(..)`: از طریق `[[Get]]`، هنگام خواندن پراپرتی از Proxy (`Reflect.get(..)`، عملگر `.`, یا `[ .. ]`)
* `set(..)`: از طریق `[[Set]]`، هنگام ست‌کردن مقدار پراپرتی روی Proxy (`Reflect.set(..)`، عملگر `=`, یا destructuring assignment روی پراپرتی)
* `deleteProperty(..)`: از طریق `[[Delete]]`، هنگام حذف پراپرتی از Proxy (`Reflect.deleteProperty(..)` یا `delete`)
* `apply(..)` (اگر *target* تابع باشد): از طریق `[[Call]]`، وقتی Proxy مثل تابع/متد عادی صدا زده شود (`Reflect.apply(..)`، `call(..)`، `apply(..)` یا عملگر فراخوانی `(..)`)
* `construct(..)` (اگر *target* سازنده باشد): از طریق `[[Construct]]`، وقتی Proxy مثل سازنده صدا زده شود (`Reflect.construct(..)` یا `new`)
* `getOwnPropertyDescriptor(..)`: از طریق `[[GetOwnProperty]]`، هنگام دریافت descriptor پراپرتی (`Object.getOwnPropertyDescriptor(..)` یا `Reflect.getOwnPropertyDescriptor(..)`)
* `defineProperty(..)`: از طریق `[[DefineOwnProperty]]`، هنگام تنظیم descriptor پراپرتی (`Object.defineProperty(..)` یا `Reflect.defineProperty(..)`)
* `getPrototypeOf(..)`: از طریق `[[GetPrototypeOf]]`، هنگام دریافت `[[Prototype]]` (`Object.getPrototypeOf(..)`، `Reflect.getPrototypeOf(..)`، `__proto__`، `Object#isPrototypeOf(..)` یا `instanceof`)
* `setPrototypeOf(..)`: از طریق `[[SetPrototypeOf]]`، هنگام تنظیم `[[Prototype]]` (`Object.setPrototypeOf(..)`، `Reflect.setPrototypeOf(..)` یا `__proto__`)
* `preventExtensions(..)`: از طریق `[[PreventExtensions]]`، هنگام non-extensible کردن Proxy (`Object.preventExtensions(..)` یا `Reflect.preventExtensions(..)`)
* `isExtensible(..)`: از طریق `[[IsExtensible]]`، هنگام بررسی extensible بودن Proxy (`Object.isExtensible(..)` یا `Reflect.isExtensible(..)`)
* `ownKeys(..)`: از طریق `[[OwnPropertyKeys]]`، هنگام دریافت مجموعه‌ی پراپرتی‌های own و/یا symbolهای own (`Object.keys(..)`، `Object.getOwnPropertyNames(..)`، `Object.getOwnSymbolProperties(..)`، `Reflect.ownKeys(..)` یا `JSON.stringify(..)`)
* `enumerate(..)`: از طریق `[[Enumerate]]`، هنگام درخواست iterator برای پراپرتی‌های enumerable از نوع own و «ارث‌بری‌شده» (`Reflect.enumerate(..)` یا `for..in`)
* `has(..)`: از طریق `[[HasProperty]]`، هنگام بررسی وجود پراپرتی own یا «ارث‌بری‌شده» (`Reflect.has(..)`، `Object#hasOwnProperty(..)` یا `"prop" in obj`)

**نکته:** برای جزئیات هر کدام از این کارهای متاپروگرمینگ، بخش "`Reflect` API" همین فصل را ببینید.

علاوه بر موارد مستقیم بالا، بعضی trapها به‌صورت غیرمستقیم هم با رفتار پیش‌فرض trapهای دیگر فعال می‌شوند. مثال:

```js
var handlers = {
		getOwnPropertyDescriptor(target,prop) {
			console.log(
				"getOwnPropertyDescriptor"
			);
			return Object.getOwnPropertyDescriptor(
				target, prop
			);
		},
		defineProperty(target,prop,desc){
			console.log( "defineProperty" );
			return Object.defineProperty(
				target, prop, desc
			);
		}
	},
	proxy = new Proxy( {}, handlers );

proxy.a = 2;
// getOwnPropertyDescriptor
// defineProperty
```

در زمان `set` کردن پراپرتی، handlerهای `getOwnPropertyDescriptor(..)` و `defineProperty(..)` توسط گام‌های `set(..)` پیش‌فرض فعال می‌شوند (چه اضافه‌کردن جدید باشد چه به‌روزرسانی). اگر خودتان `set(..)` سفارشی تعریف کنید، بسته به این‌که چه فراخوانی‌هایی روی `context` (نه `target`) انجام دهید، ممکن است این trapها فعال شوند یا نه.

### محدودیت‌های Proxy

این handlerها دامنه‌ی بزرگی از عملیات بنیادی روی آبجکت را پوشش می‌دهند. با این حال، بعضی عملیات هنوز (حداقل فعلاً) قابل intercept نیستند.

مثلاً عملیات‌های زیر از Proxy (`pobj`) به target (`obj`) trap/forward نمی‌شوند:

```js
var obj = { a:1, b:2 },
	handlers = { .. },
	pobj = new Proxy( obj, handlers );

typeof obj;
String( obj );
obj + "";
obj == pobj;
obj === pobj
```

ممکن است در آینده عملیات بنیادی بیشتری در زبان قابل intercept شوند و قدرت بیشتری برای توسعه‌ی JavaScript از درون خود زبان بدهند.

**هشدار:** در استفاده از trapهای Proxy، یک‌سری *invariant* وجود دارد -- رفتارهایی که نمی‌توان override کرد. مثلاً خروجی `isExtensible(..)` همیشه به `boolean` coercion می‌شود. این invariantها کمی آزادی شخصی‌سازی شما را محدود می‌کنند، اما برای جلوگیری از رفتارهای عجیب/ناسازگار هستند. جزئیاتشان پیچیده است و این‌جا واردش نمی‌شویم؛ این مطلب پوشش خوبی دارد: http://www.2ality.com/2014/12/es6-proxies.html#invariants

### Proxyهای قابل لغو (Revocable)

Proxy معمولی همیشه برای target trap می‌کند و بعد از ساخت قابل تغییر نیست -- تا وقتی reference به Proxy وجود دارد، proxying ممکن است. اما گاهی می‌خواهید Proxyای بسازید که هر زمان لازم بود غیرفعال شود. راه‌حل *revocable proxy* است:

```js
var obj = { a: 1 },
	handlers = {
		get(target,key,context) {
			// note: target === obj,
			// context === pobj
			console.log( "accessing: ", key );
			return target[key];
		}
	},
	{ proxy: pobj, revoke: prevoke } =
		Proxy.revocable( obj, handlers );

pobj.a;
// accessing: a
// 1

// later:
prevoke();

pobj.a;
// TypeError
```

revocable proxy با `Proxy.revocable(..)` ساخته می‌شود که یک تابع معمولی است، نه سازنده مثل `Proxy(..)`. غیر از آن، همان دو آرگومان *target* و *handlers* را می‌گیرد.

خروجی `Proxy.revocable(..)` خودِ Proxy نیست (برخلاف `new Proxy(..)`)، بلکه آبجکتی با دو پراپرتی *proxy* و *revoke* است -- ما با object destructuring (بخش «Destructuring» فصل ۲) آن‌ها را به `pobj` و `prevoke()` منتسب کردیم.

وقتی revocable proxy را revoke کنید، هر تلاش برای دسترسی به آن (فعال‌کردن trapها) خطای `TypeError` می‌دهد.

یک سناریوی واقعی: به بخش دیگری از برنامه که داده‌های مدل را مدیریت می‌کند، به‌جای reference مستقیم مدل، یک Proxy می‌دهید. اگر مدل تغییر کرد/جایگزین شد، Proxy قبلی را invalid می‌کنید تا آن بخش دیگر (با خطاها) بفهمد باید reference جدید مدل را درخواست کند.

### استفاده از Proxyها

مزایای متاپروگرمینگ Proxyها واضح‌اند: تقریباً می‌توانیم رفتار آبجکت‌ها را کامل intercept (و در نتیجه override) کنیم؛ یعنی می‌توانیم رفتار آبجکت‌ها را خیلی قدرتمندتر از JS هسته‌ای توسعه بدهیم. چند الگوی نمونه را برای بررسی امکان‌ها می‌بینیم.

#### Proxy اول، Proxy آخر

همان‌طور که گفتیم، معمولاً Proxy را «روکش» target می‌بینید. در این مدل، Proxy آبجکت اصلی‌ای می‌شود که کد با آن کار می‌کند و target واقعی پنهان/محافظت‌شده می‌ماند.

این کار مثلاً وقتی مفید است که آبجکت را جایی پاس می‌دهید که کاملاً «قابل اعتماد» نیست و می‌خواهید به‌جای پاس‌دادن مستقیم آبجکت، قوانین دسترسی ویژه‌ای اعمال کنید.

```js
var messages = [],
	handlers = {
		get(target,key) {
			// string value?
			if (typeof target[key] == "string") {
				// filter out punctuation
				return target[key]
					.replace( /[^\w]/g, "" );
			}

			// pass everything else through
			return target[key];
		},
		set(target,key,val) {
			// only set unique strings, lowercased
			if (typeof val == "string") {
				val = val.toLowerCase();
				if (target.indexOf( val ) == -1) {
					target.push(val);
				}
			}
			return true;
		}
	},
	messages_proxy =
		new Proxy( messages, handlers );

// elsewhere:
messages_proxy.push(
	"heLLo...", 42, "wOrlD!!", "WoRld!!"
);

messages_proxy.forEach( function(val){
	console.log(val);
} );
// hello world

messages.forEach( function(val){
	console.log(val);
} );
// hello... world!!
```

من این را الگوی *proxy first* می‌نامم، چون اول (و عمدتاً کاملاً) با Proxy تعامل می‌کنیم.

اینجا روی تعامل با `messages_proxy` قوانین ویژه داریم که روی `messages` مستقیم اعمال نمی‌شود: فقط رشته‌ی یکتا را اضافه می‌کنیم و lowercase می‌کنیم. هنگام خواندن هم نشانه‌گذاری را از رشته‌ها حذف می‌کنیم.

الگوی معکوس هم ممکن است: target با Proxy تعامل کند، نه Proxy با target. در نتیجه کد عملاً با آبجکت اصلی کار می‌کند. ساده‌ترین راه این fallback این است که Proxy را در زنجیره‌ی `[[Prototype]]` آبجکت اصلی قرار دهید.

```js
var handlers = {
		get(target,key,context) {
			return function() {
				context.speak(key + "!");
			};
		}
	},
	catchall = new Proxy( {}, handlers ),
	greeter = {
		speak(who = "someone") {
			console.log( "hello", who );
		}
	};

// setup `greeter` to fall back to `catchall`
Object.setPrototypeOf( greeter, catchall );

greeter.speak();				// hello someone
greeter.speak( "world" );		// hello world

greeter.everyone();				// hello everyone!
```

اینجا مستقیم با `greeter` کار می‌کنیم نه `catchall`. وقتی `speak(..)` را صدا می‌زنیم، روی `greeter` وجود دارد. اما وقتی `everyone()` را می‌خواهیم، چنین متدی روی `greeter` نیست.

رفتار پیش‌فرض آبجکت این است که در نبود پراپرتی، زنجیره‌ی `[[Prototype]]` را بررسی کند (کتاب *this & Object Prototypes*). پس `catchall` برای پراپرتی `everyone` چک می‌شود. آن‌وقت trap `get()` در Proxy فعال می‌شود و تابعی برمی‌گرداند که `speak(..)` را با نام پراپرتی درخواستی (`"everyone"`) صدا می‌زند.

این الگو را *proxy last* می‌نامم چون Proxy فقط در آخرین مرحله به کار می‌آید.

#### «پراپرتی/متدِ وجودندارد»

یک گلایه‌ی رایج از JS این است که آبجکت‌ها به‌صورت پیش‌فرض در برابر دسترسی/ست کردن پراپرتی‌ای که وجود ندارد دفاعی نیستند. شاید بخواهید همه‌ی پراپرتی‌ها/متدهای آبجکت از قبل تعریف شوند و هر استفاده‌ی بعدی از نام ناموجود خطا بدهد.

این را می‌شود با Proxy در هر دو طراحی *proxy first* و *proxy last* پیاده کرد. هر دو را ببینیم.

```js
var obj = {
		a: 1,
		foo() {
			console.log( "a:", this.a );
		}
	},
	handlers = {
		get(target,key,context) {
			if (Reflect.has( target, key )) {
				return Reflect.get(
					target, key, context
				);
			}
			else {
				throw "No such property/method!";
			}
		},
		set(target,key,val,context) {
			if (Reflect.has( target, key )) {
				return Reflect.set(
					target, key, val, context
				);
			}
			else {
				throw "No such property/method!";
			}
		}
	},
	pobj = new Proxy( obj, handlers );

pobj.a = 3;
pobj.foo();			// a: 3

pobj.b = 4;			// Error: No such property/method!
pobj.bar();			// Error: No such property/method!
```

در `get(..)` و `set(..)` فقط وقتی عملیات را forward می‌کنیم که پراپرتی روی target از قبل موجود باشد؛ وگرنه خطا می‌دهیم. در این طراحی، کد باید با `pobj` تعامل کند تا این حفاظت اعمال شود.

حالا نسخه‌ی معکوس با *proxy last*:

```js
var handlers = {
		get() {
			throw "No such property/method!";
		},
		set() {
			throw "No such property/method!";
		}
	},
	pobj = new Proxy( {}, handlers ),
	obj = {
		a: 1,
		foo() {
			console.log( "a:", this.a );
		}
	};

// setup `obj` to fall back to `pobj`
Object.setPrototypeOf( obj, pobj );

obj.a = 3;
obj.foo();			// a: 3

obj.b = 4;			// Error: No such property/method!
obj.bar();			// Error: No such property/method!
```

اینجا طراحی *proxy last* از نظر تعریف handlerها ساده‌تر است. دیگر لازم نیست `[[Get]]` و `[[Set]]` را intercept کنیم و فقط در صورت وجود پراپرتی forward کنیم. کافی است بدانیم اگر عملیات به fallback یعنی `pobj` رسید، کل زنجیره‌ی `[[Prototype]]` قبلاً جست‌وجو شده و چیزی پیدا نشده؛ پس با خیال راحت مستقیم خطا می‌دهیم.

#### هک کردن زنجیره‌ی `[[Prototype]]` با Proxy

عملیات `[[Get]]` کانال اصلی فعال‌سازی سازوکار `[[Prototype]]` است. وقتی پراپرتی روی خود آبجکت پیدا نشود، `[[Get]]` عملیات را خودکار به آبجکت `[[Prototype]]` می‌سپارد.

یعنی با trap `get(..)` در Proxy می‌توانید مفهوم `[[Prototype]]` را شبیه‌سازی یا توسعه دهید.

اولین هک: ساخت دو آبجکت که از طریق `[[Prototype]]` به‌شکل حلقوی لینک شده‌اند (یا حداقل این‌طور به نظر می‌رسد!). زنجیره‌ی واقعی حلقوی `[[Prototype]]` را نمی‌شود ساخت چون موتور خطا می‌دهد؛ اما Proxy می‌تواند وانمود کند.

```js
var handlers = {
		get(target,key,context) {
			if (Reflect.has( target, key )) {
				return Reflect.get(
					target, key, context
				);
			}
			// fake circular `[[Prototype]]`
			else {
				return Reflect.get(
					target[
						Symbol.for( "[[Prototype]]" )
					],
					key,
					context
				);
			}
		}
	},
	obj1 = new Proxy(
		{
			name: "obj-1",
			foo() {
				console.log( "foo:", this.name );
			}
		},
		handlers
	),
	obj2 = Object.assign(
		Object.create( obj1 ),
		{
			name: "obj-2",
			bar() {
				console.log( "bar:", this.name );
				this.foo();
			}
		}
	);

// fake circular `[[Prototype]]` link
obj1[ Symbol.for( "[[Prototype]]" ) ] = obj2;

obj1.bar();
// bar: obj-1 <-- through proxy faking [[Prototype]]
// foo: obj-1 <-- `this` context still preserved

obj2.foo();
// foo: obj-2 <-- through [[Prototype]]
```

**نکته:** در این مثال به proxy/forward کردن `[[Set]]` نیاز نداشتیم، پس ساده نگه داشتیم. برای شبیه‌سازی کامل رفتار `[[Prototype]]`، بهتر است `set(..)` هم پیاده‌سازی شود تا زنجیره را برای پراپرتی مطابق جست‌وجو کند و descriptor مربوطه (مثل set و writable) را رعایت کند. کتاب *this & Object Prototypes* را ببینید.

در مثال بالا، `obj2` با `Object.create(..)` به `obj1` لینک `[[Prototype]]` دارد. برای لینک معکوس (حلقوی)، روی `obj1` پراپرتی‌ای با کلید نماد `Symbol.for("[[Prototype]]")` می‌گذاریم (بخش «Symbolها» فصل ۲). این symbol جادویی نیست؛ فقط یک hook خوش‌نام و معنایی برای این کار می‌دهد.

سپس trap `get(..)` Proxy اول چک می‌کند آیا `key` روی خود Proxy هست یا نه. اگر نبود، عملیات را دستی به reference ذخیره‌شده در `Symbol.for("[[Prototype]]")` روی `target` می‌سپارد.

یک مزیت مهم این الگو این است که تعریف‌های `obj1` و `obj2` تقریباً با جزئیات این رابطه‌ی حلقوی درگیر نمی‌شوند. هرچند در مثال برای اختصار همه‌چیز کنار هم آمده، منطق handler کاملاً generic است (وابسته‌ی خاص به `obj1/obj2` نیست). بنابراین می‌شود آن را در helperی مثل `setCircularPrototypeOf(..)` بیرون کشید.

حالا که دیدیم با `get(..)` می‌شود لینک `[[Prototype]]` را emulate کرد، هک را جلوتر ببریم: به‌جای `[[Prototype]]` حلقوی، لینک‌های چندتایی `[[Prototype]]` (یا «multiple inheritance») چطور؟ این هم نسبتاً ساده است:

```js
var obj1 = {
		name: "obj-1",
		foo() {
			console.log( "obj1.foo:", this.name );
		},
	},
	obj2 = {
		name: "obj-2",
		foo() {
			console.log( "obj2.foo:", this.name );
		},
		bar() {
			console.log( "obj2.bar:", this.name );
		}
	},
	handlers = {
		get(target,key,context) {
			if (Reflect.has( target, key )) {
				return Reflect.get(
					target, key, context
				);
			}
			// fake multiple `[[Prototype]]`
			else {
				for (var P of target[
					Symbol.for( "[[Prototype]]" )
				]) {
					if (Reflect.has( P, key )) {
						return Reflect.get(
							P, key, context
						);
					}
				}
			}
		}
	},
	obj3 = new Proxy(
		{
			name: "obj-3",
			baz() {
				this.foo();
				this.bar();
			}
		},
		handlers
	);

// fake multiple `[[Prototype]]` links
obj3[ Symbol.for( "[[Prototype]]" ) ] = [
	obj1, obj2
];

obj3.baz();
// obj1.foo: obj-3
// obj2.bar: obj-3
```

**نکته:** همان‌طور که بعد از مثال حلقوی هم گفتیم، این‌جا `set(..)` را پیاده نکردیم؛ برای راه‌حل کامل شبیه‌سازی رفتار عادی `[[Set]]` در `[[Prototype]]` لازم است.

`obj3` طوری تنظیم شده که هم‌زمان به `obj1` و `obj2` delegation بدهد. در `obj3.baz()`، فراخوانی `this.foo()` تابع `foo()` را از `obj1` می‌گیرد (اولین مورد پیدا‌شده، با اینکه روی `obj2` هم `foo()` هست). اگر ترتیب لینک را `obj2, obj1` می‌کردیم، `obj2.foo()` استفاده می‌شد.

اما `this.bar()` چون روی `obj1` پیدا نمی‌شود، سراغ `obj2` می‌رود و همان‌جا match پیدا می‌کند.

`obj1` و `obj2` دو زنجیره‌ی `[[Prototype]]` موازی برای `obj3` هستند. خود `obj1` یا `obj2` هم می‌توانند delegation معمولی `[[Prototype]]` به آبجکت‌های دیگر داشته باشند، یا حتی خودشان Proxy باشند (مثل `obj3`) و چند‌مسیره delegation بدهند.

مثل مثال حلقوی، تعریف‌های `obj1`، `obj2` و `obj3` تقریباً مستقل از منطق generic Proxy برای multiple-delegation هستند. تعریف utilityای مثل `setPrototypesOf(..)` (با s) که آبجکت اصلی و لیست آبجکت‌های لینک‌شونده را بگیرد، خیلی ساده است.

امیدوارم با این مثال‌ها قدرت Proxyها واضح‌تر شده باشد. کارهای متاپروگرمینگ قدرتمند دیگری هم با Proxy ممکن است.
