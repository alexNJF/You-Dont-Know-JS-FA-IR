# چرا `this`؟

اگر مکانیزم `this` این‌قدر گیج‌کننده است، حتی برای توسعه‌دهندگان باتجربهٔ جاوااسکریپت، ممکن است کسی بپرسد اصلاً چرا مفید است؟ آیا دردسرش بیشتر از فایده‌اش نیست؟ قبل از اینکه به *چگونگی* بپردازیم، باید *چرایی* را بررسی کنیم.

بیایید انگیزه و کاربرد `this` را نشان دهیم:

```js
function identify() {
	return this.name.toUpperCase();
}

function speak() {
	var greeting = "Hello, I'm " + identify.call( this );
	console.log( greeting );
}

var me = {
	name: "Kyle"
};

var you = {
	name: "Reader"
};

identify.call( me ); // KYLE
identify.call( you ); // READER

speak.call( me ); // Hello, I'm KYLE
speak.call( you ); // Hello, I'm READER
```

اگر *چگونگی* این قطعه کد شما را سردرگم می‌کند، نگران نباشید! به‌زودی به آن می‌رسیم. فقط آن سؤال‌ها را موقتاً کنار بگذارید تا بتوانیم *چرایی* را روشن‌تر ببینیم.

این قطعه کد به توابع `identify()` و `speak()` اجازه می‌دهد علیه چندین *context* (اشیاء `me` و `you`) دوباره استفاده شوند، به‌جای اینکه نسخهٔ جداگانه‌ای از تابع برای هر object لازم باشد.

به‌جای تکیه بر `this`، می‌توانستید یک context object را صریحاً به هر دو `identify()` و `speak()` پاس بدهید.

```js
function identify(context) {
	return context.name.toUpperCase();
}

function speak(context) {
	var greeting = "Hello, I'm " + identify( context );
	console.log( greeting );
}

identify( you ); // READER
speak( me ); // Hello, I'm KYLE
```

با این حال، مکانیزم `this` راهی ظریف‌تر برای «پاس دادن» ضمنی ارجاع به object فراهم می‌کند و به طراحی API تمیزتر و استفادهٔ مجدد آسان‌تر منجر می‌شود.

هرچه الگوی استفادهٔ شما پیچیده‌تر باشد، روشن‌تر خواهید دید که پاس دادن context به‌عنوان پارامتر صریح اغلب شلوغ‌تر از پاس دادن یک context با `this` است. وقتی objectها و prototypeها را بررسی کنیم، سودمندی مجموعه‌ای از توابع را خواهید دید که بتوانند به‌طور خودکار به context object مناسب ارجاع دهند.
