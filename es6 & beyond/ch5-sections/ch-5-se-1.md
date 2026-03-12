# TypedArrays

As we cover in the *Types & Grammar* title of this series, JS does have a set of built-in types, like `number` and `string`. It'd be tempting to look at a feature named "typed array" and assume it means an array of a specific type of values, like an array of only strings.

However, typed arrays are really more about providing structured access to binary data using array-like semantics (indexed access, etc.). The "type" in the name refers to a "view" layered on type of the bucket of bits, which is essentially a mapping of whether the bits should be viewed as an array of 8-bit signed integers, 16-bit signed integers, and so on.

How do you construct such a bit-bucket? It's called a "buffer," and you construct it most directly with the `ArrayBuffer(..)` constructor:

```js
var buf = new ArrayBuffer( 32 );
buf.byteLength;							// 32
```

`buf` is now a binary buffer that is 32-bytes long (256-bits), that's pre-initialized to all `0`s. A buffer by itself doesn't really allow you any interaction except for checking its `byteLength` property.

**Tip:** Several web platform features use or return array buffers, such as `FileReader#readAsArrayBuffer(..)`, `XMLHttpRequest#send(..)`, and `ImageData` (canvas data).

But on top of this array buffer, you can then layer a "view," which comes in the form of a typed array. Consider:

```js
var arr = new Uint16Array( buf );
arr.length;							// 16
```

`arr` is a typed array of 16-bit unsigned integers mapped over the 256-bit `buf` buffer, meaning you get 16 elements.

### Endianness

It's very important to understand that the `arr` is mapped using the endian-setting (big-endian or little-endian) of the platform the JS is running on. This can be an issue if the binary data is created with one endianness but interpreted on a platform with the opposite endianness.

Endian means if the low-order byte (collection of 8-bits) of a multi-byte number -- such as the 16-bit unsigned ints we created in the earlier snippet -- is on the right or the left of the number's bytes.

For example, let's imagine the base-10 number `3085`, which takes 16-bits to represent. If you have just one 16-bit number container, it'd be represented in binary as `0000110000001101` (hexadecimal `0c0d`) regardless of endianness.

But if `3085` was represented with two 8-bit numbers, the endianness would significantly affect its storage in memory:

* `0000110000001101` / `0c0d` (big endian)
* `0000110100001100` / `0d0c` (little endian)

If you received the bits of `3085` as `0000110100001100` from a little-endian system, but you layered a view on top of it in a big-endian system, you'd instead see value `3340` (base-10) and `0d0c` (base-16).

Little endian is the most common representation on the web these days, but there are definitely browsers where that's not true. It's important that you understand the endianness of both the producer and consumer of a chunk of binary data.

From MDN, here's a quick way to test the endianness of your JavaScript:

```js
var littleEndian = (function() {
	var buffer = new ArrayBuffer( 2 );
	new DataView( buffer ).setInt16( 0, 256, true );
	return new Int16Array( buffer )[0] === 256;
})();
```

`littleEndian` will be `true` or `false`; for most browsers, it should return `true`. This test uses `DataView(..)`, which allows more low-level, fine-grained control over accessing (setting/getting) the bits from the view you layer over the buffer. The third parameter of the `setInt16(..)` method in the previous snippet is for telling the `DataView` what endianness you're wanting it to use for that operation.

**Warning:** Do not confuse endianness of underlying binary storage in array buffers with how a given number is represented when exposed in a JS program. For example, `(3085).toString(2)` returns `"110000001101"`, which with an assumed leading four `"0"`s appears to be the big-endian representation. In fact, this representation is based on a single 16-bit view, not a view of two 8-bit bytes. The `DataView` test above is the best way to determine endianness for your JS environment.

### Multiple Views

A single buffer can have multiple views attached to it, such as:

```js
var buf = new ArrayBuffer( 2 );

var view8 = new Uint8Array( buf );
var view16 = new Uint16Array( buf );

view16[0] = 3085;
view8[0];						// 13
view8[1];						// 12

view8[0].toString( 16 );		// "d"
view8[1].toString( 16 );		// "c"

// swap (as if endian!)
var tmp = view8[0];
view8[0] = view8[1];
view8[1] = tmp;

view16[0];						// 3340
```

The typed array constructors have multiple signature variations. We've shown so far only passing them an existing buffer. However, that form also takes two extra parameters: `byteOffset` and `length`. In other words, you can start the typed array view at a location other than `0` and you can make it span less than the full length of the buffer.

If the buffer of binary data includes data in non-uniform size/location, this technique can be quite useful.

For example, consider a binary buffer that has a 2-byte number (aka "word") at the beginning, followed by two 1-byte numbers, followed by a 32-bit floating point number. Here's how you can access that data with multiple views on the same buffer, offsets, and lengths:

```js
var first = new Uint16Array( buf, 0, 2 )[0],
	second = new Uint8Array( buf, 2, 1 )[0],
	third = new Uint8Array( buf, 3, 1 )[0],
	fourth = new Float32Array( buf, 4, 4 )[0];
```

### TypedArray Constructors

In addition to the `(buffer,[offset, [length]])` form examined in the previous section, typed array constructors also support these forms:

* [constructor]`(length)`: Creates a new view over a new buffer of `length` bytes
* [constructor]`(typedArr)`: Creates a new view and buffer, and copies the contents from the `typedArr` view
* [constructor]`(obj)`: Creates a new view and buffer, and iterates over the array-like or object `obj` to copy its contents

The following typed array constructors are available as of ES6:

* `Int8Array` (8-bit signed integers), `Uint8Array` (8-bit unsigned integers)
	- `Uint8ClampedArray` (8-bit unsigned integers, each value clamped on setting to the `0`-`255` range)
* `Int16Array` (16-bit signed integers), `Uint16Array` (16-bit unsigned integers)
* `Int32Array` (32-bit signed integers), `Uint32Array` (32-bit unsigned integers)
* `Float32Array` (32-bit floating point, IEEE-754)
* `Float64Array` (64-bit floating point, IEEE-754)

Instances of typed array constructors are almost the same as regular native arrays. Some differences include having a fixed length and the values all being of the same "type."

However, they share most of the same `prototype` methods. As such, you likely will be able to use them as regular arrays without needing to convert.

For example:

```js
var a = new Int32Array( 3 );
a[0] = 10;
a[1] = 20;
a[2] = 30;

a.map( function(v){
	console.log( v );
} );
// 10 20 30

a.join( "-" );
// "10-20-30"
```

**Warning:** You can't use certain `Array.prototype` methods with TypedArrays that don't make sense, such as the mutators (`splice(..)`, `push(..)`, etc.) and `concat(..)`.

Be aware that the elements in TypedArrays really are constrained to the declared bit sizes. If you have a `Uint8Array` and try to assign something larger than an 8-bit value into one of its elements, the value wraps around so as to stay within the bit length.

This could cause problems if you were trying to, for instance, square all the values in a TypedArray. Consider:

```js
var a = new Uint8Array( 3 );
a[0] = 10;
a[1] = 20;
a[2] = 30;

var b = a.map( function(v){
	return v * v;
} );

b;				// [100, 144, 132]
```

The `20` and `30` values, when squared, resulted in bit overflow. To get around such a limitation, you can use the `TypedArray#from(..)` function:

```js
var a = new Uint8Array( 3 );
a[0] = 10;
a[1] = 20;
a[2] = 30;

var b = Uint16Array.from( a, function(v){
	return v * v;
} );

b;				// [100, 400, 900]
```

See the "`Array.from(..)` Static Function" section in Chapter 6 for more information about the `Array.from(..)` that is shared with TypedArrays. Specifically, the "Mapping" section explains the mapping function accepted as its second argument.

One interesting behavior to consider is that TypedArrays have a `sort(..)` method much like regular arrays, but this one defaults to numeric sort comparisons instead of coercing values to strings for lexicographic comparison. For example:

```js
var a = [ 10, 1, 2, ];
a.sort();								// [1,10,2]

var b = new Uint8Array( [ 10, 1, 2 ] );
b.sort();								// [1,2,10]
```

The `TypedArray#sort(..)` takes an optional compare function argument just like `Array#sort(..)`, which works in exactly the same way.
