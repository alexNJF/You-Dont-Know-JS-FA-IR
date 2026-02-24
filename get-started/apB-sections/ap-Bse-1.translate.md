# تمرین مقایسه‌ها

بیایید با انواع مقدار و مقایسه‌ها (فصل ۴، ستون ۳) تمرین کنیم جایی که coercion باید درگیر شود.

`scheduleMeeting(..)` باید زمان شروع (به‌صورت string «hh:mm» در قالب ۲۴ ساعته) و مدت جلسه (تعداد دقیقه) را بگیرد. باید `true` برگرداند اگر جلسه کاملاً در روز کاری قرار گیرد (طبق زمان‌های مشخص‌شده در `dayStart` و `dayEnd`)؛ در صورت نقض مرزهای روز کاری `false` برگرداند.

```js
const dayStart = "07:30";
const dayEnd = "17:45";

function scheduleMeeting(startTime,durationMinutes) {
    // ..TODO..
}

scheduleMeeting("7:00",15);     // false
scheduleMeeting("07:15",30);    // false
scheduleMeeting("7:30",30);     // true
scheduleMeeting("11:30",60);   // true
scheduleMeeting("17:00",45);   // true
scheduleMeeting("17:30",30);   // false
scheduleMeeting("18:00",15);   // false
```

ابتدا خودتان حل کنید. استفاده از عملگرهای مقایسهٔ برابری و relational، و نحوهٔ تأثیر coercion بر این کد را در نظر بگیرید. وقتی کدی دارید که کار می‌کند، راه‌حل(های) خود را با کد «Suggested Solutions» در انتهای این پیوست *مقایسه* کنید.
