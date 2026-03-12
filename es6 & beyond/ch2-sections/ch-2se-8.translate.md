# `for..of` Loops

در کنار `for` و `for..in` که از قبل در JavaScript داشتیم، ES6 حلقهٔ `for..of` را اضافه می‌کند که روی مجموعهٔ valueهایی که یک *iterator* تولید می‌کند loop می‌زند.

مقداری که با `for..of` روی آن loop می‌کنید باید *iterable* باشد، یا مقداری باشد که بتوان آن را به objectی iterable coercion/boxing کرد (در کتاب *Types & Grammar* توضیح داده شده). iterable یعنی objectی که بتواند یک iterator تولید کند و حلقه از آن استفاده کند.

برای درک تفاوت، `for..of` و `for..in` را مقایسه کنیم:

```js
var a = ["a","b","c","d","e"];

for (var idx in a) {
	console.log( idx );
}
// 0 1 2 3 4

for (var val of a) {
	console.log( val );
}
// "a" "b" "c" "d" "e"
```

همان‌طور که می‌بینید، `for..in` روی key/indexهای array می‌چرخد، ولی `for..of` روی خود valueها.

نسخهٔ پیشا-ES6 معادل `for..of` بالا:

```js
var a = ["a","b","c","d","e"],
	k = Object.keys( a );

for (var val, i = 0; i < k.length; i++) {
	val = a[ k[i] ];
	console.log( val );
}
// "a" "b" "c" "d" "e"
```

و نسخهٔ ES6 اما بدون `for..of`، که هم‌زمان نگاهی هم به iteration دستی iterator می‌دهد (فصل ۳):

```js
var a = ["a","b","c","d","e"];

for (var val, ret, it = a[Symbol.iterator]();
	(ret = it.next()) && !ret.done;
) {
	val = ret.value;
	console.log( val );
}
// "a" "b" "c" "d" "e"
```

پشت صحنه، `for..of` از iterable یک iterator می‌گیرد (با `Symbol.iterator` داخلی؛ بخش "Well-Known Symbols" در فصل ۷)، سپس بارها آن iterator را صدا می‌زند و value تولیدی را در متغیر iteration حلقه می‌گذارد.

valueهای built-in استانداردی که پیش‌فرض iterable هستند (یا iterable ارائه می‌دهند):

* Arrays
* Strings
* Generators (فصل ۳)
* Collections / TypedArrays (فصل ۵)

**هشدار:** objectهای plain به‌طور پیش‌فرض برای `for..of` مناسب نیستند، چون iterator پیش‌فرض ندارند؛ این عمدی است نه اشتباه. در فصل ۳ بخش "Iterators" می‌بینیم چطور برای objectهای خودمان iterator تعریف کنیم تا `for..of` بتواند روی هر object با valueهای تعریف‌شدهٔ ما loop بزند.

نمونهٔ loop روی کاراکترهای یک string primitive:

```js
for (var c of "hello") {
	console.log( c );
}
// "h" "e" "l" "l" "o"
```

رشتهٔ primitive `"hello"` به wrapper object از نوع `String` coercion/boxed می‌شود که پیش‌فرض iterable است.

در `for (XYZ of ABC)..`، بخش `XYZ` می‌تواند assignment expression یا declaration باشد، دقیقاً مثل همان بخش در `for` و `for..in`. پس کارهایی مثل این هم ممکن است:

```js
var o = {};

for (o.a of [1,2,3]) {
	console.log( o.a );
}
// 1 2 3

for ({x: o.a} of [ {x: 1}, {x: 2}, {x: 3} ]) {
  console.log( o.a );
}
// 1 2 3
```

حلقه‌های `for..of` مثل حلقه‌های دیگر می‌توانند زودتر متوقف شوند (`break`، `continue`، `return` داخل تابع، یا exception). در این حالت‌ها، `return(..)` iterator (اگر وجود داشته باشد) خودکار صدا زده می‌شود تا cleanup لازم انجام شود.

**نکته:** برای پوشش کامل iterable و iterator به بخش "Iterators" در فصل ۳ مراجعه کنید.
