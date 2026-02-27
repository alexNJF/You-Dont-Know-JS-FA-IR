# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 4: This Works

| NOTE: |
| :--- |
| Work in progress |

We've seen the `this` keyword used quite a bit so far, but haven't really dug in to understand exactly how it works in JS. It's time we do so.

But to properly understand `this` in JS, you need to set aside any preconceptions you may have, especially assumptions from how `this` works in other programming languages you may have experience in.

Here's the most important thing to understand about `this`: the determination of what value (usually, object) `this` points at is not made at author time, but rather determined at runtime. That means you cannot simply look at a `this`-aware function (even a method in a `class` definition) and know for sure what `this` will hold while that function runs.

Instead, you have to find each place the function is invoked, and look at *how* it's invoked (not even *where* matters). That's the only way to fully answer what `this` will point to.

In fact, a single `this`-aware function can be invoked at least four different ways, and any of those approaches will end up assigning a different `this` for that particular function invocation.

So the typical question we might ask when reading code -- "What does `this` point to the function?" -- is not actually a valid question. The question you really have to ask is, "When the function is invoked a certain way, what `this` will be assigned for that invocation?"

If your brain is already twisting around just reading this chapter intro... good! Settle in for a rewiring of how you think about `this` in JS.