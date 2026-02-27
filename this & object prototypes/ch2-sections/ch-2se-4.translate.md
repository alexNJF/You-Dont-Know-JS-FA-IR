# استثناهای binding

مثل همیشه، *استثنا*هایی برای «قوانین» وجود دارد.

رفتار binding مربوط به `this` در بعضی سناریوها می‌تواند غیرمنتظره باشد، جایی که binding دیگری در نظر داشتید اما به رفتار binding از قانون *default binding* می‌رسید (قبلی را ببینید).

### نادیده گرفتن `this`

اگر `null` یا `undefined` را به‌عنوان پارامتر binding مربوط به `this` به `call`، `apply` یا `bind` پاس دهید، آن مقادیر عملاً نادیده گرفته می‌شوند و به‌جای آن قانون *default binding* به فراخوانی اعمال می‌شود.

```js
function foo() {
	console.log( this.a );
}

var a = 2;

foo.call( null ); // 2
```

چرا عمداً چیزی مثل `null` برای binding مربوط به `this` پاس می‌دهید؟

کاملاً رایج است که از `apply(..)` برای پخش کردن آرایه‌های مقدار به‌عنوان پارامتر به فراخوانی تابع استفاده شود. به‌طور مشابه، `bind(..)` می‌تواند پارامترها را curry کند (مقادیر از پیش تنظیم‌شده)، که می‌تواند خیلی مفید باشد.

```js
function foo(a,b) {
	console.log( "a:" + a + ", b:" + b );
}

// spreading out array as parameters
foo.apply( null, [2, 3] ); // a:2, b:3

// currying with `bind(..)`
var bar = foo.bind( null, 2 );
bar( 3 ); // a:2, b:3
```

هر دو این ابزارها برای پارامتر اول به یک binding مربوط به `this` نیاز دارند. اگر توابع مورد نظر به `this` اهمیت ندهند، به مقدار placeholder نیاز دارید، و `null` ممکن است انتخاب معقولی به نظر برسد همان‌طور که در این قطعه نشان داده شده.

**یادداشت:** در این کتاب پوشش نمی‌دهیم، اما ES6 عملگر spread یعنی `...` دارد که به شما اجازه می‌دهد به‌صورت نحوی آرایه را به‌عنوان پارامتر «پخش» کنید بدون نیاز به `apply(..)`، مثل `foo(...[1,2])` که معادل `foo(1,2)` است — به‌صورت نحوی اجتناب از binding مربوط به `this` اگر لازم نباشد. متأسفانه جایگزین نحوی ES6 برای currying وجود ندارد، پس پارامتر `this` فراخوانی `bind(..)` هنوز نیاز به توجه دارد.

با این حال، خطر پنهان کوچکی در همیشه استفاده از `null` وقتی به binding مربوط به `this` اهمیت نمی‌دهید وجود دارد. اگر هرگز آن را برای فراخوانی تابعی استفاده کنید (مثلاً تابع کتابخانهٔ شخص ثالث که کنترلش را ندارید)، و آن تابع *واقعاً* ارجاعی به `this` دارد، قانون *default binding* یعنی ممکن است ناخواسته به global object (`window` در مرورگر) ارجاع دهد (یا بدتر، تغییرش دهد!).

واضح است که چنین دامی می‌تواند به انواع باگ‌های *خیلی سخت* برای تشخیص/ردیابی منجر شود.

#### `this` امن‌تر

شاید عمل کمی «امن‌تر» پاس دادن objectی است که مشخصاً برای `this` تنظیم شده و تضمین شده objectی نیست که بتواند اثرات جانبی مشکل‌دار در برنامه ایجاد کند. با وام گرفتن اصطلاح از شبکه (و نظامی)، می‌توانیم یک object «DMZ» (منطقه غیرنظامی) بسازیم — چیزی خاص‌تر از یک object کاملاً خالی و غیر delegateشده نیست (فصل‌های ۵ و ۶ را ببینید).

اگر همیشه برای bindingهای مربوط به `this` نادیده‌شده‌ای که فکر می‌کنیم نیازی به توجه نداریم یک object DMZ پاس دهیم، مطمئنیم هر استفادهٔ پنهان/غیرمنتظره از `this` به object خالی محدود می‌شود، که global object برنامهٔ ما را از اثرات جانبی عایق می‌کند.

چون این object کاملاً خالی است، شخصاً دوست دارم نام متغیرش را `ø` بگذارم (نماد ریاضی مجموعهٔ خالی). روی بسیاری صفحه‌کلیدها (مثل چیدمان US روی Mac)، این نماد با `⌥`+`o` (option+`o`) به‌راحتی تایپ می‌شود. بعضی سیستم‌ها هم به شما اجازه می‌دهند hotkey برای نمادهای خاص تنظیم کنید. اگر نماد `ø` را دوست ندارید یا صفحه‌کلیدتان تایپش را آسان نمی‌کند، البته هرچه خواستید بنامیدش.

هرچه بنامیدش، ساده‌ترین راه تنظیمش به‌عنوان **کاملاً خالی** استفاده از `Object.create(null)` است (فصل ۵ را ببینید). `Object.create(null)` شبیه `{ }` است، اما بدون delegation به `Object.prototype`، پس «خالی‌تر» از فقط `{ }` است.

```js
function foo(a,b) {
	console.log( "a:" + a + ", b:" + b );
}

// our DMZ empty object
var ø = Object.create( null );

// spreading out array as parameters
foo.apply( ø, [2, 3] ); // a:2, b:3

// currying with `bind(..)`
var bar = foo.bind( ø, 2 );
bar( 3 ); // a:2, b:3
```

نه فقط از نظر عملکردی «امن‌تر»، نوعی فایدهٔ سبکی به `ø` هست، که از نظر معنایی «می‌خواهم `this` خالی باشد» را کمی روشن‌تر از `null` منتقل می‌کند. اما باز هم، object DMZ خود را هرچه ترجیح می‌دهید نام بگذارید.

### ارجاع غیرمستقیم

نکتهٔ دیگر این است که می‌توانید (عمداً یا نه!) «ارجاع‌های غیرمستقیم» به توابع ایجاد کنید، و در آن موارد وقتی آن ارجاع تابع فراخوانی می‌شود، قانون *default binding* هم اعمال می‌شود.

یکی از رایج‌ترین راه‌های وقوع *indirect reference*ها از انتساب است:

```js
function foo() {
	console.log( this.a );
}

var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4 };

o.foo(); // 3
(p.foo = o.foo)(); // 2
```

*مقدار نتیجه* عبارت انتساب `p.foo = o.foo` ارجاعی به فقط خود function object زیرین است. به‌همین دلیل، call-site مؤثر فقط `foo()` است، نه `p.foo()` یا `o.foo()` آن‌طور که ممکن است انتظار داشته باشید. طبق قوانین بالا، قانون *default binding* اعمال می‌شود.

یادآوری: صرف‌نظر از نحوهٔ رسیدن به فراخوانی تابع با قانون *default binding*، وضعیت `strict mode` در **محتوای** تابع فراخوانی‌شده که ارجاع به `this` دارد — نه call-site تابع — مقدار *default binding* را تعیین می‌کند: یا global object اگر در non-`strict mode` یا `undefined` اگر در `strict mode`.

### نرم‌سازی binding

قبلاً دیدیم که *hard binding* یکی از راه‌بردها برای جلوگیری از افتادن ناخواستهٔ فراخوانی تابع به قانون *default binding* بود، با وادار کردنش به bind شدن به `this` خاص (مگر با `new` برای override کردنش!). مشکل این است که *hard-binding* انعطاف تابع را به‌شدت کم می‌کند و override دستی `this` را با *implicit binding* یا حتی تلاش‌های بعدی *explicit binding* جلوگیری می‌کند.

خوب می‌بود اگر راهی برای فراهم کردن پیش‌فرض متفاوتی برای *default binding* (نه `global` یا `undefined`) بود، در حالی که تابع هنوز بتواند با تکنیک‌های *implicit binding* یا *explicit binding* دستی به `this` bind شود.

می‌توانیم ابزاری به‌نام *soft binding* بسازیم که رفتار مورد نظر ما را شبیه‌سازی کند.

```js
if (!Function.prototype.softBind) {
	Function.prototype.softBind = function(obj) {
		var fn = this,
			curried = [].slice.call( arguments, 1 ),
			bound = function bound() {
				return fn.apply(
					(!this ||
						(typeof window !== "undefined" &&
							this === window) ||
						(typeof global !== "undefined" &&
							this === global)
					) ? obj : this,
					curried.concat.apply( curried, arguments )
				);
			};
		bound.prototype = Object.create( fn.prototype );
		return bound;
	};
}
```

ابزار `softBind(..)` ارائه‌شده اینجا شبیه ابزار داخلی ES5 یعنی `bind(..)` کار می‌کند، جز با رفتار *soft binding* ما. تابع مشخص‌شده را در منطقی wrap می‌کند که در زمان فراخوانی `this` را بررسی می‌کند و اگر `global` یا `undefined` بود از پیش‌فرض *جایگزین* از پیش مشخص‌شده (`obj`) استفاده می‌کند. وگرنه `this` دست‌نخورده می‌ماند. همچنین currying اختیاری هم فراهم می‌کند (بحث `bind(..)` قبلی را ببینید).

کاربردش را نشان می‌دهیم:

```js
function foo() {
   console.log("name: " + this.name);
}

var obj = { name: "obj" },
    obj2 = { name: "obj2" },
    obj3 = { name: "obj3" };

var fooOBJ = foo.softBind( obj );

fooOBJ(); // name: obj

obj2.foo = foo.softBind(obj);
obj2.foo(); // name: obj2   <---- look!!!

fooOBJ.call( obj3 ); // name: obj3   <---- look!

setTimeout( obj2.foo, 10 ); // name: obj   <---- falls back to soft-binding
```

نسخهٔ soft-bound تابع `foo()` می‌تواند دستی به `obj2` یا `obj3` به `this` bind شود همان‌طور که نشان داده شد، اما اگر *default binding* در غیر این صورت اعمال می‌شد به `obj` برمی‌گردد.
