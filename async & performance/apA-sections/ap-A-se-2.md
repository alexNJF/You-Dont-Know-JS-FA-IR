# *asynquence* API

To start off, the way you create a sequence (an *asynquence* instance) is with the `ASQ(..)` function. An `ASQ()` call with no parameters creates an empty initial sequence, whereas passing one or more values or functions to `ASQ(..)` sets up the sequence with each argument representing the initial steps of the sequence.

**Note:** For the purposes of all code examples here, I will use the *asynquence* top-level identifier in global browser usage: `ASQ`. If you include and use *asynquence* through a module system (browser or server), you of course can define whichever symbol you prefer, and *asynquence* won't care!

Many of the API methods discussed here are built into the core of *asynquence*, but others are provided through including the optional "contrib" plug-ins package. See the documentation for *asynquence* for whether a method is built in or defined via plug-in: http://github.com/getify/asynquence

### Steps

If a function represents a normal step in the sequence, that function is invoked with the first parameter being the continuation callback, and any subsequent parameters being any messages passed on from the previous step. The step will not complete until the continuation callback is called. Once it's called, any arguments you pass to it will be sent along as messages to the next step in the sequence.

To add an additional normal step to the sequence, call `then(..)` (which has essentially the exact same semantics as the `ASQ(..)` call):

```js
ASQ(
	// step 1
	function(done){
		setTimeout( function(){
			done( "Hello" );
		}, 100 );
	},
	// step 2
	function(done,greeting) {
		setTimeout( function(){
			done( greeting + " World" );
		}, 100 );
	}
)
// step 3
.then( function(done,msg){
	setTimeout( function(){
		done( msg.toUpperCase() );
	}, 100 );
} )
// step 4
.then( function(done,msg){
	console.log( msg );			// HELLO WORLD
} );
```

**Note:** Though the name `then(..)` is identical to the native Promises API, this `then(..)` is different. You can pass as few or as many functions or values to `then(..)` as you'd like, and each is taken as a separate step. There's no two-callback fulfilled/rejected semantics involved.

Unlike with Promises, where to chain one Promise to the next you have to create and `return` that Promise from a `then(..)` fulfillment handler, with *asynquence*, all you need to do is call the continuation callback -- I always call it `done()` but you can name it whatever suits you -- and optionally pass it completion messages as arguments.

Each step defined by `then(..)` is assumed to be asynchronous. If you have a step that's synchronous, you can either just call `done(..)` right away, or you can use the simpler `val(..)` step helper:

```js
// step 1 (sync)
ASQ( function(done){
	done( "Hello" );	// manually synchronous
} )
// step 2 (sync)
.val( function(greeting){
	return greeting + " World";
} )
// step 3 (async)
.then( function(done,msg){
	setTimeout( function(){
		done( msg.toUpperCase() );
	}, 100 );
} )
// step 4 (sync)
.val( function(msg){
	console.log( msg );
} );
```

As you can see, `val(..)`-invoked steps don't receive a continuation callback, as that part is assumed for you -- and the parameter list is less cluttered as a result! To send a message along to the next step, you simply use `return`.

Think of `val(..)` as representing a synchronous "value-only" step, which is useful for synchronous value operations, logging, and the like.

### Errors

One important difference with *asynquence* compared to Promises is with error handling.

With Promises, each individual Promise (step) in a chain can have its own independent error, and each subsequent step has the ability to handle the error or not. The main reason for this semantic comes (again) from the focus on individual Promises rather than on the chain (sequence) as a whole.

I believe that most of the time, an error in one part of a sequence is generally not recoverable, so the subsequent steps in the sequence are moot and should be skipped. So, by default, an error at any step of a sequence throws the entire sequence into error mode, and the rest of the normal steps are ignored.

If you *do* need to have a step where its error is recoverable, there are several different API methods that can accommodate, such as `try(..)` -- previously mentioned as a kind of `try..catch` step -- or `until(..)` -- a retry loop that keeps attempting the step until it succeeds or you manually `break()` the loop. *asynquence* even has `pThen(..)` and `pCatch(..)` methods, which work identically to how normal Promise `then(..)` and `catch(..)` work (see Chapter 3), so you can do localized mid-sequence error handling if you so choose.

The point is, you have both options, but the more common one in my experience is the default. With Promises, to get a chain of steps to ignore all steps once an error occurs, you have to take care not to register a rejection handler at any step; otherwise, that error gets swallowed as handled, and the sequence may continue (perhaps unexpectedly). This kind of desired behavior is a bit awkward to properly and reliably handle.

To register a sequence error notification handler, *asynquence* provides an `or(..)` sequence method, which also has an alias of `onerror(..)`. You can call this method anywhere in the sequence, and you can register as many handlers as you'd like. That makes it easy for multiple different consumers to listen in on a sequence to know if it failed or not; it's kind of like an error event handler in that respect.

Just like with Promises, all JS exceptions become sequence errors, or you can programmatically signal a sequence error:

```js
var sq = ASQ( function(done){
	setTimeout( function(){
		// signal an error for the sequence
		done.fail( "Oops" );
	}, 100 );
} )
.then( function(done){
	// will never get here
} )
.or( function(err){
	console.log( err );			// Oops
} )
.then( function(done){
	// won't get here either
} );

// later

sq.or( function(err){
	console.log( err );			// Oops
} );
```

Another really important difference with error handling in *asynquence* compared to native Promises is the default behavior of "unhandled exceptions". As we discussed at length in Chapter 3, a rejected Promise without a registered rejection handler will just silently hold (aka swallow) the error; you have to remember to always end a chain with a final `catch(..)`.

In *asynquence*, the assumption is reversed.

If an error occurs on a sequence, and it **at that moment** has no error handlers registered, the error is reported to the `console`. In other words, unhandled rejections are by default always reported so as not to be swallowed and missed.

As soon as you register an error handler against a sequence, it opts that sequence out of such reporting, to prevent duplicate noise.

There may, in fact, be cases where you want to create a sequence that may go into the error state before you have a chance to register the handler. This isn't common, but it can happen from time to time.

In those cases, you can also **opt a sequence instance out** of error reporting by calling `defer()` on the sequence. You should only opt out of error reporting if you are sure that you're going to eventually handle such errors:

```js
var sq1 = ASQ( function(done){
	doesnt.Exist();			// will throw exception to console
} );

var sq2 = ASQ( function(done){
	doesnt.Exist();			// will throw only a sequence error
} )
// opt-out of error reporting
.defer();

setTimeout( function(){
	sq1.or( function(err){
		console.log( err );	// ReferenceError
	} );

	sq2.or( function(err){
		console.log( err );	// ReferenceError
	} );
}, 100 );

// ReferenceError (from sq1)
```

This is better error handling behavior than Promises themselves have, because it's the Pit of Success, not the Pit of Failure (see Chapter 3).

**Note:** If a sequence is piped into (aka subsumed by) another sequence -- see "Combining Sequences"  for a complete description -- then the source sequence is opted out of error reporting, but now the target sequence's error reporting or lack thereof must be considered.

### Parallel Steps

Not all steps in your sequences will have just a single (async) task to perform; some will need to perform multiple steps "in parallel" (concurrently). A step in a sequence in which multiple substeps are processing concurrently is called a `gate(..)` -- there's an `all(..)` alias if you prefer -- and is directly symmetric to native `Promise.all([..])`.

If all the steps in the `gate(..)` complete successfully, all success messages will be passed to the next sequence step. If any of them generate errors, the whole sequence immediately goes into an error state.

Consider:

```js
ASQ( function(done){
	setTimeout( done, 100 );
} )
.gate(
	function(done){
		setTimeout( function(){
			done( "Hello" );
		}, 100 );
	},
	function(done){
		setTimeout( function(){
			done( "World", "!" );
		}, 100 );
	}
)
.val( function(msg1,msg2){
	console.log( msg1 );	// Hello
	console.log( msg2 );	// [ "World", "!" ]
} );
```

For illustration, let's compare that example to native Promises:

```js
new Promise( function(resolve,reject){
	setTimeout( resolve, 100 );
} )
.then( function(){
	return Promise.all( [
		new Promise( function(resolve,reject){
			setTimeout( function(){
				resolve( "Hello" );
			}, 100 );
		} ),
		new Promise( function(resolve,reject){
			setTimeout( function(){
				// note: we need a [ ] array here
				resolve( [ "World", "!" ] );
			}, 100 );
		} )
	] );
} )
.then( function(msgs){
	console.log( msgs[0] );	// Hello
	console.log( msgs[1] );	// [ "World", "!" ]
} );
```

Yuck. Promises require a lot more boilerplate overhead to express the same asynchronous flow control. That's a great illustration of why the *asynquence* API and abstraction make dealing with Promise steps a lot nicer. The improvement only goes higher the more complex your asynchrony is.

#### Step Variations

There are several variations in the contrib plug-ins on *asynquence*'s `gate(..)` step type that can be quite helpful:

* `any(..)` is like `gate(..)`, except just one segment has to eventually succeed to proceed on the main sequence.
* `first(..)` is like `any(..)`, except as soon as any segment succeeds, the main sequence proceeds (ignoring subsequent results from other segments).
* `race(..)` (symmetric with `Promise.race([..])`) is like `first(..)`, except the main sequence proceeds as soon as any segment completes (either success or failure).
* `last(..)` is like `any(..)`, except only the latest segment to complete successfully sends its message(s) along to the main sequence.
* `none(..)` is the inverse of `gate(..)`: the main sequence proceeds only if all the segments fail (with all segment error message(s) transposed as success message(s) and vice versa).

Let's first define some helpers to make illustration cleaner:

```js
function success1(done) {
	setTimeout( function(){
		done( 1 );
	}, 100 );
}

function success2(done) {
	setTimeout( function(){
		done( 2 );
	}, 100 );
}

function failure3(done) {
	setTimeout( function(){
		done.fail( 3 );
	}, 100 );
}

function output(msg) {
	console.log( msg );
}
```

Now, let's demonstrate these `gate(..)` step variations:

```js
ASQ().race(
	failure3,
	success1
)
.or( output );		// 3


ASQ().any(
	success1,
	failure3,
	success2
)
.val( function(){
	var args = [].slice.call( arguments );
	console.log(
		args		// [ 1, undefined, 2 ]
	);
} );


ASQ().first(
	failure3,
	success1,
	success2
)
.val( output );		// 1


ASQ().last(
	failure3,
	success1,
	success2
)
.val( output );		// 2

ASQ().none(
	failure3
)
.val( output )		// 3
.none(
	failure3
	success1
)
.or( output );		// 1
```

Another step variation is `map(..)`, which lets you asynchronously map elements of an array to different values, and the step doesn't proceed until all the mappings are complete. `map(..)` is very similar to `gate(..)`, except it gets the initial values from an array instead of from separately specified functions, and also because you define a single function callback to operate on each value:

```js
function double(x,done) {
	setTimeout( function(){
		done( x * 2 );
	}, 100 );
}

ASQ().map( [1,2,3], double )
.val( output );					// [2,4,6]
```

Also, `map(..)` can receive either of its parameters (the array or the callback) from messages passed from the previous step:

```js
function plusOne(x,done) {
	setTimeout( function(){
		done( x + 1 );
	}, 100 );
}

ASQ( [1,2,3] )
.map( double )			// message `[1,2,3]` comes in
.map( plusOne )			// message `[2,4,6]` comes in
.val( output );			// [3,5,7]
```

Another variation is `waterfall(..)`, which is kind of like a mixture between `gate(..)`'s message collection behavior but `then(..)`'s sequential processing.

Step 1 is first executed, then the success message from step 1 is given to step 2, and then both success messages go to step 3, and then all three success messages go to step 4, and so on, such that the messages sort of collect and cascade down the "waterfall".

Consider:

```js
function double(done) {
	var args = [].slice.call( arguments, 1 );
	console.log( args );

	setTimeout( function(){
		done( args[args.length - 1] * 2 );
	}, 100 );
}

ASQ( 3 )
.waterfall(
	double,					// [ 3 ]
	double,					// [ 6 ]
	double,					// [ 6, 12 ]
	double					// [ 6, 12, 24 ]
)
.val( function(){
	var args = [].slice.call( arguments );
	console.log( args );	// [ 6, 12, 24, 48 ]
} );
```

If at any point in the "waterfall" an error occurs, the whole sequence immediately goes into an error state.

#### Error Tolerance

Sometimes you want to manage errors at the step level and not let them necessarily send the whole sequence into the error state. *asynquence* offers two step variations for that purpose.

`try(..)` attempts a step, and if it succeeds, the sequence proceeds as normal, but if the step fails, the failure is turned into a success message formated as `{ catch: .. }` with the error message(s) filled in:

```js
ASQ()
.try( success1 )
.val( output )			// 1
.try( failure3 )
.val( output )			// { catch: 3 }
.or( function(err){
	// never gets here
} );
```

You could instead set up a retry loop using `until(..)`, which tries the step and if it fails, retries the step again on the next event loop tick, and so on.

This retry loop can continue indefinitely, but if you want to break out of the loop, you can call the `break()` flag on the completion trigger, which sends the main sequence into an error state:

```js
var count = 0;

ASQ( 3 )
.until( double )
.val( output )					// 6
.until( function(done){
	count++;

	setTimeout( function(){
		if (count < 5) {
			done.fail();
		}
		else {
			// break out of the `until(..)` retry loop
			done.break( "Oops" );
		}
	}, 100 );
} )
.or( output );					// Oops
```

#### Promise-Style Steps

If you would prefer to have, inline in your sequence, Promise-style semantics like Promises' `then(..)` and `catch(..)` (see Chapter 3), you can use the `pThen` and `pCatch` plug-ins:

```js
ASQ( 21 )
.pThen( function(msg){
	return msg * 2;
} )
.pThen( output )				// 42
.pThen( function(){
	// throw an exception
	doesnt.Exist();
} )
.pCatch( function(err){
	// caught the exception (rejection)
	console.log( err );			// ReferenceError
} )
.val( function(){
	// main sequence is back in a
	// success state because previous
	// exception was caught by
	// `pCatch(..)`
} );
```

`pThen(..)` and `pCatch(..)` are designed to run in the sequence, but behave as if it was a normal Promise chain. As such, you can either resolve genuine Promises or *asynquence* sequences from the "fulfillment" handler passed to `pThen(..)` (see Chapter 3).

### Forking Sequences

One feature that can be quite useful about Promises is that you can attach multiple `then(..)` handler registrations to the same promise, effectively "forking" the flow-control at that promise:

```js
var p = Promise.resolve( 21 );

// fork 1 (from `p`)
p.then( function(msg){
	return msg * 2;
} )
.then( function(msg){
	console.log( msg );		// 42
} )

// fork 2 (from `p`)
p.then( function(msg){
	console.log( msg );		// 21
} );
```

The same "forking" is easy in *asynquence* with `fork()`:

```js
var sq = ASQ(..).then(..).then(..);

var sq2 = sq.fork();

// fork 1
sq.then(..)..;

// fork 2
sq2.then(..)..;
```

### Combining Sequences

The reverse of `fork()`ing, you can combine two sequences by subsuming one into another, using the `seq(..)` instance method:

```js
var sq = ASQ( function(done){
	setTimeout( function(){
		done( "Hello World" );
	}, 200 );
} );

ASQ( function(done){
	setTimeout( done, 100 );
} )
// subsume `sq` sequence into this sequence
.seq( sq )
.val( function(msg){
	console.log( msg );		// Hello World
} )
```

`seq(..)` can either accept a sequence itself, as shown here, or a function. If a function, it's expected that the function when called will return a sequence, so the preceding code could have been done with:

```js
// ..
.seq( function(){
	return sq;
} )
// ..
```

Also, that step could instead have been accomplished with a `pipe(..)`:

```js
// ..
.then( function(done){
	// pipe `sq` into the `done` continuation callback
	sq.pipe( done );
} )
// ..
```

When a sequence is subsumed, both its success message stream and its error stream are piped in.

**Note:** As mentioned in an earlier note, piping (manually with `pipe(..)` or automatically with `seq(..)`) opts the source sequence out of error-reporting, but doesn't affect the error reporting status of the target sequence.
