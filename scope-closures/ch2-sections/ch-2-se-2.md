# A Conversation Among Friends

Another useful metaphor for the process of analyzing variables and the scopes they come from is to imagine various conversations that occur inside the engine as code is processed and then executed. We can "listen in" on these conversations to get a better conceptual foundation for how scopes work.

Let's now meet the members of the JS engine that will have conversations as they process our program:

* *Engine*: responsible for start-to-finish compilation and execution of our JavaScript program.

* *Compiler*: one of *Engine*'s friends; handles all the dirty work of parsing and code-generation (see previous section).

* *Scope Manager*: another friend of *Engine*; collects and maintains a lookup list of all the declared variables/identifiers, and enforces a set of rules as to how these are accessible to currently executing code.

For you to *fully understand* how JavaScript works, you need to begin to *think* like *Engine* (and friends) think, ask the questions they ask, and answer their questions likewise.

To explore these conversations, recall again our running program example:

```js
var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" }
];

function getStudentName(studentID) {
    for (let student of students) {
        if (student.id == studentID) {
            return student.name;
        }
    }
}

var nextStudent = getStudentName(73);

console.log(nextStudent);
// Suzy
```

Let's examine how JS is going to process that program, specifically starting with the first statement. The array and its contents are just basic JS value literals (and thus unaffected by any scoping concerns), so our focus here will be on the `var students = [ .. ]` declaration and initialization-assignment parts.

We typically think of that as a single statement, but that's not how our friend *Engine* sees it. In fact, JS treats these as two distinct operations, one which *Compiler* will handle during compilation, and the other which *Engine* will handle during execution.

The first thing *Compiler* will do with this program is perform lexing to break it down into tokens, which it will then parse into a tree (AST).

Once *Compiler* gets to code generation, there's more detail to consider than may be obvious. A reasonable assumption would be that *Compiler* will produce code for the first statement such as: "Allocate memory for a variable, label it `students`, then stick a reference to the array into that variable." But that's not the whole story.

Here's the steps *Compiler* will follow to handle that statement:

1. Encountering `var students`, *Compiler* will ask *Scope Manager* to see if a variable named `students` already exists for that particular scope bucket. If so, *Compiler* would ignore this declaration and move on. Otherwise, *Compiler* will produce code that (at execution time) asks *Scope Manager* to create a new variable called `students` in that scope bucket.

2. *Compiler* then produces code for *Engine* to later execute, to handle the `students = []` assignment. The code *Engine* runs will first ask *Scope Manager* if there is a variable called `students` accessible in the current scope bucket. If not, *Engine* keeps looking elsewhere (see "Nested Scope" below). Once *Engine* finds a variable, it assigns the reference of the `[ .. ]` array to it.

In conversational form, the first phase of compilation for the program might play out between *Compiler* and *Scope Manager* like this:

> ***Compiler***: Hey, *Scope Manager* (of the global scope), I found a formal declaration for an identifier called `students`, ever heard of it?

> ***(Global) Scope Manager***: Nope, never heard of it, so I just created it for you.

> ***Compiler***: Hey, *Scope Manager*, I found a formal declaration for an identifier called `getStudentName`, ever heard of it?

> ***(Global) Scope Manager***: Nope, but I just created it for you.

> ***Compiler***: Hey, *Scope Manager*, `getStudentName` points to a function, so we need a new scope bucket.

> ***(Function) Scope Manager***: Got it, here's the scope bucket.

> ***Compiler***: Hey, *Scope Manager* (of the function), I found a formal parameter declaration for `studentID`, ever heard of it?

> ***(Function) Scope Manager***: Nope, but now it's created in this scope.

> ***Compiler***: Hey, *Scope Manager* (of the function), I found a `for`-loop that will need its own scope bucket.

> ...

The conversation is a question-and-answer exchange, where **Compiler** asks the current *Scope Manager* if an encountered identifier declaration has already been encountered. If "no," *Scope Manager* creates that variable in that scope. If the answer is "yes," then it's effectively skipped over since there's nothing more for that *Scope Manager* to do.

*Compiler* also signals when it runs across functions or block scopes, so that a new scope bucket and *Scope Manager* can be instantiated.

Later, when it comes to execution of the program, the conversation will shift to *Engine* and *Scope Manager*, and might play out like this:

> ***Engine***: Hey, *Scope Manager* (of the global scope), before we begin, can you look up the identifier `getStudentName` so I can assign this function to it?

> ***(Global) Scope Manager***: Yep, here's the variable.

> ***Engine***: Hey, *Scope Manager*, I found a *target* reference for `students`, ever heard of it?

> ***(Global) Scope Manager***: Yes, it was formally declared for this scope, so here it is.

> ***Engine***: Thanks, I'm initializing `students` to `undefined`, so it's ready to use.

> Hey, *Scope Manager* (of the global scope), I found a *target* reference for `nextStudent`, ever heard of it?

> ***(Global) Scope Manager***: Yes, it was formally declared for this scope, so here it is.

> ***Engine***: Thanks, I'm initializing `nextStudent` to `undefined`, so it's ready to use.

> Hey, *Scope Manager* (of the global scope), I found a *source* reference for `getStudentName`, ever heard of it?

> ***(Global) Scope Manager***: Yes, it was formally declared for this scope. Here it is.

> ***Engine***: Great, the value in `getStudentName` is a function, so I'm going to execute it.

> ***Engine***: Hey, *Scope Manager*, now we need to instantiate the function's scope.

> ...

This conversation is another question-and-answer exchange, where *Engine* first asks the current *Scope Manager* to look up the hoisted `getStudentName` identifier, so as to associate the function with it. *Engine* then proceeds to ask *Scope Manager* about the *target* reference for `students`, and so on.

To review and summarize how a statement like `var students = [ .. ]` is processed, in two distinct steps:

1. *Compiler* sets up the declaration of the scope variable (since it wasn't previously declared in the current scope).

2. While *Engine* is executing, to process the assignment part of the statement, *Engine* asks *Scope Manager* to look up the variable, initializes it to `undefined` so it's ready to use, and then assigns the array value to it.