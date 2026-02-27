# Delegation تصویرسازی‌شده

پس delegation دربارهٔ چیست؟ در هستهٔ خود، دربارهٔ دو یا چند *چیز* است که تلاش تکمیل یک کار را به اشتراک می‌گذارند.

به‌جای تعریف یک *چیز* والد کلی `Point2d` که رفتار اشتراکی را نشان می‌دهد که مجموعهٔ یک یا چند *چیز* فرزند `point` / `anotherPoint` از آن ارث می‌برند، delegation ما را به ساخت برنامه با *چیزهای* هم‌ردهٔ مجزا که با هم همکاری می‌کنند می‌برد.

در کدی sketch می‌کنم:

```js
var Coordinates = {
    setX(x) {
        this.x = x;
    },
    setY(y) {
        this.y = y;
    },
    setXY(x,y) {
        this.setX(x);
        this.setY(y);
    },
};

var Inspect = {
    toString() {
        return `(${this.x},${this.y})`;
    },
};

var point = {};

Coordinates.setXY.call(point,3,4);
Inspect.toString.call(point);         // (3,4)

var anotherPoint = Object.create(Coordinates);

anotherPoint.setXY(5,6);
Inspect.toString.call(anotherPoint);  // (5,6)
```

بیایید ببینیم چه اتفاقی می‌افتد.

`Coordinates` را به‌عنوان شیء عینی تعریف کردم که برخی رفتارهای مرتبط با تنظیم مختصات نقطه (`x` و `y`) را نگه می‌دارد. همچنین `Inspect` را به‌عنوان شیء عینی تعریف کردم که منطق inspection دیباگ، مثل `toString()` را نگه می‌دارد.

سپس دو شیء عینی دیگر، `point` و `anotherPoint` ساختم.

`point` هیچ `[[Prototype]]` خاصی ندارد (پیش‌فرض: `Object.prototype`). با انتساب *context صریح* (فصل ۴ را ببینید)، utilityهای `Coordinates.setXY(..)` و `Inspect.toString()` را در context مربوط به `point` فراخوانی می‌کنم. این همان چیزی است که *delegation صریح* می‌نامم.

`anotherPoint` به `Coordinates` `[[Prototype]]` linked است، mostly برای کمی راحتی. این به من اجازه می‌دهد از انتساب *context ضمنی* با `anotherPoint.setXY(..)` استفاده کنم. اما هنوز می‌توانم *صریحاً* `anotherPoint` را به‌عنوان context برای فراخوانی `Inspect.toString()` share کنم. این همان چیزی است که *delegation ضمنی* می‌نامم.

**این را از دست ندهید:** هنوز composition به دست آوردیم: رفتارها را از `Coordinates` و `Inspect` در فراخوانی‌های تابع runtime با اشتراک context `this` compose کردیم. مجبور نبودیم آن رفتارها را در یک `class` واحد (یا سلسله‌مراتب `class` پایه-زیرکلاس) author-combine کنیم تا `point` / `anotherPoint` از آن ارث ببرند. دوست دارم این composition در زمان اجرا را **ترکیب مجازی** (virtual composition) بنامم.

*نکته* اینجا این است: هیچ‌کدام از این چهار شیء والد یا فرزند نیستند. همه هم‌ردهٔ هم هستند، و همه هدف‌های متفاوتی دارند. می‌توانیم رفتارمان را در قطعات منطقی (روی هر شیء مربوط) سازماندهی کنیم، و context را از طریق `this` (و اختیاری اتصال `[[Prototype]]`) share کنیم، که به همان نتایج composition منجر می‌شود که الگوهای دیگری که تا الان در کتاب بررسی کردیم.

*آن* قلب الگوی **delegation** است، همان‌طور که JS آن را تجسم می‌کند.

| TIP: |
| :--- |
| در ویرایش اول این سری کتاب، این کتاب («this & Object Prototypes») اصطلاحی ابداع کرد، «OLOO»، که مخفف «Objects Linked to Other Objects» است — در تضاد با «OO» («Object Oriented»). در مثال قبلی، می‌توانید جوهر OLOO را ببینید: فقط اشیاء داریم، به اشیاء دیگر link شده و با آن‌ها همکاری می‌کنند. در سادگی‌اش زیباست. |
