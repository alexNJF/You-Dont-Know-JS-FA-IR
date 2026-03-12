# Maps

If you have a lot of JS experience, you know that objects are the primary mechanism for creating unordered key/value-pair data structures, otherwise known as maps. However, the major drawback with objects-as-maps is the inability to use a non-string value as the key.

For example, consider:

```js
var m = {};

var x = { id: 1 },
	y = { id: 2 };

m[x] = "foo";
m[y] = "bar";

m[x];							// "bar"
m[y];							// "bar"
```

What's going on here? The two objects `x` and `y` both stringify to `"[object Object]"`, so only that one key is being set in `m`.

Some have implemented fake maps by maintaining a parallel array of non-string keys alongside an array of the values, such as:

```js
var keys = [], vals = [];

var x = { id: 1 },
	y = { id: 2 };

keys.push( x );
vals.push( "foo" );

keys.push( y );
vals.push( "bar" );

keys[0] === x;					// true
vals[0];						// "foo"

keys[1] === y;					// true
vals[1];						// "bar"
```

Of course, you wouldn't want to manage those parallel arrays yourself, so you could define a data structure with methods that automatically do the management under the covers. Besides having to do that work yourself, the main drawback is that access is no longer O(1) time-complexity, but instead is O(n).

But as of ES6, there's no longer any need to do this! Just use `Map(..)`:

```js
var m = new Map();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );
m.set( y, "bar" );

m.get( x );						// "foo"
m.get( y );						// "bar"
```

The only drawback is that you can't use the `[ ]` bracket access syntax for setting and retrieving values. But `get(..)` and `set(..)` work perfectly suitably instead.

To delete an element from a map, don't use the `delete` operator, but instead use the `delete(..)` method:

```js
m.set( x, "foo" );
m.set( y, "bar" );

m.delete( y );
```

You can clear the entire map's contents with `clear()`. To get the length of a map (i.e., the number of keys), use the `size` property (not `length`):

```js
m.set( x, "foo" );
m.set( y, "bar" );
m.size;							// 2

m.clear();
m.size;							// 0
```

The `Map(..)` constructor can also receive an iterable (see "Iterators" in Chapter 3), which must produce a list of arrays, where the first item in each array is the key and the second item is the value. This format for iteration is identical to that produced by the `entries()` method, explained in the next section. That makes it easy to make a copy of a map:

```js
var m2 = new Map( m.entries() );

// same as:
var m2 = new Map( m );
```

Because a map instance is an iterable, and its default iterator is the same as `entries()`, the second shorter form is more preferable.

Of course, you can just manually specify an *entries* list (array of key/value arrays) in the `Map(..)` constructor form:

```js
var x = { id: 1 },
	y = { id: 2 };

var m = new Map( [
	[ x, "foo" ],
	[ y, "bar" ]
] );

m.get( x );						// "foo"
m.get( y );						// "bar"
```

### Map Values

To get the list of values from a map, use `values(..)`, which returns an iterator. In Chapters 2 and 3, we covered various ways to process an iterator sequentially (like an array), such as the `...` spread operator and the `for..of` loop. Also, "Arrays" in Chapter 6 covers the `Array.from(..)` method in detail. Consider:

```js
var m = new Map();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );
m.set( y, "bar" );

var vals = [ ...m.values() ];

vals;							// ["foo","bar"]
Array.from( m.values() );		// ["foo","bar"]
```

As discussed in the previous section, you can iterate over a map's entries using `entries()` (or the default map iterator). Consider:

```js
var m = new Map();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );
m.set( y, "bar" );

var vals = [ ...m.entries() ];

vals[0][0] === x;				// true
vals[0][1];						// "foo"

vals[1][0] === y;				// true
vals[1][1];						// "bar"
```

### Map Keys

To get the list of keys, use `keys()`, which returns an iterator over the keys in the map:

```js
var m = new Map();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );
m.set( y, "bar" );

var keys = [ ...m.keys() ];

keys[0] === x;					// true
keys[1] === y;					// true
```

To determine if a map has a given key, use `has(..)`:

```js
var m = new Map();

var x = { id: 1 },
	y = { id: 2 };

m.set( x, "foo" );

m.has( x );						// true
m.has( y );						// false
```

Maps essentially let you associate some extra piece of information (the value) with an object (the key) without actually putting that information on the object itself.

While you can use any kind of value as a key for a map, you typically will use objects, as strings and other primitives are already eligible as keys of normal objects. In other words, you'll probably want to continue to use normal objects for maps unless some or all of the keys need to be objects, in which case map is more appropriate.

**Warning:** If you use an object as a map key and that object is later discarded (all references unset) in attempt to have garbage collection (GC) reclaim its memory, the map itself will still retain its entry. You will need to remove the entry from the map for it to be GC-eligible. In the next section, we'll see WeakMaps as a better option for object keys and GC.
