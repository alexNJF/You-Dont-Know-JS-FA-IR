# شما جاوااسکریپت را نمی‌دانید: Async & Performance
# فصل ۴: Generatorها

در فصل ۲، دو ضعف کلیدیِ بیان flow-control ناهمگام با callback را شناسایی کردیم:

* مدل async مبتنی بر callback با شیوه‌ای که مغز ما گام‌های یک کار را برنامه‌ریزی می‌کند خوب جور درنمی‌آید.
* callbackها به‌خاطر *inversion of control* نه قابل‌اعتمادند و نه خوب compose می‌شوند.

در فصل ۳، مفصل دیدیم Promiseها چطور *inversion of control* مربوط به callbackها را uninvert می‌کنند و اعتمادپذیری/compose‌پذیری را برمی‌گردانند.

حالا تمرکزمان را می‌گذاریم روی بیان flow-control async به شکلی ترتیبی و شبیه کد synchronous. «جادویی» که این را ممکن می‌کند در ES6 چیزی است به نام **generator**.
