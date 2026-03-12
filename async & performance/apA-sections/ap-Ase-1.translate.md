# Sequenceها و طراحی Abstraction

فهم *asynquence* از یک abstraction بنیادی شروع می‌شود: هر سری از گام‌های یک task، چه جداگانه sync باشند چه async، می‌توانند در مجموع یک "sequence" در نظر گرفته شوند. یعنی sequence یک container است که یک task را نمایندگی می‌کند و از stepهای جداگانه (که می‌توانند async باشند) برای تکمیل آن task تشکیل شده است.

هر step در sequence پشت‌صحنه با یک Promise کنترل می‌شود (فصل ۳). یعنی هر step جدیدی که به sequence اضافه می‌کنید، به‌صورت ضمنی یک Promise می‌سازد که به انتهای قبلی sequence متصل است. به‌خاطر semantics مربوط به Promise، پیشروی هر step در sequence async است، حتی اگر step را sync تمام کنید.

علاوه بر این، sequence همیشه خطی از step به step جلو می‌رود؛ یعنی step 2 همیشه بعد از اتمام step 1 است و همین‌طور ادامه.

طبیعتاً می‌شود از یک sequence، sequence جدید fork کرد؛ یعنی fork فقط وقتی رخ می‌دهد که sequence اصلی به آن نقطه برسد. sequenceها را همچنین می‌شود به شکل‌های مختلف ترکیب کرد، از جمله اینکه یک sequence در نقطه‌ای از flow زیرمجموعه‌ی sequence دیگر شود.

sequence تا حدی شبیه Promise chain است. اما در Promise chain یک «handle» ندارید که کل chain را یکجا نمایندگی کند. هر Promiseای که referenceاش را دارید فقط step فعلی و stepهای بعد از آن را نمایندگی می‌کند. عملاً تا reference Promise اول chain را نگه ندارید، reference واحدی به کل chain ندارید.

در خیلی از موارد داشتن handleای که کل sequence را یکجا نمایندگی کند بسیار مفید است. مهم‌ترین مورد abort/cancel sequence است. همان‌طور که در فصل ۳ مفصل گفتیم، خود Promise نباید cancel شود، چون یک اصل طراحی بنیادی را نقض می‌کند: immutability بیرونی.

اما sequence چنین اصل immutability ندارد، عمدتاً چون sequence مثل Promise به‌عنوان container مقدار آینده با semantics immutable دست‌به‌دست نمی‌شود. بنابراین سطح درست abstraction برای abort/cancel، خود sequence است. sequenceهای *asynquence* هر لحظه می‌توانند `abort()` شوند و از همان نقطه متوقف می‌شوند.

دلایل بیشتری هم برای ترجیح abstraction مبتنی بر sequence نسبت به Promise chain صرف وجود دارد.

اول اینکه chaining در Promise فرآیندی نسبتاً دستی است -- و وقتی در کل برنامه Promise زیاد بسازید و chain کنید خسته‌کننده می‌شود -- و همین خستگی می‌تواند توسعه‌دهنده را از استفاده‌ی Promise در جاهایی که واقعاً مناسب است منصرف کند.

abstraction قرار است boilerplate و خستگی را کم کند؛ پس abstraction مربوط به sequence راه‌حل خوبی است. در Promise تمرکز روی step تکی است و فرض کمی وجود دارد که chain را بی‌نهایت ادامه می‌دهید. در sequence برعکس، پیش‌فرض این است که stepهای بیشتری به‌مرور اضافه خواهند شد.

این کاهش پیچیدگی abstraction مخصوصاً وقتی قدرتمند می‌شود که سراغ الگوهای Promise سطح‌بالاتر بروید (فراتر از `race([..])` و `all([..])`).

مثلاً وسط یک sequence ممکن است بخواهید stepی شبیه `try..catch` بیان کنید؛ stepی که همیشه در نهایت به موفقیت می‌رسد، یا با موفقیت اصلی، یا با سیگنال غیرخطای مثبت برای خطای catch شده. یا شاید بخواهید stepی شبیه retry/until loop بنویسید که تا موفقیت بارها همان step را تکرار کند.

بیان این abstractionها فقط با Promise primitives ساده نیست، و وسط یک Promise chain موجود هم ظاهر خوبی ندارد. اما اگر دیدتان را به sequence abstraction منتقل کنید و step را wrapper دور Promise ببینید، همان wrapper می‌تواند جزئیات را پنهان کند و شما روی flow-control معنادارتر تمرکز کنید.

دوم، و شاید مهم‌تر، فکر کردن به flow-control async در قالب stepهای sequence کمک می‌کند جزئیات نوع ناهمگامی هر step را abstraction کنید. زیرپوست، Promise همیشه step را کنترل می‌کند؛ اما روی سطح، همان step می‌تواند شبیه continuation callback (حالت ساده پیش‌فرض)، یا Promise واقعی، یا generator run-to-completion، یا... باشد.

سوم، sequenceها راحت‌تر به modeهای فکری مختلف خم می‌شوند؛ مثل event-based، stream-based یا reactive coding. *asynquence* الگویی دارد که من به آن "reactive sequences" می‌گویم (بعداً می‌بینیم) که variationای بر ایده‌های "reactive observable" در RxJS است و اجازه می‌دهد هر بار یک event تکرارشونده رخ دهد، یک instance جدید sequence اجرا شود. Promise تک‌مصرف است و بیان ناهمگامی تکرارشونده فقط با Promise خام awkward می‌شود.

mode فکری جایگزین دیگر الگوی resolution/control را وارونه می‌کند؛ الگویی که من "iterable sequences" می‌نامم. به‌جای اینکه هر step completion خودش (و پیشروی sequence) را کنترل کند، sequence وارونه می‌شود تا کنترل پیشروی از iterator بیرونی بیاید، و هر step در *iterable sequence* فقط به کنترل `next(..)` iterator پاسخ بدهد.

در ادامه‌ی همین پیوست همه‌ی این variationها را بررسی می‌کنیم، پس اگر اینجا کمی سریع از آن‌ها گذشتیم نگران نباشید.

خلاصه: sequence به‌عنوان abstraction برای ناهمگامی پیچیده، از Promise صرف (یا Promise chain صرف) و generator صرف قوی‌تر و معنادارتر است، و *asynquence* طوری طراحی شده که این abstraction را با مقدار مناسبی از sugar بیان کند تا برنامه‌نویسی async قابل‌فهم‌تر و خوشایندتر شود.
