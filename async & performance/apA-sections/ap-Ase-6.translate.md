# اجرای Generatorها

در فصل ۴ utilityای به نام `run(..)` استخراج کردیم که generator را تا completion اجرا می‌کند، به Promiseهای `yield`شده گوش می‌دهد و با آن‌ها generator را async resume می‌کند. *asynquence* همین utility را built-in دارد با نام `runner(..)`.

اول چند helper برای نمایش:

```js
function doublePr(x) {
	return new Promise( function(resolve,reject){
		setTimeout( function(){
			resolve( x * 2 );
		}, 100 );
	} );
}

function doubleSeq(x) {
	return ASQ( function(done){
		setTimeout( function(){
			done( x * 2)
		}, 100 );
	} );
}
```

حالا می‌توانیم `runner(..)` را به‌عنوان step وسط یک sequence استفاده کنیم:

```js
ASQ( 10, 11 )
.runner( function*(token){
	var x = token.messages[0] + token.messages[1];

	// yield a real promise
	x = yield doublePr( x );

	// yield a sequence
	x = yield doubleSeq( x );

	return x;
} )
.val( function(msg){
	console.log( msg );			// 84
} );
```

### Generatorهای Wrap‌شده

همچنین می‌توانید یک generator خودبسته‌بندی‌شده بسازید -- یعنی تابعی عادی که generator مشخص شما را اجرا کند و یک sequence برای completion آن برگرداند -- با `ASQ.wrap(..)`:

```js
var foo = ASQ.wrap( function*(token){
	var x = token.messages[0] + token.messages[1];

	// yield a real promise
	x = yield doublePr( x );

	// yield a sequence
	x = yield doubleSeq( x );

	return x;
}, { gen: true } );

// ..

foo( 8, 9 )
.val( function(msg){
	console.log( msg );			// 68
} );
```

`runner(..)` قابلیت‌های جذاب بیشتری هم دارد، اما آن‌ها را در پیوست B بررسی می‌کنیم.
