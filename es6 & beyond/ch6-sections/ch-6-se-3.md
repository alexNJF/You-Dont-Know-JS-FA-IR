# `Math`

ES6 adds several new mathematic utilities that fill in holes or aid with common operations. All of these can be manually calculated, but most of them are now defined natively so that in some cases the JS engine can either more optimally perform the calculations, or perform them with better decimal precision than their manual counterparts.

It's likely that asm.js/transpiled JS code (see the *Async & Performance* title of this series) is the more likely consumer of many of these utilities rather than direct developers.

Trigonometry:

* `cosh(..)` - Hyperbolic cosine
* `acosh(..)` - Hyperbolic arccosine
* `sinh(..)` - Hyperbolic sine
* `asinh(..)` - Hyperbolic arcsine
* `tanh(..)` - Hyperbolic tangent
* `atanh(..)` - Hyperbolic arctangent
* `hypot(..)` - The squareroot of the sum of the squares (i.e., the generalized Pythagorean theorem)

Arithmetic:

* `cbrt(..)` - Cube root
* `clz32(..)` - Count leading zeros in 32-bit binary representation
* `expm1(..)` - The same as `exp(x) - 1`
* `log2(..)` - Binary logarithm (log base 2)
* `log10(..)` - Log base 10
* `log1p(..)` - The same as `log(x + 1)`
* `imul(..)` - 32-bit integer multiplication of two numbers

Meta:

* `sign(..)` - Returns the sign of the number
* `trunc(..)` - Returns only the integer part of a number
* `fround(..)` - Rounds to nearest 32-bit (single precision) floating-point value
