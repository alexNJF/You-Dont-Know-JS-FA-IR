# Review

JavaScript هفت *type* از پیش‌تعریف‌شده دارد: `null`، `undefined`، `boolean`، `number`، `string`، `object`، `symbol`. آن‌ها با عملگر `typeof` قابل شناسایی‌اند.

متغیرها type ندارند، اما مقادیر داخل آن‌ها دارند. این typeها رفتار ذاتی مقادیر را تعریف می‌کنند.

بسیاری از توسعه‌دهندگان فرض می‌کنند «undefined» و «undeclared» تقریباً یکی‌اند، اما در JavaScript کاملاً متفاوت‌اند. `undefined` مقداری است که یک متغیر اعلان‌شده می‌تواند نگه دارد. «Undeclared» یعنی متغیر هرگز اعلان نشده است.

متأسفانه JavaScript این دو اصطلاح را تا حدی یکی می‌گیرد، هم در پیام‌های خطا («ReferenceError: a is not defined») و هم در مقادیر برگشتی `typeof` که در هر دو حالت `"undefined"` است.

با این حال، safety guard (جلوگیری از خطا) در `typeof` وقتی روی متغیر undeclared به کار می‌رود در موارد خاص می‌تواند مفید باشد.
