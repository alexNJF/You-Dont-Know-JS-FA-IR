# Determining Container Contents

You can determine an object's contents in a variety of ways. To ask an object if it has a specific property:

```js
myObj = {
    favoriteNumber: 42,
    coolFact: "the first person convicted of speeding was going 8 mph",
    beardLength: undefined,
    nicknames: [ "getify", "ydkjs" ]
};

"favoriteNumber" in myObj;            // true

myObj.hasOwnProperty("coolFact");     // true
myObj.hasOwnProperty("beardLength");  // true

myObj.nicknames = undefined;
myObj.hasOwnProperty("nicknames");    // true

delete myObj.nicknames;
myObj.hasOwnProperty("nicknames");    // false
```

There *is* an important difference between how the `in` operator and the `hasOwnProperty(..)` method behave. The `in` operator will check not only the target object specified, but if not found there, it will also consult the object's `[[Prototype]]` chain (covered in the next chapter). By contrast, `hasOwnProperty(..)` only consults the target object.

If you're paying close attention, you may have noticed that `myObj` appears to have a method property called `hasOwnProperty(..)` on it, even though we didn't define such. That's because `hasOwnProperty(..)` is defined as a built-in on `Object.prototype`, which by default is "inherited by" all normal objects. There is risk inherent to accessing such an "inherited" method, though. Again, more on prototypes in the next chapter.

### Better Existence Check

ES2022 (almost official at time of writing) has already settled on a new feature, `Object.hasOwn(..)`. It does essentially the same thing as `hasOwnProperty(..)`, but it's invoked as a static helper external to the object value instead of via the object's `[[Prototype]]`, making it safer and more consistent in usage:

```js
// instead of:
myObj.hasOwnProperty("favoriteNumber")

// we should now prefer:
Object.hasOwn(myObj,"favoriteNumber")
```

Even though (at time of writing) this feature is just now emerging in JS, there are polyfills that make this API available in your programs even when running in a previous JS environment that doesn't yet have the feature defined. For example, a quick stand-in polyfill sketch:

```js
// simple polyfill sketch for `Object.hasOwn(..)`
if (!Object.hasOwn) {
    Object.hasOwn = function hasOwn(obj,propName) {
        return Object.prototype.hasOwnProperty.call(obj,propName);
    };
}
```

Including a polyfill patch such as that in your program means you can safely start using `Object.hasOwn(..)` for property existence checks no matter whether a JS environment has `Object.hasOwn(..)` built in yet or not.

### Listing All Container Contents

We already discussed the `Object.entries(..)` API earlier, which tells us what properties an object has (as long as they're enumerable -- more in the next chapter).

There's a variety of other mechanisms available, as well. `Object.keys(..)` gives us list of the enumerable property names (aka, keys) in an object -- names only, no values; `Object.values(..)` instead gives us list of all values held in enumerable properties.

But what if we wanted to get *all* the keys in an object (enumerable or not)? `Object.getOwnPropertyNames(..)` seems to do what we want, in that it's like `Object.keys(..)` but also returns non-enumerable property names. However, this list **will not** include any Symbol property names, as those are treated as special locations on the object. `Object.getOwnPropertySymbols(..)` returns all of an object's Symbol properties. So if you concatenate both of those lists together, you'd have all the direct (*owned*) contents of an object.

Yet as we've implied several times already, and will cover in full detail in the next chapter, an object can also "inherit" contents from its `[[Prototype]]` chain. These are not considered *owned* contents, so they won't show up in any of these lists.

Recall that the `in` operator will potentially traverse the entire chain looking for the existence of a property. Similarly, a `for..in` loop will traverse the chain and list any enumerable (owned or inherited) properties. But there's no built-in API that will traverse the whole chain and return a list of the combined set of both *owned* and *inherited* contents.