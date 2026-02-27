# ماژول‌های مدرن ES (ESM)

فرمت ESM چند شباهت با فرمت CommonJS دارد. ESM مبتنی بر فایل است و نمونه‌های ماژول singleton هستند، با همه چیز *به طور پیش‌فرض* خصوصی. یک تفاوت قابل توجه این است که فایل‌های ESM فرض می‌شوند strict-mode باشند، بدون نیاز به pragma `"use strict"` در بالا. راهی برای تعریف ESM به عنوان non-strict-mode نیست.

به جای `module.exports` در CommonJS، ESM از کلمه کلیدی `export` برای در معرض قرار دادن چیزی روی API عمومی ماژول استفاده می‌کند. کلمه کلیدی `import` statement `require(..)` را جایگزین می‌کند. بیایید «students.js» را برای استفاده از فرمت ESM تنظیم کنیم:

```js
export { getName };

// ************************

var records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
];

function getName(studentID) {
    var student = records.find(
        student => student.id == studentID
    );
    return student.name;
}
```

تنها تغییر اینجا statement `export { getName }` است. مثل قبل، statementهای `export` می‌توانند در سراسر فایل ظاهر شوند، هرچند `export` باید در scope سطح بالا باشد؛ نمی‌تواند داخل هیچ بلوک یا تابع دیگری باشد.

ESM تنوع قابل توجهی در نحوه مشخص کردن statementهای `export` ارائه می‌دهد. مثلاً:

```js
export function getName(studentID) {
    // ..
}
```

حتی با اینکه `export` قبل از کلمه کلیدی `function` اینجا ظاهر می‌شود، این شکل هنوز function declaration است که اتفاقاً export هم شده. یعنی شناسه `getName` *function hoisted* است (فصل ۵ را ببینید)، پس در کل scope ماژول در دسترس است.

گونه مجاز دیگر:

```js
export default function getName(studentID) {
    // ..
}
```

این به اصطلاح «default export» است که معناشناسی متفاوتی از exportهای دیگر دارد. در اصل، «default export» میانبری برای مصرف‌کنندگان ماژول هنگام `import` است، که وقتی فقط به این عضو واحد API پیش‌فرض نیاز دارند نحو مختصرتری به آن‌ها می‌دهد.

Exportهای غیر-`default` «named export» نامیده می‌شوند.

کلمه کلیدی `import`—مثل `export`، فقط باید در سطح بالای ESM خارج از هر بلوک یا تابع استفاده شود—همچنین چند گونه در نحو دارد. اولی «named import» نامیده می‌شود:

```js
import { getName } from "/path/to/students.js";

getName(73);   // Suzy
```

همان‌طور که می‌بینید، این شکل فقط اعضای نام‌دار مشخص API عمومی را از ماژول import می‌کند (هر چیز نام‌گذاری‌نشده صریح را رد می‌کند)، و آن شناسه‌ها را به scope سطح بالای ماژول فعلی اضافه می‌کند. این نوع import سبک آشنا برای کسانی است که به import بسته در زبان‌هایی مثل Java عادت دارند.

چند عضو API می‌توانند داخل مجموعه `{ .. }` لیست شوند، با کاما جدا. یک named import همچنین می‌تواند با کلمه کلیدی `as` *تغییر نام* شود:

```js
import { getName as getStudentName }
   from "/path/to/students.js";

getStudentName(73);
// Suzy
```

اگر `getName` «default export» ماژول است، می‌توانیم این‌طور import کنیم:

```js
import getName from "/path/to/students.js";

getName(73);   // Suzy
```

تنها تفاوت اینجا حذف `{ }` دور binding import است. اگر می‌خواهید default import را با named importهای دیگر ترکیب کنید:

```js
import { default as getName, /* .. others .. */ }
   from "/path/to/students.js";

getName(73);   // Suzy
```

در مقابل، گونه اصلی دیگر `import` «namespace import» نامیده می‌شود:

```js
import * as Student from "/path/to/students.js";

Student.getName(73);   // Suzy
```

همان‌طور که احتمالاً واضح است، `*` همه چیز export شده به API، default و named، را import می‌کند و همه را زیر شناسه namespace واحد مشخص‌شده ذخیره می‌کند. این رویکرد بیشتر با شکل ماژول‌های کلاسیک برای بیشتر تاریخ JS مطابقت دارد.

| نکته: |
| :--- |
| در زمان نوشتن، مرورگرهای مدرن چند سالی ESM را پشتیبانی کرده‌اند، اما پشتیبانی پایدار Node از ESM نسبتاً جدید است و مدتها در حال تکامل بوده. تکامل احتمالاً یک سال یا بیشتر ادامه خواهد یافت؛ معرفی ESM به JS در ES6 نگرانی‌های سازگاری چالش‌برانگیز زیادی برای interop Node با ماژول‌های CommonJS ایجاد کرد. مستندات ESM Node را برای همه جزئیات آخرین مراجعه کنید: https://nodejs.org/api/esm.html |
