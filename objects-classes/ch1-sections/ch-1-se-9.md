# Containers Are Collections Of Properties

The most common usage of objects is as containers for multiple values. We create and manage property container objects by:

* defining properties (named locations), either at object creation time or later
* assigning values, either at object creation time or later
* accessing values later, using the location names (property names)
* deleting properties via `delete`
* determining container contents with `in`, `hasOwnProperty(..)` / `hasOwn(..)`, `Object.entries(..)` / `Object.keys(..)`, etc

But there's a lot more to objects than just static collections of property names and values. In the next chapter, we'll dive under the hood to look at how they actually work.

[^structuredClone]: "Structured Clone Algorithm", HTML Specification; https://html.spec.whatwg.org/multipage/structured-data.html#structured-cloning ; Accessed July 2022