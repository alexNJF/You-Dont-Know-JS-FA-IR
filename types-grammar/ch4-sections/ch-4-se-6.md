## What's Left?

I hope by now you're feeling a lot more informed about how JS's type system works, from primitive value types to the object types, to how type coercions are performed by the engine.

More importantly, you also now have a much more complete picture of the pros/cons of the choices we make using JS's type system, such as choosing *implicit* or *explicit* coercions at different points.

But we haven't fully covered the context in which the type system operates. For the remainder of this book, we'll turn our attention to the syntax/grammar rules of JS that govern how operators and statements behave.

[^EichCoercion]: "The State of JavaScript - Brendan Eich", comment thread, Hacker News; Oct 9 2012; https://news.ycombinator.com/item?id=4632704 ; Accessed August 2022

[^CrockfordCoercion]: "JavaScript: The World's Most Misunderstood Programming Language"; 2001; https://www.crockford.com/javascript/javascript.html ; Accessed August 2022

[^CrockfordIfs]: "json2.js", Github; Apr 21 2018; https://github.com/douglascrockford/JSON-js/blob/8e8b0407e475e35942f7e9461dab81929fcc7321/json2.js#L336 ; Accessed August 2022

[^BrendanToString]: ESDiscuss mailing list; Aug 26 2014; https://esdiscuss.org/topic/string-symbol#content-15 ; Accessed August 2022

[^AbstractOperations]: "7.1 Type Conversion", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-type-conversion ; Accessed August 2022

[^ToBoolean]: "7.1.2 ToBoolean(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-toboolean ; Accessed August 2022

[^ExoticFalsyObjects]: "B.3.6 The [[IsHTMLDDA]] Internal Slot", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-IsHTMLDDA-internal-slot ; Accessed August 2022

[^OrdinaryToPrimitive]: "7.1.1.1 OrdinaryToPrimitive(O,hint)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-ordinarytoprimitive ; Accessed August 2022

[^ToString]: "7.1.17 ToString(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tostring ; Accessed August 2022

[^StringConstructor]: "22.1.1 The String Constructor", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-string-constructor ; Accessed August 2022

[^StringFunction]: "22.1.1.1 String(value)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-string-constructor-string-value ; Accessed August 2022

[^ToNumber]: "7.1.4 ToNumber(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tonumber ; Accessed August 2022

[^ToNumeric]: "7.1.3 ToNumeric(argument)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-tonumeric ; Accessed August 2022

[^NumberConstructor]: "21.1.1 The Number Constructor", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-number-constructor ; Accessed August 2022

[^NumberFunction]: "21.1.1.1 Number(value)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-number-constructor-number-value ; Accessed August 2022

[^SameValue]: "7.2.11 SameValue(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-samevalue ; Accessed August 2022

[^StrictEquality]: "7.2.16 IsStrictlyEqual(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-isstrictlyequal ; Accessed August 2022

[^LooseEquality]: "7.2.15 IsLooselyEqual(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-islooselyequal ; Accessed August 2022

[^NumericAbstractOps]: "6.1.6 Numeric Types", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types ; Accessed August 2022

[^NumberEqual]: "6.1.6.1.13 Number:equal(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types-number-equal ; Accessed August 2022

[^BigIntEqual]: "6.1.6.2.13 BigInt:equal(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-numeric-types-bigint-equal ; Accessed August 2022

[^LessThan]: "7.2.14 IsLessThan(x,y,LeftFirst)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-islessthan ; Accessed August 2022

[^StringPrefix]: "7.2.9 IsStringPrefix(p,q)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-isstringprefix ; Accessed August 2022

[^SymbolString]: "String(symbol)", ESDiscuss mailing list; Aug 12 2014; https://esdiscuss.org/topic/string-symbol ; Accessed August 2022

[^ASMjs]: "ASM.js - Working Draft"; Aug 18 2014; http://asmjs.org/spec/latest/ ; Accessed August 2022

[^TSExample1]: "TypeScript Playground"; https://tinyurl.com/ydkjs-ts-example-1 ; Accessed August 2022

[^TSExample2]: "TypeScript Playground"; https://tinyurl.com/ydkjs-ts-example-2 ; Accessed August 2022

[^TSLiteralTypes]: "TypeScript 4.1, Template Literal Types"; https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#template-literal-types ; Accessed August 2022
