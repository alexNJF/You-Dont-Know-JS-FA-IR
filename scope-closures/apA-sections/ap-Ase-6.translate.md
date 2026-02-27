# آیا Callbackهای همزمان هنوز Closure هستند؟

فصل ۷ دو مدل مختلف برای tackling کردن closure ارائه داد:

* Closure نمونه تابعی است که متغیرهای بیرونی‌اش را به یاد می‌آورد حتی وقتی آن تابع جا به جا می‌شود و **در** scopeهای دیگر فراخوانی می‌شود.

* Closure نمونه تابع و محیط scopeاش است که در جای خود حفظ می‌شود در حالی که ارجاع‌ها به آن جا به جا می‌شوند و **از** scopeهای دیگر فراخوانی می‌شوند.

این مدل‌ها به شدت واگرا نیستند، اما از دیدگاه متفاوتی نزدیک می‌شوند. و آن دیدگاه متفاوت آنچه به عنوان closure شناسایی می‌کنیم را تغییر می‌دهد.

در دنبال کردن این مسیر خرگوش از closureها و callbackها گم نشوید:

* فراخوانی بازگشتی به چه (یا کجا)؟
* شاید «synchronous callback» بهترین برچسب نیست
* ***اگر*** توابع جا به جا نشوند، چرا به closure نیاز دارند؟
* به تعویق انداختن در طول زمان کلید closure است

### Callback چیست؟

قبل از بازگشت به closure، بگذارید لحظه کوتاهی به کلمه «callback» بپردازم. هنجار پذیرفته‌شده عمومی این است که گفتن «callback» مترادف با هر دو *asynchronous callback* و *synchronous callback* است. فکر نمی‌کنم موافق باشم که ایده خوبی است، پس می‌خواهم توضیح دهم چرا و پیشنهاد کنم به اصطلاح دیگری حرکت کنیم.

اول *asynchronous callback* را در نظر بگیریم، ارجاع تابعی که در نقطه‌ای *بعدی* در آینده فراخوانی می‌شود. «callback» در این مورد یعنی چه؟

یعنی کد فعلی تمام یا متوقف شده، خودش را suspend کرده، و وقتی تابع مورد نظر بعداً فراخوانی می‌شود، اجرا به برنامه suspend شده برمی‌گردد و آن را از سر می‌گیرد. به طور خاص، نقطه بازگشت کدی است که در ارجاع تابع wrap شده بود:

```js
setTimeout(function waitForASecond(){
    // this is where JS should call back into
    // the program when the timer has elapsed
},1000);

// this is where the current program finishes
// or suspends
```

در این زمینه، «calling back» خیلی معنا می‌دهد. موتور JS برنامه suspend شده ما را با *calling back in* در مکان خاصی از سر می‌گیرد. خوب، پس callback ناهمزمان است.

### Callback همزمان؟

اما *synchronous callback*ها چطور؟ در نظر بگیرید:

```js
function getLabels(studentIDs) {
    return studentIDs.map(
        function formatIDLabel(id){
            return `Student ID: ${
               String(id).padStart(6)
            }`;
        }
    );
}

getLabels([ 14, 73, 112, 6 ]);
// [
//    "Student ID: 000014",
//    "Student ID: 000073",
//    "Student ID: 000112",
//    "Student ID: 000006"
// ]
```

آیا باید به `formatIDLabel(..)` به عنوان callback اشاره کنیم؟ آیا ابزار `map(..)` واقعاً با فراخوانی تابعی که ارائه دادیم *به برنامه ما برمی‌گردد*؟

چیزی برای *برگشتن به آن* به خودی خود نیست، چون برنامه suspend یا خارج نشده. تابع (ارجاع) را از بخشی از برنامه به بخش دیگری می‌فرستیم و بعد بلافاصله فراخوانی می‌شود.

اصطلاحات تأسیس‌شده دیگری هست که ممکن است با آنچه می‌کنیم مطابقت داشته باشد—فرستادن تابع (ارجاع) تا بخش دیگری از برنامه بتواند به نیابت از ما آن را فراخوانی کند. ممکن است به آن *Dependency Injection* (DI) یا *Inversion of Control* (IoC) فکر کنید.

DI را می‌توان به صورت فرستادن بخش(های) لازم قابلیت به بخش دیگری از برنامه خلاصه کرد تا بتواند آن‌ها را برای تکمیل کارش فراخوانی کند. توضیح مناسبی برای فراخوانی `map(..)` بالا نیست؟ ابزار `map(..)` می‌داند روی مقادیر لیست iterate کند، اما نمی‌داند با آن مقادیر چه *کند*. به همین دلیل تابع `formatIDLabel(..)` را می‌فرستیم. وابستگی را inject می‌کنیم.

IoC مفهوم نسبتاً مشابه و مرتبط است. Inversion of control یعنی به جای اینکه ناحیه فعلی برنامه‌تان کنترل آنچه اتفاق می‌افتد را داشته باشد، کنترل را به بخش دیگری از برنامه می‌سپارید. منطق محاسبه رشته label را در تابع `formatIDLabel(..)` wrap کردیم، سپس کنترل فراخوانی را به ابزار `map(..)` دادیم.

قابل توجه، Martin Fowler IoC را به عنوان تفاوت framework و library ذکر می‌کند: با library، توابعش را فراخوانی می‌کنید؛ با framework، توابع شما را فراخوانی می‌کند. [^fowlerIOC]

در زمینه بحث ما، یا DI یا IoC می‌تواند به عنوان برچسب جایگزین برای *synchronous callback* کار کند.

اما پیشنهاد متفاوتی دارم. بیایید (توابعی که قبلاً به عنوان) *synchronous callback* شناخته می‌شدند را *inter-invoked functions* (IIF) بنامیم. بله، دقیقاً، از IIFE تقلید می‌کنم. این نوع توابع *inter-invoked* هستند، یعنی: موجودیت دیگری آن‌ها را فراخوانی می‌کند، در مقابل IIFEها که خودشان بلافاصله فراخوانی می‌کنند.

رابطه بین *asynchronous callback* و IIF چیست؟ *Asynchronous callback* IIF است که به جای همزمان به صورت ناهمزمان فراخوانی می‌شود.

### Closure همزمان؟

حالا که *synchronous callback*ها را به IIFها برچسب‌زدیم، می‌توانیم به سؤال اصلی برگردیم: آیا IIFها نمونه closure هستند؟ واضح است که IIF باید به متغیر(های) از scope بیرونی ارجاع دهد تا شانسی برای closure داشته باشد. IIF `formatIDLabel(..)` قبلی به هیچ متغیر بیرون از scope خودش ارجاع نمی‌دهد، پس قطعاً closure نیست.

IIF که ارجاع‌های خارجی دارد چطور، آیا closure است؟

```js
function printLabels(labels) {
    var list = document.getElementById("labelsList");

    labels.forEach(
        function renderLabel(label){
            var li = document.createElement("li");
            li.innerText = label;
            list.appendChild(li);
        }
    );
}
```

IIF درونی `renderLabel(..)` به `list` از scope احاطه‌کننده ارجاع می‌دهد، پس IIF است که *می‌تواند* closure داشته باشد. اما اینجا تعریف/مدلی که برای closure انتخاب می‌کنیم مهم است:

* اگر `renderLabel(..)` **تابعی است که جایی دیگر فرستاده می‌شود** و آن تابع بعداً فراخوانی می‌شود، پس بله، `renderLabel(..)` closure را اعمال می‌کند، چون closure دسترسی به scope chain اصلیش را حفظ کرد.

* اما اگر، مثل مدل مفهومی جایگزین از فصل ۷، `renderLabel(..)` در جای خود می‌ماند و فقط ارجاعی به آن به `forEach(..)` فرستاده می‌شود، آیا نیازی به closure برای حفظ scope chain `renderLabel(..)` هست، در حالی که همزمان درست داخل scope خودش اجرا می‌شود؟

نه. آن فقط lexical scope عادی است.

برای فهمیدن چرا، این شکل جایگزین `printLabels(..)` را در نظر بگیرید:

```js
function printLabels(labels) {
    var list = document.getElementById("labelsList");

    for (let label of labels) {
        // just a normal function call in its own
        // scope, right? That's not really closure!
        renderLabel(label);
    }

    // **************

    function renderLabel(label) {
        var li = document.createElement("li");
        li.innerText = label;
        list.appendChild(li);
    }
}
```

این دو نسخه `printLabels(..)` اساساً یکسان هستند.

نسخه دوم قطعاً نمونه closure نیست، حداقل به هیچ معنای مفید یا قابل مشاهده‌ای. فقط lexical scope است. نسخه اول، با `forEach(..)` که ارجاع تابع ما را فراخوانی می‌کند، اساساً همان است. آن هم closure نیست، بلکه فراخوانی تابع lexical scope ساده است.

### واگذار کردن به Closure

به هر حال، فصل ۷ به طور خلاصه partial application و currying را ذکر کرد (که *به* closure متکی‌اند!). این سناریوی جالبی است که currying دستی می‌تواند استفاده شود:

```js
function printLabels(labels) {
    var list = document.getElementById("labelsList");
    var renderLabel = renderTo(list);

    // definitely closure this time!
    labels.forEach( renderLabel );

    // **************

    function renderTo(list) {
        return function createLabel(label){
            var li = document.createElement("li");
            li.innerText = label;
            list.appendChild(li);
        };
    }
}
```

تابع درونی `createLabel(..)` که به `renderLabel` انتساب می‌دهیم بر `list` close over است، پس قطعاً از closure استفاده می‌شود.

Closure به ما اجازه می‌دهد `list` را برای بعد به یاد بیاوریم، در حالی که اجرای منطق واقعی ایجاد label را از فراخوانی `renderTo(..)` به فراخوانی‌های بعدی `forEach(..)` تابع IIF `createLabel(..)` به تعویق می‌اندازیم. ممکن است اینجا فقط لحظه کوتاهی باشد، اما هر مقدار زمانی می‌تواند بگذرد، چون closure از فراخوانی به فراخوانی پل می‌زند.
