# چرخهٔ حیات Closure و Garbage Collection (GC)

چون closure ذاتاً به نمونه تابع وابسته است، closure آن بر یک متغیر تا زمانی که هنوز ارجاعی به آن تابع وجود دارد ادامه می‌یابد.

اگر ده تابع همگی بر همان متغیر close over کنند، و با گذشت زمان نه تا از این ارجاع‌های تابع دور انداخته شوند، ارجاع تابع تنها باقی‌مانده همچنان آن متغیر را حفظ می‌کند. وقتی آن ارجاع تابع نهایی دور انداخته شود، آخرین closure بر آن متغیر از بین می‌رود، و خود متغیر GC می‌شود.

این تأثیر مهمی بر ساخت برنامه‌های کارآمد و پرکاربرد دارد. Closure می‌تواند به طور غیرمنتظره GC متغیری را که در غیر این صورت با آن کارتان تمام شده جلوگیری کند، که به استفاده فرار حافظه در طول زمان منجر می‌شود. به همین دلیل مهم است ارجاع‌های تابع (و در نتیجه closureهایشان) را وقتی دیگر لازم نیستند دور بیندازیم.

در نظر بگیرید:

```js
function manageBtnClickEvents(btn) {
    var clickHandlers = [];

    return function listener(cb){
        if (cb) {
            let clickHandler =
                function onClick(evt){
                    console.log("clicked!");
                    cb(evt);
                };
            clickHandlers.push(clickHandler);
            btn.addEventListener(
                "click",
                clickHandler
            );
        }
        else {
            // passing no callback unsubscribes
            // all click handlers
            for (let handler of clickHandlers) {
                btn.removeEventListener(
                    "click",
                    handler
                );
            }

            clickHandlers = [];
        }
    };
}

// var mySubmitBtn = ..
var onSubmit = manageBtnClickEvents(mySubmitBtn);

onSubmit(function checkout(evt){
    // handle checkout
});

onSubmit(function trackAction(evt){
    // log action to analytics
});

// later, unsubscribe all handlers:
onSubmit();
```

در این برنامه، تابع درونی `onClick(..)` closure بر `cb` فرستاده‌شده (callback رویداد ارائه‌شده) نگه می‌دارد. یعنی ارجاع‌های function expression مربوط به `checkout()` و `trackAction()` از طریق closure نگه داشته می‌شوند (و نمی‌توانند GC شوند) تا زمانی که این event handlerها subscribe هستند.

وقتی `onSubmit()` را بدون ورودی در خط آخر فراخوانی می‌کنیم، همه event handlerها unsubscribe می‌شوند و آرایه `clickHandlers` خالی می‌شود. وقتی همه ارجاع‌های تابع click handler دور انداخته شدند، closureهای ارجاع `cb` به `checkout()` و `trackAction()` دور انداخته می‌شوند.

وقتی سلامت و کارایی کلی برنامه را در نظر می‌گیریم، unsubscribe کردن یک event handler وقتی دیگر لازم نیست می‌تواند حتی مهم‌تر از subscribe اولیه باشد!

### برای هر متغیر یا برای هر Scope؟

سؤال دیگری که باید حل کنیم: آیا باید closure را فقط به متغیر(های) بیرونی ارجاع‌داده‌شده اعمال کنیم، یا closure کل scope chain را با همه متغیرهایش حفظ می‌کند؟

به عبارت دیگر، در قطعه قبلی اشتراک رویداد، آیا تابع درونی `onClick(..)` فقط بر `cb` close over است، یا بر `clickHandler`، `clickHandlers` و `btn` هم؟

از نظر مفهومی، closure **برای هر متغیر** است نه *برای هر scope*. Callbackهای Ajax، event handlerها و همه اشکال دیگر closureهای تابع معمولاً فرض می‌شود فقط بر آنچه صریحاً ارجاع می‌دهند close over هستند.

اما واقعیت پیچیده‌تر از آن است.

برنامه دیگری برای در نظر گرفتن:

```js
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    return addGrade;

    // ************************

    function getGrade(record){
        return record.grade;
    }

    function sortAndTrimGradesList() {
        // sort by grades, descending
        grades.sort(function desc(g1,g2){
            return g2 - g1;
        });

        // only keep the top 10 grades
        grades = grades.slice(0,10);
    }

    function addGrade(newGrade) {
        grades.push(newGrade);
        sortAndTrimGradesList();
        return grades;
    }
}

var addNextGrade = manageStudentGrades([
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    // ..many more records..
    { id: 6, name: "Sarah", grade: 91 }
]);

// later

addNextGrade(81);
addNextGrade(68);
// [ .., .., ... ]
```

تابع بیرونی `manageStudentGrades(..)` لیست سوابق دانش‌آموزی می‌گیرد و ارجاع تابع `addGrade(..)` را برمی‌گرداند که ما خارجاً `addNextGrade(..)` نام می‌بریم. هر بار `addNextGrade(..)` را با نمره جدید فراخوانی می‌کنیم، لیست فعلی از ۱۰ نمره برتر را به‌صورت عددی نزولی مرتب می‌گیریم (ببینید `sortAndTrimGradesList()`).

از پایان فراخوانی اصلی `manageStudentGrades(..)` و بین فراخوانی‌های متعدد `addNextGrade(..)`، متغیر `grades` از طریق closure داخل `addGrade(..)` حفظ می‌شود؛ این‌طور لیست در حال اجرای نمرات برتر نگه داشته می‌شود. به یاد داشته باشید، closure بر خود متغیر `grades` است، نه آرایه‌ای که نگه می‌دارد.

این تنها closure درگیر نیست. آیا متغیرهای دیگر close over شده را می‌بینید؟

آیا متوجه شدید که `addGrade(..)` به `sortAndTrimGradesList` ارجاع می‌دهد؟ یعنی بر آن شناسه هم close over است، که اتفاقاً ارجاع به تابع `sortAndTrimGradesList()` را نگه می‌دارد. آن تابع درونی دوم باید بماند تا `addGrade(..)` بتواند به فراخوانی آن ادامه دهد، که یعنی هر متغیری که *آن* close over می‌کند هم می‌ماند—هرچند در این مورد، چیز اضافی آنجا close over نیست.

چه چیز دیگری close over است؟

متغیر `getGrade` (و تابعش) را در نظر بگیرید؛ آیا close over است؟ در scope بیرونی `manageStudentGrades(..)` در فراخوانی `.map(getGrade)` به آن ارجاع داده شده. اما در `addGrade(..)` یا `sortAndTrimGradesList()` به آن ارجاع داده نشده.

در مورد لیست (احتمالاً) بزرگ سوابق دانش‌آموزی که به عنوان `studentRecords` می‌فرستیم چطور؟ آیا آن متغیر close over است؟ اگر باشد، آرایه سوابق دانش‌آموزی هرگز GC نمی‌شود، که به نگه داشتن بیشتر از آنچه فرض می‌کنیم حافظه توسط این برنامه منجر می‌شود. اما اگر دوباره دقیق نگاه کنیم، هیچ یک از توابع درونی به `studentRecords` ارجاع نمی‌دهند.

طبق تعریف *برای هر متغیر* closure، چون `getGrade` و `studentRecords` توسط توابع درونی ارجاع داده *نمی‌شوند*، close over نیستند. باید بلافاصله بعد از اتمام فراخوانی `manageStudentGrades(..)` برای GC آزاد باشند.

در واقع، این کد را در موتور JS اخیر مثل v8 در Chrome اشکال‌زدایی کنید، breakpoint داخل تابع `addGrade(..)` بگذارید. ممکن است متوجه شوید که inspector متغیر `studentRecords` را **لیست نمی‌کند**. این اثبات است، از نظر اشکال‌زدایی به هر حال، که موتور `studentRecords` را از طریق closure نگه نمی‌دارد. پف!

اما چقدر این مشاهده به عنوان اثبات قابل اعتماد است؟ این برنامه (کاملاً ساختگی!) را در نظر بگیرید:

```js
function storeStudentInfo(id,name,grade) {
    return function getInfo(whichValue){
        // warning:
        //   using `eval(..)` is a bad idea!
        var val = eval(whichValue);
        return val;
    };
}

var info = storeStudentInfo(73,"Suzy",87);

info("name");
// Suzy

info("grade");
// 87
```

توجه کنید که تابع درونی `getInfo(..)` صریحاً بر هیچ یک از متغیرهای `id`، `name` یا `grade` close over نیست. و با این حال، فراخوانی‌های `info(..)` به نظر هنوز می‌توانند به متغیرها دسترسی پیدا کنند، هرچند از طریق استفاده از cheat lexical scope `eval(..)` (فصل ۱ را ببینید).

پس همه متغیرها قطعاً از طریق closure حفظ شدند، علیرغم اینکه صریحاً توسط تابع درونی ارجاع داده نشدند. پس آیا این ادعای *برای هر متغیر* را به نفع *برای هر scope* رد می‌کند؟ بستگی دارد.

بسیاری موتورهای JS مدرن *بهینه‌سازی*ای اعمال می‌کنند که هر متغیری از scope closure که صریحاً ارجاع داده نشده حذف می‌کند. با این حال، همان‌طور که با `eval(..)` می‌بینیم، موقعیت‌هایی هست که چنین بهینه‌سازی نمی‌تواند اعمال شود، و scope closure همچنان همه متغیرهای اصلیش را دارد. به عبارت دیگر، closure از نظر پیاده‌سازی باید *برای هر scope* باشد، و بعد یک بهینه‌سازی اختیاری scope را به حداقل آنچه close over شده کم می‌کند (نتیجه مشابه closure *برای هر متغیر*).

حتی تا چند سال پیش، بسیاری موتورهای JS این بهینه‌سازی را اعمال نمی‌کردند؛ ممکن است وب‌سایت‌هایتان هنوز در چنین مرورگرهایی اجرا شوند، به‌ویژه روی دستگاه‌های قدیمی یا پایین‌اند. یعنی ممکن است closureهای طولانی‌عمر مثل event handlerها حافظه را بسیار بیشتر از آنچه فرض می‌کردیم نگه دارند.

و این واقعیت که در اصل یک بهینه‌سازی اختیاری است، نه الزام مشخصات، یعنی نباید به راحتی قابلیت اعمالش را بیش از حد فرض کنیم.

در مواردی که متغیر مقدار بزرگی (مثل object یا آرایه) نگه می‌دارد و آن متغیر در scope closure حضور دارد، اگر دیگر به آن مقدار نیاز ندارید و نمی‌خواهید آن حافظه نگه داشته شود، امن‌تر (استفاده حافظه) است که به صورت دستی مقدار را دور بیندازید تا به بهینه‌سازی/GC closure تکیه کنید.

بیایید *اصلاحی* را در مثال قبلی `manageStudentGrades(..)` اعمال کنیم تا مطمئن شویم آرایه احتمالی بزرگ نگه‌داشته‌شده در `studentRecords` به‌طور غیرضروری در scope closure گرفتار نشود:

```js
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    // unset `studentRecords` to prevent unwanted
    // memory retention in the closure
    studentRecords = null;

    return addGrade;
    // ..
}
```

`studentRecords` را از scope closure حذف نمی‌کنیم؛ آن را نمی‌توانیم کنترل کنیم. اطمینان می‌دهیم که حتی اگر `studentRecords` در scope closure بماند، آن متغیر دیگر به آرایه احتمالی بزرگ داده ارجاع نمی‌دهد؛ آرایه می‌تواند GC شود.

دوباره، در بسیاری موارد JS ممکن است خودکار برنامه را به همان اثر بهینه کند. اما هنوز عادت خوبی است که دقیق باشیم و صریحاً مطمئن شویم که هیچ مقدار قابل توجهی از حافظه دستگاه را بیشتر از لازم نگه نمی‌داریم.

در واقع، در عمل فنی هم دیگر به تابع `getGrade()` بعد از اتمام فراخوانی `.map(getGrade)` نیاز نداریم. اگر پروفایل‌گیری برنامه‌مان نشان می‌داد این ناحیه بحرانی استفاده بیش از حد حافظه است، می‌توانستیم با آزاد کردن آن ارجاع کمی حافظه بیشتر آزاد کنیم تا مقدارش هم نگه داشته نشود. در این مثال اسباب‌بازی احتمالاً غیرضروری است، اما این تکنیک کلی است که به خاطر بسپارید اگر حافظه برنامه را بهینه می‌کنید.

نتیجه‌گیری: مهم است بدانید closureها کجا در برنامه‌هایمان ظاهر می‌شوند و چه متغیرهایی شامل می‌شوند. باید این closureها را با دقت مدیریت کنیم تا فقط آنچه حداقل لازم است نگه داریم و حافظه هدر ندهیم.
