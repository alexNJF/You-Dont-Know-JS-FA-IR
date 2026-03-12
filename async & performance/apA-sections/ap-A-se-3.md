# Value and Error Sequences

If any step of a sequence is just a normal value, that value is just mapped to that step's completion message:

```js
var sq = ASQ( 42 );

sq.val( function(msg){
	console.log( msg );		// 42
} );
```

If you want to make a sequence that's automatically errored:

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

You also may want to automatically create a delayed-value or a delayed-error sequence. Using the `after` and `failAfter` contrib plug-ins, this is easy:

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

You can also insert a delay in the middle of a sequence using `after(..)`:

```js
ASQ( 42 )
// insert a delay into the sequence
.after( 100 )
.val( function(msg){
	console.log( msg );		// 42
} );
```
