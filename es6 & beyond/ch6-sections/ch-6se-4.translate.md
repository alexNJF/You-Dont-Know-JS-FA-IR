# `Number`

برای این‌که برنامه‌تان درست کار کند، باید بتواند با دقت با عددها کار کند. ES6 چند ویژگی و تابع اضافه برای کمک به عملیات عددی رایج ارائه می‌دهد.

دو مورد اضافه‌شده به `Number` در واقع فقط reference به توابع سراسریِ قبلی هستند: `Number.parseInt(..)` و `Number.parseFloat(..)`.

### ویژگی‌های ایستا

ES6 چند ثابت عددی مفید را به‌صورت ویژگی ایستا اضافه می‌کند:

* `Number.EPSILON` - کمترین فاصله بین دو عدد: `2^-52` (برای استفاده‌ی این مقدار به‌عنوان tolerance در عدم‌دقت حساب شناور، فصل ۲ کتاب *Types & Grammar* این مجموعه را ببینید)
* `Number.MAX_SAFE_INTEGER` - بیشترین عدد صحیحی که در JS می‌تواند به‌شکل «ایمن» و بدون ابهام نمایش داده شود: `2^53 - 1`
* `Number.MIN_SAFE_INTEGER` - کمترین عدد صحیحی که در JS می‌تواند به‌شکل «ایمن» و بدون ابهام نمایش داده شود: `-(2^53 - 1)` یا `(-2)^53 + 1`.

**نکته:** برای جزئیات بیشتر درباره‌ی عدد صحیح «ایمن»، فصل ۲ کتاب *Types & Grammar* همین مجموعه را ببینید.

### تابع ایستای `Number.isNaN(..)`

utility سراسری `isNaN(..)` از ابتدا مشکل‌دار بوده، چون برای چیزهایی که اصلاً عدد نیستند هم `true` برمی‌گرداند، نه فقط برای مقدار واقعی `NaN`؛ دلیلش این است که آرگومان را به نوع عدد coercion می‌کند (که می‌تواند به‌اشتباه NaN بسازد). ES6 utility اصلاح‌شده‌ی `Number.isNaN(..)` را اضافه می‌کند که همان‌طور که باید کار می‌کند:

```js
var a = NaN, b = "NaN", c = 42;

isNaN( a );							// true
isNaN( b );							// true -- oops!
isNaN( c );							// false

Number.isNaN( a );					// true
Number.isNaN( b );					// false -- fixed!
Number.isNaN( c );					// false
```

### تابع ایستای `Number.isFinite(..)`

ممکن است با دیدن نام `isFinite(..)` وسوسه شوید فکر کنید یعنی صرفاً «بی‌نهایت نبودن». اما ماجرا دقیقاً این‌قدر ساده نیست. این utility جدید ES6 ظرافت بیشتری دارد:

```js
var a = NaN, b = Infinity, c = 42;

Number.isFinite( a );				// false
Number.isFinite( b );				// false

Number.isFinite( c );				// true
```

تابع سراسری `isFinite(..)` آرگومانش را coercion می‌کند، اما `Number.isFinite(..)` این رفتار coercive را ندارد:

```js
var a = "42";

isFinite( a );						// true
Number.isFinite( a );				// false
```

ممکن است همچنان coercion را ترجیح بدهید که در آن صورت `isFinite(..)` سراسری انتخاب معتبری است. یا جایگزین منطقی‌تر: `Number.isFinite(+x)` که قبل از ارسال، `x` را صریحاً به عدد تبدیل می‌کند (فصل ۴ کتاب *Types & Grammar* همین مجموعه).

### توابع ایستای مرتبط با عدد صحیح

عددهای JavaScript همیشه شناور هستند (IEEE-754). بنابراین تشخیص «صحیح بودن» عدد، تشخیص type نیست، چون JS چنین تمایزی در type ندارد.

در عوض باید بررسی کنید بخش اعشاری غیرصفر وجود دارد یا نه. رایج‌ترین روش ساده این بوده:

```js
x === Math.floor( x );
```

ES6 utility کمکی `Number.isInteger(..)` را اضافه می‌کند که احتمالاً این ویژگی را کمی کارآمدتر تشخیص می‌دهد:

```js
Number.isInteger( 4 );				// true
Number.isInteger( 4.2 );			// false
```

**نکته:** در JavaScript بین `4`، `4.`، `4.0` یا `4.0000` تفاوتی نیست. همه‌ی این‌ها «عدد صحیح» محسوب می‌شوند و در `Number.isInteger(..)` مقدار `true` می‌دهند.

علاوه بر این، `Number.isInteger(..)` بعضی مقدارهای واضحاً ناصحیح را که `x === Math.floor(x)` ممکن است در آن‌ها اشتباه کند هم فیلتر می‌کند:

```js
Number.isInteger( NaN );			// false
Number.isInteger( Infinity );		// false
```

کار با «عددهای صحیح» گاهی اطلاعات مهمی برای ساده‌سازی الگوریتم‌هاست. خودِ کد JS فقط با فیلتر کردن صحیح‌ها سریع‌تر نمی‌شود، اما موتور JS در حالت‌هایی مثل asm.js می‌تواند وقتی فقط صحیح‌ها استفاده می‌شوند تکنیک‌های بهینه‌سازی خاصی اعمال کند.

به خاطر نحوه‌ی برخورد `Number.isInteger(..)` با `NaN` و `Infinity`، تعریف utilityای مثل `isFloat(..)` به سادگی `!Number.isInteger(..)` نیست. باید چیزی شبیه این بنویسید:

```js
function isFloat(x) {
	return Number.isFinite( x ) && !Number.isInteger( x );
}

isFloat( 4.2 );						// true
isFloat( 4 );						// false

isFloat( NaN );						// false
isFloat( Infinity );				// false
```

**نکته:** شاید عجیب به نظر برسد، اما Infinity نه باید integer در نظر گرفته شود و نه float.

ES6 همچنین utilityای به نام `Number.isSafeInteger(..)` تعریف می‌کند که بررسی می‌کند مقدار هم integer باشد و هم داخل بازه‌ی `Number.MIN_SAFE_INTEGER` تا `Number.MAX_SAFE_INTEGER` (شامل دو سر بازه) قرار داشته باشد.

```js
var x = Math.pow( 2, 53 ),
	y = Math.pow( -2, 53 );

Number.isSafeInteger( x - 1 );		// true
Number.isSafeInteger( y + 1 );		// true

Number.isSafeInteger( x );			// false
Number.isSafeInteger( y );			// false
```
