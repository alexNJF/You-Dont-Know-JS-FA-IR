# خلاصه (TL;DR)

وقتی دسترسی به property روی objectی انجام می‌شود که آن property را ندارد، پیوند داخلی `[[Prototype]]` آن object مشخص می‌کند عملیات `[[Get]]` (فصل ۳ را ببینید) بعداً کجا را جستجو کند. این پیوند آبشاری از object به object در اصل یک «prototype chain» (تا حدی شبیه زنجیرهٔ scope تودرتو) از objectها برای پیمایش برای property resolution تعریف می‌کند.

همهٔ objectهای معمولی `Object.prototype`ی built-in را در بالای prototype chain دارند (مثل scope سراسری در scope look-up)، جایی که property resolution در آن متوقف می‌شود اگر پیش از آن در زنجیره پیدا نشود. `toString()`، `valueOf()` و چند utility رایج دیگر روی این objectِ `Object.prototype` وجود دارند، که توضیح می‌دهد چگونه همهٔ objectهای زبان می‌توانند به آن‌ها دسترسی یابند.

متداول‌ترین راه برای پیوند خوردن دو object به هم استفاده از کلیدواژهٔ `new` با فراخوانی function است، که در میان چهار گامش (فصل ۲ را ببینید)، یک object جدید پیوندخورده به object دیگری می‌سازد.

«object دیگر»ی که object جدید به آن پیوند خورده اتفاقاً objectی است که توسط property با نام دلخواه `.prototype`ِ function فراخوانی‌شده با `new` به آن ارجاع داده شده. Functionهای فراخوانی‌شده با `new` غالباً «constructor» خوانده می‌شوند، علیرغم اینکه در واقع class را آن‌گونه که *constructor*ها در زبان‌های سنتی class-oriented می‌کنند instantiate نمی‌کنند.

هرچند این مکانیزم‌های JavaScript می‌توانند به «class instantiation» و «class inheritance» از زبان‌های سنتی class-oriented *شبیه* به‌نظر برسند، تمایز کلیدی این است که در JavaScript هیچ کپی‌ای انجام نمی‌شود. بلکه objectها در نهایت از طریق زنجیرهٔ داخلی `[[Prototype]]` به هم پیوند می‌خورند.

به دلایل گوناگون، که کمترینش پیشینهٔ اصطلاح‌شناسی نیست، «inheritance» (و «prototypal inheritance») و همهٔ اصطلاحات OO دیگر وقتی نحوهٔ *واقعی* کار JavaScript در نظر گرفته می‌شود (نه فقط وقتی بر مدل‌های ذهنی تحمیل‌شدهٔ ما اعمال شود) معنا نمی‌دهند.

به‌جای آن، «delegation» اصطلاح مناسب‌تری است، چون این روابط *کپی* نیستند بلکه **پیوند**های delegation هستند.
