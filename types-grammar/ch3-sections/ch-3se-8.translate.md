## Proposed: Records/Tuples

در زمان نوشتن این متن، پیشنهادی (مرحلهٔ ۲)[^RecordsTuplesProposal] برای افزودن مجموعهٔ جدیدی از ویژگی‌ها به JS وجود دارد که به plain objects و آرایه‌ها نزدیک هستند، اما با تفاوت‌های قابل‌توجه.

Records شبیه plain objects هستند، اما immutable (مهر و موم‌شده، فقط‌خواندنی) هستند و (برخلاف اشیاء) برای اهداف انتساب مقدار و مقایسهٔ برابری به‌عنوان مقادیر اولیه رفتار می‌شوند. تفاوت نحو `#` قبل از محدودکنندهٔ `{ }` است. Records فقط می‌توانند مقادیر اولیه (از جمله records و tuples) را شامل شوند.

Tuples دقیقاً همان رابطه را دارند، اما با آرایه‌ها، از جمله `#` قبل از محدودکننده‌های `[ ]`.

مهم است توجه کنید که اگرچه این‌ها شبیه اشیاء/آرایه‌ها به‌نظر می‌رسند، واقعاً مقادیر اولیه (غیرشیء) هستند.

[^FundamentalObjects]: "20 Fundamental Objects", EcamScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-fundamental-objects ; Accessed August 2022

[^AutoBoxing]: "6.2.4.6 PutValue(V,W)", Step 5.a, ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-putvalue ; Accessed August 2022

[^RecordsTuplesProposal]: "JavaScript Records & Tuples Proposal"; Robin Ricard, Rick Button, Nicolò Ribaudo;
https://github.com/tc39/proposal-record-tuple ; Accessed August 2022
