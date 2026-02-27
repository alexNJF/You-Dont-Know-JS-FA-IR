# Classic Module Variations

Chapter 8 explained the classic module pattern, which can look like this:

```js
var StudentList = (function defineModule(Student){
    var elems = [];

    var publicAPI = {
        renderList() {
            // ..
        }
    };

    return publicAPI;

})(Student);
```

Notice that we're passing `Student` (another module instance) in as a dependency. But there's lots of useful variations on this module form you may encounter. Some hints for recognizing these variations:

* Does the module know about its own API?
* Even if we use a fancy module loader, it's just a classic module
* Some modules need to work universally

### Where's My API?

First, most classic modules don't define and use a `publicAPI` the way I have shown in this code. Instead, they typically look like:

```js
var StudentList = (function defineModule(Student){
    var elems = [];

    return {
        renderList() {
            // ..
        }
    };

})(Student);
```

The only difference here is directly returning the object that serves as the public API for the module, as opposed to first saving it to an inner `publicAPI` variable. This is by far how most classic modules are defined.

But I strongly prefer, and always use myself, the former `publicAPI` form. Two reasons:

* `publicAPI` is a semantic descriptor that aids readability by making it more obvious what the purpose of the object is.

* Storing an inner `publicAPI` variable that references the same external public API object returned, can be useful if you need to access or modify the API during the lifetime of the module.

    For example, you may want to call one of the publicly exposed functions, from inside the module. Or, you may want to add or remove methods depending on certain conditions, or update the value of an exposed property.

    Whatever the case may be, it just seems rather silly to me that we *wouldn't* maintain a reference to access our own API. Right?

### Asynchronous Module Definition (AMD)

Another variation on the classic module form is AMD-style modules (popular several years back), such as those supported by the RequireJS utility:

```js
define([ "./Student" ],function StudentList(Student){
    var elems = [];

    return {
        renderList() {
            // ..
        }
    };
});
```

If you look closely at `StudentList(..)`, it's a classic module factory function. Inside the machinery of `define(..)` (provided by RequireJS), the `StudentList(..)` function is executed, passing to it any other module instances declared as dependencies. The return value is an object representing the public API for the module.

This is based on exactly the same principles (including how the closure works!) as we explored with classic modules.

### Universal Modules (UMD)

The final variation we'll look at is UMD, which is less a specific, exact format and more a collection of very similar formats. It was designed to create better interop (without any build-tool conversion) for modules that may be loaded in browsers, by AMD-style loaders, or in Node. I personally still publish many of my utility libraries using a form of UMD.

Here's the typical structure of a UMD:

```js
(function UMD(name,context,definition){
    // loaded by an AMD-style loader?
    if (
        typeof define === "function" &&
        define.amd
    ) {
        define(definition);
    }
    // in Node?
    else if (
        typeof module !== "undefined" &&
        module.exports
    ) {
        module.exports = definition(name,context);
    }
    // assume standalone browser script
    else {
        context[name] = definition(name,context);
    }
})("StudentList",this,function DEF(name,context){

    var elems = [];

    return {
        renderList() {
            // ..
        }
    };

});
```

Though it may look a bit unusual, UMD is really just an IIFE.

What's different is that the main `function` expression part (at the top) of the IIFE contains a series of `if..else if` statements to detect which of the three supported environments the module is being loaded in.

The final `()` that normally invokes an IIFE is being passed three arguments: `"StudentsList"`, `this`, and another `function` expression. If you match those arguments to their parameters, you'll see they are: `name`, `context`, and `definition`, respectively. `"StudentList"` (`name`) is the name label for the module, primarily in case it's defined as a global variable. `this` (`context`) is generally the `window` (aka, global object; see Chapter 4) for defining the module by its name.

`definition(..)` is invoked to actually retrieve the definition of the module, and you'll notice that, sure enough, that's just a classic module form!

There's no question that as of the time of this writing, ESM (ES Modules) are becoming popular and widespread rapidly. But with millions and millions of modules written over the last 20 years, all using some pre-ESM variation of classic modules, they're still very important to be able to read and understand when you come across them.

[^fowlerIOC]: *Inversion of Control*, Martin Fowler, https://martinfowler.com/bliki/InversionOfControl.html, 26 June 2005.