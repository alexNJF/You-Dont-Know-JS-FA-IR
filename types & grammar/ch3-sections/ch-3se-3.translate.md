# Unboxing

اگر object wrapper دارید و می‌خواهید مقدار primitive زیرین را بیرون بکشید، می‌توانید از متد `valueOf()` استفاده کنید:

```js
var a = new String( "abc" );
var b = new Number( 42 );
var c = new Boolean( true );

a.valueOf(); // "abc"
b.valueOf(); // 42
c.valueOf(); // true
```

Unboxing می‌تواند به‌طور ضمنی هم اتفاق بیفتد، وقتی مقدار object wrapper را طوری به کار می‌برید که به مقدار primitive نیاز است. این فرایند (coercion) در فصل ۴ با جزئیات بیشتر پوشش داده می‌شود، اما به‌طور خلاصه:

```js
var a = new String( "abc" );
var b = a + ""; // `b` مقدار primitive با unbox شده یعنی "abc" را دارد

typeof a; // "object"
typeof b; // "string"
```
