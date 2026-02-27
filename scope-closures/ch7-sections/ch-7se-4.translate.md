# چرا Closure؟

اکنون که درک درستی از closure و نحوه کارش داریم، بیایید چند راهی که می‌تواند ساختار و سازماندهی کد یک برنامه نمونه را بهبود دهد کاوش کنیم.

تصور کنید دکمه‌ای روی صفحه دارید که وقتی کلیک می‌شود باید داده‌ای را بازیابی و از طریق درخواست Ajax بفرستد. بدون استفاده از closure:

```js
var APIendpoints = {
    studentIDs:
        "https://some.api/register-students",
    // ..
};

var data = {
    studentIDs: [ 14, 73, 112, 6 ],
    // ..
};

function makeRequest(evt) {
    var btn = evt.target;
    var recordKind = btn.dataset.kind;
    ajax(
        APIendpoints[recordKind],
        data[recordKind]
    );
}

// <button data-kind="studentIDs">
//    Register Students
// </button>
btn.addEventListener("click",makeRequest);
```

ابزار `makeRequest(..)` فقط یک object `evt` از رویداد کلیک دریافت می‌کند. از آنجا باید ویژگی `data-kind` را از المنت دکمه هدف دریافت کند و از آن مقدار برای جستجوی هم URL endpoint API و هم داده‌ای که باید در درخواست Ajax گنجانده شود استفاده کند.

این درست کار می‌کند، اما متأسفانه (ناکارآمد، گیج‌کننده‌تر) است که event handler باید هر بار که اجرا می‌شود یک ویژگی DOM بخواند. چرا event handler نمی‌تواند این مقدار را *به یاد بیاورد*؟ بیایید با استفاده از closure کد را بهبود دهیم:

```js
var APIendpoints = {
    studentIDs:
        "https://some.api/register-students",
    // ..
};

var data = {
    studentIDs: [ 14, 73, 112, 6 ],
    // ..
};

function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;

    btn.addEventListener(
        "click",
        function makeRequest(evt){
            ajax(
                APIendpoints[recordKind],
                data[recordKind]
            );
        }
    );
}

// <button data-kind="studentIDs">
//    Register Students
// </button>

setupButtonHandler(btn);
```

با رویکرد `setupButtonHandler(..)`، ویژگی `data-kind` یک بار در راه‌اندازی اولیه دریافت و به متغیر `recordKind` انتساب داده می‌شود. `recordKind` سپس توسط event handler کلیک درونی `makeRequest(..)` close over می‌شود و مقدارش در هر اجرای رویداد برای جستجوی URL و داده‌ای که باید فرستاده شود استفاده می‌شود.

| نکته: |
| :--- |
| `evt` هنوز به `makeRequest(..)` فرستاده می‌شود، هرچند در این مورد دیگر استفاده نمی‌کنیم. هنوز برای یکنواختی با قطعه قبلی لیست شده. |

با قرار دادن `recordKind` داخل `setupButtonHandler(..)`، مواجهه scope آن متغیر را به زیرمجموعه مناسب‌تری از برنامه محدود می‌کنیم؛ ذخیره آن به صورت سراسری برای سازماندهی و خوانایی کد بدتر می‌بود. Closure به نمونه تابع `makeRequest()` درونی اجازه می‌دهد این متغیر را *به یاد بیاورد* و هر وقت لازم است دسترسی پیدا کند.

با بنا کردن بر این الگو، می‌توانستیم هم URL و هم داده را یک بار در راه‌اندازی جستجو کنیم:

```js
function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;
    var requestURL = APIendpoints[recordKind];
    var requestData = data[recordKind];

    btn.addEventListener(
        "click",
        function makeRequest(evt){
            ajax(requestURL,requestData);
        }
    );
}
```

اکنون `makeRequest(..)` بر `requestURL` و `requestData` close over است و کمی تمیزتر برای فهمیدن است، و همچنین کمی کارآمدتر.

دو تکنیک مشابه از پارادایم برنامه‌نویسی تابعی (FP) که به closure متکی‌اند partial application و currying هستند. به طور خلاصه، با این تکنیک‌ها، *شکل* توابعی که چند ورودی نیاز دارند را طوری تغییر می‌دهیم که برخی ورودی‌ها از قبل ارائه شوند و ورودی‌های دیگر بعداً؛ ورودی‌های اولیه از طریق closure به یاد آورده می‌شوند. وقتی همه ورودی‌ها ارائه شدند، عمل زیربنایی انجام می‌شود.

با ایجاد نمونه تابعی که اطلاعاتی را داخل (از طریق closure) encapsulate می‌کند، تابع-با-اطلاعات-ذخیره‌شده می‌تواند بعداً مستقیماً بدون نیاز به ارائه مجدد آن ورودی استفاده شود. این آن بخش کد را تمیزتر می‌کند، و همچنین فرصت نام‌گذاری توابع partially applied با نام‌های معنایی بهتر را ارائه می‌دهد.

با تطبیق partial application، می‌توانیم کد قبلی را بیشتر بهبود دهیم:

```js
function defineHandler(requestURL,requestData) {
    return function makeRequest(evt){
        ajax(requestURL,requestData);
    };
}

function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;
    var handler = defineHandler(
        APIendpoints[recordKind],
        data[recordKind]
    );
    btn.addEventListener("click",handler);
}
```

ورودی‌های `requestURL` و `requestData` از قبل ارائه می‌شوند، که منجر به تابع partially applied `makeRequest(..)` می‌شود که محلی `handler` نام می‌بریم. وقتی رویداد در نهایت اجرا می‌شود، ورودی نهایی (`evt`، حتی با اینکه نادیده گرفته می‌شود) به `handler()` فرستاده می‌شود، ورودی‌هایش را کامل می‌کند و درخواست Ajax زیربنایی را راه‌اندازی می‌کند.

از نظر رفتار، این برنامه شباهت زیادی به قبلی دارد، با همان نوع closure. اما با جدا کردن ایجاد `makeRequest(..)` در یک ابزار جداگانه (`defineHandler(..)`)، آن تعریف را در سراسر برنامه قابل استفاده‌تر می‌کنیم. همچنین صریحاً scope closure را به فقط دو متغیر لازم محدود می‌کنیم.
