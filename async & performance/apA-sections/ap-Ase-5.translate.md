# Iterable Sequenceها

پارادایم معمول sequence این است که هر step مسئول complete کردن خودش است، و همین sequence را جلو می‌برد. Promise هم همین‌طور کار می‌کند.

بخش ناخوشایند ماجرا این است که بعضی وقت‌ها به کنترل بیرونی روی Promise/step نیاز دارید، که منجر به "capability extraction" awkward می‌شود.

مثال Promise:

```js
var domready = new Promise( function(resolve,reject){
	// don't want to put this here, because
	// it belongs logically in another part
	// of the code
	document.addEventListener( "DOMContentLoaded", resolve );
} );

// ..

domready.then( function(){
	// DOM is ready!
} );
```

anti-pattern مربوط به "capability extraction" در Promise این‌طور است:

```js
var ready;

var domready = new Promise( function(resolve,reject){
	// extract the `resolve()` capability
	ready = resolve;
} );

// ..

domready.then( function(){
	// DOM is ready!
} );

// ..

document.addEventListener( "DOMContentLoaded", ready );
```

**نکته:** به نظر من این anti-pattern بوی بد طراحی می‌دهد، هرچند بعضی توسعه‌دهنده‌ها دوستش دارند.

*asynquence* یک نوع sequence وارونه دارد که من اسمش را "iterable sequences" گذاشته‌ام؛ در آن capability کنترل بیرونی می‌شود (برای caseهایی مثل `domready` خیلی مفید است):

```js
// note: `domready` here is an *iterator* that
// controls the sequence
var domready = ASQ.iterable();

// ..

domready.val( function(){
	// DOM is ready
} );

// ..

document.addEventListener( "DOMContentLoaded", domready.next );
```

البته iterable sequenceها فقط همین کاربرد را ندارند. در پیوست B دوباره به آن‌ها برمی‌گردیم.
