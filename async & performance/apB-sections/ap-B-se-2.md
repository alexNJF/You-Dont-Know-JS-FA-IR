# Event Reactive

It should be obvious from (at least!) Chapter 3 that Promises are a very powerful tool in your async toolbox. But one thing that's clearly lacking is in their capability to handle streams of events, as a Promise can only be resolved once. And frankly, this exact same weakness is true of plain *asynquence* sequences, as well.

Consider a scenario where you want to fire off a series of steps every time a certain event is fired. A single Promise or sequence cannot represent all occurrences of that event. So, you have to create a whole new Promise chain (or sequence) for *each* event occurrence, such as:

```js
listener.on( "foobar", function(data){

	// create a new event handling promise chain
	new Promise( function(resolve,reject){
		// ..
	} )
	.then( .. )
	.then( .. );

} );
```

The base functionality we need is present in this approach, but it's far from a desirable way to express our intended logic. There are two separate capabilities conflated in this paradigm: the event listening, and responding to the event; separation of concerns would implore us to separate out these capabilities.

The carefully observant reader will see this problem as somewhat symmetrical to the problems we detailed with callbacks in Chapter 2; it's kind of an inversion of control problem.

Imagine uninverting this paradigm, like so:

```js
var observable = listener.on( "foobar" );

// later
observable
.then( .. )
.then( .. );

// elsewhere
observable
.then( .. )
.then( .. );
```

The `observable` value is not exactly a Promise, but you can *observe* it much like you can observe a Promise, so it's closely related. In fact, it can be observed many times, and it will send out notifications every time its event (`"foobar"`) occurs.

**Tip:** This pattern I've just illustrated is a **massive simplification** of the concepts and motivations behind reactive programming (aka RP), which has been implemented/expounded upon by several great projects and languages. A variation on RP is functional reactive programming (FRP), which refers to applying functional programming techniques (immutability, referential integrity, etc.) to streams of data. "Reactive" refers to spreading this functionality out over time in response to events. The interested reader should consider studying "Reactive Observables" in the fantastic "Reactive Extensions" library ("RxJS" for JavaScript) by Microsoft (http://rxjs.codeplex.com/); it's much more sophisticated and powerful than I've just shown. Also, Andre Staltz has an excellent write-up (https://gist.github.com/staltz/868e7e9bc2a7b8c1f754) that pragmatically lays out RP in concrete examples.

### ES7 Observables

At the time of this writing, there's an early ES7 proposal for a new data type called "Observable" (https://github.com/jhusain/asyncgenerator#introducing-observable), which in spirit is similar to what we've laid out here, but is definitely more sophisticated.

The notion of this kind of Observable is that the way you "subscribe" to the events from a stream is to pass in a generator -- actually the *iterator* is the interested party -- whose `next(..)` method will be called for each event.

You could imagine it sort of like this:

```js
// `someEventStream` is a stream of events, like from
// mouse clicks, and the like.

var observer = new Observer( someEventStream, function*(){
	while (var evt = yield) {
		console.log( evt );
	}
} );
```

The generator you pass in will `yield` pause the `while` loop waiting for the next event. The *iterator* attached to the generator instance will have its `next(..)` called each time `someEventStream` has a new event published, and so that event data will resume your generator/*iterator* with the `evt` data.

In the subscription to events functionality here, it's the *iterator* part that matters, not the generator. So conceptually you could pass in practically any iterable, including `ASQ.iterable()` iterable sequences.

Interestingly, there are also proposed adapters to make it easy to construct Observables from certain types of streams, such as `fromEvent(..)` for DOM events. If you look at a suggested implementation of `fromEvent(..)` in the earlier linked ES7 proposal, it looks an awful lot like the `ASQ.react(..)` we'll see in the next section.

Of course, these are all early proposals, so what shakes out may very well look/behave differently than shown here. But it's exciting to see the early alignments of concepts across different libraries and language proposals!

### Reactive Sequences

With that crazy brief summary of Observables (and F/RP) as our inspiration and motivation, I will now illustrate an adaptation of a small subset of "Reactive Observables," which I call "Reactive Sequences."

First, let's start with how to create an Observable, using an *asynquence* plug-in utility called `react(..)`:

```js
var observable = ASQ.react( function setup(next){
	listener.on( "foobar", next );
} );
```

Now, let's see how to define a sequence that "reacts" -- in F/RP, this is typically called "subscribing" -- to that `observable`:

```js
observable
.seq( .. )
.then( .. )
.val( .. );
```

So, you just define the sequence by chaining off the Observable. That's easy, huh?

In F/RP, the stream of events typically channels through a set of functional transforms, like `scan(..)`, `map(..)`, `reduce(..)`, and so on. With reactive sequences, each event channels through a new instance of the sequence. Let's look at a more concrete example:

```js
ASQ.react( function setup(next){
	document.getElementById( "mybtn" )
	.addEventListener( "click", next, false );
} )
.seq( function(evt){
	var btnID = evt.target.id;
	return request(
		"http://some.url.1/?id=" + btnID
	);
} )
.val( function(text){
	console.log( text );
} );
```

The "reactive" portion of the reactive sequence comes from assigning one or more event handlers to invoke the event trigger (calling `next(..)`).

The "sequence" portion of the reactive sequence is exactly like the sequences we've already explored: each step can be whatever asynchronous technique makes sense, from continuation callback to Promise to generator.

Once you set up a reactive sequence, it will continue to initiate instances of the sequence as long as the events keep firing. If you want to stop a reactive sequence, you can call `stop()`.

If a reactive sequence is `stop()`'d, you likely want the event handler(s) to be unregistered as well; you can register a teardown handler for this purpose:

```js
var sq = ASQ.react( function setup(next,registerTeardown){
	var btn = document.getElementById( "mybtn" );

	btn.addEventListener( "click", next, false );

	// will be called once `sq.stop()` is called
	registerTeardown( function(){
		btn.removeEventListener( "click", next, false );
	} );
} )
.seq( .. )
.then( .. )
.val( .. );

// later
sq.stop();
```

**Note:** The `this` binding reference inside the `setup(..)` handler is the same `sq` reactive sequence, so you can use the `this` reference to add to the reactive sequence definition, call methods like `stop()`, and so on.

Here's an example from the Node.js world, using reactive sequences to handle incoming HTTP requests:

```js
var server = http.createServer();
server.listen(8000);

// reactive observer
var request = ASQ.react( function setup(next,registerTeardown){
	server.addListener( "request", next );
	server.addListener( "close", this.stop );

	registerTeardown( function(){
		server.removeListener( "request", next );
		server.removeListener( "close", request.stop );
	} );
});

// respond to requests
request
.seq( pullFromDatabase )
.val( function(data,res){
	res.end( data );
} );

// node teardown
process.on( "SIGINT", request.stop );
```

The `next(..)` trigger can also adapt to node streams easily, using `onStream(..)` and `unStream(..)`:

```js
ASQ.react( function setup(next){
	var fstream = fs.createReadStream( "/some/file" );

	// pipe the stream's "data" event to `next(..)`
	next.onStream( fstream );

	// listen for the end of the stream
	fstream.on( "end", function(){
		next.unStream( fstream );
	} );
} )
.seq( .. )
.then( .. )
.val( .. );
```

You can also use sequence combinations to compose multiple reactive sequence streams:

```js
var sq1 = ASQ.react( .. ).seq( .. ).then( .. );
var sq2 = ASQ.react( .. ).seq( .. ).then( .. );

var sq3 = ASQ.react(..)
.gate(
	sq1,
	sq2
)
.then( .. );
```

The main takeaway is that `ASQ.react(..)` is a lightweight adaptation of F/RP concepts, enabling the wiring of an event stream to a sequence, hence the term "reactive sequence." Reactive sequences are generally capable enough for basic reactive uses.

**Note:** Here's an example of using `ASQ.react(..)` in managing UI state (http://jsbin.com/rozipaki/6/edit?js,output), and another example of handling HTTP request/response streams with `ASQ.react(..)` (https://gist.github.com/getify/bba5ec0de9d6047b720e).
