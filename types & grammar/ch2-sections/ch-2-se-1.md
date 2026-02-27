# Arrays

As compared to other type-enforced languages, JavaScript `array`s are just containers for any type of value, from `string` to `number` to `object` to even another `array` (which is how you get multidimensional `array`s).

```js
var a = [ 1, "2", [3] ];

a.length;		// 3
a[0] === 1;		// true
a[2][0] === 3;	// true
```

You don't need to presize your `array`s (see "Arrays" in Chapter 3), you can just declare them and add values as you see fit:

```js
var a = [ ];

a.length;	// 0

a[0] = 1;
a[1] = "2";
a[2] = [ 3 ];

a.length;	// 3
```

**Warning:** Using `delete` on an `array` value will remove that slot from the `array`, but even if you remove the final element, it does **not** update the `length` property, so be careful! We'll cover the `delete` operator itself in more detail in Chapter 5.

Be careful about creating "sparse" `array`s (leaving or creating empty/missing slots):

```js
var a = [ ];

a[0] = 1;
// no `a[1]` slot set here
a[2] = [ 3 ];

a[1];		// undefined

a.length;	// 3
```

While that works, it can lead to some confusing behavior with the "empty slots" you leave in between. While the slot appears to have the `undefined` value in it, it will not behave the same as if the slot is explicitly set (`a[1] = undefined`). See "Arrays" in Chapter 3 for more information.

`array`s are numerically indexed (as you'd expect), but the tricky thing is that they also are objects that can have `string` keys/properties added to them (but which don't count toward the `length` of the `array`):

```js
var a = [ ];

a[0] = 1;
a["foobar"] = 2;

a.length;		// 1
a["foobar"];	// 2
a.foobar;		// 2
```

However, a gotcha to be aware of is that if a `string` value intended as a key can be coerced to a standard base-10 `number`, then it is assumed that you wanted to use it as a `number` index rather than as a `string` key!

```js
var a = [ ];

a["13"] = 42;

a.length; // 14
```

Generally, it's not a great idea to add `string` keys/properties to `array`s. Use `object`s for holding values in keys/properties, and save `array`s for strictly numerically indexed values.

### Array-Likes

There will be occasions where you need to convert an `array`-like value (a numerically indexed collection of values) into a true `array`, usually so you can call array utilities (like `indexOf(..)`, `concat(..)`, `forEach(..)`, etc.) against the collection of values.

For example, various DOM query operations return lists of DOM elements that are not true `array`s but are `array`-like enough for our conversion purposes. Another common example is when functions expose the `arguments` (`array`-like) object (as of ES6, deprecated) to access the arguments as a list.

One very common way to make such a conversion is to borrow the `slice(..)` utility against the value:

```js
function foo() {
	var arr = Array.prototype.slice.call( arguments );
	arr.push( "bam" );
	console.log( arr );
}

foo( "bar", "baz" ); // ["bar","baz","bam"]
```

If `slice()` is called without any other parameters, as it effectively is in the above snippet, the default values for its parameters have the effect of duplicating the `array` (or, in this case, `array`-like).

As of ES6, there's also a built-in utility called `Array.from(..)` that can do the same task:

```js
...
var arr = Array.from( arguments );
...
```

**Note:** `Array.from(..)` has several powerful capabilities, and will be covered in detail in the *ES6 & Beyond* title of this series.
