# `Object.observe(..)`

یکی از «جام مقدس»های توسعه‌ی فرانت‌اند، data binding است: گوش‌دادن به تغییرات آبجکت داده و همگام‌سازی نمایش DOM با آن. بیشتر فریم‌ورک‌های JS مکانیزمی برای این کار دارند.

به نظر می‌رسید پس از ES6 پشتیبانی مستقیم از این ایده وارد زبان شود، با utilityای به نام `Object.observe(..)`. ایده‌ی اصلی این است که یک listener روی تغییرات آبجکت ثبت کنید و هر بار تغییری رخ داد callback صدا زده شود؛ بعد مثلاً DOM را به‌روزرسانی کنید.

شش نوع تغییر قابل مشاهده هستند:

* add
* update
* delete
* reconfigure
* setPrototype
* preventExtensions

به‌صورت پیش‌فرض همه‌ی این تغییرها گزارش می‌شوند، اما می‌توانید آن‌ها را به موارد موردنیازتان محدود کنید.

مثال:

```js
var obj = { a: 1, b: 2 };

Object.observe(
	obj,
	function(changes){
		for (var change of changes) {
			console.log( change );
		}
	},
	[ "add", "update", "delete" ]
);

obj.c = 3;
// { name: "c", object: obj, type: "add" }

obj.a = 42;
// { name: "a", object: obj, type: "update", oldValue: 1 }

delete obj.b;
// { name: "b", object: obj, type: "delete", oldValue: 2 }
```

علاوه بر نوع‌های اصلی `"add"`، `"update"` و `"delete"`:

* رویداد `"reconfigure"` وقتی رخ می‌دهد که یکی از پراپرتی‌های آبجکت با `Object.defineProperty(..)` بازپیکربندی شود، مثلاً تغییر `writable`. برای جزئیات بیشتر کتاب *this & Object Prototypes* را ببینید.
* رویداد `"preventExtensions"` وقتی رخ می‌دهد که آبجکت با `Object.preventExtensions(..)` غیرقابل‌گسترش شود.

  چون `Object.seal(..)` و `Object.freeze(..)` هم `Object.preventExtensions(..)` را درون خود دارند، رویداد متناظر آن هم در این حالت‌ها رخ می‌دهد. علاوه بر آن، برای هر پراپرتی آبجکت رویداد `"reconfigure"` هم رخ می‌دهد.
* رویداد `"setPrototype"` وقتی رخ می‌دهد که `[[Prototype]]` آبجکت تغییر کند؛ چه با setterِ `__proto__` چه با `Object.setPrototypeOf(..)`.

دقت کنید این رویدادها بلافاصله *بعد* از تغییر گزارش می‌شوند. این را با Proxyها (فصل ۷) اشتباه نگیرید که می‌توانید عملیات را *قبل* از وقوع intercept کنید. observation برای واکنش *پس از* تغییر است.

### رویداد تغییر سفارشی

علاوه بر شش نوع رویداد داخلی، می‌توانید رویدادهای سفارشی هم گوش کنید و هم fire کنید.

```js
function observer(changes){
	for (var change of changes) {
		if (change.type == "recalc") {
			change.object.c =
				change.object.oldValue +
				change.object.a +
				change.object.b;
		}
	}
}

function changeObj(a,b) {
	var notifier = Object.getNotifier( obj );

	obj.a = a * 2;
	obj.b = b * 3;

	// queue up change events into a set
	notifier.notify( {
		type: "recalc",
		name: "c",
		oldValue: obj.c
	} );
}

var obj = { a: 1, b: 2, c: 3 };

Object.observe(
	obj,
	observer,
	["recalc"]
);

changeObj( 3, 11 );

obj.a;			// 12
obj.b;			// 30
obj.c;			// 3
```

مجموعه‌ی تغییر (`"recalc"` سفارشی) برای تحویل به observer صف شده، اما هنوز تحویل نشده؛ برای همین `obj.c` هنوز `3` است.

به‌صورت پیش‌فرض تغییرها در انتهای event loop فعلی تحویل می‌شوند (کتاب *Async & Performance*). اگر بخواهید فوری تحویل شوند از `Object.deliverChangeRecords(observer)` استفاده کنید. بعد از تحویل، `obj.c` مطابق انتظار آپدیت می‌شود:

```js
obj.c;			// 42
```

در مثال قبلی، `notifier.notify(..)` را با رکورد کامل رویداد صدا زدیم. فرم جایگزین برای صف‌کردن رکوردها `performChange(..)` است که نوع رویداد را از بقیه‌ی جزئیات رکورد (از طریق callback) جدا می‌کند:

```js
notifier.performChange( "recalc", function(){
	return {
		name: "c",
		// `this` is the object under observation
		oldValue: this.c
	};
} );
```

در بعضی سناریوها این تفکیک مسئولیت تمیزتر با الگوی استفاده‌ی شما جور درمی‌آید.

### پایان‌دادن به observation

مثل event listener معمولی، ممکن است بخواهید مشاهده‌ی تغییرات آبجکت را متوقف کنید. برای این کار `Object.unobserve(..)` را دارید.

مثال:

```js
var obj = { a: 1, b: 2 };

Object.observe( obj, function observer(changes) {
	for (var change of changes) {
		if (change.type == "setPrototype") {
			Object.unobserve(
				change.object, observer
			);
			break;
		}
	}
} );
```

در این مثال ساده، تا وقتی رویداد `"setPrototype"` نیامده گوش می‌دهیم، و با رسیدنش observation را قطع می‌کنیم.
