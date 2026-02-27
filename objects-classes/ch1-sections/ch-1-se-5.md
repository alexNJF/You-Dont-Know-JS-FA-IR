# Assigning Properties

Whether a property is defined at the time of object literal definition, or added later, the assignment of a property value is done with the `=` operator, as any other normal assignment would be:

```js
myObj.favoriteNumber = 123;
```

If the `favoriteNumber` property doesn't already exist, that statement will create a new property of that name and assign its value. But if it already exists, that statement will re-assign its value.

| WARNING: |
| :--- |
| An `=` assignment to a property may fail (silently or throwing an exception), or it may not directly assign the value but instead invoke a *setter* function that performs some operation(s). More details on these behaviors in the next chapter. |

It's also possible to assign one or more properties at once -- assuming the source properties (name and value pairs) are in another object -- using the `Object.assign(..)` (added in ES6) method:

```js
// shallow copy all (owned and enumerable) properties
// from `myObj` into `anotherObj`
Object.assign(anotherObj,myObj);

Object.assign(
    /*target=*/anotherObj,
    /*source1=*/{
        someProp: "some value",
        anotherProp: 1001,
    },
    /*source2=*/{
        yetAnotherProp: false
    }
);
```

`Object.assign(..)` takes the first object as target, and the second (and optionally subsequent) object(s) as source(s). Copying is done in the same manner as described earlier in the "Object Spread" section.