# «کلاس»های Prototypal

در فصل ۳، prototypeها را معرفی کردیم و نشان دادیم چطور می‌توانیم اشیاء را از طریق یک prototype chain لینک کنیم.

راه دیگر برای سیم‌کشی چنین prototype linkageهایی به‌عنوان پیش‌روی (صادقانه، زشت) ظرافت سیستم `class` ES6 (فصل ۲، «Classes» را ببینید) عمل کرد، و «prototypal classes» نامیده می‌شود.

| نکته: |
| :--- |
| هرچند این سبک کد این روزها در جاوااسکریپت کاملاً غیرمعمول است، هنوز به‌طور گیج‌کننده‌ای رایج است که در مصاحبه‌های شغلی دربارهٔ آن سؤال شود! |

ابتدا سبک کدنویسی `Object.create(..)` را به خاطر بیاوریم:

```js
var Classroom = {
    welcome() {
        console.log("Welcome, students!");
    }
};

var mathClass = Object.create(Classroom);

mathClass.welcome();
// Welcome, students!
```

اینجا، object `mathClass` از طریق prototypeش به object `Classroom` لینک شده. از طریق این linkage، فراخوانی تابع `mathClass.welcome()` به متد تعریف‌شده روی `Classroom` delegate می‌شود.

الگوی prototypal class این رفتار delegation را «inheritance» نامیده بود، و به‌طور جایگزین آن را (با همان رفتار) این‌طور تعریف می‌کرد:

```js
function Classroom() {
    // ..
}

Classroom.prototype.welcome = function hello() {
    console.log("Welcome, students!");
};

var mathClass = new Classroom();

mathClass.welcome();
// Welcome, students!
```

همهٔ توابع به‌طور پیش‌فرض به object خالی در property به نام `prototype` ارجاع می‌دهند. علیرغم نام‌گذاری گیج‌کننده، این **نه** *prototype* تابع است (جایی که تابع به آن prototype لینک شده)، بلکه object prototype برای *لینک شدن* وقتی اشیاء دیگر با فراخوانی تابع با `new` ایجاد می‌شوند.

property `welcome` را روی آن object خالی (به نام `Classroom.prototype`) اضافه می‌کنیم، که به تابع `hello()` اشاره می‌کند.

سپس `new Classroom()` object جدیدی ایجاد می‌کند (assign به `mathClass`)، و آن را به object موجود `Classroom.prototype` prototype لینک می‌کند.

هرچند `mathClass` property/تابع `welcome()` ندارد، با موفقیت به تابع `Classroom.prototype.welcome()` delegate می‌کند.

این الگوی «prototypal class» اکنون به شدت توصیه نمی‌شود، به نفع استفاده از مکانیزم `class` ES6:

```js
class Classroom {
    constructor() {
        // ..
    }

    welcome() {
        console.log("Welcome, students!");
    }
}

var mathClass = new Classroom();

mathClass.welcome();
// Welcome, students!
```

زیر کاپوت، همان prototype linkage سیم‌کشی می‌شود، اما این نحو `class` الگوی طراحی class-oriented را بسیار تمیزتر از «prototypal classes» جا می‌دهد.
