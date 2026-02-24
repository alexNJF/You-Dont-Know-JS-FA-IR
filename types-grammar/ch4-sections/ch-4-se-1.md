## Coercion: Explicit vs Implicit

Some developers assert that when you explicitly indicate a type change in an operation, this doesn't qualify as a *coercion* but just a type-cast or type-conversion. In other words, the claim is that coercion is only implicit.

I disagree with this characterization. I use *coercion* to label any type conversion in a dynamically-typed language, whether it's plainly obvious in the code or not. Here's why: the line between *explicit* and *implicit* is not clear and objective, it's fairly subjective. If you think a type conversion is implicit (and thus *coercion*), but I think it's explicit (and thus not a *coercion*), the distinction becomes irrelevant.

Keep that subjectivity in mind as we explore various *explicit* and *implicit* forms of coercion. In fact, here's a spoiler: most of the coercions could be argued as either, so we'll be looking at them with such balanced perspective.

### Implicit: Bad or ...?

An extremely common opinion among JS developers is that *coercion is bad*, specifically, that *implicit coercion is bad*; the rise in popularity of type-aware tooling like TypeScript speaks loudly to this sentiment.

But that feeling is not new. 14+ years ago, Douglas Crockford's book "The Good Parts" also famously decried *implicit coercion* as one of the *bad parts*. Even Brendan Eich, creator of JS, regularly claims that *implicit coercion* was a mistake[^EichCoercion] in the early design of the language that he now regrets.

If you've been around JS for more than a few months, you've almost certainly heard these opinions voiced strongly and predominantly. And if you've been around JS for years or more, you probably have your mind already made up.

In fact, I think you'd be hard pressed to name hardly any other well-known source of JS teaching that strongly endorses coercion (in virtually all its forms); I do -- and this book definitely does! -- but I feel mostly like a lone voice shouting futilely in the wilderness.

However, here's an observation I've made over the years: most of the folks who publicly condemn *implicit coercion*, actually use *implicit coercion* in their own code. Hmmmm...

Douglas Crockford says to avoid the mistake of *implicit coercion*[^CrockfordCoercion], but his code uses `if (..)` statements with non-boolean values evaluated. [^CrockfordIfs] Many have dismissed my pointing that out in the past, with the claim that conversion-to-boolean isn't *really* coercion. Ummm... ok?

Brendan Eich says he regrets *implicit coercion*, but yet he openly endorses[^BrendanToString] idioms like `x + ""` (and others!) to coerce the value in `x` to a string (we'll cover this later); and that's most definitely an *implicit coercion*.

So what do we make of this dissonance? Is it merely a, "do as I say, not as I do" minor self-contradiction? Or is there more to it?

I am not going to pass a final judgement here yet, but I want you the reader to deeply ponder that question, as you continue throughout this chapter and book.
