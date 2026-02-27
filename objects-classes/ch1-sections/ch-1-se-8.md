# Temporary Containers

Using a container to hold multiple values is sometimes just a temporary transport mechanism, such as when you want to pass multiple values to a function via a single argument, or when you want a function to return multiple values:

```js
function formatValues({ one, two, three }) {
    // the actual object passed in as an
    // argument is not accessible, since
    // we destructured it into three
    // separate variables

    one = one.toUpperCase();
    two = `--${two}--`;
    three = three.substring(0,5);

    // this object is only to transport
    // all three values in a single
    // return statement
    return { one, two, three };
}

// destructuring the return value from
// the function, because that returned
// object is just a temporary container
// to transport us multiple values
const { one, two, three } =

    // this object argument is a temporary
    // transport for multiple input values
    formatValues({
       one: "Kyle",
       two: "Simpson",
       three: "getify"
    });

one;     // "KYLE"
two;     // "--Simpson--"
three;   // "getif"
```

The object literal passed into `formatValues(..)` is immediately parameter destructured, so inside the function we only deal with three separate variables (`one`, `two`, and `three`). The object literal `return`ed from the function is also immediately destructured, so again we only deal with three separate variables (`one`, `two`, `three`).

This snippet illustrates the idiom/pattern that an object is sometimes just a temporary transport container rather than a meaningful value in and of itself.