# Closure (بخش ۲)

در این تمرین، دوباره closure را با تعریف ابزار `toggle(..)` که value toggler به ما می‌دهد تمرین می‌کنیم.

یک یا چند مقدار (به عنوان آرگومان) به `toggle(..)` می‌فرستید و تابعی برمی‌گیرید. آن تابع برگشتی به ترتیب بین همه مقادیر فرستاده‌شده به نوبت جابه‌جا می‌شود، هر بار یکی.

```js
function toggle(/* .. */) {
    // ..
}

var hello = toggle("hello");
var onOff = toggle("on","off");
var speed = toggle("slow","medium","fast");

hello();      // "hello"
hello();      // "hello"

onOff();      // "on"
onOff();      // "off"
onOff();      // "on"

speed();      // "slow"
speed();      // "medium"
speed();      // "fast"
speed();      // "slow"
```

مورد گوشه فرستادن هیچ مقداری به `toggle(..)` خیلی مهم نیست؛ چنین نمونه toggler می‌تواند فقط همیشه `undefined` برگرداند.

خودتان تمرین را امتحان کنید، سپس راه‌حل پیشنهادی را در انتهای این پیوست ببینید.
