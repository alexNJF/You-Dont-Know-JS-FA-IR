# رفتار استاتیک کلاس

تا الان دو مکان مختلف برای داده یا رفتار (متدها) تأکید کرده‌ایم: روی prototype constructor، یا روی نمونه. اما گزینهٔ سومی هست: روی خود constructor (شیء تابع).

در سیستم سنتی جهت‌یافته به کلاس، متدهای تعریف‌شده روی کلاس چیزهای عینی نیستند که بتوانید فراخوانی یا تعامل کنید. باید کلاس را نمونه‌سازی کنید تا شیء عینی برای فراخوانی آن متدها داشته باشید. زبان‌های پروتوتایپی مثل JS این خط را کمی محو می‌کنند: همهٔ متدهای تعریف‌شدهٔ کلاس توابع «واقعی» روی prototype constructor هستند، و بنابراین می‌توانید آن‌ها را فراخوانی کنید. اما همان‌طور که قبلاً گفتم، واقعاً *نباید* این کار را بکنید، چون این نحوهٔ فرض JS برای نوشتن `class`هایتان نیست، و ممکن است به رفتارهای گوشهٔ عجیب برخورد کنید. بهتر است در مسیر باریکی که `class` برایتان می‌گذارد بمانید.

همهٔ رفتاری که تعریف می‌کنیم و می‌خواهیم با کلاس مرتبط/سازماندهی کنیم *نیازی* به آگاهی از نمونه ندارد. علاوه بر این، گاهی کلاس نیاز به تعریف عمومی داده (مثل ثابت‌ها) دارد که توسعه‌دهندگان استفاده‌کننده از آن کلاس باید به آن دسترسی داشته باشند، مستقل از هر نمونه‌ای که ممکن است ساخته باشند یا نه.

پس، چطور سیستم کلاس امکان تعریف چنین داده و رفتاری که باید با کلاس در دسترس باشد اما مستقل از (ناآگاه از) اشیاء نمونه‌سازی‌شده را فراهم می‌کند؟ **ویژگی‌ها و توابع استاتیک**.

| NOTE: |
| :--- |
| از «static property» / «static function» استفاده می‌کنم، به‌جای «member» / «method»، تا واضح‌تر باشد که تمایزی بین memberهای bound به نمونه / متدهای آگاه از نمونه، و ویژگی‌ها و توابع غیرنمونه وجود دارد. |

از کلمهٔ کلیدی `static` در بدنهٔ `class` برای تمایز این تعاریف استفاده می‌کنیم:

```js
class Point2d {
    // class statics
    static origin = new Point2d(0,0)
    static distance(point1,point2) {
        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2)
        );
    }

    // instance members and methods
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `(${this.x},${this.y})`;
    }
}

console.log(`Starting point: ${Point2d.origin}`);
// Starting point: (0,0)

var next = new Point2d(3,4);
console.log(`Next point: ${next}`);
// Next point: (3,4)

console.log(`Distance: ${
    Point2d.distance( Point2d.origin, next )
}`);
// Distance: 5
```

`Point2d.origin` یک ویژگی استاتیک است، که اتفاقاً یک نمونهٔ ساخته‌شده از کلاسمان را نگه می‌دارد. و `Point2d.distance(..)` تابع استاتیکی است که فاصلهٔ دکارتی دوبعدی بین دو نقطه را محاسبه می‌کند.

البته می‌توانستیم این دو را جایی غیر از `static`های تعریف کلاس بگذاریم. اما چون مستقیماً به کلاس `Point2d` مرتبط‌اند، *منطقی‌ترین* کار سازماندهی آن‌ها همانجاست.

| NOTE: |
| :--- |
| فراموش نکنید وقتی از سینتکس `class` استفاده می‌کنید، نام `Point2d` در واقع نام تابع constructori است که JS تعریف می‌کند. پس `Point2d.origin` فقط دسترسی ویژگی معمولی روی آن شیء تابع است. منظورم از ابتدای این بخش وقتی به مکان سوم برای ذخیرهٔ *چیزهای* مرتبط با کلاس‌ها اشاره کردم همین بود؛ در JS، `static`ها به‌عنوان ویژگی روی تابع constructor ذخیره می‌شوند. مراقب باشید آن‌ها را با ویژگی‌های ذخیره‌شده روی `prototype` constructor (متدها) و ویژگی‌های ذخیره‌شده روی نمونه (memberها) اشتباه نگیرید. |

### مقداردهی‌های اولیهٔ ویژگی استاتیک

مقدار در مقداردهی اولیهٔ استاتیک (`static whatever = ..`) می‌تواند شامل ارجاعات `this` باشد، که به خود کلاس (در واقع، constructor) اشاره می‌کند نه به نمونه:

```js
class Point2d {
    // class statics
    static originX = 0
    static originY = 0
    static origin = new this(this.originX,this.originY)

    // ..
}
```

| WARNING: |
| :--- |
| توصیه نمی‌کنم واقعاً ترفند `new this(..)` که اینجا نشان دادم را انجام دهید. فقط برای تصویرسازی است. کد با `new Point2d(this.originX,this.originY)` خواناتر می‌خواند، پس آن رویکرد را ترجیح دهید. |

جزئیات مهمی که نباید نادیده بگیرید: برخلاف مقداردهی‌های اولیهٔ فیلد عمومی، که فقط هنگام نمونه‌سازی (با `new`) اتفاق می‌افتند، مقداردهی‌های اولیهٔ استاتیک کلاس همیشه *بلافاصله* بعد از تعریف `class` اجرا می‌شوند. علاوه بر این، ترتیب مقداردهی‌های اولیهٔ استاتیک مهم است؛ می‌توانید statementها را طوری تصور کنید که یکی‌یکی ارزیابی می‌شوند.

همچنین مثل memberهای کلاس، ویژگی‌های استاتیک نیازی به مقداردهی اولیه ندارند (پیش‌فرض: `undefined`)، اما معمولاً این کار را می‌کنیم. فایدهٔ زیادی در اعلام ویژگی استاتیک بدون مقدار اولیه (`static whatever`) نیست؛ دسترسی به `Point2d.whatever` یا `Point2d.nonExistent` هر دو نتیجهٔ `undefined` می‌دهند.

اخیراً (در ES2022)، کلمهٔ کلیدی `static` گسترش یافت تا اکنون بتواند بلوکی داخل بدنهٔ `class` برای مقداردهی اولیهٔ پیچیده‌تر `static`ها تعریف کند:

```js
class Point2d {
    // class statics
    static origin = new Point2d(0,0)
    static distance(point1,point2) {
        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2)
        );
    }

    // static initialization block (as of ES2022)
    static {
        let outerPoint = new Point2d(6,8);
        this.maxDistance = this.distance(
            this.origin,
            outerPoint
        );
    }

    // ..
}

Point2d.maxDistance;        // 10
```

`let outerPoint = ..` اینجا ویژگی خاص `class` نیست؛ دقیقاً مثل اعلام `let` معمولی در هر بلوک scope است (کتاب «Scope & Closures» این سری را ببینید). صرفاً یک نمونهٔ محلی از `Point2d` را اعلام می‌کنیم که به `outerPoint` انتساب داده شده، سپس از آن مقدار برای استخراج انتساب به ویژگی استاتیک `maxDistance` استفاده می‌کنیم.

بلوک‌های مقداردهی اولیهٔ استاتیک برای چیزهایی مثل statementهای `try..catch` دور محاسبات expression هم مفیدند.

### Inheritance استاتیک

استاتیک‌های کلاس توسط زیرکلاس‌ها به ارث برده می‌شوند (بدیهی است، به‌عنوان استاتیک)، می‌توانند override شوند، و `super` می‌تواند برای ارجاعات کلاس پایه (و method polymorphism تابع استاتیک) استفاده شود، همه تقریباً مثل inheritance با memberها/متدهای نمونه:

```js
class Point2d {
    static origin = /* .. */
    static distance(x,y) { /* .. */ }

    static {
        // ..
        this.maxDistance = /* .. */;
    }

    // ..
}

class Point3d extends Point2d {
    // class statics
    static origin = new Point3d(
        // here, `this.origin` references wouldn't
        // work (self-referential), so we use
        // `super.origin` references instead
        super.origin.x, super.origin.y, 0
    )
    static distance(point1,point2) {
        // here, super.distance(..) is Point2d.distance(..),
        // if we needed to invoke it

        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2) +
            ((point2.z - point1.z) ** 2)
        );
    }

    // instance members/methods
    z
    constructor(x,y,z) {
        super(x,y);     // <-- don't forget this line!
        this.z = z;
    }
    toString() {
        return `(${this.x},${this.y},${this.z})`;
    }
}

Point2d.maxDistance;        // 10
Point3d.maxDistance;        // 10
```

همان‌طور که می‌بینید، ویژگی استاتیک `maxDistance` که روی `Point2d` تعریف کردیم به‌عنوان ویژگی استاتیک روی `Point3d` به ارث برده شد.

| TIP: |
| :--- |
| به خاطر داشته باشید: هر بار که constructor زیرکلاس تعریف می‌کنید، باید `super(..)` را در آن فراخوانی کنید، معمولاً به‌عنوان اولین statement. می‌بینم که فراموش کردنش خیلی راحت است. |

رفتار زیربنایی JS را اینجا رد نکنید. درست مثل inheritance متد که قبلاً بحث شد، «inheritance» استاتیک *کپی* این ویژگی‌ها/توابع استاتیک از کلاس پایه به زیرکلاس نیست؛ اشتراک از طریق زنجیرهٔ `[[Prototype]]` است. به‌طور خاص، تابع constructor `Point3d()` اتصال `[[Prototype]]` آن توسط JS (از پیش‌فرض `Function.prototype`) به `Point2d` تغییر می‌کند، که به `Point3d.maxDistance` اجازه می‌دهد به `Point2d.maxDistance` delegate کند.

همچنین جالب است، شاید فقط از نظر تاریخی، که inheritance استاتیک — که بخشی از مجموعهٔ ویژگی مکانیزم `class` اصلی ES6 بود! — یکی از ویژگی‌های خاصی بود که فراتر از «فقط syntax sugar» رفت. inheritance استاتیک، همان‌طور که اینجا تصویرسازی می‌کنیم، در JS قبل از ES6، در سبک کد کلاس پروتوتایپی قدیمی، قابل دستیابی/تقلید نبود. رفتار جدید خاصی است که فقط از ES6 معرفی شد.
