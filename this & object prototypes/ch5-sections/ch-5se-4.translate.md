# پیوندهای Object (Object Links)

همان‌طور که اکنون دیده‌ایم، مکانیزم `[[Prototype]]` پیوندی داخلی است که روی یک object وجود دارد و به object دیگری ارجاع می‌دهد.

این پیوند (عمدتاً) وقتی اعمال می‌شود که ارجاع property/method علیه object اول انجام شود و چنین property/methodی وجود نداشته باشد. در آن صورت، پیوند `[[Prototype]]` به engine می‌گوید property/method را روی object پیوندخورده جستجو کند. به‌نوبهٔ خود، اگر آن object نتواند look-up را برآورده کند، `[[Prototype]]` آن دنبال می‌شود، و همین‌طور ادامه. این رشته پیوندها بین objectها آنچه «prototype chain» خوانده می‌شود را تشکیل می‌دهد.

### `Create()` کردن پیوندها

کاملاً روشن کردیم چرا مکانیزم `[[Prototype]]` در JavaScript **مثل** *class*ها نیست، و دیده‌ایم چگونه در عوض **پیوند**هایی بین objectهای واقعی ایجاد می‌کند.

هدف مکانیزم `[[Prototype]]` چیست؟ چرا برای توسعه‌دهندگان JS این‌قدر رایج است که این‌همه تلاش (شبیه‌سازی classها) در کدشان برای سیم‌کشی این پیوندها کنند؟

به‌یاد دارید اوایل این فصل گفتیم `Object.create(..)` قهرمان خواهد بود؟ حالا آماده‌ایم ببینیم چگونه:

```js
var foo = {
	something: function() {
		console.log( "Tell me something good..." );
	}
};

var bar = Object.create( foo );

bar.something(); // Tell me something good...
```

`Object.create(..)` یک object جدید (`bar`) پیوندخورده به objectی که مشخص کردیم (`foo`) می‌سازد، که همهٔ قدرت (delegation) مکانیزم `[[Prototype]]` را به ما می‌دهد، اما بدون هیچ از پیچیدگی غیرضروری functionهای `new` که به‌عنوان class و constructor call عمل می‌کنند، ارجاع‌های گیج‌کنندهٔ `.prototype` و `.constructor`، یا آن چیزهای اضافه.

**توجه:** `Object.create(null)` objectی می‌سازد که پیوند `[[Prototype]]` خالی (به‌عبارتی `null`) دارد، و در نتیجه آن object نمی‌تواند به هیچ‌جا delegate کند. چون چنین objectی زنجیرهٔ prototype ندارد، عملگر `instanceof` (که پیش‌تر توضیح داده شد) چیزی برای بررسی ندارد، پس همیشه `false` برمی‌گرداند. این objectهای خاص با `[[Prototype]]` خالی را غالباً «dictionary» می‌خوانند چون معمولاً صرفاً برای ذخیرهٔ داده در propertyها استفاده می‌شوند، عمدتاً به‌این‌دلیل که هیچ اثر غافلگیرکننده‌ای از property/functionهای delegate‌شده روی زنجیرهٔ `[[Prototype]]` ندارند، و در نتیجه صرفاً ذخیرهٔ دادهٔ تخت هستند.

برای ایجاد روابط معنادار بین دو object به class *نیاز* نداریم. تنها چیزی که **واقعاً باید** به آن اهمیت دهیم objectهای پیوندخورده برای delegation است، و `Object.create(..)` آن پیوند را بدون همهٔ آشغال class به ما می‌دهد.

#### `Object.create()` Polyfill شده

`Object.create(..)` در ES5 اضافه شد. ممکن است نیاز به پشتیبانی از محیط‌های pre-ES5 (مثل IEهای قدیمی) داشته باشید، پس نگاهی به **partial** polyfill ساده برای `Object.create(..)` بیندازیم که حتی در آن محیط‌های JS قدیمی‌تر قابلیتی که نیاز داریم را به ما می‌دهد:

```js
if (!Object.create) {
	Object.create = function(o) {
		function F(){}
		F.prototype = o;
		return new F();
	};
}
```

این polyfill با استفاده از function یک‌بارمصرف `F` و override کردن propertyِ `.prototype` آن برای اشاره به objectی که می‌خواهیم به آن پیوند بخوریم کار می‌کند. سپس از ساخت `new F()` برای ساختن object جدیدی استفاده می‌کنیم که همان‌طور که مشخص کردیم پیوند خواهد خورد.

این استفاده از `Object.create(..)` تا حد زیادی متداول‌ترین استفاده است، چون بخشی است که *می‌توان* polyfill کرد. مجموعهٔ اضافی از قابلیت وجود دارد که built-in استاندارد ES5ِ `Object.create(..)` ارائه می‌دهد، که برای pre-ES5 **polyfillable نیست**. بنابراین این قابلیت به‌مراتب کمتر متداول استفاده می‌شود. برای کامل بودن، به آن قابلیت اضافی نگاه کنیم:

```js
var anotherObject = {
	a: 2
};

var myObject = Object.create( anotherObject, {
	b: {
		enumerable: false,
		writable: true,
		configurable: false,
		value: 3
	},
	c: {
		enumerable: true,
		writable: false,
		configurable: false,
		value: 4
	}
} );

myObject.hasOwnProperty( "a" ); // false
myObject.hasOwnProperty( "b" ); // true
myObject.hasOwnProperty( "c" ); // true

myObject.a; // 2
myObject.b; // 3
myObject.c; // 4
```

آرگومان دوم به `Object.create(..)` نام propertyهایی را که به object تازه‌ساخته اضافه شوند مشخص می‌کند، از طریق اعلان *property descriptor* هر property جدید (فصل ۳ را ببینید). چون polyfill کردن property descriptorها به pre-ES5 ممکن نیست، این قابلیت اضافی روی `Object.create(..)` نیز قابل polyfill نیست.

اکثریت عظیم استفاده از `Object.create(..)` زیرمجموعهٔ polyfill-safe قابلیت را استفاده می‌کند، پس بیشتر توسعه‌دهندگان با استفاده از **partial polyfill** در محیط‌های pre-ES5 مشکلی ندارند.

برخی توسعه‌دهندگان دیدگاه سخت‌گیرانه‌تری دارند، یعنی هیچ functionی نباید polyfill شود مگر اینکه *کاملاً* قابل polyfill باشد. چون `Object.create(..)` یکی از آن utilityهای partial-polyfill'able است، این دید باریک‌تر می‌گوید اگر در محیط pre-ES5 نیاز به استفاده از هر یک از قابلیت‌های `Object.create(..)` دارید، به‌جای polyfill کردن، باید از utility سفارشی استفاده کنید و از استفاده از نام `Object.create` کاملاً دور بمانید. می‌توانید به‌جای آن utility خودتان را تعریف کنید، مثل:

```js
function createAndLinkObject(o) {
	function F(){}
	F.prototype = o;
	return new F();
}

var anotherObject = {
	a: 2
};

var myObject = createAndLinkObject( anotherObject );

myObject.a; // 2
```

من این نظر سخت‌گیرانه را ندارم. کاملاً از partial polyfill رایج `Object.create(..)` همان‌طور که بالا نشان داده شد حمایت می‌کنم، و استفاده از آن در کدتان حتی در pre-ES5. تصمیم را به خودتان واگذار می‌کنم.

### پیوندها به‌عنوان Fallback؟

وسوسه‌انگیز است فکر کنیم این پیوندها بین objectها *عمدتاً* نوعی fallback برای property یا methodهای «گم‌شده» فراهم می‌کنند. هرچند ممکن است نتیجهٔ مشاهده‌شده باشد، فکر نمی‌کنم نمایندهٔ شیوهٔ درست اندیشیدن دربارهٔ `[[Prototype]]` باشد.

در نظر بگیرید:

```js
var anotherObject = {
	cool: function() {
		console.log( "cool!" );
	}
};

var myObject = Object.create( anotherObject );

myObject.cool(); // "cool!"
```

آن کد به‌واسطهٔ `[[Prototype]]` کار می‌کند، اما اگر آن‌طور نوشتید که `anotherObject` به‌عنوان fallback عمل کند **فقط برای اینکه** `myObject` نتواند برخی property/method را که ممکن است توسعه‌دهنده‌ای بخواهد فراخوانی کند handle کند، احتمالاً نرم‌افزارتان کمی «جادویی»‌تر و سخت‌تر برای فهم و نگهداری خواهد بود.

مراد این نیست که fallback در مواردی الگوی طراحی مناسب نیست، اما در JS بسیار رایج یا idiomatic نیست، پس اگر خودتان را در حال انجامش یافتید، شاید بخواهید قدمی عقب بردارید و دوباره در نظر بگیرید آیا واقعاً طراحی مناسب و معقول است.

**توجه:** در ES6، قابلیت پیشرفته‌ای به‌نام `Proxy` معرفی می‌شود که می‌تواند چیزی از نوع رفتار «method not found» فراهم کند. `Proxy` فراتر از scope این کتاب است، اما در کتاب بعدی مجموعهٔ *"You Don't Know JS"* به‌تفصیل پوشش داده می‌شود.

**نکتهٔ مهم اما ظریف اینجا را از دست ندهید.**

طراحی نرم‌افزار جایی که قصد دارید توسعه‌دهنده‌ای مثلاً `myObject.cool()` را فراخوانی کند و آن کار کند حتی با وجود اینکه متد `cool()` روی `myObject` وجود ندارد، «جادویی» در طراحی API شما معرفی می‌کند که می‌تواند برای توسعه‌دهندگان آینده که نرم‌افزارتان را نگهداری می‌کنند غافلگیرکننده باشد.

بااین‌حال می‌توانید APIتان را با «جادوی» کمتر طراحی کنید، اما همچنان از قدرت پیوند `[[Prototype]]` بهره ببرید.

```js
var anotherObject = {
	cool: function() {
		console.log( "cool!" );
	}
};

var myObject = Object.create( anotherObject );

myObject.doCool = function() {
	this.cool(); // internal delegation!
};

myObject.doCool(); // "cool!"
```

اینجا، `myObject.doCool()` را فراخوانی می‌کنیم که متدی است که *واقعاً* روی `myObject` وجود دارد، و طراحی API ما را صریح‌تر (کمتر «جادویی») می‌کند. *درونی*، پیاده‌سازی ما الگوی طراحی **delegation** را دنبال می‌کند (فصل ۶ را ببینید)، با بهره از delegationِ `[[Prototype]]` به `anotherObject.cool()`.

به‌عبارتی، delegation معمولاً کمتر غافلگیرکننده/گیج‌کننده خواهد بود اگر جزئی از پیاده‌سازی داخلی باشد تا اینکه صریح در طراحی API شما exposed باشد. در فصل بعد **delegation** را به‌تفصیل شرح خواهیم داد.
