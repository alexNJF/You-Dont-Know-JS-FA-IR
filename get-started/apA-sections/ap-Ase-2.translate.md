# اشکال تابعی فراوان

این تکه را از بخش «Functions» در فصل ۲ به خاطر بیاورید:

```js
var awesomeFunction = function(coolThings) {
    // ..
    return amazingStuff;
};
```

function expression اینجا *anonymous function expression* نامیده می‌شود، چون بین کلمهٔ کلیدی `function` و لیست پارامتر `(..)` هیچ identifier نامی ندارد. این نکته بسیاری توسعه‌دهندگان جاوااسکریپت را سردرگم می‌کند چون از ES6، جاوااسکریپت «name inference» روی تابع anonymous انجام می‌دهد:

```js
awesomeFunction.name;
// "awesomeFunction"
```

property `name` یک تابع یا نام مستقیم داده‌شده (در مورد declaration) یا نام inferred در مورد anonymous function expression را نشان می‌دهد. آن مقدار معمولاً توسط ابزارهای توسعه‌دهنده هنگام بررسی مقدار تابع یا هنگام گزارش error stack trace استفاده می‌شود.

پس حتی anonymous function expression *ممکن* نام بگیرد. با این حال، name inference فقط در موارد محدود مثل وقتی function expression assign می‌شود (با `=`) اتفاق می‌افتد. اگر function expression را به‌عنوان argument به فراخوانی تابع pass کنید، مثلاً، هیچ name inference رخ نمی‌دهد؛ property `name` string خالی خواهد بود، و developer console معمولاً «(anonymous function)» گزارش می‌دهد.

حتی اگر نامی inferred شود، **هنوز تابع anonymous است.** چرا؟ چون نام inferred مقدار string metadata است، نه identifier موجود برای ارجاع به تابع. تابع anonymous identifier برای ارجاع به خودش از داخل خودش ندارد—برای بازگشت، event unbinding و غیره.

شکل anonymous function expression را با این مقایسه کنید:

```js
// let awesomeFunction = ..
// const awesomeFunction = ..
var awesomeFunction = function someName(coolThings) {
    // ..
    return amazingStuff;
};

awesomeFunction.name;
// "someName"
```

این function expression *named function expression* است، چون identifier `someName` در زمان compile مستقیماً با function expression مرتبط است؛ ارتباط با identifier `awesomeFunction` هنوز تا runtime در زمان آن statement اتفاق نمی‌افتد. آن دو identifier لازم نیست مطابقت داشته باشند؛ گاهی منطقی است متفاوت باشند، گاهی بهتر است یکسان باشند.

همچنین توجه کنید که نام صریح تابع، identifier `someName`، هنگام assign کردن *name* برای property `name` اولویت دارد.

آیا function expressionها باید named یا anonymous باشند؟ نظرات به شدت متفاوت است. بیشتر توسعه‌دهندگان تمایل به بی‌توجهی به استفاده از توابع anonymous دارند. کوتاه‌ترند، و بدون شک در حوزهٔ گستردهٔ کد جاوااسکریپت رایج‌ترند.

به نظر من، اگر تابعی در برنامهٔ شما وجود دارد، هدفی دارد؛ در غیر این صورت، آن را حذف کنید! و اگر هدفی دارد، نام طبیعی دارد که آن هدف را توصیف می‌کند.

اگر تابعی نام دارد، شما نویسندهٔ کد باید آن نام را در کد شامل کنید، تا خواننده مجبور نباشد آن نام را از خواندن و اجرای ذهنی کد منبع آن تابع استنباط کند. حتی بدنهٔ تابع ساده مثل `x * 2` باید خوانده شود تا نامی مثل «double» یا «multBy2» استنباط شود؛ آن کار ذهنی اضافی کوتاه وقتی می‌توانید یک ثانیه وقت بگذارید و تابع را یک بار «double» یا «multBy2» نام بدهید غیرضروری است، و آن کار ذهنی تکراری را هر بار که در آینده خوانده می‌شود برای خواننده ذخیره می‌کنید.

متأسفانه از برخی جهات، اشکال تعریف تابع بسیار دیگری در جاوااسکریپت تا اوایل ۲۰۲۰ وجود دارد (شاید بیشتر در آینده!).

برخی شکل‌های declaration بیشتر:

```js
// generator function declaration
function *two() { .. }

// async function declaration
async function three() { .. }

// async generator function declaration
async function *four() { .. }

// named function export declaration (ES6 modules)
export function five() { .. }
```

و برخی از اشکال (فراوان!) function expression بیشتر:

```js
// IIFE
(function(){ .. })();
(function namedIIFE(){ .. })();

// asynchronous IIFE
(async function(){ .. })();
(async function namedAIIFE(){ .. })();

// arrow function expressions
var f;
f = () => 42;
f = x => x * 2;
f = (x) => x * 2;
f = (x,y) => x * y;
f = x => ({ x: x * 2 });
f = x => { return x * 2; };
f = async x => {
    var y = await doSomethingAsync(x);
    return y * 2;
};
someOperation( x => x * 2 );
// ..
```

به خاطر داشته باشید که arrow function expressionها **از نظر نحوی anonymous** هستند، یعنی نحو راهی برای ارائهٔ identifier نام مستقیم برای تابع فراهم نمی‌کند. function expression ممکن است نام inferred بگیرد، اما فقط اگر یکی از شکل‌های assignment باشد، نه در شکل (رایج‌تر!) pass شدن به‌عنوان argument فراخوانی تابع (مثل خط آخر تکه).

چون فکر نمی‌کنم توابع anonymous ایدهٔ خوبی برای استفادهٔ مکرر در برنامه‌هایتان باشند، طرفدار استفاده از شکل تابع `=>` arrow نیستم. این نوع تابع در واقع هدف خاصی دارد (یعنی handle کردن کلمهٔ کلیدی `this` به‌صورت lexical)، اما این یعنی نباید آن را برای هر تابعی که می‌نویسیم استفاده کنیم. مناسب‌ترین ابزار را برای هر کار استفاده کنید.

توابع همچنین می‌توانند در تعریف‌های class و تعریف‌های object literal مشخص شوند. معمولاً وقتی در این شکل‌ها هستند «methods» نامیده می‌شوند، هرچند در جاوااسکریپت این اصطلاح تفاوت قابل‌مشاهدهٔ زیادی با «function» ندارد:

```js
class SomethingKindaGreat {
    // class methods
    coolMethod() { .. }   // no commas!
    boringMethod() { .. }
}

var EntirelyDifferent = {
    // object methods
    coolMethod() { .. },   // commas!
    boringMethod() { .. },

    // (anonymous) function expression property
    oldSchool: function() { .. }
};
```

وای! راه‌های مختلف زیادی برای تعریف توابع هست.

راه میانبر ساده‌ای اینجا نیست؛ فقط باید با همهٔ اشکال تابع آشنا شوید تا بتوانید آن‌ها را در کد موجود تشخیص دهید و به‌درستی در کدی که می‌نویسید استفاده کنید. آن‌ها را از نزدیک مطالعه و تمرین کنید!
