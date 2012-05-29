var optionManager = (function() {
	var _cache = {},

	get = function(key, cache) {
		var value = '';
		if (typeof cache == 'undefined') {
			cache = true;
		}

		if (cache && typeof _cache[key] != 'undefined') {
			value = _cache[key];
		} else {
			var realKey = 'store.settings.' + key.toLowerCase();
			if (typeof(localStorage[realKey]) !== 'undefined') {
				value = JSON.parse(localStorage[realKey]);
			}

			_cache[key] = value;
		}

		return value;
	},

	set = function(key, value) {
		var realKey = 'store.settings.' + key.toLowerCase();
		var realValue = JSON.stringify(value)
		localStorage[realKey] = realValue;
		_cache[key] = value;
		_updated(key);
	},

	getAll = function() {
		get('BOSH_SERVICE');
		get('CUSTOM_BOSH_SERVICE');
		get('JID');
		get('PASSWORD');
		get('GOOGLE_APPS_ACCOUNT'); 
		get('AUTO_SIGN_IN'); 
		get('ALIGN'); 
		get('DESKTOP_NOTIFICATION'); 
		get('SOUND_NOTIFICATION'); 
		get('SHY'); 
		get('EXCLUDES');
		get('CONNECTION_PREPARED');

		return _cache;
	},

	/**
	 *  写入默认配置
	 */
	setDefault = function() {
		set('BOSH_SERVICE', 'https://ssl.miy.im/http-bind');
		set('CUSTOM_BOSH_SERVICE', '');
		set('JID', '');
		set('PASSWORD', '');
		//set('GOOGLE_APPS_ACCOUNT', false); 
		set('SERVICE', 'google'); 
		
		set('AUTO_SIGN_IN', false); 
		set('ALIGN', 'right'); 
		set('DESKTOP_NOTIFICATION', true); 
		set('SOUND_NOTIFICATION', true); 
		set('SHY', false); 
		set('EXCLUDES', 'http*://*.pdf\nhttp*://mail.google.com/*\nhttp*://plus.google.com/*\nhttp*://www.facebook.com/*\n');
		set('CONNECTION_PREPARED', false);
	},

	setCompatible = function() {
		// 处理 google_apps_account 选项被 service 替代的情况
		if (get('JID')) {
			if (get('GOOGLE_APPS_ACCOUNT') || get('JID').lastIndexOf('gmail.com') == 9) {
				set('SERVICE', 'google');
			} else {
				set('SERVICE', 'other');
			}
		}
	},

	updated = function(key) {
		_updated(key);
	},

	_updated = function(key) {
		boss.report(key, {value: get(key, false)});
	};

	return {
		get: get,
		set: set,
		setDefault: setDefault,
		setCompatible: setCompatible,
		getAll: getAll,
		updated: updated,
		_cache: _cache,
	}
})()
