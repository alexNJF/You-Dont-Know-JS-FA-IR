# تمرین

هیچ جایگزینی برای تمرین در یادگیری برنامه‌نویسی وجود ندارد. هیچ مقدار نوشتهٔ articulate از طرف من به‌تنهایی شما را برنامه‌نویس نمی‌کند.

با این در نظر، بیایید برخی مفاهیمی که در این فصل یاد گرفتیم را تمرین کنیم. «الزامات» را می‌دهم، و شما اول امتحان کنید. سپس فهرست کد زیر را برای دیدن رویکرد من ببینید.

* برنامه‌ای بنویسید برای محاسبهٔ قیمت کل خرید گوشی. تا وقتی پول حساب بانکی‌تان تمام نشده گوشی می‌خرید (راهنما: حلقه!). همچنین برای هر گوشی لوازم جانبی می‌خرید تا وقتی مبلغ خرید زیر آستانهٔ خرج ذهنیتان است.
* بعد از محاسبهٔ مبلغ خرید، مالیات را اضافه کنید، سپس مبلغ خرید محاسبه‌شده را به‌درستی قالب‌بندی و چاپ کنید.
* در نهایت، مبلغ را با موجودی حساب بانکی مقایسه کنید تا ببینید می‌توانید از عهده‌اش برآیید یا نه.
* باید constants برای «نرخ مالیات»، «قیمت گوشی»، «قیمت لوازم جانبی»، و «آستانهٔ خرج» تنظیم کنید، و همچنین متغیری برای «موجودی حساب بانکی».
* باید توابعی برای محاسبهٔ مالیات و قالب‌بندی قیمت با «$» و گرد کردن به دو رقم اعشار تعریف کنید.
* **چالش اضافه:** سعی کنید input را در این برنامه بگنجانید، شاید با `prompt(..)` که در «Input» قبلاً پوشش دادیم. مثلاً می‌توانید از کاربر موجودی حساب بانکی‌اش را بپرسید. لذت ببرید و خلاق باشید!

خب، بروید امتحان کنید. تا خودتان تلاش نکرده‌اید به کد من نگاه نکنید!

**Note:** چون این کتاب JavaScript است، بدیهی است تمرین را با JavaScript حل می‌کنم. اما اگر راحت‌ترید می‌توانید فعلاً با زبان دیگری انجام دهید.

راه‌حل JavaScript من برای این تمرین:

```js
const SPENDING_THRESHOLD = 200;
const TAX_RATE = 0.08;
const PHONE_PRICE = 99.99;
const ACCESSORY_PRICE = 9.99;

var bank_balance = 303.91;
var amount = 0;

function calculateTax(amount) {
	return amount * TAX_RATE;
}

function formatAmount(amount) {
	return "$" + amount.toFixed( 2 );
}

// keep buying phones while you still have money
while (amount < bank_balance) {
	// buy a new phone!
	amount = amount + PHONE_PRICE;

	// can we afford the accessory?
	if (amount < SPENDING_THRESHOLD) {
		amount = amount + ACCESSORY_PRICE;
	}
}

// don't forget to pay the government, too
amount = amount + calculateTax( amount );

console.log(
	"Your purchase: " + formatAmount( amount )
);
// Your purchase: $334.76

// can you actually afford this purchase?
if (amount > bank_balance) {
	console.log(
		"You can't afford this purchase. :("
	);
}
// You can't afford this purchase. :(
```

**Note:** ساده‌ترین راه اجرای این برنامهٔ JavaScript تایپ آن در کنسول توسعه‌دهندهٔ نزدیک‌ترین مرورگرتان است.

چطور انجام دادید؟ حالا که کد من را دیدید بد نیست دوباره امتحان کنید. و با تغییر برخی constants بازی کنید تا ببینید برنامه با مقادیر مختلف چطور اجرا می‌شود.
