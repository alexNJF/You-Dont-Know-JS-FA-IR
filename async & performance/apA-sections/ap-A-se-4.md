# Promises and Callbacks

I think *asynquence* sequences provide a lot of value on top of native Promises, and for the most part you'll find it more pleasant and more powerful to work at that level of abstraction. However, integrating *asynquence* with other non-*asynquence* code will be a reality.

You can easily subsume a promise (e.g., thenable -- see Chapter 3) into a sequence using the `promise(..)` instance method:

```js
var p = Promise.resolve( 42 );

ASQ()
.promise( p )			// could also: `function(){ return p; }`
.val( function(msg){
	console.log( msg );	// 42
} );
```

And to go the opposite direction and fork/vend a promise from a sequence at a certain step, use the `toPromise` contrib plug-in:

```js
var sq = ASQ.after( 100, "Hello World" );

sq.toPromise()
// this is a standard promise chain now
.then( function(msg){
	return msg.toUpperCase();
} )
.then( function(msg){
	console.log( msg );		// HELLO WORLD
} );
```

To adapt *asynquence* to systems using callbacks, there are several helper facilities. To automatically generate an "error-first style" callback from your sequence to wire into a callback-oriented utility, use `errfcb`:

```js
var sq = ASQ( function(done){
	// note: expecting "error-first style" callback
	someAsyncFuncWithCB( 1, 2, done.errfcb )
} )
.val( function(msg){
	// ..
} )
.or( function(err){
	// ..
} );

// note: expecting "error-first style" callback
anotherAsyncFuncWithCB( 1, 2, sq.errfcb() );
```

You also may want to create a sequence-wrapped version of a utility -- compare to "promisory" in Chapter 3 and "thunkory" in Chapter 4 -- and *asynquence* provides `ASQ.wrap(..)` for that purpose:

```js
var coolUtility = ASQ.wrap( someAsyncFuncWithCB );

coolUtility( 1, 2 )
.val( function(msg){
	// ..
} )
.or( function(err){
	// ..
} );
```

**Note:** For the sake of clarity (and for fun!), let's coin yet another term, for a sequence-producing function that comes from `ASQ.wrap(..)`, like `coolUtility` here. I propose "sequory" ("sequence" + "factory").
