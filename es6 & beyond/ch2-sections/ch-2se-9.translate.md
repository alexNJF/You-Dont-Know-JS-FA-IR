# Regular Expressions

بیایید صادق باشیم: regular expressionها مدت‌ها در JS تغییر زیادی نکرده بودند. پس عالی است که بالاخره در ES6 چند ترفند جدید یاد گرفته‌اند. اینجا خیلی خلاصه افزوده‌ها را پوشش می‌دهیم، اما خود موضوع regular expression آن‌قدر گسترده است که برای مرور کامل باید سراغ فصل‌ها/کتاب‌های تخصصی این حوزه بروید.

### Unicode Flag

موضوع Unicode را بعدتر در همین فصل مفصل‌تر بررسی می‌کنیم. اینجا فقط خیلی کوتاه به flag جدید `u` در regular expressionهای ES6+ می‌پردازیم که matching مبتنی بر Unicode را برای آن expression فعال می‌کند.

رشته‌های JavaScript معمولاً به‌صورت دنباله‌ای از کاراکترهای 16-بیتی تفسیر می‌شوند که با کاراکترهای *Basic Multilingual Plane (BMP)* (http://en.wikipedia.org/wiki/Plane_%28Unicode%29) متناظرند. اما کاراکترهای UTF-16 زیادی خارج از این بازه هم وجود دارند و رشته‌ها می‌توانند این کاراکترهای چندبایتی را داشته باشند.

قبل از ES6، regular expressionها فقط بر مبنای کاراکترهای BMP match می‌کردند؛ یعنی کاراکترهای توسعه‌یافته برای matching به‌عنوان دو کاراکتر جدا دیده می‌شدند. این معمولاً مطلوب نیست.

بنابراین از ES6 به بعد، flag `u` به regular expression می‌گوید رشته را با تفسیر کاراکترهای Unicode (UTF-16) پردازش کند، تا چنین کاراکتر توسعه‌یافته‌ای به‌عنوان یک واحد یکتا match شود.

**هشدار:** برخلاف ظاهر نام، «UTF-16» الزاماً به معنای دقیق 16 بیت نیست. Unicode مدرن از 21 بیت استفاده می‌کند و استانداردهایی مثل UTF-8 و UTF-16 بیشتر به شیوهٔ بازنمایی کاراکتر اشاره دارند.

یک مثال (مستقیم از specification ES6): 𝄞 (نماد موسیقایی G-clef) کدپوینت Unicode برابر U+1D11E (0x1D11E) دارد.

اگر این کاراکتر در pattern یک regular expression ظاهر شود (مثل `/𝄞/`)، تفسیر استاندارد BMP آن را دو کاراکتر جدا (`0xD834` و `0xDD1E`) فرض می‌کند. اما در حالت Unicode-aware جدید ES6، `/𝄞/u` (یا فرم escaped یعنی `/\u{1D11E}/u`) در رشته، `"𝄞"` را به‌صورت یک کاراکتر واحد match می‌کند.

شاید بپرسید چرا این مهم است؟ در حالت BMP غیر Unicode، pattern به‌صورت دو کاراکتر جدا تفسیر می‌شود، ولی باز هم در رشته‌ای که `"𝄞"` دارد match را پیدا می‌کند:

```js
/𝄞/.test( "𝄞-clef" );			// true
```

چیزی که مهم می‌شود طول match است. مثال:

```js
/^.-clef/ .test( "𝄞-clef" );		// false
/^.-clef/u.test( "𝄞-clef" );		// true
```

الگوی `^.-clef` می‌گوید ابتدای رشته فقط یک کاراکتر قبل از متن `"-clef"` match شود. در حالت BMP استاندارد شکست می‌خورد (دو کاراکتر)، ولی با `u` موفق می‌شود (یک کاراکتر).

همچنین مهم است که `u` باعث می‌شود quantifierهایی مثل `+` و `*` روی کل Unicode code point به‌عنوان یک کاراکتر اعمال شوند، نه فقط روی *lower surrogate* (نیمهٔ راست نماد) آن. همین موضوع برای کاراکترهای Unicode در character classها مثل `/[💩-💫]/u` هم برقرار است.

**نکته:** دربارهٔ رفتار `u` در regular expressionها جزئیات فنی خیلی بیشتری وجود دارد که Mathias Bynens (https://twitter.com/mathias) به‌صورت مفصل درباره‌شان نوشته است (https://mathiasbynens.be/notes/es6-unicode-regex).

### Sticky Flag

flag دیگری که در ES6 به regular expressionها اضافه شده `y` است که معمولاً «sticky mode» نامیده می‌شود. sticky یعنی regular expression یک anchor مجازی در ابتدای خود دارد که آن را مجبور می‌کند فقط دقیقاً در موقعیتی که `lastIndex` مشخص می‌کند match کند.

برای نمایش تفاوت، دو regular expression را در نظر بگیرید؛ اولی بدون sticky و دومی با sticky:

```js
var re1 = /foo/,
	str = "++foo++";

re1.lastIndex;			// 0
re1.test( str );		// true
re1.lastIndex;			// 0 -- not updated

re1.lastIndex = 4;
re1.test( str );		// true -- ignored `lastIndex`
re1.lastIndex;			// 4 -- not updated
```

سه نکته:

* `test(..)` اصلاً به مقدار `lastIndex` توجه نمی‌کند و همیشه matching را از ابتدای رشته شروع می‌کند.
* چون pattern ما anchor `^` ندارد، جست‌وجوی `"foo"` آزاد است که در کل رشته جلو برود.
* `lastIndex` توسط `test(..)` به‌روزرسانی نمی‌شود.

حالا حالت sticky:

```js
var re2 = /foo/y,		// <-- notice the `y` sticky flag
	str = "++foo++";

re2.lastIndex;			// 0
re2.test( str );		// false -- "foo" not found at `0`
re2.lastIndex;			// 0

re2.lastIndex = 2;
re2.test( str );		// true
re2.lastIndex;			// 5 -- updated to after previous match

re2.test( str );		// false
re2.lastIndex;			// 0 -- reset after previous match failure
```

مشاهدات جدید:

* `test(..)` از `lastIndex` به‌عنوان تنها موقعیت مجاز برای match استفاده می‌کند؛ جلو رفتنی در کار نیست.
* اگر match موفق شود، `lastIndex` روی کاراکتر بلافاصله بعد از match می‌رود. اگر match شکست بخورد، `lastIndex` به `0` برمی‌گردد.

patternهای غیر-sticky (که `^` هم ندارند) می‌توانند برای پیدا کردن match جلو بروند؛ ولی sticky mode آن را دقیقاً به موقعیت `lastIndex` محدود می‌کند.

همان‌طور که گفتیم، راه دیگر نگاه به `y` این است که گویی ابتدای pattern یک anchor نسبی دارد که به `lastIndex` وابسته است.

**هشدار:** در منابع قدیمی گاهی گفته شده رفتار `y` مثل افزودن `^` به pattern است. این توصیف دقیق نیست. در بخش «Anchored Sticky» دقیق‌تر توضیح می‌دهیم.

#### Sticky Positioning

ممکن است محدودکننده به نظر برسد که برای matchهای تکراری با `y` باید دستی مطمئن شوید `lastIndex` دقیقاً درست تنظیم شده، چون خودش جلو نمی‌رود.

یک سناریوی ممکن: اگر بدانید match موردنظر همیشه در موقعیت‌های مضرب یک عدد رخ می‌دهد (`0`, `10`, `20`, ...)، می‌توانید pattern محدود بسازید و هر بار قبل از match، `lastIndex` را دستی روی همان موقعیت‌ها بگذارید:

```js
var re = /f../y,
	str = "foo       far       fad";

str.match( re );		// ["foo"]

re.lastIndex = 10;
str.match( re );		// ["far"]

re.lastIndex = 20;
str.match( re );		// ["fad"]
```

اما اگر رشته ساختار موقعیت ثابت نداشته باشد، تعیین دستی `lastIndex` قبل از هر match معمولاً دشوار و ناکارآمد می‌شود.

یک نکتهٔ نجات‌بخش: `y` نیاز دارد `lastIndex` دقیق باشد، ولی الزاماً قرار نیست *شما* آن را دستی تنظیم کنید.

می‌توانید expressionها را طوری بسازید که در هر match اصلی، همهٔ قسمت‌های قبل و بعد از چیزی که می‌خواهید (تا پیش از مورد بعدی) گرفته شود. چون `lastIndex` بعد از پایان match روی کاراکتر بعدی می‌ایستد، اگر تا آن نقطه را match کرده باشید، دفعات بعد هم `lastIndex` در جای درست خواهد بود.

**هشدار:** اگر نتوانید ساختار رشتهٔ ورودی را به‌اندازهٔ کافی پیش‌بینی کنید، این تکنیک مناسب نیست و شاید نتوانید از `y` استفاده کنید.

رشته‌های ساختاریافته احتمالاً عملی‌ترین سناریو برای match تکراری با `y` هستند:

```js
var re = /\d+\.\s(.*?)(?:\s|$)/y
	str = "1. foo 2. bar 3. baz";

str.match( re );		// [ "1. foo ", "foo" ]

re.lastIndex;			// 7 -- correct position!
str.match( re );		// [ "2. bar ", "bar" ]

re.lastIndex;			// 14 -- correct position!
str.match( re );		// ["3. baz", "baz"]
```

این کار می‌کند چون از قبل دربارهٔ ساختار ورودی می‌دانیم: همیشه یک پیشوند عددی مثل `"1. "` قبل از match موردنظر (`"foo"` و ...) هست و بعدش یا فاصله می‌آید یا انتهای رشته (`$`). بنابراین regular expression این ساختار را در هر match اصلی می‌گیرد و با گروه `( )` بخش مهم را جدا می‌کند.

بعد از اولین match (`"1. foo "`)، `lastIndex` برابر `7` است که دقیقاً موقعیت لازم برای match بعدی (`"2. bar "`) است و همین‌طور ادامه می‌یابد.

اگر قصد استفاده از sticky mode `y` برای matchهای تکراری دارید، به‌دنبال فرصت‌هایی باشید که `lastIndex` خودکار در موقعیت درست قرار گیرد.

#### Sticky Versus Global

برخی می‌دانند که می‌شود چیزی شبیه matching نسبی نسبت به `lastIndex` را با flag سراسری `g` و متد `exec(..)` شبیه‌سازی کرد:

```js
var re = /o+./g,		// <-- look, `g`!
	str = "foot book more";

re.exec( str );			// ["oot"]
re.lastIndex;			// 4

re.exec( str );			// ["ook"]
re.lastIndex;			// 9

re.exec( str );			// ["or"]
re.lastIndex;			// 13

re.exec( str );			// null -- no more matches!
re.lastIndex;			// 0 -- starts over now!
```

درست است که matchهای `g` با `exec(..)` از `lastIndex` شروع می‌شوند و بعد از هر موفقیت/شکست هم آن را به‌روزرسانی می‌کنند، اما این رفتار با `y` یکی نیست.

در snippet بالا `"ook"` که در موقعیت `6` است، در دومین `exec(..)` پیدا شد در حالی‌که آن لحظه `lastIndex` برابر `4` بود. چرا؟ چون match غیر-sticky اجازه دارد جلو برود. expression sticky اینجا باید شکست می‌خورد چون اجازهٔ جلو رفتن ندارد.

علاوه بر جلو رفتن ناخواسته، یک ایراد دیگر استفاده از `g` به‌جای `y` این است که `g` رفتار بعضی متدها مثل `str.match(re)` را تغییر می‌دهد.

```js
var re = /o+./g,		// <-- look, `g`!
	str = "foot book more";

str.match( re );		// ["oot","ook","or"]
```

می‌بینید که همهٔ matchها یک‌جا برگشت داده شدند. گاهی خوب است، گاهی دقیقاً چیزی نیست که می‌خواهید.

flag sticky یعنی `y` به شما matching تدریجی one-by-one می‌دهد (با متدهایی مثل `test(..)` و `match(..)`)، فقط باید دقت کنید `lastIndex` هر بار در جای درست باشد.

#### Anchored Sticky

همان‌طور که پیش‌تر هشدار دادیم، اینکه sticky mode را معادل افزودن `^` بدانیم دقیق نیست. anchor `^` معنی مستقل خودش را در regular expression دارد و sticky mode آن را تغییر نمی‌دهد. `^` همیشه به ابتدای ورودی اشاره دارد و به هیچ وجه نسبت به `lastIndex` نسبی نیست.

به‌خاطر مستندات نادقیق قدیمی، این سوءبرداشت تقویت شده است؛ مخصوصاً چون نسخهٔ آزمایشی قدیمی sticky mode در Firefox (پیش از ES6) `^` را نسبت به `lastIndex` تفسیر می‌کرد.

ES6 این رفتار را نپذیرفت. `^` در pattern فقط و فقط به ابتدای ورودی اشاره دارد.

در نتیجه patternی مثل `/^foo/y` فقط در ابتدای رشته می‌تواند `"foo"` را match کند، *اگر* اجازهٔ match در آن موقعیت داشته باشد. اگر `lastIndex` برابر `0` نباشد، match شکست می‌خورد:

```js
var re = /^foo/y,
	str = "foo";

re.test( str );			// true
re.test( str );			// false
re.lastIndex;			// 0 -- reset after failure

re.lastIndex = 1;
re.test( str );			// false -- failed for positioning
re.lastIndex;			// 0 -- reset after failure
```

نتیجهٔ نهایی: ترکیب `y` + `^` + `lastIndex > 0` ناسازگار است و همیشه match را شکست می‌دهد.

**نکته:** هرچند `y` معنای `^` را تغییر نمی‌دهد، ولی mode چندخطی `m` این کار را می‌کند: در `m`، `^` یعنی ابتدای ورودی *یا* ابتدای متن بعد از newline. بنابراین اگر `y` و `m` را با هم استفاده کنید، می‌توانید چند match مبتنی بر `^` در یک رشته پیدا کنید. اما یادتان باشد چون `y` sticky است، باید هر بار `lastIndex` دقیقاً روی موقعیت خط جدید درست باشد (احتمالاً با match کردن تا انتهای خط)، وگرنه matchهای بعدی رخ نمی‌دهند.

### Regular Expression `flags`

قبل از ES6، اگر می‌خواستید بفهمید یک شیء regular expression چه flagهایی دارد، باید آن‌ها را از `source` استخراج می‌کردید -- که طعنه‌آمیز، معمولاً با یک regular expression دیگر:

```js
var re = /foo/ig;

re.toString();			// "/foo/ig"

var flags = re.toString().match( /\/([gim]*)$/ )[1];

flags;					// "ig"
```

از ES6 به بعد می‌توانید مستقیم از property جدید `flags` بخوانید:

```js
var re = /foo/ig;

re.flags;				// "gi"
```

جزئیات کوچک اما مهم: specification ES6 می‌گوید ترتیب flagها همیشه به شکل `"gimuy"` گزارش شود، فارغ از ترتیبی که pattern اولیه نوشته شده بود. به همین دلیل `/ig` خروجی `"gi"` می‌دهد.

خیر، ترتیب flagها از نظر رفتاری مهم نیست.

یک تغییر دیگر در ES6: constructor `RegExp(..)` حالا اگر یک regular expression موجود به آن بدهید، نسبت به `flags` آگاه است:

```js
var re1 = /foo*/y;
re1.source;							// "foo*"
re1.flags;							// "y"

var re2 = new RegExp( re1 );
re2.source;							// "foo*"
re2.flags;							// "y"

var re3 = new RegExp( re1, "ig" );
re3.source;							// "foo*"
re3.flags;							// "gi"
```

قبل از ES6، ساخت `re3` خطا می‌داد؛ اما از ES6 به بعد هنگام تکثیر expression می‌توانید flagها را override کنید.
