# توابع

کلمهٔ «function» معانی متنوعی در برنامه‌نویسی دارد. مثلاً در دنیای Functional Programming، «function» تعریف ریاضی دقیقی دارد و مجموعه‌ای سخت از قوانین را برای پایبندی دلالت می‌کند.

در جاوااسکریپت، باید «function» را با معنای گسترده‌تر اصطلاح مرتبط دیگر در نظر بگیریم: «procedure». procedure مجموعه‌ای از statementهاست که می‌توان یک یا چند بار فراخوانی شود، ممکن است ورودی‌هایی ارائه شود، و ممکن است یک یا چند خروجی برگرداند.

از روزهای اولیهٔ جاوااسکریپت، تعریف تابع این شکلی بود:

```js
function awesomeFunction(coolThings) {
    // ..
    return amazingStuff;
}
```

این function declaration نامیده می‌شود چون به‌عنوان statement به خودی خود ظاهر می‌شود، نه به‌عنوان expression در statement دیگر. ارتباط بین identifier `awesomeFunction` و مقدار تابع در مرحلهٔ compile کد اتفاق می‌افتد، قبل از اجرای آن کد.

در contrast با statement function declaration، function expression می‌تواند این‌طور تعریف و assign شود:

```js
// let awesomeFunction = ..
// const awesomeFunction = ..
var awesomeFunction = function(coolThings) {
    // ..
    return amazingStuff;
};
```

این تابع expressionی است که به متغیر `awesomeFunction` assign شده. متفاوت از شکل function declaration، function expression تا آن statement در runtime در runtime به identifierش مرتبط نمی‌شود.

بسیار مهم است توجه کنید که در جاوااسکریپت، توابع مقادیری هستند که می‌توانند assign شوند (همان‌طور که در این تکه نشان داده شد) و pass شوند. در واقع، توابع جاوااسکریپت نوع خاصی از نوع مقدار object هستند. همهٔ زبان‌ها توابع را به‌عنوان مقدار برخورد نمی‌کنند، اما برای پشتیبانی زبان از الگوی برنامه‌نویسی تابعی ضروری است، همان‌طور که جاوااسکریپت می‌کند.

توابع جاوااسکریپت می‌توانند ورودی پارامتر دریافت کنند:

```js
function greeting(myName) {
    console.log(`Hello, ${ myName }!`);
}

greeting("Kyle");   // Hello, Kyle!
```

در این تکه، `myName` پارامتر نامیده می‌شود، که مثل متغیر محلی داخل تابع عمل می‌کند. توابع می‌توانند برای دریافت هر تعداد پارامتر، از هیچ به بالا، تعریف شوند، هرطور مناسب می‌بینید. هر پارامتر مقدار argumentی که در آن موقعیت فراخوانی (`"Kyle"` اینجا) pass می‌کنید assign می‌شود.

توابع همچنین می‌توانند با کلمهٔ کلیدی `return` مقادیر برگردانند:

```js
function greeting(myName) {
    return `Hello, ${ myName }!`;
}

var msg = greeting("Kyle");

console.log(msg);   // Hello, Kyle!
```

فقط می‌توانید یک مقدار `return` کنید، اما اگر مقادیر بیشتری برای برگرداندن دارید، می‌توانید آن‌ها را در یک object/array بپیچید.

از آنجا که توابع مقادیر هستند، می‌توانند به‌عنوان property روی اشیاء assign شوند:

```js
var whatToSay = {
    greeting() {
        console.log("Hello!");
    },
    question() {
        console.log("What's your name?");
    },
    answer() {
        console.log("My name is Kyle.");
    }
};

whatToSay.greeting();
// Hello!
```

در این تکه، ارجاع به سه تابع (`greeting()`، `question()`، و `answer()`) در object نگه‌داشته‌شده توسط `whatToSay` گنجانده شده. هر تابع می‌تواند با دسترسی به property برای بازیابی مقدار ارجاع تابع فراخوانی شود. این سبک سرراست تعریف توابع روی object را با نحو `class` پیچیده‌تر بحث‌شده بعداً در این فصل مقایسه کنید.

اشکال متنوع زیادی برای `function`ها در جاوااسکریپت وجود دارد. این تنوعات را در پیوست A، «So Many Function Forms» عمیق‌تر بررسی می‌کنیم.
