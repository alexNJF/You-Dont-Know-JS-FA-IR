# دیدن Closure

Closure در اصل یک مفهوم ریاضی است، از lambda calculus. اما قرار نیست فرمول‌های ریاضی لیست کنم یا از انبوهی نماد و اصطلاح برای تعریفش استفاده کنم.

به جای آن، بر دیدگاه عملی تمرکز می‌کنم. با تعریف closure بر اساس آنچه می‌توانیم در رفتار متفاوت برنامه‌هایمان مشاهده کنیم شروع می‌کنیم، در مقابل اگر closure در JS نبود. با این حال، بعداً در این فصل closure را برعکس می‌کنیم تا از *دیدگاه جایگزین* به آن نگاه کنیم.

Closure رفتاری از توابع و فقط توابع است. اگر با تابع سروکار ندارید، closure اعمال نمی‌شود. یک object نمی‌تواند closure داشته باشد، و یک class هم closure ندارد (هرچند توابع/متدهایش ممکن است داشته باشند). فقط توابع closure دارند.

برای مشاهده closure، یک تابع باید فراخوانی شود، و به‌طور خاص باید در شاخه متفاوتی از scope chain از جایی که در اصل تعریف شده فراخوانی شود. تابعی که در همان scope تعریف‌شده اجرا شود با یا بدون امکان closure هیچ رفتار قابل مشاهده متفاوتی نشان نمی‌دهد؛ از دیدگاه مشاهده و تعریف، آن closure نیست.

بیایید کدی ببینیم، با حباب‌های scope رنگی مربوطش حاشیه‌نویسی شده (فصل ۲ را ببینید):

```js
// outer/global scope: RED(1)

function lookupStudent(studentID) {
    // function scope: BLUE(2)

    var students = [
        { id: 14, name: "Kyle" },
        { id: 73, name: "Suzy" },
        { id: 112, name: "Frank" },
        { id: 6, name: "Sarah" }
    ];

    return function greetStudent(greeting){
        // function scope: GREEN(3)

        var student = students.find(
            student => student.id == studentID
        );

        return `${ greeting }, ${ student.name }!`;
    };
}

var chosenStudents = [
    lookupStudent(6),
    lookupStudent(112)
];

// accessing the function's name:
chosenStudents[0].name;
// greetStudent

chosenStudents[0]("Hello");
// Hello, Sarah!

chosenStudents[1]("Howdy");
// Howdy, Frank!
```

اولین چیزی که درباره این کد باید توجه کنید این است که تابع بیرونی `lookupStudent(..)` یک تابع درونی به نام `greetStudent(..)` ایجاد و برمی‌گرداند. `lookupStudent(..)` دو بار فراخوانی می‌شود، دو نمونه جداگانه از تابع درونی `greetStudent(..)` تولید می‌کند، که هر دو در آرایه `chosenStudents` ذخیره می‌شوند.

با بررسی ویژگی `.name` تابع برگشتی ذخیره‌شده در `chosenStudents[0]` تأیید می‌کنیم که همینطور است، و در واقع نمونه‌ای از `greetStudent(..)` درونی است.

بعد از اتمام هر فراخوانی `lookupStudent(..)`، به نظر می‌رسد همه متغیرهای درونی آن دور ریخته و GC می‌شوند (garbage collected). تابع درونی تنها چیزی است که به نظر برمی‌گردد و حفظ می‌شود. اما اینجا جایی است که رفتار به روش‌هایی که می‌توانیم شروع به مشاهده کنیم متفاوت می‌شود.

در حالی که `greetStudent(..)` یک آرگومان به عنوان پارامتر به نام `greeting` دریافت می‌کند، به هر دو `students` و `studentID` ارجاع می‌دهد، شناسه‌هایی که از scope احاطه‌کننده `lookupStudent(..)` می‌آیند. هر یک از آن ارجاع‌ها از تابع درونی به متغیر در scope بیرونی یک *closure* نامیده می‌شود. به عبارت آکادمیک، هر نمونه از `greetStudent(..)` بر متغیرهای بیرونی `students` و `studentID` *close over* می‌کند.

پس آن closureها اینجا چه می‌کنند، به معنای ملموس و قابل مشاهده؟

Closure به `greetStudent(..)` اجازه می‌دهد حتی بعد از اتمام scope بیرونی (وقتی هر فراخوانی `lookupStudent(..)` کامل می‌شود) به آن متغیرهای بیرونی دسترسی داشته باشد. به جای اینکه نمونه‌های `students` و `studentID` GC شوند، در حافظه می‌مانند. در زمان بعدی وقتی هر نمونه از تابع `greetStudent(..)` فراخوانی می‌شود، آن متغیرها هنوز آنجا هستند، مقادیر فعلیشان را نگه می‌دارند.

اگر توابع JS closure نداشتند، اتمام هر فراخوانی `lookupStudent(..)` بلافاصله scopeاش را خراب می‌کرد و متغیرهای `students` و `studentID` را GC می‌کرد. وقتی بعداً یکی از توابع `greetStudent(..)` را فراخوانی می‌کردیم، چه اتفاقی می‌افتاد؟

اگر `greetStudent(..)` سعی می‌کرد به آنچه فکر می‌کرد یک مهره BLUE(2) است دسترسی پیدا کند، اما آن مهره واقعاً وجود نداشت (دیگر)، فرض معقول این است که باید `ReferenceError` بگیریم، درست؟

اما خطا نمی‌گیریم. این واقعیت که اجرای `chosenStudents[0]("Hello")` کار می‌کند و پیام «Hello, Sarah!» را برمی‌گرداند یعنی هنوز توانست به متغیرهای `students` و `studentID` دسترسی پیدا کند. این مشاهده مستقیم closure است!

### Closure هدف‌دار

در واقع، جزئی کوچک در بحث قبلی نادیده گرفتیم که حدس می‌زنم بسیاری خوانندگان از دست دادند!

به خاطر نحوه مختصر نحو توابع arrow `=>`، به راحتی فراموش می‌شود که آن‌ها هنوز scope ایجاد می‌کنند (همان‌طور که در «Arrow Functions» فصل ۳ گفته شد). تابع arrow `student => student.id == studentID` scope حبابی دیگری داخل scope تابع `greetStudent(..)` ایجاد می‌کند.

با بنا کردن بر استعاره سطل‌ها و حباب‌های رنگی از فصل ۲، اگر نمودار رنگی برای این کد می‌ساختیم، scope چهارمی در این سطح تو در توترین وجود دارد، پس به رنگ چهارمی نیاز داریم؛ شاید ORANGE(4) را برای آن scope انتخاب می‌کردیم:

```js
var student = students.find(
    student =>
        // function scope: ORANGE(4)
        student.id == studentID
);
```

ارجاع BLUE(2) به `studentID` در واقع داخل scope ORANGE(4) است نه scope GREEN(3) مربوط به `greetStudent(..)`؛ همچنین پارامتر `student` تابع arrow در ORANGE(4) است، که `student` GREEN(3) را shadow می‌کند.

نتیجه این است که این تابع arrow که به عنوان callback به متد `find(..)` آرایه فرستاده شده باید closure روی `studentID` نگه دارد، نه `greetStudent(..)` آن closure را نگه دارد. خیلی مهم نیست، چون همه چیز همچنان همان‌طور که انتظار می‌رود کار می‌کند. فقط مهم است که این واقعیت را نادیده نگیریم که حتی توابع arrow کوچک هم می‌توانند در مهمانی closure شرکت کنند.

### جمع کردن Closureها

یکی از مثال‌های متعارف اغلب ذکرشده برای closure را بررسی کنیم:

```js
function adder(num1) {
    return function addTo(num2){
        return num1 + num2;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15);    // 25
add42To(9);     // 51
```

هر نمونه از تابع درونی `addTo(..)` بر متغیر `num1` خودش (با مقادیر `10` و `42` به ترتیب) close over می‌کند، پس آن `num1`ها صرفاً به خاطر اتمام `adder(..)` از بین نمی‌روند. وقتی بعداً یکی از نمونه‌های `addTo(..)` درونی را فراخوانی می‌کنیم، مثل فراخوانی `add10To(15)`، متغیر close-over شده `num1` هنوز وجود دارد و مقدار اصلی `10` را نگه می‌دارد. عملیات بنابراین می‌تواند `10 + 15` را انجام دهد و جواب `25` را برگرداند.

یک جزئی مهم ممکن است در پاراگراف قبلی خیلی راحت نادیده گرفته شده باشد، پس تقویتش می‌کنیم: closure با نمونه یک تابع مرتبط است، نه تعریف lexical واحدش. در قطعه قبلی، فقط یک تابع درونی `addTo(..)` داخل `adder(..)` تعریف شده، پس به نظر می‌رسد که یک closure واحد را دلالت کند.

اما در واقع، هر بار تابع بیرونی `adder(..)` اجرا می‌شود، نمونه *جدید* تابع درونی `addTo(..)` ایجاد می‌شود، و برای هر نمونه جدید، یک closure جدید. پس هر نمونه تابع درونی (با برچسب `add10To(..)` و `add42To(..)` در برنامه‌مان) closure خودش را بر نمونه خودش از محیط scope از آن اجرای `adder(..)` دارد.

حتی با اینکه closure بر lexical scope مبتنی است، که در زمان کامپایل انجام می‌شود، closure به عنوان ویژگی runtime نمونه‌های تابع مشاهده می‌شود.

### لینک زنده، نه اسنپ‌شات

در هر دو مثال از بخش‌های قبلی، **مقدار را از یک متغیر خواندیم** که در closure نگه داشته شده بود. این باعث می‌شود احساس کنیم closure شاید اسنپ‌شاتی از یک مقدار در لحظه‌ای معین باشد. در واقع، این سوءتفاهم رایجی است.

Closure در واقع یک لینک زنده است، دسترسی به خود متغیر کامل را حفظ می‌کند. فقط به خواندن مقدار محدود نیستیم؛ متغیر close-over شده را می‌توان به‌روزرسانی (انتساب مجدد) هم کرد! با close over کردن یک متغیر در یک تابع، می‌توانیم تا زمانی که آن ارجاع تابع در برنامه وجود دارد از آن متغیر استفاده کنیم (خواندن و نوشتن)، و از هر کجا که بخواهیم آن تابع را فراخوانی کنیم. به همین دلیل closure تکنیک قدرتمندی است که به‌طور گسترده در بسیاری حوزه‌های برنامه‌نویسی استفاده می‌شود!

شکل ۴ نمونه‌های تابع و لینک‌های scope را نشان می‌دهد:

<figure>
    <img src="images/fig4.png" width="400" alt="Function instances linked to scopes via closure" align="center">
    <figcaption><em>شکل ۴: تجسم Closureها</em></figcaption>
    <br><br>
</figure>

همان‌طور که در شکل ۴ نشان داده شده، هر فراخوانی `adder(..)` یک scope BLUE(2) جدید حاوی متغیر `num1` ایجاد می‌کند، و همچنین نمونه‌ای از تابع `addTo(..)` به عنوان scope GREEN(3). توجه کنید که نمونه‌های تابع (`addTo10(..)` و `addTo42(..)`) در scope RED(1) حضور دارند و از آنجا فراخوانی می‌شوند.

حالا مثالی را بررسی کنیم که متغیر close-over شده به‌روزرسانی می‌شود:

```js
function makeCounter() {
    var count = 0;

    return function getCurrent() {
        count = count + 1;
        return count;
    };
}

var hits = makeCounter();

// later

hits();     // 1

// later

hits();     // 2
hits();     // 3
```

متغیر `count` توسط تابع درونی `getCurrent()` close over می‌شود، که آن را نگه می‌دارد به جای اینکه در معرض GC قرار گیرد. فراخوانی‌های تابع `hits()` به این متغیر دسترسی پیدا می‌کنند *و* آن را به‌روزرسانی می‌کنند، هر بار شمارش فزاینده برمی‌گردانند.

هرچند scope احاطه‌کننده یک closure معمولاً از یک تابع است، در واقع لازم نیست؛ فقط باید یک تابع درونی داخل یک scope بیرونی وجود داشته باشد:

```js
var hits;
{   // an outer scope (but not a function)
    let count = 0;
    hits = function getCurrent(){
        count = count + 1;
        return count;
    };
}
hits();     // 1
hits();     // 2
hits();     // 3
```

| نکته: |
| :--- |
| عمداً `getCurrent()` را به عنوان function expression به جای function declaration تعریف کردم. این مربوط به closure نیست، بلکه به quirks خطرناک FiB (فصل ۶) است. |

چون اشتباه گرفتن closure به عنوان value-oriented به جای variable-oriented خیلی رایج است، توسعه‌دهندگان گاهی سعی می‌کنند از closure برای snapshot-preserve کردن مقداری از لحظه‌ای در زمان استفاده کنند و گیر می‌کنند. در نظر بگیرید:

```js
var studentName = "Frank";

var greeting = function hello() {
    // we are closing over `studentName`,
    // not "Frank"
    console.log(
        `Hello, ${ studentName }!`
    );
}

// later

studentName = "Suzy";

// later

greeting();
// Hello, Suzy!
```

با تعریف `greeting()` (یعنی `hello()`) وقتی `studentName` مقدار `"Frank"` را نگه می‌داشت (قبل از انتساب مجدد به `"Suzy"`)، فرض اشتباه اغلب این است که closure `"Frank"` را capture می‌کند. اما `greeting()` بر متغیر `studentName` close over است، نه مقدارش. هر وقت `greeting()` فراخوانی شود، مقدار فعلی متغیر (`"Suzy"` در این مورد) منعکس می‌شود.

تصویر کلاسیک این اشتباه تعریف توابع داخل حلقه است:

```js
var keeps = [];

for (var i = 0; i < 3; i++) {
    keeps[i] = function keepI(){
        // closure over `i`
        return i;
    };
}

keeps[0]();   // 3 -- WHY!?
keeps[1]();   // 3
keeps[2]();   // 3
```

| نکته: |
| :--- |
| این نوع تصویر closure معمولاً از `setTimeout(..)` یا callback دیگری مثل event handler داخل حلقه استفاده می‌کند. مثال را با ذخیره ارجاع‌های تابع در آرایه ساده کردم تا نیازی به در نظر گرفتن زمان‌بندی ناهمزمان در تحلیل نباشد. اصل closure همان است، صرف نظر. |

ممکن است انتظار داشتید فراخوانی `keeps[0]()` مقدار `0` برگرداند، چون آن تابع در تکرار اول حلقه وقتی `i` برابر `0` بود ایجاد شد. اما دوباره، آن فرض از فکر کردن به closure به عنوان value-oriented به جای variable-oriented ناشی می‌شود.

چیزی در ساختار حلقه `for` می‌تواند ما را فریب دهد که فکر کنیم هر تکرار متغیر `i` جدید خودش را می‌گیرد؛ در واقع این برنامه فقط یک `i` دارد چون با `var` اعلان شده.

هر تابع ذخیره‌شده `3` برمی‌گرداند، چون تا پایان حلقه، متغیر واحد `i` در برنامه مقدار `3` انتساب داده شده. هر سه تابع در آرایه `keeps` closureهای جداگانه دارند، اما همه بر همان متغیر مشترک `i` close over هستند.

البته، یک متغیر واحد در هر لحظه فقط می‌تواند یک مقدار نگه دارد. پس اگر می‌خواهید چند مقدار حفظ کنید، به متغیر متفاوتی برای هر کدام نیاز دارید.

چطور می‌توانستیم در قطعه حلقه این کار را بکنیم؟ بیایید متغیر جدیدی برای هر تکرار ایجاد کنیم:

```js
var keeps = [];

for (var i = 0; i < 3; i++) {
    // new `j` created each iteration, which gets
    // a copy of the value of `i` at this moment
    let j = i;

    // the `i` here isn't being closed over, so
    // it's fine to immediately use its current
    // value in each loop iteration
    keeps[i] = function keepEachJ(){
        // close over `j`, not `i`!
        return j;
    };
}
keeps[0]();   // 0
keeps[1]();   // 1
keeps[2]();   // 2
```

هر تابع اکنون بر متغیر جداگانه (جدید) از هر تکرار close over است، حتی با اینکه همه آن‌ها `j` نام دارند. و هر `j` کپی مقدار `i` در آن نقطه از تکرار حلقه را می‌گیرد؛ آن `j` هرگز انتساب مجدد نمی‌شود. پس هر سه تابع اکنون مقادیر مورد انتظار را برمی‌گردانند: `0`، `1` و `2`!

دوباره به یاد داشته باشید، حتی اگر در این برنامه asynchrony داشتیم، مثل فرستادن هر تابع درونی `keepEachJ()` به `setTimeout(..)` یا اشتراک event handler، همان نوع رفتار closure همچنان مشاهده می‌شد.

بخش «Loops» در فصل ۵ را به یاد بیاورید، که نشان می‌دهد اعلان `let` در حلقه `for` در واقع نه فقط یک متغیر برای حلقه، بلکه متغیر جدیدی برای *هر تکرار* حلقه ایجاد می‌کند. آن ترفند/quirk دقیقاً همان چیزی است که برای closureهای حلقه‌مان نیاز داریم:

```js
var keeps = [];

for (let i = 0; i < 3; i++) {
    // the `let i` gives us a new `i` for
    // each iteration, automatically!
    keeps[i] = function keepEachI(){
        return i;
    };
}
keeps[0]();   // 0
keeps[1]();   // 1
keeps[2]();   // 2
```

چون از `let` استفاده می‌کنیم، سه `i` ایجاد می‌شوند، یکی برای هر حلقه، پس هر سه closure *فقط درست* کار می‌کنند.

### Closureهای رایج: Ajax و Eventها

Closure بیشتر با callbackها مواجه می‌شود:

```js
function lookupStudentRecord(studentID) {
    ajax(
        `https://some.api/student/${ studentID }`,
        function onRecord(record) {
            console.log(
                `${ record.name } (${ studentID })`
            );
        }
    );
}

lookupStudentRecord(114);
// Frank (114)
```

Callback `onRecord(..)` در نقطه‌ای در آینده فراخوانی می‌شود، بعد از برگشت پاسخ فراخوانی Ajax. این فراخوانی از درون ابزار `ajax(..)` اتفاق می‌افتد، هر کجا که باشد. علاوه بر این، وقتی اتفاق می‌افتد، فراخوانی `lookupStudentRecord(..)` مدتهاست کامل شده.

پس چرا `studentID` هنوز آنجاست و برای callback قابل دسترسی است؟ Closure.

Event handlerها استفاده رایج دیگر closure هستند:

```js
function listenForClicks(btn,label) {
    btn.addEventListener("click",function onClick(){
        console.log(
            `The ${ label } button was clicked!`
        );
    });
}

var submitBtn = document.getElementById("submit-btn");

listenForClicks(submitBtn,"Checkout");
```

پارامتر `label` توسط callback event handler `onClick(..)` close over می‌شود. وقتی دکمه کلیک می‌شود، `label` هنوز برای استفاده وجود دارد. این closure است.

### اگر نتوانم ببینمش چطور؟

احتمالاً این ضرب‌المثل رایج را شنیده‌اید:

> اگر درختی در جنگل بیفتد اما کسی اطراف نباشد که بشنود، صدا می‌دهد؟

یک ژیمناستیک فلسفی احمقانه است. البته از نظر علمی امواج صوتی ایجاد می‌شوند. اما نکته واقعی: *آیا مهم است* اگر صدا اتفاق بیفتد؟

به یاد داشته باشید، تأکید در تعریف ما از closure قابلیت مشاهده است. اگر closure وجود دارد (به معنای فنی، پیاده‌سازی، یا آکادمیک) اما نمی‌توان در برنامه‌هایمان مشاهده‌اش کرد، *آیا مهم است؟* نه.

برای تقویت این نکته، به چند مثال که *بر اساس* closure قابل مشاهده نیستند نگاه کنیم.

مثلاً، فراخوانی تابعی که از جستجوی lexical scope استفاده می‌کند:

```js
function say(myName) {
    var greeting = "Hello";
    output();

    function output() {
        console.log(
            `${ greeting }, ${ myName }!`
        );
    }
}

say("Kyle");
// Hello, Kyle!
```

تابع درونی `output()` به متغیرهای `greeting` و `myName` از scope احاطه‌کننده‌اش دسترسی دارد. اما فراخوانی `output()` در همان scope اتفاق می‌افتد، جایی که البته `greeting` و `myName` هنوز در دسترسند؛ آن فقط lexical scope است، نه closure.

هر زبان lexical scoped که توابعش closure پشتیبانی نمی‌کردند همچنان همین‌طور رفتار می‌کرد.

در واقع، متغیرهای scope سراسری اساساً نمی‌توانند (قابل مشاهده) close over شوند، چون همیشه از همه جا قابل دسترسی‌اند. هیچ تابعی هرگز در هیچ بخشی از scope chain که نواده scope سراسری نباشد فراخوانی نمی‌شود.

در نظر بگیرید:

```js
var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" }
];

function getFirstStudent() {
    return function firstStudent(){
        return students[0].name;
    };
}

var student = getFirstStudent();

student();
// Kyle
```

تابع درونی `firstStudent()` به `students` ارجاع می‌دهد، که متغیری بیرون از scope خودش است. اما چون `students` اتفاقاً از scope سراسری است، هر کجا آن تابع در برنامه فراخوانی شود، توانایی دسترسی به `students` چیزی فراتر از lexical scope عادی نیست.

همه فراخوانی‌های تابع می‌توانند به متغیرهای سراسری دسترسی داشته باشند، صرف نظر از اینکه زبان closure پشتیبانی کند یا نه. متغیرهای سراسری نیازی به close over شدن ندارند.

متغیرهایی که صرفاً حضور دارند اما هرگز دسترسی نمی‌شوند closure ایجاد نمی‌کنند:

```js
function lookupStudent(studentID) {
    return function nobody(){
        var msg = "Nobody's here yet.";
        console.log(msg);
    };
}

var student = lookupStudent(112);

student();
// Nobody's here yet.
```

تابع درونی `nobody()` بر هیچ متغیر بیرونی close over نیست—فقط از متغیر خودش `msg` استفاده می‌کند. حتی با اینکه `studentID` در scope احاطه‌کننده حضور دارد، `nobody()` به `studentID` ارجاع نمی‌دهد. موتور JS نیازی به نگه داشتن `studentID` بعد از اتمام اجرای `lookupStudent(..)` ندارد، پس GC می‌خواهد آن حافظه را پاک کند!

چه توابع JS closure پشتیبانی کنند یا نه، این برنامه همان‌طور رفتار می‌کند. پس هیچ closure مشاهده‌شده‌ای اینجا نیست.

اگر فراخوانی تابع نباشد، closure قابل مشاهده نیست:

```js
function greetStudent(studentName) {
    return function greeting(){
        console.log(
            `Hello, ${ studentName }!`
        );
    };
}

greetStudent("Kyle");

// nothing else happens
```

این یکی حیله‌ای است، چون تابع بیرونی قطعاً فراخوانی می‌شود. اما تابع درونی آن است که *می‌توانست* closure داشته باشد، و با این حال هرگز فراخوانی نمی‌شود؛ تابع برگشتی اینجا فقط دور انداخته می‌شود. پس حتی اگر از نظر فنی موتور JS برای لحظه کوتاهی closure ایجاد کرد، به هیچ روش معناداری در این برنامه مشاهده نشد.

شاید درختی افتاده... اما نشنیدیم، پس مهم نیست.

### تعریف قابل مشاهده

اکنون آماده تعریف closure هستیم:

> Closure زمانی مشاهده می‌شود که تابعی از متغیر(های) scope(های) بیرونی استفاده کند حتی در حین اجرا در scopeای که آن متغیر(ها) در آن قابل دسترسی نباشند.

اجزای کلیدی این تعریف:

* باید تابعی درگیر باشد

* باید حداقل به یک متغیر از scope بیرونی ارجاع دهد

* باید در شاخه متفاوتی از scope chain از متغیر(ها) فراخوانی شود

این تعریف مبتنی بر مشاهده یعنی نباید closure را به عنوان اطلاعات غیرمستقیم و آکادمیک نادیده بگیریم. به جای آن، باید به دنبال اثرات مستقیم و ملموسی باشیم که closure بر رفتار برنامه‌مان دارد.
