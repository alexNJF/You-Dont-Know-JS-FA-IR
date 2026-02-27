# طراحی ساده‌تر

علاوه بر اینکه OLOO کدی به‌ظاهر ساده‌تر (و انعطاف‌پذیرتر!) فراهم می‌کند، behavior delegation به‌عنوان یک الگو در واقع می‌تواند به معماری کد ساده‌تر منجر شود. یک مثال نهایی را بررسی می‌کنیم که نشان می‌دهد OLOO طراحی کلی شما را چطور ساده می‌کند.

سناریویی که بررسی می‌کنیم دو object کنترلگر است: یکی برای رسیدگی به فرم login صفحهٔ وب، و دیگری برای رسیدگی واقعی به authentication (ارتباط) با سرور.

یک helper کمکی برای ارتباط Ajax با سرور نیاز داریم. از jQuery استفاده می‌کنیم (هرچند هر فریم‌ورکی کافی است)، چون نه‌تنها Ajax را برایمان انجام می‌دهد، بلکه پاسخی شبیه promise برمی‌گرداند تا بتوانیم با `.then(..)` در کد فراخوان‌مان به پاسخ گوش دهیم.

**یادداشت:** اینجا Promise را پوشش نمی‌دهیم، اما در عنوان آیندهٔ سری *«You Don't Know JS»* پوشش داده می‌شود.

با پیروی از الگوی طراحی class متداول، وظیفه را به عملکرد پایه در classی به نام `Controller` تقسیم می‌کنیم، سپس دو child class یعنی `LoginController` و `AuthController` می‌سازیم که هر دو از `Controller` ارث می‌برند و برخی از آن رفتارهای پایه را تخصصی می‌کنند.

```js
// Parent class
function Controller() {
	this.errors = [];
}
Controller.prototype.showDialog = function(title,msg) {
	// display title & message to user in dialog
};
Controller.prototype.success = function(msg) {
	this.showDialog( "Success", msg );
};
Controller.prototype.failure = function(err) {
	this.errors.push( err );
	this.showDialog( "Error", err );
};
```

```js
// Child class
function LoginController() {
	Controller.call( this );
}
// Link child class to parent
LoginController.prototype = Object.create( Controller.prototype );
LoginController.prototype.getUser = function() {
	return document.getElementById( "login_username" ).value;
};
LoginController.prototype.getPassword = function() {
	return document.getElementById( "login_password" ).value;
};
LoginController.prototype.validateEntry = function(user,pw) {
	user = user || this.getUser();
	pw = pw || this.getPassword();

	if (!(user && pw)) {
		return this.failure( "Please enter a username & password!" );
	}
	else if (pw.length < 5) {
		return this.failure( "Password must be 5+ characters!" );
	}

	// got here? validated!
	return true;
};
// Override to extend base `failure()`
LoginController.prototype.failure = function(err) {
	// "super" call
	Controller.prototype.failure.call( this, "Login invalid: " + err );
};
```

```js
// Child class
function AuthController(login) {
	Controller.call( this );
	// in addition to inheritance, we also need composition
	this.login = login;
}
// Link child class to parent
AuthController.prototype = Object.create( Controller.prototype );
AuthController.prototype.server = function(url,data) {
	return $.ajax( {
		url: url,
		data: data
	} );
};
AuthController.prototype.checkAuth = function() {
	var user = this.login.getUser();
	var pw = this.login.getPassword();

	if (this.login.validateEntry( user, pw )) {
		this.server( "/check-auth",{
			user: user,
			pw: pw
		} )
		.then( this.success.bind( this ) )
		.fail( this.failure.bind( this ) );
	}
};
// Override to extend base `success()`
AuthController.prototype.success = function() {
	// "super" call
	Controller.prototype.success.call( this, "Authenticated!" );
};
// Override to extend base `failure()`
AuthController.prototype.failure = function(err) {
	// "super" call
	Controller.prototype.failure.call( this, "Auth Failed: " + err );
};
```

```js
var auth = new AuthController(
	// in addition to inheritance, we also need composition
	new LoginController()
);
auth.checkAuth();
```

رفتارهای پایه‌ای داریم که همهٔ controllerها مشترک هستند: `success(..)`، `failure(..)` و `showDialog(..)`. child classهای ما `LoginController` و `AuthController` هر دو `failure(..)` و `success(..)` را override می‌کنند تا رفتار پیش‌فرض class پایه را گسترش دهند. همچنین توجه کنید که `AuthController` به یک instance از `LoginController` برای تعامل با فرم login نیاز دارد، پس آن به‌صورت یک member data property می‌شود.

نکتهٔ دیگر این است که کمی *composition* روی inheritance انتخاب کردیم. `AuthController` باید از `LoginController` بداند، پس آن را instantiate می‌کنیم (`new LoginController()`) و یک class member property به نام `this.login` برای ارجاع به آن نگه می‌داریم تا `AuthController` بتواند رفتار را روی `LoginController` فراخوانی کند.

**یادداشت:** *ممکن است* کمی وسوسه شده باشید که `AuthController` از `LoginController` ارث ببرد، یا بالعکس، تا *composition مجازی* از طریق زنجیرهٔ inheritance داشته باشیم. اما این نمونهٔ روشنی از اشکال inheritanceِ class به‌عنوان *الگوی* حوزهٔ مسئله است، چون نه `AuthController` و نه `LoginController` رفتار پایهٔ دیگری را تخصصی نمی‌کنند، پس inheritance بین آن‌ها جز در صورتی که class تنها الگوی طراحی شما باشد معنی چندانی ندارد. در عوض، کمی *composition* اضافه کردیم و اکنون می‌توانند همکاری کنند، در حالی که هر دو از inheritance از parent پایهٔ `Controller` بهره می‌برند.

اگر با طراحی class-oriented (OO) آشنا هستید، همهٔ این باید نسبتاً آشنا و طبیعی به‌نظر برسد.

### De-class-ified

اما **آیا واقعاً لازم است این مسئله** را با یک parent classِ `Controller`، دو child class، **و کمی composition** مدل کنیم؟ آیا راهی هست که از behavior delegation سبک OLOO بهره ببریم و طراحی *به‌مراتب* ساده‌تری داشته باشیم؟ **بله!**

```js
var LoginController = {
	errors: [],
	getUser: function() {
		return document.getElementById( "login_username" ).value;
	},
	getPassword: function() {
		return document.getElementById( "login_password" ).value;
	},
	validateEntry: function(user,pw) {
		user = user || this.getUser();
		pw = pw || this.getPassword();

		if (!(user && pw)) {
			return this.failure( "Please enter a username & password!" );
		}
		else if (pw.length < 5) {
			return this.failure( "Password must be 5+ characters!" );
		}

		// got here? validated!
		return true;
	},
	showDialog: function(title,msg) {
		// display success message to user in dialog
	},
	failure: function(err) {
		this.errors.push( err );
		this.showDialog( "Error", "Login invalid: " + err );
	}
};
```

```js
// Link `AuthController` to delegate to `LoginController`
var AuthController = Object.create( LoginController );

AuthController.errors = [];
AuthController.checkAuth = function() {
	var user = this.getUser();
	var pw = this.getPassword();

	if (this.validateEntry( user, pw )) {
		this.server( "/check-auth",{
			user: user,
			pw: pw
		} )
		.then( this.accepted.bind( this ) )
		.fail( this.rejected.bind( this ) );
	}
};
AuthController.server = function(url,data) {
	return $.ajax( {
		url: url,
		data: data
	} );
};
AuthController.accepted = function() {
	this.showDialog( "Success", "Authenticated!" )
};
AuthController.rejected = function(err) {
	this.failure( "Auth Failed: " + err );
};
```

چون `AuthController` فقط یک object است (`LoginController` هم همین‌طور)، برای انجام وظیفه‌مان نیازی به instantiate (مثل `new AuthController()`) نداریم. تنها کاری که باید بکنیم این است:

```js
AuthController.checkAuth();
```

البته با OLOO، اگر لازم باشد یک یا چند object اضافی در زنجیرهٔ delegation بسازید، ساده است و باز هم به چیزی مثل class instantiation نیاز ندارد:

```js
var controller1 = Object.create( AuthController );
var controller2 = Object.create( AuthController );
```

با behavior delegation، `AuthController` و `LoginController` **فقط object** هستند، هم‌سطح *افقی* یکدیگر، و مثل parent و child در class-orientation مرتب یا مرتبط نیستند. تا حدی دلخواه انتخاب کردیم که `AuthController` به `LoginController` delegate کند — جهت delegation به‌عکس هم به‌همان اندازه معتبر بود.

نکتهٔ اصلی این لیست کد دوم این است که فقط دو موجودیت داریم (`LoginController` و `AuthController`)، **نه سه** مثل قبل.

به یک class پایهٔ `Controller` برای «اشتراک» رفتار بین آن دو نیاز نداشتیم، چون delegation مکانیزمی به‌اندازهٔ کافی قدرتمند است که عملکرد مورد نیازمان را بدهد. همچنین، همان‌طور که قبلاً اشاره شد، برای کار با آن‌ها نیازی به instantiate کردن classهایمان نداریم، چون class وجود ندارد، **فقط خود objectها.** افزون بر این، نیازی به *composition* نیست چون delegation به آن دو object امکان همکاری *تفاضلی* حسب نیاز را می‌دهد.

در پایان، از دام‌های polymorphism طراحی class-oriented با یکسان نگذاشتن نام‌های `success(..)` و `failure(..)` روی هر دو object دوری کردیم، که به explicit pseudopolymorphism زشت نیاز داشت. در عوض روی `AuthController` آن‌ها را `accepted()` و `rejected(..)` نامیدیم — نام‌های کمی توصیفی‌تر برای وظایف خاصشان.

**نتیجه:** همان قابلیت را داریم، اما با طراحی (به‌طور محسوس) ساده‌تر. این قدرت کد سبک OLOO و قدرت الگوی طراحی *behavior delegation* است.
