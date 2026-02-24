## Fundamental Objects

JS چند نوع شیء *fundamental* تعریف می‌کند که نمونه‌های constructorهای داخلی مختلف هستند، از جمله:

* `new String()`
* `new Number()`
* `new Boolean()`

توجه کنید این constructorها باید با کلمهٔ کلیدی `new` برای ساخت نمونه‌های fundamental objects استفاده شوند. در غیر این صورت، این توابع در واقع type coercion انجام می‌دهند (ببینید فصل ۴).

این constructorهای fundamental object به‌جای primitives نوع مقدار شیء ایجاد می‌کنند:

```js
myName = "Kyle";
typeof myName;                      // "string"

myNickname = new String("getify");
typeof myNickname;                  // "object"
```

به عبارت دیگر، نمونهٔ یک constructor fundamental object در واقع می‌تواند به‌عنوان wrapper دور مقدار اولیهٔ زیربنایی متناظر دیده شود.

| WARNING: |
| :--- |
| تقریباً به‌طور جهانی *bad practice* تلقی می‌شود که هرگز مستقیماً این fundamental objects را نمونه‌سازی کنید. معادل‌های primitive عموماً قابل‌پیش‌بینی‌تر، کارآمدتر هستند و *auto-boxing* ارائه می‌دهند (ببینید بخش «Automatic Objects» در پایین) هر وقت شکل object-wrapper زیربنایی برای دسترسی ویژگی/متد لازم است. |

توابع `Symbol(..)` و `BigInt(..)` در مشخصات «constructors» نامیده می‌شوند، اگرچه با کلمهٔ کلیدی `new` استفاده نمی‌شوند و مقادیری که در برنامهٔ JS تولید می‌کنند واقعاً primitives هستند.

با این حال، *fundamental objects* داخلی برای این دو نوع وجود دارد، برای تفویض prototype و *auto-boxing* استفاده می‌شوند.

در مقابل، برای مقادیر اولیهٔ `null` و `undefined`، «constructors»ٔ `Null()` یا `Undefined()` وجود ندارد، نه fundamental objects یا prototypeهای متناظر.

### Prototypes

نمونه‌های constructorهای fundamental object با شیءهای `prototype` constructorهایشان با `[[Prototype]]` پیوند دارند:

* `String.prototype`: ویژگی `length` و متدهای خاص رشته مثل `toUpperCase()` و غیره را تعریف می‌کند.

* `Number.prototype`: متدهای خاص عدد مثل `toPrecision(..)`، `toFixed(..)` و غیره را تعریف می‌کند.

* `Boolean.prototype`: متدهای پیش‌فرض `toString()` و `valueOf()` را تعریف می‌کند.

* `Symbol.prototype`: `description` (getter) و متدهای پیش‌فرض `toString()` و `valueOf()` را تعریف می‌کند.

* `BigInt.prototype`: متدهای پیش‌فرض `toString()`، `toLocaleString()` و `valueOf()` را تعریف می‌کند.

هر نمونهٔ مستقیم constructorهای داخلی دسترسی تفویض‌شدهٔ `[[Prototype]]` به ویژگی‌ها/متدهای `prototype` مربوطه دارد. علاوه بر این، مقادیر اولیهٔ متناظر هم از طریق *auto-boxing* چنین دسترسی تفویض‌شده‌ای دارند.

### Automatic Objects

چند بار *auto-boxing* را ذکر کردم (از جمله فصل‌های ۱ و ۲، و چند بار تا الان در این فصل). بالاخره وقت توضیح آن مفهوم است.

دسترسی به ویژگی یا متد روی مقدار نیاز دارد که مقدار شیء باشد. همان‌طور که در فصل ۱ دیدیم، primitives *اشیاء نیستند*، پس JS باید چنین primitiveای را موقتاً به معادل fundamental object تبدیل/wrap کند[^AutoBoxing] تا آن دسترسی را انجام دهد.

مثلاً:

```js
myName = "Kyle";

myName.length;              // 4

myName.toUpperCase();       // "KYLE"
```

دسترسی به ویژگی `length` یا متد `toUpperCase()` فقط روی مقدار رشتهٔ اولیه مجاز است چون JS primitiveٔ `string` را در wrapper fundamental object، نمونهٔ `new String(..)`، *auto-box* می‌کند. در غیر این صورت، همهٔ چنین دسترسی‌هایی باید شکست بخورند، چون primitives هیچ ویژگی ندارند.

مهم‌تر، وقتی مقدار اولیه به معادل fundamental object *auto-box* می‌شود، آن اشیاء داخلی ساخته‌شده از طریق پیوند `[[Prototype]]` به prototype شیء fundamental مربوطه دسترسی به ویژگی‌ها/متدهای از پیش تعریف‌شده (مثل `length` و `toUpperCase()`) دارند.

پس `string` *auto-boxed* نمونهٔ `new String()` است و بنابراین به `String.prototype` پیوند دارد. به‌طور مشابه، همین برای `number` (wrap‌شده به‌عنوان نمونهٔ `new Number()`) و `boolean` (wrap‌شده به‌عنوان نمونهٔ `new Boolean()`) صادق است.

اگرچه «constructors»ٔ `Symbol(..)` و `BigInt(..)` (بدون `new` استفاده می‌شوند) مقادیر اولیه تولید می‌کنند، این مقادیر اولیه هم می‌توانند به شکل‌های wrapper fundamental object داخلی *auto-box* شوند، برای دسترسی تفویض‌شده به ویژگی‌ها/متدها.

| NOTE: |
| :--- |
| کتاب «اشیاء و کلاس‌ها» از این مجموعه را برای بیشتر دربارهٔ پیوندهای `[[Prototype]]` و دسترسی تفویض‌شده/ارث‌برده به شیءهای prototype constructorهای fundamental object ببینید. |

چون `null` و `undefined` fundamental objects متناظر ندارند، *auto-boxing* این مقادیر وجود ندارد.

سؤال ذهنی برای در نظر گرفتن: آیا *auto-boxing* شکلی از coercion است؟ من می‌گویم بله، اگرچه برخی مخالفند. به‌صورت داخلی، primitive به شیء تبدیل می‌شود، یعنی تغییری در نوع مقدار رخ داده. بله، موقتی است، اما coercionهای زیادی موقتی هستند. علاوه بر این، تبدیل نسبتاً *implicit* است (توسط دسترسی ویژگی/متد القا می‌شود، اما فقط به‌صورت داخلی اتفاق می‌افتد). ماهیت coercion را در فصل ۴ دوباره بررسی می‌کنیم.
