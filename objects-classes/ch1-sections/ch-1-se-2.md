# Objects As Containers

One common way of gathering up multiple values in a single container is with an object. Objects are collections of key/value pairs. There are also sub-types of object in JS with specialized behaviors, such as arrays (numerically indexed) and even functions (callable); more on these sub-types later.

| NOTE: |
| :--- |
| Keys are often referred to as "property names", with the pairing of a property name and a value often called a "property". This book will use those terms distinctly in that manner. |

Regular JS objects are typically declared with literal syntax, like this:

```js
myObj = {
    // ..
};
```

**Note:** There's an alternate way to create an object (using `myObj = new Object()`), but this is not common or preferred, and is almost never the appropriate way to go about it. Stick with object literal syntax.

It's easy to get confused what pairs of `{ .. }` mean, since JS overloads the curly brackets to mean any of the following, depending on the context used:

* delimit values, like object literals
* define object destructuring patterns (more on this later)
* delimit interpolated string expressions, like `` `some ${ getNumber() } thing` ``
* define blocks, like on `if` and `for` loops
* define function bodies

Though it can sometimes be challenging as you read code, look for whether a `{ .. }` curly brace pair is used in the program where a value/expression is valid to appear; if so, it's an object literal, otherwise it's one of the other overloaded uses.