# مثال کلاس

خب، چند ویژگی کلاس پراکنده را laid out کردیم. می‌خواهم این فصل را با تلاش برای تصویرسازی نمونه‌ای از این قابلیت‌ها در یک مثال واحد که کمی کمتر basic/contrived است جمع‌بندی کنم.

```js
class CalendarItem {
    static #UNSET = Symbol("unset")
    static #isUnset(v) {
        return v === this.#UNSET;
    }
    static #error(num) {
        return this[`ERROR_${num}`];
    }
    static {
        for (let [idx,msg] of [
            "ID is already set.",
            "ID is unset.",
            "Don't instantiate 'CalendarItem' directly.",
        ].entries()) {
            this[`ERROR_${(idx+1)*100}`] = msg;
        }
    }
    static isSameItem(item1,item2) {
        if (#ID in item1 && #ID in item2) {
            return item1.#ID === item2.#ID;
        }
        else {
            return false;
        }
    }

    #ID = CalendarItem.#UNSET
    #setID(id) {
        if (CalendarItem.#isUnset(this.#ID)) {
            this.#ID = id;
        }
        else {
            throw new Error(CalendarItem.#error(100));
        }
    }

    description = null
    startDateTime = null

    constructor() {
        if (new.target !== CalendarItem) {
            let id = Math.round(Math.random() * 1e9);
            this.#setID(id);
        }
        else {
            throw new Error(CalendarItem.#error(300));
        }
    }
    getID() {
        if (!CalendarItem.#isUnset(this.#ID)) {
            return this.#ID;
        }
        else {
            throw new Error(CalendarItem.#error(200));
        }
    }
    getDateTimeStr() {
        if (this.startDateTime instanceof Date) {
            return this.startDateTime.toUTCString();
        }
    }
    summary() {
        console.log(`(${
            this.getID()
        }) ${
            this.description
        } at ${
            this.getDateTimeStr()
        }`);
    }
}

class Reminder extends CalendarItem {
    #complete = false;  // <-- no ASI, semicolon needed

    [Symbol.toStringTag] = "Reminder"
    constructor(description,startDateTime) {
        super();

        this.description = description;
        this.startDateTime = startDateTime;
    }
    isComplete() {
        return !!this.#complete;
    }
    markComplete() {
        this.#complete = true;
    }
    summary() {
        if (this.isComplete()) {
            console.log(`(${this.getID()}) Complete.`);
        }
        else {
            super.summary();
        }
    }
}

class Meeting extends CalendarItem {
    #getEndDateTimeStr() {
        if (this.endDateTime instanceof Date) {
            return this.endDateTime.toUTCString();
        }
    }

    endDateTime = null;  // <-- no ASI, semicolon needed

    [Symbol.toStringTag] = "Meeting"
    constructor(description,startDateTime,endDateTime) {
        super();

        this.description = description;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
    }
    getDateTimeStr() {
        return `${
            super.getDateTimeStr()
        } - ${
            this.#getEndDateTimeStr()
        }`;
    }
}
```

چند لحظه وقت بگذارید و آن تعاریف `class` را بخوانید و هضم کنید. آیا اکثر ویژگی‌های `class` را که در این فصل بحث کردیم دیدید؟

| NOTE: |
| :--- |
| سؤالی که ممکن است داشته باشید: چرا منطق تکراری تنظیم `description` و `startDateTime` را از هر دو constructor زیرکلاس به constructor پایهٔ واحد منتقل نکردم؟ این نکتهٔ nuanced است، اما قصد من این نیست که `CalendarItem` هرگز مستقیماً نمونه‌سازی شود؛ در اصطلاحات جهت‌یافته به کلاس به آن «abstract class» می‌گوییم. به همین دلیل از `new.target` برای پرتاب خطا اگر کلاس `CalendarItem` هرگز مستقیماً نمونه‌سازی شود استفاده می‌کنم! پس نمی‌خواهم با signature اینطور القا کنم که constructor `CalendarItem(..)` هرگز باید مستقیماً استفاده شود. |

حالا بیایید این سه کلاس را در عمل ببینیم:

```js
var callMyParents = new Reminder(
    "Call my parents to say hi",
    new Date("July 7, 2022 11:00:00 UTC")
);
callMyParents.toString();
// [object Reminder]
callMyParents.summary();
// (586380912) Call my parents to say hi at
// Thu, 07 Jul 2022 11:00:00 GMT
callMyParents.markComplete();
callMyParents.summary();
// (586380912) Complete.
callMyParents instanceof Reminder;
// true
callMyParents instanceof CalendarItem;
// true
callMyParents instanceof Meeting;
// false


var interview = new Meeting(
    "Job Interview: ABC Tech",
    new Date("June 23, 2022 08:30:00 UTC"),
    new Date("June 23, 2022 09:15:00 UTC")
);
interview.toString();
// [object Meeting]
interview.summary();
// (994337604) Job Interview: ABC Tech at Thu,
// 23 Jun 2022 08:30:00 GMT - Thu, 23 Jun 2022
// 09:15:00 GMT
interview instanceof Meeting;
// true
interview instanceof CalendarItem;
// true
interview instanceof Reminder;
// false


Reminder.isSameItem(callMyParents,callMyParents);
// true
Meeting.isSameItem(callMyParents,interview);
// false
```

صادقانه بگویم، برخی بخش‌های این مثال کمی contrived هستند. اما صادقانه فکر می‌کنم تقریباً همهٔ اینها استفاده‌های قابل قبول و منطقی از ویژگی‌های گوناگون `class` هستند.

به هر حال، احتمالاً میلیون‌ها راه مختلف برای ساخت منطق کد بالا وجود دارد. به هیچ وجه ادعا نمی‌کنم این *درست* یا *بهترین* راه است. به‌عنوان تمرین برای خواننده، خودتان امتحان کنید و به چیزهایی که متفاوت از رویکرد من انجام دادید توجه کنید.

[^POLP]: "Principle of Least Privilege", Wikipedia; https://en.wikipedia.org/wiki/Principle_of_least_privilege ; Accessed July 2022
