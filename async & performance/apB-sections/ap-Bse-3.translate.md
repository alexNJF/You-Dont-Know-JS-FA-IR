# Generator Coroutine

امیدوارم فصل ۴ باعث شده باشد با generatorهای ES6 خوب آشنا شده باشید. به‌طور خاص، می‌خواهیم دوباره به بحث «هم‌زمانی generatorها» برگردیم و آن را یک قدم جلوتر ببریم.

ما utilityای به نام `runAll(..)` را تصور کردیم که می‌تواند دو یا چند generator را هم‌زمان اجرا کند، طوری که آن‌ها به‌شکل cooperative کنترل را با `yield` از یکی به دیگری بدهند، و حتی امکان message passing اختیاری هم داشته باشند.

علاوه بر اجرای یک generator تا completion، `ASQ#runner(..)` که در پیوست A دیدیم نیز پیاده‌سازی مشابهی از ایده‌های `runAll(..)` است و می‌تواند چند generator را هم‌زمان تا انتها اجرا کند.

پس بیایید ببینیم چطور می‌توان سناریوی Ajax هم‌زمان فصل ۴ را پیاده کرد:

```js
ASQ(
	"http://some.url.2"
)
.runner(
	function*(token){
		// transfer control
		yield token;

		var url1 = token.messages[0]; // "http://some.url.1"

		// clear out messages to start fresh
		token.messages = [];

		var p1 = request( url1 );

		// transfer control
		yield token;

		token.messages.push( yield p1 );
	},
	function*(token){
		var url2 = token.messages[0]; // "http://some.url.2"

		// message pass and transfer control
		token.messages[0] = "http://some.url.1";
		yield token;

		var p2 = request( url2 );

		// transfer control
		yield token;

		token.messages.push( yield p2 );

		// pass along results to next sequence step
		return token.messages;
	}
)
.val( function(res){
	// `res[0]` comes from "http://some.url.1"
	// `res[1]` comes from "http://some.url.2"
} );
```

تفاوت‌های اصلی بین `ASQ#runner(..)` و `runAll(..)` این‌ها هستند:

* به هر generator (coroutine) آرگومانی به نام `token` داده می‌شود که مقدار ویژه‌ای است برای `yield` کردن وقتی می‌خواهید کنترل را صریحاً به coroutine بعدی منتقل کنید.
* `token.messages` یک آرایه است که پیام‌های منتقل‌شده از مرحله‌ی قبلی sequence را نگه می‌دارد. همچنین می‌توانید از آن برای اشتراک پیام بین coroutineها استفاده کنید.
* `yield` کردن یک مقدار Promise (یا sequence) کنترل را منتقل نمی‌کند، بلکه پردازش coroutine را تا آماده‌شدن آن مقدار متوقف می‌کند.
* آخرین مقداری که از اجرای coroutine `return` یا `yield` شود، به مرحله‌ی بعدی sequence پاس داده می‌شود.

همچنین به‌سادگی می‌توان روی قابلیت پایه‌ی `ASQ#runner(..)` helperهایی ساخت تا برای کاربردهای مختلف مناسب‌تر شوند.

### ماشین‌های حالت

یک مثال آشنا برای خیلی از برنامه‌نویس‌ها، ماشین حالت (state machine) است. با کمک یک utility ساده‌ی تزئینی، می‌توان پردازش state machine را خیلی خوش‌بیان پیاده کرد.

بیایید utilityای با نام `state(..)` را تصور کنیم که دو آرگومان می‌گیرد: مقدار state و generatorی که آن state را مدیریت می‌کند. `state(..)` کارهای پشت‌صحنه را انجام می‌دهد و یک generator سازگارکننده می‌سازد/برمی‌گرداند تا به `ASQ#runner(..)` پاس داده شود.

مثال:

```js
function state(val,handler) {
	// make a coroutine handler for this state
	return function*(token) {
		// state transition handler
		function transition(to) {
			token.messages[0] = to;
		}

		// set initial state (if none set yet)
		if (token.messages.length < 1) {
			token.messages[0] = val;
		}

		// keep going until final state (false) is reached
		while (token.messages[0] !== false) {
			// current state matches this handler?
			if (token.messages[0] === val) {
				// delegate to state handler
				yield *handler( transition );
			}

			// transfer control to another state handler?
			if (token.messages[0] !== false) {
				yield token;
			}
		}
	};
}
```

اگر دقیق نگاه کنید، می‌بینید `state(..)` یک generator برمی‌گرداند که `token` می‌گیرد و بعد یک حلقه‌ی `while` راه می‌اندازد که تا رسیدن state machine به state نهایی (که اینجا قراردادی مقدار `false` را انتخاب کرده‌ایم) اجرا می‌شود؛ این دقیقاً همان نوع generatorی است که می‌خواهیم به `ASQ#runner(..)` بدهیم.

همچنین به‌صورت قراردادی `token.messages[0]` را محل نگه‌داری state فعلی state machine در نظر گرفته‌ایم؛ یعنی حتی می‌توانیم state اولیه را از مقداری که از مرحله‌ی قبلی sequence آمده seed کنیم.

چطور helper `state(..)` را همراه `ASQ#runner(..)` استفاده کنیم؟

```js
var prevState;

ASQ(
	/* optional: initial state value */
	2
)
// run our state machine
// transitions: 2 -> 3 -> 1 -> 3 -> false
.runner(
	// state `1` handler
	state( 1, function *stateOne(transition){
		console.log( "in state 1" );

		prevState = 1;
		yield transition( 3 );	// goto state `3`
	} ),

	// state `2` handler
	state( 2, function *stateTwo(transition){
		console.log( "in state 2" );

		prevState = 2;
		yield transition( 3 );	// goto state `3`
	} ),

	// state `3` handler
	state( 3, function *stateThree(transition){
		console.log( "in state 3" );

		if (prevState === 2) {
			prevState = 3;
			yield transition( 1 ); // goto state `1`
		}
		// all done!
		else {
			yield "That's all folks!";

			prevState = 3;
			yield transition( false ); // terminal state
		}
	} )
)
// state machine complete, so move on
.val( function(msg){
	console.log( msg );	// That's all folks!
} );
```

نکته‌ی مهم این است که خود generatorهای `*stateOne(..)`، `*stateTwo(..)` و `*stateThree(..)` هر بار که وارد آن state می‌شویم دوباره فراخوانی می‌شوند، و وقتی با `transition(..)` به state دیگر می‌روید پایان می‌یابند. هرچند در این مثال نشان داده نشده، طبیعتاً این handlerهای state می‌توانند با `yield` کردن Promise/sequence/thunk به‌صورت async هم pause شوند.

Generatorهای پنهانی‌ای که helper `state(..)` می‌سازد و واقعاً به `ASQ#runner(..)` داده می‌شوند، همان‌هایی هستند که در طول اجرای state machine به‌شکل هم‌زمان به کار ادامه می‌دهند، و هر کدام به‌صورت cooperative کنترل را با `yield` به بعدی می‌سپارند و الی آخر.

**نکته:** برای درک بیشترِ هم‌زمانی cooperative با generatorها که توسط `ASQ#runner(..)` هدایت می‌شود، این مثال «ping pong» را ببینید: http://jsbin.com/qutabu/1/edit?js,output
