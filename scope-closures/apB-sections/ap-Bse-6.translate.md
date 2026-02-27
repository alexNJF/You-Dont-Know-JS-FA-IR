# راه‌حل‌های پیشنهادی

امیدوارم قبل از خواندن تا اینجا تمرین‌ها را امتحان کرده باشید. تقلب نکنید!

به یاد داشته باشید، هر راه‌حل پیشنهادی فقط یکی از راه‌های مختلف برای نزدیک شدن به مسائل است. «جواب درست» نیستند، اما رویکرد معقولی برای هر تمرین نشان می‌دهند.

مهم‌ترین سودی که از خواندن این راه‌حل‌های پیشنهادی می‌برید مقایسه آن‌ها با کدتان و تحلیل چرایی انتخاب‌های مشابه یا متفاوت ماست. خیلی bikeshedding نکنید؛ سعی کنید روی موضوع اصلی متمرکز بمانید نه جزئیات کوچک.

### پیشنهادی: سطل‌های مهره‌ها

*تمرین سطل‌های مهره‌ها* می‌تواند این‌طور حل شود:

```js
// RED(1)
const howMany = 100;

// Sieve of Eratosthenes
function findPrimes(howMany) {
    // BLUE(2)
    var sieve = Array(howMany).fill(true);
    var max = Math.sqrt(howMany);

    for (let i = 2; i < max; i++) {
        // GREEN(3)
        if (sieve[i]) {
            // ORANGE(4)
            let j = Math.pow(i,2);
            for (let k = j; k < howMany; k += i) {
                // PURPLE(5)
                sieve[k] = false;
            }
        }
    }

    return sieve
        .map(function getPrime(flag,prime){
            // PINK(6)
            if (flag) return prime;
            return flag;
        })
        .filter(function onlyPrimes(v){
            // YELLOW(7)
            return !!v;
        })
        .slice(1);
}

findPrimes(howMany);
// [
//    2, 3, 5, 7, 11, 13, 17,
//    19, 23, 29, 31, 37, 41,
//    43, 47, 53, 59, 61, 67,
//    71, 73, 79, 83, 89, 97
// ]
```

### پیشنهادی: Closure (بخش ۱)

*تمرین Closure (بخش ۱)* برای `isPrime(..)` و `factorize(..)` می‌تواند این‌طور حل شود:

```js
var isPrime = (function isPrime(v){
    var primes = {};

    return function isPrime(v) {
        if (v in primes) {
            return primes[v];
        }
        if (v <= 3) {
            return (primes[v] = v > 1);
        }
        if (v % 2 == 0 || v % 3 == 0) {
            return (primes[v] = false);
        }
        let vSqrt = Math.sqrt(v);
        for (let i = 5; i <= vSqrt; i += 6) {
            if (v % i == 0 || v % (i + 2) == 0) {
                return (primes[v] = false);
            }
        }
        return (primes[v] = true);
    };
})();

var factorize = (function factorize(v){
    var factors = {};

    return function findFactors(v) {
        if (v in factors) {
            return factors[v];
        }
        if (!isPrime(v)) {
            let i = Math.floor(Math.sqrt(v));
            while (v % i != 0) {
                i--;
            }
            return (factors[v] = [
                ...findFactors(i),
                ...findFactors(v / i)
            ]);
        }
        return (factors[v] = [v]);
    };
})();
```

مراحل کلی که برای هر ابزار استفاده کردم:

۱. IIFE برای تعریف scope متغیر cache wrap کنید.

۲. در فراخوانی زیربنایی، اول cache را بررسی کنید و اگر نتیجه از قبل شناخته شده برگردانید.

۳. در هر جایی که `return` در اصل اتفاق می‌افتاد، به cache انتساب دهید و فقط نتایج آن عملیات انتساب را برگردانید—این بیشتر ترفند صرفه‌جویی فضا فقط برای اختصار در کتاب است.

همچنین تابع درونی را از `factorize(..)` به `findFactors(..)` تغییر نام دادم. از نظر فنی لازم نیست، اما واضح‌تر می‌کند کدام تابع فراخوانی‌های بازگشتی فراخوانی می‌کند.

### پیشنهادی: Closure (بخش ۲)

*تمرین Closure (بخش ۲)* `toggle(..)` می‌تواند این‌طور حل شود:

```js
function toggle(...vals) {
    var unset = {};
    var cur = unset;

    return function next(){
        // save previous value back at
        // the end of the list
        if (cur != unset) {
            vals.push(cur);
        }
        cur = vals.shift();
        return cur;
    };
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

### پیشنهادی: Closure (بخش ۳)

*تمرین Closure (بخش ۳)* `calculator()` می‌تواند این‌طور حل شود:

```js
// from earlier:
//
// function useCalc(..) { .. }
// function formatTotal(..) { .. }

function calculator() {
    var currentTotal = 0;
    var currentVal = "";
    var currentOper = "=";

    return pressKey;

    // ********************

    function pressKey(key){
        // number key?
        if (/\d/.test(key)) {
            currentVal += key;
            return key;
        }
        // operator key?
        else if (/[+*/-]/.test(key)) {
            // multiple operations in a series?
            if (
                currentOper != "=" &&
                currentVal != ""
            ) {
                // implied '=' keypress
                pressKey("=");
            }
            else if (currentVal != "") {
                currentTotal = Number(currentVal);
            }
            currentOper = key;
            currentVal = "";
            return key;
        }
        // = key?
        else if (
            key == "=" &&
            currentOper != "="
        ) {
            currentTotal = op(
                currentTotal,
                currentOper,
                Number(currentVal)
            );
            currentOper = "=";
            currentVal = "";
            return formatTotal(currentTotal);
        }
        return "";
    };

    function op(val1,oper,val2) {
        var ops = {
            // NOTE: using arrow functions
            // only for brevity in the book
            "+": (v1,v2) => v1 + v2,
            "-": (v1,v2) => v1 - v2,
            "*": (v1,v2) => v1 * v2,
            "/": (v1,v2) => v1 / v2
        };
        return ops[oper](val1,val2);
    }
}

var calc = calculator();

useCalc(calc,"4+3=");           // 4+3=7
useCalc(calc,"+9=");            // +9=16
useCalc(calc,"*8=");            // *5=128
useCalc(calc,"7*2*3=");         // 7*2*3=42
useCalc(calc,"1/0=");           // 1/0=ERR
useCalc(calc,"+3=");            // +3=ERR
useCalc(calc,"51=");            // 51
```

| نکته: |
| :--- |
| به یاد داشته باشید: این تمرین درباره closure است. خیلی روی مکانیک واقعی ماشین‌حساب تمرکز نکنید، بلکه روی اینکه آیا به درستی *حالت* ماشین‌حساب را در فراخوانی‌های تابع به یاد می‌آورید. |

### پیشنهادی: ماژول‌ها

*تمرین ماژول‌ها* `calculator()` می‌تواند این‌طور حل شود:

```js
// from earlier:
//
// function useCalc(..) { .. }
// function formatTotal(..) { .. }

function calculator() {
    var currentTotal = 0;
    var currentVal = "";
    var currentOper = "=";

    var publicAPI = {
        number,
        eq,
        plus() { return operator("+"); },
        minus() { return operator("-"); },
        mult() { return operator("*"); },
        div() { return operator("/"); }
    };

    return publicAPI;

    // ********************

    function number(key) {
        // number key?
        if (/\d/.test(key)) {
            currentVal += key;
            return key;
        }
    }

    function eq() {
        // = key?
        if (currentOper != "=") {
            currentTotal = op(
                currentTotal,
                currentOper,
                Number(currentVal)
            );
            currentOper = "=";
            currentVal = "";
            return formatTotal(currentTotal);
        }
        return "";
    }

    function operator(key) {
        // multiple operations in a series?
        if (
            currentOper != "=" &&
            currentVal != ""
        ) {
            // implied '=' keypress
            eq();
        }
        else if (currentVal != "") {
            currentTotal = Number(currentVal);
        }
        currentOper = key;
        currentVal = "";
        return key;
    }

    function op(val1,oper,val2) {
        var ops = {
            // NOTE: using arrow functions
            // only for brevity in the book
            "+": (v1,v2) => v1 + v2,
            "-": (v1,v2) => v1 - v2,
            "*": (v1,v2) => v1 * v2,
            "/": (v1,v2) => v1 / v2
        };
        return ops[oper](val1,val2);
    }
}

var calc = calculator();

useCalc(calc,"4+3=");           // 4+3=7
useCalc(calc,"+9=");            // +9=16
useCalc(calc,"*8=");            // *5=128
useCalc(calc,"7*2*3=");         // 7*2*3=42
useCalc(calc,"1/0=");           // 1/0=ERR
useCalc(calc,"+3=");            // +3=ERR
useCalc(calc,"51=");            // 51
```

همین برای این کتاب. تبریک برای دستاوردتان! وقتی آماده بودید، به کتاب ۳، *Objects & Classes* بروید.

[^MathJSisPrime]: *Math.js: isPrime(..)*, https://github.com/josdejong/mathjs/blob/develop/src/function/utils/isPrime.js, 3 March 2020.
