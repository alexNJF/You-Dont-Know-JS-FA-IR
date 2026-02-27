# Closure (PART 1)

Let's first practice closure with some common computer-math operations: determining if a value is prime (has no divisors other than 1 and itself), and generating a list of prime factors (divisors) for a given number.

For example:

```js
isPrime(11);        // true
isPrime(12);        // false

factorize(11);      // [ 11 ]
factorize(12);      // [ 3, 2, 2 ] --> 3*2*2=12
```

Here's an implementation of `isPrime(..)`, adapted from the Math.js library: [^MathJSisPrime]

```js
function isPrime(v) {
    if (v <= 3) {
        return v > 1;
    }
    if (v % 2 == 0 || v % 3 == 0) {
        return false;
    }
    var vSqrt = Math.sqrt(v);
    for (let i = 5; i <= vSqrt; i += 6) {
        if (v % i == 0 || v % (i + 2) == 0) {
            return false;
        }
    }
    return true;
}
```

And here's a somewhat basic implementation of `factorize(..)` (not to be confused with `factorial(..)` from Chapter 6):

```js
function factorize(v) {
    if (!isPrime(v)) {
        let i = Math.floor(Math.sqrt(v));
        while (v % i != 0) {
            i--;
        }
        return [
            ...factorize(i),
            ...factorize(v / i)
        ];
    }
    return [v];
}
```

| NOTE: |
| :--- |
| I call this basic because it's not optimized for performance. It's binary-recursive (which isn't tail-call optimizable), and it creates a lot of intermediate array copies. It also doesn't order the discovered factors in any way. There are many, many other algorithms for this task, but I wanted to use something short and roughly understandable for our exercise. |

If you were to call `isPrime(4327)` multiple times in a program, you can see that it would go through all its dozens of comparison/computation steps every time. If you consider `factorize(..)`, it's calling `isPrime(..)` many times as it computes the list of factors. And there's a good chance most of those calls are repeats. That's a lot of wasted work!

The first part of this exercise is to use closure to implement a cache to remember the results of `isPrime(..)`, so that the primality (`true` or `false`) of a given number is only ever computed once. Hint: we already showed this sort of caching in Chapter 6 with `factorial(..)`.

If you look at `factorize(..)`, it's implemented with recursion, meaning it calls itself repeatedly. That again means we may likely see a lot of wasted calls to compute prime factors for the same number. So the second part of the exercise is to use the same closure cache technique for `factorize(..)`.

Use separate closures for caching of `isPrime(..)` and `factorize(..)`, rather than putting them inside a single scope.

Try the exercise for yourself, then check out the suggested solution at the end of this appendix.

### A Word About Memory

I want to share a little quick note about this closure cache technique and the impacts it has on your application's performance.

We can see that in saving the repeated calls, we improve computation speed (in some cases, by a dramatic amount). But this usage of closure is making an explicit trade-off that you should be very aware of.

The trade-off is memory. We're essentially growing our cache (in memory) unboundedly. If the functions in question were called many millions of times with mostly unique inputs, we'd be chewing up a lot of memory. This can definitely be worth the expense, but only if we think it's likely we see repetition of common inputs so that we're taking advantage of the cache.

If most every call will have a unique input, and the cache is essentially never *used* to any benefit, this is an inappropriate technique to employ.

It also might be a good idea to have a more sophisticated caching approach, such as an LRU (least recently used) cache, that limits its size; as it runs up to the limit, an LRU evicts the values that are... well, least recently used!

The downside here is that LRU is quite non-trivial in its own right. You'll want to use a highly optimized implementation of LRU, and be keenly aware of all the trade-offs at play.