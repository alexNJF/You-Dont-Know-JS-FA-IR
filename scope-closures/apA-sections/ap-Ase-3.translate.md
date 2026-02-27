# Hoisting: توابع و متغیرها

فصل ۵ هم *function hoisting* و هم *variable hoisting* را بیان کرد. چون hoisting اغلب به عنوان اشتباه در طراحی JS ذکر می‌شود، می‌خواستم به طور خلاصه کاوش کنم چرا هر دو شکل hoisting *می‌توانند* مفید باشند و هنوز باید در نظر گرفته شوند.

با در نظر گرفتن عمیق‌تر مزایای hoisting:

* کد قابل اجرا اول، اعلان‌های تابع آخر
* قرارگیری معنایی اعلان‌های متغیر

### Function Hoisting

برای مرور، این برنامه به خاطر *function hoisting* کار می‌کند:

```js
getStudents();

// ..

function getStudents() {
    // ..
}
```

function declaration در حین کامپایل hoist می‌شود، یعنی `getStudents` شناسه‌ای است که برای کل scope اعلان شده. علاوه بر این، شناسه `getStudents` با ارجاع تابع مقداردهی اولیه خودکار می‌شود، دوباره در ابتدای scope.

چرا مفید است؟ دلیلی که ترجیح می‌دهم از *function hoisting* استفاده کنم این است که کد *قابل اجرا* را در هر scope در بالا و اعلان‌های بعدی (توابع) را در پایین قرار می‌دهد. یعنی پیدا کردن کدی که در هر ناحیه اجرا می‌شود آسان‌تر است، به جای scroll و scroll کردن، امیدوار به پیدا کردن `}` trailing که انتهای scope/تابعی جایی را مشخص می‌کند.

از این قرارگیری معکوس در همه سطوح scope استفاده می‌کنم:

```js
getStudents();

// *************

function getStudents() {
    var whatever = doSomething();

    // other stuff

    return whatever;

    // *************

    function doSomething() {
        // ..
    }
}
```

وقتی اولین بار فایلی مثل آن را باز می‌کنم، اولین خط کد قابل اجرایی است که رفتارش را شروع می‌کند. خیلی راحت پیدا می‌شود! سپس اگر هرگز نیاز به پیدا کردن و بررسی `getStudents()` داشته باشم، دوست دارم اولین خطش هم کد قابل اجرا باشد. فقط اگر نیاز به دیدن جزئیات `doSomething()` داشته باشم به پایین می‌روم و تعریفش را پیدا می‌کنم.

به عبارت دیگر، فکر می‌کنم *function hoisting* کد را از طریق ترتیب خواندن جاری و پیشرونده، از بالا به پایین، خواناتر می‌کند.

### Variable Hoisting

*Variable hoisting* چطور؟

حتی با اینکه `let` و `const` hoist می‌شوند، نمی‌توانید از آن متغیرها در TDZشان استفاده کنید (فصل ۵ را ببینید). پس بحث زیر فقط برای اعلان‌های `var` اعمال می‌شود. قبل از ادامه، اعتراف می‌کنم: در تقریباً همه موارد، کاملاً موافقم که *variable hoisting* ایده بدی است:

```js
pleaseDontDoThis = "bad idea";

// much later
var pleaseDontDoThis;
```

در حالی که آن ترتیب معکوس برای *function hoisting* مفید بود، اینجا فکر می‌کنم معمولاً کد را سخت‌تر برای استدلال می‌کند.

اما یک استثنا پیدا کرده‌ام، نسبتاً به ندرت، در کدنویسی خودم. مربوط به جایی است که اعلان‌های `var` را داخل تعریف ماژول CommonJS قرار می‌دهم.

این‌طور معمولاً تعریف‌های ماژولم را در Node ساختار می‌دهم:

```js
// dependencies
var aModuleINeed = require("very-helpful");
var anotherModule = require("kinda-helpful");

// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    // ..
});

// ********************************
// private implementation

var cache = { };
var otherData = [ ];

function getStudents() {
    // ..
}

function addStudents() {
    // ..
}
```

توجه کنید متغیرهای `cache` و `otherData` در بخش «خصوصی» چیدمان ماژول هستند؟ چون قصد expose عمومی آن‌ها را ندارم. پس ماژول را طوری سازماندهی می‌کنم که کنار جزئیات پیاده‌سازی پنهان دیگر ماژول قرار گیرند.

اما چند مورد نادر داشته‌ام که نیاز به اتفاق افتادن انتساب آن مقادیر *بالاتر*، قبل از اعلان API عمومی export شده ماژول بود. مثلاً:

```js
// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    refreshData: refreshData.bind(null,cache)
});
```

به متغیر `cache` نیاز دارم که قبلاً مقدار انتساب شده داشته باشد، چون آن مقدار در مقداردهی اولیه API عمومی (partial-application `.bind(..)`) استفاده می‌شود.

آیا باید فقط `var cache = { .. }` را به بالا، بالای این مقداردهی اولیه API عمومی منتقل کنم؟ خوب، شاید. اما حالا کمتر واضح است که `var cache` جزئیات پیاده‌سازی *خصوصی* است. این مصالحه‌ای است که (نسبتاً به ندرت) استفاده کرده‌ام:

```js
cache = {};   // used here, but declared below

// public API
var publicAPI = Object.assign(module.exports,{
    getStudents,
    addStudents,
    refreshData: refreshData.bind(null,cache)
});

// ********************************
// private implementation

var cache /* = {}*/;
```

*Variable hoisting* را می‌بینید؟ `cache` را پایین جایی که منطقاً تعلق دارد اعلان کرده‌ام، اما در این مورد نادر آن را بالاتر، در ناحیه‌ای که مقداردهی اولیه‌اش لازم است استفاده کرده‌ام. حتی اشاره‌ای به مقداری که به `cache` انتساب می‌شود در کامنت کد گذاشتم.

این تحت‌اللفظی تنها موردی است که برای استفاده از *variable hoisting* برای انتساب متغیر زودتر در scope از اعلانش پیدا کرده‌ام. اما فکر می‌کنم استثنای معقولی برای استفاده با احتیاط است.
