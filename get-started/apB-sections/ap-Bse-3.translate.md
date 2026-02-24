# تمرین Prototypeها

در نهایت، روی `this` و اشیاء لینک‌شده از طریق prototype (فصل ۴، ستون ۲) کار کنیم.

یک ماشین اسلات با سه reel تعریف کنید که هر کدام می‌توانند به‌طور جداگانه `spin()` کنند، و سپس `display()` محتوای فعلی همهٔ reelها را نشان دهند.

رفتار پایهٔ یک reel واحد در object `reel` زیر تعریف شده. اما ماشین اسلات به reelهای جداگانه نیاز دارد—اشیائی که به `reel` delegate می‌کنند، و هر کدام property `position` دارند.

یک reel فقط *می‌داند چطور* نماد slot فعلیش را `display()` کند، اما ماشین اسلات معمولاً سه نماد در هر reel نشان می‌دهد: slot فعلی (`position`)، یک slot بالاتر (`position - 1`)، و یک slot پایین‌تر (`position + 1`). پس نمایش ماشین اسلات باید در نهایت یک grid ۳×۳ از نمادهای slot نمایش دهد.

```js
function randMax(max) {
    return Math.trunc(1E9 * Math.random()) % max;
}

var reel = {
    symbols: [
        "♠", "♥", "♦", "♣", "☺", "★", "☾", "☀"
    ],
    spin() {
        if (this.position == null) {
            this.position = randMax(
                this.symbols.length - 1
            );
        }
        this.position = (
            this.position + 100 + randMax(100)
        ) % this.symbols.length;
    },
    display() {
        if (this.position == null) {
            this.position = randMax(
                this.symbols.length - 1
            );
        }
        return this.symbols[this.position];
    }
};

var slotMachine = {
    reels: [
        // این ماشین اسلات به ۳ reel جداگانه نیاز دارد
        // hint: Object.create(..)
    ],
    spin() {
        this.reels.forEach(function spinReel(reel){
            reel.spin();
        });
    },
    display() {
        // TODO
    }
};

slotMachine.spin();
slotMachine.display();
// ☾ | ☀ | ★
// ☀ | ♠ | ☾
// ♠ | ♥ | ☀

slotMachine.spin();
slotMachine.display();
// ♦ | ♠ | ♣
// ♣ | ♥ | ☺
// ☺ | ♦ | ★
```

ابتدا خودتان حل کنید.

راهنماها:

* از عملگر `%` modulo برای wrap کردن `position` هنگام دسترسی دایره‌ای به symbolها حول یک reel استفاده کنید.

* از `Object.create(..)` برای ایجاد object و prototype-link کردن آن به object دیگر استفاده کنید. وقتی لینک شد، delegation به اشیاء اجازه می‌دهد context `this` را در حین فراخوانی متد به اشتراک بگذارند.

* به‌جای تغییر مستقیم object reel برای نشان دادن هر یک از سه موقعیت، می‌توانید از object موقت دیگری (`Object.create(..)` دوباره) با `position` خودش برای delegate کردن استفاده کنید.

وقتی کدی دارید که کار می‌کند، راه‌حل(های) خود را با کد «Suggested Solutions» در انتهای این پیوست *مقایسه* کنید.
