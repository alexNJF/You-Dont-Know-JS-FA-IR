# Generator Coroutine

Hopefully Chapter 4 helped you get pretty familiar with ES6 generators. In particular, we want to revisit the "Generator Concurrency" discussion, and push it even further.

We imagined a `runAll(..)` utility that could take two or more generators and run them concurrently, letting them cooperatively `yield` control from one to the next, with optional message passing.

In addition to being able to run a single generator to completion, the `ASQ#runner(..)` we discussed in Appendix A is a similar implementation of the concepts of `runAll(..)`, which can run multiple generators concurrently to completion.

So let's see how we can implement the concurrent Ajax scenario from Chapter 4:

```js
ASQ(
	"http://some.url.2"
)
.runner(
	function*(token){
		// transfer control
		yield token;

		var url1 = token.messages[0]; // "http://some.url.1"

		// clear out messages to start fresh
		token.messages = [];

		var p1 = request( url1 );

		// transfer control
		yield token;

		token.messages.push( yield p1 );
	},
	function*(token){
		var url2 = token.messages[0]; // "http://some.url.2"

		// message pass and transfer control
		token.messages[0] = "http://some.url.1";
		yield token;

		var p2 = request( url2 );

		// transfer control
		yield token;

		token.messages.push( yield p2 );

		// pass along results to next sequence step
		return token.messages;
	}
)
.val( function(res){
	// `res[0]` comes from "http://some.url.1"
	// `res[1]` comes from "http://some.url.2"
} );
```

The main differences between `ASQ#runner(..)` and `runAll(..)` are as follows:

* Each generator (coroutine) is provided an argument we call `token`, which is the special value to `yield` when you want to explicitly transfer control to the next coroutine.
* `token.messages` is an array that holds any messages passed in from the previous sequence step. It's also a data structure that you can use to share messages between coroutines.
* `yield`ing a Promise (or sequence) value does not transfer control, but instead pauses the coroutine processing until that value is ready.
* The last `return`ed or `yield`ed value from the coroutine processing run will be forward passed to the next step in the sequence.

It's also easy to layer helpers on top of the base `ASQ#runner(..)` functionality to suit different uses.

### State Machines

One example that may be familiar to many programmers is state machines. You can, with the help of a simple cosmetic utility, create an easy-to-express state machine processor.

Let's imagine such a utility. We'll call it `state(..)`, and will pass it two arguments: a state value and a generator that handles that state. `state(..)` will do the dirty work of creating and returning an adapter generator to pass to `ASQ#runner(..)`.

Consider:

```js
function state(val,handler) {
	// make a coroutine handler for this state
	return function*(token) {
		// state transition handler
		function transition(to) {
			token.messages[0] = to;
		}

		// set initial state (if none set yet)
		if (token.messages.length < 1) {
			token.messages[0] = val;
		}

		// keep going until final state (false) is reached
		while (token.messages[0] !== false) {
			// current state matches this handler?
			if (token.messages[0] === val) {
				// delegate to state handler
				yield *handler( transition );
			}

			// transfer control to another state handler?
			if (token.messages[0] !== false) {
				yield token;
			}
		}
	};
}
```

If you look closely, you'll see that `state(..)` returns back a generator that accepts a `token`, and then it sets up a `while` loop that will run until the state machine reaches its final state (which we arbitrarily pick as the `false` value); that's exactly the kind of generator we want to pass to `ASQ#runner(..)`!

We also arbitrarily reserve the `token.messages[0]` slot as the place where the current state of our state machine will be tracked, which means we can even seed the initial state as the value passed in from the previous step in the sequence.

How do we use the `state(..)` helper along with `ASQ#runner(..)`?

```js
var prevState;

ASQ(
	/* optional: initial state value */
	2
)
// run our state machine
// transitions: 2 -> 3 -> 1 -> 3 -> false
.runner(
	// state `1` handler
	state( 1, function *stateOne(transition){
		console.log( "in state 1" );

		prevState = 1;
		yield transition( 3 );	// goto state `3`
	} ),

	// state `2` handler
	state( 2, function *stateTwo(transition){
		console.log( "in state 2" );

		prevState = 2;
		yield transition( 3 );	// goto state `3`
	} ),

	// state `3` handler
	state( 3, function *stateThree(transition){
		console.log( "in state 3" );

		if (prevState === 2) {
			prevState = 3;
			yield transition( 1 ); // goto state `1`
		}
		// all done!
		else {
			yield "That's all folks!";

			prevState = 3;
			yield transition( false ); // terminal state
		}
	} )
)
// state machine complete, so move on
.val( function(msg){
	console.log( msg );	// That's all folks!
} );
```

It's important to note that the `*stateOne(..)`, `*stateTwo(..)`, and `*stateThree(..)` generators themselves are reinvoked each time that state is entered, and they finish when you `transition(..)` to another value. While not shown here, of course these state generator handlers can be asynchronously paused by `yield`ing Promises/sequences/thunks.

The underneath hidden generators produced by the `state(..)` helper and actually passed to `ASQ#runner(..)` are the ones that continue to run concurrently for the length of the state machine, and each of them handles cooperatively `yield`ing control to the next, and so on.

**Note:** See this "ping pong" example (http://jsbin.com/qutabu/1/edit?js,output) for more illustration of using cooperative concurrency with generators driven by `ASQ#runner(..)`.
