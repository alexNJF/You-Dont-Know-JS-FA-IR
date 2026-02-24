# مقادیر در مقابل ارجاع‌ها

در فصل ۲، دو نوع اصلی مقادیر را معرفی کردیم: primitiveها و objectها. اما هنوز یک تفاوت کلیدی بین آن دو را بحث نکرده بودیم: نحوهٔ assign و pass شدن این مقادیر.

در بسیاری زبان‌ها، توسعه‌دهنده می‌تواند بین assign/pass کردن مقدار به‌عنوان خود مقدار، یا به‌عنوان ارجاع به مقدار انتخاب کند. در جاوااسکریپت، با این حال، این تصمیم کاملاً توسط نوع مقدار تعیین می‌شود. این بسیاری توسعه‌دهندگان از زبان‌های دیگر را وقتی شروع به استفاده از جاوااسکریپت می‌کنند متعجب می‌کند.

اگر خود مقدار را assign/pass کنید، مقدار کپی می‌شود. مثلاً:

```js
var myName = "Kyle";

var yourName = myName;
```

اینجا، متغیر `yourName` کپی جداگانه‌ای از string `"Kyle"` از مقداری که در `myName` ذخیره شده دارد. چون مقدار primitive است، و مقادیر primitive همیشه به‌عنوان **value copies** assign/pass می‌شوند.

نحوهٔ اثبات اینکه دو مقدار جداگانه درگیرند:

```js
var myName = "Kyle";

var yourName = myName;

myName = "Frank";

console.log(myName);
// Frank

console.log(yourName);
// Kyle
```

می‌بینید `yourName` تحت تأثیر re-assignment `myName` به `"Frank"` قرار نگرفت؟ چون هر متغیر کپی خودش از مقدار را نگه می‌دارد.

در contrast، referenceها ایدهٔ این هستند که دو یا چند متغیر به همان مقدار اشاره می‌کنند، طوری که تغییر این مقدار مشترک با دسترسی از طریق هر یک از آن referenceها منعکس شود. در جاوااسکریپت، فقط مقادیر object (آرایه‌ها، اشیاء، توابع و غیره) به‌عنوان reference برخورد می‌شوند.

در نظر بگیرید:

```js
var myAddress = {
    street: "123 JS Blvd",
    city: "Austin",
    state: "TX"
};

var yourAddress = myAddress;

// باید به خانهٔ جدید نقل مکان کنم!
myAddress.street = "456 TS Ave";

console.log(yourAddress.street);
// 456 TS Ave
```

چون مقدار assign‌شده به `myAddress` یک object است، با reference نگه‌داری/assign می‌شود، و بنابراین assign به متغیر `yourAddress` کپی reference است، نه خود مقدار object. به همین دلیل مقدار به‌روزشده assign‌شده به `myAddress.street` هنگام دسترسی به `yourAddress.street` منعکس می‌شود. `myAddress` و `yourAddress` کپی‌های reference به object مشترک واحد دارند، پس به‌روزرسانی یکی به‌روزرسانی هر دو است.

باز هم، جاوااسکریپت رفتار value-copy در مقابل reference-copy را بر اساس نوع مقدار انتخاب می‌کند. primitiveها با مقدار نگه داشته می‌شوند، objectها با reference. راهی برای override کردن این در جاوااسکریپت نیست، در هیچ جهت.
