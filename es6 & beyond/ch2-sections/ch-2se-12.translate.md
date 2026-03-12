# Symbols

در ES6، بعد از مدت‌ها، یک primitive type جدید به JavaScript اضافه شد: `symbol`. برخلاف primitive typeهای دیگر، symbol فرم literal ندارد.

ساخت symbol:

```js
var sym = Symbol( "some optional description" );

typeof sym;		// "symbol"
```

چند نکته:

* نباید و نمی‌توانید با `Symbol(..)` از `new` استفاده کنید. constructor نیست و object هم تولید نمی‌کند.
* پارامتر `Symbol(..)` اختیاری است. اگر بدهید باید string باشد و صرفاً توضیح دوستانه‌ای دربارهٔ purpose آن symbol ارائه دهد.
* خروجی `typeof` مقدار جدید `"symbol"` است که اصلی‌ترین راه تشخیص symbol به‌شمار می‌رود.

اگر description بدهید، فقط برای نمایش stringified symbol استفاده می‌شود:

```js
sym.toString();		// "Symbol(some optional description)"
```

مشابه اینکه primitive string نمونه‌ای از `String` نیست، symbol هم نمونه‌ای از `Symbol` نیست. اگر به هر دلیل خواستید wrapper object بسازید:

```js
sym instanceof Symbol;		// false

var symObj = Object( sym );
symObj instanceof Symbol;	// true

symObj.valueOf() === sym;	// true
```

**نکته:** در این snippet، `symObj` و `sym` در محل استفاده قابل‌جایگزینی‌اند. معمولاً دلیل خاصی برای ترجیح wrapper object (`symObj`) به primitive (`sym`) وجود ندارد. مثل سایر primitiveها، بهتر است `sym` را ترجیح دهید.

value درونی خود symbol -- که `name` نامیده می‌شود -- از کد پنهان است و قابل استخراج نیست. می‌توانید آن را مثل یک string یکتای خودکار (در سطح برنامهٔ شما) تصور کنید.

اگر value پنهان و غیرقابل‌دستیابی است، پس symbol چه فایده‌ای دارد؟

هدف اصلی symbol ساخت یک value شبیه string است که با value دیگری collision نکند. مثلاً symbol را به‌عنوان ثابت نام event استفاده کنید:

```js
const EVT_LOGIN = Symbol( "event.login" );
```

بعد به‌جای string literal عمومی مثل `"event.login"` از `EVT_LOGIN` استفاده می‌کنید:

```js
evthub.listen( EVT_LOGIN, function(data){
	// ..
} );
```

مزیت: `EVT_LOGIN` valueای دارد که (تصادفی یا عمدی) تکرار نمی‌شود، پس ابهامی در اینکه کدام event dispatch/handle می‌شود به‌وجود نمی‌آید.

**نکته:** در مثال بالا utility فرضی `evthub` تقریباً قطعاً از value symbol مربوط به `EVT_LOGIN` مستقیماً به‌عنوان property/key داخلی در object هشِ نگهدارندهٔ handlerها استفاده می‌کند. اگر لازم بود symbol واقعاً به string تبدیل شود، باید صراحتاً `String(..)` یا `toString()` فراخوانی شود؛ coercion ضمنی symbol به string مجاز نیست.

می‌توانید symbol را مستقیم به‌عنوان property/key روی object استفاده کنید؛ مثلاً برای property خاصی که می‌خواهید meta یا شبه‌پنهان باشد. مهم است بدانید این property واقعاً *مخفی و دست‌نایافتنی* نیست.

ماژولی را ببینید که الگوی *singleton* را پیاده‌سازی می‌کند (فقط یک‌بار ساخته شود):

```js
const INSTANCE = Symbol( "instance" );

function HappyFace() {
	if (HappyFace[INSTANCE]) return HappyFace[INSTANCE];

	function smile() { .. }

	return HappyFace[INSTANCE] = {
		smile: smile
	};
}

var me = HappyFace(),
	you = HappyFace();

me === you;			// true
```

value نماد `INSTANCE` اینجا property ویژه، تقریباً پنهان و meta-مانندی است که به‌صورت static روی function object یعنی `HappyFace()` ذخیره شده.

می‌توانست یک property عادی مثل `__instance` هم باشد و رفتار یکسان بماند. استفاده از symbol صرفاً سبک metaprogramming را بهتر می‌کند و این property را از propertyهای عادی جدا می‌سازد.

### Symbol Registry

یک نقطه‌ضعف ملایم استفاده از symbol به سبک مثال‌های بالا این است که متغیرهایی مثل `EVT_LOGIN` و `INSTANCE` باید در scope بیرونی (حتی شاید global) نگه داشته شوند یا جایی عمومی ذخیره شوند تا تمام بخش‌های کد بتوانند به آن‌ها دسترسی داشته باشند.

برای بهتر کردن سازمان‌دهی دسترسی، می‌توانید symbolها را با *global symbol registry* بسازید:

```js
const EVT_LOGIN = Symbol.for( "event.login" );

console.log( EVT_LOGIN );		// Symbol(event.login)
```

و:

```js
function HappyFace() {
	const INSTANCE = Symbol.for( "instance" );

	if (HappyFace[INSTANCE]) return HappyFace[INSTANCE];

	// ..

	return HappyFace[INSTANCE] = { .. };
}
```

`Symbol.for(..)` در registry سراسری می‌گردد؛ اگر symbolی با description داده‌شده وجود داشته باشد همان را برمی‌گرداند، وگرنه می‌سازد و برمی‌گرداند. یعنی registry در عمل symbolها را بر اساس description مثل singleton مدیریت می‌کند.

این یعنی هر بخش برنامه، اگر همان description را بداند، می‌تواند همان symbol را با `Symbol.for(..)` بازیابی کند.

از قضا symbolها قرار است جای *magic string*ها را بگیرند، اما برای یافتن/تمایز دادنشان در registry دوباره از string descriptionهای «جادویی» استفاده می‌کنیم!

برای جلوگیری از collision ناخواسته، بهتر است descriptionها را یکتا طراحی کنید؛ ساده‌ترین راه افزودن prefix/context/namespacing است.

نمونه:

```js
function extractValues(str) {
	var key = Symbol.for( "extractValues.parse" ),
		re = extractValues[key] ||
			/[^=&]+?=([^&]+?)(?=&|$)/g,
		values = [], match;

	while (match = re.exec( str )) {
		values.push( match[1] );
	}

	return values;
}
```

اینجا از magic string یعنی `"extractValues.parse"` استفاده می‌کنیم چون احتمال collision آن در registry بسیار پایین است.

اگر مصرف‌کنندهٔ utility بخواهد regular expression parsing را override کند، باز هم می‌تواند از registry استفاده کند:

```js
extractValues[Symbol.for( "extractValues.parse" )] =
	/..some pattern../g;

extractValues( "..some string.." );
```

جدای کمک registry برای نگهداری global، همهٔ این کارها با خود string `"extractValues.parse"` هم ممکن بود. بهبود اصلی بیشتر در سطح metaprogramming است تا سطح عملکرد.

گاهی لازم دارید برای symbol ذخیره‌شده در registry بفهمید با چه description/keyای ثبت شده؛ مثلاً وقتی نمی‌توانید خود value symbol را پاس دهید و باید راه پیدا کردنش را به بخش دیگر برنامه اعلام کنید.

متن description (key) یک symbol ثبت‌شده را با `Symbol.keyFor(..)` می‌گیرید:

```js
var s = Symbol.for( "something cool" );

var desc = Symbol.keyFor( s );
console.log( desc );			// "something cool"

// get the symbol from the registry again
var s2 = Symbol.for( desc );

s2 === s;						// true
```

### Symbols as Object Properties

اگر symbol را به‌عنوان property/key object استفاده کنید، به‌شکل ویژه‌ای ذخیره می‌شود تا در enumeration معمول propertyها دیده نشود:

```js
var o = {
	foo: 42,
	[ Symbol( "bar" ) ]: "hello world",
	baz: true
};

Object.getOwnPropertyNames( o );	// [ "foo","baz" ]
```

برای گرفتن propertyهای symbol یک object:

```js
Object.getOwnPropertySymbols( o );	// [ Symbol(bar) ]
```

این نشان می‌دهد property symbol واقعاً مخفی/غیردسترس نیست، چون همیشه می‌توانید آن را در خروجی `Object.getOwnPropertySymbols(..)` ببینید.

#### Built-In Symbols

ES6 چند symbol داخلی از پیش تعریف‌شده دارد که رفتارهای meta مختلف روی valueهای object در JavaScript را نمایان می‌کنند. بااین‌حال برخلاف انتظار، این symbolها در global symbol registry ثبت نمی‌شوند.

به‌جای آن، به‌عنوان property روی function object یعنی `Symbol` قرار دارند. مثلاً در بخش "`for..of`" همین فصل، با `Symbol.iterator` آشنا شدیم:

```js
var a = [1,2,3];

a[Symbol.iterator];			// native function
```

specification با پیشوند `@@` به symbolهای داخلی اشاره می‌کند. رایج‌ترینشان: `@@iterator`، `@@toStringTag`، `@@toPrimitive`. چند مورد دیگر هم تعریف شده‌اند که احتمالاً کمتر استفاده می‌شوند.

**نکته:** در فصل ۷ بخش "Well Known Symbols" جزئیات دقیق‌تری دربارهٔ استفادهٔ metaprogramming این built-in symbolها می‌بینیم.
