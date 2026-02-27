# درون‌کاوی (Introspection)

اگر با برنامه‌نویسی class oriented (چه در JS چه زبان‌های دیگر) زیاد کار کرده باشید، احتمالاً با *type introspection* آشنا هستید: بررسی یک instance برای فهمیدن از *چه نوع* objectی است. هدف اصلی *type introspection* با instanceهای class این است که بر اساس *نحوهٔ ساخته شدن* object دربارهٔ ساختار/قابلیت‌های آن استدلال کنیم.

این کد را در نظر بگیرید که از `instanceof` (فصل ۵ را ببینید) برای introspection روی objectِ `a1` برای استنباط قابلیت آن استفاده می‌کند:

```js
function Foo() {
	// ...
}
Foo.prototype.something = function(){
	// ...
}

var a1 = new Foo();

// later

if (a1 instanceof Foo) {
	a1.something();
}
```

چون `Foo.prototype` (نه `Foo`!) در زنجیرهٔ `[[Prototype]]` (فصل ۵ را ببینید)ِ `a1` قرار دارد، عملگر `instanceof` (به‌طور گیج‌کننده) وانمود می‌کند که به ما بگوید `a1` یک instance از «class»ِ `Foo` است. با این دانش، سپس فرض می‌کنیم که `a1` قابلیت‌های توصیف‌شده توسط «class»ِ `Foo` را دارد.

البته، classِ `Foo` وجود ندارد، فقط یک تابع معمولی قدیمی `Foo` که اتفاقاً ارجاعی به یک object دلخواه (`Foo.prototype`) دارد که `a1` اتفاقاً به آن delegation-link شده. از نظر سینتکس، `instanceof` وانمود می‌کند رابطهٔ بین `a1` و `Foo` را بررسی می‌کند، اما در واقع می‌گوید آیا `a1` و (object دلخواهی که به آن ارجاع دارد) `Foo.prototype` مرتبط هستند یا نه.

سردرگمی معنایی (و غیرمستقیم بودن) سینتکس `instanceof` یعنی برای استفاده از introspection مبتنی بر `instanceof` برای پرسیدن آیا objectِ `a1` به object قابلیت مورد نظر مرتبط است، *باید* تابعی داشته باشید که ارجاع به آن object را نگه دارد — نمی‌توانید مستقیم بپرسید آیا آن دو object مرتبط هستند.

مثال انتزاعی `Foo` / `Bar` / `b1` از اوایل این فصل را به‌یاد آورید، که اینجا خلاصه می‌کنیم:

```js
function Foo() { /* .. */ }
Foo.prototype...

function Bar() { /* .. */ }
Bar.prototype = Object.create( Foo.prototype );

var b1 = new Bar( "b1" );
```

برای هدف *type introspection* روی موجودیت‌های آن مثال، با سینتکس `instanceof` و `.prototype`، بررسی‌های مختلفی که ممکن است لازم باشد انجام دهید:

```js
// relating `Foo` and `Bar` to each other
Bar.prototype instanceof Foo; // true
Object.getPrototypeOf( Bar.prototype ) === Foo.prototype; // true
Foo.prototype.isPrototypeOf( Bar.prototype ); // true

// relating `b1` to both `Foo` and `Bar`
b1 instanceof Foo; // true
b1 instanceof Bar; // true
Object.getPrototypeOf( b1 ) === Bar.prototype; // true
Foo.prototype.isPrototypeOf( b1 ); // true
Bar.prototype.isPrototypeOf( b1 ); // true
```

منصفانه است بگوییم بخشی از آن بد است. مثلاً، به‌طور شهودی (با classها) شاید بخواهید بتوانید چیزی مثل `Bar instanceof Foo` بگویید (چون آسان است «instance» را با «inheritance» اشتباه بگیرید)، اما در JS مقایسهٔ معقولی نیست. باید به‌جای آن `Bar.prototype instanceof Foo` را انجام دهید.

الگوی رایج دیگر، اما شاید کم‌استحکام‌تر، برای *type introspection* که بسیاری از devها به‌نظر ترجیح می‌دهند به‌جای `instanceof`، «duck typing» نامیده می‌شود. این اصطلاح از ضرب‌المثل می‌آید: «اگر شبیه اردک به‌نظر برسد و مثل اردک قارقار کند، باید اردک باشد».

مثال:

```js
if (a1.something) {
	a1.something();
}
```

به‌جای بررسی رابطهٔ بین `a1` و objectی که تابع delegatableِ `something()` را نگه دارد، فرض می‌کنیم که گذشتن تست `a1.something` یعنی `a1` قابلیت فراخوانی `.something()` را دارد (صرف‌نظر از اینکه متد را مستقیم روی `a1` پیدا کرده یا به object دیگری delegate کرده). به‌خودی‌خود، آن فرض آن‌قدر پرریسک نیست.

اما «duck typing» اغلب گسترش داده می‌شود تا **فرض‌های دیگری دربارهٔ قابلیت‌های object** علاوه بر آنچه تست می‌شود بسازد، که البته ریسک بیشتر (یعنی طراحی شکننده) به تست وارد می‌کند.

یک نمونهٔ notable از «duck typing» با Promiseهای ES6 است (که طبق یادداشت قبلی در این کتاب پوشش داده نمی‌شوند).

به دلایل مختلف، نیاز است تعیین شود آیا هر ارجاع object دلخواهی *یک Promise است*، اما نحوهٔ انجام آن تست این است که بررسی شود آیا object اتفاقاً تابع `then()` روی خود دارد. به‌عبارت دیگر، **اگر هر objectی** اتفاقاً متد `then()` داشته باشد، Promiseهای ES6 بی‌قید و شرط فرض می‌کنند آن object **یک «thenable» است** و بنابراین انتظار دارند مطابق همهٔ رفتارهای استاندارد Promise عمل کند.

اگر هر object غیر-Promise دارید که به هر دلیلی اتفاقاً متد `then()` روی خود دارد، اکیداً توصیه می‌شود آن را از مکانیزم Promiseِ ES6 دور نگه دارید تا از فرض‌های شکسته جلوگیری کنید.

آن مثال به‌وضوح خطرات «duck typing» را نشان می‌دهد. چنین رویکردهایی را فقط به‌اندازه و در شرایط کنترل‌شده به‌کار ببرید.

با بازگرداندن توجه به کد سبک OLOO همان‌طور که در این فصل ارائه شد، *type introspection* بسیار تمیزتر می‌شود. مثال OLOOِ `Foo` / `Bar` / `b1` از اوایل فصل را به‌یاد آوریم (و خلاصه کنیم):

```js
var Foo = { /* .. */ };

var Bar = Object.create( Foo );
Bar...

var b1 = Object.create( Bar );
```

با این رویکرد OLOO، جایی که فقط objectهای ساده داریم که از طریق delegationِ `[[Prototype]]` مرتبط هستند، *type introspection* نسبتاً ساده‌شده‌ای که ممکن است استفاده کنیم:

```js
// relating `Foo` and `Bar` to each other
Foo.isPrototypeOf( Bar ); // true
Object.getPrototypeOf( Bar ) === Foo; // true

// relating `b1` to both `Foo` and `Bar`
Foo.isPrototypeOf( b1 ); // true
Bar.isPrototypeOf( b1 ); // true
Object.getPrototypeOf( b1 ) === Bar; // true
```

دیگر از `instanceof` استفاده نمی‌کنیم، چون گیج‌کننده وانمود می‌کند به classها مربوط است. اکنون فقط سؤال (به‌صورت غیررسمی) را می‌پرسیم: «آیا تو *یک* prototype از من هستی؟» دیگر نیازی به غیرمستقیم بودن با چیزهایی مثل `Foo.prototype` یا `Foo.prototype.isPrototypeOf(..)` دردناک و طولانی نیست.

منصفانه است بگوییم این بررسی‌ها به‌طور محسوس کمتر از مجموعهٔ قبلی بررسی‌های introspection پیچیده/گیج‌کننده هستند. **باز هم می‌بینیم که OLOO از کدنویسی سبک class در JavaScript ساده‌تر است (با همان قدرت).**
