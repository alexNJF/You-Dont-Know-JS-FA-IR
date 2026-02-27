# Modules

This exercise is to convert the calculator from Closure (PART 3) into a module.

We're not adding any additional functionality to the calculator, only changing its interface. Instead of calling a single function `calc(..)`, we'll be calling specific methods on the public API for each "keypress" of our calculator. The outputs stay the same.

This module should be expressed as a classic module factory function called `calculator()`, instead of a singleton IIFE, so that multiple calculators can be created if desired.

The public API should include the following methods:

* `number(..)` (input: the character/number "pressed")
* `plus()`
* `minus()`
* `mult()`
* `div()`
* `eq()`

Usage would look like:

```js
var calc = calculator();

calc.number("4");     // 4
calc.plus();          // +
calc.number("7");     // 7
calc.number("3");     // 3
calc.minus();         // -
calc.number("2");     // 2
calc.eq();            // 75
```

`formatTotal(..)` remains the same from that previous exercise. But the `useCalc(..)` helper needs to be adjusted to work with the module API:

```js
function useCalc(calc,keys) {
    var keyMappings = {
        "+": "plus",
        "-": "minus",
        "*": "mult",
        "/": "div",
        "=": "eq"
    };

    return [...keys].reduce(
        function showDisplay(display,key){
            var fn = keyMappings[key] || "number";
            var ret = String( calc[fn](key) );
            return (
                display +
                (
                  (ret != "" && key == "=") ?
                      "=" :
                      ""
                ) +
                ret
            );
        },
        ""
    );
}

useCalc(calc,"4+3=");           // 4+3=7
useCalc(calc,"+9=");            // +9=16
useCalc(calc,"*8=");            // *5=128
useCalc(calc,"7*2*3=");         // 7*2*3=42
useCalc(calc,"1/0=");           // 1/0=ERR
useCalc(calc,"+3=");            // +3=ERR
useCalc(calc,"51=");            // 51
```

Try the exercise for yourself, then check out the suggested solution at the end of this appendix.

As you work on this exercise, also spend some time considering the pros/cons of representing the calculator as a module as opposed to the closure-function approach from the previous exercise.

BONUS: write out a few sentences explaining your thoughts.

BONUS #2: try converting your module to other module formats, including: UMD, CommonJS, and ESM (ES Modules).