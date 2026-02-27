# ویژگی‌های شیء

علاوه بر تعریف رفتارها برای ویژگی‌های خاص، رفتارهای خاصی در کل شیء قابل پیکربندی هستند:

* extensible
* sealed
* frozen

### Extensible

قابلیت گسترش به این اشاره دارد که آیا شیء می‌تواند ویژگی‌های جدید تعریف/اضافه شود. به‌طور پیش‌فرض، همهٔ اشیاء extensible هستند، اما می‌توانید extensibility را برای شیء خاموش کنید:

```js
myObj = {
    favoriteNumber: 42
};

myObj.firstName = "Kyle";                  // درست کار می‌کند

Object.preventExtensions(myObj);

myObj.nicknames = [ "getify", "ydkjs" ];   // شکست می‌خورد
myObj.favoriteNumber = 123;                // درست کار می‌کند
```

در حالت non-strict، انتسابی که ویژگی جدید ایجاد می‌کند ساکت شکست می‌خورد، در حالی که در حالت strict exception پرتاب می‌شود.

### Sealed

// TODO

### Frozen

// TODO
