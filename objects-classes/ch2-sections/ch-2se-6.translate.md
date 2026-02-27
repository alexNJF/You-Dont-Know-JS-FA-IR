# رفتار اشیاء

ویژگی‌های روی اشیاء به‌طور داخلی توسط metaobject «descriptor» تعریف و کنترل می‌شوند که شامل attributeهایی مثل `value` (مقدار فعلی ویژگی) و `enumerable` (boolean کنترل‌کنندهٔ اینکه آیا ویژگی در لیست‌های فقط-enumerable ویژگی‌ها/نام ویژگی‌ها گنجانده شود) است.

نحوهٔ کار اشیاء و ویژگی‌هایشان در جاوااسکریپت «metaobject protocol» (MOP)[^mop] نامیده می‌شود. می‌توانیم رفتار دقیق ویژگی‌ها را از طریق `Object.defineProperty(..)` کنترل کنیم، و همچنین رفتارهای سراسری شیء را با `Object.freeze(..)`. اما حتی قدرتمندتر، می‌توانیم با Symbolهای از پیش تعریف‌شدهٔ خاص به برخی رفتارهای پیش‌فرض روی اشیاء قلاب بزنیم و آن‌ها را override کنیم.

Prototypeها linkageهای داخلی بین اشیاء هستند که دسترسی به ویژگی یا متد روی یک شیء را — اگر ویژگی/متد درخواستی غایب باشد — با «delegating» آن جستجوی دسترسی به شیء دیگر امکان‌پذیر می‌کنند. وقتی delegation متد را شامل می‌شود، زمینهٔ اجرای متد از شیء اولیه به شیء هدف از طریق کلمهٔ کلیدی `this` به اشتراک گذاشته می‌شود.

[^mop]: "Metaobject", Wikipedia; https://en.wikipedia.org/wiki/Metaobject ; Accessed July 2022.

[^specApB]: "Appendix B: Additional ECMAScript Features for Web Browsers", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-additional-ecmascript-features-for-web-browsers ; Accessed July 2022
