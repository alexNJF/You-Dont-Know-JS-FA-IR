# بلوک‌ها

کارمند فروشگاه موبایل باید مراحلی را برای تکمیل پرداخت هنگام خرید گوشی جدیدتان طی کند.

به‌طور مشابه، در کد اغلب باید مجموعه‌ای از statementها را با هم گروه‌بندی کنیم، که معمولاً *block* نامیده می‌شود. در JavaScript، یک block با قرار دادن یک یا چند statement داخل جفت آکولاد `{ .. }` تعریف می‌شود. در نظر بگیرید:

```js
var amount = 99.99;

// a general block
{
	amount = amount * 2;
	console.log( amount );	// 199.98
}
```

این نوع block کلی مستقل `{ .. }` معتبر است، اما در برنامه‌های JS به‌اندازهٔ رایج دیده نمی‌شود. معمولاً blockها به statement کنترل دیگری وصل می‌شوند، مثل statement `if` (ببینید «Conditionals») یا حلقه (ببینید «Loops»). مثلاً:

```js
var amount = 99.99;

// is amount big enough?
if (amount > 10) {			// <-- block attached to `if`
	amount = amount * 2;
	console.log( amount );	// 199.98
}
```

statementهای `if` را در بخش بعد توضیح می‌دهیم، اما همان‌طور که می‌بینید، block `{ .. }` با دو statementاش به `if (amount > 10)` وصل است؛ statementهای داخل block فقط اگر conditional برقرار باشد پردازش می‌شوند.

**Note:** برخلاف اکثر statementهای دیگر مثل `console.log(amount);`، یک block statement نیازی به نقطه‌ویرگول (`;`) برای پایان ندارد.
