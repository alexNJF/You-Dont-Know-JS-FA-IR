# شما جاوااسکریپت را نمی‌دانید: Scope و Closures - ویرایش اول
# Lexical-this

اگرچه این عنوان مکانیزم `this` را به‌تفصیل پوشش نمی‌دهد، یک موضوع ES6 وجود دارد که `this` را به lexical scope به‌طرز مهمی مرتبط می‌کند، که به‌طور خلاصه بررسی می‌کنیم.

ES6 شکل نحوی خاصی از اعلام تابع به‌نام «arrow function» اضافه می‌کند. این‌طور به نظر می‌رسد:

```js
var foo = a => {
	console.log( a );
};

foo( 2 ); // 2
```

به‌اصطلاح «fat arrow» اغلب به‌عنوان میانبر برای کلمهٔ کلیدی *tediously verbose* (طنز) `function` ذکر می‌شود.

اما چیز مهم‌تری با arrow-functionها در کار است که ربطی به صرفه‌جویی در تایپ اعلام ندارد.

به‌طور خلاصه، این کد مشکل دارد:

```js

var obj = {
	id: "awesome",
	cool: function coolFn() {
		console.log( this.id );
	}
};

var id = "not awesome";

obj.cool(); // awesome

setTimeout( obj.cool, 100 ); // not awesome
```

مشکل از دست رفتن binding `this` روی تابع `cool()` است. راه‌های مختلفی برای پرداختن به آن مشکل وجود دارد، اما یک راه‌حل اغلب تکرارشده `var self = this;` است.

ممکن است این‌طور باشد:

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		var self = this;

		if (self.count < 1) {
			setTimeout( function timer(){
				self.count++;
				console.log( "awesome?" );
			}, 100 );
		}
	}
};

obj.cool(); // awesome?
```

بدون رفتن زیاد به جزئیات، راه‌حل `var self = this` کل مسئلهٔ فهم و استفادهٔ صحیح از binding `this` را کنار می‌گذارد و در عوض به چیزی که شاید راحت‌تریم fallback می‌کند: lexical scope. `self` فقط شناسه‌ای می‌شود که می‌تواند از طریق lexical scope و closure حل شود و اهمیتی به اتفاقی که برای binding `this` افتاد نمی‌دهد.

مردم دوست ندارند چیزهای verbose بنویسند، به‌ویژه وقتی بارها و بارها انجام می‌دهند. پس انگیزهٔ ES6 کمک به کاهش این سناریوها است و در واقع *حل* مشکلات idiom رایج، مثل این یکی.

راه‌حل ES6، arrow-function، رفتاری به‌نام «lexical this» معرفی می‌کند.

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		if (this.count < 1) {
			setTimeout( () => { // arrow-function ftw?
				this.count++;
				console.log( "awesome?" );
			}, 100 );
		}
	}
};

obj.cool(); // awesome?
```

توضیح کوتاه این است که arrow-functionها اصلاً مثل توابع عادی وقتی به binding `this` می‌رسند رفتار نمی‌کنند. آن‌ها تمام قوانین عادی binding `this` را دور می‌ریزند و در عوض مقدار `this` scope lexical محصور فوری خود را می‌گیرند، هرچه باشد.

پس در آن تکه، arrow-function binding `this` خود را به‌صورت غیرقابل پیش‌بینی unbind نمی‌کند، فقط «به ارث می‌برد» binding `this` تابع `cool()` (که اگر آن‌طور که نشان داده شد فراخوانی کنیم درست است!).

در حالی که این کد کوتاه‌تر می‌شود، نظر من این است که arrow-functionها در واقع فقط یک *اشتباه* رایج توسعه‌دهندگان را به نحو زبان codify می‌کنند، که اشتباه و درهم‌آمیختن قوانین «this binding» با قوانین «lexical scope» است.

به‌عبارت دیگر: چرا زحمت و verbosity استفاده از پارادایم کدنویسی سبک `this` را بکشیم، فقط برای قطع کردن آن در زانو با مخلوط کردن با ارجاع‌های lexical. به نظر طبیعی می‌رسد یک رویکرد یا دیگری را برای هر تکه کد بپذیریم و آن‌ها را در همان تکه کد مخلوط نکنیم.

**توجه:** یک detraction دیگر از arrow-functionها این است که گمنام هستند، نه نام‌دار. فصل ۳ را برای دلایل اینکه چرا توابع گمنام کمتر مطلوب از توابع نام‌دار هستند ببینید.

رویکرد مناسب‌تر، از نظر من، به این «مشکل»، استفاده و پذیرش صحیح مکانیزم `this` است.

```js
var obj = {
	count: 0,
	cool: function coolFn() {
		if (this.count < 1) {
			setTimeout( function timer(){
				this.count++; // `this` is safe because of `bind(..)`
				console.log( "more awesome" );
			}.bind( this ), 100 ); // look, `bind()`!
		}
	}
};

obj.cool(); // more awesome
```

چه رفتار lexical-this جدید arrow-functionها را ترجیح دهید چه `bind()` امتحان‌شده را، مهم است بدانید arrow-functionها **فقط** دربارهٔ تایپ کمتر «function» نیستند.

آن‌ها *تفاوت رفتاری عمدی* دارند که باید یاد بگیریم و بفهمیم، و در صورت انتخاب، leverage کنیم.

حالا که lexical scoping (و closure!) را کاملاً فهمیدیم، فهم lexical-this باید باد باشد!
