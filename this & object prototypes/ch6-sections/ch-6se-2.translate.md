# کلاس‌ها در برابر اشیاء

الان کاوش‌های نظری و mental modelهای «class» در برابر «behavior delegation» را دیدیم. اما حالا سناریوهای کد عینی‌تری را ببینیم که نشان دهد این ایده‌ها را در عمل چطور به‌کار می‌برید.

ابتدا سناریوی متداول در توسعهٔ وب front-end را بررسی می‌کنیم: ساخت UI widgetها (دکمه‌ها، dropdownها و غیره).

### Widget «Classes»

چون احتمالاً هنوز به الگوی طراحی OO عادت دارید، احتمالاً بلافاصله این حوزهٔ مسئله را به‌صورت یک parent class (شاید با نام `Widget`) با همهٔ رفتار پایهٔ مشترک widget، و سپس child derived classها برای انواع خاص widget (مثل `Button`) در نظر می‌گیرید.

**یادداشت:** اینجا از jQuery برای دستکاری DOM و CSS استفاده می‌کنیم، صرفاً چون جزئی است که برای بحث فعلی واقعاً برایمان مهم نیست. هیچ‌کدام از این کد به این که با کدام فریم‌ورک JS (jQuery، Dojo، YUI و غیره)، اگر داشته باشید، چنین کارهای پیش‌پاافتاده را حل می‌کنید وابسته نیست.

ببینیم طراحی «class» را در JS خالص سبک کلاسیک بدون هیچ کتابخانه یا سینتکس کمکی «class» چطور پیاده‌سازی می‌کنیم:

```js
// Parent class
function Widget(width,height) {
	this.width = width || 50;
	this.height = height || 50;
	this.$elem = null;
}

Widget.prototype.render = function($where){
	if (this.$elem) {
		this.$elem.css( {
			width: this.width + "px",
			height: this.height + "px"
		} ).appendTo( $where );
	}
};

// Child class
function Button(width,height,label) {
	// "super" constructor call
	Widget.call( this, width, height );
	this.label = label || "Default";

	this.$elem = $( "<button>" ).text( this.label );
}

// make `Button` "inherit" from `Widget`
Button.prototype = Object.create( Widget.prototype );

// override base "inherited" `render(..)`
Button.prototype.render = function($where) {
	// "super" call
	Widget.prototype.render.call( this, $where );
	this.$elem.click( this.onClick.bind( this ) );
};

Button.prototype.onClick = function(evt) {
	console.log( "Button '" + this.label + "' clicked!" );
};

$( document ).ready( function(){
	var $body = $( document.body );
	var btn1 = new Button( 125, 30, "Hello" );
	var btn2 = new Button( 150, 40, "World" );

	btn1.render( $body );
	btn2.render( $body );
} );
```

الگوهای طراحی OO به ما می‌گویند یک `render(..)` پایه در parent class اعلام کنیم، سپس در child class آن را override کنیم، اما نه اینکه اصلاً جایگزینش کنیم، بلکه عملکرد پایه را با رفتار خاص Button گسترش دهیم.

به زشتی *explicit pseudo-polymorphism* (فصل ۴ را ببینید) با ارجاعات `Widget.call` و `Widget.prototype.render.call` برای جعل فراخوانی‌های «super» از متدهای child «class» به متدهای پایهٔ «parent» class توجه کنید. یوف.

#### ES6 `class` sugar

سینتکس sugarِ ES6 `class` را در پیوست الف به‌تفصیل پوشش می‌دهیم، اما به‌طور خلاصه نشان می‌دهیم همان کد را با `class` چطور پیاده‌سازی می‌کنیم:

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

$( document ).ready( function(){
	var $body = $( document.body );
	var btn1 = new Button( 125, 30, "Hello" );
	var btn2 = new Button( 150, 40, "World" );

	btn1.render( $body );
	btn2.render( $body );
} );
```

بدون تردید، تعدادی از زشتی‌های سینتکس رویکرد کلاسیک قبلی با `class`ِ ES6 صاف شده‌اند. وجود `super(..)` به‌طور خاص نسبتاً خوب به‌نظر می‌رسد (هرچند وقتی عمیق شوید، همه‌چیز گل و بلبل نیست!).

علیرغم بهبودهای سینتکسی، **این‌ها class *واقعی* نیستند**، چون هنوز روی مکانیزم `[[Prototype]]` عمل می‌کنند. از همان عدم‌تطابق‌های mental model که در فصل‌های ۴، ۵ و تا اینجا در این فصل کاوش کردیم رنج می‌برند. پیوست الف سینتکس `class`ِ ES6 و دلالت‌هایش را به‌تفصیل شرح می‌دهد. خواهیم دید چرا حل مشکلات سینتکس به‌طور اساسی سردرگمی class در JS را حل نمی‌کند، هرچند تلاشی شجاعانه در نقش راه‌حل دارد!

چه با سینتکس prototypal کلاسیک و چه با sugar جدید ES6، باز هم *انتخاب* کرده‌اید حوزهٔ مسئله (UI widgetها) را با «class»ها مدل کنید. و همان‌طور که فصل‌های قبلی سعی در نشان دادن داشتند، این *انتخاب* در JavaScript شما را به سردردها و مالیات ذهنی اضافی می‌کشاند.

### Delegating Widget Objects

مثال ساده‌ترِ `Widget` / `Button` ما با **delegation سبک OLOO**:

```js
var Widget = {
	init: function(width,height){
		this.width = width || 50;
		this.height = height || 50;
		this.$elem = null;
	},
	insert: function($where){
		if (this.$elem) {
			this.$elem.css( {
				width: this.width + "px",
				height: this.height + "px"
			} ).appendTo( $where );
		}
	}
};

var Button = Object.create( Widget );

Button.setup = function(width,height,label){
	// delegated call
	this.init( width, height );
	this.label = label || "Default";

	this.$elem = $( "<button>" ).text( this.label );
};
Button.build = function($where) {
	// delegated call
	this.insert( $where );
	this.$elem.click( this.onClick.bind( this ) );
};
Button.onClick = function(evt) {
	console.log( "Button '" + this.label + "' clicked!" );
};

$( document ).ready( function(){
	var $body = $( document.body );

	var btn1 = Object.create( Button );
	btn1.setup( 125, 30, "Hello" );

	var btn2 = Object.create( Button );
	btn2.setup( 150, 40, "World" );

	btn1.build( $body );
	btn2.build( $body );
} );
```

با این رویکرد سبک OLOO، `Widget` را parent و `Button` را child در نظر نمی‌گیریم. بلکه `Widget` **صرفاً یک object** است و نوعی مجموعهٔ کمکی است که هر نوع خاص widget ممکن است بخواهد به آن delegate کند، و `Button` **هم فقط یک object مستقل** است (با یک link delegation به `Widget`، البته!).

از منظر الگوی طراحی، نام متد یکسان `render(..)` را در هر دو object به‌صورتی که classها پیشنهاد می‌کنند *اشتراک نگذاشتیم*، بلکه نام‌های متفاوت (`insert(..)` و `build(..)`) انتخاب کردیم که توصیفی‌تر از کاری بودند که هر کدام به‌طور خاص انجام می‌دهند. متدهای *initialization* به‌ترتیب `init(..)` و `setup(..)` نامیده شده‌اند، به‌همین دلایل.

نه‌تنها این الگوی طراحی delegation نام‌های متفاوت و توصیفی‌تر (به‌جای نام‌های مشترک و کلی‌تر) پیشنهاد می‌کند، بلکه انجام این کار با OLOO اتفاقاً از زشتی فراخوانی‌های explicit pseudo-polymorphic (`Widget.call` و `Widget.prototype.render.call`) دوری می‌کند، همان‌طور که از فراخوانی‌های ساده، نسبی و delegated به `this.init(..)` و `this.insert(..)` می‌بینید.

از نظر سینتکس، constructor، `.prototype` یا `new` هم نداریم، چون در واقع فقط آشغال غیرضروری هستند.

حالا اگر دقیق توجه کنید، ممکن است متوجه شوید که آنچه قبلاً فقط یک فراخوانی بود (`var btn1 = new Button(..)`) اکنون دو فراخوانی است (`var btn1 = Object.create(Button)` و `btn1.setup(..)`). در ابتدا ممکن است نقطهٔ ضعف به‌نظر برسد (کد بیشتر).

با این حال، حتی این هم **نکتهٔ مثبت کد سبک OLOO** در مقایسه با کد سبک prototype کلاسیک است. چطور؟

با class constructorها، «مجبور» (واقعاً نه، اما شدیداً پیشنهاد شده) هستید construction و initialization را در همان مرحله انجام دهید. با این حال، موارد زیادی هست که بتوانید این دو مرحله را جداگانه انجام دهید (همان‌طور که با OLOO می‌کنید!) انعطاف‌پذیرتر است.

مثلاً فرض کنید همهٔ instanceهای خود را در ابتدای برنامه در یک pool می‌سازید، اما initialization با setup خاص را تا وقتی از pool بیرون کشیده و استفاده شوند به تأخیر می‌اندازید. دو فراخوانی را درست کنار هم نشان دادیم، اما البته می‌توانند در زمان‌ها و بخش‌های بسیار متفاوتی از کدمان رخ دهند، حسب نیاز.

**OLOO** اصل separation of concerns را *بهتر* پشتیبانی می‌کند، جایی که creation و initialization لزوماً در یک عملیات یکی نمی‌شوند.
