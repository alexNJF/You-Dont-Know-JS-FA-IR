# جمع‌بندی API Promise

بیایید API مربوط به `Promise` در ES6 را که تا اینجا تکه‌تکه دیدیم یک‌جا مرور کنیم.

**نکته:** API زیر از ES6 به‌صورت native موجود است، اما polyfillهای منطبق با specification هم هستند (نه فقط کتابخانه‌های Promise توسعه‌یافته) که `Promise` و رفتارهایش را حتی در مرورگرهای pre-ES6 فراهم می‌کنند. یکی از آن‌ها "Native Promise Only" است که خودم نوشته‌ام.

### سازنده‌ی `new Promise(..)`

سازنده‌ی *revealing constructor* یعنی `Promise(..)` باید با `new` استفاده شود و باید یک callback function بگیرد که همان لحظه (sync/immediate) اجرا می‌شود. این تابع دو callback می‌گیرد که قابلیت resolution مربوط به Promise هستند و معمولاً آن‌ها را `resolve(..)` و `reject(..)` می‌نامیم:

```js
var p = new Promise( function(resolve,reject){
	// `resolve(..)` to resolve/fulfill the promise
	// `reject(..)` to reject the promise
} );
```

`reject(..)` فقط Promise را reject می‌کند، اما `resolve(..)` بسته به ورودی می‌تواند fulfill یا reject کند. اگر ورودی `resolve(..)` مقدار فوری non-Promise/non-thenable باشد، Promise با همان مقدار fulfill می‌شود.

اما اگر `resolve(..)` Promise واقعی یا thenable بگیرد، آن مقدار بازگشتی unwrap می‌شود و هر وضعیت نهایی‌ای داشته باشد (fulfillment/rejection) Promise همین را adopt می‌کند.

### `Promise.resolve(..)` و `Promise.reject(..)`

راه میان‌بر برای ساخت Promise rejected همان `Promise.reject(..)` است، پس این دو معادل‌اند:

```js
var p1 = new Promise( function(resolve,reject){
	reject( "Oops" );
} );

var p2 = Promise.reject( "Oops" );
```

`Promise.resolve(..)` هم معمولاً برای ساخت Promise fulfilled فوری (شبیه `Promise.reject(..)`) استفاده می‌شود. اما علاوه بر آن thenable را هم unwrap می‌کند (بارها گفتیم). در این حالت Promise برگشتی resolution نهایی thenable را adopt می‌کند که می‌تواند fulfillment یا rejection باشد:

```js
var fulfilledTh = {
	then: function(cb) { cb( 42 ); }
};
var rejectedTh = {
	then: function(cb,errCb) {
		errCb( "Oops" );
	}
};

var p1 = Promise.resolve( fulfilledTh );
var p2 = Promise.resolve( rejectedTh );

// `p1` will be a fulfilled promise
// `p2` will be a rejected promise
```

و یادتان باشد اگر چیزی که می‌دهید از قبل Promise واقعی باشد، `Promise.resolve(..)` همان را مستقیم برمی‌گرداند. پس روی مقدارهایی که ماهیتشان معلوم نیست هم overhead خاصی ندارد.

### `then(..)` و `catch(..)`

هر Promise instance (**نه** namespace سراسری `Promise`) متدهای `then(..)` و `catch(..)` دارد که با آن‌ها handlerهای fulfillment/rejection ثبت می‌کنید. بعد از resolve شدن Promise، یکی از این دو مسیر اجرا می‌شود (نه هر دو)، و همیشه هم async اجرا می‌شود (بخش Jobs در فصل ۱).

`then(..)` یک یا دو پارامتر می‌گیرد: اولی fulfillment callback، دومی rejection callback. اگر هرکدام حذف شود یا non-function باشد، callback پیش‌فرض جایگزین می‌شود. پیش‌فرض fulfillment مقدار را عبور می‌دهد؛ پیش‌فرض rejection خطا را دوباره throw/propagate می‌کند.

`catch(..)` فقط rejection callback می‌گیرد و fulfillment پیش‌فرض را خودکار می‌گذارد. یعنی معادل `then(null,..)` است:

```js
p.then( fulfilled );

p.then( fulfilled, rejected );

p.catch( rejected ); // or `p.then( null, rejected )`
```

`then(..)` و `catch(..)` Promise جدید هم می‌سازند و برمی‌گردانند که برای Promise chain flow-control استفاده می‌شود. اگر داخل callback fulfillment/rejection exception رخ دهد، Promise برگشتی rejected می‌شود. اگر callback مقدار فوری non-Promise/non-thenable برگرداند، همان fulfillment Promise برگشتی می‌شود. اگر fulfillment handler Promise/thenable برگرداند، unwrap می‌شود و resolution آن، resolution Promise برگشتی می‌گردد.

### `Promise.all([ .. ])` و `Promise.race([ .. ])`

دو helper ایستای `Promise.all([ .. ])` و `Promise.race([ .. ])` هر دو Promise برمی‌گردانند که resolutionشان کاملاً تحت کنترل آرایه‌ی Promiseهای ورودی است.

در `Promise.all([ .. ])` همه‌ی Promiseهای ورودی باید fulfill شوند تا Promise برگشتی fulfill شود. اگر یکی rejected شود، Promise اصلی هم بلافاصله rejected می‌شود (و خروجی بقیه کنار گذاشته می‌شود). در fulfillment، `array`ی از همه‌ی fulfillment valueها می‌گیرید. در rejection، فقط اولین rejection reason را می‌گیرید. این همان الگوی کلاسیک "gate" است.

در `Promise.race([ .. ])` فقط اولین Promise که resolve شود (fulfillment یا rejection) «برنده» است و همان resolution مربوط به Promise برگشتی می‌شود. این همان الگوی کلاسیک "latch" است:

```js
var p1 = Promise.resolve( 42 );
var p2 = Promise.resolve( "Hello World" );
var p3 = Promise.reject( "Oops" );

Promise.race( [p1,p2,p3] )
.then( function(msg){
	console.log( msg );		// 42
} );

Promise.all( [p1,p2,p3] )
.catch( function(err){
	console.error( err );	// "Oops"
} );

Promise.all( [p1,p2] )
.then( function(msgs){
	console.log( msgs );	// [42,"Hello World"]
} );
```

**هشدار:** اگر آرایه‌ی خالی به `Promise.all([ .. ])` بدهید فوراً fulfill می‌شود، اما `Promise.race([ .. ])` برای همیشه unresolved می‌ماند.

API مربوط به Promise در ES6 واقعاً ساده و سرراست است. برای اغلب سناریوهای پایه async به‌اندازه‌ی کافی خوب است و شروع خیلی خوبی برای مهاجرت از callback hell به الگوی بهتر محسوب می‌شود.

اما خیلی از برنامه‌ها پیچیدگی async بیشتری می‌خواهند که Promise خام در پاسخ‌دهی به آن محدودیت دارد. در بخش بعد همین محدودیت‌ها را می‌بینیم تا دلیل نیاز به کتابخانه‌های Promise روشن‌تر شود.
