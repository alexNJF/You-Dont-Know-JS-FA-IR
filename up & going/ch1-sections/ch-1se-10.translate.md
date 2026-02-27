# توابع

کارمند فروشگاه موبایل احتمالاً ماشین‌حساب همراه ندارد برای محاسبهٔ مالیات و مبلغ نهایی خرید. آن کاری است که باید یک بار تعریف کند و بارها و بارها استفاده کند. احتمالاً شرکت صندوق پرداخت (رایانه، تبلت و غیره) با آن «توابع» داخلی دارد.

به‌طور مشابه، برنامهٔ شما تقریباً قطعاً می‌خواهد وظایف کد را به قطعات قابل استفادهٔ مجدد تقسیم کند، به‌جای تکرار مکرر خودتان! راه این کار تعریف یک `function` است.

یک تابع به‌طور کلی بخش نام‌داری از کد است که می‌توان با نام «فراخوانی» کرد، و کد داخلش هر بار اجرا می‌شود. در نظر بگیرید:

```js
function printAmount() {
	console.log( amount.toFixed( 2 ) );
}

var amount = 99.99;

printAmount(); // "99.99"

amount = amount * 2;

printAmount(); // "199.98"
```

توابع می‌توانند اختیاری آرگومان (یعنی parameters) بگیرند — مقادیری که می‌دهید. و می‌توانند اختیاری مقداری برگردانند.

```js
function printAmount(amt) {
	console.log( amt.toFixed( 2 ) );
}

function formatAmount() {
	return "$" + amount.toFixed( 2 );
}

var amount = 99.99;

printAmount( amount * 2 );		// "199.98"

amount = formatAmount();
console.log( amount );			// "$99.99"
```

تابع `printAmount(..)` یک parameter می‌گیرد که `amt` می‌نامیم. تابع `formatAmount()` مقداری برمی‌گرداند. البته می‌توانید آن دو تکنیک را در همان تابع ترکیب کنید.

توابع اغلب برای کدی استفاده می‌شوند که قصد دارید چند بار فراخوانی کنید، اما می‌توانند برای سازماندهی قطعات مرتبط کد در مجموعه‌های نام‌دار هم مفید باشند، حتی اگر فقط یک بار قصد فراخوانی دارید.

در نظر بگیرید:

```js
const TAX_RATE = 0.08;

function calculateFinalPurchaseAmount(amt) {
	// calculate the new amount with the tax
	amt = amt + (amt * TAX_RATE);

	// return the new amount
	return amt;
}

var amount = 99.99;

amount = calculateFinalPurchaseAmount( amount );

console.log( amount.toFixed( 2 ) );		// "107.99"
```

اگرچه `calculateFinalPurchaseAmount(..)` فقط یک بار فراخوانی می‌شود، سازماندهی رفتارش در تابع نام‌دار جداگانه کدی که از منطقش استفاده می‌کند (statement `amount = calculateFinal...`) را تمیزتر می‌کند. اگر تابع statementهای بیشتری داشت، مزایا حتی برجسته‌تر می‌شد.

### Scope

اگر از کارمند فروشگاه موبایل مدل گوشی‌ای بخواهید که فروشگاهش ندارد، نمی‌تواند گوشی مورد نظرتان را به شما بفروشد. او فقط به گوشی‌های موجودی فروشگاهش دسترسی دارد. باید فروشگاه دیگری امتحان کنید تا ببینید گوشی مورد نظرتان را پیدا می‌کنید یا نه.

برنامه‌نویسی اصطلاحی برای این مفهوم دارد: *scope* (از نظر فنی *lexical scope*). در JavaScript، هر تابع scope خودش را دارد. Scope اساساً مجموعه‌ای از متغیرها و قوانین دسترسی به آن متغیرها با نام است. فقط کد داخل آن تابع می‌تواند به متغیرهای *scoped* آن تابع دسترسی یابد.

نام متغیر باید در همان scope یکتا باشد — نمی‌توان دو متغیر `a` متفاوت کنار هم داشت. اما همان نام متغیر `a` می‌تواند در scopeهای مختلف ظاهر شود.

```js
function one() {
	// this `a` only belongs to the `one()` function
	var a = 1;
	console.log( a );
}

function two() {
	// this `a` only belongs to the `two()` function
	var a = 2;
	console.log( a );
}

one();		// 1
two();		// 2
```

همچنین، یک scope می‌تواند داخل scope دیگری تو در تو باشد، مثل اینکه یک دلقک در جشن تولد یک بادکنک را داخل بادکنک دیگر باد کند. اگر یک scope داخل دیگری تو در تو باشد، کد داخل درونی‌ترین scope می‌تواند به متغیرهای هر دو scope دسترسی یابد.

در نظر بگیرید:

```js
function outer() {
	var a = 1;

	function inner() {
		var b = 2;

		// we can access both `a` and `b` here
		console.log( a + b );	// 3
	}

	inner();

	// we can only access `a` here
	console.log( a );			// 1
}

outer();
```

قوانین lexical scope می‌گویند کد در یک scope می‌تواند به متغیرهای آن scope یا هر scope بیرونی‌تر دسترسی یابد.

پس، کد داخل تابع `inner()` به هر دو متغیر `a` و `b` دسترسی دارد، اما کد در `outer()` فقط به `a` دسترسی دارد — نمی‌تواند به `b` دسترسی یابد چون آن متغیر فقط داخل `inner()` است.

این قطعه کد قبلی را به یاد آورید:

```js
const TAX_RATE = 0.08;

function calculateFinalPurchaseAmount(amt) {
	// calculate the new amount with the tax
	amt = amt + (amt * TAX_RATE);

	// return the new amount
	return amt;
}
```

ثابت (متغیر) `TAX_RATE` از داخل تابع `calculateFinalPurchaseAmount(..)` قابل دسترسی است، حتی اگر آن را ندادیم، به‌خاطر lexical scope.

**Note:** برای اطلاعات بیشتر دربارهٔ lexical scope، سه فصل اول عنوان *Scope & Closures* این مجموعه را ببینید.
