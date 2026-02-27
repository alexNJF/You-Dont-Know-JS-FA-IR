# Encapsulation and Least Exposure (POLE)

Encapsulation is often cited as a principle of object-oriented (OO) programming, but it's more fundamental and broadly applicable than that. The goal of encapsulation is the bundling or co-location of information (data) and behavior (functions) that together serve a common purpose.

Independent of any syntax or code mechanisms, the spirit of encapsulation can be realized in something as simple as using separate files to hold bits of the overall program with common purpose. If we bundle everything that powers a list of search results into a single file called "search-list.js", we're encapsulating that part of the program.

The recent trend in modern front-end programming to organize applications around Component architecture pushes encapsulation even further. For many, it feels natural to consolidate everything that constitutes the search results list—even beyond code, including presentational markup and styling—into a single unit of program logic, something tangible we can interact with. And then we label that collection the "SearchList" component.

Another key goal is the control of visibility of certain aspects of the encapsulated data and functionality. Recall from Chapter 6 the *least exposure* principle (POLE), which seeks to defensively guard against various *dangers* of scope over-exposure; these affect both variables and functions. In JS, we most often implement visibility control through the mechanics of lexical scope.

The idea is to group alike program bits together, and selectively limit programmatic access to the parts we consider *private* details. What's not considered *private* is then marked as *public*, accessible to the whole program.

The natural effect of this effort is better code organization. It's easier to build and maintain software when we know where things are, with clear and obvious boundaries and connection points. It's also easier to maintain quality if we avoid the pitfalls of over-exposed data and functionality.

These are some of the main benefits of organizing JS programs into modules.