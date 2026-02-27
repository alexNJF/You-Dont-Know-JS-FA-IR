# شرط‌ها

«آیا می‌خواهید محافظ صفحهٔ اضافی را به خریدتان اضافه کنید، به مبلغ ۹.۹۹ دلار؟» کارمند فروشگاه موبایل از شما خواسته تصمیم بگیرید. و شاید برای پاسخ به آن سؤال ابتدا باید *state* فعلی کیف پول یا حساب بانکی‌تان را بررسی کنید. اما واضح است، این فقط یک سؤال سادهٔ «بله یا خیر» است.

راه‌های زیادی برای بیان *conditionals* (یعنی تصمیم‌ها) در برنامه‌هایمان داریم.

رایج‌ترین statement `if` است. در اصل می‌گویید «*اگر* این شرط true باشد، کار زیر را انجام بده...». مثلاً:

```js
var bank_balance = 302.13;
var amount = 99.99;

if (amount < bank_balance) {
	console.log( "I want to buy this phone!" );
}
```

Statement `if` به یک expression بین پرانتزهای `( )` نیاز دارد که بتوان به‌عنوان `true` یا `false` تلقی کرد. در این برنامه، expression `amount < bank_balance` را دادیم که بسته به مقدار در متغیر `bank_balance` واقعاً به `true` یا `false` ارزیابی می‌شود.

می‌توانید در صورت نبودن شرط، گزینهٔ دیگری به نام clause `else` بدهید. در نظر بگیرید:

```js
const ACCESSORY_PRICE = 9.99;

var bank_balance = 302.13;
var amount = 99.99;

amount = amount * 2;

// can we afford the extra purchase?
if ( amount < bank_balance ) {
	console.log( "I'll take the accessory!" );
	amount = amount + ACCESSORY_PRICE;
}
// otherwise:
else {
	console.log( "No, thanks." );
}
```

اینجا، اگر `amount < bank_balance` برابر `true` باشد، `"I'll take the accessory!"` را چاپ می‌کنیم و `9.99` را به متغیر `amount` اضافه می‌کنیم. در غیر این صورت، clause `else` می‌گوید فقط با `"No, thanks."` پاسخ می‌دهیم و `amount` را تغییر نمی‌دهیم.

همان‌طور که قبلاً در «Values & Types» گفتیم، مقادیری که از نوع مورد انتظار نیستند اغلب به آن نوع coerce می‌شوند. Statement `if` انتظار `boolean` دارد، اما اگر چیزی که از قبل `boolean` نیست بدهید، coercion رخ می‌دهد.

JavaScript فهرستی از مقادیر خاص تعریف می‌کند که «falsy» تلقی می‌شوند چون وقتی به `boolean` coerce می‌شوند `false` می‌شوند — مثل `0` و `""`. هر مقدار دیگر خارج از فهرست «falsy» به‌طور خودکار «truthy» است — وقتی به `boolean` coerce می‌شوند `true` می‌شوند. مقادیر truthy شامل چیزهایی مثل `99.99` و `"free"` است. برای اطلاعات بیشتر «Truthy & Falsy» را در فصل ۲ ببینید.

*Conditionals* به‌اشکال دیگری غیر از `if` وجود دارند. مثلاً statement `switch` می‌تواند به‌عنوان خلاصهٔ مجموعه‌ای از statementهای `if..else` استفاده شود (فصل ۲ را ببینید). حلقه‌ها (ببینید «Loops») از *conditional* برای تعیین ادامه یا توقف حلقه استفاده می‌کنند.

**Note:** برای اطلاعات عمیق‌تر دربارهٔ coercionهایی که می‌توانند در expressionهای تست *conditionals* به‌طور implicit رخ دهند، فصل ۴ عنوان *Types & Grammar* این مجموعه را ببینید.
