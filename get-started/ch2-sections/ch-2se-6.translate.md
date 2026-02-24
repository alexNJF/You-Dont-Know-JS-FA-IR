# چطور در جاوااسکریپت سازماندهی می‌کنیم

دو الگوی اصلی برای سازماندهی کد (داده و رفتار) به‌طور گسترده در اکوسیستم جاوااسکریپت استفاده می‌شود: classها و moduleها. این الگوها مانعه‌الجمع نیستند؛ بسیاری برنامه‌ها می‌توانند و هر دو را استفاده می‌کنند. برنامه‌های دیگر فقط به یک الگو پایبند می‌مانند، یا حتی هیچ‌کدام!

از برخی جهات، این الگوها بسیار متفاوت‌اند. اما جالبه، از جهات دیگر، فقط وجوه مختلف همان سکه هستند. مهارت در جاوااسکریپت نیاز به درک هر دو الگو و جای مناسب (و نامناسب!) آن‌ها دارد.

## کلاس‌ها

اصطلاحات «object-oriented»، «class-oriented» و «classes» همه پر از جزئیات و ظرافت هستند؛ تعریف جهانی ندارند.

اینجا از تعریف رایج و تا حدی سنتی استفاده می‌کنیم، که احتمالاً برای کسانی با پیشینهٔ زبان‌های «object-oriented» مثل C++ و Java آشناست.

یک class در برنامه تعریف یک «نوع» ساختار دادهٔ سفارشی است که هم داده و هم رفتارهای کار روی آن داده را شامل می‌شود. classها نحوهٔ کار چنین ساختار داده‌ای را تعریف می‌کنند، اما classها خودشان مقادیر concrete نیستند. برای گرفتن مقدار concrete که می‌توانید در برنامه استفاده کنید، یک class باید یک یا چند بار *instantiate* شود (با کلمهٔ کلیدی `new`).

در نظر بگیرید:

```js
class Page {
    constructor(text) {
        this.text = text;
    }

    print() {
        console.log(this.text);
    }
}

class Notebook {
    constructor() {
        this.pages = [];
    }

    addPage(text) {
        var page = new Page(text);
        this.pages.push(page);
    }

    print() {
        for (let page of this.pages) {
            page.print();
        }
    }
}

var mathNotes = new Notebook();
mathNotes.addPage("Arithmetic: + - * / ...");
mathNotes.addPage("Trigonometry: sin cos tan ...");

mathNotes.print();
// ..
```

در class `Page`، داده رشتهٔ متنی است که در property عضو `this.text` ذخیره شده. رفتار `print()` است، متدی که متن را به console می‌ریزد.

برای class `Notebook`، داده آرایه‌ای از instanceهای `Page` است. رفتار `addPage(..)` است، متدی که صفحه‌های جدید `Page` را instantiate می‌کند و به لیست اضافه می‌کند، و همچنین `print()` (که همهٔ صفحه‌های دفترچه را چاپ می‌کند).

دستور `mathNotes = new Notebook()` instanceای از class `Notebook` ایجاد می‌کند، و `page = new Page(text)` جایی است که instanceهای class `Page` ایجاد می‌شوند.

رفتار (متدها) فقط روی instanceها (نه خود classها) قابل فراخوانی است، مثل `mathNotes.addPage(..)` و `page.print()`.

مکانیزم `class` اجازهٔ بسته‌بندی داده (`text` و `pages`) برای سازماندهی با رفتارهایشان (مثلاً `addPage(..)` و `print()`) را می‌دهد. همان برنامه می‌توانست بدون هیچ تعریف `class` ساخته شود، اما احتمالاً بسیار کمتر منظم، سخت‌تر برای خواندن و استدلال، و مستعدتر به باگ و نگهداری ضعیف می‌بود.

### وراثت کلاس

جنبهٔ ذاتی دیگر طراحی سنتی «class-oriented»، هرچند کمی کمتر رایج در جاوااسکریپت، «inheritance» (و «polymorphism») است. در نظر بگیرید:

```js
class Publication {
    constructor(title,author,pubDate) {
        this.title = title;
        this.author = author;
        this.pubDate = pubDate;
    }

    print() {
        console.log(`
            Title: ${ this.title }
            By: ${ this.author }
            ${ this.pubDate }
        `);
    }
}
```

این class `Publication` مجموعه‌ای از رفتار مشترک را تعریف می‌کند که هر publication ممکن است نیاز داشته باشد.

حالا انواع خاص‌تر publication مثل `Book` و `BlogPost` را در نظر بگیرید:

```js
class Book extends Publication {
    constructor(bookDetails) {
        super(
            bookDetails.title,
            bookDetails.author,
            bookDetails.pubDate
        );
        this.publisher = bookDetails.publisher;
        this.ISBN = bookDetails.ISBN;
    }

    print() {
        super.print();
        console.log(`
            Publisher: ${ this.publisher }
            ISBN: ${ this.ISBN }
        `);
    }
}

class BlogPost extends Publication {
    constructor(title,author,pubDate,URL) {
        super(title,author,pubDate);
        this.URL = URL;
    }

    print() {
        super.print();
        console.log(this.URL);
    }
}
```

هر دو `Book` و `BlogPost` از clause `extends` برای *گسترش* تعریف کلی `Publication` برای شامل کردن رفتار اضافی استفاده می‌کنند. فراخوانی `super(..)` در هر constructor به constructor class والد `Publication` برای کار مقداردهی اولیه‌اش delegate می‌کند، و سپس کارهای خاص‌تر طبق نوع publication مربوطشان (با نام مستعار «sub-class» یا «child class») انجام می‌دهند.

حالا استفاده از این child classها را در نظر بگیرید:

```js
var YDKJS = new Book({
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    pubDate: "June 2014",
    publisher: "O'Reilly",
    ISBN: "123456-789"
});

YDKJS.print();
// Title: You Don't Know JS
// By: Kyle Simpson
// June 2014
// Publisher: O'Reilly
// ISBN: 123456-789

var forAgainstLet = new BlogPost(
    "For and against let",
    "Kyle Simpson",
    "October 27, 2014",
    "https://davidwalsh.name/for-and-against-let"
);

forAgainstLet.print();
// Title: For and against let
// By: Kyle Simpson
// October 27, 2014
// https://davidwalsh.name/for-and-against-let
```

توجه کنید هر دو instance child class متد `print()` دارند، که override متد `print()` *به‌ارث‌برده* از class والد `Publication` بود. هر کدام از آن متدهای `print()` child class override شده `super.print()` را فراخوانی می‌کنند تا نسخهٔ به‌ارث‌بردهٔ متد `print()` را فراخوانی کنند.

واقعیت اینکه هر دو متد به‌ارث‌برده و override شده می‌توانند همان نام را داشته باشند و هم‌زیستی کنند *polymorphism* نامیده می‌شود.

وراثت ابزار قدرتمندی برای سازماندهی داده/رفتار در واحدهای منطقی جدا (classها) است، اما اجازه به child class برای همکاری با والد با دسترسی/استفاده از رفتار و دادهٔ آن.

## ماژول‌ها

الگوی ماژول اساساً همان هدف الگوی class را دارد، که گروه‌بندی داده و رفتار در واحدهای منطقی است. همچنین مثل classها، ماژول‌ها می‌توانند داده و رفتار ماژول‌های دیگر را «include» یا «دسترسی» کنند، برای همکاری.

اما ماژول‌ها تفاوت‌های مهمی با classها دارند. قابل‌توجه‌ترین، نحو کاملاً متفاوت است.

### ماژول‌های کلاسیک

ES6 شکل نحو ماژول را به نحو بومی جاوااسکریپت اضافه کرد، که لحظه‌ای بعد می‌بینیم. اما از روزهای اولیهٔ جاوااسکریپت، ماژول‌ها الگوی مهم و رایجی بودند که در برنامه‌های بی‌شمار جاوااسکریپت استفاده می‌شدند، حتی بدون نحو اختصاصی.

ویژگی‌های کلیدی یک *ماژول کلاسیک* تابع بیرونی (که حداقل یک بار اجرا می‌شود) است، که «instance» ماژول را با یک یا چند تابع در معرض برمی‌گرداند که می‌توانند روی دادهٔ داخلی (پنهان) instance ماژول کار کنند.

چون ماژول این شکل *فقط یک تابع* است، و فراخوانی آن «instance» ماژول تولید می‌کند، توصیف دیگر این توابع «module factories» است.

شکل ماژول کلاسیک classهای قبلی `Publication`، `Book` و `BlogPost` را در نظر بگیرید:

```js
function Publication(title,author,pubDate) {
    var publicAPI = {
        print() {
            console.log(`
                Title: ${ title }
                By: ${ author }
                ${ pubDate }
            `);
        }
    };

    return publicAPI;
}

function Book(bookDetails) {
    var pub = Publication(
        bookDetails.title,
        bookDetails.author,
        bookDetails.publishedOn
    );

    var publicAPI = {
        print() {
            pub.print();
            console.log(`
                Publisher: ${ bookDetails.publisher }
                ISBN: ${ bookDetails.ISBN }
            `);
        }
    };

    return publicAPI;
}

function BlogPost(title,author,pubDate,URL) {
    var pub = Publication(title,author,pubDate);

    var publicAPI = {
        print() {
            pub.print();
            console.log(URL);
        }
    };

    return publicAPI;
}
```

مقایسهٔ این شکل‌ها با شکل‌های `class`، شباهت‌ها بیشتر از تفاوت‌هاست.

شکل `class` متدها و داده را روی instance object ذخیره می‌کند، که باید با پیشوند `this.` دسترسی شود. با ماژول‌ها، متدها و داده به‌عنوان متغیرهای identifier در scope دسترسی می‌شوند، بدون هیچ پیشوند `this.`.

با `class`، «API» یک instance در تعریف class ضمنی است—همچنین، همهٔ داده و متدها عمومی هستند. با تابع factory ماژول، صریحاً objectی با هر متد در معرض عمومی ایجاد و برمی‌گردانید، و هر داده یا متد unreferenced دیگر داخل تابع factory خصوصی می‌ماند.

تنوعات دیگری به این شکل تابع factory وجود دارد که در جاوااسکریپت کاملاً رایج است، حتی در ۲۰۲۰؛ ممکن است این شکل‌ها را در برنامه‌های جاوااسکریپت مختلف ببینید: AMD (Asynchronous Module Definition)، UMD (Universal Module Definition)، و CommonJS (ماژول‌های سبک کلاسیک Node.js). تنوعات جزئی است (نه کاملاً سازگار). با این حال، همهٔ این شکل‌ها به همان اصول پایه تکیه می‌کنند.

همچنین استفاده (با نام مستعار «instantiation») این توابع factory ماژول را در نظر بگیرید:

```js
var YDKJS = Book({
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    publishedOn: "June 2014",
    publisher: "O'Reilly",
    ISBN: "123456-789"
});

YDKJS.print();
// Title: You Don't Know JS
// By: Kyle Simpson
// June 2014
// Publisher: O'Reilly
// ISBN: 123456-789

var forAgainstLet = BlogPost(
    "For and against let",
    "Kyle Simpson",
    "October 27, 2014",
    "https://davidwalsh.name/for-and-against-let"
);

forAgainstLet.print();
// Title: For and against let
// By: Kyle Simpson
// October 27, 2014
// https://davidwalsh.name/for-and-against-let
```

تنها تفاوت قابل‌مشاهده اینجا عدم استفاده از `new` است، فراخوانی factoryهای ماژول مثل توابع معمولی.

### ماژول‌های ES

ماژول‌های ES (ESM)، که در ES6 به زبان جاوااسکریپت معرفی شدند، قرار است همان روح و هدف *ماژول‌های کلاسیک* موجود توصیف‌شده را داشته باشند، به‌ویژه با در نظر گرفتن تنوعات و use caseهای مهم از AMD، UMD و CommonJS.

رویکرد پیاده‌سازی، با این حال، به‌طور قابل‌توجهی متفاوت است.

اول، تابع wrapper برای *تعریف* ماژول وجود ندارد. context wrapper یک فایل است. ESMها همیشه مبتنی بر فایل هستند؛ یک فایل، یک ماژول.

دوم، با «API» ماژول صریحاً تعامل نمی‌کنید، بلکه از کلمهٔ کلیدی `export` برای افزودن متغیر یا متد به تعریف API عمومی آن استفاده می‌کنید. اگر چیزی در ماژول تعریف شده اما `export` نشده، پنهان می‌ماند (درست مثل *ماژول‌های کلاسیک*).

سوم، و شاید قابل‌توجه‌ترین تفاوت با الگوهای قبلی بحث‌شده، ماژول ES را «instantiate» نمی‌کنید، فقط آن را `import` می‌کنید تا instance واحدش را استفاده کنید. ESMها در عمل «singleton» هستند، به این معنا که فقط یک instance هرگز ایجاد می‌شود، در اولین `import` در برنامه‌تان، و همهٔ `import`های دیگر فقط ارجاع به همان instance واحد را دریافت می‌کنند. اگر ماژول شما نیاز به پشتیبانی چند instantiation دارد، باید تابع factory به سبک *ماژول کلاسیک* روی تعریف ESM خود برای آن منظور ارائه دهید.

در مثال در حال اجرای ما، چند-instantiation را فرض می‌کنیم، پس این تکه‌های بعدی هر دو ESM و *ماژول‌های کلاسیک* را ترکیب می‌کنند.

فایل `publication.js` را در نظر بگیرید:

```js
function printDetails(title,author,pubDate) {
    console.log(`
        Title: ${ title }
        By: ${ author }
        ${ pubDate }
    `);
}

export function create(title,author,pubDate) {
    var publicAPI = {
        print() {
            printDetails(title,author,pubDate);
        }
    };

    return publicAPI;
}
```

برای import و استفاده از این ماژول، از ماژول ES دیگر مثل `blogpost.js`:

```js
import { create as createPub } from "publication.js";

function printDetails(pub,URL) {
    pub.print();
    console.log(URL);
}

export function create(title,author,pubDate,URL) {
    var pub = createPub(title,author,pubDate);

    var publicAPI = {
        print() {
            printDetails(pub,URL);
        }
    };

    return publicAPI;
}
```

و در نهایت، برای استفاده از این ماژول، به ماژول ES دیگر مثل `main.js` import می‌کنیم:

```js
import { create as newBlogPost } from "blogpost.js";

var forAgainstLet = newBlogPost(
    "For and against let",
    "Kyle Simpson",
    "October 27, 2014",
    "https://davidwalsh.name/for-and-against-let"
);

forAgainstLet.print();
// Title: For and against let
// By: Kyle Simpson
// October 27, 2014
// https://davidwalsh.name/for-and-against-let
```

| نکته: |
| :--- |
| clause `as newBlogPost` در دستور `import` اختیاری است؛ اگر حذف شود، تابع سطح بالا فقط با نام `create(..)` import می‌شود. در این مورد، برای خوانایی آن را تغییر نام می‌دهم؛ نام factory عمومی‌ترش `create(..)` به `newBlogPost(..)` از نظر معنایی توصیفی‌تر از هدفش می‌شود. |

همان‌طور که نشان داده شد، ماژول‌های ES می‌توانند در صورت نیاز به پشتیبانی چند-instantiation از *ماژول‌های کلاسیک* داخلی استفاده کنند. به‌طور جایگزین، می‌توانستیم به‌جای تابع factory `create(..)` یک `class` از ماژولمان در معرض بگذاریم، با نتیجهٔ کلی مشابه. با این حال، چون در آن مرحله از ESM استفاده می‌کنید، توصیه می‌کنم به *ماژول‌های کلاسیک* پایبند بمانید به‌جای `class`.

اگر ماژول شما فقط به یک instance نیاز دارد، می‌توانید از لایه‌های اضافی پیچیدگی صرف‌نظر کنید: متدهای عمومی را مستقیماً `export` کنید.
