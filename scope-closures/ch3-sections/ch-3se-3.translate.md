# Scope نام تابع

همانطور که تا الان دیدید، اعلان `function` اینطور به نظر می‌رسد:

```js
function askQuestion() {
    // ..
}
```

و همانطور که در فصل‌های ۱ و ۲ بحث شد، چنین اعلان `function` یک شناسه در scope محصورکننده (در این مورد، scope سراسری) به نام `askQuestion` ایجاد می‌کند.

این برنامه چطور؟

```js
var askQuestion = function(){
    // ..
};
```

همین برای متغیر `askQuestion` که ایجاد می‌شود درست است. اما چون یک `function` expression است—تعریف تابعی که به‌عنوان مقدار به‌جای اعلان مستقل استفاده می‌شود—خود تابع «hoist» نخواهد شد (فصل ۵ را ببینید).

یک تفاوت عمده بین اعلان‌های `function` و `function` expressionها این است که چه اتفاقی برای شناسهٔ نام تابع می‌افتد. یک `function` expression نام‌دار را در نظر بگیرید:

```js
var askQuestion = function ofTheTeacher(){
    // ..
};
```

می‌دانیم `askQuestion` در scope بیرونی قرار می‌گیرد. اما شناسهٔ `ofTheTeacher` چطور؟ برای اعلان‌های رسمی `function`، شناسهٔ نام در scope بیرونی/محصورکننده قرار می‌گیرد، پس ممکن است معقول باشد فرض کنیم اینجا هم همینطور است. اما `ofTheTeacher` به‌عنوان شناسه **داخل خود تابع** اعلان می‌شود:

```js
var askQuestion = function ofTheTeacher() {
    console.log(ofTheTeacher);
};

askQuestion();
// function ofTheTeacher()...

console.log(ofTheTeacher);
// ReferenceError: ofTheTeacher is not defined
```

| NOTE: |
| :--- |
| در واقع، `ofTheTeacher` دقیقاً *در scope تابع* نیست. پیوست الف، «Implied Scopes» بیشتر توضیح می‌دهد. |

نه تنها `ofTheTeacher` داخل تابع اعلان شده به‌جای بیرون، بلکه به‌عنوان فقط-خواندنی تعریف شده:

```js
var askQuestion = function ofTheTeacher() {
    "use strict";
    ofTheTeacher = 42;   // TypeError

    //..
};

askQuestion();
// TypeError
```

چون از strict-mode استفاده کردیم، شکست انتساب به‌عنوان `TypeError` گزارش می‌شود؛ در non-strict-mode، چنین انتسابی بی‌صدا و بدون استثنا شکست می‌خورد.

وقتی `function` expression شناسهٔ نام ندارد چه؟

```js
var askQuestion = function(){
   // ..
};
```

یک `function` expression با شناسهٔ نام «named function expression» نامیده می‌شود، اما بدون شناسهٔ نام «anonymous function expression» نامیده می‌شود. anonymous function expressionها به‌وضوح شناسهٔ نامی ندارند که بر هیچ scope تأثیر بگذارد.

| NOTE: |
| :--- |
| در پیوست الف با جزئیات بیشتر دربارهٔ named در مقابل anonymous `function` expressionها بحث می‌کنیم، از جمله عواملی که بر تصمیم استفاده از یکی یا دیگری تأثیر می‌گذارند. |
