# Modules

اگر بگوییم مهم‌ترین الگوی سازمان‌دهی کد در JavaScript «module» است، اغراق نکرده‌ایم. برای بسیاری از توسعه‌دهندگان، بخش عمدهٔ کد با الگوی module نوشته می‌شود.

### The Old Way

الگوی سنتی module: یک function بیرونی + متغیرها/تابع‌های داخلی + یک API عمومی برگشتی که با closure به داخل دسترسی دارد:

```js
function Hello(name) {
	function greeting() {
		console.log( "Hello " + name + "!" );
	}

	// public API
	return {
		greeting: greeting
	};
}

var me = Hello( "Kyle" );
me.greeting();			// Hello Kyle!
```

این module چند instance می‌سازد. اگر singleton بخواهیم، IIFE رایج است:

```js
var me = (function Hello(name){
	function greeting() {
		console.log( "Hello " + name + "!" );
	}

	// public API
	return {
		greeting: greeting
	};
})( "Kyle" );

me.greeting();			// Hello Kyle!
```

این الگو امتحانش را پس داده و variationهای زیادی دارد (مثل AMD و UMD).

### Moving Forward

در ES6 دیگر لازم نیست برای module به function enclosing و closure تکیه کنیم. moduleها پشتیبانی syntax/behavior سطح زبان دارند.

تفاوت‌های مفهومی مهم نسبت به الگوهای قبلی:

* ES6 file-based است: هر module در یک فایل. فعلاً روش استانداردی برای چند module در یک فایل نداریم.
* API module در ES6 ایستا (static) است: exportهای top-level را از قبل مشخص می‌کنید و بعداً قابل تغییر ساختاری نیست.
* moduleهای ES6 singleton هستند: یک instance مرکزی با state مشترک.
* export/import در ES6 کپی value ساده نیست؛ binding زنده است (شبیه pointer به identifier داخلی module).
* `import` هم‌زمان درخواست load ایستا است (مرورگر: شبکه، Node: filesystem)؛ اما چون static است، engine می‌تواند پیش‌بارگذاری هوشمند انجام دهد.

ES6 مکانیزم load را مستقیماً مشخص نمی‌کند؛ مفهوم جداگانه‌ای به نام Module Loader داریم که توسط محیط میزبان (browser/Node/...) پیاده‌سازی می‌شود.

### CommonJS

CommonJS (به‌خصوص در Node.js) syntax نزدیک اما ناسازگار کامل با ES6 modules دارد.

در بلندمدت ES6 modules به‌خاطر پشتیبانی نحوی در خود زبان، به‌احتمال زیاد فرمت غالب می‌شوند. ولی گذار زمان‌بر است؛ تعداد moduleهای موجود در CommonJS/AMD/UMD بسیار زیاد است. بنابراین transpiler/converterها در دورهٔ گذار ضروری‌اند.

### The New Way

دو keyword اصلی: `import` و `export`.

**هشدار:** هر دو باید در top-level باشند؛ داخل `if` یا function مجاز نیستند.

#### `export`ing API Members

`export` یا قبل declaration می‌آید یا با لیست binding:

```js
export function foo() {
	// ..
}

export var awesome = 42;

var bar = [1,2,3];
export { bar };
```

معادل:

```js
function foo() {
	// ..
}

var awesome = 42;
var bar = [1,2,3];

export { foo, awesome, bar };
```

این‌ها *named export* هستند.

هرچه با `export` بیرون نبرید، private می‌ماند. top-level در module به معنی global نیست؛ scope خود module است.

rename هنگام export:

```js
function foo() { .. }

export { foo as bar };
```

سمت import فقط `bar` در دسترس است.

نکتهٔ کلیدی: export در ES6 binding زنده می‌دهد، نه کپی value. اگر متغیر داخلی بعداً تغییر کند، importها مقدار به‌روز را می‌بینند.

```js
var awesome = 42;
export { awesome };

// later
awesome = 100;
```

importها در نهایت `100` را می‌بینند.

ES6 از نظر فلسفه ترجیح می‌دهد module یک *default export* داشته باشد:

```js
export default foo;
```

اما تفاوت ظریف مهم:

```js
function foo(..) {
	// ..
}

export default foo;
```

در این فرم، یک expression value export می‌شود (نه binding به identifier `foo`).

در مقابل:

```js
function foo(..) {
	// ..
}

export { foo as default };
```

اینجا default به binding identifier `foo` وصل است؛ اگر `foo` بعداً عوض شود، import هم value جدید می‌بیند.

پس اگر default value قرار نیست عوض شود `export default ..` خوب است؛ اگر قرار است عوض شود باید `export { .. as default }` استفاده کنید.

الگوی discouraged:

```js
export default {
	foo() { .. },
	bar() { .. },
	..
};
```

چون static analysis برای object literal کامل API سخت‌تر است.

بهتر:

```js
export default function foo() { .. }

export function bar() { .. }
export function baz() { .. }
```

یا:

```js
function foo() { .. }
function bar() { .. }
function baz() { .. }

export { foo as default, bar, baz, .. };
```

اگر API بزرگ دارید، یا تماماً named export کنید یا مصرف‌کننده را به namespace import هدایت کنید.

bindingها live هستند:

```js
var foo = 42;
export { foo as default };

export var bar = "hello world";

foo = 10;
bar = "cool";
```

importها `10` و `"cool"` را می‌بینند.

**هشدار:** binding دوطرفه نداریم؛ import‌شده قابل assign نیست.

re-export هم داریم:

```js
export { foo, bar } from "baz";
export { foo as FOO, bar as BAR } from "baz";
export * from "baz";
```

در این حالت bindingهای `baz` از scope محلی شما عبور مستقیم می‌کنند.

#### `import`ing API Members

فرم پایه:

```js
import { foo, bar, baz } from "foo";
```

**هشدار:** `{ .. }` اینجا object literal/destructuring نیست؛ syntax مخصوص module است.

module specifier باید string literal باشد (برای static analysis).

identifierهای import‌شده باید با named exportهای واقعی module match داشته باشند.

rename هنگام import:

```js
import { foo as theFooFunc } from "foo";

theFooFunc();
```

default import ساده‌تر است:

```js
import foo from "foo";

// or:
import { default as foo } from "foo";
```

import هم‌زمان default + named:

```js
import FOOFN, { bar, baz as BAZ } from "foo";

FOOFN();
bar();
BAZ();
```

فلسفهٔ ES6: فقط bindingهایی را import کنید که لازم دارید.

اما اگر بخواهید همهٔ API را در یک namespace بگیرید:

```js
import * as foo from "foo";

foo.bar();
foo.x;			// 42
foo.baz();
```

با namespace import یا همه‌چیز را می‌گیرید یا هیچ.

اگر module default هم داشته باشد، داخل namespace با نام `default` قابل دسترسی است:

```js
import foofn, * as hello from "world";

foofn();
hello.default();
hello.bar();
hello.baz();
```

همهٔ bindingهای import‌شده immutable/read-only هستند:

```js
import foofn, * as hello from "world";

foofn = 42;			// (runtime) TypeError!
hello.default = 42;	// (runtime) TypeError!
hello.bar = 42;		// (runtime) TypeError!
hello.baz = 42;		// (runtime) TypeError!
```

module داخلی می‌تواند value binding خودش را تغییر دهد، اما consumer import نمی‌تواند.

`import`ها hoist می‌شوند:

```js
foo();

import { foo } from "foo";
```

و فرم bare import:

```js
import "foo";
```

این فرم bindingی وارد scope نمی‌کند؛ فقط load/compile/evaluate را تضمین می‌کند.

### Circular Module Dependency

اگر A از B import کند و B از A:

ES6 با تحلیل static export/import هر دو module، bindingها را اعتبارسنجی و resolve می‌کند؛ در نتیجه dependency دایره‌ای (در صورت طراحی درست) قابل‌اجراست.

نمونه:

```js
// A
import bar from "B";

export default function foo(x) {
	if (x > 10) return bar( x - 1 );
	return x * 2;
}
```

```js
// B
import foo from "A";

export default function bar(y) {
	if (y > 5) return foo( y / 2 );
	return y * 3;
}
```

مصرف:

```js
import foo from "foo";
foo( 25 );				// 11
```

یا:

```js
import bar from "bar";
bar( 25 );				// 11.5
```

یا هر دو:

```js
import foo from "foo";
import bar from "bar";

foo( 25 );				// 11
bar( 25 );				// 11.5
```

### Module Loading

گفتیم `import` برای resolve واقعی مسیر ماژول به مکانیزم بیرونی (Module Loader) متکی است. loader پیش‌فرض در مرورگر معمولاً URL و در Node مسیر فایل را تفسیر می‌کند و فرض می‌کند فایل فرمت module استاندارد ES6 دارد.

بارگذاری module در HTML هم با tag مخصوص انجام می‌شود (در زمان نگارش مشخص نبود `<script type="module">` یا `<module>`).

loader خودِ ES6 تعریف نمی‌کند؛ استاندارد جداگانهٔ WHATWG است:
http://whatwg.github.io/loader/

#### Loading Modules Outside of Modules

اگر در اسکریپت معمولی (غیر-module) بخواهید module load کنید:

```js
// normal script loaded in browser via `<script>`,
// `import` is illegal here

Reflect.Loader.import( "foo" ) // returns a promise for `"foo"`
.then( function(foo){
	foo.bar();
} );
```

`Reflect.Loader.import(..)` namespace import می‌دهد و Promise برمی‌گرداند.

**نکته:** برای چند module می‌توانید `Promise.all([ .. ])` بزنید.

همین API برای dynamic/conditional loading داخل module هم مفید است (مثلاً polyfill featureهای آینده).

#### Customized Loading

ممکن است بخواهید loader را customize کنید (تنظیمات یا override رفتار).

polyfill مربوط:
https://github.com/ModuleLoader/es6-module-loader

نمونهٔ احتمالی:

```js
Reflect.Loader.import( "foo", { address: "/path/to/foo.js" } )
.then( function(foo){
	// ..
} )
```

همچنین انتظار می‌رود hookهایی برای translation/transpilation بین load و compile فراهم شود؛ مثلاً برای CoffeeScript/TypeScript/CommonJS/AMD و تبدیل آن‌ها به module سازگار با ES6.
