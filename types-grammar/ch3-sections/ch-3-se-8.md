## Proposed: Records/Tuples

At the time of this writing, a (stage-2) proposal[^RecordsTuplesProposal] exists to add a new set of features to JS, which correspond closely to plain objects and arrays, but with some notable differences.

Records are similar to plain objects, but are immutable (sealed, read-only), and (unlike objects) are treated as primitive values, for the purposes of value assignment and equality comparison. The syntax difference is a `#` before the `{ }` delimiter. Records can only contain primitive values (including records and tuples).

Tuples have exactly the same relationship, but to arrays, including the `#` before the `[ ]` delimiters.

It's important to note that while these look and seem like objects/arrays, they are indeed primitive (non-object) values.

[^FundamentalObjects]: "20 Fundamental Objects", EcamScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-fundamental-objects ; Accessed August 2022

[^AutoBoxing]: "6.2.4.6 PutValue(V,W)", Step 5.a, ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-putvalue ; Accessed August 2022

[^RecordsTuplesProposal]: "JavaScript Records & Tuples Proposal"; Robin Ricard, Rick Button, Nicolò Ribaudo;
https://github.com/tc39/proposal-record-tuple ; Accessed August 2022
