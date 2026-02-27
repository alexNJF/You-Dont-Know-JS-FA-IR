# Closure (PART 3)

In this third and final exercise on closure, we're going to implement a basic calculator. The `calculator()` function will produce an instance of a calculator that maintains its own state, in the form of a function (`calc(..)`, below):

```js
function calculator() {
    // ..
}

var calc = calculator();
```

Each time `calc(..)` is called, you'll pass in a single character that represents a keypress of a calculator button. To keep things more straightforward, we'll restrict our calculator to supporting entering only digits (0-9), arithmetic operations (+, -, \*, /), and "=" to compute the operation. Operations are processed strictly in the order entered; there's no "( )" grouping or operator precedence.

We don't support entering decimals, but the divide operation can result in them. We don't support entering negative numbers, but the "-" operation can result in them. So, you should be able to produce any negative or decimal number by first entering an operation to compute it. You can then keep computing with that value.

The return of `calc(..)` calls should mimic what would be shown on a real calculator, like reflecting what was just pressed, or computing the total when pressing "=".

For example:

```js
calc("4");     // 4
calc("+");     // +
calc("7");     // 7
calc("3");     // 3
calc("-");     // -
calc("2");     // 2
calc("=");     // 75
calc("*");     // *
calc("4");     // 4
calc("=");     // 300
calc("5");     // 5
calc("-");     // -
calc("5");     // 5
calc("=");     // 0
```

Since this usage is a bit clumsy, here's a `useCalc(..)` helper, that runs the calculator with characters one at a time from a string, and computes the display each time:

```js
function useCalc(calc,keys) {
    return [...keys].reduce(
        function showDisplay(display,key){
            var ret = String( calc(key) );
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

The most sensible usage of this `useCalc(..)` helper is to always have "=" be the last character entered.

Some of the formatting of the totals displayed by the calculator require special handling. I'm providing this `formatTotal(..)` function, which your calculator should use whenever it's going to return a current computed total (after an `"="` is entered):

```js
function formatTotal(display) {
    if (Number.isFinite(display)) {
        // constrain display to max 11 chars
        let maxDigits = 11;
        // reserve space for "e+" notation?
        if (Math.abs(display) > 99999999999) {
            maxDigits -= 6;
        }
        // reserve space for "-"?
        if (display < 0) {
            maxDigits--;
        }

        // whole number?
        if (Number.isInteger(display)) {
            display = display
                .toPrecision(maxDigits)
                .replace(/\.0+$/,"");
        }
        // decimal
        else {
            // reserve space for "."
            maxDigits--;
            // reserve space for leading "0"?
            if (
                Math.abs(display) >= 0 &&
                Math.abs(display) < 1
            ) {
                maxDigits--;
            }
            display = display
                .toPrecision(maxDigits)
                .replace(/0+$/,"");
        }
    }
    else {
        display = "ERR";
    }
    return display;
}
```

Don't worry too much about how `formatTotal(..)` works. Most of its logic is a bunch of handling to limit the calculator display to 11 characters max, even if negatives, repeating decimals, or even "e+" exponential notation is required.

Again, don't get too mired in the mud around calculator-specific behavior. Focus on the *memory* of closure.

Try the exercise for yourself, then check out the suggested solution at the end of this appendix.