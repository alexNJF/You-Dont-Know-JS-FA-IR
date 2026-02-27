# Arrow Functions

ES6 added an additional `function` expression form to the language, called "arrow functions":

```js
var askQuestion = () => {
    // ..
};
```

The `=>` arrow function doesn't require the word `function` to define it. Also, the `( .. )` around the parameter list is optional in some simple cases. Likewise, the `{ .. }` around the function body is optional in some cases. And when the `{ .. }` are omitted, a return value is sent out without using a `return` keyword.

| NOTE: |
| :--- |
| The attractiveness of `=>` arrow functions is often sold as "shorter syntax," and that's claimed to equate to objectively more readable code. This claim is dubious at best, and I believe outright misguided. We'll dig into the "readability" of various function forms in Appendix A. |

Arrow functions are lexically anonymous, meaning they have no directly related identifier that references the function. The assignment to `askQuestion` creates an inferred name of "askQuestion", but that's **not the same thing as being non-anonymous**:

```js
var askQuestion = () => {
    // ..
};

askQuestion.name;   // askQuestion
```

Arrow functions achieve their syntactic brevity at the expense of having to mentally juggle a bunch of variations for different forms/conditions. Just a few, for example:

```js
() => 42;

id => id.toUpperCase();

(id,name) => ({ id, name });

(...args) => {
    return args[args.length - 1];
};
```

The real reason I bring up arrow functions is because of the common but incorrect claim that arrow functions somehow behave differently with respect to lexical scope from standard `function` functions.

This is incorrect.

Other than being anonymous (and having no declarative form), `=>` arrow functions have the same lexical scope rules as `function` functions do. An arrow function, with or without `{ .. }` around its body, still creates a separate, inner nested bucket of scope. Variable declarations inside this nested scope bucket behave the same as in a `function` scope.