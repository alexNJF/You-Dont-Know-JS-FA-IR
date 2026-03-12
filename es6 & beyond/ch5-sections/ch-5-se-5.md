# WeakSets

Whereas a WeakMap holds its keys weakly (but its values strongly), a WeakSet holds its values weakly (there aren't really keys).

```js
var s = new WeakSet();

var x = { id: 1 },
	y = { id: 2 };

s.add( x );
s.add( y );

x = null;						// `x` is GC-eligible
y = null;						// `y` is GC-eligible
```

**Warning:** WeakSet values must be objects, not primitive values as is allowed with sets.
