## Abstracts

اکنون که شما را به بررسی coercion عمیق‌تر از هر زمان قبل به چالش کشیدم، بیایید ابتدا به بنیان‌های نحوهٔ وقوع coercion طبق مشخصات JS نگاه کنیم.

مشخصات تعدادی *abstract operations*[^AbstractOperations] را شرح می‌دهد که تبدیل داخلی از یک نوع مقدار به نوع دیگر را دیکته می‌کنند. آگاهی از این عملیات مهم است، چون مکانیک‌های اجباری زبان آن‌ها را به روش‌های مختلف ترکیب و جور می‌کنند.

این عملیات *به‌نظر* می‌رسند توابع واقعی قابل فراخوانی هستند، مثل `ToString(..)` یا `ToNumber(..)`. اما با *abstract* منظورمان این است که فقط به‌طور مفهومی با این نام‌ها وجود دارند؛ توابعی نیستند که بتوانیم *مستقیماً* در برنامه‌هایمان فراخوانی کنیم. در عوض، بسته به عبارت‌ها/عبارات در برنامه‌هایمان آن‌ها را به‌طور ضمنی/غیرمستقیم فعال می‌کنیم.

### ToBoolean

تصمیم‌گیری (انشعاب شرطی) همیشه به مقدار بولی `true` یا `false` نیاز دارد. اما بسیار رایج است که بخواهیم این تصمیم‌ها را بر اساس شرایط مقدار غیربولی بگیریم، مثل اینکه آیا رشته خالی است یا چیزی دارد.

وقتی مقادیر غیربولی در زمینه‌ای که به بولی نیاز دارد مواجه می‌شوند — مثل بند شرط عبارت `if` یا حلقهٔ `for` — عملیات abstract `ToBoolean(..)`[^ToBoolean] برای تسهیل coercion فعال می‌شود.

همهٔ مقادیر در JS در یکی از دو سطل هستند: *truthy* یا *falsy*. مقادیر truthy از طریق عملیات `ToBoolean()` به `true` اجبار می‌شوند، در حالی که مقادیر falsy به `false` اجبار می‌شوند:

```
// ToBoolean() is abstract

ToBoolean(undefined);               // false
ToBoolean(null);                    // false
ToBoolean("");                      // false
ToBoolean(0);                       // false
ToBoolean(-0);                      // false
ToBoolean(0n);                      // false
ToBoolean(NaN);                     // false
```

قانون ساده: *هر مقدار دیگر* که در لیست بالا نیست truthy است و از طریق `ToBoolean()` به `true` اجبار می‌شود:

```
ToBoolean("hello");                 // true
ToBoolean(42);                      // true
ToBoolean([ 1, 2, 3 ]);             // true
ToBoolean({ a: 1 });                // true
```

حتی مقادیری مثل `"   "` (رشته با فقط فاصلهٔ خالی)، `[]` (آرایهٔ خالی) و `{}` (شیء خالی)، که به‌طور شهودی ممکن است بیشتر «false» تا «true» به‌نظر برسند، با این حال به `true` اجبار می‌شوند.

| WARNING: |
| :--- |
| استثناهای باریک و حیله‌آمیز این قانون truthy *وجود دارد*. مثلاً، پلتفرم وب ویژگی collection/array دیرپای `document.all` را منسوخ کرده، اگرچه نمی‌توان آن را کاملاً حذف کرد — بیش از حد سایت‌ها را می‌شکست. حتی جایی که `document.all` هنوز تعریف شده، به‌عنوان «falsy object»[^ExoticFalsyObjects] رفتار می‌کند — `undefined` که سپس به `false` اجبار می‌شود؛ این یعنی بررسی‌های شرطی legacy مثل `if (document.all) { .. }` دیگر عبور نمی‌کنند. |

عملیات coercion `ToBoolean()` اساساً جدول جستجو است نه الگوریتم مراحل برای استفاده در coercion غیربولی به بولی. بنابراین، برخی توسعه‌دهندگان ادعا می‌کنند این *واقعاً* coercion نیست مثل عملیات abstract coercion دیگر. فکر می‌کنم بی‌اساس است. `ToBoolean()` از انواع مقدار غیربولی به بولی تبدیل می‌کند، و آن coercion نوع واضح است (حتی اگر جدول جستجوی بسیار ساده به‌جای الگوریتم باشد).

به یاد داشته باشید: این قوانین coercion بولی فقط وقتی اعمال می‌شوند که `ToBoolean()` واقعاً فعال شود. ساختارها/اصطلاحاتی در زبان JS وجود دارند که ممکن است به‌نظر coercion بولی را شامل کنند اما در واقع چنین نمی‌کنند. بیشتر دربارهٔ این‌ها بعداً.

### ToPrimitive

هر مقداری که از قبل primitive نیست را می‌توان با عملیات abstract `ToPrimitive()` (به‌طور خاص، `OrdinaryToPrimitive()`[^OrdinaryToPrimitive]) به primitive کاهش داد. به‌طور کلی، به `ToPrimitive()` *hint* داده می‌شود تا بگوید آیا `number` یا `string` ترجیح داده می‌شود.

```
// ToPrimitive() is abstract

ToPrimitive({ a: 1 },"string");          // "[object Object]"

ToPrimitive({ a: 1 },"number");          // NaN
```

عملیات `ToPrimitive()` روی شیء ارائه‌شده به دنبال متد `toString()` یا `valueOf()` می‌گردد؛ ترتیب جست‌وجوی آن‌ها توسط *hint* کنترل می‌شود. `"string"` یعنی ترتیب `toString()` / `valueOf()` بررسی شود، در حالی که `"number"` (یا بدون *hint*) یعنی ترتیب `valueOf()` / `toString()` بررسی شود.

اگر متد مقداری مطابق نوع *hinted* برگرداند، عملیات تمام می‌شود. اما اگر متد مقداری از نوع *hinted* برنگرداند، `ToPrimitive()` سپس به دنبال متد دیگر می‌گردد و آن را فراخوانی می‌کند (در صورت یافت).

اگر تلاش‌های فراخوانی متد نتوانند مقداری از نوع *hinted* تولید کنند، مقدار برگشتی نهایی به‌زور از طریق عملیات abstract متناظر اجبار می‌شود: `ToString()` یا `ToNumber()`.

### ToString

تقریباً هر مقداری که از قبل رشته نیست را می‌توان از طریق `ToString()` به نمایش رشته اجبار کرد. [^ToString] این معمولاً نسبتاً شهودی است، به‌ویژه با مقادیر اولیه:

```
// ToString() is abstract

ToString(42.0);                 // "42"
ToString(-3);                   // "-3"
ToString(Infinity);             // "Infinity"
ToString(NaN);                  // "NaN"
ToString(42n);                  // "42"

ToString(true);                 // "true"
ToString(false);                // "false"

ToString(null);                 // "null"
ToString(undefined);            // "undefined"
```

نتایج *برخی* ممکن است با شهود رایج متفاوت باشد. همان‌طور که در فصل ۲ ذکر شد، اعداد بسیار بزرگ یا بسیار کوچک با نماد علمی نمایش داده می‌شوند:

```
ToString(Number.MAX_VALUE);     // "1.7976931348623157e+308"
ToString(Math.EPSILON);         // "2.220446049250313e-16"
```

نتیجهٔ ضدشهودی دیگر از `-0` می‌آید:

```
ToString(-0);                   // "0" -- wtf?
```

این باگ نیست، فقط رفتار عمدی از روزهای اولیهٔ JS است، بر اساس فرض اینکه توسعه‌دهندگان عموماً نمی‌خواهند خروجی صفر منفی ببینند.

یک نوع مقدار اولیه که *اجازهٔ* coercion (حداقل ضمنی) به رشته ندارد `symbol` است:

```
ToString(Symbol("ok"));         // TypeError exception thrown
```

| WARNING: |
| :--- |
| فراخوانی تابع concrete `String()`[^StringFunction] (بدون عملگر `new`) عموماً *فقط* فراخوانی عملیات abstract `ToString()` تلقی می‌شود. اگرچه بیشتر درست است، کاملاً نیست. `String(Symbol("ok"))` کار می‌کند، در حالی که خود abstract `ToString(Symbol(..))` استثنا پرتاب می‌کند. بیشتر دربارهٔ `String(..)` بعداً در این فصل. |

#### `toString()` پیش‌فرض

وقتی `ToString()` با نوع مقدار شیء فعال می‌شود، به عملیات `ToPrimitive()` تفویض می‌کند (همان‌طور که قبلاً توضیح داده شد)، با `"string"` به‌عنوان نوع *hinted*:

```
ToString(new String("abc"));        // "abc"
ToString(new Number(42));           // "42"

ToString({ a: 1 });                 // "[object Object]"
ToString([ 1, 2, 3 ]);              // "1,2,3"
```

به‌خاطر تفویض `ToPrimitive(..,"string")`، همهٔ این اشیاء متد پیش‌فرض `toString()` خود را (ارث‌برده از طریق `[[Prototype]]`) فراخوانی می‌کنند.

### ToNumber

مقادیر غیرعددی *که شبیه* اعداد هستند، مثل رشته‌های عددی، عموماً می‌توانند با `ToNumber()` به نمایش عددی اجبار شوند: [^ToNumber]

```
// ToNumber() is abstract

ToNumber("42");                     // 42
ToNumber("-3");                     // -3
ToNumber("1.2300");                 // 1.23
ToNumber("   8.0    ");             // 8
```

اگر کل مقدار *کاملاً* (به‌جز فاصلهٔ خالی) شبیه عدد معتبر نباشد، نتیجه `NaN` خواهد بود:

```
ToNumber("123px");                  // NaN
ToNumber("hello");                  // NaN
```

مقادیر اولیهٔ دیگر معادل‌های عددی مشخصی دارند:

```
ToNumber(true);                     // 1
ToNumber(false);                    // 0

ToNumber(null);                     // 0
ToNumber(undefined);                // NaN
```

برخی تعیین‌های نسبتاً غافل‌گیرکننده برای `ToNumber()` وجود دارد:

```
ToNumber("");                       // 0
ToNumber("       ");                // 0
```

| NOTE: |
| :--- |
| این‌ها را «غافل‌گیرکننده» می‌گویم چون فکر می‌کنم منطقی‌تر بود به `NaN` اجبار شوند، مثل `undefined`. |

برخی مقادیر اولیه *اجازهٔ* coercion به عدد ندارند و به‌جای `NaN` استثنا نتیجه می‌دهند:

```
ToNumber(42n);                      // TypeError exception thrown
ToNumber(Symbol("42"));             // TypeError exception thrown
```

| WARNING: |
| :--- |
| فراخوانی تابع concrete `Number()`[^NumberFunction] (بدون عملگر `new`) عموماً *فقط* فراخوانی عملیات abstract `ToNumber()` برای اجبار مقدار به عدد تلقی می‌شود. اگرچه بیشتر درست است، کاملاً نیست. `Number(42n)` کار می‌کند، در حالی که خود abstract `ToNumber(42n)` استثنا پرتاب می‌کند. |

#### تبدیل‌های عددی Abstract دیگر

علاوه بر `ToNumber()`، مشخصات `ToNumeric()` را تعریف می‌کند که `ToPrimitive()` را روی مقدار فعال می‌کند، سپس در صورت *نبودن* مقدار از نوع `bigint` به `ToNumber()` تفویض می‌کند.

همچنین انواع عملیات abstract مربوط به تبدیل مقادیر به زیرمجموعه‌های بسیار خاص نوع کلی `number` وجود دارد:

* `ToIntegerOrInfinity()`
* `ToInt32()`
* `ToUint32()`
* `ToInt16()`
* `ToUint16()`
* `ToInt8()`
* `ToUint8()`
* `ToUint8Clamp()`

عملیات دیگر مربوط به `bigint`:

* `ToBigInt()`
* `StringToBigInt()`
* `ToBigInt64()`
* `ToBigUint64()`

احتمالاً می‌توانید هدف این عملیات را از نام‌هایشان و/یا مشاورهٔ الگوریتم‌هایشان در مشخصات استنباط کنید. برای اکثر عملیات JS، احتمالاً عملیات سطح‌بالاتر مثل `ToNumber()` فعال می‌شود، نه این‌های خاص.

#### `valueOf()` پیش‌فرض

وقتی `ToNumber()` روی نوع مقدار شیء فعال می‌شود، به‌جای آن به عملیات `ToPrimitive()` تفویض می‌کند (همان‌طور که قبلاً توضیح داده شد)، با `"number"` به‌عنوان نوع *hinted*:

```
ToNumber(new String("abc"));        // NaN
ToNumber(new Number(42));           // 42

ToNumber({ a: 1 });                 // NaN
ToNumber([ 1, 2, 3 ]);              // NaN
ToNumber([]);                       // 0
```

به‌خاطر تفویض `ToPrimitive(..,"number")`، همهٔ این اشیاء متد پیش‌فرض `valueOf()` خود را (ارث‌برده از طریق `[[Prototype]]`) فراخوانی می‌کنند.

### مقایسهٔ برابری

وقتی JS باید تعیین کند آیا دو مقدار *همان مقدار* هستند، عملیات `SameValue()`[^SameValue] را فعال می‌کند که به انواع عملیات فرعی مرتبط تفویض می‌کند.

این عملیات بسیار باریک و strict است و هیچ coercion یا استثنای خاص دیگری انجام نمی‌دهد. اگر دو مقدار *دقیقاً* یکی باشند، نتیجه `true` است، در غیر این صورت `false`:

```
// SameValue() is abstract

SameValue("hello","\x68ello");          // true
SameValue("\u{1F4F1}","\uD83D\uDCF1");  // true
SameValue(42,42);                       // true
SameValue(NaN,NaN);                     // true

SameValue("\u00e9","\u0065\u0301");     // false
SameValue(0,-0);                        // false
SameValue([1,2,3],[1,2,3]);             // false
```

تنوعی از این عملیات `SameValueZero()` و عملیات فرعی مرتبطش است. تفاوت اصلی این است که این عملیات `0` و `-0` را غیرقابل تشخیص رفتار می‌کنند.

```
// SameValueZero() is abstract

SameValueZero(0,-0);                    // true
```

اگر مقادیر عددی (`number` یا `bigint`) باشند، هر دو `SameValue()` و `SameValueZero()` به عملیات فرعی با همان نام‌ها تفویض می‌کنند، تخصص‌یافته برای هر نوع `number` و `bigint` به‌ترتیب.

در غیر این صورت، `SameValueNonNumeric()` عملیات فرعی است که اگر مقادیر در حال مقایسه هر دو غیرعددی باشند به آن تفویض می‌شود:

```
// SameValueNonNumeric() is abstract

SameValueNonNumeric("hello","hello");   // true

SameValueNonNumeric([1,2,3],[1,2,3]);   // false
```

#### برابری سطح‌بالاتر Abstract

متفاوت از `SameValue()` و تنوع‌هایش، مشخصات دو عملیات abstract مقایسهٔ برابری سطح‌بالاتر مهم هم تعریف می‌کند:

* `IsStrictlyEqual()`[^StrictEquality]
* `IsLooselyEqual()`[^LooseEquality]

عملیات `IsStrictlyEqual()` بلافاصله `false` برمی‌گرداند اگر نوع‌های مقدار در حال مقایسه متفاوت باشند.

اگر نوع‌های مقدار یکسان باشند، `IsStrictlyEqual()` به عملیات فرعی برای مقایسهٔ مقادیر `number` یا `bigint` تفویض می‌کند. [^NumericAbstractOps] ممکن است منطقاً انتظار داشته باشید این عملیات فرعی تفویض‌شده عملیات `SameValue()` / `SameValueZero()` تخصص‌یافتهٔ عددی مذکور باشند. با این حال، `IsStrictlyEqual()` به‌جای آن به `Number:equal()`[^NumberEqual] یا `BigInt:equal()`[^BigIntEqual] تفویض می‌کند.

تفاوت بین `Number:SameValue()` و `Number:equal()` این است که دومی موارد خاص مقایسهٔ `0` در مقابل `-0` را تعریف می‌کند:

```
// all of these are abstract operations

Number:SameValue(0,-0);             // false
Number:SameValueZero(0,-0);         // true
Number:equal(0,-0);                 // true
```

این عملیات در مقایسهٔ `NaN` در مقابل `NaN` هم متفاوت هستند:

```
Number:SameValue(NaN,NaN);          // true
Number:equal(NaN,NaN);              // false
```

| WARNING: |
| :--- |
| پس به عبارت دیگر، علیرغم نامش، `IsStrictlyEqual()` کاملاً به اندازهٔ `SameValue()` «strict» نیست، چون وقتی مقایسه‌های `-0` یا `NaN` درگیر هستند *دروغ* می‌گوید. |

عملیات `IsLooselyEqual()` هم نوع‌های مقدار در حال مقایسه را بررسی می‌کند؛ اگر یکسان باشند، بلافاصله به `IsStrictlyEqual()` تفویض می‌کند.

اما اگر نوع‌های مقدار در حال مقایسه متفاوت باشند، `IsLooselyEqual()` مراحل مختلف *coercive equality* انجام می‌دهد. مهم است توجه کنید این الگوریتم همیشه سعی می‌کند مقایسه را به جایی کاهش دهد که هر دو نوع مقدار یکسان باشند (و تمایل به ترجیح `number` / `bigint` دارد).

مراحل بخش *coercive equality* الگوریتم را می‌توان تقریباً چنین خلاصه کرد:

۱. اگر یکی از مقادیر `null` و دیگری `undefined` باشد، `IsLooselyEqual()` مقدار `true` برمی‌گرداند. به عبارت دیگر، این الگوریتم برابری *nullish* اعمال می‌کند، یعنی `null` و `undefined` برابر اجباری یکدیگرند (و با هیچ مقدار دیگری نه).

۲. اگر یکی از مقادیر `number` و دیگری `string` باشد، مقدار `string` از طریق `ToNumber()` به `number` اجبار می‌شود.

۳. اگر یکی از مقادیر `bigint` و دیگری `string` باشد، مقدار `string` از طریق `StringToBigInt()` به `bigint` اجبار می‌شود.

۴. اگر یکی از مقادیر `boolean` باشد، به `number` اجبار می‌شود.

۵. اگر یکی از مقادیر غیراولیه (شیء و غیره) باشد، با `ToPrimitive()` به primitive اجبار می‌شود؛ اگرچه *hint* صریح ارائه نمی‌شود، رفتار پیش‌فرض طوری خواهد بود انگار `"number"` hint بود.

هر بار که coercion در مراحل بالا انجام می‌شود، الگوریتم *بازگشتی* با مقدار(های) جدید دوباره فعال می‌شود. آن فرایند تا وقتی نوع‌ها یکسان شوند ادامه می‌یابد، و سپس مقایسه به عملیات `IsStrictlyEqual()` تفویض می‌شود.

چه نتیجه‌ای از این الگوریتم می‌گیریم؟ اول، می‌بینیم تمایل به مقایسهٔ `number` (یا `bigint`) وجود دارد؛ هرگز مقادیر را به نوع مقدار `string` یا `boolean` اجبار نمی‌کند.

مهم‌تر، می‌بینیم هر دو `IsLooselyEqual()` و `IsStrictlyEqual()` به نوع حساس هستند. `IsStrictlyEqual()` بلافاصله اگر نوع‌ها مطابقت نکنند کنار می‌کشد، در حالی که `IsLooselyEqual()` کار اضافی برای اجبار نوع‌های مقدار نامطابق به یکسان شدن انجام می‌دهد (دوباره، ایده‌آل، `number` یا `bigint`).

علاوه بر این، اگر/وقتی نوع‌ها یکسان باشند، هر دو عملیات یکسان هستند — `IsLooselyEqual()` به `IsStrictlyEqual()` تفویض می‌کند.

### مقایسهٔ رابطه‌ای

وقتی مقادیر به‌صورت رابطه‌ای مقایسه می‌شوند — یعنی آیا یک مقدار «کمتر از» دیگری است؟ — یک عملیات abstract خاص فعال می‌شود: `IsLessThan()`. [^LessThan]

```
// IsLessThan() is abstract

IsLessThan(1,2, /*LeftFirst=*/ true );            // true
```

عملیات `IsGreaterThan()` وجود ندارد؛ در عوض، دو آرگومان اول `IsLessThan()` را می‌توان معکوس کرد تا مقایسهٔ «بیشتر از» انجام شود. برای حفظ معناشناسی ارزیابی چپ‌به‌راست (در مورد اثرات جانبی ظریف)، `IsLessThan()` آرگومان سوم (`LeftFirst`) هم می‌گیرد؛ اگر `false` باشد، یعنی مقایسه معکوس شده و پارامتر دوم باید قبل از اولی ارزیابی شود.

```
IsLessThan(1,2, /*LeftFirst=*/ true );            // true

// equivalent of a fictional "IsGreaterThan()"
IsLessThan(2,1, /*LeftFirst=*/ false );          // false
```

مشابه `IsLooselyEqual()`، عملیات `IsLessThan()` *اجباری* است، یعنی ابتدا مطمئن می‌شود نوع‌های مقدار دو مقدارش مطابقت کنند و مقایسهٔ عددی را ترجیح می‌دهد. `IsStrictLessThan()` برای مقایسهٔ رابطه‌ای غیراجباری وجود ندارد.

به‌عنوان مثال مقایسهٔ رابطه‌ای اجباری، اگر نوع یک مقدار `string` و نوع دیگری `bigint` باشد، `string` با عملیات مذکور `StringToBigInt()` به `bigint` اجبار می‌شود. وقتی نوع‌ها یکسان شدند، `IsLessThan()` طبق بخش‌های بعدی ادامه می‌دهد.

#### مقایسهٔ رشته

وقتی هر دو مقدار از نوع `string` باشند، `IsLessThan()` بررسی می‌کند آیا مقدار چپ prefix (اولین *n* کاراکتر[^StringPrefix]) مقدار راست است؛ اگر باشد، `true` برمی‌گرداند.

اگر هیچ رشته‌ای prefix دیگری نباشد، اولین موقعیت کاراکتر (جهت شروع-به-پایان، نه چپ-به-راست) که بین دو رشته متفاوت است، برای مقادیر code-unit (عددی) مربوطه مقایسه می‌شود؛ نتیجه سپس برگردانده می‌شود.

به‌طور کلی، code-unitها ترتیب واژه‌نامه‌ای (یعنی فرهنگ‌لغتی) شهودی را دنبال می‌کنند:

```
IsLessThan("a","b", /*LeftFirst=*/ true );        // true
```

حتی ارقام به‌عنوان کاراکتر (نه عدد) رفتار می‌شوند:

```
IsLessThan("101","12", /*LeftFirst=*/ true );     // true
```

حتی کمی *طنز* در ترتیب code-unit یونیکد جاسازی شده:

```
IsLessThan("🐔","🥚", /*LeftFirst=*/ true );      // true
```

حداقل الان به سؤال دیرینهٔ *کدام اول می‌آید* پاسخ دادیم?!

#### مقایسهٔ عددی

برای مقایسه‌های عددی، `IsLessThan()` به عملیات `Number:lessThan()` یا `BigInt:lessThan()`[^NumericAbstractOps] به‌ترتیب تفویض می‌کند:

```
IsLessThan(41,42, /*LeftFirst=*/ true );         // true

IsLessThan(-0,0, /*LeftFirst=*/ true );          // false

IsLessThan(NaN,1 /*LeftFirst=*/ true );          // false

IsLessThan(41n,42n, /*LeftFirst=*/ true );       // true
```
