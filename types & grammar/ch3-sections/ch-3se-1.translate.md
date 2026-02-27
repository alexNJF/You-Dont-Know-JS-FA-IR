# Internal `[[Class]]`

مقدارهایی که `typeof` آن‌ها `"object"` است (مثل آرایه) علاوه بر این با یک property داخلی به‌نام `[[Class]]` برچسب می‌خورند (این را بیشتر به‌عنوان *دسته‌بندی* داخلی در نظر بگیرید تا مربوط به کلاس در برنامه‌نویسی کلاس‌محور سنتی). به این property نمی‌توان مستقیم دسترسی داشت، اما معمولاً با قرض گرفتن متد پیش‌فرض `Object.prototype.toString(..)` روی آن مقدار به‌طور غیرمستقیم آشکار می‌شود. مثلاً:

```js
Object.prototype.toString.call( [1,2,3] );			// "[object Array]"

Object.prototype.toString.call( /regex-literal/i );	// "[object RegExp]"
```

پس برای آرایه در این مثال، مقدار داخلی `[[Class]]` برابر `"Array"` است و برای عبارت باقاعده `"RegExp"`. در بیشتر موارد، این مقدار داخلی `[[Class]]` با native constructor از پیش‌تعریف‌شده (پایین را ببینید) مربوط به آن مقدار مطابقت دارد، اما همیشه این‌طور نیست.

مقدارهای primitive چطور؟ اول `null` و `undefined`:

```js
Object.prototype.toString.call( null );			// "[object Null]"
Object.prototype.toString.call( undefined );	// "[object Undefined]"
```

متوجه می‌شوید که native constructor به‌نام `Null()` یا `Undefined()` وجود ندارد، اما با این حال `"Null"` و `"Undefined"` مقدارهای داخلی `[[Class]]` آشکارشده هستند.

اما برای primitiveهای سادهٔ دیگر مثل `string`، `number` و `boolean`، در واقع رفتار دیگری فعال می‌شود که معمولاً «boxing» نامیده می‌شود (بخش «Boxing Wrappers» بعدی را ببینید):

```js
Object.prototype.toString.call( "abc" );	// "[object String]"
Object.prototype.toString.call( 42 );		// "[object Number]"
Object.prototype.toString.call( true );		// "[object Boolean]"
```

در این قطعه، هر کدام از primitiveهای ساده به‌طور خودکار توسط wrapperهای object مربوطه boxing می‌شوند، به‌همین‌دلیل `"String"`، `"Number"` و `"Boolean"` به‌عنوان مقدارهای داخلی `[[Class]]` مربوطه آشکار می‌شوند.

**توجه:** رفتار `toString()` و `[[Class]]` آن‌طور که اینجا نشان داده شده از ES5 به ES6 کمی تغییر کرده؛ جزئیات را در عنوان *ES6 & Beyond* این مجموعه پوشش می‌دهیم.
