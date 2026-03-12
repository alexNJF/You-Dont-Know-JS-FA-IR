# Spread/Rest

ES6 یک operator جدید به نام `...` معرفی می‌کند که بسته به محل/نحوهٔ استفاده، معمولاً *spread* یا *rest* نامیده می‌شود. بیایید نگاه کنیم:

```js
function foo(x,y,z) {
	console.log( x, y, z );
}

foo( ...[1,2,3] );				// 1 2 3
```

وقتی `...` جلوی یک array قرار می‌گیرد (در واقع هر *iterable* که در فصل ۳ پوشش می‌دهیم)، آن را به valueهای جداگانه‌اش «پخش» می‌کند.

معمولاً این الگو را وقتی می‌بینید که array را به‌عنوان مجموعهٔ argumentهای یک فراخوانی تابع spread می‌کنیم. در این حالت، `...` جایگزین نحوی ساده‌تری برای `apply(..)` است که پیش از ES6 معمولاً به این شکل استفاده می‌کردیم:

```js
foo.apply( null, [1,2,3] );		// 1 2 3
```

اما `...` در زمینه‌های دیگر هم برای باز کردن valueها قابل استفاده است؛ مثلاً داخل تعریف array دیگر:

```js
var a = [2,3,4];
var b = [ 1, ...a, 5 ];

console.log( b );					// [1,2,3,4,5]
```

در این کاربرد، `...` عملاً نقش `concat(..)` را بازی می‌کند، چون اینجا مثل `[1].concat( a, [5] )` رفتار می‌کند.

کاربرد رایج دیگر `...` عملاً عکس این ماجراست؛ به‌جای پخش کردن value، `...` مجموعه‌ای از valueها را *جمع* می‌کند و داخل یک array می‌گذارد. مثال:

```js
function foo(x, y, ...z) {
	console.log( x, y, z );
}

foo( 1, 2, 3, 4, 5 );			// 1 2 [3,4,5]
```

`...z` در این snippet عملاً می‌گوید: «بقیهٔ argumentها (اگر باشند) را در arrayای به نام `z` جمع کن.» چون `x` مقدار `1` گرفته و `y` مقدار `2`، بقیهٔ argumentها یعنی `3` و `4` و `5` در `z` جمع شدند.

طبعاً اگر parameter نام‌گذاری‌شده نداشته باشید، `...` همهٔ argumentها را جمع می‌کند:

```js
function foo(...args) {
	console.log( args );
}

foo( 1, 2, 3, 4, 5);			// [1,2,3,4,5]
```

**نکته:** `...args` در declaration تابع `foo(..)` معمولاً «rest parameters» نامیده می‌شود، چون «بقیهٔ» parameterها را جمع می‌کند. من واژهٔ «gather» را ترجیح می‌دهم، چون بیشتر توضیح می‌دهد چه کاری انجام می‌دهد تا اینکه چه چیزی را نگه می‌دارد.

بهترین بخش این کاربرد این است که جایگزین بسیار خوبی برای `arguments` قدیمی فراهم می‌کند؛ چیزی که در واقع array واقعی نیست و فقط شبیه array است. چون `args` (یا هر نام دیگری مثل `r` یا `rest`) واقعاً یک array است، می‌توانیم از خیلی ترفندهای عجیب پیشا-ES6 برای تبدیل `arguments` به یک array واقعی خلاص شویم.

مثال:

```js
// doing things the new ES6 way
function foo(...args) {
	// `args` is already a real array

	// discard first element in `args`
	args.shift();

	// pass along all of `args` as arguments
	// to `console.log(..)`
	console.log( ...args );
}

// doing things the old-school pre-ES6 way
function bar() {
	// turn `arguments` into a real array
	var args = Array.prototype.slice.call( arguments );

	// add some elements on the end
	args.push( 4, 5 );

	// filter out odd numbers
	args = args.filter( function(v){
		return v % 2 == 0;
	} );

	// pass along all of `args` as arguments
	// to `foo(..)`
	foo.apply( null, args );
}

bar( 0, 1, 2, 3 );					// 2 4
```

`...args` در declaration تابع `foo(..)` argumentها را gather می‌کند و `...args` در فراخوانی `console.log(..)` آن‌ها را spread می‌کند. این مثال خوبی از کاربردهای متقارن اما معکوس `...` است.

علاوه بر کاربرد `...` در declaration تابع، یک مورد دیگر هم وجود دارد که `...` برای gather کردن valueها استفاده می‌شود که در بخش «Too Many, Too Few, Just Enough» همین فصل می‌بینیم.
