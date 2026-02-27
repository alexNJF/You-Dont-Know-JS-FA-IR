# When Should I Class-Orient My Code?

Class-orientation is a design pattern, which means it's a choice for how you organize the information and behavior in your program. It has pros and cons. It's not a universal solution for all tasks.

So how do you know when you should use classes?

In a theoretical sense, class-orientation is a way of dividing up the business domain of a program into one or more pieces that can each be defined by an "is-a" classification: grouping a thing into the set (or sets) of characteristics that thing shares with other similar things. You would say "X is a Y", meaning X has (at least) all the characteristics of a thing of kind Y.

For example, consider computers. We could say a computer is electrical, since it uses electrical current (voltage, amps, etc) as power. It's furthermore electronic, because it manipulates the electrical current beyond simply routing electrons around (electrical/magnetic fields), creating a meaningful circuit to manipulate the current into performing more complex tasks. By contrast, a basic desk lamp is electrical, but not really electronic.

We could thus define a class `Electrical` to describe what electrical devices need and can do. We could then define a further class `Electronic`, and define that in addition to being electrical, `Electronic` things manipulate electricity to create more specialized outcomes.

Here's where class-orientation starts to shine. Rather than re-define all the `Electrical` characteristics in the `Electronic` class, we can define `Electronic` in such a way that it "shares" or "inherits" those characteristics from `Electrical`, and then augments/redefines the unique behaviors that make a device electronic. This relationship between the two classes -- called "inheritance" -- is a key aspect of class-orientation.

So class-orientation is a way of thinking about the entities our program needs, and classifying them into groupings based on their characteristics (what information they hold, what operations can be performed on that data), and defining the relationships between the different grouping of characteristics.

But moving from the theoretical into in a bit more pragmatic perspective: if your program needs to hold and use multiple collections (instances) of alike data/behavior at once, you *may* benefit from class-orientation.

### Time For An Example

Here's a short illustration.

A couple of decades ago, right after I had gone through nearly all of a Computer Science degree in college, I found myself sitting in my first professional software developer job. I was tasked with building, all by myself, a timesheet and payroll tracking system. I built the backend in PHP (using MySQL for the DB) and used JS for the interface (early as it was in its maturity way back around the turn of the century).

Since my CS degree had emphasized class-orientation heavily throughout my courses, I was eager to put all that theory to work. For my program's design, I defined the concept of a "timesheet" entity as a collection of 2-3 "week" entities, and each "week" as a collection of 5-7 "day" entities, and each "day" as a collection of "task" entities.

If I wanted to know how many hours were logged into a timesheet instance, I could call a `totalTime()` operation on that instance. The timesheet defined this operation by looping over its collection of weeks, calling `totalTime()` on each of them and summing the values. Each week did the same for all its days, and each day did the same for all its tasks.

The notion being illustrated here, one of the fundamentals of design patterns like class-orientation, is called *encapsulation*. Each entity level encapsulated (e.g., controlled, hid, abstracted) internal details (data and behavior) while presenting a useful external interface.

But encapsulation alone isn't a sufficient justification for class-orientation. Other design patterns offer sufficient encapsulation.

How did my class design take advantage of inheritance? I had a base class that defined a set of operations like `totalTime()`, and each of my entity class types extended/subclassed this base class. That meant that each of them inherited this summation-of-total-time capability, but where each of them applied their own extensions and definitions for the internal details of *how* to do that work.

There's yet another aspect of the design pattern at play, which is *composition*: each entity was defined as a collection of other entities.

### Single vs Multiple

I mentioned above that a pragmatic way of deciding if you need class-orientation is if your program is going to have multiple instances of a single kind/type of behavior (aka, "class"). In the timesheet example, we had 4 classes: Timesheet, Week, Day, and Task. But for each class, we had multiple instances of each at once.

Had we instead only needed a single instance of a class, like just one `Computer` thing that was an instance of the `Electronic` class, which was a subclass of the `Electrical` class, then class-orientation may not offer quite as much benefit. In particular, if the program doesn't need to create an instance of the `Electrical` class, then there's no particular benefit to separating `Electrical` from `Electronic`, so we aren't really getting any help from the inheritance aspect of class-orientation.

So, if you find yourself designing a program by dividing up a business problem domain into different "classes" of entities, but in the actual code of the program you are only ever need one concrete *thing* of one kind/definition of behavior (aka, "class"), you might very well not actually need class-orientation. There are other design patterns which may be a more efficient match to your effort.

But if you find yourself wanting to define classes, and subclasses which inherit from them, and if you're going to be instantiating one or more of those classes multiple times, then class-orientation is a good candidate. And to do class-orientation in JS, you're going to need the `class` keyword.