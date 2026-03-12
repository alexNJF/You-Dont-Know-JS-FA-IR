# Template Literals

همان ابتدای کار باید بگویم نام این قابلیت ES6 کمی... گمراه‌کننده است، بسته به اینکه شما از واژهٔ *template* چه برداشتی دارید.

خیلی از توسعه‌دهندگان template را تکه‌متن‌های reusable و renderable می‌دانند (مثل آنچه template engineهایی مانند Mustache و Handlebars ارائه می‌دهند). استفادهٔ ES6 از واژهٔ *template* ممکن است القا کند که چیزی شبیه templateهای inlineِ قابل render مجدد داریم. اما این برداشت درست نیست.

پس قبل از ادامه، من این قابلیت را با نامی که از نظر معنایی دقیق‌تر است صدا می‌زنم: *interpolated string literals* (یا کوتاه‌تر: *interpoliterals*).

شما از قبل string literal با delimiterهای `"` یا `'` را می‌شناسید، و می‌دانید این‌ها *smart string* نیستند که محتوایشان برای expressionهای interpolation تحلیل شود.

اما ES6 نوع جدیدی از string literal معرفی می‌کند که delimiter آن backtick یعنی `` ` `` است. این string literalها اجازه می‌دهند expressionهای interpolation به‌صورت inline داخلشان نوشته شوند و خودکار parse/evaluate شوند.

روش قدیمی پیشا-ES6:

```js
var name = "Kyle";

var greeting = "Hello " + name + "!";

console.log( greeting );			// "Hello Kyle!"
console.log( typeof greeting );		// "string"
```

و روش ES6:

```js
var name = "Kyle";

var greeting = `Hello ${name}!`;

console.log( greeting );			// "Hello Kyle!"
console.log( typeof greeting );		// "string"
```

همان‌طور که می‌بینید، متن بین `` `..` `` یک string literal است و expressionهای `${..}` بلافاصله inline parse و evaluate می‌شوند. اصطلاح دقیق‌تر برای این فرایند *interpolation* است (از «templating» دقیق‌تر).

خروجی expression مربوط به interpolated string literal یک string کاملاً معمولی است که اینجا به `greeting` تخصیص داده شده.

**هشدار:** اینکه `typeof greeting == "string"` است نشان می‌دهد نباید این‌ها را «template value» ویژه فرض کنید؛ نمی‌توانید فرم evaluate-نشدهٔ literal را جایی ذخیره و reuse کنید. رشتهٔ `` `..` `` مثل IIFE از این جهت است که همان‌جا خودکار evaluate می‌شود. نتیجهٔ آن فقط یک string معمولی است.

یکی از مزیت‌های خوب interpolated string literal این است که می‌تواند چندخطی باشد:

```js
var text =
`Now is the time for all good men
to come to the aid of their
country!`;

console.log( text );
// Now is the time for all good men
// to come to the aid of their
// country!
```

newlineهای داخل interpolated string literal در value رشته حفظ می‌شوند.

مگر اینکه `\r` یا `\r\n` به‌صورت escape صریح نوشته شده باشند، مقدار `\r` (کدپوینت `U+000D`) و دنبالهٔ `\r\n` (`U+000D` و `U+000A`) هر دو به `\n` (`U+000A`) نرمال می‌شوند. نگران نباشید؛ این نرمال‌سازی نادر است و معمولاً در کپی/پیست متن داخل فایل JS رخ می‌دهد.

### Interpolated Expressions

داخل `${..}` هر expression معتبری مجاز است: فراخوانی تابع، IIFE، حتی interpolated string literal دیگر!

```js
function upper(s) {
	return s.toUpperCase();
}

var who = "reader";

var text =
`A very ${upper( "warm" )} welcome
to all of you ${upper( `${who}s` )}!`;

console.log( text );
// A very WARM welcome
// to all of you READERS!
```

اینجا literal داخلی `` `${who}s` `` برای ترکیب `who` با `"s"` کمی خوش‌خوان‌تر از `who + "s"` است. nesting interpolated literal گاهی مفید است، اما اگر زیاد یا چند لایه استفاده‌اش کنید احتمالاً نیاز به abstraction دارید.

**هشدار:** با این قدرت جدید، حواستان به خوانایی کد باشد. مثل default value expressionها و destructuring assignment expressionها، اینکه *می‌توانید* کاری انجام دهید لزوماً به این معنی نیست که *باید* انجامش دهید. با ترفندهای ES6 آن‌قدر کد را «باهوش» نکنید که از خودتان یا هم‌تیمی‌هایتان باهوش‌تر به نظر برسد.

#### Expression Scope

یک نکتهٔ کوتاه دربارهٔ scope برای resolve متغیرهای expressionها: پیش‌تر گفتیم interpolated string literal کمی شبیه IIFE است و این تشبیه رفتار scope را هم توضیح می‌دهد.

```js
function foo(str) {
	var name = "foo";
	console.log( str );
}

function bar() {
	var name = "bar";
	foo( `Hello from ${name}!` );
}

var name = "global";

bar();					// "Hello from bar!"
```

در لحظه‌ای که string literal `` `..` `` داخل `bar()` evaluate می‌شود، scope همان نقطه اعمال می‌شود و `name` مربوط به `bar()` (`"bar"`) پیدا می‌شود. نه `name` سراسری مهم است و نه `name` داخل `foo(..)`. یعنی interpolated string literal فقط lexical scope محل خودش را دارد، نه dynamic scope.

### Tagged Template Literals

باز هم برای دقت بهتر نام‌گذاری می‌کنم: *tagged string literals*.

صادقانه یکی از جذاب‌ترین قابلیت‌های ES6 همین است. شاید اول کمی عجیب و کم‌کاربرد به نظر برسد، اما بعد از کار عملی ممکن است کاربردش شما را غافلگیر کند.

```js
function foo(strings, ...values) {
	console.log( strings );
	console.log( values );
}

var desc = "awesome";

foo`Everything is ${desc}!`;
// [ "Everything is ", "!"]
// [ "awesome" ]
```

نکتهٔ مهم این snippet، عبارت ``foo`Everything...`;`` است؛ یک شکل خاص از function call که به `( .. )` نیاز ندارد. *tag* یعنی قسمت `foo` قبل از literal `` `..` ``، یک function value است که باید فراخوانی شود. حتی می‌تواند هر expressionی باشد که در نهایت function بدهد، مثل function callی که function برگرداند:

```js
function bar() {
	return function foo(strings, ...values) {
		console.log( strings );
		console.log( values );
	}
}

var desc = "awesome";

bar()`Everything is ${desc}!`;
// [ "Everything is ", "!"]
// [ "awesome" ]
```

وقتی string literal به‌صورت tag صدا می‌شود، چه چیزهایی به `foo(..)` پاس داده می‌شود؟

اولین argument (`strings`) یک array از بخش‌های متن سادهٔ literal است (قسمت‌های بین interpolationها). در مثال ما: `"Everything is "` و `"!"`.

برای راحتی، بقیهٔ argumentها را با `...` gather/rest در array `values` جمع کردیم (می‌توانستید پارامترهای نام‌گذاری‌شده هم بدهید). این valueها نتیجهٔ evaluate‌شدهٔ interpolation expressionها هستند؛ در مثال ما فقط `"awesome"`.

می‌توانید این دو array را این‌طور ببینید: اگر valueهای `values` را بین valueهای `strings` interleave کنید و بعد join کنید، همان string نهایی interpolated به‌دست می‌آید.

tagged string literal یک مرحلهٔ پردازش بعد از evaluate interpolationها و قبل از تولید string نهایی است؛ یعنی کنترل بیشتری روی تولید رشته می‌دهد.

معمولاً tag function (مثل `foo(..)`) باید یک string مناسب بسازد و return کند تا tagged literal مثل literal معمولی یک value قابل استفاده باشد:

```js
function tag(strings, ...values) {
	return strings.reduce( function(s,v,idx){
		return s + (idx > 0 ? values[idx-1] : "") + v;
	}, "" );
}

var desc = "awesome";

var text = tag`Everything is ${desc}!`;

console.log( text );			// Everything is awesome!
```

اینجا `tag(..)` یک pass-through ساده است؛ تغییر ویژه‌ای نمی‌دهد، فقط با `reduce(..)`، `strings` و `values` را مثل رفتار literal بدون tag کنار هم می‌گذارد.

کاربرد عملی؟ خیلی زیاد دارد (برخی فراتر از دامنهٔ این بحث). مثال ساده: قالب‌بندی عددها به شکل دلار آمریکا:

```js
function dollabillsyall(strings, ...values) {
	return strings.reduce( function(s,v,idx){
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
}

var amt1 = 11.99,
	amt2 = amt1 * 1.08,
	name = "Kyle";

var text = dollabillsyall
`Thanks for your purchase, ${name}! Your
product cost was ${amt1}, which with tax
comes out to ${amt2}.`

console.log( text );
// Thanks for your purchase, Kyle! Your
// product cost was $11.99, which with tax
// comes out to $12.95.
```

اگر value عددی در `values` پیدا شود، قبلش `"$"` می‌گذاریم و با `toFixed(2)` به دو رقم اعشار قالب‌بندی می‌کنیم. در غیر این صورت، value بدون تغییر عبور می‌کند.

#### Raw Strings

در مثال‌های بالا، tag functionها اولین argument یعنی `strings` را به‌صورت array می‌گرفتند. اما یک دادهٔ دیگر هم هست: نسخهٔ raw و پردازش‌نشدهٔ stringها. از طریق property `.raw`:

```js
function showraw(strings, ...values) {
	console.log( strings );
	console.log( strings.raw );
}

showraw`Hello\nWorld`;
// [ "Hello
// World" ]
// [ "Hello\nWorld" ]
```

نسخهٔ raw، escape sequence یعنی `\n` را همان‌طور که هست (`\` و `n` جدا) نگه می‌دارد، درحالی‌که نسخهٔ پردازش‌شده آن را newline واقعی می‌بیند. بااین‌حال نرمال‌سازی line-ending که پیش‌تر گفتیم روی هر دو اعمال می‌شود.

ES6 یک تابع built-in برای tag کردن literal دارد: `String.raw(..)` که نسخه‌های raw از `strings` را pass-through می‌کند:

```js
console.log( `Hello\nWorld` );
// Hello
// World

console.log( String.raw`Hello\nWorld` );
// Hello\nWorld

String.raw`Hello\nWorld`.length;
// 12
```

از tagهای string literal برای کارهایی مثل internationalization، localization و سناریوهای پردازشی دیگر هم استفاده می‌شود.
