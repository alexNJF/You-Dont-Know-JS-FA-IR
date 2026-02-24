# Prototypeها

جایی که `this` ویژگی اجرای تابع است، prototype ویژگی یک object است، و به‌طور خاص resolve دسترسی به property.

به prototype به‌عنوان linkage بین دو object فکر کنید؛ linkage پشت صحنه پنهان است، هرچند راه‌هایی برای در معرض گذاشتن و مشاهدهٔ آن وجود دارد. این prototype linkage وقتی object ایجاد می‌شود اتفاق می‌افتد؛ به object دیگری که از قبل وجود دارد لینک می‌شود.

سری اشیائی که از طریق prototypeها به هم لینک شده‌اند «prototype chain» نامیده می‌شود.

هدف این prototype linkage (یعنی از object B به object دیگر A) این است که دسترسی‌ها به B برای propertyها/متدهایی که B ندارد، به A برای handle کردن *delegate* شوند. delegation دسترسی property/متد به دو (یا بیشتر!) object اجازه می‌دهد برای انجام کاری با هم همکاری کنند.

تعریف object به‌عنوان literal معمولی را در نظر بگیرید:

```js
var homework = {
    topic: "JS"
};
```

object `homework` فقط یک property روی خودش دارد: `topic`. با این حال، prototype linkage پیش‌فرضش به object `Object.prototype` متصل می‌شود، که متدهای built-in مشترکی مثل `toString()` و `valueOf()` و غیره روی آن دارد.

می‌توانیم این *delegation* prototype linkage از `homework` به `Object.prototype` را مشاهده کنیم:

```js
homework.toString();    // [object Object]
```

`homework.toString()` کار می‌کند حتی با وجود اینکه `homework` متد `toString()` تعریف‌شده ندارد؛ delegation به‌جای آن `Object.prototype.toString()` را فراخوانی می‌کند.

## Object Linkage

برای تعریف prototype linkage یک object، می‌توانید object را با ابزار `Object.create(..)` ایجاد کنید:

```js
var homework = {
    topic: "JS"
};

var otherHomework = Object.create(homework);

otherHomework.topic;   // "JS"
```

argument اول `Object.create(..)` objectی را برای لینک object تازه ایجادشده به آن مشخص می‌کند، و سپس object تازه ایجادشده (و لینک‌شده!) را برمی‌گرداند.

شکل ۴ نحوهٔ لینک سه object (`otherHomework`، `homework`، و `Object.prototype`) در یک prototype chain را نشان می‌دهد:

<figure>
    <img src="../images/fig4.svg" width="200" alt="Prototype chain with 3 objects" align="center">
    <figcaption><em>شکل ۴: اشیاء در یک prototype chain</em></figcaption>
    <br><br>
</figure>

Delegation از طریق prototype chain فقط برای دسترسی‌های lookup مقدار در property اعمال می‌شود. اگر به property یک object assign کنید، مستقیماً روی object اعمال می‌شود صرف‌نظر از جایی که آن object به prototype لینک شده.

| نکته: |
| :--- |
| `Object.create(null)` objectی ایجاد می‌کند که به هیچ‌جا prototype لینک نشده، پس صرفاً فقط object مستقل است؛ در برخی شرایط، ممکن است ترجیح داده شود. |

در نظر بگیرید:

```js
homework.topic;
// "JS"

otherHomework.topic;
// "JS"

otherHomework.topic = "Math";
otherHomework.topic;
// "Math"

homework.topic;
// "JS" -- نه "Math"
```

assign به `topic` propertyی با آن نام مستقیماً روی `otherHomework` ایجاد می‌کند؛ هیچ اثری روی property `topic` روی `homework` ندارد. دستور بعدی سپس به `otherHomework.topic` دسترسی می‌کند، و پاسخ غیر-delegate از آن property جدید را می‌بینیم: `"Math"`.

شکل ۵ اشیاء/propertyها را بعد از assignی که property `otherHomework.topic` را ایجاد می‌کند نشان می‌دهد:

<figure>
    <img src="../images/fig5.svg" width="200" alt="3 objects linked, with shadowed property" align="center">
    <figcaption><em>شکل ۵: Property سایه‌انداخته‌شدهٔ 'topic'</em></figcaption>
    <br><br>
</figure>

`topic` روی `otherHomework` property هم‌نام روی object `homework` در chain را «shadowing» می‌کند.

| نکته: |
| :--- |
| راه دیگر، صادقانه پیچیده‌تر اما شاید هنوز رایج‌تر، ایجاد object با prototype linkage استفاده از الگوی «prototypal class» است، از قبل از اضافه شدن `class` (فصل ۲، «Classes» را ببینید) در ES6. این موضوع را با جزئیات بیشتر در پیوست A، «Prototypal 'Classes'» پوشش می‌دهیم. |

## `this` دوباره بررسی شد

کلمهٔ کلیدی `this` را قبلاً پوشش دادیم، اما اهمیت واقعی آن وقتی می‌درخشد که نحوهٔ قدرت‌دهی به فراخوانی‌های تابع delegate‌شده از طریق prototype را در نظر بگیریم. در واقع، یکی از دلایل اصلی پشتیبانی `this` از context پویا بر اساس نحوهٔ فراخوانی تابع این است که فراخوانی‌های متد روی اشیائی که از طریق prototype chain delegate می‌کنند هنوز `this` مورد انتظار را حفظ کنند.

در نظر بگیرید:

```js
var homework = {
    study() {
        console.log(`Please study ${ this.topic }`);
    }
};

var jsHomework = Object.create(homework);
jsHomework.topic = "JS";
jsHomework.study();
// Please study JS

var mathHomework = Object.create(homework);
mathHomework.topic = "Math";
mathHomework.study();
// Please study Math
```

هر دو object `jsHomework` و `mathHomework` به object واحد `homework` که تابع `study()` دارد prototype لینک می‌شوند. به هر کدام از `jsHomework` و `mathHomework` property `topic` خودشان داده شده (شکل ۶ را ببینید).

<figure>
    <img src="../images/fig6.svg" width="495" alt="4 objects prototype linked" align="center">
    <figcaption><em>شکل ۶: دو object لینک‌شده به والد مشترک</em></figcaption>
    <br><br>
</figure>

`jsHomework.study()` به `homework.study()` delegate می‌کند، اما `this` آن (`this.topic`) برای آن اجرا به `jsHomework` resolve می‌شود به‌خاطر نحوهٔ فراخوانی تابع، پس `this.topic` برابر `"JS"` است. به‌طور مشابه برای `mathHomework.study()` که به `homework.study()` delegate می‌کند اما هنوز `this` را به `mathHomework` resolve می‌کند، و بنابراین `this.topic` به‌عنوان `"Math"`.

تکهٔ کد قبلی اگر `this` به `homework` resolve می‌شد بسیار کم‌فایده‌تر می‌بود. با این حال، در بسیاری زبان‌های دیگر، به نظر می‌رسد `this` برابر `homework` می‌شد چون متد `study()` در واقع روی `homework` تعریف شده.

برخلاف بسیاری زبان‌های دیگر، پویا بودن `this` جاوااسکریپت جزء حیاتی اجازه به prototype delegation، و در واقع `class`، برای کار طبق انتظار است!
