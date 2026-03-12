# Iterable Sequences

The normal paradigm for a sequence is that each step is responsible for completing itself, which is what advances the sequence. Promises work the same way.

The unfortunate part is that sometimes you need external control over a Promise/step, which leads to awkward "capability extraction".

Consider this Promises example:

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

The "capability extraction" anti-pattern with Promises looks like this:

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

**Note:** This anti-pattern is an awkward code smell, in my opinion, but some developers like it, for reasons I can't grasp.

*asynquence* offers an inverted sequence type I call "iterable sequences", which externalizes the control capability (it's quite useful in use cases like the `domready`):

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

There's more to iterable sequences than what we see in this scenario. We'll come back to them in Appendix B.
