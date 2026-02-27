# Closure (PART 2)

In this exercise, we're going to again practice closure by defining a `toggle(..)` utility that gives us a value toggler.

You will pass one or more values (as arguments) into `toggle(..)`, and get back a function. That returned function will alternate/rotate between all the passed-in values in order, one at a time, as it's called repeatedly.

```js
function toggle(/* .. */) {
    // ..
}

var hello = toggle("hello");
var onOff = toggle("on","off");
var speed = toggle("slow","medium","fast");

hello();      // "hello"
hello();      // "hello"

onOff();      // "on"
onOff();      // "off"
onOff();      // "on"

speed();      // "slow"
speed();      // "medium"
speed();      // "fast"
speed();      // "slow"
```

The corner case of passing in no values to `toggle(..)` is not very important; such a toggler instance could just always return `undefined`.

Try the exercise for yourself, then check out the suggested solution at the end of this appendix.