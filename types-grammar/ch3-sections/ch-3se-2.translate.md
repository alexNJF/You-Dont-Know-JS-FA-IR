## Plain Objects

نوع مقدار شیء عمومی گاهی *plain ol' javascript objects* (POJOs) نامیده می‌شود.

Plain objects شکل literal دارند:

```js
address = {
    street: "12345 Market St",
    city: "San Francisco",
    state: "CA",
    zip: "94114"
};
```

این plain object (POJO)، همان‌طور که با آکلادهای `{ .. }` تعریف شده، مجموعه‌ای از ویژگی‌های نام‌دار (`street`، `city`، `state` و `zip`) است. ویژگی‌ها می‌توانند هر مقادیری را نگه دارند، primitives یا اشیاء دیگر (از جمله آرایه‌ها، توابع، و غیره).

همان شیء را می‌شد با constructorٔ `new Object()` به‌صورت دستوری هم تعریف کرد:

```js
address = new Object();
address.street = "12345 Market St";
address.city = "San Francisco";
address.state = "CA";
address.zip = "94114";
```

Plain objects به‌طور پیش‌فرض به `Object.prototype` با `[[Prototype]]` پیوند دارند و دسترسی تفویض‌شده به چند متد شیء عمومی می‌دهند، مثل:

* `toString()` / `toLocaleString()`
* `valueOf()`
* `isPrototypeOf(..)`
* `hasOwnProperty(..)` (اخیراً منسوخ شده — جایگزین: ابزار استاتیک `Object.hasOwn(..)`)
* `propertyIsEnumerable(..)`
* `__proto__` (تابع getter)

```js
address.isPrototypeOf(Object.prototype);    // true
address.isPrototypeOf({});                  // false
```
