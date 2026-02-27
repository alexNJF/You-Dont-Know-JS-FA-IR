# توابع به‌عنوان مقادیر

تا اینجا، functionها را به‌عنوان مکانیزم اصلی *scope* در جاوااسکریپت بحث کردیم. نحو اعلان معمول `function` را به یاد دارید:

```js
function foo() {
	// ..
}
```

اگرچه از آن نحو ممکن است آشکار نباشد، `foo` اساساً فقط یک متغیر در scope محاط‌کنندهٔ بیرونی است که به آن reference به `function` در حال اعلان داده شده است. یعنی خود `function` یک مقدار است، درست مانند `42` یا `[1,2,3]`.

این ممکن است در ابتدا مفهومی عجیب به نظر برسد، پس لحظه‌ای تأمل کنید. نه تنها می‌توانید یک مقدار (آرگومان) *به* یک function پاس دهید، بلکه *خود یک function می‌تواند مقداری باشد* که به متغیرها اختصاص داده می‌شود، یا به functionهای دیگر پاس داده می‌شود یا از آن‌ها برگردانده می‌شود.

به همین ترتیب، یک مقدار function باید به‌عنوان یک expression در نظر گرفته شود، درست مانند هر مقدار یا expression دیگری.

در نظر بگیرید:

```js
var foo = function() {
	// ..
};

var x = function bar(){
	// ..
};
```

اولین function expression اختصاص‌یافته به متغیر `foo` *anonymous* نامیده می‌شود چون نامی ندارد.

دومین function expression *named* است (`bar`)، حتی اگر reference به آن نیز به متغیر `x` اختصاص داده شده باشد. *named function expression*ها عموماً ترجیح داده می‌شوند، اگرچه *anonymous function expression*ها هنوز بسیار رایج هستند.

برای اطلاعات بیشتر، به عنوان *Scope & Closures* این مجموعه مراجعه کنید.

### Immediately Invoked Function Expressions (IIFEs)

در قطعهٔ قبلی، هیچ‌کدام از function expressionها اجرا نشدند — می‌توانستیم اگر مثلاً `foo()` یا `x()` را شامل می‌کردیم.

راه دیگری برای اجرای یک function expression وجود دارد که معمولاً *immediately invoked function expression* (IIFE) نامیده می‌شود:

```js
(function IIFE(){
	console.log( "Hello!" );
})();
// "Hello!"
```

`( .. )` بیرونی که function expression یعنی `(function IIFE(){ .. })` را احاطه می‌کند فقط یک nuance دستوری JS است که برای جلوگیری از برخورد شدن به‌عنوان یک اعلان function معمولی لازم است.

`()` نهایی در انتهای expression — خط `})();` — همان چیزی است که در واقع function expression ارجاع‌داده‌شده بلافاصله قبل از آن را اجرا می‌کند.

ممکن است عجیب به نظر برسد، اما به اندازهٔ نگاه اول بیگانه نیست. شباهت‌های بین `foo` و `IIFE` را اینجا در نظر بگیرید:

```js
function foo() { .. }

// `foo` function reference expression,
// then `()` executes it
foo();

// `IIFE` function expression,
// then `()` executes it
(function IIFE(){ .. })();
```

همان‌طور که می‌بینید، قرار دادن `(function IIFE(){ .. })` قبل از `()` اجراکنندهٔ آن اساساً همان شامل کردن `foo` قبل از `()` اجراکنندهٔ آن است؛ در هر دو مورد، reference به function بلافاصله بعد از آن با `()` اجرا می‌شود.

چون یک IIFE فقط یک function است، و functionها scope متغیر ایجاد می‌کنند، استفاده از IIFE به این شکل اغلب برای اعلان متغیرهایی استفاده می‌شود که کد اطراف خارج از IIFE را تحت تأثیر قرار نمی‌دهند:

```js
var a = 42;

(function IIFE(){
	var a = 10;
	console.log( a );	// 10
})();

console.log( a );		// 42
```

IIFEها می‌توانند مقادیر برگشتی هم داشته باشند:

```js
var x = (function IIFE(){
	return 42;
})();

x;	// 42
```

مقدار `42` از function با نام `IIFE` در حال اجرا `return` می‌شود، و سپس به `x` اختصاص می‌یابد.

### Closure

*Closure* یکی از مهم‌ترین و اغلب کم‌درک‌شده‌ترین مفاهیم در جاوااسکریپت است. آن را به‌طور عمیق اینجا پوشش نمی‌دهم، و در عوض شما را به عنوان *Scope & Closures* این مجموعه ارجاع می‌دهم. اما می‌خواهم چند نکته دربارهٔ آن بگویم تا مفهوم کلی را درک کنید. یکی از مهم‌ترین تکنیک‌ها در مهارت‌های JS شما خواهد بود.

می‌توانید closure را به‌عنوان راهی برای «به خاطر سپردن» و ادامهٔ دسترسی به scope یک function (متغیرهای آن) حتی پس از اتمام اجرای function در نظر بگیرید.

در نظر بگیرید:

```js
function makeAdder(x) {
	// parameter `x` is an inner variable

	// inner function `add()` uses `x`, so
	// it has a "closure" over it
	function add(y) {
		return y + x;
	};

	return add;
}
```

reference به function داخلی `add(..)` که با هر فراخوانی به `makeAdder(..)` بیرونی برگردانده می‌شود می‌تواند هر مقدار `x` که به `makeAdder(..)` پاس داده شده را به خاطر بسپارد. حالا، بیایید از `makeAdder(..)` استفاده کنیم:

```js
// `plusOne` gets a reference to the inner `add(..)`
// function with closure over the `x` parameter of
// the outer `makeAdder(..)`
var plusOne = makeAdder( 1 );

// `plusTen` gets a reference to the inner `add(..)`
// function with closure over the `x` parameter of
// the outer `makeAdder(..)`
var plusTen = makeAdder( 10 );

plusOne( 3 );		// 4  <-- 1 + 3
plusOne( 41 );		// 42 <-- 1 + 41

plusTen( 13 );		// 23 <-- 10 + 13
```

بیشتر دربارهٔ نحوهٔ کار این کد:

1. وقتی `makeAdder(1)` را فراخوانی می‌کنیم، reference به `add(..)` داخلی آن برمی‌گردیم که `x` را به‌عنوان `1` به خاطر می‌سپارد. این reference به function را `plusOne(..)` می‌نامیم.
2. وقتی `makeAdder(10)` را فراخوانی می‌کنیم، reference دیگری به `add(..)` داخلی آن برمی‌گردیم که `x` را به‌عنوان `10` به خاطر می‌سپارد. این reference به function را `plusTen(..)` می‌نامیم.
3. وقتی `plusOne(3)` را فراخوانی می‌کنیم، `3` (یعنی `y` داخلی آن) را به `1` (به خاطر سپرده‌شده توسط `x`) اضافه می‌کند، و `4` را به‌عنوان نتیجه می‌گیریم.
4. وقتی `plusTen(13)` را فراخوانی می‌کنیم، `13` (یعنی `y` داخلی آن) را به `10` (به خاطر سپرده‌شده توسط `x`) اضافه می‌کند، و `23` را به‌عنوان نتیجه می‌گیریم.

نگران نباشید اگر در ابتدا عجیب و گیج‌کننده به نظر می‌رسد — می‌تواند باشد! درک کامل آن تمرین زیادی می‌خواهد.

اما به من اعتماد کنید، وقتی درک کنید، یکی از قدرتمندترین و مفیدترین تکنیک‌ها در کل برنامه‌نویسی است. قطعاً ارزشش را دارد که مغز خود را کمی روی closureها بجوشانید. در بخش بعدی، کمی بیشتر با closure تمرین خواهیم کرد.

#### Modules

رایج‌ترین کاربرد closure در جاوااسکریپت الگوی module است. moduleها به شما اجازه می‌دهند جزئیات پیاده‌سازی خصوصی (متغیرها، functionها) را تعریف کنید که از دنیای بیرون پنهان هستند، و همچنین یک API عمومی که *از بیرون* قابل دسترسی است.

در نظر بگیرید:

```js
function User(){
	var username, password;

	function doLogin(user,pw) {
		username = user;
		password = pw;

		// do the rest of the login work
	}

	var publicAPI = {
		login: doLogin
	};

	return publicAPI;
}

// create a `User` module instance
var fred = User();

fred.login( "fred", "12Battery34!" );
```

تابع `User()` به‌عنوان scope بیرونی عمل می‌کند که متغیرهای `username` و `password` و همچنین function داخلی `doLogin()` را نگه می‌دارد؛ این‌ها همگی جزئیات داخلی خصوصی این module `User` هستند که نمی‌توان از دنیای بیرون به آن‌ها دسترسی داشت.

**Warning:** ما عمداً اینجا `new User()` را فراخوانی نمی‌کنیم، علیرغم اینکه احتمالاً برای اکثر خوانندگان رایج‌تر به نظر می‌رسد. `User()` فقط یک function است، نه یک class برای instantiate شدن، بنابراین فقط به‌طور معمول فراخوانی می‌شود. استفاده از `new` نامناسب و در واقع اتلاف منابع خواهد بود.

اجرای `User()` یک *instance* از module `User` ایجاد می‌کند — یک scope کاملاً جدید ایجاد می‌شود، و بنابراین یک کپی کاملاً جدید از هر یک از این متغیرها/functionهای داخلی. این instance را به `fred` اختصاص می‌دهیم. اگر دوباره `User()` را اجرا کنیم، instance کاملاً جداگانه‌ای از `fred` می‌گیریم.

function داخلی `doLogin()` closure روی `username` و `password` دارد، یعنی حتی پس از اتمام اجرای function `User()` دسترسی خود به آن‌ها را حفظ می‌کند.

`publicAPI` یک object با یک ویژگی/متد روی آن است، یعنی `login`، که reference به function داخلی `doLogin()` است. وقتی `publicAPI` را از `User()` برمی‌گردانیم، به instance‌ای تبدیل می‌شود که آن را `fred` می‌نامیم.

در این مرحله، function بیرونی `User()` اجرای خود را تمام کرده است. معمولاً فکر می‌کنید متغیرهای داخلی مانند `username` و `password` از بین رفته‌اند. اما اینجا از بین نرفته‌اند، چون closure در function `login()` آن‌ها را زنده نگه می‌دارد.

به همین دلیل می‌توانیم `fred.login(..)` را فراخوانی کنیم — همان فراخوانی function داخلی `doLogin(..)` — و هنوز می‌تواند به متغیرهای داخلی `username` و `password` دسترسی داشته باشد.

احتمال خوبی وجود دارد که با این نگاه کوتاه به closure و الگوی module، برخی از آن هنوز کمی گیج‌کننده باشد. اشکالی ندارد! کمی کار می‌خواهد تا مغزتان دور آن بچرخد.

از اینجا، عنوان *Scope & Closures* این مجموعه را برای کاوش بسیار عمیق‌تر بخوانید.

