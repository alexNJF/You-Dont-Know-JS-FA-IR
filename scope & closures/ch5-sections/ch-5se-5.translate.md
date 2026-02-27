# ماژول‌ها

الگوهای کد دیگری وجود دارند که قدرت closure را leverage می‌کنند اما در سطح به‌نظر دربارهٔ callback نیستند. بیایید قدرتمندترین آن‌ها را بررسی کنیم: *ماژول*.

```js
function foo() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}
}
```

همان‌طور که این کد الان ایستاده، closure قابل مشاهده‌ای در کار نیست. به‌سادگی چند متغیر دادهٔ خصوصی `something` و `another` و چند تابع درونی `doSomething()` و `doAnother()` داریم که هر دو lexical scope (و بنابراین closure!) روی scope درونی `foo()` دارند.

اما اکنون در نظر بگیرید:

```js
function CoolModule() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}

	return {
		doSomething: doSomething,
		doAnother: doAnother
	};
}

var foo = CoolModule();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```

این الگوی JavaScript است که *ماژول* می‌نامیم. رایج‌ترین راه پیاده‌سازی الگوی ماژول اغلب «Revealing Module» نامیده می‌شود و تنوعی است که اینجا ارائه می‌دهیم.

بیایید چند چیز دربارهٔ این کد بررسی کنیم.

اول، `CoolModule()` فقط یک تابع است، اما *باید فراخوانی شود* تا نمونهٔ ماژول ایجاد شود. بدون اجرای تابع بیرونی، ایجاد scope درونی و closureها رخ نمی‌دهد.

دوم، تابع `CoolModule()` یک شیء برمی‌گرداند، که با نحو object-literal `{ key: value, ... }` مشخص شده. شیءی که برمی‌گردانیم ارجاع‌هایی به توابع درونی ما دارد، اما *نه* به متغیرهای دادهٔ درونی. آن‌ها را پنهان و خصوصی نگه می‌داریم. مناسب است این شیء مقدار برگشتی را اساساً **API عمومی برای ماژولمان** بدانیم.

این شیء مقدار برگشتی در نهایت به متغیر بیرونی `foo` انتساب می‌یابد و سپس می‌توانیم به آن متدهای ویژگی روی API دسترسی داشته باشیم، مثل `foo.doSomething()`.

**توجه:** لازم نیست شیء واقعی (literal) از ماژول برگردانیم. می‌توانستیم فقط یک تابع درونی مستقیماً برگردانیم. jQuery در واقع مثال خوبی است. شناسه‌های `jQuery` و `$` API عمومی برای ماژول «jQuery» هستند، اما خودشان فقط یک تابع هستند (که می‌تواند خودش ویژگی داشته باشد، چون تمام توابع شیء هستند).

توابع `doSomething()` و `doAnother()` closure روی scope درونی «نمونه» ماژول دارند (که با فراخوانی واقعی `CoolModule()` به آن رسیدیم). وقتی آن توابع را با ارجاع‌های ویژگی روی شیءی که برمی‌گردانیم خارج از lexical scope منتقل می‌کنیم، اکنون شرایطی ایجاد کرده‌ایم که closure می‌تواند مشاهده و اعمال شود.

برای بیان ساده‌تر، دو «نیاز» برای اعمال الگوی ماژول وجود دارد:

1. باید تابع محصور بیرونی وجود داشته باشد و حداقل یک بار فراخوانی شود (هر بار نمونهٔ ماژول جدیدی ایجاد می‌کند).

2. تابع محصور باید حداقل یک تابع درونی برگرداند تا این تابع درونی closure روی scope خصوصی داشته باشد و بتواند به آن state خصوصی دسترسی و/یا آن را تغییر دهد.

شیءی با ویژگی تابع روی آن به‌تنهایی *واقعاً* ماژول نیست. شیءی که از فراخوانی تابع برگردانده می‌شود که فقط ویژگی‌های داده روی آن دارد و توابع closured ندارد *واقعاً* ماژول نیست، به‌معنای قابل مشاهده.

تکه کد بالا سازندهٔ ماژول standalone به‌نام `CoolModule()` را نشان می‌دهد که می‌توان هر تعداد بار فراخوانی کرد، هر بار نمونهٔ ماژول جدیدی ایجاد می‌کند. تنوع جزئی این الگو وقتی است که فقط می‌خواهید یک نمونه داشته باشید، نوعی «singleton»:

```js
var foo = (function CoolModule() {
	var something = "cool";
	var another = [1, 2, 3];

	function doSomething() {
		console.log( something );
	}

	function doAnother() {
		console.log( another.join( " ! " ) );
	}

	return {
		doSomething: doSomething,
		doAnother: doAnother
	};
})();

foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```

اینجا تابع ماژولمان را به IIFE تبدیل کردیم (فصل ۳ را ببینید) و *بلافاصله* آن را فراخوانی کردیم و مقدار برگشتی را مستقیماً به شناسهٔ نمونهٔ ماژول تکی `foo` انتساب دادیم.

ماژول‌ها فقط توابع هستند، پس می‌توانند پارامتر بگیرند:

```js
function CoolModule(id) {
	function identify() {
		console.log( id );
	}

	return {
		identify: identify
	};
}

var foo1 = CoolModule( "foo 1" );
var foo2 = CoolModule( "foo 2" );

foo1.identify(); // "foo 1"
foo2.identify(); // "foo 2"
```

تنوع جزئی اما قدرتمند دیگر الگوی ماژول نام دادن شیءی است که به‌عنوان API عمومی خود برمی‌گردانید:

```js
var foo = (function CoolModule(id) {
	function change() {
		// modifying the public API
		publicAPI.identify = identify2;
	}

	function identify1() {
		console.log( id );
	}

	function identify2() {
		console.log( id.toUpperCase() );
	}

	var publicAPI = {
		change: change,
		identify: identify1
	};

	return publicAPI;
})( "foo module" );

foo.identify(); // foo module
foo.change();
foo.identify(); // FOO MODULE
```

با نگه داشتن ارجاع درونی به شیء API عمومی داخل نمونهٔ ماژول خود، می‌توانید آن نمونهٔ ماژول را **از داخل** تغییر دهید، از جمله اضافه و حذف متدها، ویژگی‌ها، *و* تغییر مقادیر آن‌ها.

### ماژول‌های مدرن

بارگذاران/مدیران وابستگی ماژول مختلف اساساً این الگوی تعریف ماژول را در API دوستانه می‌پیچند. به‌جای بررسی کتابخانهٔ خاصی، اجازه دهید *فقط* proof of concept بسیار ساده‌ای **فقط برای اهداف توضیحی** ارائه دهم:

```js
var MyModules = (function Manager() {
	var modules = {};

	function define(name, deps, impl) {
		for (var i=0; i<deps.length; i++) {
			deps[i] = modules[deps[i]];
		}
		modules[name] = impl.apply( impl, deps );
	}

	function get(name) {
		return modules[name];
	}

	return {
		define: define,
		get: get
	};
})();
```

بخش کلیدی این کد `modules[name] = impl.apply(impl, deps)` است. این فراخوانی تابع wrapper تعریف برای یک ماژول است (منتقل کردن هر وابستگی)، و ذخیرهٔ مقدار برگشتی، API ماژول، در لیست داخلی ماژول‌های tracked شده با نام.

و اینطور ممکن است آن را برای تعریف چند ماژول استفاده کنم:

```js
MyModules.define( "bar", [], function(){
	function hello(who) {
		return "Let me introduce: " + who;
	}

	return {
		hello: hello
	};
} );

MyModules.define( "foo", ["bar"], function(bar){
	var hungry = "hippo";

	function awesome() {
		console.log( bar.hello( hungry ).toUpperCase() );
	}

	return {
		awesome: awesome
	};
} );

var bar = MyModules.get( "bar" );
var foo = MyModules.get( "foo" );

console.log(
	bar.hello( "hippo" )
); // Let me introduce: hippo

foo.awesome(); // LET ME INTRODUCE: HIPPO
```

هر دو ماژول «foo» و «bar» با تابعی که API عمومی برمی‌گرداند تعریف شده‌اند. «foo» حتی نمونهٔ «bar» را به‌عنوان پارامتر وابستگی می‌گیرد و می‌تواند بر اساس آن استفاده کند.

زمانی صرف بررسی این تکه کدها کنید تا قدرت closure را برای اهداف خوب خودمان کاملاً درک کنید. نکتهٔ کلیدی این است که واقعاً «جادوی» خاصی در مدیران ماژول نیست. آن‌ها هر دو ویژگی الگوی ماژول که بالا لیست کردم را برآورده می‌کنند: فراخوانی تابع wrapper تعریف، و نگه داشتن مقدار برگشتی به‌عنوان API آن ماژول.

به عبارت دیگر، ماژول‌ها فقط ماژول هستند، حتی اگر ابزار wrapper دوستانه‌ای روی آن‌ها بگذارید.

### ماژول‌های آینده

ES6 پشتیبانی نحو درجهٔ اول برای مفهوم ماژول‌ها اضافه می‌کند. وقتی از طریق سیستم ماژول بارگذاری می‌شوند، ES6 فایل را به‌عنوان ماژول مجزا برخورد می‌کند. هر ماژول می‌تواند هم ماژول‌های دیگر یا اعضای API خاص را import کند و هم اعضای API عمومی خود را export کند.

**توجه:** ماژول‌های مبتنی بر تابع الگوی شناخته‌شدهٔ ایستا نیستند (چیزی که کامپایلر می‌داند)، پس معناشناسی API آن‌ها تا run-time در نظر گرفته نمی‌شوند. یعنی می‌توانید در واقع API ماژول را در run-time تغییر دهید (بحث `publicAPI` قبلی را ببینید).

در مقابل، APIهای ماژول ES6 ایستا هستند (APIها در run-time تغییر نمی‌کنند). چون کامپایلر *آن* را می‌داند، می‌تواند (و می‌کند!) در حین (بارگذاری فایل و) کامپایل چک کند که ارجاع به عضوی از API ماژول import شده *واقعاً وجود دارد*. اگر ارجاع API وجود نداشته باشد، کامپایلر خطای «زودهنگام» در compile-time پرتاب می‌کند، به‌جای انتظار برای حل سنتی run-time پویا (و خطاها، در صورت وجود).

ماژول‌های ES6 فرمت «inline» ندارند، باید در فایل‌های مجزا تعریف شوند (یکی برای هر ماژول). مرورگرها/موتورها یک «module loader» پیش‌فرض دارند (که قابل override است، اما فراتر از بحث ماست) که فایل ماژول را هنگام import به‌طور همزمان بارگذاری می‌کند.

در نظر بگیرید:

**bar.js**
```js
function hello(who) {
	return "Let me introduce: " + who;
}

export hello;
```

**foo.js**
```js
// import only `hello()` from the "bar" module
import hello from "bar";

var hungry = "hippo";

function awesome() {
	console.log(
		hello( hungry ).toUpperCase()
	);
}

export awesome;
```

```js
// import the entire "foo" and "bar" modules
module foo from "foo";
module bar from "bar";

console.log(
	bar.hello( "rhino" )
); // Let me introduce: rhino

foo.awesome(); // LET ME INTRODUCE: HIPPO
```

**توجه:** فایل‌های مجزا **«foo.js»** و **«bar.js»** باید ایجاد شوند، با محتوا همان‌طور که در دو تکه اول نشان داده شد. سپس برنامهٔ شما آن ماژول‌ها را برای استفاده بارگذاری/import می‌کند، همان‌طور که در تکه سوم نشان داده شد.

`import` یک یا چند عضو از API ماژول را به scope فعلی import می‌کند، هر کدام به متغیر bound (`hello` در مورد ما). `module` کل API ماژول را به متغیر bound (`foo`، `bar` در مورد ما) import می‌کند. `export` شناسه (متغیر، تابع) را به API عمومی ماژول فعلی export می‌کند. این عملگرها می‌توانند هر تعداد لازم در تعریف ماژول استفاده شوند.

محتوای داخل *فایل ماژول* طوری برخورد می‌شود انگار در scope closure محصور شده، درست مثل ماژول‌های function-closure قبلی.
