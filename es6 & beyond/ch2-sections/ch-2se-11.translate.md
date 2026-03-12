# Unicode

ابتدا روشن کنم: این بخش قرار نیست یک مرجع «همه‌چیز دربارهٔ Unicode» باشد. هدفم پوشش تغییراتی است که در ES6 برای Unicode اتفاق افتاده، نه رفتن به همهٔ عمق موضوع. Mathias Bynens (http://twitter.com/mathias) دربارهٔ JS و Unicode بسیار مفصل و عالی نوشته/صحبت کرده (https://mathiasbynens.be/notes/javascript-unicode و http://fluentconf.com/javascript-html-2015/public/content/2015/02/18-javascript-loves-unicode).

کاراکترهای Unicode در بازهٔ `0x0000` تا `0xFFFF` شامل بیشتر کاراکترهای چاپی استاندارد (در زبان‌های مختلف) هستند که معمولاً می‌بینید. این گروه *Basic Multilingual Plane (BMP)* نام دارد. حتی نمادهای جالبی مثل آدم‌برفی ☃ (U+2603) هم داخل BMP هستند.

کاراکترهای Unicode توسعه‌یافتهٔ زیادی خارج از BMP هم داریم که تا `0x10FFFF` می‌روند. این‌ها معمولاً *astral symbols* نامیده می‌شوند؛ چون به مجموعهٔ 16 *plane* (لایه/گروه) بیرون از BMP تعلق دارند. نمونه: 𝄞 (U+1D11E) و 💩 (U+1F4A9).

قبل از ES6، رشته‌های JavaScript می‌توانستند با Unicode escaping کاراکتر Unicode را نمایش دهند:

```js
var snowman = "\u2603";
console.log( snowman );			// "☃"
```

اما escape از نوع `\uXXXX` فقط چهار رقم hexadecimal را پشتیبانی می‌کند؛ یعنی فقط کاراکترهای BMP را می‌توانید این‌گونه نمایش دهید. برای نمایش کاراکتر astral پیش از ES6 باید از *surrogate pair* استفاده می‌کردید -- یعنی دو کاراکتر escaped ویژه کنار هم که JS آن‌ها را یک کاراکتر astral در نظر می‌گیرد:

```js
var gclef = "\uD834\uDD1E";
console.log( gclef );			// "𝄞"
```

از ES6 به بعد، فرم جدیدی از Unicode escaping (در string و regular expression) داریم به نام *code point escaping*:

```js
var gclef = "\u{1D11E}";
console.log( gclef );			// "𝄞"
```

تفاوت را می‌بینید: وجود `{ }` در escape sequence باعث می‌شود هر تعداد رقم hexadecimal داخل آن بیاید. چون برای بالاترین code point ممکن Unicode (یعنی `0x10FFFF`) نهایتاً شش رقم کافی است، این فرم نیاز را کامل پوشش می‌دهد.

### Unicode-Aware String Operations

به‌طور پیش‌فرض، عملیات و متدهای رشته در JavaScript نسبت به astral symbolها حساس نیستند. بنابراین هر کاراکتر BMP را جداگانه می‌بینند، حتی آن دو نیمهٔ surrogate که با هم یک کاراکتر astral می‌سازند:

```js
var snowman = "☃";
snowman.length;					// 1

var gclef = "𝄞";
gclef.length;					// 2
```

پس طول واقعی چنین رشته‌ای را چطور حساب کنیم؟ در این سناریو این ترفند جواب می‌دهد:

```js
var gclef = "𝄞";

[...gclef].length;				// 1
Array.from( gclef ).length;		// 1
```

یادتان هست در بخش "`for..of` Loops" گفتیم رشته‌های ES6 iterator داخلی دارند؟ آن iterator Unicode-aware است و astral symbol را یک واحد می‌دهد. با spread operator یعنی `...` در array literal از این ویژگی استفاده می‌کنیم و arrayای از symbolهای رشته می‌سازیم، بعد طول آن را می‌خوانیم. `Array.from(..)` هم تقریباً همین کار `[...XYZ]` را انجام می‌دهد (جزئیات در فصل ۶).

**هشدار:** ساختن و مصرف کامل iterator فقط برای به‌دست آوردن طول رشته، از نظر performance نسبت به یک ابزار/ویژگی native بهینه، پرهزینه است.

متأسفانه ماجرا به این سادگی هم نیست. علاوه بر surrogate pairها (که iterator رشته مدیریت می‌کند)، code pointهای ویژه‌ای داریم که رفتارهای ویژهٔ دیگری دارند و حساب‌کردنشان سخت‌تر است. مثلاً مجموعه‌ای از code pointها کاراکتر قبلی را تغییر می‌دهند که *Combining Diacritical Marks* نام دارند.

این دو خروجی را ببینید:

```js
console.log( s1 );				// "é"
console.log( s2 );				// "é"
```

ظاهرشان یکسان است، اما یکسان نیستند! نحوهٔ ساخت:

```js
var s1 = "\xE9",
	s2 = "e\u0301";
```

همان‌طور که حدس می‌زنید، ترفند قبلی `length` برای `s2` جواب کامل نمی‌دهد:

```js
[...s1].length;					// 1
[...s2].length;					// 2
```

در این حالت چه کنیم؟ می‌توانیم قبل از اندازه‌گیری طول، روی مقدار *Unicode normalization* انجام دهیم با `String#normalize(..)` در ES6 (فصل ۶):

```js
var s1 = "\xE9",
	s2 = "e\u0301";

s1.normalize().length;			// 1
s2.normalize().length;			// 1

s1 === s2;						// false
s1 === s2.normalize();			// true
```

در اصل `normalize(..)` دنباله‌ای مثل `"e\u0301"` را به `"\xE9"` نرمال می‌کند. نرمال‌سازی حتی می‌تواند چند combining mark مجاور را هم ترکیب کند اگر کاراکتر Unicode متناظر وجود داشته باشد:

```js
var s1 = "o\u0302\u0300",
	s2 = s1.normalize(),
	s3 = "ồ";

s1.length;						// 3
s2.length;						// 1
s3.length;						// 1

s2 === s3;						// true
```

با این حال normalization هم همیشه پاسخ کامل نیست. اگر چند combining mark روی یک کاراکتر داشته باشید، ممکن است count طول مطابق انتظار نشود؛ چون لزوماً یک کاراکتر نرمال واحد که ترکیب همهٔ آن markها را پوشش دهد وجود ندارد:

```js
var s1 = "e\u0301\u0330";

console.log( s1 );				// "ḛ́"

s1.normalize().length;			// 2
```

هرچه بیشتر در این موضوع عمیق شوید، بیشتر می‌بینید تعریف دقیق «length» دشوار است. چیزی که بصری یک کاراکتر واحد می‌بینیم -- دقیق‌تر *grapheme* -- لزوماً با «یک کاراکتر» در معنای پردازشی برنامه برابر نیست.

**نکته:** اگر می‌خواهید عمق این موضوع را ببینید، الگوریتم "Grapheme Cluster Boundaries" را ببینید (http://www.Unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries).

### Character Positioning

مشابه پیچیدگی طول، سؤال «کاراکتر موقعیت 2 چیست؟» واقعاً چه معنی می‌دهد؟ پاسخ سادهٔ پیشا-ES6 از `charAt(..)` می‌آمد، که نه اتمیک‌بودن کاراکتر astral را رعایت می‌کند و نه combining markها را در نظر می‌گیرد.

```js
var s1 = "abc\u0301d",
	s2 = "ab\u0107d",
	s3 = "ab\u{1d49e}d";

console.log( s1 );				// "abćd"
console.log( s2 );				// "abćd"
console.log( s3 );				// "ab𝒞d"

s1.charAt( 2 );					// "c"
s2.charAt( 2 );					// "ć"
s3.charAt( 2 );					// "" <-- unprintable surrogate
s3.charAt( 3 );					// "" <-- unprintable surrogate
```

آیا ES6 نسخهٔ Unicode-aware از `charAt(..)` می‌دهد؟ متأسفانه نه. در زمان نگارش این متن، پیشنهادی برای بعد از ES6 مطرح شده است.

اما با چیزهایی که بخش قبل دیدیم (و با همان محدودیت‌ها)، می‌شود یک پاسخ ES6 ساخت:

```js
var s1 = "abc\u0301d",
	s2 = "ab\u0107d",
	s3 = "ab\u{1d49e}d";

[...s1.normalize()][2];			// "ć"
[...s2.normalize()][2];			// "ć"
[...s3.normalize()][2];			// "𝒞"
```

**هشدار:** یادآوری مهم: ساختن و مصرف iterator هر بار برای گرفتن یک کاراکتر، از نظر performance ایده‌آل نیست. امیدواریم در نسخه‌های بعدی ES ابزار built-in و بهینه‌ای بیاید.

پس نسخهٔ Unicode-aware برای `charCodeAt(..)` چی؟ ES6 متد `codePointAt(..)` را می‌دهد:

```js
var s1 = "abc\u0301d",
	s2 = "ab\u0107d",
	s3 = "ab\u{1d49e}d";

s1.normalize().codePointAt( 2 ).toString( 16 );
// "107"

s2.normalize().codePointAt( 2 ).toString( 16 );
// "107"

s3.normalize().codePointAt( 2 ).toString( 16 );
// "1d49e"
```

و جهت معکوس؟ نسخهٔ Unicode-aware از `String.fromCharCode(..)` همان `String.fromCodePoint(..)` در ES6 است:

```js
String.fromCodePoint( 0x107 );		// "ć"

String.fromCodePoint( 0x1d49e );	// "𝒞"
```

پس می‌توانیم `String.fromCodePoint(..)` و `codePointAt(..)` را ترکیب کنیم تا نسخهٔ بهتر `charAt(..)` بسازیم؟ بله:

```js
var s1 = "abc\u0301d",
	s2 = "ab\u0107d",
	s3 = "ab\u{1d49e}d";

String.fromCodePoint( s1.normalize().codePointAt( 2 ) );
// "ć"

String.fromCodePoint( s2.normalize().codePointAt( 2 ) );
// "ć"

String.fromCodePoint( s3.normalize().codePointAt( 2 ) );
// "𝒞"
```

متدهای رشتهٔ زیاد دیگری هم هست که اینجا نپوشاندیم: `toUpperCase()`، `toLowerCase()`، `substring(..)`، `indexOf(..)`، `slice(..)` و ... . هیچ‌کدام برای Unicode-aware کامل تغییر/تقویت نشده‌اند، بنابراین موقع کار با رشته‌های دارای astral symbol بسیار محتاط باشید -- شاید بهتر باشد از بعضی‌شان پرهیز کنید.

چند متد رشته هم رفتارشان به regular expression وابسته است، مثل `replace(..)` و `match(..)`. خوشبختانه ES6 برای regular expressionها Unicode awareness آورده که در بخش «Unicode Flag» گفتیم.

خلاصه اینکه پشتیبانی Unicode رشته در JavaScript نسبت به پیشا-ES6 به‌وضوح بهتر شده (هرچند هنوز کامل نیست).

### Unicode Identifier Names

Unicode را در نام identifierها (متغیر، property و ...) هم می‌توان استفاده کرد. پیش از ES6 با Unicode-escape امکان‌پذیر بود:

```js
var \u03A9 = 42;

// same as: var Ω = 42;
```

از ES6 به بعد می‌توانید از فرم code point escape هم استفاده کنید:

```js
var \u{2B400} = 42;

// same as: var 𫐀 = 42;
```

مجموعه قوانین پیچیده‌ای تعیین می‌کند دقیقاً کدام کاراکترهای Unicode مجازند. بعضی‌ها هم فقط وقتی مجازند که اولین کاراکتر نام identifier نباشند.

**نکته:** Mathias Bynens پست بسیار خوبی دربارهٔ جزئیات دقیق این موضوع دارد (https://mathiasbynens.be/notes/javascript-identifiers-es6).

دلایل استفاده از چنین کاراکترهای خاصی در identifierها معمولاً نادر و آکادمیک است. اغلب بهترین راه، نوشتن کدی نیست که به این قابلیت‌های عجیب متکی باشد.
