# محتوا

همان‌طور که قبلاً گفته شد، محتوای یک object از مقادیر (هر نوع) ذخیره‌شده در *location*های با نام مشخص تشکیل می‌شود که آن‌ها را property می‌نامیم.

مهم است بدانید که با وجود گفتن «محتوا» که دلالت می‌کند این مقادیر *واقعاً* داخل object ذخیره شده‌اند، این فقط ظاهر است. engine مقادیر را به روش‌های وابسته به پیاده‌سازی ذخیره می‌کند و ممکن است اصلاً آن‌ها را *در* ظرف object ذخیره نکند. آنچه *در* ظرف ذخیره می‌شود این نام propertyهاست که مثل اشاره‌گر (از نظر فنی، *reference*) به محل ذخیرهٔ مقادیر عمل می‌کنند.

در نظر بگیرید:

```js
var myObject = {
	a: 2
};

myObject.a;		// 2

myObject["a"];	// 2
```

برای دسترسی به مقدار در *location* یعنی `a` در `myObject`، باید از عملگر `.` یا عملگر `[ ]` استفاده کنیم. نحو `.a` معمولاً «دسترسی property» نامیده می‌شود، در حالی که نحو `["a"]` معمولاً «دسترسی key» نامیده می‌شود. در واقع هر دو به همان *location* دسترسی دارند و همان مقدار یعنی `2` را برمی‌گیرند، پس اصطلاحات قابل تعویض‌اند. از این به بعد رایج‌ترین اصطلاح یعنی «دسترسی property» را استفاده می‌کنیم.

تفاوت اصلی بین دو نحو این است که عملگر `.` به نام property سازگار با `Identifier` بعدش نیاز دارد، در حالی که نحو `[".."]` اساساً هر رشتهٔ سازگار با UTF-8/unicode را به‌عنوان نام property می‌پذیرد. برای ارجاع به property با نام "Super-Fun!" مثلاً، باید از نحو دسترسی `["Super-Fun!"]` استفاده کنید، چون `Super-Fun!` نام property معتبر `Identifier` نیست.

همچنین، چون نحو `[".."]` از **مقدار** رشته برای مشخص کردن location استفاده می‌کند، یعنی برنامه می‌تواند مقدار رشته را به‌صورت برنامه‌ای بسازد، مثل:

```js
var wantA = true;
var myObject = {
	a: 2
};

var idx;

if (wantA) {
	idx = "a";
}

// later

console.log( myObject[idx] ); // 2
```

در objectها، نام propertyها **همیشه** رشته است. اگر به‌جای `string` (primitive) هر مقدار دیگری به‌عنوان property استفاده کنید، اول به رشته تبدیل می‌شود. این حتی اعداد را هم شامل می‌شود که معمولاً به‌عنوان index آرایه استفاده می‌شوند، پس مراقب باشید استفاده از اعداد را بین objectها و آرایه‌ها اشتباه نگیرید.

```js
var myObject = { };

myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"];				// "foo"
myObject["3"];					// "bar"
myObject["[object Object]"];	// "baz"
```

### Computed Property Names

نحو دسترسی property یعنی `myObject[..]` که توضیح دادیم اگر لازم باشد از مقدار عبارت محاسبه‌شده *به‌عنوان* نام key استفاده کنید مفید است، مثل `myObject[prefix + name]`. اما وقتی objectها را با نحو object-literal اعلان می‌کنید واقعاً کمکی نمی‌کند.

ES6 *computed property names* اضافه می‌کند، که می‌توانید عبارتی را با جفت `[ ]` احاطه‌شده در موقعیت نام key در اعلان object-literal مشخص کنید:

```js
var prefix = "foo";

var myObject = {
	[prefix + "bar"]: "hello",
	[prefix + "baz"]: "world"
};

myObject["foobar"]; // hello
myObject["foobaz"]; // world
```

رایج‌ترین استفاده از *computed property names* احتمالاً برای `Symbol`های ES6 است که در این کتاب به‌تفصیل پوشش نمی‌دهیم. به‌طور خلاصه، نوع دادهٔ اولیهٔ جدیدی با مقدار غیرشفاف و غیرقابل حدس هستند (از نظر فنی مقدار `string`). به‌شدت از کار با *مقدار واقعی* یک `Symbol` (که از نظر نظری می‌تواند بین engineهای مختلف JS فرق کند) منع می‌شوید، پس نام `Symbol` مثل `Symbol.Something` (فقط یک نام ساختگی!) همان چیزی است که استفاده می‌کنید:

```js
var myObject = {
	[Symbol.Something]: "hello world"
};
```

### Property در برابر Method

بعضی توسعه‌دهندگان دوست دارند وقتی از دسترسی property روی object حرف می‌زنند تمایز قائل شوند، اگر مقدار دسترسی‌شده اتفاقاً تابع باشد. چون وسوسه‌انگیز است که تابع را *متعلق* به object بدانیم، و در زبان‌های دیگر توابع متعلق به objectها (به‌اصطلاح «class»ها) «method» نامیده می‌شوند، شنیدن «دسترسی method» در مقابل «دسترسی property» غیرمعمول نیست.

**مشخصات همین تمایز را می‌گذارد**، جالب است.

از نظر فنی، توابع هرگز به objectها «تعلق» ندارند، پس گفتن اینکه تابعی که فقط اتفاقاً روی ارجاع object دسترسی می‌شود خودکار «method» است کمی کش دادن معناشناسی به نظر می‌رسد.

*درست* است که بعضی توابع ارجاع به `this` در خود دارند، و *گاهی* این ارجاع‌های `this` به ارجاع object در call-site اشاره می‌کنند. اما این استفاده واقعاً آن تابع را بیشتر از هر تابع دیگر «method» نمی‌کند، چون `this` در زمان اجرا و در call-site به‌صورت پویا bind می‌شود و بنابراین رابطهٔ آن با object در بهترین حالت غیرمستقیم است.

هر بار که به property روی object دسترسی می‌کنید، آن **دسترسی property** است، صرف‌نظر از نوع مقداری که برمی‌گیرید. اگر *اتفاقاً* از آن دسترسی property تابعی گرفتید، در آن لحظه به‌طور جادویی «method» نمی‌شود. چیز خاصی (جز binding ضمنی ممکن `this` همان‌طور که قبلاً توضیح داده شد) دربارهٔ تابعی که از دسترسی property می‌آید وجود ندارد.

مثلاً:

```js
function foo() {
	console.log( "foo" );
}

var someFoo = foo;	// variable reference to `foo`

var myObject = {
	someFoo: foo
};

foo;				// function foo(){..}

someFoo;			// function foo(){..}

myObject.someFoo;	// function foo(){..}
```

`someFoo` و `myObject.someFoo` فقط دو ارجاع جدا به همان تابع‌اند و هیچ‌کدام دلالتی بر خاص بودن یا «مالکیت» توسط object دیگر ندارند. اگر `foo()` بالا طوری تعریف شده بود که ارجاع `this` داخلش داشته باشد، آن *implicit binding* یعنی `myObject.someFoo` **تنها** تفاوت قابل مشاهده بین دو ارجاع می‌بود. هیچ‌کدام از ارجاع‌ها واقعاً معنی «method» نامیده شدن را ندارند.

**شاید بتوان استدلال کرد** که تابع *method می‌شود*، نه در زمان تعریف، بلکه در زمان اجرا فقط برای آن فراخوانی، بسته به نحوهٔ فراخوانی در call-site (با context ارجاع object یا نه — فصل ۲ را برای جزئیات بیشتر ببینید). حتی این تفسیر هم کمی کش دادن است.

امن‌ترین نتیجه‌گیری احتمالاً این است که «function» و «method» در جاوااسکریپت قابل تعویض‌اند.

**یادداشت:** ES6 ارجاع `super` اضافه می‌کند که معمولاً با `class` استفاده می‌شود (ضمیمهٔ A را ببینید). نحوهٔ رفتار `super` (binding ایستا به‌جای binding دیرهنگام مثل `this`) وزن بیشتری به این ایده می‌دهد که تابعی که جایی با `super` bind شده بیشتر «method» است تا «function». اما باز هم، این‌ها فقط ظرافت‌های معناشناختی (و مکانیکی) هستند.

حتی وقتی عبارت تابع را به‌عنوان بخشی از object-literal اعلان می‌کنید، آن تابع به‌طور جادویی بیشتر به object *تعلق* نمی‌گیرد — هنوز فقط ارجاع‌های متعدد به همان function object:

```js
var myObject = {
	foo: function foo() {
		console.log( "foo" );
	}
};

var someFoo = myObject.foo;

someFoo;		// function foo(){..}

myObject.foo;	// function foo(){..}
```

**یادداشت:** در فصل ۶، میانبر ES6 برای آن نحو اعلان `foo: function foo(){ .. }` در object-literal را پوشش می‌دهیم.

### آرایه‌ها

آرایه‌ها هم از شکل دسترسی `[ ]` استفاده می‌کنند، اما همان‌طور که بالا گفته شد، سازماندهی کمی ساختاریافته‌تر برای نحوه و محل ذخیرهٔ مقادیر دارند (اگرچه هنوز محدودیتی روی *نوع* مقادیر ذخیره‌شده نیست). آرایه‌ها *indexگذاری عددی* فرض می‌کنند، یعنی مقادیر در locationهایی ذخیره می‌شوند که معمولاً *indices* نامیده می‌شوند، در اعداد صحیح غیرمنفی مثل `0` و `42`.

```js
var myArray = [ "foo", 42, "bar" ];

myArray.length;		// 3

myArray[0];			// "foo"

myArray[2];			// "bar"
```

آرایه‌ها *object* هستند، پس حتی با اینکه هر index عدد صحیح مثبت است، می‌توانید *همچنین* property روی آرایه اضافه کنید:

```js
var myArray = [ "foo", 42, "bar" ];

myArray.baz = "baz";

myArray.length;	// 3

myArray.baz;	// "baz"
```

توجه کنید که اضافه کردن propertyهای نام‌دار (صرف‌نظر از نحو عملگر `.` یا `[ ]`) `length` گزارش‌شدهٔ آرایه را تغییر نمی‌دهد.

*می‌توانستید* از آرایه به‌عنوان object سادهٔ key/value استفاده کنید و هرگز index عددی اضافه نکنید، اما این ایدهٔ بدی است چون آرایه‌ها رفتار و بهینه‌سازی‌های خاص استفادهٔ مورد نظرشان را دارند، و همین‌طور objectهای ساده. از objectها برای ذخیرهٔ جفت‌های key/value و از آرایه‌ها برای ذخیرهٔ مقادیر در indexهای عددی استفاده کنید.

**مراقب باشید:** اگر سعی کنید property به آرایه اضافه کنید اما نام property *شبیه* عدد به نظر برسد، در نهایت به‌عنوان index عددی درمی‌آید (و بنابراین محتوای آرایه را تغییر می‌دهد):

```js
var myArray = [ "foo", 42, "bar" ];

myArray["3"] = "baz";

myArray.length;	// 4

myArray[3];		// "baz"
```

### تکثیر objectها

یکی از پردرخواست‌ترین قابلیت‌ها وقتی توسعه‌دهندگان تازه زبان جاوااسکریپت را می‌گیرند نحوهٔ تکثیر یک object است. به نظر می‌رسد باید فقط متد داخلی `copy()` باشد، درست؟ معلوم می‌شود کمی پیچیده‌تر از آن است، چون به‌طور کامل روشن نیست به‌طور پیش‌فرض الگوریتم تکثیر چه باید باشد.

مثلاً این object را در نظر بگیرید:

```js
function anotherFunction() { /*..*/ }

var anotherObject = {
	c: true
};

var anotherArray = [];

var myObject = {
	a: 2,
	b: anotherObject,	// reference, not a copy!
	c: anotherArray,	// another reference!
	d: anotherFunction
};

anotherArray.push( anotherObject, myObject );
```

نمایش دقیق *کپی* از `myObject` چه باید باشد؟

اول باید پاسخ دهیم shallow است یا deep. یک *shallow copy* در نهایت `a` روی object جدید را به‌عنوان کپی از مقدار `2` دارد، اما propertyهای `b`، `c` و `d` فقط ارجاع به همان مکان‌های ارجاع‌های object اصلی. یک *deep copy* نه فقط `myObject` بلکه `anotherObject` و `anotherArray` را هم تکثیر می‌کند. اما آنگاه مسئله داریم که `anotherArray` ارجاع به `anotherObject` و `myObject` دارد، پس *آن‌ها* هم باید تکثیر شوند نه حفظ ارجاع. حالا مسئلهٔ تکثیر دایره‌ای بی‌نهایت داریم به‌خاطر ارجاع دایره‌ای.

آیا باید ارجاع دایره‌ای را تشخیص دهیم و فقط پیمایش دایره‌ای را قطع کنیم (عنصر deep را کاملاً تکثیر نکرده رها کنیم)؟ آیا کاملاً error بدهیم؟ چیزی بین این دو؟

علاوه بر این، روشن نیست «تکثیر» یک تابع چه معنایی داشته باشد؟ چند hack مثل بیرون کشیدن سریال‌سازی `toString()` کد منبع تابع وجود دارد (که بین پیاده‌سازی‌ها فرق می‌کند و بسته به نوع تابع بررسی‌شده حتی در همهٔ engineها قابل اعتماد نیست).

پس چطور به همهٔ این سؤال‌های حیله‌ای جواب می‌دهیم؟ frameworkهای مختلف JS هر کدام تفسیر خود را انتخاب کرده و تصمیم خود را گرفته‌اند. اما کدام از این‌ها (اگر هست) باید JS به‌عنوان *استاندارد* بپذیرد؟ برای مدت طولانی پاسخ روشنی نبود.

یک زیرمجموعهٔ راه‌حل این است که objectهای JSON-safe (یعنی قابل سریال به رشتهٔ JSON و بعد parse مجدد به object با همان ساختار و مقادیر) به‌راحتی با این *تکثیر* می‌شوند:

```js
var newObj = JSON.parse( JSON.stringify( someObj ) );
```

البته، این نیاز دارد مطمئن شوید object شما JSON safe است. برای بعضی وضعیت‌ها پیش‌پاافتاده است. برای بقیه کافی نیست.

همزمان، shallow copy نسبتاً قابل فهم است و مسئلهٔ کمتری دارد، پس ES6 اکنون `Object.assign(..)` را برای این کار تعریف کرده. `Object.assign(..)` یک object *target* به‌عنوان اولین پارامتر و یک یا چند object *source* به‌عنوان پارامترهای بعدی می‌گیرد. روی همهٔ *enumerable* (پایین را ببینید)، *owned keys* (**بلافاصله حاضر**) روی object(های) *source* تکرار می‌کند و آن‌ها را (فقط از طریق انتساب `=`) به *target* کپی می‌کند. همچنین مفیدانه *target* را برمی‌گرداند، همان‌طور که پایین می‌بینید:

```js
var newObj = Object.assign( {}, myObject );

newObj.a;						// 2
newObj.b === anotherObject;		// true
newObj.c === anotherArray;		// true
newObj.d === anotherFunction;	// true
```

**یادداشت:** در بخش بعد، «property descriptor»ها (ویژگی‌های property) را توضیح می‌دهیم و استفاده از `Object.defineProperty(..)` را نشان می‌دهیم. تکثیری که برای `Object.assign(..)` اتفاق می‌افتد خالصاً انتساب به سبک `=` است، پس هر ویژگی خاص property (مثل `writable`) روی object منبع **روی object هدف حفظ نمی‌شود**.

### Property Descriptors

قبل از ES5، زبان جاوااسکریپت راه مستقیمی برای بررسی یا تمایز بین ویژگی‌های propertyها در کد شما نداشت، مثل اینکه property فقط-خواندنی است یا نه.

اما از ES5، همهٔ propertyها با **property descriptor** توصیف می‌شوند.

این کد را در نظر بگیرید:

```js
var myObject = {
	a: 2
};

Object.getOwnPropertyDescriptor( myObject, "a" );
// {
//    value: 2,
//    writable: true,
//    enumerable: true,
//    configurable: true
// }
```

همان‌طور که می‌بینید، property descriptor (که «data descriptor» نامیده می‌شود چون فقط برای نگه‌داشتن مقدار داده است) برای property معمولی object یعنی `a` ما خیلی بیشتر از فقط `value` یعنی `2` است. سه ویژگی دیگر را هم شامل می‌شود: `writable`، `enumerable` و `configurable`.

در حالی که می‌توانیم مقادیر پیش‌فرض ویژگی‌های property descriptor را وقتی property معمولی می‌سازیم ببینیم، می‌توانیم از `Object.defineProperty(..)` برای اضافه کردن property جدید یا تغییر موجود (اگر `configurable` است!) با ویژگی‌های مورد نظر استفاده کنیم.

مثلاً:

```js
var myObject = {};

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: true,
	configurable: true,
	enumerable: true
} );

myObject.a; // 2
```

با `defineProperty(..)`، property ساده و معمولی `a` را به‌صورت دستی و صریح به `myObject` اضافه کردیم. با این حال، عموماً از این رویکرد دستی استفاده نمی‌کنید مگر بخواهید یکی از ویژگی‌های descriptor را از رفتار معمولش تغییر دهید.

#### Writable

قابلیت تغییر مقدار یک property توسط `writable` کنترل می‌شود.

در نظر بگیرید:

```js
var myObject = {};

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: false, // not writable!
	configurable: true,
	enumerable: true
} );

myObject.a = 3;

myObject.a; // 2
```

همان‌طور که می‌بینید، تغییر ما در `value` بی‌سر و صدا ناموفق بود. اگر در `strict mode` امتحان کنیم، error می‌گیریم:

```js
"use strict";

var myObject = {};

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: false, // not writable!
	configurable: true,
	enumerable: true
} );

myObject.a = 3; // TypeError
```

`TypeError` به ما می‌گوید نمی‌توانیم property غیرقابل‌نوشتن را تغییر دهیم.

**یادداشت:** به‌زودی getter/setter را بحث می‌کنیم، اما به‌طور خلاصه می‌توانید مشاهده کنید که `writable:false` یعنی مقدار قابل تغییر نیست، که تا حدی معادل تعریف setter بدون عمل است. در واقع، setter بدون عمل شما باید وقتی فراخوانی می‌شود `TypeError` پرتاب کند تا واقعاً با `writable:false` مطابقت داشته باشد.

#### Configurable

تا وقتی property فعلاً configurable است، می‌توانیم تعریف descriptor آن را با همان ابزار `defineProperty(..)` تغییر دهیم.

```js
var myObject = {
	a: 2
};

myObject.a = 3;
myObject.a;					// 3

Object.defineProperty( myObject, "a", {
	value: 4,
	writable: true,
	configurable: false,	// not configurable!
	enumerable: true
} );

myObject.a;					// 4
myObject.a = 5;
myObject.a;					// 5

Object.defineProperty( myObject, "a", {
	value: 6,
	writable: true,
	configurable: true,
	enumerable: true
} ); // TypeError
```

فراخوانی نهایی `defineProperty(..)` به TypeError منجر می‌شود، صرف‌نظر از `strict mode`، اگر سعی کنید تعریف descriptor یک property غیرقابل‌پیکربندی را تغییر دهید. مراقب باشید: همان‌طور که می‌بینید، تغییر `configurable` به `false` **عملی یک‌طرفه است و قابل برگشت نیست!**

**یادداشت:** استثنای ظریفی هست: حتی اگر property از قبل `configurable:false` است، `writable` همیشه می‌تواند از `true` به `false` بدون error تغییر کند، اما اگر از قبل `false` باشد نه برعکس.

چیز دیگر که `configurable:false` جلوگیری می‌کند توانایی استفاده از عملگر `delete` برای حذف property موجود است.

```js
var myObject = {
	a: 2
};

myObject.a;				// 2
delete myObject.a;
myObject.a;				// undefined

Object.defineProperty( myObject, "a", {
	value: 2,
	writable: true,
	configurable: false,
	enumerable: true
} );

myObject.a;				// 2
delete myObject.a;
myObject.a;				// 2
```

همان‌طور که می‌بینید، آخرین فراخوانی `delete` (بی‌سر و صدا) ناموفق بود چون property یعنی `a` را غیرقابل‌پیکربندی کردیم.

`delete` فقط برای حذف مستقیم propertyهای object (که قابل حذف‌اند) از object مورد نظر استفاده می‌شود. اگر property یک object آخرین ارجاع *باقی‌مانده* به object/تابعی باشد و آن را `delete` کنید، ارجاع حذف می‌شود و آن object/تابع بدون ارجاع اکنون می‌تواند garbage collect شود. اما **درست** نیست `delete` را ابزاری برای آزاد کردن حافظهٔ اختصاص‌یافته مثل زبان‌های دیگر (مثل C/C++) بدانیم. `delete` فقط عملیات حذف property object است — نه بیشتر.

#### Enumerable

آخرین ویژگی descriptor که اینجا ذکر می‌کنیم (دو تای دیگر هست که به‌زودی وقتی getter/setter را بحث می‌کنیم به آن‌ها می‌پردازیم) `enumerable` است.

نام احتمالاً واضح می‌کند، اما این ویژگی کنترل می‌کند آیا property در شمارش‌های خاص propertyهای object ظاهر می‌شود، مثل حلقهٔ `for..in`. روی `false` بگذارید تا در چنین شمارش‌هایی ظاهر نشود، حتی با اینکه هنوز کاملاً قابل دسترسی است. روی `true` بگذارید تا حاضر بماند.

همهٔ propertyهای تعریف‌شدهٔ معمولی کاربر به‌طور پیش‌فرض `enumerable` هستند، چون معمولاً همان چیزی است که می‌خواهید. اما اگر property خاصی دارید که می‌خواهید از شمارش پنهان کنید، آن را `enumerable:false` کنید.

به‌زودی enumerability را با جزئیات بیشتر نشان می‌دهیم، پس این موضوع را در ذهن نشان کنید.

### Immutability

گاهی مطلوب است propertyها یا objectهایی بسازیم که قابل تغییر نباشند (اتفاقی یا عمدی). ES5 پشتیبانی برای رسیدگی به آن به روش‌های مختلف و ظریف اضافه می‌کند.

مهم است بدانید **همهٔ** این رویکردها immutability سطحی ایجاد می‌کنند. یعنی فقط object و ویژگی‌های مستقیم propertyاش را تحت تأثیر قرار می‌دهند. اگر object ارجاعی به object دیگر (آرایه، object، تابع و غیره) داشته باشد، *محتوای* آن object تحت تأثیر قرار نمی‌گیرد و تغییرپذیر می‌ماند.

```js
myImmutableObject.foo; // [1,2,3]
myImmutableObject.foo.push( 4 );
myImmutableObject.foo; // [1,2,3,4]
```

در این قطعه فرض می‌کنیم `myImmutableObject` از قبل ساخته و به‌عنوان تغییرناپذیر محافظت شده. اما برای محافظت از محتوای `myImmutableObject.foo` (که object خودش — آرایه — است) هم، باید `foo` را هم با یک یا چند قابلیت زیر تغییرناپذیر کنید.

**یادداشت:** ساختن objectهای تغییرناپذیر عمیقاً ریشه‌دار در برنامه‌های JS چندان رایج نیست. موارد خاص قطعاً می‌توانند آن را بخواهند، اما به‌عنوان الگوی طراحی کلی، اگر دیدید می‌خواهید همهٔ objectهایتان را *seal* یا *freeze* کنید، شاید بخواهید قدمی عقب بردارید و طراحی برنامه را برای مقاومت بیشتر در برابر تغییرات احتمالی مقادیر objectها بازاندیشی کنید.

#### Object Constant

با ترکیب `writable:false` و `configurable:false` می‌توانید اساساً یک *ثابت* (غیرقابل تغییر، بازتعریف یا حذف) به‌عنوان property object بسازید، مثل:

```js
var myObject = {};

Object.defineProperty( myObject, "FAVORITE_NUMBER", {
	value: 42,
	writable: false,
	configurable: false
} );
```

#### Prevent Extensions

اگر می‌خواهید از اضافه شدن property جدید به object جلوگیری کنید اما بقیهٔ propertyهای object را دست‌نخورده بگذارید، `Object.preventExtensions(..)` را فراخوانی کنید:

```js
var myObject = {
	a: 2
};

Object.preventExtensions( myObject );

myObject.b = 3;
myObject.b; // undefined
```

در `non-strict mode`، ساخت `b` بی‌سر و صدا ناموفق است. در `strict mode`، `TypeError` پرتاب می‌کند.

#### Seal

`Object.seal(..)` یک object «مهرشده» می‌سازد، یعنی object موجود را می‌گیرد و اساساً `Object.preventExtensions(..)` روی آن فراخوانی می‌کند، اما همهٔ propertyهای موجودش را هم `configurable:false` علامت می‌زند.

پس نه فقط نمی‌توانید property بیشتری اضافه کنید، بلکه نمی‌توانید هیچ property موجودی را هم پیکربندی مجدد یا حذف کنید (اگرچه *می‌توانید* هنوز مقادیرشان را تغییر دهید).

#### Freeze

`Object.freeze(..)` یک object منجمد می‌سازد، یعنی object موجود را می‌گیرد و اساساً `Object.seal(..)` روی آن فراخوانی می‌کند، اما همهٔ propertyهای «دسترسی‌دهندهٔ داده» را هم `writable:false` علامت می‌زند تا مقادیرشان قابل تغییر نباشند.

این رویکرد بالاترین سطح تغییرناپذیری است که برای خود object می‌توانید به دست آورید، چون از هر تغییری در object یا هر یک از propertyهای مستقیمش جلوگیری می‌کند (اگرچه، همان‌طور که بالا گفته شد، محتوای هر object ارجاع‌شدهٔ دیگر تحت تأثیر قرار نمی‌گیرد).

می‌توانید object را «deep freeze» کنید با فراخوانی `Object.freeze(..)` روی object و بعد تکرار بازگشتی روی همهٔ objectهایی که ارجاع می‌دهد (که تا اینجا تحت تأثیر نبوده‌اند) و فراخوانی `Object.freeze(..)` روی آن‌ها هم. مراقب باشید، چون می‌تواند objectهای (مشترک) دیگری را که قصد تأثیر روی آن‌ها را ندارید تحت تأثیر قرار دهد.


### `[[Get]]`

جزئیات ظریف اما مهمی دربارهٔ نحوهٔ انجام دسترسی‌های property وجود دارد.

در نظر بگیرید:

```js
var myObject = {
	a: 2
};

myObject.a; // 2
```

`myObject.a` دسترسی property است، اما *فقط* در `myObject` به دنبال property با نام `a` نمی‌گردد، آن‌طور که به نظر می‌رسد.

طبق مشخصات، کد بالا در واقع عملیات `[[Get]]` (نوعی مثل فراخوانی تابع: `[[Get]]()`) روی `myObject` انجام می‌دهد. عملیات داخلی پیش‌فرض `[[Get]]` برای object *اول* object را برای property با نام درخواستی بررسی می‌کند، و اگر پیدا کند مقدار را برمی‌گرداند.

با این حال، الگوریتم `[[Get]]` رفتار مهم دیگری تعریف می‌کند اگر property با نام درخواستی را *پیدا نکند*. در فصل ۵ بررسی می‌کنیم *بعد* چه می‌شود (پیمایش زنجیرهٔ `[[Prototype]]`، اگر باشد).

اما یک نتیجهٔ مهم این عملیات `[[Get]]` این است که اگر به هیچ وجه نتواند برای property درخواستی مقداری تولید کند، به‌جای آن مقدار `undefined` را برمی‌گرداند.

```js
var myObject = {
	a: 2
};

myObject.b; // undefined
```

این رفتار با وقتی که *متغیر*ها را با نام شناسه‌شان ارجاع می‌دهید فرق دارد. اگر متغیری را ارجاع دهید که در جستجوی lexical scope قابل حل نباشد، نتیجه مثل propertyهای object `undefined` نیست، بلکه `ReferenceError` پرتاب می‌شود.

```js
var myObject = {
	a: undefined
};

myObject.a; // undefined

myObject.b; // undefined
```

از نظر *مقدار*، بین این دو ارجاع تفاوتی نیست — هر دو به `undefined` منجر می‌شوند. با این حال، عملیات `[[Get]]` زیرین، هرچند در نگاه اول ظریف، احتمالاً برای ارجاع `myObject.b` کمی «کار» بیشتر از ارجاع `myObject.a` انجام داده.

با بررسی فقط نتایج مقدار، نمی‌توانید تشخیص دهید property وجود دارد و مقدار صریح `undefined` را نگه می‌دارد، یا property *وجود ندارد* و `undefined` مقدار برگشتی پیش‌فرض بعد از ناموفق بودن `[[Get]]` در برگرداندن چیزی صریح بود. با این حال به‌زودی می‌بینیم چطور *می‌توانید* این دو سناریو را تشخیص دهید.

### `[[Put]]`

چون عملیات داخلی `[[Get]]` برای گرفتن مقدار از property تعریف شده، باید واضح باشد عملیات پیش‌فرض `[[Put]]` هم هست.

ممکن است وسوسه‌انگیز باشد فکر کنیم انتساب به property روی object فقط `[[Put]]` را برای set یا create کردن آن property روی object مورد نظر فراخوانی می‌کند. اما وضعیت ظریف‌تر از آن است.

وقتی `[[Put]]` فراخوانی می‌شود، رفتارش بر اساس چند عامل فرق می‌کند، از جمله (با بیشترین تأثیر) اینکه آیا property از قبل روی object حاضر است یا نه.

اگر property حاضر باشد، الگوریتم `[[Put]]` تقریباً بررسی می‌کند:

1. آیا property یک accessor descriptor است (بخش «Getters & Setters» پایین را ببینید)? **اگر بله، setter را فراخوانی کنید، اگر هست.**
2. آیا property یک data descriptor با `writable` یعنی `false` است? **اگر بله، در `non-strict mode` بی‌سر و صدا ناموفق، یا در `strict mode` پرتاب `TypeError`.**
3. وگرنه، مقدار را روی property موجود به‌طور معمول set کنید.

اگر property هنوز روی object مورد نظر حاضر نباشد، عملیات `[[Put]]` حتی ظریف‌تر و پیچیده‌تر است. این سناریو را در فصل ۵ وقتی `[[Prototype]]` را بحث می‌کنیم برای وضوح بیشتر بازمی‌گردیم.

### Getters & Setters

عملیات پیش‌فرض `[[Put]]` و `[[Get]]` برای objectها کاملاً نحوهٔ set شدن مقادیر به propertyهای موجود یا جدید، یا بازیابی از propertyهای موجود را کنترل می‌کنند.

**یادداشت:** با قابلیت‌های آینده/پیشرفتهٔ زبان، ممکن است override کردن عملیات پیش‌فرض `[[Get]]` یا `[[Put]]` برای کل یک object (نه فقط هر property) ممکن شود. این خارج از محدودهٔ بحث ما در این کتاب است، اما بعداً در سری «You Don't Know JS» پوشش داده می‌شود.

ES5 راهی برای override بخشی از این عملیات پیش‌فرض معرفی کرد، نه در سطح object بلکه در سطح هر property، از طریق getterها و setterها. Getterها propertyهایی هستند که در واقع یک تابع پنهان را برای بازیابی مقدار فراخوانی می‌کنند. Setterها propertyهایی هستند که در واقع یک تابع پنهان را برای set کردن مقدار فراخوانی می‌کنند.

وقتی property را طوری تعریف می‌کنید که getter یا setter یا هر دو داشته باشد، تعریفش «accessor descriptor» می‌شود (در مقابل «data descriptor»). برای accessor-descriptorها، ویژگی‌های `value` و `writable` descriptor بی‌اثر و نادیده‌گرفته‌شده‌اند و به‌جای آن JS ویژگی‌های `set` و `get` property (و همچنین `configurable` و `enumerable`) را در نظر می‌گیرد.

در نظر بگیرید:

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return 2;
	}
};

Object.defineProperty(
	myObject,	// target
	"b",		// property name
	{			// descriptor
		// define a getter for `b`
		get: function(){ return this.a * 2 },

		// make sure `b` shows up as an object property
		enumerable: true
	}
);

myObject.a; // 2

myObject.b; // 4
```

چه از طریق نحو object-literal با `get a() { .. }` چه از طریق تعریف صریح با `defineProperty(..)`، در هر دو مورد propertyی روی object ساختیم که در واقع مقدار نگه نمی‌دارد، بلکه دسترسی به آن به‌طور خودکار به فراخوانی تابع پنهان به تابع getter منجر می‌شود، با هر مقداری که برگرداند به‌عنوان نتیجهٔ دسترسی property.

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return 2;
	}
};

myObject.a = 3;

myObject.a; // 2
```

چون فقط getter برای `a` تعریف کردیم، اگر بعداً بخواهیم مقدار `a` را set کنیم، عملیات set error پرتاب نمی‌کند اما فقط انتساب را بی‌سر و صدا دور می‌اندازد. حتی اگر setter معتبری بود، getter سفارشی ما hard-code شده فقط `2` برگرداند، پس عملیات set بی‌اثر می‌شد.

برای معقول‌تر کردن این سناریو، propertyها باید با setter هم تعریف شوند، که عملیات پیش‌فرض `[[Put]]» (به‌اصطلاح انتساب) را به‌ازای هر property override می‌کنند، همان‌طور که انتظار دارید. تقریباً قطعاً می‌خواهید هم getter و هم setter را اعلان کنید (داشتن فقط یکی اغلب به رفتار غیرمنتظره/غافل‌گیرکننده منجر می‌شود):

```js
var myObject = {
	// define a getter for `a`
	get a() {
		return this._a_;
	},

	// define a setter for `a`
	set a(val) {
		this._a_ = val * 2;
	}
};

myObject.a = 2;

myObject.a; // 4
```

**یادداشت:** در این مثال، در واقع مقدار مشخص‌شدهٔ `2` انتساب (عملیات `[[Put]]`) را در متغیر دیگری یعنی `_a_` ذخیره می‌کنیم. نام `_a_` صرفاً بر اساس قرارداد برای این مثال است و دلالتی بر خاص بودن رفتارش ندارد — property معمولی مثل بقیه است.

### Existence

قبلاً نشان دادیم که دسترسی property مثل `myObject.a` ممکن است به مقدار `undefined` منجر شود اگر یا `undefined` صریح آنجا ذخیره شده یا property یعنی `a` اصلاً وجود ندارد. پس اگر مقدار در هر دو مورد یکسان است، چطور دیگر آن‌ها را تشخیص دهیم؟

می‌توانیم از object بپرسیم آیا property خاصی دارد *بدون* درخواست گرفتن مقدار آن property:

```js
var myObject = {
	a: 2
};

("a" in myObject);				// true
("b" in myObject);				// false

myObject.hasOwnProperty( "a" );	// true
myObject.hasOwnProperty( "b" );	// false
```

عملگر `in` بررسی می‌کند آیا property *در* object است، یا در هر سطح بالاتر پیمایش object زنجیرهٔ `[[Prototype]]` وجود دارد (فصل ۵ را ببینید). در مقابل، `hasOwnProperty(..)` بررسی می‌کند آیا *فقط* `myObject` property را دارد یا نه، و زنجیرهٔ `[[Prototype]]` را *مشورت نمی‌کند*. به تفاوت‌های مهم بین این دو عملیات در فصل ۵ وقتی `[[Prototype]]`ها را به‌تفصیل بررسی می‌کنیم برمی‌گردیم.

`hasOwnProperty(..)` از طریق delegation به `Object.prototype` (فصل ۵ را ببینید) برای همهٔ objectهای معمولی قابل دسترسی است. اما ممکن است objectی بسازیم که به `Object.prototype` لینک نشود (از طریق `Object.create(null)` — فصل ۵ را ببینید). در این حالت، فراخوانی متدی مثل `myObject.hasOwnProperty(..)` ناموفق می‌شد.

در آن سناریو، راه مقاوم‌تر انجام چنین بررسی‌ای `Object.prototype.hasOwnProperty.call(myObject,"a")` است که متد پایهٔ `hasOwnProperty(..)` را قرض می‌گیرد و از *explicit binding مربوط به `this`* (فصل ۲ را ببینید) برای اعمالش علیه `myObject` ما استفاده می‌کند.

**یادداشت:** عملگر `in` ظاهراً بررسی وجود *مقدار* داخل ظرف را می‌کند، اما در واقع وجود نام property را بررسی می‌کند. این تفاوت برای آرایه‌ها مهم است، چون وسوسهٔ امتحان بررسی مثل `4 in [2, 4, 6]` قوی است، اما این طور که انتظار می‌رود رفتار نمی‌کند.

#### Enumeration

قبلاً ایدهٔ «enumerability» را وقتی به ویژگی property descriptor یعنی `enumerable` نگاه کردیم به‌طور خلاصه توضیح دادیم. بیایید آن را بازبینیم و با جزئیات بیشتر بررسی کنیم.

```js
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// make `a` enumerable, as normal
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// make `b` NON-enumerable
	{ enumerable: false, value: 3 }
);

myObject.b; // 3
("b" in myObject); // true
myObject.hasOwnProperty( "b" ); // true

// .......

for (var k in myObject) {
	console.log( k, myObject[k] );
}
// "a" 2
```

متوجه می‌شوید که `myObject.b` در واقع **وجود دارد** و مقدار قابل دسترسی دارد، اما در حلقهٔ `for..in` ظاهر نمی‌شود (اگرچه، غافل‌گیرانه، **توسط** بررسی وجود عملگر `in` آشکار می‌شود). چون «enumerable» اساساً یعنی «اگر propertyهای object تکرار شوند شامل می‌شود».

**یادداشت:** حلقه‌های `for..in` اعمال‌شده روی آرایه‌ها می‌توانند نتایج کمی غیرمنتظره بدهند، چون شمارش آرایه نه فقط همهٔ indexهای عددی بلکه هر property قابل شمارش را هم شامل می‌شود. ایدهٔ خوبی است حلقه‌های `for..in` را *فقط* روی objectها استفاده کنید، و حلقه‌های سنتی `for` با تکرار index عددی برای مقادیر ذخیره‌شده در آرایه‌ها.

راه دیگر تشخیص propertyهای enumerable و غیر-enumerable:

```js
var myObject = { };

Object.defineProperty(
	myObject,
	"a",
	// make `a` enumerable, as normal
	{ enumerable: true, value: 2 }
);

Object.defineProperty(
	myObject,
	"b",
	// make `b` non-enumerable
	{ enumerable: false, value: 3 }
);

myObject.propertyIsEnumerable( "a" ); // true
myObject.propertyIsEnumerable( "b" ); // false

Object.keys( myObject ); // ["a"]
Object.getOwnPropertyNames( myObject ); // ["a", "b"]
```

`propertyIsEnumerable(..)` بررسی می‌کند آیا نام property داده‌شده *مستقیماً* روی object وجود دارد و همچنین `enumerable:true` است.

`Object.keys(..)` آرایه‌ای از همهٔ propertyهای enumerable برمی‌گرداند، در حالی که `Object.getOwnPropertyNames(..)` آرایه‌ای از *همهٔ* propertyها برمی‌گرداند، enumerable یا نه.

در حالی که `in` در مقابل `hasOwnProperty(..)` در مشورت کردن یا نکردن با زنجیرهٔ `[[Prototype]]` فرق می‌کنند، `Object.keys(..)` و `Object.getOwnPropertyNames(..)` هر دو *فقط* object مستقیم مشخص‌شده را بررسی می‌کنند.

(فعلاً) راه داخلی برای گرفتن فهرست **همهٔ propertyها** که معادل چیزی است که تست عملگر `in` مشورت می‌کرد (پیمایش همهٔ propertyها روی کل زنجیرهٔ `[[Prototype]]»، همان‌طور که در فصل ۵ توضیح داده شد) وجود ندارد. می‌توانستید چنین ابزاری را با پیمایش بازگشتی زنجیرهٔ `[[Prototype]]` یک object تقریب بزنید، و برای هر سطح، گرفتن فهرست از `Object.keys(..)` — فقط propertyهای enumerable.
