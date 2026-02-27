# Scopeهای ضمنی

Scopeها گاهی در مکان‌های غیرواضح ایجاد می‌شوند. در عمل، این scopeهای ضمنی اغلب بر رفتار برنامه تأثیر نمی‌گذارند، اما همچنان مفید است بدانید اتفاق می‌افتند. مراقب scopeهای غافل‌گیرکننده زیر باشید:

* Parameter scope
* Function name scope

### Parameter Scope

استعاره مکالمه در فصل ۲ دلالت می‌کند که پارامترهای تابع اساساً همان متغیرهای اعلان‌شده محلی در scope تابع هستند. اما همیشه درست نیست.

در نظر بگیرید:

```js
// outer/global scope: RED(1)

function getStudentName(studentID) {
    // function scope: BLUE(2)

    // ..
}
```

اینجا، `studentID` پارامتر «ساده» در نظر گرفته می‌شود، پس مثل عضو scope تابع BLUE(2) رفتار می‌کند. اما اگر آن را به پارامتر غیرساده تغییر دهیم، دیگر از نظر فنی اینطور نیست. اشکال پارامتر که غیرساده در نظر گرفته می‌شوند شامل پارامترهای با مقادیر پیش‌فرض، rest parameterها (با `...`) و پارامترهای destructured هستند.

در نظر بگیرید:

```js
// outer/global scope: RED(1)

function getStudentName(/*BLUE(2)*/ studentID = 0) {
    // function scope: GREEN(3)

    // ..
}
```

اینجا، لیست پارامتر اساساً scope خودش می‌شود و scope تابع داخل *آن* scope تو در تو می‌شود.

چرا؟ چه تفاوتی می‌کند؟ اشکال پارامتر غیرساده موارد گوشه مختلفی معرفی می‌کنند، پس لیست پارامتر scope خودش می‌شود تا مؤثرتر با آن‌ها برخورد کند.

در نظر بگیرید:

```js
function getStudentName(studentID = maxID, maxID) {
    // ..
}
```

با فرض عملیات چپ به راست، پیش‌فرض `= maxID` برای پارامتر `studentID` نیاز به وجود (و مقداردهی اولیه) `maxID` دارد. این کد خطای TDZ تولید می‌کند (فصل ۵). دلیل این است که `maxID` در parameter scope اعلان شده اما به خاطر ترتیب پارامترها هنوز مقداردهی اولیه نشده. اگر ترتیب پارامترها عوض شود، خطای TDZ رخ نمی‌دهد:

```js
function getStudentName(maxID,studentID = maxID) {
    // ..
}
```

پیچیدگی حتی *در جزئیات* بیشتر می‌شود اگر function expression را در موقعیت پارامتر پیش‌فرض معرفی کنیم، که سپس می‌تواند closure خودش (فصل ۷) روی پارامترها در این parameter scope ضمنی ایجاد کند:

```js
function whatsTheDealHere(id,defaultID = () => id) {
    id = 5;
    console.log( defaultID() );
}

whatsTheDealHere(3);
// 5
```

آن قطعه احتمالاً معنا دارد، چون تابع arrow `defaultID()` بر پارامتر/متغیر `id` close over می‌کند که بعد به `5` انتساب مجدد می‌دهیم. اما حالا تعریف shadowing از `id` در scope تابع معرفی کنیم:

```js
function whatsTheDealHere(id,defaultID = () => id) {
    var id = 5;
    console.log( defaultID() );
}

whatsTheDealHere(3);
// 3
```

اوه! `var id = 5` پارامتر `id` را shadow می‌کند، اما closure تابع `defaultID()` بر پارامتر است، نه متغیر shadowing در بدنه تابع. این ثابت می‌کند حباب scope دور لیست پارامتر وجود دارد.

اما حتی عجیب‌تر می‌شود!

```js
function whatsTheDealHere(id,defaultID = () => id) {
    var id;

    console.log(`local variable 'id': ${ id }`);
    console.log(
        `parameter 'id' (closure): ${ defaultID() }`
    );

    console.log("reassigning 'id' to 5");
    id = 5;

    console.log(`local variable 'id': ${ id }`);
    console.log(
        `parameter 'id' (closure): ${ defaultID() }`
    );
}

whatsTheDealHere(3);
// local variable 'id': 3   <--- Huh!? Weird!
// parameter 'id' (closure): 3
// reassigning 'id' to 5
// local variable 'id': 5
// parameter 'id' (closure): 3
```

قسمت عجیب پیام console اول است. در آن لحظه، متغیر محلی shadowing `id` تازه با `var id` اعلان شده که فصل ۵ می‌گوید معمولاً در بالای scopeاش به `undefined` مقداردهی اولیه خودکار می‌شود. چرا `undefined` چاپ نمی‌کند؟

در این مورد گوشه خاص (به دلایل سازگاری legacy)، JS مقداردهی اولیه خودکار `id` را به `undefined` انجام نمی‌دهد، بلکه به مقدار پارامتر `id` (`3`)!

هرچند آن دو `id` در آن لحظه مثل یک متغیر به نظر می‌رسند، هنوز جدا هستند (و در scopeهای جدا). انتساب `id = 5` واگرایی را قابل مشاهده می‌کند، جایی که پارامتر `id` `3` می‌ماند و متغیر محلی `5` می‌شود.

توصیه من برای اجتناب از گزیده شدن توسط این ظرافت‌های عجیب:

* هرگز پارامترها را با متغیرهای محلی shadow نکنید

* از تابع پارامتر پیش‌فرضی که بر هیچ یک از پارامترها close over می‌کند اجتناب کنید

حداقل اکنون آگاهید و می‌توانید مراقب باشید که لیست پارامتر اگر هر یک از پارامترها غیرساده باشند scope خودش است.

### Function Name Scope

در بخش «Function Name Scope» فصل ۳، گفتم که نام یک function expression به scope خود تابع اضافه می‌شود. به یاد بیاورید:

```js
var askQuestion = function ofTheTeacher(){
    // ..
};
```

درست است که `ofTheTeacher` به scope احاطه‌کننده (جایی که `askQuestion` اعلان شده) اضافه نمی‌شود، اما همچنین *فقط* به scope تابع اضافه نمی‌شود، آن‌طور که احتمالاً فرض می‌کنید. مورد گوشه عجیب دیگری از scope ضمنی است.

شناسه نام یک function expression در scope ضمنی خودش است، بین scope احاطه‌کننده بیرونی و scope تابع درونی اصلی تو در تو.

اگر `ofTheTeacher` در scope تابع بود، اینجا خطا انتظار می‌رفت:

```js
var askQuestion = function ofTheTeacher(){
    // why is this not a duplicate declaration error?
    let ofTheTeacher = "Confused, yet?";
};
```

شکل اعلان `let` اجازه اعلان مجدد نمی‌دهد (فصل ۵ را ببینید). اما این shadowing کاملاً قانونی است، نه اعلان مجدد، چون دو شناسه `ofTheTeacher` در scopeهای جدا هستند.

به ندرت به موردی برخورد می‌کنید که scope شناسه نام تابع مهم باشد. اما دوباره، خوب است بدانید این مکانیزم‌ها واقعاً چطور کار می‌کنند. برای اجتناب از گزیده شدن، هرگز شناسه‌های نام تابع را shadow نکنید.
