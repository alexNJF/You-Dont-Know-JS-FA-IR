# Arrow Functions

در ابتدای این فصل به پیچیدگی‌های binding مربوط به `this` در functionها اشاره کردیم (جزئیات کامل در کتاب *this & Object Prototypes*). فهمیدن دردسرهای برنامه‌نویسی مبتنی بر `this` با functionهای معمولی مهم است، چون انگیزهٔ اصلی قابلیت جدید `=>` در ES6 همین‌جاست.

اول ظاهر arrow function را در مقایسه با function معمولی ببینیم:

```js
function foo(x,y) {
	return x + y;
}

// versus

var foo = (x,y) => x + y;
```

تعریف arrow function شامل لیست پارامترهاست (صفر یا بیشتر؛ و اگر دقیقاً یک پارامتر نباشد باید `( .. )` داشته باشد)، بعد نشانهٔ `=>`، و سپس body تابع.

پس در snippet بالا، خود arrow function همان `(x,y) => x + y` است و reference آن در `foo` ذخیره شده.

body فقط وقتی باید `{ .. }` داشته باشد که بیش از یک expression داشته باشد یا statement غیر-expression داشته باشد. اگر فقط یک expression باشد و `{ .. }` را حذف کنید، یک `return` ضمنی جلوی expression در نظر گرفته می‌شود.

چند شکل دیگر:

```js
var f1 = () => 12;
var f2 = x => x * 2;
var f3 = (x,y) => {
	var z = x * 2 + y;
	y++;
	x *= 3;
	return (x + y + z) / 2;
};
```

arrow functionها *همیشه* function expression هستند؛ چیزی به نام arrow function declaration نداریم. همچنین expressionهای anonymous هستند -- اسم lexical برای recursion یا event binding/unbinding ندارند -- هرچند در فصل ۷ ("Function Names") دربارهٔ name inference برای debugging صحبت می‌شود.

**نکته:** همهٔ قابلیت‌های پارامتر functionهای معمولی در arrow function هم هست: default value، destructuring، rest parameter و ...

arrow functionها syntax کوتاه و جذابی دارند و روی کاغذ برای terse code وسوسه‌کننده‌اند. تقریباً بیشتر منابع ES6 (غیر از همین مجموعه) خیلی سریع arrow function را «تابع جدید» تلقی می‌کنند.

جالب است که تقریباً همهٔ مثال‌های `=>` مثال‌های کوتاه تک‌statement هستند، مثل callback utilityها:

```js
var a = [1,2,3,4,5];

a = a.map( v => v * 2 );

console.log( a );				// [2,4,6,8,10]
```

در چنین سناریوهایی، وقتی function expression inline کوتاه دارید که در یک statement محاسبه می‌کند و نتیجه را برمی‌گرداند، arrow function واقعاً جایگزین سبک و خوبی برای `function` پرحرف‌تر است.

بیشتر آدم‌ها معمولاً با دیدن این نمونه‌ها ذوق می‌کنند -- احتمالاً شما هم همین الآن!

اما به نظر من استفاده از syntax arrow برای functionهای معمولیِ چند statement (خصوصاً آن‌هایی که طبیعتاً function declaration هستند) می‌تواند misapplication این قابلیت باشد.

مثال `dollabillsyall(..)` از همین فصل را به `=>` تبدیل کنیم:

```js
var dollabillsyall = (strings, ...values) =>
	strings.reduce( (s,v,idx) => {
		if (idx > 0) {
			if (typeof values[idx-1] == "number") {
				// look, also using interpolated
				// string literals!
				s += `$${values[idx-1].toFixed( 2 )}`;
			}
			else {
				s += values[idx-1];
			}
		}

		return s + v;
	}, "" );
```

اینجا فقط `function` و `return` و بخشی از `{ .. }` حذف شده و `=>` و `var` آمده. آیا خوانایی واقعاً بهتر شده؟ خیلی نه.

حتی می‌شود گفت حذف `return` و `{ .. }` بیرونی کمی پنهان می‌کند که `reduce(..)` تنها statement تابع `dollabillsyall(..)` است و خروجی آن همان خروجی نهایی تابع است. ضمن اینکه چشمی که عادت دارد مرز scope را با کلمهٔ `function` پیدا کند، حالا باید دنبال `=>` بگردد که در شلوغی کد سخت‌تر پیدا می‌شود.

قاعدهٔ سخت نیست، ولی معمولاً سود خوانایی ناشی از تبدیل به `=>` با طول function نسبت عکس دارد: هرچه تابع بلندتر، سود کمتر؛ هرچه کوتاه‌تر، اثر بهتر.

منطقی‌تر این است که `=>` را برای inline function expressionهای کوتاه به‌کار ببرید و functionهای اصلی با طول معمول را همان حالت قبلی نگه دارید.

### Not Just Shorter Syntax, But `this`

بخش بزرگی از توجه عمومی به `=>` روی کم کردن تایپ (`function`، `return`، `{ .. }`) بوده است.

اما نکتهٔ اصلی که تا اینجا نگفتیم این است: `=>` شدیداً به رفتار binding `this` مرتبط است. در واقع arrow functionها *در اصل* برای تغییر هدفمند رفتار `this` طراحی شده‌اند، تا یک دردسر رایج کدنویسی `this`-محور را حل کنند.

کم‌کردن تعداد کاراکترها بیشتر یک حواس‌پرتی است.

نمونه‌ای از قبل:

```js
var controller = {
	makeRequest: function(..){
		var self = this;

		btn.addEventListener( "click", function(){
			// ..
			self.makeRequest(..);
		}, false );
	}
};
```

اینجا از هک `var self = this` استفاده کردیم، چون callbackی که به `addEventListener(..)` می‌دهیم `this` مشابه `makeRequest(..)` ندارد. یعنی چون `this` dynamic است، به lexical scope متغیر `self` پناه می‌بریم.

ویژگی اصلی طراحی arrow function همین‌جاست: داخل arrow function، binding `this` dynamic نیست، lexical است. بنابراین اگر callback را arrow کنیم، `this` همان چیزی می‌شود که می‌خواهیم:

```js
var controller = {
	makeRequest: function(..){
		btn.addEventListener( "click", () => {
			// ..
			this.makeRequest(..);
		}, false );
	}
};
```

`this` lexical در callback بالا همان value `this` در function بیرونی `makeRequest(..)` است. به بیان دیگر `=>` در اینجا جایگزین نحوی `var self = this` می‌شود.

پس هر جا `var self = this` (یا `.bind(this)`) کمک می‌کند، arrow function جایگزین شسته‌رفته‌ای است که بر همین اصل کار می‌کند. عالی به نظر می‌رسد، نه؟

نه همیشه.

اگر `=>` جای `var self = this` یا `.bind(this)` را می‌گیرد و مفید است، حدس بزنید وقتی با function `this`-محوری استفاده‌اش کنید که اصلاً به این رفتار نیاز ندارد چه می‌شود؟ احتمالاً خراب می‌شود.

```js
var controller = {
	makeRequest: (..) => {
		// ..
		this.helper(..);
	},
	helper: (..) => {
		// ..
	}
};

controller.makeRequest(..);
```

با اینکه به شکل `controller.makeRequest(..)` صدا می‌زنیم، `this.helper` شکست می‌خورد، چون `this` دیگر به `controller` اشاره نمی‌کند. به چه اشاره می‌کند؟ `this` را lexical از scope اطراف می‌گیرد. در این snippet همان scope سراسری است که `this` به global object اشاره دارد.

علاوه بر `this` lexical، arrow functionها `arguments` lexical هم دارند -- یعنی `arguments` مستقل ندارند و از parent به ارث می‌گیرند -- و همین‌طور `super` و `new.target` lexical (فصل ۳).

حالا می‌توانیم قواعد دقیق‌تری برای مناسب بودن `=>` داشته باشیم:

* اگر function expression inline کوتاهِ تک‌statement دارید که فقط `return` یک مقدار محاسبه‌شده است، *و* داخلش ارجاع `this` ندارد، *و* self-reference (recursion / event binding-unbinding) ندارد، *و* منطقی انتظار ندارید بعداً چنین شود، احتمالاً تبدیل به `=>` امن است.
* اگر function expression داخلی دارید که برای `this` درست به `var self = this` یا `.bind(this)` تکیه کرده، احتمالاً می‌تواند امن به `=>` تبدیل شود.
* اگر function expression داخلی دارید که برای کپی lexical از `arguments` به چیزی مثل `var args = Array.prototype.slice.call(arguments)` تکیه می‌کند، احتمالاً تبدیل به `=>` امن است.
* در بقیهٔ موارد -- function declarationهای معمولی، function expressionهای چند statement بلند، functionهایی که به self-reference lexical نیاز دارند (recursion و ...)، و هر functionی که در سه حالت قبل نمی‌گنجد -- بهتر است از syntax `=>` دوری کنید.

جمع‌بندی: `=>` دربارهٔ lexical bindingِ `this` و `arguments` و `super` است. این‌ها قابلیت‌های عمدی برای حل مسائل رایج‌اند، نه باگ یا ایراد یا اشتباه ES6.

این تبلیغ را باور نکنید که `=>` اساساً دربارهٔ کاهش تعداد کاراکترهاست. چه کاراکتر کمتر بنویسید چه بیشتر، باید دقیقاً بدانید با هر کاراکتر چه هدفی را دنبال می‌کنید.

**نکته:** اگر functionای دارید که به دلایل بالا برای `=>` مناسب نیست، اما بخشی از object literal تعریف می‌شود، از گزینهٔ کوتاه‌تر دیگری که در بخش "Concise Methods" گفتیم استفاده کنید.

اگر ترجیح می‌دهید یک نمودار تصمیم بصری برای انتخاب/عدم انتخاب arrow function ببینید:

<img src="fig1.png">
