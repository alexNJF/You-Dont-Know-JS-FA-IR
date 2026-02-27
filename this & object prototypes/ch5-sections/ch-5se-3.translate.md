# «وراثت (Prototypal)»

برخی تقریب‌های «class» mechanics را آن‌گونه که معمولاً در برنامه‌های JavaScript هک شده‌اند دیده‌ایم. اما «class»های JavaScript اگر تقریبی از «inheritance» نداشتیم نسبتاً توخالی می‌بودند.

در واقع، مکانیزمی را که معمولاً «prototypal inheritance» خوانده می‌شود وقتی دیدیم که `a` توانست از `Foo.prototype` «inherit» کند و بدین‌سان به functionِ `myName()` دسترسی یابد. اما به‌طور سنتی «inheritance» را رابطه‌ای بین دو «class» می‌دانیم، نه بین «class» و «instance».

<img src="fig3.png">

این شکل را از پیش به‌یاد آورید، که نه‌تنها delegation را از یک object (به‌عبارتی «instance») `a1` به objectِ `Foo.prototype` نشان می‌دهد، بلکه از `Bar.prototype` به `Foo.prototype`، که تا حدی به مفهوم Parent-Child class inheritance شبیه است. *شبیه*، مگر جهت فلش‌ها که نشان می‌دهند این‌ها پیوندهای delegation هستند نه عملیات کپی.

و این کد «prototype style» معمول است که چنین پیوندهایی ایجاد می‌کند:

```js
function Foo(name) {
	this.name = name;
}

Foo.prototype.myName = function() {
	return this.name;
};

function Bar(name,label) {
	Foo.call( this, name );
	this.label = label;
}

// here, we make a new `Bar.prototype`
// linked to `Foo.prototype`
Bar.prototype = Object.create( Foo.prototype );

// Beware! Now `Bar.prototype.constructor` is gone,
// and might need to be manually "fixed" if you're
// in the habit of relying on such properties!

Bar.prototype.myLabel = function() {
	return this.label;
};

var a = new Bar( "a", "obj a" );

a.myName(); // "a"
a.myLabel(); // "obj a"
```

**توجه:** برای درک اینکه چرا `this` در قطعهٔ کد بالا به `a` اشاره می‌کند، فصل ۲ را ببینید.

بخش مهم `Bar.prototype = Object.create( Foo.prototype )` است. `Object.create(..)` یک object «جدید» از هیچ *می‌سازد*، و `[[Prototype]]` داخلی آن object جدید را به objectی که مشخص می‌کنید (در این مورد `Foo.prototype`) پیوند می‌زند.

به‌عبارتی، آن خط می‌گوید: «یک object جدید «Bar dot prototype» بساز که به «Foo dot prototype» پیوند خورده است.»

وقتی `function Bar() { .. }` تعریف می‌شود، `Bar` مثل هر function دیگری پیوند `.prototype` به object پیش‌فرضش دارد. اما *آن* object به `Foo.prototype` آن‌گونه که می‌خواهیم پیوند نخورده است. پس object *جدیدی* می‌سازیم که *همان‌طور* که می‌خواهیم پیوند خورده است، و در عمل object نادرست‌پیوند‌خوردهٔ اصلی را دور می‌اندازیم.

**توجه:** سوءتفاهم/سردرگمی رایج اینجاست که هر یک از رویکردهای زیر *هم* کار می‌کنند، اما آن‌گونه که انتظار دارید کار نمی‌کنند:

```js
// doesn't work like you want!
Bar.prototype = Foo.prototype;

// works kinda like you want, but with
// side-effects you probably don't want :(
Bar.prototype = new Foo();
```

`Bar.prototype = Foo.prototype` object جدیدی برای پیوند خوردن `Bar.prototype` ایجاد نمی‌کند. فقط `Bar.prototype` را به ارجاع دیگری به `Foo.prototype` بدل می‌کند، که در عمل `Bar` را مستقیماً به **همان objectی** که `Foo` به آن پیوند دارد پیوند می‌زند: `Foo.prototype`. یعنی وقتی شروع به assign کردن می‌کنید، مثل `Bar.prototype.myLabel = ...`، **نه یک object جدا** بلکه خود object مشترک `Foo.prototype` را تغییر می‌دهید، که هر object پیوندخورده به `Foo.prototype` را تحت تأثیر قرار می‌دهد. این تقریباً قطعاً آنچه می‌خواهید نیست. اگر *همان* است، پس احتمالاً اصلاً به `Bar` نیاز ندارید و فقط باید از `Foo` استفاده کنید و کدتان را ساده‌تر کنید.

`Bar.prototype = new Foo()` **در واقع** object جدیدی می‌سازد که درست به `Foo.prototype` آن‌گونه که می‌خواهیم پیوند خورده است. اما از «constructor call»ِ `Foo(..)` برای انجامش استفاده می‌کند. اگر آن function هر اثر جانبی داشته باشد (مثل logging، تغییر state، ثبت در برابر objectهای دیگر، **اضافه کردن data property به `this`** و غیره)، آن اثرهای جانبی در زمان این پیوند رخ می‌دهند (و احتمالاً روی object اشتباه!)، نه فقط وقتی «نسل»های نهایی `Bar()` ساخته می‌شوند، آن‌گونه که احتمالاً انتظار می‌رود.

پس، با `Object.create(..)` می‌مانیم برای ساختن object جدیدی که درست پیوند خورده، اما بدون اثرهای جانبی فراخوانی `Foo(..)`. downside اندک این است که باید object جدید بسازیم و قدیمی را دور بیندازیم، به‌جای تغییر object پیش‌فرض موجودی که به ما داده شده.

*خوب* می‌بود اگر راهی استاندارد و قابل اعتماد برای تغییر پیوند یک object موجود بود. پیش از ES6، راهی non-standard و نه کاملاً cross-browser از طریق propertyِ `.__proto__` وجود دارد که settable است. ES6 متد کمکی `Object.setPrototypeOf(..)` را اضافه می‌کند که به‌شیوه‌ای استاندارد و قابل پیش‌بینی کار را انجام می‌دهد.

تکنیک‌های pre-ES6 و استانداردشدهٔ ES6 برای پیوند زدن `Bar.prototype` به `Foo.prototype` را در کنار هم مقایسه کنید:

```js
// pre-ES6
// throws away default existing `Bar.prototype`
Bar.prototype = Object.create( Foo.prototype );

// ES6+
// modifies existing `Bar.prototype`
Object.setPrototypeOf( Bar.prototype, Foo.prototype );
```

با نادیده گرفتن disadvantage عملکرد اندک (دور انداختن objectی که بعداً garbage collect می‌شود) رویکرد `Object.create(..)`، کمی کوتاه‌تر است و شاید کمی خواناتر از رویکرد ES6+ باشد. اما احتمالاً از نظر نحوی هر دو یکسان‌اند.

### بررسی روابط «Class»

اگر objectی مثل `a` دارید و می‌خواهید بفهمید به چه objectی (اگر هست) delegate می‌کند چه؟ بررسی یک instance (فقط یک object در JS) برای ancestry وراثت (delegation linkage در JS) را در محیط‌های سنتی class-oriented غالباً *introspection* (یا *reflection*) می‌خوانند.

در نظر بگیرید:

```js
function Foo() {
	// ...
}

Foo.prototype.blah = ...;

var a = new Foo();
```

چطور آنگاه `a` را برای یافتن «ancestry» (delegation linkage) آن introspect کنیم؟ رویکرد اول سردرگمی «class» را در آغوش می‌گیرد:

```js
a instanceof Foo; // true
```

عملگر `instanceof` یک object ساده را به‌عنوان عملوند چپ و یک **function** را به‌عنوان عملوند راست می‌گیرد. پرسشی که `instanceof` پاسخ می‌دهد این است: **در کل زنجیرهٔ `[[Prototype]]`ِ `a`، آیا objectی که دلخواه به‌وسیلهٔ `Foo.prototype` به آن اشاره شده هرگز ظاهر می‌شود؟**

متأسفانه، یعنی فقط اگر **function**ای (`Foo` با ارجاع `.prototype` متصلش) برای آزمون داشته باشید می‌توانید از «ancestry» یک object (`a`) بپرسید. اگر دو object دلخواه دارید، مثلاً `a` و `b`، و می‌خواهید بفهمید آیا *objectها* از طریق زنجیرهٔ `[[Prototype]]` به هم مربوط‌اند، `instanceof` به‌تنهایی کمکی نمی‌کند.

**توجه:** اگر از متد built-inِ `.bind(..)` برای ساختن function hard-bound (فصل ۲ را ببینید) استفاده کنید، function ساخته‌شده propertyِ `.prototype` نخواهد داشت. استفاده از `instanceof` با چنین functionی به‌طور شفاف `.prototype`ِ *target function*ای که function hard-bound از آن ساخته شده را جایگزین می‌کند.

استفاده از functionهای hard-bound به‌عنوان «constructor call» نسبتاً غیرمتداول است، اما اگر چنین کنید، طوری رفتار می‌کند که گویی *target function* اصلی فراخوانی شده، یعنی استفاده از `instanceof` با function hard-bound نیز طبق function اصلی رفتار می‌کند.

این قطعه پوچی تلاش برای استدلال دربارهٔ روابط بین **دو object** با معناشناسی «class» و `instanceof` را نشان می‌دهد:

```js
// helper utility to see if `o1` is
// related to (delegates to) `o2`
function isRelatedTo(o1, o2) {
	function F(){}
	F.prototype = o2;
	return o1 instanceof F;
}

var a = {};
var b = Object.create( a );

isRelatedTo( b, a ); // true
```

درون `isRelatedTo(..)`، یک function یک‌بارمصرف `F` قرض می‌گیریم، `.prototype`ش را reassign می‌کنیم تا دلخواه به objectی `o2` اشاره کند، سپس می‌پرسیم آیا `o1` «instance of»ِ `F` است. واضح است که `o1` *واقعاً* از `F` inherit یا descend نشده یا حتی construct نشده، پس باید روشن باشد چرا این نوع تمرین پوچ و گیج‌کننده است. **مشکل به awkwardness معناشناسی class تحمیل‌شده بر JavaScript برمی‌گردد**، در این مورد آن‌گونه که توسط معناشناسی غیرمستقیم `instanceof` آشکار می‌شود.

رویکرد دوم و بسیار تمیزتر برای reflectionِ `[[Prototype]]` این است:

```js
Foo.prototype.isPrototypeOf( a ); // true
```

توجه کنید که در این مورد، واقعاً به `Foo` کاری نداریم (یا حتی *نیاز* نداریم)، فقط به یک **object** (در مورد ما، با برچسب دلخواه `Foo.prototype`) برای آزمون در برابر **object** دیگری نیاز داریم. پرسشی که `isPrototypeOf(..)` پاسخ می‌دهد این است: **در کل زنجیرهٔ `[[Prototype]]`ِ `a`، آیا `Foo.prototype` هرگز ظاهر می‌شود؟**

همان پرسش، و دقیقاً همان پاسخ. اما در این رویکرد دوم، واقعاً به indirection ارجاع به **function**ای (`Foo`) که propertyِ `.prototype`ش خودکار consult می‌شود نیاز نداریم.

*فقط* به دو **object** برای بررسی رابطه بین آن‌ها نیاز داریم. مثلاً:

```js
// Simply: does `b` appear anywhere in
// `c`s [[Prototype]] chain?
b.isPrototypeOf( c );
```

توجه کنید، این رویکرد اصلاً به function («class») نیاز ندارد. فقط مستقیماً از ارجاع‌های object به `b` و `c` استفاده می‌کند و از رابطهٔ آن‌ها می‌پرسد. به‌عبارتی، utilityِ `isRelatedTo(..)` ما بالا در زبان built-in است و `isPrototypeOf(..)` نامیده می‌شود.

همچنین می‌توانیم مستقیماً `[[Prototype]]` یک object را بازیابی کنیم. از ES5 به بعد، راه استاندارد این است:

```js
Object.getPrototypeOf( a );
```

و متوجه می‌شوید آن ارجاع object همان است که انتظار داریم:

```js
Object.getPrototypeOf( a ) === Foo.prototype; // true
```

بیشتر مرورگرها (نه همه!) مدتهاست روش غیراستاندارد دیگری برای دسترسی به `[[Prototype]]` داخلی را پشتیبانی کرده‌اند:

```js
a.__proto__ === Foo.prototype; // true
```

Property غریب `.__proto__` (تا ES6 استاندارد نشده بود!) به‌طور «جادویی» `[[Prototype]]` داخلی یک object را به‌عنوان ارجاع بازیابی می‌کند، که اگر بخواهید زنجیره را مستقیماً بررسی (یا حتی پیمایش: `.__proto__.__proto__...`) کنید بسیار مفید است.

همان‌طور که پیش‌تر با `.constructor` دیدیم، `.__proto__` در واقع روی objectی که بررسی می‌کنید (`a` در مثال جاری ما) وجود ندارد. در واقع، روی `Object.prototype`ی built-in (non-enumerable؛ فصل ۲ را ببینید) وجود دارد، همراه با utilityهای رایج دیگر (`.toString()`، `.isPrototypeOf(..)` و غیره).

افزون بر این، `.__proto__` شبیه property است، اما در واقع درست‌تر این است آن را getter/setter بدانیم (فصل ۳ را ببینید).

تقریباً می‌توانیم `.__proto__` را این‌گونه تصور کنیم (فصل ۳ را برای تعاریف property object ببینید):

```js
Object.defineProperty( Object.prototype, "__proto__", {
	get: function() {
		return Object.getPrototypeOf( this );
	},
	set: function(o) {
		// setPrototypeOf(..) as of ES6
		Object.setPrototypeOf( this, o );
		return o;
	}
} );
```

پس وقتی به `a.__proto__` دسترسی می‌کنیم (مقدارش را بازیابی می‌کنیم)، مثل فراخوانی `a.__proto__()` است (فراخوانی function getter). آن فراخوانی function، `a` را به‌عنوان `this` دارد حتی با وجود اینکه function getter روی objectِ `Object.prototype` وجود دارد (فصل ۲ را برای قوانین bindingِ `this` ببینید)، پس درست مثل گفتن `Object.getPrototypeOf( a )` است.

`.__proto__` همچنین propertyای settable است، درست مثل استفاده از `Object.setPrototypeOf(..)`ِ ES6 که پیش‌تر نشان دادیم. بااین‌حال، به‌طور کلی **نباید `[[Prototype]]` یک object موجود را تغییر دهید.**

تکنیک‌های بسیار پیچیده و پیشرفته‌ای در اعماق برخی frameworkها استفاده می‌شود که اجازهٔ حقه‌هایی مثل «subclassing» کردن `Array` را می‌دهند، اما این به‌طور کلی در عمل برنامه‌نویسی معمولاً مذموم است، چون معمولاً به کدی *بسیار* سخت‌تر برای فهم/نگهداری منجر می‌شود.

**توجه:** از ES6 به بعد، کلیدواژهٔ `class` چیزی را که تقریباً «subclassing» built-inهایی مثل `Array` است اجازه می‌دهد. پیوست الف را برای بحث دربارهٔ سینتکس `class` اضافه‌شده در ES6 ببینید.

تنها استثنای باریک دیگر (همان‌طور که پیش‌تر ذکر شد) تنظیم `[[Prototype]]` objectِ `.prototype` پیش‌فرض یک function برای ارجاع به object دیگری (غیر از `Object.prototype`) است. آن باعث می‌شود آن object پیش‌فرض را کاملاً با object پیوندخوردهٔ جدید جایگزین نکنیم. در غیر این صورت، **بهترین کار این است پیوند `[[Prototype]]`ِ object را ویژگی read-only بدانید** برای سهولت خواندن کدتان بعداً.

**توجه:** جامعهٔ JavaScript به‌طور غیررسمی اصطلاحی برای double-underscore، به‌طور خاص leading در propertyهایی مثل `__proto__` سکه زد: «dunder». پس «cool kids» در JavaScript معمولاً `__proto__` را «dunder proto» تلفظ می‌کنند.
