var followerManager = (function() {

	var _followers = {},
	_excludedUrls = '',
	_excludedWindows = [],
	_lastActiveId = 0,

	init = function() {
		_listen();
	},

	_listen = function() {
		// 载入页面时注册
		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
			if (changeInfo.status === 'loading') {
				register(tab);
			}
		});
		chrome.tabs.onSelectionChanged.addListener(_setSelected);
		chrome.windows.onFocusChanged.addListener(function(windowId) {
			if (windowId !== chrome.windows.WINDOW_ID_NONE) {
				chrome.tabs.getSelected(windowId, function(tab) {
					if (tab) {
						_setSelected(tab.id);
					}
				})
			}
		});
		chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
			_followers[tabId].window = attachInfo.newWindowId;
		});
		// 关闭标签时，将其从enabledFollower中移除
		chrome.tabs.onRemoved.addListener(function(tabId) {
			unregister(tabId);
			//delete _ports[tabId];
		});

		// 在popup类型窗口中禁用
		chrome.windows.onCreated.addListener(function(window) {
			if (window.type == 'popup') {
				// 把该窗口id列入禁用
				_excludedWindows.push(window.id);
			}
		});
		chrome.windows.onRemoved.addListener(function(windowId) {
			delete _excludedWindows[windowId];
		});

		/*
		// 监听 excludes 选项变更
		optionManager.subscribe('EXCLUDES', function() {
			if (key == 'EXCLUDES') {
				var urls = optionManager.get('EXCLUDES').split('\n');
				// 这些页面始终排除
				urls.push('http*://chrome.google.com/webstore*','chrome-*', 'chrome://extensions/*');
				for (index in urls) {
					urls[index] = $.convert2RegExp(urls[index]);
				}
				excludedUrls = urls;
			}
		});
		*/
	},

	_setSelected = function(tabId) {
		for (i in _followers) {
			_followers[i].selected = false;
		}
		if (_followers[tabId]) {
			_followers[tabId].selected = true;
		}
	},

	/**
	 * 注册标签
	 */
	register = function(tab) {
		if (tab.id) {
			var tabId = tab.id;
			var url = tab.url;
			var enabled = ! isExcluded(tab);

			if (_followers[tabId]) {
				_followers[tabId].url = url;
				_followers[tabId].enabled &= enabled;
				_followers[tabId].selected = tab.selected;
				_followers[tabId].window = tab.windowId;
			} else {
				_followers[tabId] = {
					url: url,
					enabled: enabled,
					selected: tab.selected,
					window: tab.windowId
				};
			}
		}
	},

	/**
	 * 取消注册标签
	 */
	unregister = function(followerId) {
		delete _followers[followerId];
	},

	/**
	 * 
	 */
	hasRegistered = function(tabId) {
		return !! _followers[tabId];
	},

	/**
	 * 更新最后激活的follower
	 */
	updateLastActiveFollower = function(followerId) {
		var follower = _followers[followerId];
		if (follower && follower.enabled) {
			_lastActiveId = followerId;
		}
	},

	getLastActiveFollower = function() {
		if (_followers[_lastActiveId]) {
			var last = _followers[_lastActiveId];
			last.id = _lastActiveId;
			return last;
		} else {
			return null;
		}
	},

	get = function(tabId) {
		if (tabId) {
			if (_followers[tabId]) {
				return _followers[tabId];
			} else {
				return null;
			}
		} else {
			return _followers;
		}
	},

	/**
	 * 启用/禁用某标签上的
	 */
	toggle = function(tabId, enabled) {
		enabled = !! enabled;
		if (_followers[tabId]) {
			_followers[tabId].enabled = enabled;
		}
	},

	/**
	 * 判断某一标签下是否启用了
	 */
	isEnabled = function(tabId, tab) {
		if (_followers[tabId]) {
			return _followers[tabId].enabled;
		} else {
			if (tab) {
				if (isExcluded(tab)) {
					_followers[tabId] = {
						enabled: false,
						url: tab.url,
						window: tab.windowId
					};
				} else {
					_followers[tabId] = {
						enabled: true,
						url: tab.url,
						window: tab.windowId
					};
				}
			}
			return false;
		}
	},

	/**
	 * 判断某一标签是否应该被排除
	 */
	isExcluded = function(tab) {
		var result = false;
		if (_excludedWindows.indexOf(tab.windowId) > - 1) {
			result = true;
		} else {
			var url = tab.url;
			// 从选项初始化
			// TODO 每次刷页面都执行？性能？
			//if (typeof _excludedUrls != 'object') {
				var urls = optionManager.get('EXCLUDES').split('\n');
				// 这些页面始终排除
				urls.push('http*://chrome.google.com/webstore*','chrome-*', 'chrome://extensions/*');
				for (index in urls) {
					urls[index] = $.convert2RegExp(urls[index]);
				}
				_excludedUrls = urls;
			//}

			for (index in _excludedUrls) {
				if (url && url.match(_excludedUrls[index])) {
					result = true;
					break;
				}
			}
		}
		return result;
	},

	/**
	 * 标签是否被选中
	 */
	isSelected = function(tabId) {
		if (_followers[tabId] && _followers[tabId].selected) {
			return true;
		} else {
			return false;
		}
	};

	init();

	return {
		register: register,
		unregister: unregister,
		hasRegistered: hasRegistered,
		updateLastActiveFollower: updateLastActiveFollower,
		getLastActiveFollower: getLastActiveFollower,
		get: get,
		toggle: toggle,
		isEnabled: isEnabled,
		isExcluded: isExcluded,
		isSelected: isSelected,
		_setSelected: _setSelected
	};

})();
