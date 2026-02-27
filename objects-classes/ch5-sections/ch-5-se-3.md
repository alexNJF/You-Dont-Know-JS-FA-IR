# Ditching Class Thinking

Quite frankly, the *deconstruction* we just went through only ends up in slightly different, and maybe slightly better or slightly worse, code as compared to the `class` style. If that's all delegation was about, it probably wouldn't even be useful enough for more than a footnote, much less a whole chapter.

But here's where we're going to really start pushing the class-oriented thinking itself, not just the syntax, aside.

Class-oriented design inherently creates a hierarchy of *classification*, meaning how we divide up and group characteristics, and then stack them vertically in an inheritance chain. Moreover, defining a subclass is a specialization of the generalized base class. Instantiating is a specialization of the generalized class.

Behavior in a traditional class hierarchy is a vertical composition through the layers of the inheritance chain. Attempts have been made over the decades, and even become rather popular at times, to flatten out deep hierarchies of inheritance, and favor a more horizontal composition through *mixins* and related ideas.

I'm not asserting there's anything wrong with those ways of approaching code. But I am saying that they aren't *naturally* how JS works, so adopting them in JS has been a long, winding, complicated road, and has variously accreted lots of nuanced syntax to retrofit on top of JS's core `[[Prototype]]` and `this` pillar.

For the rest of this chapter, I intend to discard both the syntax of `class` *and* the thinking of *class*.