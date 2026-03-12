# Communicating Sequential Processes (CSP)

"Communicating Sequential Processes" (CSP) was first described by C. A. R. Hoare in a 1978 academic paper (http://dl.acm.org/citation.cfm?doid=359576.359585), and later in a 1985 book (http://www.usingcsp.com/) of the same name. CSP describes a formal method for concurrent "processes" to interact (aka "communicate") during processing.

You may recall that we examined concurrent "processes" back in Chapter 1, so our exploration of CSP here will build upon that understanding.

Like most great concepts in computer science, CSP is heavily steeped in academic formalism, expressed as a process algebra. However, I suspect symbolic algebra theorems won't make much practical difference to the reader, so we will want to find some other way of wrapping our brains around CSP.

I will leave much of the formal description and proof of CSP to Hoare's writing, and to many other fantastic writings since. Instead, we will try to just briefly explain the idea of CSP in as un-academic and hopefully intuitively understandable a way as possible.

### Message Passing

The core principle in CSP is that all communication/interaction between otherwise independent processes must be through formal message passing. Perhaps counter to your expectations, CSP message passing is described as a synchronous action, where the sender process and the receiver process have to mutually be ready for the message to be passed.

How could such synchronous messaging possibly be related to asynchronous programming in JavaScript?

The concreteness of relationship comes from the nature of how ES6 generators are used to produce synchronous-looking actions that under the covers can indeed either be synchronous or (more likely) asynchronous.

In other words, two or more concurrently running generators can appear to synchronously message each other while preserving the fundamental asynchrony of the system because each generator's code is paused (aka "blocked") waiting on resumption of an asynchronous action.

How does this work?

Imagine a generator (aka "process") called "A" that wants to send a message to generator "B." First, "A" `yield`s the message (thus pausing "A") to be sent to "B." When "B" is ready and takes the message, "A" is then resumed (unblocked).

Symmetrically, imagine a generator "A" that wants a message **from** "B." "A" `yield`s its request (thus pausing "A") for the message from "B," and once "B" sends a message, "A" takes the message and is resumed.

One of the more popular expressions of this CSP message passing theory comes from ClojureScript's core.async library, and also from the *go* language. These takes on CSP embody the described communication semantics in a conduit that is opened between processes called a "channel."

**Note:** The term *channel* is used in part because there are modes in which more than one value can be sent at once into the "buffer" of the channel; this is similar to what you may think of as a stream. We won't go into depth about it here, but it can be a very powerful technique for managing streams of data.

In the simplest notion of CSP, a channel that we create between "A" and "B" would have a method called `take(..)` for blocking to receive a value, and a method called `put(..)` for blocking to send a value.

This might look like:

```js
var ch = channel();

function *foo() {
	var msg = yield take( ch );

	console.log( msg );
}

function *bar() {
	yield put( ch, "Hello World" );

	console.log( "message sent" );
}

run( foo );
run( bar );
// Hello World
// "message sent"
```

Compare this structured, synchronous(-looking) message passing interaction to the informal and unstructured message sharing that `ASQ#runner(..)` provides through the `token.messages` array and cooperative `yield`ing. In essence, `yield put(..)` is a single operation that both sends the value and pauses execution to transfer control, whereas in earlier examples we did those as separate steps.

Moreover, CSP stresses that you don't really explicitly "transfer control," but rather you design your concurrent routines to block expecting either a value received from the channel, or to block expecting to try to send a message on the channel. The blocking around receiving or sending messages is how you coordinate sequencing of behavior between the coroutines.

**Note:** Fair warning: this pattern is very powerful but it's also a little mind twisting to get used to at first. You will want to practice this a bit to get used to this new way of thinking about coordinating your concurrency.

There are several great libraries that have implemented this flavor of CSP in JavaScript, most notably "js-csp" (https://github.com/ubolonton/js-csp), which James Long (http://twitter.com/jlongster) forked (https://github.com/jlongster/js-csp) and has written extensively about (http://jlongster.com/Taming-the-Asynchronous-Beast-with-CSP-in-JavaScript). Also, it cannot be stressed enough how amazing the many writings of David Nolen (http://twitter.com/swannodette) are on the topic of adapting ClojureScript's go-style core.async CSP into JS generators (http://swannodette.github.io/2013/08/24/es6-generators-and-csp).

### asynquence CSP emulation

Because we've been discussing async patterns here in the context of my *asynquence* library, you might be interested to see that we can fairly easily add an emulation layer on top of `ASQ#runner(..)` generator handling as a nearly perfect porting of the CSP API and behavior. This emulation layer ships as an optional part of the "asynquence-contrib" package alongside *asynquence*.

Very similar to the `state(..)` helper from earlier, `ASQ.csp.go(..)` takes a generator -- in go/core.async terms, it's known as a goroutine -- and adapts it to use with `ASQ#runner(..)` by returning a new generator.

Instead of being passed a `token`, your goroutine receives an initially created channel (`ch` below) that all goroutines in this run will share. You can create more channels (which is often quite helpful!) with `ASQ.csp.chan(..)`.

In CSP, we model all asynchrony in terms of blocking on channel messages, rather than blocking waiting for a Promise/sequence/thunk to complete.

So, instead of `yield`ing the Promise returned from `request(..)`, `request(..)` should return a channel that you `take(..)` a value from. In other words, a single-value channel is roughly equivalent in this context/usage to a Promise/sequence.

Let's first make a channel-aware version of `request(..)`:

```js
function request(url) {
	var ch = ASQ.csp.channel();
	ajax( url ).then( function(content){
		// `putAsync(..)` is a version of `put(..)` that
		// can be used outside of a generator. It returns
		// a promise for the operation's completion. We
		// don't use that promise here, but we could if
		// we needed to be notified when the value had
		// been `take(..)`n.
		ASQ.csp.putAsync( ch, content );
	} );
	return ch;
}
```

From Chapter 3, "promisory" is a Promise-producing utility, "thunkory" from Chapter 4 is a thunk-producing utility, and finally, in Appendix A we invented "sequory" for a sequence-producing utility.

Naturally, we need to coin a symmetric term here for a channel-producing utility. So let's unsurprisingly call it a "chanory" ("channel" + "factory"). As an exercise for the reader, try your hand at defining a `channelify(..)` utility similar to `Promise.wrap(..)`/`promisify(..)` (Chapter 3), `thunkify(..)` (Chapter 4), and `ASQ.wrap(..)` (Appendix A).

Now consider the concurrent Ajax example using *asyquence*-flavored CSP:

```js
ASQ()
.runner(
	ASQ.csp.go( function*(ch){
		yield ASQ.csp.put( ch, "http://some.url.2" );

		var url1 = yield ASQ.csp.take( ch );
		// "http://some.url.1"

		var res1 = yield ASQ.csp.take( request( url1 ) );

		yield ASQ.csp.put( ch, res1 );
	} ),
	ASQ.csp.go( function*(ch){
		var url2 = yield ASQ.csp.take( ch );
		// "http://some.url.2"

		yield ASQ.csp.put( ch, "http://some.url.1" );

		var res2 = yield ASQ.csp.take( request( url2 ) );
		var res1 = yield ASQ.csp.take( ch );

		// pass along results to next sequence step
		ch.buffer_size = 2;
		ASQ.csp.put( ch, res1 );
		ASQ.csp.put( ch, res2 );
	} )
)
.val( function(res1,res2){
	// `res1` comes from "http://some.url.1"
	// `res2` comes from "http://some.url.2"
} );
```

The message passing that trades the URL strings between the two goroutines is pretty straightforward. The first goroutine makes an Ajax request to the first URL, and that response is put onto the `ch` channel. The second goroutine makes an Ajax request to the second URL, then gets the first response `res1` off the `ch` channel. At that point, both responses `res1` and `res2` are completed and ready.

If there are any remaining values in the `ch` channel at the end of the goroutine run, they will be passed along to the next step in the sequence. So, to pass out message(s) from the final goroutine, `put(..)` them into `ch`. As shown, to avoid the blocking of those final `put(..)`s, we switch `ch` into buffering mode by setting its `buffer_size` to `2` (default: `0`).

**Note:** See many more examples of using *asynquence*-flavored CSP here (https://gist.github.com/getify/e0d04f1f5aa24b1947ae).
