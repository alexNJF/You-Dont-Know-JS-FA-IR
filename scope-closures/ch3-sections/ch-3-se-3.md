# Function Name Scope

As you've seen by now, a `function` declaration looks like this:

```js
function askQuestion() {
    // ..
}
```

And as discussed in Chapters 1 and 2, such a `function` declaration will create an identifier in the enclosing scope (in this case, the global scope) named `askQuestion`.

What about this program?

```js
var askQuestion = function(){
    // ..
};
```

The same is true for the variable `askQuestion` being created. But since it's a `function` expression—a function definition used as value instead of a standalone declaration—the function itself will not "hoist" (see Chapter 5).

One major difference between `function` declarations and `function` expressions is what happens to the name identifier of the function. Consider a named `function` expression:

```js
var askQuestion = function ofTheTeacher(){
    // ..
};
```

We know `askQuestion` ends up in the outer scope. But what about the `ofTheTeacher` identifier? For formal `function` declarations, the name identifier ends up in the outer/enclosing scope, so it may be reasonable to assume that's the case here. But `ofTheTeacher` is declared as an identifier **inside the function itself**:

```js
var askQuestion = function ofTheTeacher() {
    console.log(ofTheTeacher);
};

askQuestion();
// function ofTheTeacher()...

console.log(ofTheTeacher);
// ReferenceError: ofTheTeacher is not defined
```

| NOTE: |
| :--- |
| Actually, `ofTheTeacher` is not exactly *in the scope of the function*. Appendix A, "Implied Scopes" will explain further. |

Not only is `ofTheTeacher` declared inside the function rather than outside, but it's also defined as read-only:

```js
var askQuestion = function ofTheTeacher() {
    "use strict";
    ofTheTeacher = 42;   // TypeError

    //..
};

askQuestion();
// TypeError
```

Because we used strict-mode, the assignment failure is reported as a `TypeError`; in non-strict-mode, such an assignment fails silently with no exception.

What about when a `function` expression has no name identifier?

```js
var askQuestion = function(){
   // ..
};
```

A `function` expression with a name identifier is referred to as a "named function expression," but one without a name identifier is referred to as an "anonymous function expression." Anonymous function expressions clearly have no name identifier that affects either scope.

| NOTE: |
| :--- |
| We'll discuss named vs. anonymous `function` expressions in much more detail, including what factors affect the decision to use one or the other, in Appendix A. |