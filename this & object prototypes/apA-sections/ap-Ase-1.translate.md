# `class`

اما *نیازی* نیست آن بحث را دوباره پیش بکشیم. آن مسائل را فقط briefly دوباره mention می‌کنم تا الان که توجهمان را به مکانیزم `class` مربوط به ES6 معطوف می‌کنیم در ذهنتان تازه بمانند. اینجا نحوهٔ کارش را نشان می‌دهیم و می‌بینیم آیا `class` کار اساسی برای رسیدگی به هیچ‌کدام از آن نگرانی‌های «class» می‌کند یا نه.

بیایید مثال `Widget` / `Button` را از فصل ۶ مرور کنیم:

```js
class Widget {
	constructor(width,height) {
		this.width = width || 50;
		this.height = height || 50;
		this.$elem = null;
	}
	render($where){
		if (this.$elem) {
			this.$elem.css( {
				width: this.width + "px",
				height: this.height + "px"
			} ).appendTo( $where );
		}
	}
}

class Button extends Widget {
	constructor(width,height,label) {
		super( width, height );
		this.label = label || "Default";
		this.$elem = $( "<button>" ).text( this.label );
	}
	render($where) {
		super.render( $where );
		this.$elem.click( this.onClick.bind( this ) );
	}
	onClick(evt) {
		console.log( "Button '" + this.label + "' clicked!" );
	}
}
```

ورای این که این نحو *خوب* به نظر برسد، ES6 چه مشکلاتی را حل می‌کند؟

1. دیگر (خوب، تا حدی، پایین را ببینید!) ارجاعی به `.prototype` که کد را شلوغ می‌کند نیست.
2. `Button` مستقیماً برای «inherit کردن از» (یعنی `extends`) `Widget` اعلام شده، به‌جای نیاز به استفاده از `Object.create(..)` برای جایگزینی object مربوط به `.prototype` که لینک شده، یا تنظیم با `.__proto__` یا `Object.setPrototypeOf(..)`.
3. `super(..)` الان قابلیت **relative polymorphism** خیلی مفیدی به ما می‌دهد، تا هر متدی در یک سطح زنجیره بتواند نسبتاً یک سطح بالاتر زنجیره به متد هم‌نام ارجاع دهد. این شامل راه‌حلی برای یادداشت فصل ۴ دربارهٔ عجیبی constructorهایی که به classشان تعلق ندارند و بنابراین نامرتبط‌اند می‌شود — `super()` داخل constructorها دقیقاً آن‌طور که انتظار دارید کار می‌کند.
4. نحو literal مربوط به `class` امکانی برای مشخص کردن propertyها (فقط متدها) ندارد. ممکن است به بعضی محدودکننده به نظر برسد، اما انتظار می‌رود در اکثریت قریب به اتفاق مواردی که property (state) جای دیگری وجود دارد اما «instance»های انتهای زنجیره، این معمولاً اشتباه و غافل‌گیرکننده است (چون stateای است که به‌طور ضمنی بین همهٔ «instance»ها «مشترک» است). پس *می‌توان* گفت نحو `class` شما را از اشتباهات محافظت می‌کند.
5. `extends` به شما اجازه می‌دهد حتی (زیر)نوع‌های object داخلی مثل `Array` یا `RegExp` را به‌طور طبیعی extend کنید. انجام این کار بدون `class .. extends` مدتها کار بسیار پیچیده و ناامیدکننده بوده که فقط ماهرترین نویسندگان framework تاکنون به‌درستی انجام داده‌اند. الان نسبتاً trivial خواهد بود!

به انصاف، آن‌ها راه‌حل‌های اساسی برای بسیاری از (نحوی) واضح‌ترین مسائل و غافل‌گیری‌هایی هستند که مردم با کد به سبک prototype کلاسیک دارند.
