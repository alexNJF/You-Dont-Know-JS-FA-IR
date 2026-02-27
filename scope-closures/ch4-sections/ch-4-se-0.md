# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 4: Around the Global Scope

Chapter 3 mentioned the "global scope" several times, but you may still be wondering why a program's outermost scope is all that important in modern JS. The vast majority of work is now done inside of functions and modules rather than globally.

Is it good enough to just assert, "Avoid using the global scope," and be done with it?

The global scope of a JS program is a rich topic, with much more utility and nuance than you would likely assume. This chapter first explores how the global scope is (still) useful and relevant to writing JS programs today, then looks at differences in where and *how to access* the global scope in different JS environments.

Fully understanding the global scope is critical in your mastery of using lexical scope to structure your programs.