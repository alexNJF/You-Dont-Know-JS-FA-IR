# Reserved Words

مشخصات ES5 در بخش ۷.۶.۱ مجموعه‌ای از «reserved words» تعریف می‌کند که نمی‌توانند به‌عنوان نام متغیر مستقل به کار روند. از نظر فنی چهار دسته هست: «keywords»، «future reserved words»، literal `null` و literalهای boolean یعنی `true`/`false`.

Keywords آن‌های واضح مثل `function` و `switch`‌اند. Future reserved words چیزهایی مثل `enum` را شامل می‌شود، هرچند بقیهٔ آن‌ها (`class`، `extends` و غیره) الان در ES6 واقعاً استفاده می‌شوند؛ کلمات کلیدی فقط حالت strict مثل `interface` هم هست.

کاربر StackOverflow با نام «art4theSould» با خلاقیت همهٔ این reserved words را در یک شعر کوچک سرگرم‌کننده کار کرد (http://stackoverflow.com/questions/26255/reserved-keywords-in-javascript/12114140#12114140):

> Let this long package float,
> Goto private class if short.
> While protected with debugger case,
> Continue volatile interface.
> Instanceof super synchronized throw,
> Extends final export throws.
>
> Try import double enum?
> - False, boolean, abstract function,
> Implements typeof transient break!
> Void static, default do,
> Switch int native new.
> Else, delete null public var
> In return for const, true, char
> …Finally catch byte.

| NOTE: |
| :--- |
| این شعر کلماتی را شامل می‌شود که در ES3 رزرو بودند (`byte`، `long` و غیره) و از ES5 به بعد دیگر رزرو نیستند. |

قبل از ES5، reserved words همچنین نمی‌توانستند نام property یا کلید در object literalها باشند، اما آن محدودیت دیگر وجود ندارد.

پس، این مجاز نیست:

```js
var import = "42";
```

اما این مجاز است:

```js
var obj = { import: "42" };
console.log( obj.import );
```

با این حال باید آگاه باشید که بعضی نسخه‌های قدیمی‌تر مرورگر (عمدتاً IE قدیمی) در اعمال این قواعد کاملاً یکدست نبودند، پس جاهایی هست که استفاده از reserved words در محل نام property هنوز می‌تواند مشکل ایجاد کند. همهٔ محیط‌های مرورگر پشتیبانی‌شده را با دقت تست کنید.
