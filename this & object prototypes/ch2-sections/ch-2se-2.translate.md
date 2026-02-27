# هیچ‌چیز جز قوانین

اکنون به *نحوهٔ* تعیین call-site می‌پردازیم که `this` در طول اجرای تابع به کجا اشاره کند.

باید call-site را بررسی کنید و تعیین کنید کدام از ۴ قانون اعمال می‌شود. اول هر یک از این ۴ قانون را جداگانه توضیح می‌دهیم، سپس ترتیب اولویت آن‌ها را نشان می‌دهیم، اگر چند قانون *بتوانند* به call-site اعمال شوند.

### Default Binding

اولین قانونی که بررسی می‌کنیم از رایج‌ترین حالت فراخوانی تابع می‌آید: فراخوانی تابع به‌تنهایی. این قانون `this` را قانون پیش‌فرض catch-all در نظر بگیرید وقتی هیچ‌کدام از قوانین دیگر اعمال نشوند.

این کد را در نظر بگیرید:

```js
function foo() {
	console.log( this.a );
}

var a = 2;

foo(); // 2
```

اولین نکته، اگر قبلاً نمی‌دانستید، این است که متغیرهای تعریف‌شده در scope سراسری، مثل `var a = 2`، با propertyهای global object با همان نام هم‌معنی‌اند. کپی یکدیگر نیستند، *خود* یکدیگرند. مثل دو روی یک سکه فکر کنید.

دوم، می‌بینیم وقتی `foo()` فراخوانی می‌شود، `this.a` به متغیر سراسری `a`ی ما برمی‌گردد. چرا؟ چون در این حالت *default binding* برای `this` به فراخوانی تابع اعمال می‌شود و بنابراین `this` را به global object اشاره می‌دهد.

چطور می‌دانیم قانون *default binding* اینجا اعمال می‌شود؟ call-site را بررسی می‌کنیم ببینیم `foo()` چطور فراخوانی شده. در قطعهٔ ما، `foo()` با یک ارجاع تابع ساده و بدون تزئین فراخوانی شده. هیچ‌کدام از قوانین دیگری که نشان خواهیم داد اینجا اعمال نمی‌شوند، پس *default binding* اعمال می‌شود.

اگر `strict mode` فعال باشد، global object واجد *default binding* نیست و در نتیجه `this` به `undefined` تنظیم می‌شود.

```js
function foo() {
	"use strict";

	console.log( this.a );
}

var a = 2;

foo(); // TypeError: `this` is `undefined`
```

جزئیات ظریف اما مهم این است: حتی با اینکه قوانین کلی binding مربوط به `this` کاملاً بر اساس call-site هستند، global object **فقط** وقتی واجد *default binding* است که **محتوای** `foo()` **در** `strict mode` اجرا *نشود*؛ وضعیت `strict mode` در call-site فراخوانی `foo()` بی‌ربط است.

```js
function foo() {
	console.log( this.a );
}

var a = 2;

(function(){
	"use strict";

	foo(); // 2
})();
```

**یادداشت:** مخلوط کردن عمدی `strict mode` و غیر-`strict mode` در کد خودتان عموماً ناپسند است. کل برنامهٔ شما احتمالاً باید یا **Strict** باشد یا **non-Strict**. با این حال گاهی کتابخانهٔ شخص ثالثی دارید که **Strict**بودنش با کد شما فرق دارد، پس باید به این جزئیات سازگاری ظریف توجه کنید.

### Implicit Binding

قانون دیگر این است: آیا call-site یک context object دارد، که به‌نام owning یا containing object هم گفته می‌شود، هرچند *این* اصطلاحات جایگزین می‌توانند کمی گمراه‌کننده باشند.

در نظر بگیرید:

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

obj.foo(); // 2
```

اول، به نحوهٔ تعریف `foo()` و بعد اضافه شدنش به‌عنوان property ارجاعی روی `obj` توجه کنید. فرقی نمی‌کند `foo()` در ابتدا *روی* `obj` تعریف شده یا بعداً به‌عنوان ارجاع اضافه شده (همان‌طور که این قطعه نشان می‌دهد)، در هیچ‌کدام **تابع** واقعاً توسط object یعنی `obj` «مالک» یا «حاوی» نشده.

با این حال، call-site از context یعنی `obj` برای **ارجاع** به تابع **استفاده** می‌کند، پس *می‌توانید* بگویید object یعنی `obj` در زمان فراخوانی تابع **ارجاع تابع** را «مالک» یا «حاوی» است.

هرچه این الگو را بنامید، در لحظهٔ فراخوانی `foo()`، قبلش ارجاعی به object یعنی `obj` هست. وقتی برای ارجاع تابع یک context object وجود دارد، قانون *implicit binding* می‌گوید *همان* object باید برای binding مربوط به `this` فراخوانی تابع استفاده شود.

چون `obj` همان `this` برای فراخوانی `foo()` است، `this.a` با `obj.a` هم‌معنی است.

فقط سطح بالا/آخر زنجیرهٔ ارجاع property در object برای call-site اهمیت دارد. مثلاً:

```js
function foo() {
	console.log( this.a );
}

var obj2 = {
	a: 42,
	foo: foo
};

var obj1 = {
	a: 2,
	obj2: obj2
};

obj1.obj2.foo(); // 42
```

#### Implicitly Lost

یکی از رایج‌ترین ناامیدی‌هایی که binding مربوط به `this` ایجاد می‌کند وقتی است که تابع *implicitly bound* آن binding را از دست می‌دهد، که معمولاً یعنی به *default binding* برمی‌گردد، یا global object یا `undefined`، بسته به `strict mode`.

در نظر بگیرید:

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

var bar = obj.foo; // function reference/alias!

var a = "oops, global"; // `a` also property on global object

bar(); // "oops, global"
```

حتی با اینکه `bar` به نظر ارجاع به `obj.foo` می‌رسد، در واقع فقط ارجاع دیگری به خود `foo` است. علاوه بر این، call-site مهم است، و call-site همان `bar()` است که فراخوانی ساده و بدون تزئین است و بنابراین *default binding* اعمال می‌شود.

طریق ظریف‌تر، رایج‌تر و غیرمنتظره‌تر وقوع این وقتی است که پاس دادن یک تابع callback را در نظر می‌گیریم:

```js
function foo() {
	console.log( this.a );
}

function doFoo(fn) {
	// `fn` is just another reference to `foo`

	fn(); // <-- call-site!
}

var obj = {
	a: 2,
	foo: foo
};

var a = "oops, global"; // `a` also property on global object

doFoo( obj.foo ); // "oops, global"
```

پاس دادن پارامتر فقط یک انتساب ضمنی است، و چون تابع پاس می‌دهیم، انتساب ارجاع ضمنی است، پس نتیجهٔ نهایی مثل قطعهٔ قبل است.

اگر تابعی که callback را به آن پاس می‌دهید مال خودتان نباشد بلکه داخلی زبان باشد چه؟ فرقی نمی‌کند، همان نتیجه.

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

var a = "oops, global"; // `a` also property on global object

setTimeout( obj.foo, 100 ); // "oops, global"
```

به این پیاده‌سازی شبه‌نظری خام از `setTimeout()` که به‌عنوان داخلی از محیط جاوااسکریپت فراهم شده فکر کنید:

```js
function setTimeout(fn,delay) {
	// wait (somehow) for `delay` milliseconds
	fn(); // <-- call-site!
}
```

کاملاً رایج است که تابع‌های callback ما binding مربوط به `this` را *از دست* بدهند، همان‌طور که دیدیم. اما راه دیگر غافل‌گیر شدن با `this` وقتی است که تابعی که callback را به آن پاس داده‌ایم عمداً `this` فراخوانی را عوض کند. event handlerها در کتابخانه‌های محبوب جاوااسکریپت علاقهٔ زیادی به وادار کردن callback شما به داشتن `this`ی دارند که مثلاً به DOM element مسبب event اشاره کند. هرچند گاهی مفید باشد، گاهی دیگر می‌تواند واقعاً عصبانی‌کننده باشد. متأسفانه این ابزارها به‌ندرت به شما امکان انتخاب می‌دهند.

در هر دو صورت که `this` غیرمنتظره عوض شود، شما واقعاً کنترلی روی نحوهٔ اجرای ارجاع تابع callback ندارید، پس راهی (هنوز) برای کنترل call-site برای دادن binding مورد نظرتان ندارید. به‌زودی راهی برای «درست کردن» آن مسئله با *ثابت* کردن `this` خواهیم دید.

### Explicit Binding

با *implicit binding* همان‌طور که دیدیم، مجبور بودیم object مورد نظر را طوری تغییر دهیم که ارجاعی به تابع روی خودش داشته باشد، و از این ارجاع تابع property برای bind کردن غیرمستقیم (ضمنی) `this` به object استفاده کنیم.

اما اگر بخواهید فراخوانی تابع را وادار کنید برای binding مربوط به `this` از object خاصی استفاده کند، بدون گذاشتن ارجاع تابع به‌عنوان property روی object؟

«همهٔ» توابع زبان چند ابزار در دسترس دارند (از طریق `[[Prototype]]`شان — بعداً بیشتر) که برای این کار مفیدند. مشخصاً، توابع متدهای `call(..)` و `apply(..)` دارند. از نظر فنی، محیط‌های میزبان جاوااسکریپت گاهی توابعی فراهم می‌کنند که آن‌قدر خاص‌اند (به بیان ملایم!) که چنین قابلیتی ندارند. اما تعدادشان کم است. اکثر قریب به اتفاق توابع فراهم‌شده، و قطعاً همهٔ توابعی که می‌سازید، به `call(..)` و `apply(..)` دسترسی دارند.

این ابزارها چطور کار می‌کنند؟ هر دو به‌عنوان اولین پارامتر objectی برای استفاده به‌عنوان `this` می‌گیرند، سپس تابع را با آن `this` مشخص‌شده فراخوانی می‌کنند. چون مستقیماً می‌گویید `this` چه باشد، آن را *explicit binding* می‌نامیم.

در نظر بگیرید:

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2
};

foo.call( obj ); // 2
```

فراخوانی `foo` با *explicit binding* با `foo.call(..)` به ما اجازه می‌دهد `this` آن را به `obj` وادار کنیم.

اگر یک مقدار سادهٔ اولیه (از نوع `string`، `boolean` یا `number`) به‌عنوان binding مربوط به `this` پاس دهید، مقدار اولیه در شکل objectاش wrap می‌شود (به‌ترتیب `new String(..)`، `new Boolean(..)` یا `new Number(..)`). این اغلب «boxing» نامیده می‌شود.

**یادداشت:** دربارهٔ binding مربوط به `this`، `call(..)` و `apply(..)` یکسان‌اند. با پارامترهای اضافی *رفتار* متفاوتی دارند، اما الان برایمان مهم نیست.

متأسفانه، *explicit binding* به‌تنهایی هنوز راه‌حلی برای مسئلهٔ قبلاً ذکرشده — «از دست دادن» binding مورد نظر `this` توسط تابع یا زیر پا گذاشتنش توسط framework و غیره — ارائه نمی‌دهد.

#### Hard Binding

اما یک الگوی تغییر حول *explicit binding* در واقع کار را می‌کند. در نظر بگیرید:

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2
};

var bar = function() {
	foo.call( obj );
};

bar(); // 2
setTimeout( bar, 100 ); // 2

// `bar` hard binds `foo`'s `this` to `obj`
// so that it cannot be overriden
bar.call( window ); // 2
```

ببینیم این تغییر چطور کار می‌کند. تابعی به نام `bar()` می‌سازیم که درونش دستی `foo.call(obj)` را فراخوانی می‌کند و بنابراین `foo` را با binding یعنی `obj` برای `this` به‌زور فراخوانی می‌کند. مهم نیست بعداً چطور `bar` را فراخوانی کنید، همیشه دستی `foo` را با `obj` فراخوانی می‌کند. این binding هم صریح است هم قوی، پس آن را *hard binding* می‌نامیم.

معمول‌ترین راه wrap کردن تابع با *hard binding* ایجاد pass-thru برای هر argument پاس‌داده‌شده و هر مقدار برگشتی است:

```js
function foo(something) {
	console.log( this.a, something );
	return this.a + something;
}

var obj = {
	a: 2
};

var bar = function() {
	return foo.apply( obj, arguments );
};

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

راه دیگر بیان این الگو ساختن یک helper قابل استفادهٔ مجدد است:

```js
function foo(something) {
	console.log( this.a, something );
	return this.a + something;
}

// simple `bind` helper
function bind(fn, obj) {
	return function() {
		return fn.apply( obj, arguments );
	};
}

var obj = {
	a: 2
};

var bar = bind( foo, obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

چون *hard binding* الگوی خیلی رایجی است، از ES5 به‌عنوان ابزار داخلی فراهم شده: `Function.prototype.bind`، و این‌طور استفاده می‌شود:

```js
function foo(something) {
	console.log( this.a, something );
	return this.a + something;
}

var obj = {
	a: 2
};

var bar = foo.bind( obj );

var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

`bind(..)` تابع جدیدی برمی‌گرداند که طوری hard-code شده که تابع اصلی را با context یعنی `this` که مشخص کرده‌اید فراخوانی کند.

**یادداشت:** از ES6، تابع hard-bound تولیدشده توسط `bind(..)` propertyای به نام `.name` دارد که از *target function* اصلی گرفته می‌شود. مثلاً: `bar = foo.bind(..)` باید مقدار `bar.name` برابر `"bound foo"` داشته باشد که نام فراخوانی تابعی است که باید در stack trace نمایش داده شود.

#### API Call "Contexts"

تابع‌های بسیاری از کتابخانه‌ها، و در واقع بسیاری از توابع داخلی جدید در زبان جاوااسکریپت و محیط میزبان، پارامتر اختیاری فراهم می‌کنند، معمولاً «context» نامیده می‌شود، که برای این طراحی شده که لازم نباشد از `bind(..)` استفاده کنید تا مطمئن شوید تابع callback شما از `this` خاصی استفاده می‌کند.

مثلاً:

```js
function foo(el) {
	console.log( el, this.id );
}

var obj = {
	id: "awesome"
};

// use `obj` as `this` for `foo(..)` calls
[1, 2, 3].forEach( foo, obj ); // 1 awesome  2 awesome  3 awesome
```

درونی، این توابع مختلف تقریباً قطعاً از *explicit binding* با `call(..)` یا `apply(..)` استفاده می‌کنند و زحمت را از دوش شما برمی‌دارند.

### `new` Binding

چهارمین و آخرین قانون برای binding مربوط به `this` از ما می‌خواهد تصور بسیار رایج دربارهٔ توابع و objectها در جاوااسکریپت را بازاندیشی کنیم.

در زبان‌های سنتی مبتنی بر class، «constructor»ها متدهای خاصی هستند که به classها وصل‌اند و وقتی class با عملگر `new` instantiate می‌شود، constructor آن class فراخوانی می‌شود. معمولاً چیزی شبیه این است:

```js
something = new MyClass(..);
```

جاوااسکریپت عملگر `new` دارد، و الگوی کد برای استفاده از آن اساساً با آنچه در آن زبان‌های مبتنی بر class می‌بینیم یکسان است؛ بیشتر توسعه‌دهندگان فرض می‌کنند مکانیزم جاوااسکریپت کار مشابهی می‌کند. با این حال، واقعاً *هیچ ارتباطی* با قابلیت مبتنی بر class که استفاده از `new` در JS دلالت می‌کند وجود ندارد.

اول، تعریف کنیم «constructor» در جاوااسکریپت چیست. در JS، constructorها **فقط توابعی** هستند که اتفاقاً با عملگر `new` جلوشان فراخوانی می‌شوند. به classها وصل نیستند، و class را instantiate نمی‌کنند. حتی نوع خاصی از توابع هم نیستند. فقط توابع معمولی‌اند که در اصل با استفاده از `new` در فراخوانی‌شان ربوده شده‌اند.

مثلاً، تابع `Number(..)` در نقش constructor، به نقل از مشخصات ES5.1:

> 15.7.2 The Number Constructor
>
> When Number is called as part of a new expression it is a constructor: it initialises the newly created object.

پس تقریباً هر تابع قدیمی، از جمله توابع object داخلی مثل `Number(..)` (فصل ۳ را ببینید) می‌تواند با `new` جلوش فراخوانی شود، و آن فراخوانی تابع را به *constructor call* تبدیل می‌کند. این تمایز مهم اما ظریف است: واقعاً چیزی به نام «توابع constructor» وجود ندارد، بلکه construction call *از* توابع داریم.

وقتی تابع با `new` جلوش فراخوانی می‌شود، که به‌نام constructor call هم شناخته می‌شود، این کارها به‌طور خودکار انجام می‌شوند:

1. یک object کاملاً جدید از هیچ ساخته (به‌اصطلاح construct) می‌شود
2. *object تازه ساخته‌شده به `[[Prototype]]` لینک می‌شود*
3. object تازه ساخته‌شده به‌عنوان binding مربوط به `this` برای آن فراخوانی تابع تنظیم می‌شود
4. مگر اینکه تابع **object** جایگزین خودش را برگرداند، فراخوانی تابع با `new` *به‌طور خودکار* object تازه ساخته‌شده را برمی‌گرداند.

مراحل ۱، ۳ و ۴ به بحث فعلی ما مربوط‌اند. مرحلهٔ ۲ را فعلاً رد می‌کنیم و در فصل ۵ برمی‌گردیم.

این کد را در نظر بگیرید:

```js
function foo(a) {
	this.a = a;
}

var bar = new foo( 2 );
console.log( bar.a ); // 2
```

با فراخوانی `foo(..)` با `new` جلوش، object جدیدی ساخته‌ایم و آن object جدید را به‌عنوان `this` برای فراخوانی `foo(..)` تنظیم کرده‌ایم. **پس `new` آخرین راهی است که `this` یک فراخوانی تابع می‌تواند bind شود.** این را *new binding* می‌نامیم.
