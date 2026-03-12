# WeakSetها

در حالی‌که WeakMap کلیدهایش را weak نگه می‌دارد (ولی مقدارها را strong)، WeakSet مقدارهایش را weak نگه می‌دارد (اینجا عملاً کلیدی وجود ندارد).

```js
var s = new WeakSet();

var x = { id: 1 },
	y = { id: 2 };

s.add( x );
s.add( y );

x = null;						// `x` is GC-eligible
y = null;						// `y` is GC-eligible
```

**هشدار:** مقدارهای WeakSet باید آبجکت باشند، نه primitive؛ برخلاف set معمولی که primitive هم می‌پذیرد.
