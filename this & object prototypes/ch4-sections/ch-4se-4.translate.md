# میکسین‌ها

مکانیزم object جاوااسکریپت وقتی «ارث می‌برید» یا «instantiate می‌کنید» به‌طور *خودکار* رفتار کپی انجام نمی‌دهد. روشن است، در جاوااسکریپت «class»ی برای instantiate کردن نیست، فقط object. و objectها به objectهای دیگر کپی نمی‌شوند، *با هم لینک* می‌شوند (بیشتر در فصل ۵).

چون رفتارهای class مشاهده‌شده در زبان‌های دیگر دلالت بر کپی دارند، بیایید ببینیم توسعه‌دهندگان JS چطور رفتار کپی *گم‌شده*ٔ classها در جاوااسکریپت را **جعل** می‌کنند: mixinها. دو نوع «mixin» را می‌بینیم: **explicit** و **implicit**.

### Explicit Mixins

بیایید دوباره مثال `Vehicle` و `Car` قبلی را بازبینیم. چون جاوااسکریپت به‌طور خودکار رفتار را از `Vehicle` به `Car` کپی نمی‌کند، می‌توانیم به‌جای آن ابزاری بسازیم که دستی کپی کند. چنین ابزاری اغلب توسط بسیاری کتابخانه‌ها/frameworkها `extend(..)` نامیده می‌شود، اما اینجا برای توضیح آن را `mixin(..)` می‌نامیم.

```js
// vastly simplified `mixin(..)` example:
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		// only copy if not already present
		if (!(key in targetObj)) {
			targetObj[key] = sourceObj[key];
		}
	}

	return targetObj;
}

var Vehicle = {
	engines: 1,

	ignition: function() {
		console.log( "Turning on my engine." );
	},

	drive: function() {
		this.ignition();
		console.log( "Steering and moving forward!" );
	}
};

var Car = mixin( Vehicle, {
	wheels: 4,

	drive: function() {
		Vehicle.drive.call( this );
		console.log( "Rolling on all " + this.wheels + " wheels!" );
	}
} );
```

**یادداشت:** به‌طور ظریف اما مهم، دیگر با classها سروکار نداریم، چون در جاوااسکریپت class نیست. `Vehicle` و `Car` فقط objectهایی‌اند که به‌ترتیب از آن‌ها کپی می‌گیریم و به آن‌ها کپی می‌کنیم.

`Car` اکنون کپی propertyها و توابع از `Vehicle` را دارد. از نظر فنی، توابع واقعاً تکرار نمی‌شوند، بلکه *reference*های به توابع کپی می‌شوند. پس `Car` اکنون propertyی به نام `ignition` دارد که reference کپی‌شده به تابع `ignition()` است، و همچنین propertyی به نام `engines` با مقدار کپی‌شدهٔ `1` از `Vehicle`.

`Car` *از قبل* property (تابع) یعنی `drive` داشت، پس آن ارجاع property override نشد (دستور `if` در `mixin(..)` بالا را ببینید).

#### بازبینی «Polymorphism»

این عبارت را بررسی کنیم: `Vehicle.drive.call( this )`. این چیزی است که «explicit pseudo-polymorphism» می‌نامم. در شبه‌کد قبلی این خط `inherited:drive()` بود که «relative polymorphism» نامیدیم.

جاوااسکریپت (قبل از ES6؛ ضمیمهٔ A را ببینید) امکانی برای relative polymorphism ندارد. پس **چون هر دو `Car` و `Vehicle` تابعی با همان نام داشتند: `drive()`**، برای تمایز فراخوانی یکی یا دیگری باید ارجاع مطلق (نه نسبی) بدهیم. صریحاً object یعنی `Vehicle` را با نام مشخص می‌کنیم و تابع `drive()` را روی آن فراخوانی می‌کنیم.

اما اگر می‌گفتیم `Vehicle.drive()`، binding مربوط به `this` آن فراخوانی تابع به‌جای object یعنی `Car` object یعنی `Vehicle` می‌شد (فصل ۲ را ببینید)، که نمی‌خواستیم. پس به‌جای آن از `.call( this )` (فصل ۲) استفاده می‌کنیم تا مطمئن شویم `drive()` در context object یعنی `Car` اجرا می‌شود.

**یادداشت:** اگر شناسهٔ نام تابع برای `Car.drive()` با `Vehicle.drive()` هم‌پوشانی نداشت (به‌اصطلاح «shadowed»؛ فصل ۵ را ببینید)، «method polymorphism» را اعمال نمی‌کردیم. پس ارجاع به `Vehicle.drive()` توسط فراخوانی `mixin(..)` کپی می‌شد و می‌توانستیم مستقیماً با `this.drive()` دسترسی داشته باشیم. هم‌پوشانی شناسهٔ انتخاب‌شده **shadowing** *دلیل* استفاده از رویکرد *explicit pseudo-polymorphism* پیچیده‌تر است.

در زبان‌های مبتنی بر class که relative polymorphism دارند، ارتباط بین `Car` و `Vehicle` یک بار در بالای تعریف class برقرار می‌شود و فقط یک جا برای نگهداری چنین رابطه‌هایی می‌ماند.

اما به‌خاطر ویژگی‌های خاص جاوااسکریپت، explicit pseudo-polymorphism (به‌خاطر shadowing!) ارتباط دستی/صریح شکننده **در هر تابعی که به چنین ارجاع (شبه‌)polymorphic نیاز دارید** ایجاد می‌کند. این می‌تواند هزینهٔ نگهداری را به‌طور قابل توجه افزایش دهد. علاوه بر این، هرچند explicit pseudo-polymorphism می‌تواند رفتار «multiple inheritance» را شبیه‌سازی کند، فقط پیچیدگی و شکنندگی را افزایش می‌دهد.

نتیجهٔ چنین رویکردهایی معمولاً کد پیچیده‌تر، سخت‌تر برای خواندن *و* سخت‌تر برای نگهداری است. **در هر جا که ممکن است از explicit pseudo-polymorphism اجتناب کنید**، چون هزینه در بیشتر جنبه‌ها از فایده بیشتر است.

#### ترکیب کپی‌ها

ابزار `mixin(..)` بالا را به یاد دارید:

```js
// vastly simplified `mixin()` example:
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		// only copy if not already present
		if (!(key in targetObj)) {
			targetObj[key] = sourceObj[key];
		}
	}

	return targetObj;
}
```

حالا ببینیم `mixin(..)` چطور کار می‌کند. روی propertyهای `sourceObj` (`Vehicle` در مثال ما) تکرار می‌کند و اگر property هم‌نامی در `targetObj` (`Car` در مثال ما) نباشد کپی می‌کند. چون بعد از وجود object اولیه کپی می‌کنیم، مراقبیم property هدف را کپی نکنیم.

اگر اول کپی‌ها را می‌کردیم، قبل از مشخص کردن محتوای خاص `Car`، می‌توانستیم این بررسی علیه `targetObj` را حذف کنیم، اما کمی دست‌وپاگیرتر و کم‌کارآمدتر است، پس عموماً کمتر ترجیح داده می‌شود:

```js
// alternate mixin, less "safe" to overwrites
function mixin( sourceObj, targetObj ) {
	for (var key in sourceObj) {
		targetObj[key] = sourceObj[key];
	}

	return targetObj;
}

var Vehicle = {
	// ...
};

// first, create an empty object with
// Vehicle's stuff copied in
var Car = mixin( Vehicle, { } );

// now copy the intended contents into Car
mixin( {
	wheels: 4,

	drive: function() {
		// ...
	}
}, Car );
```

با هر رویکرد، محتوای غیرهم‌پوشان `Vehicle` را صریحاً در `Car` کپی کرده‌ایم. نام «mixin» از روش جایگزین توضیح کار می‌آید: `Car` محتوای `Vehicle` را **mixed-in** دارد، مثل مخلوط کردن چیپس شکلاتی در خمیر کلوچهٔ مورد علاقه‌تان.

در نتیجهٔ عملیات کپی، `Car` تا حدی جدا از `Vehicle` عمل می‌کند. اگر property به `Car` اضافه کنید روی `Vehicle` تأثیر نمی‌گذارد و برعکس.

**یادداشت:** چند جزئیات کوچک اینجا نادیده گرفته شده. هنوز راه‌های ظریفی هست که دو object می‌توانند حتی بعد از کپی «روی هم تأثیر» بگذارند، مثلاً اگر هر دو reference به object مشترکی (مثل آرایه) داشته باشند.

چون دو object referenceهای مشترک به توابع مشترکشان را هم دارند، یعنی **حتی کپی دستی توابع (به‌اصطلاح mixinها) از یک object به دیگری *واقعاً* تکرار واقعی از class به instance که در زبان‌های مبتنی بر class اتفاق می‌افتد را شبیه‌سازی نمی‌کند**.

توابع جاوااسکریپت واقعاً قابل تکرار نیستند (به روش استاندارد و قابل اعتماد)، پس در عوض به **reference تکرارشده** به همان function object مشترک می‌رسید (توابع object هستند؛ فصل ۳ را ببینید). اگر یکی از **function object**های مشترک (مثل `ignition()`) را با اضافه کردن property روی آن تغییر می‌دادید، مثلاً، هر دو `Vehicle` و `Car` از طریق reference مشترک «تحت تأثیر» می‌شدند.

Explicit mixinها مکانیزم خوبی در جاوااسکریپت‌اند. اما قوی‌تر از آنچه واقعاً هستند به نظر می‌رسند. فایدهٔ زیادی *واقعاً* از کپی کردن property از یک object به دیگری حاصل نمی‌شود، **در مقابل فقط دو بار تعریف کردن propertyها**، یک بار روی هر object. و با توجه به ظرافت reference function-object که ذکر کردیم به‌ویژه درست است.

اگر صریحاً دو یا چند object را در object هدف خود mix-in کنید، می‌توانید **تا حدی** رفتار «multiple inheritance» را شبیه‌سازی کنید، اما راه مستقیمی برای رسیدگی به برخوردها اگر همان متد یا property از بیش از یک منبع کپی می‌شود وجود ندارد. بعضی توسعه‌دهندگان/کتابخانه‌ها تکنیک‌های «late binding» و راه‌حل‌های عجیب دیگر ارائه داده‌اند، اما اساساً این «ترفند»ها *معمولاً* بیشتر از نتیجهٔ حاصل زحمت (و کارایی کمتر!) هستند.

فقط جایی از explicit mixin استفاده کنید که واقعاً به خواناتر شدن کد کمک می‌کند، و اگر دیدید کد را سخت‌تر برای ردیابی می‌کند یا وابستگی‌های غیرضروری یا دست‌وپاگیر بین objectها ایجاد می‌کند از الگو اجتناب کنید.

**اگر استفادهٔ درست از mixinها *سخت‌تر* از قبل از استفاده‌شان شد**، احتمالاً باید استفاده از mixinها را متوقف کنید. در واقع، اگر باید از کتابخانه/ابزار پیچیده برای حل همهٔ این جزئیات استفاده کنید، ممکن است نشانهٔ این باشد که راه سخت‌تر را می‌روید، شاید unnecessarily. در فصل ۶، راه ساده‌تری که نتیجهٔ مورد نظر را بدون همهٔ این جنجال حاصل می‌کند را خلاصه می‌کنیم.

#### Parasitic Inheritance

گونه‌ای از این الگوی explicit mixin که هم از بعضی جهات explicit و هم از جهات دیگر implicit است «parasitic inheritance» نامیده می‌شود، که عمدتاً توسط داگلاس کراکفورد رایج شد.

نحوهٔ کارش:

```js
// "Traditional JS Class" `Vehicle`
function Vehicle() {
	this.engines = 1;
}
Vehicle.prototype.ignition = function() {
	console.log( "Turning on my engine." );
};
Vehicle.prototype.drive = function() {
	this.ignition();
	console.log( "Steering and moving forward!" );
};

// "Parasitic Class" `Car`
function Car() {
	// first, `car` is a `Vehicle`
	var car = new Vehicle();

	// now, let's modify our `car` to specialize it
	car.wheels = 4;

	// save a privileged reference to `Vehicle::drive()`
	var vehDrive = car.drive;

	// override `Vehicle::drive()`
	car.drive = function() {
		vehDrive.call( this );
		console.log( "Rolling on all " + this.wheels + " wheels!" );
	};

	return car;
}

var myCar = new Car();

myCar.drive();
// Turning on my engine.
// Steering and moving forward!
// Rolling on all 4 wheels!
```

همان‌طور که می‌بینید، اول کپی تعریف از «parent class» (object) یعنی `Vehicle` می‌گیریم، بعد تعریف «child class» (object) خود را mix-in می‌کنیم (referenceهای ممتاز parent-class را در صورت نیاز حفظ می‌کنیم)، و این object ترکیب‌شده یعنی `car` را به‌عنوان instance فرزندمان می‌دهیم.

**یادداشت:** وقتی `new Car()` فراخوانی می‌کنیم، object جدیدی ساخته و توسط reference یعنی `this` مربوط به `Car` ارجاع می‌شود (فصل ۲ را ببینید). اما چون از آن object استفاده نمی‌کنیم و به‌جای آن object خودمان یعنی `car` را برمی‌گردانیم، object اولیهٔ ساخته‌شده فقط دور انداخته می‌شود. پس `Car()` می‌توانست بدون واژه‌کلیدی `new` فراخوانی شود و قابلیت بالا یکسان می‌بود، اما بدون ساخت/جمع‌آوری زبالهٔ object هدررفته.

### Implicit Mixins

Implicit mixinها به *explicit pseudo-polymorphism* که قبلاً توضیح داده شد نزدیک‌اند. به‌همین دلیل همان هشدارها و احتیاط‌ها را دارند.

این کد را در نظر بگیرید:

```js
var Something = {
	cool: function() {
		this.greeting = "Hello World";
		this.count = this.count ? this.count + 1 : 1;
	}
};

Something.cool();
Something.greeting; // "Hello World"
Something.count; // 1

var Another = {
	cool: function() {
		// implicit mixin of `Something` to `Another`
		Something.cool.call( this );
	}
};

Another.cool();
Another.greeting; // "Hello World"
Another.count; // 1 (not shared state with `Something`)
```

با `Something.cool.call( this )` که می‌تواند در فراخوانی «constructor» (رایج‌ترین) یا در فراخوانی متد (اینجا نشان داده‌شده) اتفاق بیفتد، اساساً تابع `Something.cool()` را «قرض» می‌گیریم و در context یعنی `Another` (از طریق binding مربوط به `this`؛ فصل ۲ را ببینید) به‌جای `Something` فراخوانی می‌کنیم. نتیجهٔ نهایی این است که انتساب‌هایی که `Something.cool()` می‌کند علیه object یعنی `Another` به‌جای object یعنی `Something` اعمال می‌شوند.

پس گفته می‌شود رفتار `Something` را با (یا در) `Another` «mixed in» کردیم.

هرچند این نوع تکنیک به نظر از قابلیت rebinding مربوط به `this` بهرهٔ مفید می‌برد، همان فراخوانی شکنندهٔ `Something.cool.call( this )` است که نمی‌توان به ارجاع نسبی (و بنابراین انعطاف‌پذیرتر) تبدیلش کرد که باید **با احتیاط به آن توجه کنید**. به‌طور کلی **در صورت امکان از چنین ساختارهایی اجتناب کنید** تا کد تمیزتر و قابل نگهداری‌تر بماند.
