# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 5: The (Not So) Secret Lifecycle of Variables

By now you should have a decent grasp of the nesting of scopes, from the global scope downward—called a program's scope chain.

But just knowing which scope a variable comes from is only part of the story. If a variable declaration appears past the first statement of a scope, how will any references to that identifier *before* the declaration behave? What happens if you try to declare the same variable twice in a scope?

JS's particular flavor of lexical scope is rich with nuance in how and when variables come into existence and become available to the program.