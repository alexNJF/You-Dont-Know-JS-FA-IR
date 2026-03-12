# Running Generators

In Chapter 4, we derived a utility called `run(..)` which can run generators to completion, listening for `yield`ed Promises and using them to async resume the generator. *asynquence* has just such a utility built in, called `runner(..)`.

Let's first set up some helpers for illustration:

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

Now, we can use `runner(..)` as a step in the middle of a sequence:

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

### Wrapped Generators

You can also create a self-packaged generator -- that is, a normal function that runs your specified generator and returns a sequence for its completion -- by `ASQ.wrap(..)`ing it:

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

There's a lot more awesome that `runner(..)` is capable of, but we'll come back to that in Appendix B.
