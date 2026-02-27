# Strings

It's a very common belief that `string`s are essentially just `array`s of characters. While the implementation under the covers may or may not use `array`s, it's important to realize that JavaScript `string`s are really not the same as `array`s of characters. The similarity is mostly just skin-deep.

For example, let's consider these two values:

```js
var a = "foo";
var b = ["f","o","o"];
```

Strings do have a shallow resemblance to `array`s -- `array`-likes, as above -- for instance, both of them having a `length` property, an `indexOf(..)` method (`array` version only as of ES5), and a `concat(..)` method:

```js
a.length;							// 3
b.length;							// 3

a.indexOf( "o" );					// 1
b.indexOf( "o" );					// 1

var c = a.concat( "bar" );			// "foobar"
var d = b.concat( ["b","a","r"] );	// ["f","o","o","b","a","r"]

a === c;							// false
b === d;							// false

a;									// "foo"
b;									// ["f","o","o"]
```

So, they're both basically just "arrays of characters", right? **Not exactly**:

```js
a[1] = "O";
b[1] = "O";

a; // "foo"
b; // ["f","O","o"]
```

JavaScript `string`s are immutable, while `array`s are quite mutable. Moreover, the `a[1]` character position access form was not always widely valid JavaScript. Older versions of IE did not allow that syntax (but now they do). Instead, the *correct* approach has been `a.charAt(1)`.

A further consequence of immutable `string`s is that none of the `string` methods that alter its contents can modify in-place, but rather must create and return new `string`s. By contrast, many of the methods that change `array` contents actually *do* modify in-place.

```js
c = a.toUpperCase();
a === c;	// false
a;			// "foo"
c;			// "FOO"

b.push( "!" );
b;			// ["f","O","o","!"]
```

Also, many of the `array` methods that could be helpful when dealing with `string`s are not actually available for them, but we can "borrow" non-mutation `array` methods against our `string`:

```js
a.join;			// undefined
a.map;			// undefined

var c = Array.prototype.join.call( a, "-" );
var d = Array.prototype.map.call( a, function(v){
	return v.toUpperCase() + ".";
} ).join( "" );

c;				// "f-o-o"
d;				// "F.O.O."
```

Let's take another example: reversing a `string` (incidentally, a common JavaScript interview trivia question!). `array`s have a `reverse()` in-place mutator method, but `string`s do not:

```js
a.reverse;		// undefined

b.reverse();	// ["!","o","O","f"]
b;				// ["!","o","O","f"]
```

Unfortunately, this "borrowing" doesn't work with `array` mutators, because `string`s are immutable and thus can't be modified in place:

```js
Array.prototype.reverse.call( a );
// still returns a String object wrapper (see Chapter 3)
// for "foo" :(
```

Another workaround (aka hack) is to convert the `string` into an `array`, perform the desired operation, then convert it back to a `string`.

```js
var c = a
	// split `a` into an array of characters
	.split( "" )
	// reverse the array of characters
	.reverse()
	// join the array of characters back to a string
	.join( "" );

c; // "oof"
```

If that feels ugly, it is. Nevertheless, *it works* for simple `string`s, so if you need something quick-n-dirty, often such an approach gets the job done.

**Warning:** Be careful! This approach **doesn't work** for `string`s with complex (unicode) characters in them (astral symbols, multibyte characters, etc.). You need more sophisticated library utilities that are unicode-aware for such operations to be handled accurately. Consult Mathias Bynens' work on the subject: *Esrever* (https://github.com/mathiasbynens/esrever).

The other way to look at this is: if you are more commonly doing tasks on your "strings" that treat them as basically *arrays of characters*, perhaps it's better to just actually store them as `array`s rather than as `string`s. You'll probably save yourself a lot of hassle of converting from `string` to `array` each time. You can always call `join("")` on the `array` *of characters* whenever you actually need the `string` representation.
