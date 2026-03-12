# نام تابع‌ها

گاهی کد شما می‌خواهد خودش را introspect کند و بپرسد نام یک تابع چیست. اگر بپرسید نام یک تابع چیست، پاسخ به‌شکل غافلگیرکننده‌ای کمی مبهم است. مثال:

```js
function daz() {
	// ..
}

var obj = {
	foo: function() {
		// ..
	},
	bar: function baz() {
		// ..
	},
	bam: daz,
	zim() {
		// ..
	}
};
```

در این مثال، سؤال «نام `obj.foo()` چیست؟» کمی ظریف است. `"foo"` است؟ `""` است؟ یا `undefined`؟ و درباره‌ی `obj.bar()` چطور -- اسمش `"bar"` است یا `"baz"`؟ `obj.bam()` اسمش `"bam"` است یا `"daz"`؟ `obj.zim()` چطور؟

ضمن این‌که درباره‌ی تابع‌هایی که callback پاس داده می‌شوند چه؟

```js
function foo(cb) {
	// what is the name of `cb()` here?
}

foo( function(){
	// I'm anonymous!
} );
```

راه‌های زیادی برای بیان تابع در برنامه‌ها وجود دارد و همیشه واضح و بدون ابهام نیست که «نام» آن تابع باید چه باشد.

از همه مهم‌تر باید بین این دو تمایز بگذاریم: آیا «نام» تابع یعنی ویژگی `name` آن -- بله، تابع‌ها ویژگی `name` دارند -- یا منظور نام lexical binding است؛ مثل `bar` در `function bar() { .. }`.

نام lexical binding همان چیزی است که برای recursion استفاده می‌کنید:

```js
function foo(i) {
	if (i < 10) return foo( i * 2 );
	return i;
}
```

ویژگی `name` همان چیزی است که برای اهداف متاپروگرمینگ استفاده می‌شود، پس تمرکز ما همین است.

ابهام از این‌جا می‌آید که به‌صورت پیش‌فرض، نام lexical تابع (اگر داشته باشد) به‌عنوان ویژگی `name` هم ست می‌شود. در ES5 (و قبل‌تر) این رفتار الزام رسمی مشخصات نبود. تنظیم `name` غیراستاندارد بود، هرچند نسبتاً قابل اتکا. از ES6 به بعد استاندارد شده است.

**نکته:** اگر تابعی مقدار `name` داشته باشد، معمولاً همان نامی است که در stack trace ابزارهای توسعه‌دهنده دیده می‌شود.

### استنتاج‌ها (Inferences)

اما اگر تابع نام lexical نداشته باشد برای ویژگی `name` چه می‌شود؟

از ES6 به بعد، قواعد استنتاجی وجود دارد که حتی وقتی تابع نام lexical ندارد، می‌توانند یک مقدار معقول برای `name` تعیین کنند.

مثال:

```js
var abc = function() {
	// ..
};

abc.name;				// "abc"
```

اگر به تابع نام lexical می‌دادیم مثل `abc = function def() { .. }`، ویژگی `name` طبیعتاً `"def"` می‌شد. اما وقتی نام lexical نیست، نام `"abc"` منطقی به نظر می‌رسد.

فرم‌های دیگری که در ES6 نام را استنتاج می‌کنند (یا نمی‌کنند):

```js
(function(){ .. });					// name:
(function*(){ .. });				// name:
window.foo = function(){ .. };		// name:

class Awesome {
	constructor() { .. }			// name: Awesome
	funny() { .. }					// name: funny
}

var c = class Awesome { .. };		// name: Awesome

var o = {
	foo() { .. },					// name: foo
	*bar() { .. },					// name: bar
	baz: () => { .. },				// name: baz
	bam: function(){ .. },			// name: bam
	get qux() { .. },				// name: get qux
	set fuz() { .. },				// name: set fuz
	["b" + "iz"]:
		function(){ .. },			// name: biz
	[Symbol( "buz" )]:
		function(){ .. }			// name: [buz]
};

var x = o.foo.bind( o );			// name: bound foo
(function(){ .. }).bind( o );		// name: bound

export default function() { .. }	// name: default

var y = new Function();				// name: anonymous
var GeneratorFunction =
	function*(){}.__proto__.constructor;
var z = new GeneratorFunction();	// name: anonymous
```

ویژگی `name` به‌صورت پیش‌فرض writable نیست، اما configurable است؛ یعنی اگر بخواهید می‌توانید با `Object.defineProperty(..)` دستی آن را تغییر دهید.
