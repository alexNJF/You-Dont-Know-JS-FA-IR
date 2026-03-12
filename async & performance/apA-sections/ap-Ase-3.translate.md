# Sequenceهای مقدار و خطا

اگر هر step از sequence فقط یک مقدار عادی باشد، همان مقدار به‌عنوان پیام completion آن step map می‌شود:

```js
var sq = ASQ( 42 );

sq.val( function(msg){
	console.log( msg );		// 42
} );
```

اگر بخواهید sequenceای بسازید که خودکار در حالت خطا باشد:

```js
var sq = ASQ.failed( "Oops" );

ASQ()
.seq( sq )
.val( function(msg){
	// won't get here
} )
.or( function(err){
	console.log( err );		// Oops
} );
```

گاهی هم می‌خواهید sequence با «مقدار تاخیری» یا «خطای تاخیری» خودکار بسازید. با پلاگین‌های contrib به نام `after` و `failAfter` این کار ساده است:

```js
var sq1 = ASQ.after( 100, "Hello", "World" );
var sq2 = ASQ.failAfter( 100, "Oops" );

sq1.val( function(msg1,msg2){
	console.log( msg1, msg2 );		// Hello World
} );

sq2.or( function(err){
	console.log( err );				// Oops
} );
```

همچنین می‌توانید وسط sequence یک delay بگذارید با `after(..)`:

```js
ASQ( 42 )
// insert a delay into the sequence
.after( 100 )
.val( function(msg){
	console.log( msg );		// 42
} );
```
