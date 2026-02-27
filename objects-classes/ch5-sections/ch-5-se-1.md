# Preamble

Before we begin looking at delegation, I want to offer a word of caution. This perspective on JS's object `[[Prototype]]` and `this` function context mechanisms is *not* mainstream. It's *not* how framework authors and libraries utilize JS. You won't, to my knowledge, find any big apps out there using this pattern.

So why on earth would I devote a chapter to such a pattern, if it's so unpopular?

Good question. The cheeky answer is: because it's my book and I can do what I feel like!

But the deeper answer is, because I think developing *this* understanding of one of the language's core pillars helps you *even if* all you ever do is use `class`-style JS patterns.

To be clear, delegation is not my invention. It's been around as a design pattern for decades. And for a long time, developers argued that prototypal delegation was *just* the dynamic form of inheritance.[^TreatyOfOrlando] But I think that was a mistake to conflate the two.[^ClassVsPrototype]

For the purposes of this chapter, I'm going to present delegation, as implemented via JS mechanics, as an alternative design pattern, positioned somewhere between class-orientation and object-closure/module patterns.

The first step is to *de-construct* the `class` mechanism down to its individual parts. Then we'll cherry-pick and mix the parts a bit differently.