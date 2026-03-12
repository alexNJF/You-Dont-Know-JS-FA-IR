# Block-Scoped Declarations

احتمالاً می‌دانید واحد پایهٔ scope متغیرها در JavaScript همیشه `function` بوده است. اگر می‌خواستید scope بلوکی بسازید، رایج‌ترین روش (غیر از declaration معمولی تابع) استفاده از IIFE بود:

```js
var a = 2;

(function IIFE(){
	var a = 3;
	console.log( a );	// 3
})();

console.log( a );		// 2
```

### `let` Declarations

اما حالا می‌توانیم declarationهایی داشته باشیم که به هر block bind شوند؛ یعنی *block scoping*. کافی است `{ .. }` داشته باشیم تا scope ساخته شود. به‌جای `var` که همیشه به scope تابع (یا global در top-level) متصل است، از `let` استفاده می‌کنیم:

```js
var a = 2;

{
	let a = 3;
	console.log( a );	// 3
}

console.log( a );		// 2
```

در JS سنتی، استفاده از block مستقل `{ .. }` خیلی رایج نبوده، ولی همیشه معتبر بوده. توسعه‌دهندگان زبان‌های دارای block scope هم این الگو را سریع می‌شناسند.

به‌نظر من بهترین روش ساخت متغیر block-scoped همین block مستقل `{ .. }` است. همچنین بهتر است declarationهای `let` را در ابتدای block بگذارید و اگر چند متغیر دارید، ترجیحاً با یک `let` تعریفشان کنید.

حتی از نظر سبک کدنویسی من ترجیح می‌دهم `let` را روی همان خط `{` بیاورم تا واضح‌تر شود هدف این block فقط تعریف scope است:

```js
{	let a = 2, b, c;
	// ..
}
```

شاید این سبک برایتان عجیب باشد و با توصیه‌های متداول ES6 هم‌خوان نباشد، اما دلیل دارد.

یک فرم آزمایشی (غیر استاندارد) دیگر هم از `let` وجود داشته به نام `let`-block:

```js
let (a = 2, b, c) {
	// ..
}
```

این فرم را من *explicit* block scoping می‌دانم؛ درحالی‌که فرم `let ..` شبیه `var` بیشتر *implicit* است، چون block موجود را «تصاحب» می‌کند. معمولاً توسعه‌دهندگان مکانیزم explicit را به implicit ترجیح می‌دهند، و اینجا هم همین‌طور است.

اگر دو فرم را مقایسه کنید خیلی شبیه‌اند و هر دو از نظر سبک برای من explicit محسوب می‌شوند. متأسفانه فرم `let (..) { .. }` که explicitتر بود در ES6 پذیرفته نشد. شاید بعداً برگردد، اما فعلاً همان فرم اول بهترین گزینه است.

برای دیدن implicit بودن `let ..`، مثال زیر را ببینید:

```js
let a = 2;

if (a > 1) {
	let b = a * 3;
	console.log( b );		// 6

	for (let i = a; i <= b; i++) {
		let j = i + 10;
		console.log( j );
	}
	// 12 13 14 15 16

	let c = a + b;
	console.log( c );		// 8
}
```

بدون نگاه دوباره بگویید کدام variableها فقط در `if` هستند و کدام فقط در `for`؟

پاسخ: `b` و `c` در scope همان `if` هستند، و `i` و `j` در scope حلقهٔ `for`.

برای لحظه‌ای مکث کردید؟ تعجب کردید `i` به scope بیرونی `if` اضافه نشد؟ این مکث ذهنی همان «mental tax» است: هم چون `let` جدید است و هم چون رفتارش implicit است.

خطر دیگر: declaration مثل `let c = ..` اگر پایین block بیاید. برخلاف `var` که مستقل از محل declaration به کل scope تابع attach می‌شود، `let` به block attach می‌شود اما تا زمان رسیدن به declaration initialize نمی‌شود.

دسترسی به variable تعریف‌شده با `let` قبل از declaration/initialization خطا می‌دهد؛ درحالی‌که در `var` ترتیب (جز از نظر سبک) اهمیتی ندارد:

```js
{
	console.log( a );	// undefined
	console.log( b );	// ReferenceError!

	var a;
	let b;
}
```

**هشدار:** این `ReferenceError` مربوط به دسترسی زودهنگام به `let`، خطای *Temporal Dead Zone (TDZ)* است -- variable declare شده ولی هنوز initialize نشده. TDZ فقط اینجا نیست و در چند جای ES6 دیده می‌شود. ضمناً «initialize» لزوماً assignment صریح نمی‌خواهد؛ `let b;` معتبر است و عملاً مثل `let b = undefined;` است. در هر صورت تا اجرای statement `let b` نمی‌توانید به `b` دسترسی داشته باشید.

یک نکتهٔ tricky دیگر: `typeof` برای TDZ variableها با variableهای undeclared (یا declared) متفاوت عمل می‌کند:

```js
{
	// `a` is not declared
	if (typeof a === "undefined") {
		console.log( "cool" );
	}

	// `b` is declared, but in its TDZ
	if (typeof b === "undefined") {		// ReferenceError!
		// ..
	}

	// ..

	let b;
}
```

`a` declare نشده، پس `typeof` راه امن بررسی وجودش است. اما `typeof b` خطای TDZ می‌دهد چون پایین‌تر `let b` وجود دارد.

اینجا روشن‌تر می‌شود چرا اصرار دارم declarationهای `let` ابتدای scope باشند: هم خطاهای دسترسی زودهنگام حذف می‌شود، هم با دیدن ابتدای block فوراً متوجه می‌شوید چه variableهایی در آن scope وجود دارد.

blockهای شما (`if`، `while` و ...) مجبور نیستند رفتار اصلی خود را با رفتار scoping قاطی کنند.

این explicit بودن که با انضباط خودتان حفظ می‌کنید، بعدها از خیلی دردسرهای refactor و footgun جلوگیری می‌کند.

**نکته:** برای جزئیات بیشتر `let` و block scope، فصل ۳ کتاب *Scope & Closures* را ببینید.

#### `let` + `for`

تنها استثنایی که برای ترجیح explicit قائل می‌شوم `let` در header حلقهٔ `for` است. شاید ظریف به‌نظر برسد، اما یکی از مهم‌ترین قابلیت‌های ES6 است.

```js
var funcs = [];

for (let i = 0; i < 5; i++) {
	funcs.push( function(){
		console.log( i );
	} );
}

funcs[3]();		// 3
```

`let i` در header `for` فقط یک `i` برای کل loop نمی‌سازد؛ در هر iteration یک `i` جدید re-declare می‌کند. پس closureهای داخل loop روی variable مخصوص همان iteration بسته می‌شوند؛ دقیقاً همان چیزی که انتظار داریم.

اگر همین snippet را با `var i` بنویسید، خروجی به‌جای `3` می‌شود `5`، چون فقط یک `i` بیرونی وجود دارد که همهٔ closureها روی آن بسته می‌شوند.

راه verboseتر ولی معادل:

```js
var funcs = [];

for (var i = 0; i < 5; i++) {
	let j = i;
	funcs.push( function(){
		console.log( j );
	} );
}

funcs[3]();		// 3
```

اینجا دستی در هر iteration یک `j` جدید می‌سازیم و closure همان رفتار را می‌گیرد. من روش اول را ترجیح می‌دهم؛ همین قابلیت ویژه دلیل حمایت من از فرم `for (let .. ) ..` است.

`let` همین رفتار را با `for..in` و `for..of` هم دارد (بخش "`for..of` Loops").

### `const` Declarations

فرم block-scoped دیگری هم داریم: `const` برای ساخت *constant*.

constant یعنی چه؟ variableی که بعد از تعیین مقدار اولیه، فقط خواندنی است:

```js
{
	const a = 2;
	console.log( a );	// 2

	a = 3;				// TypeError!
}
```

بعد از مقداردهی اولیه در declaration، اجازهٔ تغییر reference آن variable را ندارید. `const` باید initialization صریح داشته باشد. اگر constant با value `undefined` می‌خواهید باید صراحتاً `const a = undefined` بنویسید.

constant بودن محدودیت روی خود value نیست، روی assignment variable به آن value است. یعنی `const` value را frozen/immutable نمی‌کند، فقط assignment را ثابت می‌کند. اگر value پیچیده مثل object/array باشد، محتوای آن هنوز قابل تغییر است:

```js
{
	const a = [1,2,3];
	a.push( 4 );
	console.log( a );		// [1,2,3,4]

	a = 42;					// TypeError!
}
```

پس `a` آرایهٔ constant نگه نمی‌دارد، بلکه reference ثابت به آرایه نگه می‌دارد. خود آرایه mutable است.

**هشدار:** وقتی object/array را به‌عنوان constant assign می‌کنید، تا زمانی که lexical scope آن constant تمام نشده، آن value قابل garbage collection نیست؛ چون reference هیچ‌وقت unset نمی‌شود. گاهی مطلوب است، ولی اگر هدف‌تان نباشد باید دقت کنید.

در اصل `const` چیزی را enforce می‌کند که سال‌ها به‌صورت stylistic با نام‌های ALL_CAPS و literalهای تغییرناپذیر نشان می‌دادیم. `var` enforcement ندارد، اما `const` دارد و تغییر ناخواسته را بهتر شکار می‌کند.

`const` را می‌توان با declarationهای `for`، `for..in` و `for..of` هم به‌کار برد (بخش "`for..of` Loops")، اما هر تلاش برای reassign (مثل `i++` رایج در `for`) خطا می‌دهد.

#### `const` Or Not

شایعاتی هست که `const` در برخی سناریوها از نظر engine شاید optimizeپذیرتر از `let`/`var` باشد، چون engine راحت‌تر می‌فهمد value/type عوض نمی‌شود.

اینکه واقعاً چنین سودی همیشه رخ می‌دهد یا نه، مهم‌ترین سؤال نیست. سؤال مهم این است که آیا قصد رفتار constant دارید یا نه. یادتان باشد یکی از نقش‌های اصلی source code «انتقال شفاف intent» است؛ نه فقط برای شما، بلکه برای خود آینده‌تان و هم‌تیمی‌ها.

بعضی‌ها همهٔ declarationها را اول `const` می‌نویسند و اگر لازم شد بعداً به `let` شل می‌کنند. دیدگاه جالبی است، ولی روشن نیست همیشه خوانایی و reasonability کد را بهتر کند.

`const` آن «محافظت مطلق»ی که بعضی فکر می‌کنند نیست؛ چون هر توسعه‌دهندهٔ بعدی اگر بخواهد value را عوض کند، می‌تواند declaration را از `const` به `let` تبدیل کند. نهایتاً از تغییر تصادفی جلوگیری می‌کند. اینکه «تصادفی» دقیقاً چیست هم معیار عینی روشنی ندارد.

توصیهٔ من: برای پرهیز از کد گیج‌کننده، فقط جایی `const` به‌کار ببرید که واقعاً و واضح می‌خواهید پیام «این تغییر نمی‌کند» بدهید. یعنی روی `const` به‌عنوان رفتار کد تکیه نکنید؛ از آن به‌عنوان ابزار بیان intent استفاده کنید.

### Block-scoped Functions

از ES6 به بعد، function declarationهایی که داخل block قرار می‌گیرند، طبق specification block-scoped هستند. قبل از ES6 این رفتار در specification نبود، هرچند خیلی از engineها عملاً چنین می‌کردند. حالا specification با واقعیت یکی شده است.

```js
{
	foo();					// works!

	function foo() {
		// ..
	}
}

foo();						// ReferenceError
```

`foo()` داخل block `{ .. }` declare شده و در ES6 همان‌جا block-scoped است، پس بیرون block در دسترس نیست. اما دقت کنید داخل block همچنان hoist می‌شود؛ برخلاف `let` که در دام TDZ می‌افتد.

این block-scoping برای function declaration می‌تواند مشکل‌ساز شود اگر قبلاً روی رفتار legacy غیر block-scoped حساب کرده باشید:

```js
if (something) {
	function foo() {
		console.log( "1" );
	}
}
else {
	function foo() {
		console.log( "2" );
	}
}

foo();		// ??
```

در محیط‌های پیشا-ES6، `foo()` صرف‌نظر از مقدار `something`، `"2"` چاپ می‌کرد؛ چون هر دو declaration از block بیرون hoist می‌شدند و دومی همیشه برنده بود.

در ES6، خط آخر `ReferenceError` می‌دهد.
