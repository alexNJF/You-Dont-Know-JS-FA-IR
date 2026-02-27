# تعیین محتوای ظرف

می‌توانید محتوای شیء را به روش‌های مختلف تعیین کنید. برای پرسیدن از شیء که آیا ویژگی خاصی دارد:

```js
myObj = {
    favoriteNumber: 42,
    coolFact: "the first person convicted of speeding was going 8 mph",
    beardLength: undefined,
    nicknames: [ "getify", "ydkjs" ]
};

"favoriteNumber" in myObj;            // true

myObj.hasOwnProperty("coolFact");     // true
myObj.hasOwnProperty("beardLength");  // true

myObj.nicknames = undefined;
myObj.hasOwnProperty("nicknames");    // true

delete myObj.nicknames;
myObj.hasOwnProperty("nicknames");    // false
```

تفاوت *مهمی* بین رفتار operator `in` و متد `hasOwnProperty(..)` وجود دارد. operator `in` نه فقط شیء هدف مشخص‌شده را بررسی می‌کند، بلکه اگر آنجا پیدا نشود، زنجیرهٔ `[[Prototype]]` شیء را هم (پوشش‌داده‌شده در فصل بعد) مشورت می‌کند. در مقابل، `hasOwnProperty(..)` فقط شیء هدف را مشورت می‌کند.

اگر دقیق توجه کنید، ممکن است متوجه شده باشید که `myObj` ظاهراً متد ویژگی به نام `hasOwnProperty(..)` رویش دارد، هرچند چنین تعریف نکردیم. دلیلش این است که `hasOwnProperty(..)` به‌عنوان built-in روی `Object.prototype` تعریف شده که به‌طور پیش‌فرض توسط همهٔ اشیاء معمولی «به ارث برده می‌شود». با این حال، ریسک ذاتی در دسترسی به چنین متد «به‌ارث‌برده» وجود دارد. باز هم، بیشتر دربارهٔ prototypeها در فصل بعد.

### بررسی وجود بهتر

ES2022 (تقریباً رسمی در زمان نوشتن) قبلاً روی ویژگی جدیدی به نام `Object.hasOwn(..)` توافق کرده. اساساً همان کار `hasOwnProperty(..)` را می‌کند، اما به‌عنوان helper استاتیک خارج از مقدار شیء فراخوانی می‌شود به‌جای از طریق `[[Prototype]]` شیء، که آن را امن‌تر و سازگارتر در استفاده می‌کند:

```js
// به‌جای:
myObj.hasOwnProperty("favoriteNumber")

// اکنون باید ترجیح دهیم:
Object.hasOwn(myObj,"favoriteNumber")
```

هرچند (در زمان نوشتن) این ویژگی تازه در حال ظهور در جاوااسکریپت است، polyfillهایی وجود دارند که این API را در برنامه‌هایتان حتی هنگام اجرا در محیط جاوااسکریپت قبلی که هنوز ویژگی تعریف نشده در دسترس می‌کنند. مثلاً یک طرح polyfill جایگزین سریع:

```js
// طرح polyfill ساده برای `Object.hasOwn(..)`
if (!Object.hasOwn) {
    Object.hasOwn = function hasOwn(obj,propName) {
        return Object.prototype.hasOwnProperty.call(obj,propName);
    };
}
```

شامل کردن patch polyfill مثل آن در برنامه یعنی می‌توانید با خیال راحت استفاده از `Object.hasOwn(..)` را برای بررسی وجود ویژگی شروع کنید صرف‌نظر از اینکه محیط جاوااسکریپت `Object.hasOwn(..)` built-in دارد یا نه.

### لیست کردن همهٔ محتوای ظرف

قبلاً API `Object.entries(..)` را بحث کردیم که به ما می‌گوید شیء چه ویژگی‌هایی دارد (تا زمانی که enumerable باشند — بیشتر در فصل بعد).

مکانیزم‌های متنوع دیگری هم در دسترس است. `Object.keys(..)` لیست نام‌های ویژگی enumerable (یعنی کلیدها) در شیء را می‌دهد — فقط نام‌ها، بدون مقادیر؛ `Object.values(..)` به‌جای آن لیست همهٔ مقادیر نگه‌داشته‌شده در ویژگی‌های enumerable را می‌دهد.

اما اگر می‌خواستیم *همه*ٔ کلیدهای شیء (enumerable یا نه) را بگیریم چه؟ `Object.getOwnPropertyNames(..)` به نظر می‌رسد همان کاری را می‌کند که می‌خواهیم، یعنی شبیه `Object.keys(..)` است اما نام‌های ویژگی non-enumerable را هم برمی‌گرداند. با این حال، این لیست **هیچ** نام ویژگی Symbol را شامل نمی‌شود، چون آن‌ها به‌عنوان مکان‌های خاص روی شیء treat می‌شوند. `Object.getOwnPropertySymbols(..)` همهٔ ویژگی‌های Symbol شیء را برمی‌گرداند. پس اگر هر دو لیست را به هم concatenate کنید، همهٔ محتوای مستقیم (*owned*) شیء را دارید.

با این حال همان‌طور که چند بار اشاره کردیم و در فصل بعد با جزئیات کامل پوشش می‌دهیم، شیء می‌تواند محتوا را از زنجیرهٔ `[[Prototype]]` خود «به ارث ببرد». این‌ها محتوای *owned* به‌حساب نمی‌آیند، پس در هیچ‌کدام از این لیست‌ها ظاهر نمی‌شوند.

به خاطر بسپارید که operator `in` به‌طور بالقوه کل زنجیره را برای وجود ویژگی traverse می‌کند. به‌طور مشابه، حلقهٔ `for..in` زنجیره را traverse می‌کند و هر ویژگی enumerable (owned یا به‌ارث‌برده) را لیست می‌کند. اما هیچ API built-in وجود ندارد که کل زنجیره را traverse کند و لیستی از مجموعهٔ ترکیبی هر دو محتوای *owned* و *به‌ارث‌برده* برگرداند.
