# Review

JavaScript برای مقدارهای primitive شیء wrapper فراهم می‌کند که natives نامیده می‌شوند (`String`، `Number`، `Boolean` و غیره). این object wrapperها به مقدارها دسترسی به رفتار مناسب هر subtype شیء می‌دهند (`String#trim()` و `Array#concat(..)`).

اگر مقدار scalar primitive ساده مثل `"abc"` دارید و به property به‌نام `length` یا متدی از `String.prototype` دسترسی می‌جویید، JS به‌طور خودکار مقدار را «box» می‌کند (در wrapper object مربوطه می‌پیچد) تا دسترسی به property/متد برآورده شود.
