# Implementation Limits

The JavaScript spec does not place arbitrary limits on things such as the number of arguments to a function or the length of a string literal, but these limits exist nonetheless, because of implementation details in different engines.

For example:

```js
function addAll() {
	var sum = 0;
	for (var i=0; i < arguments.length; i++) {
		sum += arguments[i];
	}
	return sum;
}

var nums = [];
for (var i=1; i < 100000; i++) {
	nums.push(i);
}

addAll( 2, 4, 6 );				// 12
addAll.apply( null, nums );		// should be: 499950000
```

In some JS engines, you'll get the correct `499950000` answer, but in others (like Safari 6.x), you'll get the error: "RangeError: Maximum call stack size exceeded."

Examples of other limits known to exist:

* maximum number of characters allowed in a string literal (not just a string value)
* size (bytes) of data that can be sent in arguments to a function call (aka stack size)
* number of parameters in a function declaration
* maximum depth of non-optimized call stack (i.e., with recursion): how long a chain of function calls from one to the other can be
* number of seconds a JS program can run continuously blocking the browser
* maximum length allowed for a variable name
* ...

It's not very common at all to run into these limits, but you should be aware that limits can and do exist, and importantly that they vary between engines.
